"use client";

import Link from "next/link";
import { useMemo, type ReactNode } from "react";
import { localizedHref, type Locale } from "@/lib/i18n/config";
import { useLocale } from "@/lib/i18n/client";
import { makeT, type TKey } from "@/lib/i18n/runtime";
import LocaleSwitcher from "./LocaleSwitcher";
import { TelegramIcon } from "./AliExpressDealsBanner";

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
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <rect x="2" y="5" width="20" height="14" rx="2" />
          <line x1="2" y1="10" x2="22" y2="10" />
        </svg>
      ),
    },
    {
      titleKey: "footer.trust2Title",
      textKey: "footer.trust2Text",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M1 3h15v13H1z" />
          <path d="M16 8h4l3 3v5h-7V8z" />
          <circle cx="5.5" cy="18.5" r="2.5" />
          <circle cx="18.5" cy="18.5" r="2.5" />
        </svg>
      ),
    },
    {
      titleKey: "footer.trust3Title",
      textKey: "footer.trust3Text",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ),
    },
    {
      titleKey: "footer.trust4Title",
      textKey: "footer.trust4Text",
      icon: (
        <svg className="w-4.5 h-4.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
          <circle cx="12" cy="12" r="10" />
          <path d="M12 6v6l4 2" />
        </svg>
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
    <footer className="relative bg-[#0c0e17] text-slate-300 text-xs mt-12 no-print overflow-hidden">
      {/* Top subtle accent border */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#2c87c3]/40 to-transparent" aria-hidden="true" />

      {/* Trust & Guarantees Strip */}
      <div className="border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {trustItems.map((item) => (
            <div
              key={item.titleKey}
              className="group flex items-start gap-3 p-3.5 rounded-xl bg-white/[0.02] border border-white/[0.06] hover:border-white/15 hover:bg-white/[0.04] transition-all"
            >
              <div className="w-8.5 h-8.5 rounded-lg bg-white/[0.05] border border-white/[0.08] text-slate-300 group-hover:text-cyan-400 group-hover:border-cyan-400/30 group-hover:bg-cyan-500/10 flex items-center justify-center shrink-0 transition-all mt-0.5">
                {item.icon}
              </div>
              <div className="min-w-0">
                <div className="text-white font-semibold text-xs tracking-tight leading-snug">{t(item.titleKey)}</div>
                <div className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{t(item.textKey)}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* AliExpress Telegram Community Callout Strip */}
      <div className="border-b border-white/[0.06] bg-gradient-to-r from-[#0a0d17] via-[#101426] to-[#0a0d17]">
        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3.5">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-sky-500/10 border border-sky-400/20 flex items-center justify-center text-[#29b6f6] shrink-0">
              <TelegramIcon className="w-4.5 h-4.5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-xs sm:text-sm tracking-tight">{t("footer.telegramTitle")}</span>
                <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-sky-400/15 text-sky-300 border border-sky-400/30">
                  {t("footer.telegramBadge")}
                </span>
              </div>
              <p className="text-slate-400 text-[11px] mt-0.5 max-w-2xl leading-relaxed">
                {t("footer.telegramDesc")}
              </p>
            </div>
          </div>
          <a
            href="https://t.me/DzAliexpress0"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-4 py-2 rounded-lg bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0"
          >
            <span>{t("footer.telegramCta")}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 pt-10 pb-[calc(3.5rem+env(safe-area-inset-bottom,0px)+1rem)] sm:pb-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Col */}
          <div className="lg:col-span-2 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="h-8.5 px-2 py-1 rounded-lg bg-[#08090f] border border-blue-500/30 ring-1 ring-cyan-500/15 flex items-center justify-center">
                <img src="/brand/logo.webp" alt="DZ PartPicker" className="h-4.5 w-auto object-contain" />
              </div>
              <span className="text-white font-bold text-base tracking-tight">DZ PartPicker</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              {t("footer.about")}
            </p>
            <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              <span>{t("footer.badgeSources")} • {t("footer.badgeLive")}</span>
            </div>
          </div>

          {/* Outils Col */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-[11px] uppercase tracking-wider">
              {t("nav.toolsConfig")}
            </h3>
            <ul className="space-y-2">
              <li>
                <Link href={href("/builder")} className="text-slate-400 hover:text-white transition-colors inline-block text-xs">
                  {t("footer.linkBuilder")}
                </Link>
              </li>
              <li>
                <Link href={href("/guides")} className="text-slate-400 hover:text-white transition-colors inline-block text-xs">
                  {t("footer.linkGuides")}
                </Link>
              </li>
              <li>
                <Link href={href("/deals")} className="text-slate-400 hover:text-white transition-colors inline-block text-xs">
                  {t("footer.linkDeals")}
                </Link>
              </li>
              <li>
                <Link href={href("/category/cpu")} className="text-slate-400 hover:text-white transition-colors inline-block text-xs">
                  {t("footer.linkCatalog")}
                </Link>
              </li>
              <li>
                <a
                  href="https://t.me/DzAliexpress0"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sky-400 hover:text-sky-300 transition-colors inline-flex items-center gap-1.5 text-xs font-medium"
                >
                  <TelegramIcon className="w-3.5 h-3.5 fill-current" />
                  <span>{t("footer.linkTelegram")}</span>
                  <span className="text-[10px] opacity-70" aria-hidden="true">↗</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Composants Col */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-[11px] uppercase tracking-wider">
              {t("nav.componentsPc")}
            </h3>
            <ul className="space-y-1.5">
              {componentLinks.map((c) => (
                <li key={c.href}>
                  <Link href={href(c.href)} className="text-slate-400 hover:text-white transition-colors inline-block text-xs">
                    {t(c.key)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Transparence Col */}
          <div className="space-y-3">
            <h3 className="text-white font-bold text-[11px] uppercase tracking-wider">
              {t("nav.transparency")}
            </h3>
            <div className="space-y-2 text-[11px] text-slate-400 leading-relaxed">
              <p>{t("footer.transparencyStores")}</p>
              <p>{t("footer.transparencyPrices")}</p>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-10 pt-5 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
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
              <span className="text-[9.5px] px-1.5 py-0.5 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-300">
                {t("footer.esportPartner")}
              </span>
            </a>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <a
              href="https://t.me/DzAliexpress0"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors inline-flex items-center gap-1"
            >
              <TelegramIcon className="w-3 h-3 fill-current" />
              <span>@DzAliexpress0</span>
            </a>
          </div>
          <div className="flex items-center gap-3">
            <span>{t("footer.forCommunity")}</span>
            <span>🇩🇿</span>
            <LocaleSwitcher tone="dark" />
          </div>
        </div>
      </div>
    </footer>
  );
}
