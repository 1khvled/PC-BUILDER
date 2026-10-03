"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Thumb from "./Thumb";
import ThemeToggle from "./ThemeToggle";
import LocaleSwitcher from "./LocaleSwitcher";
import AliExpressDealsBanner, { TelegramIcon } from "./AliExpressDealsBanner";
import { useI18n } from "@/lib/i18n/client";
import { categoryLabel } from "@/lib/i18n/categories";
import { formatPrice, localizedHref, stripLocalePrefix } from "@/lib/i18n/config";

interface ProductResult {
  id: string;
  category: string;
  brand: string;
  model: string;
  best?: {
    priceDa: number;
    store: string;
    wilaya: string;
  } | null;
}

// Wilaya codes and names are proper nouns: identical in both languages. Only the
// "all Algeria" aggregate entry is localized (see `allAlgeria` below).
const WILAYA_CODES = [
  "16 - Alger",
  "19 - Sétif",
  "31 - Oran",
  "25 - Constantine",
  "09 - Blida",
  "23 - Annaba",
  "15 - Tizi Ouzou",
  "05 - Batna",
  "17 - Djelfa",
  "35 - Boumerdès",
  "13 - Tlemcen",
  "06 - Béjaïa",
];

const ALGERIA_WILAYA_COUNT = 58;

const CATEGORIES = [
  { slug: "cpu", label: "Processeurs (CPU)" },
  { slug: "cooler", label: "Refroidisseurs (Cooler)" },
  { slug: "motherboard", label: "Cartes Mères" },
  { slug: "ram", label: "Mémoire Vive (RAM)" },
  { slug: "ssd", label: "Stockage (SSD / NVMe)" },
  { slug: "gpu", label: "Cartes Graphiques (GPU)" },
  { slug: "psu", label: "Alimentations (PSU)" },
  { slug: "case", label: "Boîtiers PC" },
  { slug: "monitor", label: "Écrans Gaming" },
];

function CatIcon({ slug, className = "w-4 h-4" }: { slug: string; className?: string }) {
  switch (slug) {
    case "cpu":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
    case "cooler":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 9.5V3M14.5 12H21M12 14.5V21M9.5 12H3" />
        </svg>
      );
    case "motherboard":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="4" height="4" />
          <path d="M15 7h2M15 10h2M7 15h10M7 18h5" />
        </svg>
      );
    case "ram":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="10" rx="1" />
          <path d="M6 17v2M10 17v2M14 17v2M18 17v2M6 11h2M11 11h2M16 11h2" />
        </svg>
      );
    case "ssd":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M7 9h10M7 12h4M16 15h1" />
        </svg>
      );
    case "gpu":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="8.5" cy="12" r="2.5" />
          <circle cx="15.5" cy="12" r="2.5" />
          <path d="M2 10h2M2 14h2M6 18v2M10 18v2" />
        </svg>
      );
    case "case":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <path d="M9 11h6M9 14h6M9 17h6" />
        </svg>
      );
    case "psu":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="10" cy="12" r="3.5" />
          <path d="M16 8h2M16 12h2M16 16h2" />
        </svg>
      );
    case "monitor":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    case "printer":
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      );
    default:
      return (
        <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      );
  }
}

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  // The header is rendered by the ROOT layout, i.e. outside the /en provider, so
  // useI18n() resolves the locale from the pre-paint `data-locale` attribute that
  // app/fr/layout.tsx writes. Server HTML stays French (matching the root
  // <html lang>), then the chrome swaps to English right after mount.
  const { locale, t } = useI18n();

  const allAlgeria = t("header.allAlgeria", { count: ALGERIA_WILAYA_COUNT });
  const wilayas = [allAlgeria, ...WILAYA_CODES];

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wilaya, setWilaya] = useState(allAlgeria);
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  // Mirror of catDropdownOpen, readable from the mouseenter handler without
  // re-binding the listener every time the menu opens or closes.
  const catOpenRef = useRef(false);

  // Load saved wilaya preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dz_wilaya_pref");
      if (saved) setWilaya(saved);
    } catch {
      /* ignore */
    }
  }, []);

  // The "All Algeria" label is localized, so a stored selection of it has to be
  // re-pointed at the new locale wording instead of showing the stale one.
  useEffect(() => {
    setWilaya((current) => {
      const saved = (() => {
        try {
          return localStorage.getItem("dz_wilaya_pref");
        } catch {
          return null;
        }
      })();
      const isAggregate =
        !saved ||
        saved.startsWith("Toute l''Alg") ||
        saved.startsWith("All Algeria") ||
        saved === allAlgeria;
      return isAggregate ? allAlgeria : saved;
    });
  }, [locale, allAlgeria]);

  const handleWilayaChange = (val: string) => {
    setWilaya(val);
    try {
      localStorage.setItem("dz_wilaya_pref", val);
    } catch {
      /* ignore */
    }
  };

  // The header is rendered by the root layout, so it has no locale prop: the
  // locale comes from `data-locale` (see useI18n). Every internal link therefore
  // has to go through `href()` for the same reason — the search used to push
  // "/product/<id>" literally, which dropped a French visitor on the English
  // twin of the page they searched for.
  const href = (path: string) => localizedHref(path, locale);
  // Active-state helpers that ignore the locale prefix, so /fr/builder lights up
  // the same tab as /builder did.
  const isActive = (path: string) => stripLocalePrefix(pathname || "/") === stripLocalePrefix(path);
  const isSection = (path: string) => stripLocalePrefix(pathname || "/").startsWith(path);

