import { NextResponse } from "next/server";
import { PRODUCTS, bestOffer } from "@/lib/data/products";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get("q") ?? "").toLowerCase();
  const cat = searchParams.get("cat") ?? "";
  const items = PRODUCTS
    .filter((p) => (!cat || p.category === cat) && (!q || `${p.brand} ${p.model}`.toLowerCase().includes(q)))
    .map((p) => ({ ...p, best: bestOffer(p.id) ?? null }));
  return NextResponse.json({ count: items.length, items });
}
