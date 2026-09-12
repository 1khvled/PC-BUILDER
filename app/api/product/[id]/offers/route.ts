import { NextResponse } from "next/server";
import { OFFERS } from "@/lib/data/products";

// GET /api/product/:id/offers — organic always sorted price ASC (PLAN 8 trust rule)
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const offers = OFFERS.filter((o) => o.productId === params.id).sort((a, b) => a.priceDa - b.priceDa);
  return NextResponse.json({ count: offers.length, offers });
}
