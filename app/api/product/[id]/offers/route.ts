import { NextResponse } from "next/server";
import { getOffers } from "@/lib/data/catalog";

// GET /api/product/:id/offers — organic always sorted price ASC (PLAN 8 trust rule)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const offers = (await getOffers())
    .filter((o) => o.productId === params.id)
    .sort((a, b) => a.priceDa - b.priceDa);
  return NextResponse.json({ count: offers.length, offers });
}
