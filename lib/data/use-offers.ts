"use client";

import { useEffect, useState } from "react";
import { OFFERS, type Offer } from "./products";

/**
 * Live offers for client components ("use client" pages can't await the
 * server catalog). Starts from the static bake, then hydrates from the
 * DB-backed /api/products endpoint. Falls back silently when offline.
 */
export function useOffers(): Offer[] {
  const [offers, setOffers] = useState<Offer[]>(OFFERS);
  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.offers) && d.offers.length) setOffers(d.offers);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return offers;
}
