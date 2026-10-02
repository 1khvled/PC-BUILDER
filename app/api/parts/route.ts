import { NextResponse } from "next/server";
import { bestOffer, minOf, type Product } from "@/lib/data/products";
import { getOffers, getPriceHistory, getProducts } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

/**
 * Compact rows for the visitor's watchlist.
 *
 * The watchlist lives in the visitor's browser, so the server cannot know which
 * parts are tracked when it renders the page. Rather than ship the whole
 * 4 000+ product catalogue to the client just to filter it there, the client
 * asks for the ids it actually holds and gets back a small payload.
 *
 * Capped at 100 ids: a watchlist that long is not a real shopping session, and
 * the cap stops this being a way to request the entire catalogue in one call.
 */
const MAX_IDS = 100;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const ids = (url.searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, MAX_IDS);

  if (ids.length === 0) return NextResponse.json({ rows: [] });

  const [products, offers] = await Promise.all([getProducts(), getOffers()]);
  const byId = new Map<string, Product>(products.map((p: Product) => [p.id, p]));

  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1000;
  const cutoff = new Date(ninetyDaysAgo).toISOString().slice(0, 10);

  // History is per-id and async, so resolve the tracked ids in parallel rather
  // than fetching the whole history table.
  const histories = new Map<string, Awaited<ReturnType<typeof getPriceHistory>>>();
  await Promise.all(
    ids.map(async (id) => {
      histories.set(id, await getPriceHistory(id));
    }),
  );

  const rows = ids.flatMap((id) => {
    const product = byId.get(id);
    if (!product) return [];
    const best = bestOffer(id, offers);
    const history = histories.get(id) ?? [];
    const older = history.filter((h) => h.day <= cutoff);
    return [
      {
        id: product.id,
        category: product.category,
        brand: product.brand,
        model: product.model,
        bestPrice: best ? best.priceDa : null,
        bestStore: best ? best.store : null,
        bestWilaya: best ? best.wilaya : null,
        // Cheapest point in the trailing window, which is a fairer "was it
        // cheaper before?" baseline than the price exactly 90 days ago.
        price90: older.length ? minOf(older.map((h) => h.price)) : null,
        historyLow: history.length ? minOf(history.map((h) => h.price)) : null,
      },
    ];
  });

  return NextResponse.json(
    { rows },
    { headers: { "cache-control": "private, no-store" } },
  );
}
