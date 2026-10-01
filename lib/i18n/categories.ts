import type { TFn, TKey } from "./runtime";
import type { Locale } from "./config";
import { getDictionarySync } from "./runtime";

/**
 * Category slugs are data (URLs, DB rows, offer.productId keys) and are NEVER
 * translated. Only the human-readable label is localized.
 */
const CATEGORY_KEYS: Record<string, TKey> = {
  cpu: "cats.cpu",
  cooler: "cats.cooler",
  motherboard: "cats.motherboard",
  ram: "cats.ram",
  ssd: "cats.ssd",
  hdd: "cats.hdd",
  gpu: "cats.gpu",
  case: "cats.case",
  psu: "cats.psu",
  monitor: "cats.monitor",
};

export const CATEGORY_SLUGS = Object.keys(CATEGORY_KEYS);

/** Localized category label from its slug. */
export function categoryLabel(slug: string, t: TFn): string {
  const key = CATEGORY_KEYS[slug];
  return key ? t(key) : slug;
}

/** Same, but for pages that only hold a locale (no bound `t` handy). */
export function categoryLabelFor(slug: string, locale: Locale): string {
  const dict = getDictionarySync(locale);
  const key = CATEGORY_KEYS[slug];
  return key ? dict[key] : slug;
}
