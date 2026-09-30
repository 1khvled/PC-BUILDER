"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HOME, localeFromPathname, localizedPath, stripLocalePrefix, type Locale } from "@/lib/i18n/config";
import { useT } from "@/lib/i18n/client";
import type { TFn } from "@/lib/i18n/runtime";

/**
 * Public route prefixes that exist in both languages. English now owns the
 * unprefixed URLs and French lives under /fr, so a mirrored path is one of these
 * segments. Anything else (e.g. /admin-kh7, /api/*) has no counterpart, so the
   */
  const MIRRORED_PREFIXES = ["", "/builder", "/category", "/product", "/deals", "/guides", "/prebuilds"];

function isMirrored(pathWithoutLocale: string): boolean {
  return MIRRORED_PREFIXES.some(
    (p) => p === "" ? pathWithoutLocale === "/" : pathWithoutLocale === p || pathWithoutLocale.startsWith(`${p}/`),
  );
}

/**
 * Resolves the href of `locale` for a given (any-locale) pathname, with the
 * graceful fallback described above. Exported for tests / reuse.
 */
export function hrefForLocale(anyLocalePath: string, locale: Locale): string {
  const rest = stripLocalePrefix(anyLocalePath || "/");
  if (!isMirrored(rest)) return HOME[locale];
  return localizedPath(rest, locale);
}

export interface LocaleSwitcherProps {
  /**
   * Any-locale pathname to translate. Server components can pass the route they
   * already know; otherwise it is read from `usePathname()`.
   */
  pathname?: string;
  /** Visual tone, so the control blends into light pages or the navy bands. */
  tone?: "light" | "dark";
  className?: string;
}

export default function LocaleSwitcher({ pathname, tone = "light", className = "" }: LocaleSwitcherProps) {
  const routerPath = usePathname();
  const t: TFn = useT();
  const source = pathname ?? routerPath ?? "/";

  const entries: { locale: Locale; short: string; long: string; href: string }[] = [
    { locale: "fr", short: "FR", long: "Français", href: hrefForLocale(source, "fr") },
    { locale: "en", short: "EN", long: "English", href: hrefForLocale(source, "en") },
  ];

  const dark = tone === "dark";
  const shell = dark
    ? "inline-flex items-center rounded-full border border-white/15 bg-white/5 p-0.5"
    : "inline-flex items-center rounded-full border border-slate-200 bg-slate-50 p-0.5";

  return (
    <div
      className={`${shell} ${className}`}
      role="group"
      aria-label={t("switcher.label")}
      data-tone={tone}
    >
      {entries.map((e) => {
        // "Current" = the locale we are actually browsing in (derived from the
        // URL prefix, so it stays right even when the href had to fall back).
        const active = e.locale === localeFromPathname(source);
        const item = dark
          ? `px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
              active
                ? "bg-[#2c87c3] text-white"
                : "text-slate-300 hover:text-white hover:bg-white/10"
            }`
          : `px-2.5 py-1 rounded-full text-[11px] font-bold transition-colors ${
              active
                ? "bg-slate-900 text-white"
                : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/70"
            }`;
        return (
          <Link
            key={e.locale}
            href={e.href}
            hrefLang={e.locale}
            lang={e.locale}
            aria-current={active ? "true" : undefined}
            aria-label={
              e.locale === "en" ? t("switcher.ariaEn") : t("switcher.ariaFr")
            }
            title={
              e.locale === "en"
                ? t("switcher.ariaEn")
                : t("switcher.ariaFr")
            }
            className={item}
          >
            {e.short}
            <span className="sr-only"> — {e.long}</span>
          </Link>
        );
      })}
    </div>
  );
}
