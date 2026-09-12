import { UA, delay } from "./base";
import { cleanTitle, type ScrapedOffer } from "./stores";

export interface WooStoreApiConfig {
  base: string;
  cats: Record<string, number | string>;
  minorUnits?: number;
}

interface WooProduct {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  on_sale: boolean;
  prices: {
    price: string;
    regular_price: string;
    sale_price: string;
    currency_code?: string;
    currency_symbol?: string;
    currency_minor_unit?: number;
  };
  is_in_stock: boolean;
  images: Array<{
    id: number;
    src: string;
    thumbnail?: string;
  }>;
}

interface WooCartResponse {
  totals?: {
    currency_code?: string;
    currency_minor_unit?: number;
  };
}

const STORE_BASES: Record<string, string> = {
  "Click-DZ": "https://click-dz.com",
  "Digitec": "https://www.digitecdz.com",
  "KhabirTech": "https://khabirtech.com",
  "Informatics": "https://informatics-dz.com",
  "GigaStore": "https://gigastore-dz.com",
  "Campus": "https://campusinformatique.com",
  "WifiDjelfa": "https://wifidjelfa.com",
  "KOTEK": "https://kotekdz.com",
};

const KNOWN_STORE_MINOR_UNITS: Record<string, number> = {
  "Click-DZ": 0,
  "Digitec": 0,
  "KhabirTech": 2,
  "Informatics": 0,
  "GigaStore": 0,
  "Campus": 2,
  "WifiDjelfa": 2,
  "KOTEK": 2,
};

const storeMinorUnitCache = new Map<string, number>();

/**
 * Resolves the currency minor unit (decimal count) for a store.
 * First tries reading cached value, then /wp-json/wc/store/v1/cart,
 * falling back to verified known store defaults.
 */
async function resolveStoreMinorUnit(store: string, baseUrl: string): Promise<number> {
  if (storeMinorUnitCache.has(store)) {
    return storeMinorUnitCache.get(store)!;
  }

  try {
    const res = await fetch(`${baseUrl}/wp-json/wc/store/v1/cart`, {
      headers: {
        "User-Agent": UA,
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data: WooCartResponse = await res.json();
      if (typeof data.totals?.currency_minor_unit === "number") {
        storeMinorUnitCache.set(store, data.totals.currency_minor_unit);
        return data.totals.currency_minor_unit;
      }
    }
  } catch {
    // Fall back to known store minor units
  }

  const fallback = KNOWN_STORE_MINOR_UNITS[store] ?? 0;
  storeMinorUnitCache.set(store, fallback);
  return fallback;
}

function decodeHtmlEntities(raw: string): string {
  return raw
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&#8217;/g, "'")
    .replace(/&#8211;|&ndash;/g, "–")
    .replace(/&#8212;|&mdash;/g, "—")
    .replace(/&#8243;|&Prime;/g, '"')
    .replace(/&nbsp;/g, " ")
    .replace(/&#(\d+);/g, (_, code) => String.fromCharCode(Number(code)));
}

/**
 * Fetches products from WooCommerce Store API with pagination.
 *
 * @param store Name of the store (e.g. "Click-DZ", "Digitec", etc.)
 * @param categoryId WooCommerce Store API category ID (number or comma-separated string)
 * @param category DZ-PartPicker category identifier (e.g. "cpu", "gpu")
 * @param baseUrl Base URL of the store (e.g. "https://click-dz.com")
 */
export async function fetchProducts(
  store: string,
  categoryId: number | string,
  category = "",
  baseUrl?: string
): Promise<ScrapedOffer[]> {
  const base = (baseUrl || STORE_BASES[store] || "").replace(/\/+$/, "");
  if (!base) return [];

  const storeMinorFallback = await resolveStoreMinorUnit(store, base);
  const offers: ScrapedOffer[] = [];
  const maxPages = 3;

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) {
      await delay(600);
    }

    const url = `${base}/wp-json/wc/store/v1/products?category=${categoryId}&per_page=100&page=${page}`;
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent": UA,
          "Accept": "application/json",
          "Accept-Language": "fr-DZ,fr;q=0.9",
        },
        signal: AbortSignal.timeout(15000),
      });

      if (!res.ok) {
        break;
      }

      const products: WooProduct[] = await res.json();
      if (!Array.isArray(products) || products.length === 0) {
        break;
      }

      for (const p of products) {
        // Resolve minor units: prefer product prices level, else store fallback
        const minorUnit =
          typeof p.prices?.currency_minor_unit === "number"
            ? p.prices.currency_minor_unit
            : storeMinorFallback;

        // Prefer sale_price if on sale and non-zero, otherwise price or regular_price
        let rawPrice = p.prices?.price;
        if (p.on_sale && p.prices?.sale_price && p.prices.sale_price !== "0" && p.prices.sale_price !== "") {
          rawPrice = p.prices.sale_price;
        } else if (!rawPrice || rawPrice === "0") {
          rawPrice = p.prices?.regular_price;
        }

        if (!rawPrice || rawPrice === "0") continue;

        const divisor = Math.pow(10, minorUnit);
        const priceDa = Math.round(parseFloat(rawPrice) / divisor);

        // Sanity check price bounds (500 DA to 5,000,000 DA)
        if (!Number.isFinite(priceDa) || priceDa < 500 || priceDa > 5_000_000) {
          continue;
        }

        const title = cleanTitle(decodeHtmlEntities(p.name || ""));
        if (!title || title.length < 3) continue;

        const productUrl = p.permalink || `${base}/product/${p.slug}`;
        const stock = p.is_in_stock ? "En stock" : "Rupture";
        const image = p.images?.[0]?.src || "";

        offers.push({
          store,
          category,
          title,
          priceDa,
          url: productUrl,
          stock,
          image,
        });
      }

      // If page returned fewer than 100 items, there are no more pages
      if (products.length < 100) {
        break;
      }
    } catch {
      // Network or parsing error: return any offers collected so far
      break;
    }
  }

  return offers;
}
