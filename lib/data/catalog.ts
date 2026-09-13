// Server-side catalog: Supabase first, static bake fallback.
//
// Source of truth is the Supabase database (tables stores, canonical_products,
// offers, price_history — public read via RLS). When the DB is unreachable or
// the env is not configured (local dev without .env.local), every helper falls
// back to the static bake in ./products + ./live so the site keeps rendering.
import { supabase, isDbConfigured } from "@/lib/supabase";
import { OFFERS, priceHistory, type Offer, type PricePoint } from "./products";
import { SCRAPED_AT } from "./live";

const PAGE = 1000; // PostgREST max-rows: paginate past the 1000-row cap

interface DbStore {
  id: number;
  name: string;
  wilaya: string;
}

interface DbOfferRow {
  product_id: string;
  price_da: number;
  cond: number;
  url: string;
  title: string;
  day: string;
  stores: { name: string; wilaya: string } | { name: string; wilaya: string }[] | null;
}

interface DbHistoryRow {
  price_da: number;
  day: string;
  store_id: number;
}

function storeOf(s: { name: string; wilaya: string } | { name: string; wilaya: string }[] | null): {
  name: string;
  wilaya: string;
} | null {
  if (!s) return null;
  return Array.isArray(s) ? s[0] ?? null : s;
}

function toOffer(r: DbOfferRow): Offer {
  const s = storeOf(r.stores);
  return {
    productId: r.product_id,
    store: s?.name ?? "—",
    wilaya: s?.wilaya ?? "Alger",
    titleRaw: r.title,
    priceDa: r.price_da,
    url: r.url,
    // Honest label: the DB snapshot carries no live stock flag, so never
    // claim "En stock". Unconfirmed offers rank below confirmed ones.
    stock: "Prix constaté",
    condition: r.cond === 1 ? "new" : "used",
    scrapedAt: r.day,
  };
}

/** Fetch every row of a PostgREST query, page by page. */
async function fetchAll<T>(build: (from: number, to: number) => PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE) {
    const { data, error } = await build(from, from + PAGE - 1);
    if (error || !data || data.length === 0) break;
    out.push(...data);
    if (data.length < PAGE) break;
  }
  return out;
}

/** All current offers (one row per product × store × condition). */
export async function getOffers(): Promise<Offer[]> {
  try {
    if (!isDbConfigured()) return OFFERS;
    const client = supabase();
    const rows = await fetchAll<DbOfferRow>((from, to) =>
      client
        .from("offers")
        .select("product_id, price_da, cond, url, title, day, stores!inner(name, wilaya)")
        .range(from, to)
    );
    if (rows.length === 0) return OFFERS;
    return rows.map(toOffer);
  } catch {
    return OFFERS;
  }
}

/** ISO date of the latest price snapshot (for "Relevé le" labels). */
export async function getScrapedAt(): Promise<string> {
  try {
    if (!isDbConfigured()) return SCRAPED_AT;
    const { data } = await supabase()
      .from("offers")
      .select("day")
      .order("day", { ascending: false })
      .limit(1)
      .maybeSingle();
    const day = (data as { day?: string } | null)?.day;
    return day ? `${day}T00:00:00.000Z` : SCRAPED_AT;
  } catch {
    return SCRAPED_AT;
  }
}

/** Price history for one product, oldest first. */
export async function getPriceHistory(productId: string): Promise<PricePoint[]> {
  try {
    if (!isDbConfigured()) return priceHistory(productId);
    const client = supabase();
    const [rows, stores] = await Promise.all([
      fetchAll<DbHistoryRow>((from, to) =>
        client
          .from("price_history")
          .select("day, price_da, store_id")
          .eq("product_id", productId)
          .order("day", { ascending: true })
          .range(from, to)
      ),
      fetchAll<DbStore>((from, to) => client.from("stores").select("id, name, wilaya").range(from, to)),
    ]);
    if (rows.length === 0) return priceHistory(productId);
    const names = new Map(stores.map((s) => [s.id, s.name]));
    return rows.map((r) => ({ day: r.day, store: names.get(r.store_id) ?? "—", price: r.price_da }));
  } catch {
    return priceHistory(productId);
  }
}
