"use client";

import { useEffect } from "react";
import { recordVisit } from "@/lib/recent";

/**
 * Records that a product page was viewed.
 *
 * Mounted once inside the product page. Deliberately renders nothing - it exists
 * only for its effect - so it cannot affect layout, and it is client-only so the
 * server never sees or stores anything about who is browsing.
 *
 * Written in an effect rather than during render on purpose: localStorage is a
 * side effect, and React may render a component more than once.
 */
export default function RecordVisit({ productId }: { productId: string }) {
  useEffect(() => {
    recordVisit(productId);
  }, [productId]);
  return null;
}
