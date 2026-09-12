import type { Category } from "../data/products";

export type Band = [number, number] & { min: number; max: number };

function createBand(min: number, max: number): Band {
  const tuple = [min, max] as unknown as Band;
  tuple.min = min;
  tuple.max = max;
  return tuple;
}

export const CATEGORY_BANDS: Record<Category, Band> = {
  cpu: createBand(1000, 250000),
  cooler: createBand(500, 90000),
  motherboard: createBand(4000, 200000),
  ram: createBand(1000, 300000),
  ssd: createBand(800, 160000),
  gpu: createBand(2000, 1500000),
  case: createBand(1000, 130000),
  psu: createBand(800, 150000),
  monitor: createBand(3000, 400000),
};

const GLOBAL_MIN_PRICE = 500;
const GLOBAL_MAX_PRICE = 1500000;

export interface QuickCheckInput {
  priceDa: number;
  title: string;
  url: string;
  image?: string | null;
  category?: string | null;
}

export function quickCheck(o: QuickCheckInput): boolean {
  if (!o || typeof o !== "object") return false;

  // 1. Check price (out-of-band prices)
  if (typeof o.priceDa !== "number" || !Number.isFinite(o.priceDa) || isNaN(o.priceDa)) {
    return false;
  }

  const cat = o.category ? (o.category.toLowerCase().trim() as Category) : null;
  if (cat && cat in CATEGORY_BANDS) {
    const band = CATEGORY_BANDS[cat];
    if (o.priceDa < band.min || o.priceDa > band.max) {
      return false;
    }
  } else {
    if (o.priceDa < GLOBAL_MIN_PRICE || o.priceDa > GLOBAL_MAX_PRICE) {
      return false;
    }
  }

  // 2. Check title (titles under 12 chars)
  if (!o.title || typeof o.title !== "string" || o.title.trim().length < 12) {
    return false;
  }

  // 3. Check URL (non-http URLs)
  if (!o.url || typeof o.url !== "string" || !/^https?:\/\//i.test(o.url.trim())) {
    return false;
  }

  // 4. Check image (data: images)
  if (o.image && typeof o.image === "string" && o.image.trim().toLowerCase().startsWith("data:")) {
    return false;
  }

  return true;
}
