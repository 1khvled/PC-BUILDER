"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Thumb from "./Thumb";
import ThemeToggle from "./ThemeToggle";

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

const WILAYAS = [
  "Toute l'Algérie (58)",
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

  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wilaya, setWilaya] = useState("Toute l'Algérie (58)");
  const [catDropdownOpen, setCatDropdownOpen] = useState(false);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load saved wilaya preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("dz_wilaya_pref");
      if (saved) setWilaya(saved);
    } catch {
      /* ignore */
    }
  }, []);

  const handleWilayaChange = (val: string) => {
    setWilaya(val);
    try {
      localStorage.setItem("dz_wilaya_pref", val);
    } catch {
      /* ignore */
    }
  };

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
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKey);
    };
  }, []);

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
        router.push(`/product/${selected.id}`);
        setIsOpen(false);
        setQuery("");
      }
    } else if (e.key === "Escape") {
      setIsOpen(false);
    }
  };

  const selectProduct = (id: string) => {
    router.push(`/product/${id}`);
    setIsOpen(false);
    setQuery("");
  };

  const navLinkClass = (active: boolean) =>
    `relative px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 ${
      active
        ? "text-[#2c87c3] font-bold bg-blue-50"
        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
    }`;

  return (
    <header className="sticky top-0 z-40 no-print">
      {/* Top Header Row — navy glass bar */}
      <div className="bg-[#11111c]/95 backdrop-blur-md border-b border-white/[0.06]">
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
                Pick parts • Build your PC • Compare in DA
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
                aria-label="Rechercher un composant (ex : RTX 4060, Ryzen 5 5600)"
                autoComplete="off"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim() && setIsOpen(true)}
                onKeyDown={handleKeyDown}
                placeholder="Rechercher RTX 4060, Ryzen 5 5600, B550, DDR4..."
                className="w-full bg-white/95 border border-white/20 rounded-full pl-10 pr-9 py-2 text-sm text-[#191b2a] outline-none placeholder:text-slate-400 shadow-[0_2px_10px_rgba(0,0,0,0.25)] transition-shadow focus:border-[#2c87c3] focus:shadow-[0_0_0_3px_rgba(44,135,195,0.25)]"
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
                  aria-label="Effacer la recherche"
                  className="absolute right-3 text-slate-400 hover:text-slate-600 p-0.5 rounded-full"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Search Dropdown Results */}
            {isOpen && (
              <div id="dz-search-results" role="listbox" aria-label="Suggestions de composants" className="absolute left-0 right-0 top-full mt-2 bg-white border border-slate-200/80 rounded-2xl max-h-96 overflow-y-auto z-50 divide-y divide-slate-100 shadow-dropdown animate-modal-pop">
                {results.length > 0 ? (
                  <>
                    <div className="px-4 py-2.5 bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center rounded-t-2xl">
                      <span>Résultats ({results.length})</span>
                      <span className="text-[10px] font-semibold text-slate-400">↑↓ pour naviguer • ↵ pour ouvrir</span>
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
                                dès <b className="text-emerald-700 font-semibold">{p.best.priceDa.toLocaleString("fr-DZ")} DA</b> chez {p.best.store} ({p.best.wilaya})
                              </span>
                            ) : (
                              <span className="text-slate-400 italic">Voir la fiche produit</span>
                            )}
                          </div>
                        </div>
                        <span className="text-[#2c87c3] text-xs font-semibold shrink-0">Voir →</span>
                      </div>
                    ))}
                  </>
                ) : (
                  <div className="p-8 text-center text-sm text-slate-500">
                    <div className="text-2xl mb-2">🔍</div>
                    <div className="mb-1 font-semibold text-slate-700">Aucun composant trouvé pour "{query}"</div>
                    <div className="text-xs text-slate-400">Essayez avec une référence (ex: RTX 3060, Ryzen 5, B550)</div>
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
                aria-label="Sélectionner votre wilaya"
                className="border border-white/15 rounded-full pl-8 pr-8 py-1.5 text-xs bg-white/10 hover:bg-white/15 text-slate-100 font-medium outline-none cursor-pointer appearance-none transition-colors"
              >
                {WILAYAS.map((w) => (
                  <option key={w} value={w} className="text-slate-900">
                    {w}
                  </option>
                ))}
              </select>
              <span className="absolute right-3 pointer-events-none text-slate-400 text-[10px]">▾</span>
            </div>

            {/* Pas de comptes utilisateurs — aucun bouton login/register. */}

            {/* Light / dark theme switch */}
            <ThemeToggle />

            {/* Mobile hamburger menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-white/15 text-slate-200 hover:bg-white/10 transition-colors"
              aria-label="Menu"
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
      <div className="border-b border-slate-200/80 bg-white/95 backdrop-blur-md relative z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
          <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-1.5 py-1.5 overflow-x-auto no-scrollbar scroll-smooth whitespace-nowrap -mx-4 px-4 sm:mx-0 sm:px-0 touch-manipulation">
            <Link
              href="/builder"
              aria-current={pathname === "/builder" ? "page" : undefined}
              className={navLinkClass(pathname === "/builder")}
            >
              <svg className="w-4 h-4 text-[#2c87c3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
              <span>System Builder</span>
            </Link>

            {/* Products Dropdown */}
            <div
              className="relative"
              ref={catDropdownRef}
              onMouseEnter={() => setCatDropdownOpen(true)}
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
                className={navLinkClass(pathname.startsWith("/category"))}
              >
                <span>Produits</span>
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
                      Catégories Composants ({CATEGORIES.length})
                    </div>
                    <div className="py-1.5">
                      {CATEGORIES.map((cat) => (
                        <Link
                          key={cat.slug}
                          role="menuitem"
                          href={`/category/${cat.slug}`}
                          onClick={() => setCatDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-xs text-slate-700 hover:bg-blue-50 hover:text-[#2c87c3] font-medium transition-colors group/item"
                        >
                          <span className="w-6 h-6 rounded-md bg-slate-100 group-hover/item:bg-[#2c87c3] group-hover/item:text-white text-slate-500 flex items-center justify-center transition-colors shrink-0">
                            <CatIcon slug={cat.slug} className="w-3.5 h-3.5" />
                          </span>
                          <span className="flex-1">{cat.label}</span>
                          <span className="text-[10px] text-slate-300 group-hover/item:text-[#2c87c3] group-hover/item:translate-x-0.5 transition-transform">→</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/prebuilds"
              aria-current={pathname.startsWith("/prebuilds") ? "page" : undefined}
              className={navLinkClass(pathname.startsWith("/prebuilds"))}
            >
              <span>PC Montés</span>
              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 ml-1">Nouveau</span>
            </Link>

            <Link
              href="/guides"
              aria-current={pathname.startsWith("/guides") ? "page" : undefined}
              className={navLinkClass(pathname.startsWith("/guides"))}
            >
              Guides d'achat
            </Link>

            <Link
              href="/deals"
              aria-current={pathname.startsWith("/deals") ? "page" : undefined}
              className={navLinkClass(pathname.startsWith("/deals"))}
            >
              Bons plans
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 py-1">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            <span>Prix live Algérie (DA)</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-white/10 bg-[#11111c] px-4 py-4 space-y-4 animate-backdrop-fade">
          {/* Mobile Search input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un composant…"
              className="w-full bg-white border border-white/20 rounded-full px-4 py-2.5 text-sm outline-none focus:border-[#2c87c3] focus:shadow-[0_0_0_3px_rgba(44,135,195,0.25)]"
            />
            {query && (
              <div className="mt-2 bg-white border border-slate-200 rounded-2xl p-2 max-h-52 overflow-y-auto divide-y divide-slate-100 shadow-dropdown">
                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      selectProduct(p.id);
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-xs font-semibold text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-2 rounded-lg"
                  >
                    <span>{p.brand} {p.model}</span>
                    <span className="text-emerald-700 tabular-nums font-bold">{p.best ? `${p.best.priceDa.toLocaleString("fr-DZ")} DA` : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold">
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-blue p-2.5 text-center text-xs"
            >
              System Builder
            </Link>
            <Link
              href="/prebuilds"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 text-center transition-colors border border-emerald-500/30 font-bold"
            >
              PC Montés
            </Link>
            <Link
              href="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-center transition-colors border border-white/10"
            >
              Guides d'achat
            </Link>
            <Link
              href="/deals"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 text-center transition-colors border border-white/10"
            >
              Bons plans
            </Link>
          </div>

          {/* Mobile All Categories Grid */}
          <div className="pt-3 border-t border-white/10">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2.5">
              Composants PC
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px] font-medium">
              {CATEGORIES.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/category/${cat.slug}`}
                  onClick={() => setMobileMenuOpen(false)}
                  className="px-2 py-2 rounded-lg bg-white/[0.06] hover:bg-[#2c87c3] text-slate-300 hover:text-white transition-colors truncate text-center border border-white/10 flex flex-col items-center gap-1.5"
                >
                  <span className="w-5 h-5 text-slate-400 flex items-center justify-center">
                    <CatIcon slug={cat.slug} className="w-4 h-4" />
                  </span>
                  {cat.label.replace(/\s*\(.*\)/, "")}
                </Link>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-white/10 flex items-center justify-between text-xs">
            <label className="text-slate-400 font-medium">Wilaya :</label>
            <select
              value={wilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className="border border-white/15 rounded-lg px-2.5 py-1.5 text-xs bg-white/10 text-slate-200"
            >
              {WILAYAS.map((w) => (
                <option key={w} value={w} className="text-slate-900">
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </header>
  );
}