// In-memory instant search cache (0ms keystroke responses)
const headerSearchCache = new Map<string, ProductResult[]>();

  // Debounced search query with instant memory caching
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    const lower = trimmed.toLowerCase();
    if (headerSearchCache.has(lower)) {
      setResults(headerSearchCache.get(lower)!);
      setIsOpen(true);
      setSelectedIndex(-1);
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          const items = data.items || [];
          headerSearchCache.set(lower, items);
          setResults(items);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    }, 150);

    return () => clearTimeout(timer);
  }, [query]);

  // Close menus whenever the route changes (search nav, back/forward, logo…)
  useEffect(() => {
    setCatDropdownOpen(false);
    setMobileMenuOpen(false);
    setIsOpen(false);
  }, [pathname]);

  // Click outside to close search dropdown and category dropdown.
  // NOTE: the category check must be containment-scoped. The old code closed
  // the menu on EVERY mousedown — including mousedowns inside the open menu —
  // which unmounted the category links before their click event could fire,
  // making them unclickable, and broke toggle-to-close on the button itself
  // (mousedown closed, then click re-opened).
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setCatDropdownOpen(false);
        setIsOpen(false);
        // The drawer is a disclosure, not a modal: it has to close on Escape too,
        // otherwise a keyboard user is left inside it with no way out.
        setMobileMenuOpen(false);
      }
      // "/" focuses search from anywhere, the convention on shopping and docs
      // sites. Skipped while typing so it still types a literal slash.
      if (
        e.key === "/" &&
        !mobileMenuOpen &&
        !(e.target instanceof HTMLElement &&
          (e.target.tagName === "INPUT" ||
            e.target.tagName === "TEXTAREA" ||
            e.target.tagName === "SELECT" ||
            e.target.isContentEditable))
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, [mobileMenuOpen]);

  // Distinguishes "pinned at the top" from "scrolled over content", so the
  // header only grows a shadow once there is actually something behind it.
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Keep the hover-traverse mirror in sync, and close the menu when keyboard
  // focus leaves it (click-outside alone never fires for tab navigation).
  useEffect(() => {
    catOpenRef.current = catDropdownOpen;
    if (!catDropdownOpen) return;
    const onFocusOut = (e: FocusEvent) => {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setCatDropdownOpen(false);
      }
    };
    document.addEventListener("focusout", onFocusOut);
    return () => document.removeEventListener("focusout", onFocusOut);
  }, [catDropdownOpen]);

  // Keyboard navigation for search dropdown
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const selected = results[selectedIndex];
      if (selected) {
        router.push(href(`/product/${selected.id}`));
        setIsOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectProduct = (id: string) => {
    router.push(href(`/product/${id}`));
    setIsOpen(false);
    setQuery("");
  };

  const navLinkClass = (active: boolean) =>
    `relative px-3.5 py-2.5 rounded-lg transition-colors flex items-center gap-1.5 min-h-[40px] ${
      active
        ? "text-[#2c87c3] font-bold bg-blue-50"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <>
      {/* Keyboard-only shortcut past the nav. Hidden until focused, then it
          slides in — without it, tabbing to the search means 8 stops. */}
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[70] focus:rounded-lg focus:bg-[#2c87c3] focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-white"
      >
        {t("header.skipToContent")}
      </a>
      <header
        className={`sticky top-0 z-40 no-print transition-shadow duration-200 ${
          scrolled ? "shadow-[0_6px_24px_-8px_rgba(17,17,28,0.35)]" : ""
        }`}
      >
        {/* Top Announcement Bar — AliExpress Telegram Channel */}
        <AliExpressDealsBanner variant="topbar" locale={locale} />

      {/* Top Header Row — navy glass bar */}
      <div className="bg-[#11111c] border-b border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
          {/* Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="h-10 px-3 py-1.5 rounded-xl bg-[#08090f] border border-blue-500/40 ring-1 ring-cyan-500/20 shadow-[0_0_15px_rgba(0,140,255,0.25)] flex items-center justify-center transition-all group-hover:scale-105 group-hover:border-cyan-400 group-hover:shadow-[0_0_22px_rgba(0,212,255,0.4)]">
              <img src="/brand/logo.webp" alt="DZ PartPicker" className="h-6 w-auto object-contain" />
            </div>
            <div className="leading-tight">
              <div className="font-black tracking-tight text-white text-[17px] flex items-center gap-1.5">
                <span>DZ PartPicker</span>
              </div>
              <div className="text-[11px] text-slate-400 -mt-0.5 hidden sm:block">
                {t("header.tagline")}
              </div>
            </div>
          </Link>

          {/* Live Search Box (Client-side debounced with dropdown) */}
          <div ref={searchContainerRef} className="relative flex-1 max-w-lg mx-2 hidden md:block">
            <div className="relative flex items-center" role="search">
              <input
                ref={inputRef}
                type="text"
                role="combobox"
                aria-expanded={isOpen && results.length > 0}
                aria-controls="dz-search-results"
                aria-label={t("search.aria")}
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder={t("search.placeholder")}
                className="w-full bg-white border border-white/20 rounded-full pl-10 pr-9 py-2 text-sm text-[#191b2a] outline-none placeholder:text-slate-400 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-shadow focus:border-[#2c87c3] focus:shadow-[0_0_0_3px_rgba(44,135,195,0.25)]"
              />
              <svg
                className="w-4 h-4 text-slate-400 absolute left-3.5 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              {loading && (
                <div className="w-4 h-4 absolute right-3.5 border-2 border-slate-300 border-t-[#2c87c3] rounded-full animate-spin" />
              )}
              {query && !loading && (
                <button
                  onClick={() => {
                    setQuery("");
                    setIsOpen(false);
                  }}
                  aria-label={t("search.clear")}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-2 rounded-full"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {isOpen && (
              <div id="dz-search-results" role="listbox" aria-label={t("common.products")} className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200/80 rounded-2xl max-h-96 overflow-y-auto z-50 divide-y divide-slate-100 shadow-dropdown animate-modal-pop">
                {results.length > 0 ? (
                  <>
                    <div className="px-4 py-2.5 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center rounded-t-2xl">
                      <span>{t("search.results", { count: results.length })}</span>
                      <span className="text-[10px] font-semibold text-slate-400">{t("search.keyboardHint")}</span>
                    </div>
                    {results.map((p, idx) => (
                      <div
                        key={p.id}
                        onClick={() => selectProduct(p.id)}
                        className={`p-3 flex items-center gap-3 cursor-pointer transition-colors ${
                          selectedIndex === idx ? "bg-blue-50" : "hover:bg-slate-50"
                        }`}
                      >
                        <Thumb src={`/p/${p.id}.webp`} alt={p.model} size={44} />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-md bg-blue-50 text-[#2c87c3] border border-blue-100">
                              {p.category}
                            </span>
                            <span className="font-semibold text-sm text-slate-900 truncate">
                              {p.brand} {p.model}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 mt-0.5">
                            {p.best ? (
                              <span>
                                {t("common.from")} <b className="text-emerald-700 font-semibold">{formatPrice(p.best.priceDa, locale)}</b> {t("common.atStore", { store: p.best.store })} ({p.best.wilaya})
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">{t("search.viewProduct")}</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[#2c87c3] text-xs font-semibold shrink-0">{t("search.viewLink")}</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="mb-1 font-semibold text-slate-700">{t("search.empty", { query })}</div>
                    <div className="text-xs text-slate-400">{t("search.emptyHint")}</div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right Actions: Wilaya selector */}
          <div className="flex items-center gap-2.5 text-sm shrink-0">
            {/* Wilaya selector */}
            <div className="relative hidden lg:flex items-center">
              <svg
                className="w-3.5 h-3.5 text-slate-400 absolute left-3 pointer-events-none"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <select
                value={wilaya}
                onChange={(e) => handleWilayaChange(e.target.value)}
                aria-label={t("header.wilayaLabel")}
                className="border border-white/15 rounded-full pl-8 pr-8 py-1.5 text-xs bg-white/10 hover:bg-white/15 text-slate-100 font-medium outline-none cursor-pointer appearance-none transition-colors min-h-[32px]"
              >
                {wilayas.map((w) => (
                  <option key={w} value={w} className="text-slate-900">
                    {w}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 pointer-events-none text-slate-400 text-[10px]">▾</span>
            </div>

            {/* Pas de comptes utilisateurs — aucun bouton login/register. */}

            {/* Light / dark theme switch */}
            <LocaleSwitcher tone="dark" />
            <ThemeToggle />
            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 transition-colors min-h-[40px] min-w-[40px] inline-flex items-center justify-center"
              aria-label={t("header.menu")}
              aria-expanded={mobileMenuOpen}
              aria-controls="dz-mobile-drawer"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Sub-Navigation Bar (PCPartPicker signature 2nd tier menu) */}
      <div className="hidden sm:block border-b border-slate-200/80 bg-white relative z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
          {/* NOTE: deliberately no overflow-x-auto here. A non-visible
              overflow-x forces overflow-y to auto as well, which turns this nav
              into a ~40px-tall clip box; the "Produits" panel is 421px and was
              being cut off entirely (it opened, but nothing was ever painted).
              Links wrap onto a second row on narrow screens instead. */}
          <nav aria-label={t("nav.main")} className="flex flex-wrap items-center gap-1 sm:gap-1.5 py-1.5 -mx-4 px-4 sm:mx-0 sm:px-0 touch-manipulation">
            <Link
              href={href("/builder")}
              aria-current={isActive("/builder") ? "page" : undefined}
              className={navLinkClass(isActive("/builder"))}
            >
              <svg className="w-4 h-4 text-[#2c87c3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
              <span>{t("common.builder")}</span>
            </Link>

            {/* Products Dropdown

                Click is the single source of truth for opening. Previously this
                also opened on onMouseEnter while the button toggled on click,
                so on a desktop mouse the hover opened the menu and the very
                next click toggled it back shut — clicking could never leave it
                open. Hover now only *traverses* an already-open menu (mouse
                users can slide across to the submenu instead of arrowing),
                and touch/keyboard get the same click-to-open behaviour. */}
            <div
              className="relative"
              ref={catDropdownRef}
              onMouseEnter={() => {
                if (catOpenRef.current) setCatDropdownOpen(true);
              }}
              onMouseLeave={() => setCatDropdownOpen(false)}
            >
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setCatDropdownOpen((v) => !v);
                }}
                aria-expanded={catDropdownOpen}
                aria-haspopup="menu"
                aria-controls="dz-cat-menu"
                className={navLinkClass(isSection("/category"))}
              >
                <span>{t("header.products")}</span>
                <span className={`text-[10px] text-slate-400 transition-transform duration-200 ${catDropdownOpen ? "rotate-180" : ""}`}>▾</span>
              </button>

              {catDropdownOpen && (
                <div
                  id="dz-cat-menu"
                  role="menu"
                  className="absolute left-0 top-full pt-1.5 w-72 z-[100] animate-modal-pop"
                >
                  <div className="bg-white border border-slate-200/80 rounded-2xl shadow-dropdown overflow-hidden">
                    <div className="px-4 py-2.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50/80 border-b border-slate-100">
                      {t("header.productCategories", { count: CATEGORIES.length })}
                    </div>
                    <div className="py-1.5">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          role="menuitem"
                          href={href(`/category/${cat.slug}`)}
                          onClick={() => setCatDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2c87c3] font-medium transition-colors group/item"
                        >
                          <span className="w-6 h-6 rounded-md bg-slate-100 group-hover/item:bg-[#2c87c3] group-hover/item:text-white text-slate-500 flex items-center justify-center transition-colors shrink-0">
                            <CatIcon slug={cat.slug} className="w-3.5 h-3.5" />
                          </span>
                          <span className="flex-1">{categoryLabel(cat.slug, t)}</span>
                          <span className="text-[10px] text-slate-300 group-hover/item:text-[#2c87c3] group-hover/item:translate-x-0.5 transition-transform">→</span>
                        </Link>
                      ))}
                    </div>
                    <div className="border-t border-slate-100 pt-1 pb-1">
                      <div className="px-4 py-1.5 text-[10px] font-extrabold text-slate-400 uppercase tracking-widest bg-slate-50/60">
                        {t("nav.sideProducts")}
                      </div>
                      <Link
                        role="menuitem"
                        href={href("/category/printer")}
                        onClick={() => setCatDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2c87c3] font-medium transition-colors group/item"
                      >
                        <span className="w-6 h-6 rounded-md bg-slate-100 group-hover/item:bg-[#2c87c3] group-hover/item:text-white text-slate-500 flex items-center justify-center transition-colors shrink-0">
                          <CatIcon slug="printer" className="w-3.5 h-3.5" />
                        </span>
                        <span className="flex-1">{categoryLabel("printer", t)}</span>
                        <span className="text-[10px] text-slate-300 group-hover/item:text-[#2c87c3] group-hover/item:translate-x-0.5 transition-transform">→</span>
                      </Link>
                    </div>
                    <div className="border-t border-slate-100 pt-1 pb-1 bg-indigo-50/20">
                      <div className="px-4 py-1.5 text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest bg-indigo-50/60 flex items-center justify-between">
                        <span>{t("nav.esportPeripherals")}</span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-700 font-bold border border-indigo-500/25">
                          {t("nav.partnerStore")}
                        </span>
                      </div>
                      <a
                        role="menuitem"
                        href="https://bytekstore.shop/products?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=menu_peripherals"
                        target="_blank"
                        rel="noopener noreferrer sponsored"
                        onClick={() => setCatDropdownOpen(false)}
                        className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 font-medium transition-colors group/item"
                      >
                        <span className="w-6 h-6 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                          🖱️
                        </span>
                        <div className="flex-1 min-w-0">
                          <div className="font-bold text-slate-800 group-hover/item:text-indigo-700">{t("nav.mousesKeyboards")}</div>
                          <div className="text-[10px] text-slate-400 truncate">{t("nav.bytekTagline")}</div>
                        </div>
                        <span className="text-[10px] text-indigo-400 group-hover/item:text-indigo-600 group-hover/item:translate-x-0.5 transition-transform">↗</span>
                      </a>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href={href("/prebuilds")}
              aria-current={isSection("/prebuilds") ? "page" : undefined}
              className={navLinkClass(isSection("/prebuilds"))}
            >
              <span>{t("common.prebuilds")}</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 ml-1">{t("nav.new")}</span>
            </Link>

            <Link
              href={href("/guides")}
              aria-current={isSection("/guides") ? "page" : undefined}
              className={navLinkClass(isSection("/guides"))}
            >
              {t("nav.buyingGuides")}
            </Link>

            <Link
              href={href("/deals")}
              aria-current={isSection("/deals") ? "page" : undefined}
              className={navLinkClass(isSection("/deals"))}
            >
              {t("common.deals")}
            </Link>
            <Link
              href={href("/drops")}
              aria-current={isSection("/drops") ? "page" : undefined}
              className={navLinkClass(isSection("/drops"))}
            >
              {t("drops.h1")}
            </Link>
            <Link
              href={href("/benchmarks")}
              aria-current={isSection("/benchmarks") ? "page" : undefined}
              className={navLinkClass(isSection("/benchmarks"))}
            >
              {t("nav.benchmarks")}
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-3 text-xs font-medium py-1">
            <a
              href="https://bytekstore.shop/products?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=subnav_peripherals"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 text-xs font-bold transition-all shadow-2xs group shrink-0"
              title={t("bytek.peripheralsTitle")}
            >
              <span>🖱️</span>
              <span>{t("nav.bytekPill")}</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-indigo-500/15 text-indigo-700 font-mono">
                Bytek
              </span>
            </a>
            <a
              href="https://t.me/DzAliexpress0"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gradient-to-r from-sky-500/10 via-sky-500/15 to-blue-500/10 hover:from-sky-500/20 hover:to-blue-500/20 text-[#0088cc] border border-sky-400/30 text-xs font-bold transition-all shadow-2xs group shrink-0"
              title={t("aliexpress.bannerTitle")}
            >
              <TelegramIcon className="w-3.5 h-3.5 fill-current" />
              <span>{t("aliexpress.navPill")}</span>
              <span className="text-[9px] font-black uppercase px-1 py-0.2 rounded bg-amber-400/20 text-amber-600 font-mono">
                🔥 {t("aliexpress.navBadge")}
              </span>
            </a>
            <div className="flex items-center gap-2 text-slate-500">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
              </span>
              <span>{t("header.livePrices")}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Drawer

          Reached only below `sm`, where the sub-nav bar is hidden. Everything in
          it is a real <Link> (the previous version used click-handling <div>s,
          so none of it was reachable by keyboard) and every tile is at least a
          44px touch target, because this is the primary navigation on a phone. */}
      {mobileMenuOpen && (
        <div
          id="dz-mobile-drawer"
          className="md:hidden border-b border-white/10 bg-[#11111c] px-4 py-4 space-y-4 animate-backdrop-fade"
        >
          {/* Mobile Search input */}
          <div className="relative" role="search">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label={t("search.aria")}
              placeholder={t("search.placeholder")}
              className="w-full bg-white border border-white/20 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#2c87c3] focus:shadow-[0_0_0_3px_rgba(44,135,195,0.25)]"
            />
            {query && (
              <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-2 max-h-52 overflow-y-auto divide-y divide-slate-100 shadow-dropdown">
                {results.length === 0 ? (
                  <div className="px-2 py-3 text-center text-xs text-slate-500">
                    <div className="font-semibold text-slate-700">{t("search.empty", { query })}</div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{t("search.emptyHint")}</div>
                  </div>
                ) : (
                  results.map((p) => (
                    <Link
                      key={p.id}
                      href={href(`/product/${p.id}`)}
                      onClick={() => setMobileMenuOpen(false)}
                      className="py-2.5 text-xs font-semibold text-slate-800 flex justify-between items-center gap-2 hover:bg-slate-50 px-2 rounded-lg min-h-[44px] focus-visible:bg-slate-100"
                    >
                      <span className="truncate">{p.brand} {p.model}</span>
                      <span className="text-emerald-700 tabular-nums font-bold shrink-0">
                        {p.best ? formatPrice(p.best.priceDa, locale) : ""}
                      </span>
                    </Link>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
            <Link
              href={href("/builder")}
              aria-current={isSection("/builder") ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className="btn-blue py-3 px-2 text-center text-xs min-h-[44px] flex items-center justify-center"
            >
              {t("common.builder")}
            </Link>
            <Link
              href={href("/prebuilds")}
              aria-current={isSection("/prebuilds") ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-3 px-2 rounded-lg text-center transition-colors border font-bold min-h-[44px] flex items-center justify-center ${
                isSection("/prebuilds")
                  ? "bg-emerald-600/40 text-white border-emerald-400/50"
                  : "bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border-emerald-500/30"
              }`}
            >
              {t("common.prebuilds")}
            </Link>
            <Link
              href={href("/guides")}
              aria-current={isSection("/guides") ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-3 px-2 rounded-lg text-center transition-colors border min-h-[44px] flex items-center justify-center ${
                isSection("/guides")
                  ? "bg-white/20 text-white border-white/25"
                  : "bg-white/10 hover:bg-white/15 text-slate-200 border-white/10"
              }`}
            >
              {t("nav.buyingGuides")}
            </Link>
            <Link
              href={href("/deals")}
              aria-current={isSection("/deals") ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-3 px-2 rounded-lg text-center transition-colors border min-h-[44px] flex items-center justify-center ${
                isSection("/deals")
                  ? "bg-white/20 text-white border-white/25"
                  : "bg-white/10 hover:bg-white/15 text-slate-200 border-white/10"
              }`}
            >
              {t("common.deals")}
            </Link>
            <Link
              href={href("/drops")}
              aria-current={isSection("/drops") ? "page" : undefined}
              onClick={() => setMobileMenuOpen(false)}
              className={`py-3 px-2 rounded-lg text-center transition-colors border min-h-[44px] flex items-center justify-center ${
                isSection("/drops")
                  ? "bg-white/20 text-white border-white/25"
                  : "bg-white/10 hover:bg-white/15 text-slate-200 border-white/10"
              }`}
            >
              {t("drops.h1")}
            </Link>
            <Link
              href={href("/benchmarks")}
              aria-current={isSection("/benchmarks") ? "page" : undefined}
              className={navLinkClass(isSection("/benchmarks"))}
            >
              {t("nav.benchmarks")}
            </Link>
          </div>

          {/* Mobile All Categories Grid */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              {t("nav.componentsPc")}
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-medium">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={href(`/category/${cat.slug}`)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2.5 rounded-lg bg-white/[0.08] hover:bg-[#2c87c3] text-slate-300 hover:text-white transition-colors text-center border border-white/10 flex flex-col items-center justify-center gap-1.5 min-h-[60px]"
                >
                  <span className="w-5 h-5 text-slate-400 flex items-center justify-center" aria-hidden="true">
                    <CatIcon slug={cat.slug} className="w-4 h-4" />
                  </span>
                  <span className="leading-tight">{categoryLabel(cat.slug, t)}</span>
                </Link>
              ))}
              <Link
                key="printer"
                href={href("/category/printer")}
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2.5 rounded-lg bg-white/[0.08] hover:bg-[#2c87c3] text-slate-300 hover:text-white transition-colors text-center border border-white/10 flex flex-col items-center justify-center gap-1.5 min-h-[60px]"
              >
                <span className="w-5 h-5 text-slate-400 flex items-center justify-center" aria-hidden="true">
                  <CatIcon slug="printer" className="w-4 h-4" />
                </span>
                <span className="leading-tight">{categoryLabel("printer", t)}</span>
              </Link>
              <a
                href="https://bytekstore.shop/products?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=mobile_drawer_peripherals"
                target="_blank"
                rel="noopener noreferrer sponsored"
                onClick={() => setMobileMenuOpen(false)}
                className="px-2 py-2.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/90 text-indigo-200 hover:text-white transition-colors text-center border border-indigo-500/40 flex flex-col items-center justify-center gap-1 min-h-[60px]"
              >
                <span className="text-base" aria-hidden="true">🖱️</span>
                <span className="leading-tight text-[10px] font-bold">{t("nav.mousesKeyboards")}</span>
              </a>
            </div>
          </div>

          {/* Mobile Telegram Promo Card */}
          <div className="pt-3 border-t border-white/10">
            <a
              href="https://t.me/DzAliexpress0"
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-xl bg-gradient-to-r from-[#0088cc]/25 via-[#0077b5]/35 to-[#0088cc]/15 border border-[#0088cc]/40 text-white hover:border-sky-400 transition-all"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0088cc] flex items-center justify-center text-white shrink-0 shadow-xs">
                  <TelegramIcon className="w-4 h-4 fill-white" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-white truncate">{t("aliexpress.mobileTitle")}</span>
                    <span className="text-[9px] px-1 py-0.2 rounded bg-amber-400 text-slate-900 font-extrabold uppercase font-mono">🔥</span>
                  </div>
                  <p className="text-[11px] text-slate-300 truncate mt-0.5">{t("aliexpress.mobileDesc")}</p>
                </div>
                <span className="text-xs text-sky-300 font-bold shrink-0">→</span>
              </div>
            </a>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3 text-xs">
            <label htmlFor="dz-drawer-wilaya" className="text-slate-400 font-medium shrink-0">
              {t("common.wilaya")}
            </label>
            <select
              id="dz-drawer-wilaya"
              value={wilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className="flex-1 min-w-0 border border-white/15 rounded-lg px-2.5 py-2 text-xs bg-white/10 text-slate-200 min-h-[40px]"
            >
              {wilayas.map((w) => (
                <option key={w} value={w} className="text-slate-900">
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}      </header>
    </>
  );
}