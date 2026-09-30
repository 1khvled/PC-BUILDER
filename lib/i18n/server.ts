import type { Locale } from "./config";
import { getDictionarySync, interpolate, makeT, type TKey, type TParams } from "./runtime";

/**
 * Server-side dictionary access.
 *
 * Both dictionaries are imported STATICALLY (no dynamic require / no
 * dynamic import()) so Next can statically analyse and tree-shake them and so
 * this works during static generation and ISR.
 */
export async function getDictionary(locale: Locale): Promise<ReturnType<typeof getDictionarySync>> {
  return getDictionarySync(locale);
}

/**
 * Returns a `t()` bound to a locale, for server components and
 * `generateMetadata()`:
 *
 *   const t = await getT("en");
 *   return { title: t("home.meta.title") };
 */
export async function getT(locale: Locale): Promise<ReturnType<typeof makeT>> {
  return makeT(locale);
}

export type { TKey, TParams };
export { interpolate, makeT };
