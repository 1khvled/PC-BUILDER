"use client";

import { useEffect, useState } from "react";
import { OFFERS, PRODUCTS, type Offer, type Product } from "./products";

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

export function useProducts(): Product[] {
  const [products, setProducts] = useState<Product[]>(PRODUCTS);
  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (alive && Array.isArray(d.items) && d.items.length) setProducts(d.items);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return products;
}

export function useCatalog(): { products: Product[]; offers: Offer[] } {
  const [data, setData] = useState<{ products: Product[]; offers: Offer[] }>({
    products: PRODUCTS,
    offers: OFFERS,
  });
  useEffect(() => {
    let alive = true;
    fetch("/api/products")
      .then((r) => r.json())
      .then((d) => {
        if (!alive) return;
        setData({
          products: Array.isArray(d.items) && d.items.length ? d.items : PRODUCTS,
          offers: Array.isArray(d.offers) && d.offers.length ? d.offers : OFFERS,
        });
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, []);
  return data;
}

