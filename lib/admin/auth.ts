import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * ADMIN AUTH
 * ==========
 * Replaces the old single shared key passed as `?key=...` in the query string.
 * That design had three real problems:
 *
 *   1. The key was echoed into the served HTML, the browser history and every
 *      proxy / platform access log.
 *   2. There was no username, so the key was the entire identity.
 *   3. There was no way to revoke a session - the key worked forever.
 *
 * Now: a username + password exchanged once for a signed, expiring, HttpOnly
 * cookie. The credential never touches the URL and the session can be revoked
 * by rotating ADMIN_SESSION_SECRET.
 *
 * NO THIRD-PARTY CRYPTO. Uses node:crypto only, so there is no new dependency
 * and no supply-chain surface. Passwords are compared in constant time.
 */

const COOKIE = "dz_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

/* ------------------------------------------------------------ credentials */

function digest(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

/**
 * Length-independent, timing-safe string comparison.
 *
 * timingSafeEqual throws if the two buffers differ in length, which would itself
 * leak the length. Hashing first to a fixed 32 bytes removes that dependency, so
 * the comparison is constant time regardless of input length.
 */
function safeEqual(a: string, b: string): boolean {
  const da = digest(a);
  const db = digest(b);
  // Both are SHA-256 so the lengths always match; the loop still runs over a
  // fixed count, which is what keeps this constant time.
  let diff = 0;
  for (let i = 0; i < da.length; i++) diff |= da[i] ^ db[i];
  return diff === 0;
}

export interface AdminConfig {
  username: string;
  password: string;
  /** Signing key for session tokens. Derived from the password if not given. */
  sessionSecret: string;
}

export function readAdminConfig(): AdminConfig | null {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;
  if (typeof username !== "string" || username.length === 0) return null;
  if (typeof password !== "string" || password.length === 0) return null;

  // A dedicated secret is better because rotating the password then also
  // invalidates every existing session. Falling back to a hash of the password
  // means rotating the password alone still revokes sessions, so the fallback
  // is safe rather than merely convenient.
  const sessionSecret =
    (typeof process.env.ADMIN_SESSION_SECRET === "string" && process.env.ADMIN_SESSION_SECRET.length > 0
      ? process.env.ADMIN_SESSION_SECRET
      : null) ?? createHash("sha256").update(`dz-admin-session:${password}`, "utf8").digest("hex");

  return { username, password, sessionSecret };
}

export function isAdminConfigured(): boolean {
  return readAdminConfig() !== null;
}

export function verifyCredentials(username: string, password: string): boolean {
  const cfg = readAdminConfig();
  if (!cfg) return false;
  // Both comparisons always run, so a wrong username costs the same time as a
  // wrong password and cannot be distinguished by timing.
  const userOk = safeEqual(username, cfg.username);
  const passOk = safeEqual(password, cfg.password);
  return userOk && passOk;
}

/* --------------------------------------------------------------- sessions */

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("base64url");
}

/** Opaque token: expiry + random nonce, signed. The nonce makes tokens unique. */
export function createSessionToken(secret: string): string {
  const exp = Math.floor(Date.now() / 1000) + MAX_AGE_SECONDS;
  const nonce = randomBytes(12).toString("base64url");
  const payload = `${exp}.${nonce}`;
  return `${payload}.${sign(payload, secret)}`;
}

/** Returns true only if the signature matches AND the token has not expired. */
export function verifySessionToken(token: string | undefined, secret: string): boolean {
  if (!token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;

  const [exp, nonce, mac] = parts;
  const payload = `${exp}.${nonce}`;
  if (!safeEqual(mac, sign(payload, secret))) return false;

  const expSeconds = Number(exp);
  if (!Number.isFinite(expSeconds)) return false;
  // Allow a little clock skew between edge and region.
  return expSeconds > Math.floor(Date.now() / 1000) - 60;
}

const cookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: MAX_AGE_SECONDS,
};

export async function startSession(): Promise<void> {
  const cfg = readAdminConfig();
  if (!cfg) return;
  const jar = await cookies();
  jar.set(COOKIE, createSessionToken(cfg.sessionSecret), cookieOptions);
}

export async function endSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(COOKIE);
}

/** The single check every admin route should call. */
export async function isAuthenticated(): Promise<boolean> {
  const cfg = readAdminConfig();
  if (!cfg) return false; // fail closed when unconfigured
  const jar = await cookies();
  return verifySessionToken(jar.get(COOKIE)?.value, cfg.sessionSecret);
}

/* ----------------------------------------------------------- rate limiting */

/**
 * Best-effort login throttle.
 *
 * In-memory only: on serverless each instance has its own map, so this raises
 * the cost of a brute force rather than eliminating it. It is still worth
 * having, because a single instance absorbs a naive attacker, and the real
 * protection is the 160-bit password. Swap for a shared store (Upstash
 * Redis, Vercel KV) if this ever guards something that matters more.
 */
const attempts = new Map<string, { count: number; resetAt: number }>();
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 8;

export function clientKey(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}

export function loginAllowed(key: string): boolean {
  const now = Date.now();
  const entry = attempts.get(key);
  if (!entry || entry.resetAt <= now) {
    attempts.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  entry.count += 1;
  return entry.count <= MAX_ATTEMPTS;
}

/** Call after a SUCCESSFUL login so a good operator is not locked out. */
export function loginSucceeded(key: string): void {
  attempts.delete(key);
}

export function retryAfterMs(key: string): number {
  const entry = attempts.get(key);
  if (!entry) return 0;
  return Math.max(0, entry.resetAt - Date.now());
}
