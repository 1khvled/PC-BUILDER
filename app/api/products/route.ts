import { NextResponse } from "next/server";
import { PRODUCTS, bestOffer } from "@/lib/data/products";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const cat = searchParams.get("cat") ?? "";
  // Live offers from Supabase (static bake fallback inside getOffers).
  const offers = await getOffers();
  const scrapedAt = await getScrapedAt();
  const items = PRODUCTS
    .filter((p) => (!cat || p.category === cat) && (!q || `${p.brand} ${p.model}`.toLowerCase().includes(q)))
    .map((p) => ({ ...p, best: bestOffer(p.id, offers) ?? null }));
  return NextResponse.json({ count: items.length, items, offers, scrapedAt });
}
