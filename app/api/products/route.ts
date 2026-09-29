import { NextResponse } from "next/server";
import { bestOffer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const cat = searchParams.get("cat") ?? "";

  // Live products and offers directly from Supabase
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);

  const items = products
    .filter((p) => (!cat || p.category === cat) && (!q || `${p.brand} ${p.model}`.toLowerCase().includes(q)))
    .map((p) => ({ ...p, best: bestOffer(p.id, offers) ?? null }));

  return NextResponse.json({ count: items.length, items, offers, scrapedAt });
}
