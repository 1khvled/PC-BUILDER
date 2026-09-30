import { NextResponse, type NextRequest } from "next/server";

// In-memory sliding-window token store for Edge/Node middleware
// In a serverless/edge context, this holds recent request timestamps per IP.
interface RateBucket {
  count: number;
  resetAt: number;
}

const ipBuckets = new Map<string, RateBucket>();

// Clean up stale buckets every 5 minutes to prevent memory leak
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupStaleBuckets() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL_MS) return;
  lastCleanup = now;
  ipBuckets.forEach((bucket, ip) => {
    if (now > bucket.resetAt) {
      ipBuckets.delete(ip);
    }
  });
}

// Blocked malicious bot & vulnerability scanner signatures
const BLOCKED_USER_AGENTS = [
  /sqlmap/i,
  /nikto/i,
  /masscan/i,
  /wprecon/i,
  /zgrab/i,
  /acunetix/i,
  /dirbuster/i,
  /nmap/i,
  /havij/i,
  /gobuster/i,
  /censys/i,
  /petalbot/i,
];

// Blocked path traversal / probe patterns
const SUSPICIOUS_PATHS = [
  /\.\./,
  /\.env/,
  /\.git/,
  /\.aws/,
  /wp-admin/i,
  /wp-login/i,
  /xmlrpc\.php/i,
  /phpinfo/i,
  /\.php$/i,
  /\/etc\/passwd/i,
  /\/bin\/sh/i,
];

function getClientIp(req: Request): string {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0].trim();
  }
  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) return xRealIp.trim();
  const cfConnectingIp = req.headers.get("cf-connecting-ip");
  if (cfConnectingIp) return cfConnectingIp.trim();
  return "127.0.0.1";
}

function checkRateLimit(ip: string, limit: number, windowSec: number): { allowed: boolean; remaining: number; reset: number } {
  cleanupStaleBuckets();
  const now = Date.now();
  const windowMs = windowSec * 1000;
  const bucketKey = `${ip}:${Math.floor(now / windowMs)}`;
  const resetTime = Math.ceil(now / windowMs) * windowSec;

  const current = ipBuckets.get(bucketKey);
  if (!current) {
    ipBuckets.set(bucketKey, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: limit - 1, reset: resetTime };
  }

  if (current.count >= limit) {
    return { allowed: false, remaining: 0, reset: resetTime };
  }

  current.count += 1;
  return { allowed: true, remaining: limit - current.count, reset: resetTime };
}

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  const userAgent = req.headers.get("user-agent") || "";
  const ip = getClientIp(req);

  // 1. Block malicious vulnerability scanners & exploit bots
  for (const pattern of BLOCKED_USER_AGENTS) {
    if (pattern.test(userAgent)) {
      return new NextResponse(
        JSON.stringify({ error: "Access Denied: Malicious user agent signature detected." }),
        { status: 403, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 2. Block path traversal and probe attacks
  for (const pattern of SUSPICIOUS_PATHS) {
    if (pattern.test(pathname) || pattern.test(search)) {
      return new NextResponse(
        JSON.stringify({ error: "Access Denied: Invalid request pattern." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }
  }

  // 3. Rate limiting tiers
  // - API write/resolve endpoints: 25 requests / 60 seconds
  // - API read endpoints: 80 requests / 60 seconds
  // - General pages: 200 requests / 60 seconds
  let limit = 200;
  let windowSec = 60;

  const isApi = pathname.startsWith("/api/");
  const isApiWrite = isApi && (req.method === "POST" || req.method === "PUT" || req.method === "DELETE" || pathname.includes("/fb-resolve"));

  if (isApiWrite) {
    limit = 25;
  } else if (isApi) {
    limit = 80;
  }

  const { allowed, remaining, reset } = checkRateLimit(ip, limit, windowSec);

  if (!allowed) {
    return new NextResponse(
      JSON.stringify({
        error: "Trop de requêtes. Veuillez patienter un instant.",
        retryAfter: reset - Math.floor(Date.now() / 1000),
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Retry-After": String(Math.max(1, reset - Math.floor(Date.now() / 1000))),
          "X-RateLimit-Limit": String(limit),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": String(reset),
        },
      }
    );
  }

  // 4. Cron endpoint authorization guard
  if (pathname.startsWith("/api/cron/")) {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const auth = req.headers.get("authorization");
      if (auth !== `Bearer ${cronSecret}`) {
        return new NextResponse(JSON.stringify({ error: "Unauthorized cron execution" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }
  }

  // 5. Proceed with request and inject military-grade security headers
  const res = NextResponse.next();

  // Rate limit tracking headers
  res.headers.set("X-RateLimit-Limit", String(limit));
  res.headers.set("X-RateLimit-Remaining", String(remaining));
  res.headers.set("X-RateLimit-Reset", String(reset));

  // Security Headers
  res.headers.set("X-Frame-Options", "SAMEORIGIN");
  res.headers.set("X-Content-Type-Options", "nosniff");
  res.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  res.headers.set("X-XSS-Protection", "1; mode=block");
  res.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(), browsing-topics=()");
  res.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // Modern Content-Security-Policy (allows safe scripts, Google fonts, retailer images)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://va.vercel-scripts.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https:",
    "connect-src 'self' https://sculmoqvdfcohnvtsrsb.supabase.co https://api.ouedkniss.com https://* wss://*",
    "frame-ancestors 'self'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join("; ");

  res.headers.set("Content-Security-Policy", cspHeader);

  return res;
}

export const config = {
  // Match all request paths except static files, _next, favicon, and brand images
  matcher: [
    "/((?!_next/static|_next/image|brand/|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
