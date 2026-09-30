/**
 * Locale configuration for the DZ PartPicker bilingual surface.
 *
 * Routing model (intentionally NOT a [locale] segment, to avoid touching the
 * existing unprefixed routes):
 *   - French  -> unprefixed   "/"  "/category/cpu"  "/product/xyz"  ...
 *   - English -> prefixed     "/en" "/en/category/cpu" "/en/product/xyz" ...
 *
 * This module is dependency-free and safe to import from both server and client
 * code.
 */

export const LOCALES = ["fr", "en"] as const;
export type Locale = (typeof LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "fr";

/** `<html lang>` value per locale. */
export const HTML_LANG: Record<Locale, string> = { fr: "fr-DZ", en: "en-DZ" };

/** OpenGraph `locale` value per locale. */
export const OG_LOCALE: Record<Locale, string> = { fr: "fr_DZ", en: "en_DZ" };

/**
 * `Intl` locale used for every number/date rendering. Prices are ALWAYS
 * Algerian Dinars — only the digit grouping and decimal separators change.
 * "en-DZ" resolves to the `en` numbering system, which is what an English
 * reader in Algeria expects.
 */
export const NUMBER_LOCALE: Record<Locale, string> = { fr: "fr-DZ", en: "en-DZ" };

/** Canonical absolute origin. Kept in sync with app/layout.tsx metadataBase. */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

/** Home route per locale. */
export const HOME: Record<Locale, string> = { fr: "/", en: "/en" };

/** Prefix used by the non-default locale, empty for the default one. */
export const LOCALE_PREFIX: Record<Locale, string> = { fr: "", en: "/en" };

export function isLocale(value: unknown): value is Locale {
  return typeof value === "string" && (LOCALES as readonly string[]).includes(value);
}

/**
 * Resolves the locale of a pathname. Anything that is not prefixed with a
 * supported locale code is French (the default).
 *
 * Safe because no public route can collide with a locale code: category slugs
 * are a fixed list (cpu, gpu, ram, ...) and dynamic segments are ids/slugs.
 */
export function localeFromPathname(pathname: string): Locale {
  if (!pathname) return DEFAULT_LOCALE;
  const first = pathname.split("/").filter(Boolean)[0];
  return isLocale(first) ? first : DEFAULT_LOCALE;
}

export function otherLocale(locale: Locale): Locale {
  return locale === "fr" ? "en" : "fr";
}

/** "/en/guides/x" -> "/guides/x"; "/en" -> "/"; "/guides/x" -> "/guides/x" */
export function stripLocalePrefix(pathname: string): string {
  const locale = localeFromPathname(pathname);
  if (locale === DEFAULT_LOCALE) return pathname || "/";
  const rest = pathname.split("/").filter(Boolean).slice(1).join("/");
  return rest ? `/${rest}` : "/";
}

/**
 * Prefixes a locale-agnostic ("French shaped") path with the right locale.
 *   localizedPath("/category/cpu", "en") -> "/en/category/cpu"
 *   localizedPath("/", "en")             -> "/en"
 *   localizedPath("/", "fr")             -> "/"
 */
export function localizedPath(path: string, locale: Locale): string {
  const rest = stripLocalePrefix(path || "/");
  const prefix = LOCALE_PREFIX[locale];
  if (!prefix) return rest;
  return rest === "/" ? prefix : `${prefix}${rest}`;
}

/** Prefixes a path AND preserves its query string / hash. */
export function localizedHref(href: string, locale: Locale): string {
  const [beforeHash, hash] = href.split("#");
  const [path, query] = beforeHash.split("?");
  const next = `${localizedPath(path || "/", locale)}${query ? `?${query}` : ""}${hash ? `#${hash}` : ""}`;
  return next;
}

export function absoluteUrl(path: string): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL.replace(/\/$/, "")}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Canonical + hreflang map for a locale-agnostic route.
 *
 * `path` is always the *French-shaped* route ("/category/cpu"). `self` is the
 * locale of the page being rendered: it decides the value of `canonical`
 * (each version must point at itself), while `x-default` always points at the
 * French (unprefixed) version — the historical root of the domain and the one
 * most Algerian traffic expects.
 */
export function languageAlternates(path: string, self: Locale = DEFAULT_LOCALE) {
  const fr = localizedPath(path, "fr");
  const en = localizedPath(path, "en");
  return {
    canonical: self === "en" ? en : fr,
    languages: {
      "fr-DZ": absoluteUrl(fr),
      "en-DZ": absoluteUrl(en),
      "x-default": absoluteUrl(fr),
    },
  };
}

/** Locale-aware integer/decimal formatting. Currency semantics never change. */
export function formatNumber(value: number, locale: Locale): string {
  return value.toLocaleString(NUMBER_LOCALE[locale]);
}

/** Locale-aware price formatting, always in Algerian Dinars. */
export function formatPrice(value: number, locale: Locale): string {
  return `${formatNumber(value, locale)} DA`;
}

/** Locale-aware short date used by every "relevé du" label (ISO in, human out). */
export function formatDate(iso: string, locale: Locale): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(NUMBER_LOCALE[locale], {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}
