/**
 * Shared, framework-free i18n runtime.
 *
 * Lives outside `client.tsx` / `server.ts` on purpose: both server and client
 * entry points need the interpolation + lookup helpers, and neither should have
 * to import a "use client" module (or vice-versa).
 */
import { fr, type Dictionary } from "./dictionaries/fr";
import { en } from "./dictionaries/en";
import { DEFAULT_LOCALE, isLocale, type Locale } from "./config";

export type { Dictionary };

/** Values accepted for `{placeholder}` interpolation. */
export type TParams = Record<string, string | number>;

/** Any key present in the dictionary. */
export type TKey = keyof Dictionary;

export type TFn = <K extends TKey>(key: K, params?: TParams) => string;

/** Replaces every `{name}` placeholder. Unknown placeholders are left as-is. */
export function interpolate(template: string, params?: TParams): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(params, name) ? String(params[name]) : match,
  );
}

const DICTIONARIES: Record<Locale, Dictionary> = { fr, en };

/**
 * Suffix for counted nouns, used as the `{plural}` placeholder.
 * Both supported locales use a regular plural, but keeping it in one place
 * means a future locale with different plural rules only touches this function.
 */
export function pluralSuffix(count: number): string {
  return Math.abs(count) > 1 ? "s" : "";
}

/**
 * `Offer.stock` is DATA coming from the scrapers/Supabase (`"En stock"`,
 * `"Rupture"`, `"À vérifier"`, `"Ouedkniss"`, `"Sur commande"`, …). It is never
 * translated at the data layer, so the English UI maps the known codes to their
 * English label at RENDER time. Unknown/empty values pass through untouched.
 */
const STOCK_LABEL_OVERRIDES: Record<Locale, Record<string, string>> = {
  // French is the source language of these codes: nothing to map.
  fr: {},
  en: {
    "En stock": "In stock",
    Rupture: "Out of stock",
    "À vérifier": "Check availability",
    "Sur commande": "Pre-order",
  },
};

export function stockLabel(stock: string | null | undefined, locale: Locale): string {
  if (!stock) return "";
  return STOCK_LABEL_OVERRIDES[locale][stock] ?? stock;
}


/**
 * Returns the raw dictionary for a locale. Never throws: an unknown locale
 * falls back to the default (French) one.
 */
export function getDictionarySync(locale: string | undefined | null): Dictionary {
  return DICTIONARIES[isLocale(locale) ? locale : DEFAULT_LOCALE];
}

/**
 * Builds a `t()` function bound to a locale.
 *
 * This is the recommended way to translate inside a *client* component that
 * receives its locale as a prop (see components/CategoryCatalogClient.tsx):
 *
 *   const t = makeT(locale);
 *   return <button title={t("common.resetTitle")}>…</button>
 */
export function makeT(locale: string | undefined | null): TFn {
  const dict = getDictionarySync(locale);
  return (key, params) => interpolate(dict[key], params);
}
