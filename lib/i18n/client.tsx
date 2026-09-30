"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  DEFAULT_LOCALE,
  isLocale,
  localeFromPathname,
  localizedHref,
  otherLocale,
  type Locale,
} from "./config";
import { makeT, type TFn } from "./runtime";

/**
 * CLIENT I18N.
 *
 * WHY THIS LOOKS THE WAY IT DOES
 * -------------------------------
 * `app/layout.tsx` is off-limits for this change set, so the provider cannot be
 * mounted once around the whole app. Instead:
 *
 *   1. `app/en/layout.tsx` mounts `<I18nProvider locale="en">` around the whole
 *      English subtree (a NEW file, so no conflict with the root layout).
 *   2. That same layout also emits a tiny inline script that writes
 *      `document.documentElement.dataset.locale = "en"` (and `lang="en"`) as
 *      the document is parsed — i.e. before paint, exactly like the existing
 *      theme script in app/layout.tsx.
 *   3. `useLocale()` — used by shared chrome (Footer) that lives OUTSIDE the
 *      provider — falls back to reading that dataset attribute lazily in an
 *      effect, defaulting to "fr". Because the read happens in an effect, the
 *      first client render matches the server HTML (no hydration mismatch); the
 *      English copy swaps in immediately after mount.
 *
 * Client components that RECEIVE a `locale` prop (the recommended pattern for
 * translated interactive components) do not need the provider at all: they call
 * `makeT(locale)` directly, which keeps their first paint fully translated.
 */

const STORAGE_KEY = "dz_locale";

export interface I18nValue {
  locale: Locale;
  t: TFn;
  /** Navigate to the same route in the other locale. */
  setLocale: (locale: Locale) => void;
  /** The other supported locale. */
  other: Locale;
}

const I18nContext = createContext<I18nValue | null>(null);

export function I18nProvider({ locale, children }: { locale: Locale; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname() || "/";
  const other = otherLocale(locale);

  const setLocale = useCallback(
    (next: Locale) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* private mode — the preference is simply not persisted */
      }
      // `pathname` already carries the current locale prefix, so re-localizing
      // it is enough to reach the exact equivalent route.
      router.push(localizedHref(pathname, next));
    },
    [router, pathname],
  );

  const value = useMemo<I18nValue>(
    () => ({ locale, t: makeT(locale), setLocale, other }),
    [locale, setLocale, other],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Resolves the current locale, with or without a provider.
 * Never returns `undefined`: French is the site default.
 */
export function useLocale(): Locale {
  const ctx = useContext(I18nContext);
  const [domLocale, setDomLocale] = useState<Locale>(DEFAULT_LOCALE);

  useEffect(() => {
    const raw = document.documentElement.dataset.locale;
    if (isLocale(raw) && raw !== domLocale) setDomLocale(raw);
    // Intentionally mount-only: the locale is fixed for the lifetime of a page.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (ctx) return ctx.locale;
  return domLocale;
}

/** Full i18n accessor: `{ locale, t, setLocale, other }`. */
export function useI18n(): I18nValue {
  const ctx = useContext(I18nContext);
  const router = useRouter();
  const pathname = usePathname() || "/";
  const locale = useLocale();
  const other = otherLocale(locale);

  const setLocale = useCallback(
    (next: Locale) => {
      try {
        window.localStorage.setItem(STORAGE_KEY, next);
      } catch {
        /* ignore */
      }
      router.push(localizedHref(pathname, next));
    },
    [router, pathname],
  );

  const t = useMemo(() => makeT(locale), [locale]);

  if (ctx) return ctx;
  return { locale, t, setLocale, other };
}

/** Convenience accessor: just the bound `t()`. */
export function useT(): TFn {
  return useI18n().t;
}

export { localeFromPathname, otherLocale, localizedHref };
export type { Locale };
