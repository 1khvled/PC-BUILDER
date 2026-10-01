/**
 * One computation pass for the whole console.
 *
 * The old page built its figures inline, in JSX, at request time. Three things
 * were wrong with that beyond the tidiness:
 *
 * 1. `PRODUCTS.find(...)` ran inside loops over OFFERS, three separate times.
 *    That is 438 x 3,558 = 1.6M comparisons per request, and it grows with the
 *    square of the catalogue. A Map lookup is the same answer in O(1).
 *
 * 2. `Math.min(...prices)` spreads an array onto the call stack. It is fine at
 *    3,558 offers and throws RangeError somewhere past ~125,000. This site adds
 *    hundreds of offers a day, so that was a scheduled outage rather than a bug.
 *    A single reduce has no such limit.
 *
 * 3. Everything was serialised into one page: 438 product rows plus 3,558 offer
 *    rows, ~4,000 DOM nodes, with no navigation. The console now fetches once
 *    and hands each panel only what it needs.
 */

import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { LIVE_EXTRA } from "@/lib/data/live";
import { CATEGORIES, type Category, type Offer, type Product } from "@/lib/data/products";
import { STORE_CATS, STORE_NAMES, STORE_WILAYA } from "@/lib/scrapers/stores";
import { selfCheck } from "@/lib/algo/optimizer";
import { isDbConfigured } from "@/lib/supabase";
import fs from "fs";
import path from "path";

export interface AdminProductStats {
  id: string;
  brand: string;
  model: string;
  category: Category;
  /** Number of matched live offers. 0 means this product is invisible to buyers. */
  count: number;
  min: number;
  avg: number;
  max: number;
  spread: number;
  spreadPct: number;
  cheapest: { store: string; wilaya: string; priceDa: number } | null;
}

export interface AdminCoverageRow {
  store: string;
  wilaya: string;
  tracked: string[];
  /** category -> matched offer count. */
  counts: Record<string, number>;
  total: number;
}

export interface AdminOfferRow {
  id: string;
  productId: string;
  title: string;
  store: string;
  wilaya: string;
  priceDa: number;
  condition: "new" | "used";
  stock: string;
  category: string;
  /** null when the offer points at a product id we do not have. */
  matched: boolean;
}

export interface AdminData {
  scrapedAt: string;
  dbLive: boolean;
  tables: string[];
  products: Product[];
  totals: {
    offers: number;
    products: number;
    stores: number;
    newCount: number;
    usedCount: number;
    unmatched: number;
    /** Products with a catalogue entry but zero live offers. */
    orphanedProducts: number;
    unmatchedQueue: number;
  };
  price: {
    byCategory: { category: string; offers: number; median: number; min: number; max: number }[];
    /** Cheapest-per-dinar outliers: high spread relative to the median. */
    outliers: { id: string; label: string; spreadPct: number; count: number }[];
  };
  productStats: AdminProductStats[];
  coverage: AdminCoverageRow[];
  offers: AdminOfferRow[];
  checks: { name: string; ok: boolean; detail: string }[];
  checkPass: boolean;
}

/** Median without sorting the whole array. */
function median(values: number[]): number {
  if (values.length === 0) return 0;
  const s = [...values].sort((a, b) => a - b);
  const mid = s.length >> 1;
  return s.length % 2 ? s[mid] : Math.round((s[mid - 1] + s[mid]) / 2);
}

function schemaTables(): string[] {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), "supabase", "schema.sql"), "utf8");
    return (sql.match(/create table if not exists (\w+)/g) || []).map((s) => s.split(" ").pop() as string);
  } catch {
    return [];
  }
}

