"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";
import { makeT, type TKey } from "@/lib/i18n/runtime";
import LocaleSwitcher from "./LocaleSwitcher";

/**
 * Footer.
 *
 * Rendered by the ROOT layout (which is out of scope for this change set), so
 * it has no locale prop. It therefore resolves the locale through `useLocale()`,
 * which reads `document.documentElement.dataset.locale` — written pre-paint by
 * app/fr/layout.tsx. The first client render matches the server HTML (French),
 * then the English copy swaps in right after mount. Everything below is
 * data-driven from the dictionary, so there is no French string left here.
 */
export default function Footer() {
  const locale: Locale = useLocale();
  const t = useMemo(() => makeT(locale), [locale]);
  const href = (path: string) => localizedHref(path, locale);

  const trustItems: { titleKey: TKey; textKey: TKey; icon: ReactNode }[] = [
    {
      titleKey: "footer.trust1Title",
      textKey: "footer.trust1Text",
      icon: (
        <>
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </>
      ),
    },
    {
      titleKey: "footer.trust2Title",
      textKey: "footer.trust2Text",
      icon: (
        <>
          <path d="M1 3h15v13H1z" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </>
      ),
    },
    {
      titleKey: "footer.trust3Title",
      textKey: "footer.trust3Text",
      icon: (
        <>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </>
      ),
    },
    {
      titleKey: "footer.trust4Title",
      textKey: "footer.trust4Text",
      icon: (
        <>
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </>
      ),
    },
  ];

  const componentLinks: { href: string; key: TKey }[] = [
    { href: "/category/cpu", key: "footer.catCpu" },
    { href: "/category/gpu", key: "footer.catGpu" },
    { href: "/category/motherboard", key: "footer.catMotherboard" },
    { href: "/category/ram", key: "footer.catRam" },
    { href: "/category/ssd", key: "footer.catSsd" },
    { href: "/category/psu", key: "footer.catPsu" },
    { href: "/category/case", key: "footer.catCase" },
    { href: "/category/cooler", key: "footer.catCooler" },
    { href: "/category/monitor", key: "footer.catMonitor" },
  ];

  return (
    <footer className="relative bg-[#11111c] text-slate-300 text-xs mt-12 no-print overflow-hidden">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2c87c3]/50 to-transparent" aria-hidden="true" />

      {/* Trust & Guarantees Strip */}
      <div className="border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {trustItems.map((item) => (
            <div
              key={item.titleKey}
              className="flex items-center gap-3.5 p-4 rounded-xl bg-white/[0.05] border border-white/10 hover:bg-white/[0.08] transition-colors"
            >
              <div className="w-10 h-10 rounded-xl bg-gradient-to-b from-[#3a94d2] to-[#2c87c3] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(44,135,195,0.5)]">
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  {item.icon}
                </svg>
              </div>
              <div>
                <div className="text-white font-bold text-xs leading-snug">{t(item.titleKey)}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t(item.textKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AliExpress Telegram Community Callout Strip */}
      <div className="border-b border-white/[0.08] bg-gradient-to-r from-sky-950/40 via-[#0c2238]/60 to-slate-900/40">
        <div className="max-w-7xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] flex items-center justify-center text-white shrink-0 shadow-[0_4px_16px_rgba(0,136,204,0.4)]">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-bold text-xs sm:text-sm tracking-tight">{t("footer.telegramTitle")}</span>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {t("footer.telegramBadge")}
                </span>
              </div>
              <p className="text-slate-300 text-[11px] sm:text-xs mt-0.5 max-w-2xl leading-relaxed">
                {t("footer.telegramDesc")}
              </p>
            </div>
          </div>
          <a
            href="https://t.me/DzAliexpress0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#0099e6] hover:from-[#0077b5] hover:to-[#0088cc] text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-[0_2px_12px_rgba(0,136,204,0.3)] shrink-0"
          >
            <span>{t("footer.telegramCta")}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 pt-12 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+1rem)] sm:pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3.5">
            <div className="flex items-center gap-3">
              <div className="h-9 px-2.5 py-1 rounded-xl bg-[#08090f] border border-blue-500/40 ring-1 ring-cyan-500/20 shadow-[0_0_12px_rgba(0,140,255,0.2)] flex items-center justify-center">
                <img src="/brand/logo.webp" alt="DZ PartPicker" className="h-5 w-auto object-contain" />
              </div>
              <span className="text-white font-black text-base tracking-tight">DZ PartPicker</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t("footer.about")}
            </p>
            <div className="flex flex-wrap gap-1.5 pt-1">
              <span className="px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/10 text-slate-200 font-semibold text-[10px]">
                {t("footer.badgeIndependent")}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/20 text-emerald-300 font-semibold text-[10px]">
                {t("footer.badgeLive")}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-white/[0.08] border border-white/10 text-slate-200 font-semibold text-[10px]">
                {t("footer.badgeSources")}
              </span>
              <span className="px-2.5 py-1 rounded-full bg-[#2c87c3]/15 border border-[#2c87c3]/30 text-[#7cc0ea] font-semibold text-[10px]">
                {t("footer.badgeNewUsed")}
              </span>
            </div>
          </div>

          {/* Outils Col */}
          <div className="space-y-2.5">
            <h2 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              {t("nav.toolsConfig")}
            </h2>
            <ul className="space-y-2">
              <li>
                <Link href={href("/builder")} className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group py-1 min-h-[36px]">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  {t("footer.linkBuilder")}
                </Link>
              </li>
              <li>
                <Link href={href("/guides")} className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group py-1 min-h-[36px]">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  {t("footer.linkGuides")}
                </Link>
              </li>
              <li>
                <Link href={href("/deals")} className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group py-1 min-h-[36px]">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  {t("footer.linkDeals")}
                </Link>
              </li>
              <li>
                <Link href={href("/category/cpu")} className="text-slate-400 hover:text-white transition-colors inline-flex items-center gap-1.5 group py-1 min-h-[36px]">
                  <span className="text-[#2c87c3] opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true">→</span>
                  {t("footer.linkCatalog")}
                </Link>
              </li>
              <li>
                <a
                  href="https://t.me/DzAliexpress0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1.5 group py-1 min-h-[36px] font-medium"
                >
                  <span className="text-sky-400 opacity-80 group-hover:opacity-100 transition-opacity" aria-hidden="true">✈️</span>
                  {t("footer.linkTelegram")}
                </a>
              </li>
            </ul>
          </div>

          {/* Composants Col */}
          <div className="space-y-2.5">
            <h2 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              {t("nav.componentsPc")}
            </h2>
            <ul className="space-y-1.5">
              {componentLinks.map((c) => (
                <li key={c.href}>
                  <Link href={href(c.href)} className="text-slate-400 hover:text-white transition-colors inline-flex items-center py-1 min-h-[36px]">
                    {t(c.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparence Col */}
          <div className="space-y-2.5">
            <h2 className="text-white font-bold text-xs uppercase tracking-widest flex items-center gap-2">
              <span className="w-1 h-3.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              {t("nav.transparency")}
            </h2>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {t("footer.transparencyStores")}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {t("footer.transparencyPrices")}
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span>{t("footer.copyright")}</span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="https://bytekstore.shop/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-indigo-400 hover:text-indigo-300 font-bold transition-colors"
            >
              <span>Powered by bytekstore.shop</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                {t("footer.esportPartner")}
              </span>
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="https://squarealgerie.com/"
              target="_blank"
              rel="noopener noreferrer nofollow"
              className="text-slate-600 hover:text-slate-400 transition-colors"
            >
              squarealgerie.com
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="https://t.me/DzAliexpress0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 font-bold transition-colors inline-flex items-center gap-1"
            >
              <span>Telegram: @DzAliexpress0</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span>{t("footer.forCommunity")}</span>
            <span>🇩🇿</span>
            {/* Global language switcher: the header is out of scope for the
                bilingual pass, so the footer carries it site-wide. */}
            <LocaleSwitcher tone="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
}
