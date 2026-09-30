import type { Product } from "@/lib/data/products";

/**
 * SAFE SPEC READERS.
 *
 * `Product.specs` is `Record<string, unknown>` and the catalogue is assembled
 * from 180+ scraped shops, so a field can be absent, null, a string where a
 * number belongs, or (worst case) a plausible-looking wrong value. Every
 * compatibility rule in this folder reads facts through these helpers and gets
 * `null` - never `undefined`, never `NaN`, never `0` - when the data does not
 * support an assertion.
 *
 * The rule that matters: a check that fires on missing data is worse than no
 * check at all, because it teaches people to ignore the card. Null means "we
 * do not know", and every rule treats null as "say nothing".
 */

/** Any product or undefined. Rules are written against the partial build. */
export type MaybeProduct = Product | undefined | null;

function specsOf(p: MaybeProduct): Record<string, unknown> | null {
  if (!p) return null;
  const s = p.specs;
  if (!s || typeof s !== "object" || Array.isArray(s)) return null;
  return s as Record<string, unknown>;
}

/**
 * Finite number from a spec value. Numeric strings are accepted because the
 * scraped catalogue stores dimensions and wattages as text often enough that
 * rejecting them would silently disable half the rules.
 */
export function readNum(specs: Record<string, unknown> | null | undefined, key: string): number | null {
  if (!specs) return null;
  const v = specs[key];
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string") {
    const t = v.trim().replace(",", ".");
    if (!t) return null;
    const n = Number(t);
    return Number.isFinite(n) ? n : null;
  }
  return null;
}

/** Same as `readNum` but rejects values below `min` (and, if given, above `max`). */
export function readNumIn(
  specs: Record<string, unknown> | null | undefined,
  key: string,
  min: number,
  max = Number.POSITIVE_INFINITY,
): number | null {
  const n = readNum(specs, key);
  if (n == null || n < min || n > max) return null;
  return n;
}

/** Non-empty, trimmed string. */
export function readStr(specs: Record<string, unknown> | null | undefined, key: string): string | null {
  if (!specs) return null;
  const v = specs[key];
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t.length ? t : null;
}

export function readBool(specs: Record<string, unknown> | null | undefined, key: string): boolean | null {
  if (!specs) return null;
  const v = specs[key];
  if (typeof v === "boolean") return v;
  if (v === "true" || v === 1 || v === "1") return true;
  if (v === "false" || v === 0 || v === "0") return false;
  return null;
}

/** Array of non-empty strings. Returns null when the field is not a list. */
export function readStrList(specs: Record<string, unknown> | null | undefined, key: string): string[] | null {
  if (!specs) return null;
  const v = specs[key];
  if (!Array.isArray(v)) return null;
  const out = v.filter((x): x is string => typeof x === "string" && x.trim().length > 0).map((x) => x.trim());
  return out.length ? out : null;
}

/* ------------------------------------------------ per-category conveniences */

export const num = (p: MaybeProduct, key: string): number | null => readNum(specsOf(p), key);
export const numIn = (p: MaybeProduct, key: string, min: number, max?: number): number | null =>
  readNumIn(specsOf(p), key, min, max);
export const str = (p: MaybeProduct, key: string): string | null => readStr(specsOf(p), key);
export const list = (p: MaybeProduct, key: string): string[] | null => readStrList(specsOf(p), key);
export const bool = (p: MaybeProduct, key: string): boolean | null => readBool(specsOf(p), key);

/** Physical length in mm, only when the value is plausible for a part. */
export const mm = (p: MaybeProduct, key: string): number | null => readNumIn(specsOf(p), key, 1, 1000);

/** Wattage/TDP, only when plausible (0 W and 5000 W are both data errors). */
export const watts = (p: MaybeProduct, key: string): number | null => readNumIn(specsOf(p), key, 1, 5000);

/** Capacity in GB, only when plausible. */
export const gb = (p: MaybeProduct, key: string): number | null => readNumIn(specsOf(p), key, 0, 1024);

/** Transfer speed in MT/s. */
export const mt = (p: MaybeProduct, key: string): number | null => readNumIn(specsOf(p), key, 100, 20000);
