import { NextResponse } from "next/server";
import { bestOffer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase().trim();
  const cat = searchParams.get("cat") ?? "";

  // Live products and offers directly from Supabase (backed by server in-memory deduplicated cache)
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);

  // Search mode (Header autocomplete / query):
  // Return ONLY top 15 matching items with their bestOffer.
  // DO NOT serialize 3,000+ offers over the wire on every keystroke!
  if (q) {
    const items = products
      .filter((p) => (!cat || p.category === cat) && `${p.brand} ${p.model}`.toLowerCase().includes(q))
      .slice(0, 15)
      .map((p) => ({ ...p, best: bestOffer(p.id, offers) ?? null }));

    return NextResponse.json(
      { count: items.length, items, scrapedAt },
      {
        headers: {
          "Cache-Control": "public, s-maxage=120, stale-while-revalidate=600",
        },
      }
    );
  }

  // Full catalog mode (e.g. initial builder hydration):
  const items = products
    .filter((p) => !cat || p.category === cat)
    .map((p) => ({ ...p, best: bestOffer(p.id, offers) ?? null }));

  return NextResponse.json(
    { count: items.length, items, offers, scrapedAt },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