export async function buildAdminData(): Promise<AdminData> {
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);

  // O(1) lookups instead of Array.find inside loops.
  const productById = new Map<string, Product>(products.map((p) => [p.id, p]));

  /* ------------------------------------------------ per-product price stats */
  const pricesByProduct = new Map<string, number[]>();
  for (const o of offers) {
    const list = pricesByProduct.get(o.productId);
    if (list) list.push(o.priceDa);
    else pricesByProduct.set(o.productId, [o.priceDa]);
  }

  const cheapestByProduct = new Map<string, Offer>();
  for (const o of offers) {
    const cur = cheapestByProduct.get(o.productId);
    if (!cur || o.priceDa < cur.priceDa) cheapestByProduct.set(o.productId, o);
  }

  const productStats: AdminProductStats[] = products.map((p) => {
    const prices = pricesByProduct.get(p.id) ?? [];
    if (prices.length === 0) {
      return {
        id: p.id,
        brand: p.brand,
        model: p.model,
        category: p.category,
        count: 0,
        min: 0,
        avg: 0,
        max: 0,
        spread: 0,
        spreadPct: 0,
        cheapest: null,
      };
    }
    // reduce, not Math.min(...prices): see the header note.
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    for (const v of prices) {
      if (v < min) min = v;
      if (v > max) max = v;
      sum += v;
    }
    const spread = max - min;
    const best = cheapestByProduct.get(p.id);
    return {
      id: p.id,
      brand: p.brand,
      model: p.model,
      category: p.category,
      count: prices.length,
      min,
      avg: Math.round(sum / prices.length),
      max,
      spread,
      spreadPct: min > 0 ? Math.round((spread / min) * 100) : 0,
      cheapest: best ? { store: best.store, wilaya: best.wilaya, priceDa: best.priceDa } : null,
    };
  });
  // Most-contested first: that is where a price error does damage.
  productStats.sort((a, b) => b.count - a.count || a.id.localeCompare(b.id));

  /* -------------------------------------------------------- category prices */
  const pricesByCategory = new Map<string, number[]>();
  let newCount = 0;
  let unmatched = 0;
  for (const o of offers) {
    const p = productById.get(o.productId);
    if (!p) {
      unmatched++;
      continue;
    }
    if (o.condition === "new") newCount++;
    const list = pricesByCategory.get(p.category);
    if (list) list.push(o.priceDa);
    else pricesByCategory.set(p.category, [o.priceDa]);
  }

  const byCategory = CATEGORIES.filter((c) => pricesByCategory.has(c.slug)).map((c) => {
    const values = pricesByCategory.get(c.slug)!;
    let min = Infinity;
    let max = -Infinity;
    for (const v of values) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
    return { category: c.slug, offers: values.length, median: median(values), min, max };
  });

  /* ------------------------------------------------------------- outliers */
  // A large spread on a component that should be near-identical across sellers
  // is either a price error or a matcher bug, and it is the single most useful
  // thing on this screen that nobody was looking at before.
  const outliers = productStats
    .filter((s) => s.count >= 3 && s.spreadPct >= 150)
    .sort((a, b) => b.spreadPct - a.spreadPct)
    .slice(0, 12)
    .map((s) => ({
      id: s.id,
      label: `${s.brand} ${s.model}`,
      spreadPct: s.spreadPct,
      count: s.count,
    }));

  /* ------------------------------------------------------------- coverage */
  const coverage: AdminCoverageRow[] = STORE_NAMES.map((store) => {
    const counts: Record<string, number> = {};
    let total = 0;
    for (const o of offers) {
      const p = productById.get(o.productId);
      if (!p || o.store !== store) continue;
      counts[p.category] = (counts[p.category] ?? 0) + 1;
      total++;
    }
    return { store, wilaya: STORE_WILAYA(store), tracked: STORE_CATS(store), counts, total };
  });
  coverage.sort((a, b) => b.total - a.total);

  /* --------------------------------------------------------------- offers */
  const offers2: AdminOfferRow[] = offers.map((o) => ({
    id: `${o.productId}:${o.store}:${o.wilaya}:${o.url}`,
    productId: o.productId,
    title: o.titleRaw,
    store: o.store,
    wilaya: o.wilaya,
    priceDa: o.priceDa,
    condition: o.condition,
    stock: o.stock,
    category: productById.get(o.productId)?.category ?? "?",
    matched: productById.has(o.productId),
  }));

  const checks = selfCheck();

  return {
    scrapedAt,
    dbLive: isDbConfigured(),
    tables: schemaTables(),
    products,
    totals: {
      offers: offers.length,
      products: products.length,
      stores: new Set(offers.map((o) => o.store)).size,
      newCount,
      usedCount: offers.length - newCount,
      unmatched,
      orphanedProducts: productStats.filter((s) => s.count === 0).length,
      unmatchedQueue: LIVE_EXTRA.length,
    },
    price: { byCategory, outliers },
    productStats,
    coverage,
    offers: offers2,
    checks,
    checkPass: checks.every((c) => c.ok),
  };
}