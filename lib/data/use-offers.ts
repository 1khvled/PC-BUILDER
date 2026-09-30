"use client";

import { useEffect, useState } from "react";
import { OFFERS, PRODUCTS, type Offer, type Product } from "./products";

// Smart client-side cache singleton
interface CatalogCache {
  products: Product[];
  offers: Offer[];
  timestamp: number;
}

let memoryCache: CatalogCache | null = null;
let inFlightPromise: Promise<CatalogCache> | null = null;
const CLIENT_CACHE_TTL_MS = 3 * 60 * 1000; // 3 minutes fresh cache in browser

function readSessionCache(): CatalogCache | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = sessionStorage.getItem("dz_catalog_cache_v1");
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (parsed && Array.isArray(parsed.products) && Array.isArray(parsed.offers)) {
      return parsed;
    }
  } catch {
    /* ignore storage errors */
  }
  return null;
}

function writeSessionCache(cache: CatalogCache) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.setItem("dz_catalog_cache_v1", JSON.stringify(cache));
  } catch {
    /* ignore storage quota errors */
  }
}

async function fetchCatalogOnce(): Promise<CatalogCache> {
  const now = Date.now();
  // Check memory
  if (memoryCache && now - memoryCache.timestamp < CLIENT_CACHE_TTL_MS) {
    return memoryCache;
  }
  // Check in-flight deduplication
  if (inFlightPromise) {
    return inFlightPromise;
  }
  inFlightPromise = (async () => {
    try {
      const res = await fetch("/api/products");
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const products = Array.isArray(data.items) && data.items.length ? data.items : PRODUCTS;
      const offers = Array.isArray(data.offers) && data.offers.length ? data.offers : OFFERS;
      const result: CatalogCache = { products, offers, timestamp: Date.now() };
      memoryCache = result;
      writeSessionCache(result);
      return result;
    } catch {
      // Fallback to existing or seed
      const fallback = memoryCache || readSessionCache() || { products: PRODUCTS, offers: OFFERS, timestamp: now };
      return fallback;
    } finally {
      inFlightPromise = null;
    }
  })();
  return inFlightPromise;
}

/**
 * Smart client-side catalog hook:
 * - Initializes synchronously from memory or sessionStorage in 0ms (no layout shifts, no spinners).
 * - Deduplicates concurrent calls into a single network fetch.
 * - Stale-while-revalidate pattern: renders instant cached data, refreshes in background.
 */
export function useCatalog(): { products: Product[]; offers: Offer[] } {
  const [data, setData] = useState<{ products: Product[]; offers: Offer[] }>(() => {
    if (memoryCache) {
      return { products: memoryCache.products, offers: memoryCache.offers };
    }
    const session = readSessionCache();
    if (session) {
      memoryCache = session;
      return { products: session.products, offers: session.offers };
    }
    return { products: PRODUCTS, offers: OFFERS };
  });

  useEffect(() => {
    let alive = true;
    fetchCatalogOnce().then((c) => {
      if (alive) {
        setData({ products: c.products, offers: c.offers });
      }
    });
    return () => {
      alive = false;
    };
  }, []);

  return data;
}

export function useOffers(): Offer[] {
  const { offers } = useCatalog();
  return offers;
}

export function useProducts(): Product[] {
  const { products } = useCatalog();
  return products;
}

