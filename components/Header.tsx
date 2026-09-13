"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import Thumb from "./Thumb";

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

  // Debounced search query
  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults([]);
      setLoading(false);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`/api/products?q=${encodeURIComponent(trimmed)}`);
        if (res.ok) {
          const data = await res.json();
          setResults(data.items || []);
          setIsOpen(true);
          setSelectedIndex(-1);
        }
      } catch (e) {
        console.error("Search error", e);
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Click outside to close search dropdown and category dropdown
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
      setCatDropdownOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
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

  return (
    <header className="bg-[#11111c] sticky top-0 z-40 no-print">
      {/* Top Header Row */}
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand Logo & Name */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0">
          <div className="w-9 h-9 rounded overflow-hidden shrink-0 bg-white">
            <img src="/brand/logo.svg" alt="DZ PartPicker" className="w-9 h-9 object-contain" />
          </div>
          <div className="leading-tight">
            <div className="font-extrabold tracking-tight text-white text-[17px]">
              DZ PartPicker
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
              className="w-full bg-white border border-[#d8d8d8] rounded pl-9 pr-8 py-2 text-sm text-[#191b2a] outline-none placeholder:text-slate-400"
            />
            <svg
              className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none"
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
              <div className="w-4 h-4 absolute right-3 border-2 border-slate-300 border-t-[#2c87c3] rounded-full animate-spin" />
            )}
            {query && !loading && (
              <button
                onClick={() => {
                  setQuery("");
                  setIsOpen(false);
                }}
                aria-label="Effacer la recherche"
                className="absolute right-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded"
              >
                ✕
              </button>
            )}
          </div>

          {/* Search Dropdown Results */}
          {isOpen && (
            <div id="dz-search-results" role="listbox" aria-label="Suggestions de composants" className="absolute left-0 right-0 top-full mt-1 bg-white border border-[#d8d8d8] rounded max-h-96 overflow-y-auto z-50 divide-y divide-slate-100">
              {results.length > 0 ? (
                <>
                  <div className="px-3 py-2 bg-[#f0f0ef] text-[11px] font-bold uppercase tracking-wider text-slate-500 flex justify-between items-center">
                    <span>Résultats ({results.length})</span>
                    <span className="text-[10px] font-semibold text-slate-400">↑↓ pour naviguer • ↵ pour ouvrir</span>
                  </div>
                  {results.map((p, idx) => (
                    <div
                      key={p.id}
                      onClick={() => selectProduct(p.id)}
                      className={`p-2.5 flex items-center gap-3 cursor-pointer ${
                        selectedIndex === idx ? "bg-blue-50" : "hover:bg-slate-50"
                      }`}
                    >
                      <Thumb src={`/p/${p.id}.webp`} alt={p.model} size={40} />
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded bg-slate-100 text-slate-600">
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
                      <span className="pcpp-link text-xs font-semibold shrink-0">Voir →</span>
                    </div>
                  ))}
                </>
              ) : (
                <div className="p-6 text-center text-sm text-slate-500">
                  <div className="mb-1">Aucun composant trouvé pour &quot;{query}&quot;</div>
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
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 pointer-events-none"
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
              className="border border-slate-600 rounded pl-7 pr-7 py-1.5 text-xs bg-[#26293b] text-slate-200 font-medium outline-none cursor-pointer appearance-none"
            >
              {WILAYAS.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <span className="absolute right-2 pointer-events-none text-slate-400 text-[10px]">▾</span>
          </div>

          {/* Pas de comptes utilisateurs — aucun bouton login/register. */}

          {/* Mobile hamburger menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded border border-slate-600 text-slate-200 hover:bg-[#26293b]"
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

      {/* Sub-Navigation Bar (PCPartPicker signature 2nd tier menu) */}
      <div className="border-t border-slate-200 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-600">
          <nav aria-label="Navigation principale" className="flex items-center gap-1 sm:gap-2 py-1.5 overflow-x-auto whitespace-nowrap [scrollbar-width:thin]">
            <Link
              href="/builder"
              aria-current={pathname === "/builder" ? "page" : undefined}
              className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1.5 ${
                pathname === "/builder"
                  ? "text-[#2c87c3] font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              <svg className="w-4 h-4 text-[#2c87c3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="4" y="4" width="16" height="16" rx="2" />
                <path d="M9 9h6v6H9z" />
              </svg>
              <span>System Builder</span>
            </Link>

            {/* Products Dropdown */}
            <div className="relative">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setCatDropdownOpen(!catDropdownOpen);
                }}
                aria-expanded={catDropdownOpen}
                aria-haspopup="menu"
                className={`px-3 py-1.5 rounded transition-colors flex items-center gap-1 ${
                  pathname.startsWith("/category")
                    ? "text-[#2c87c3] font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                <span>Produits</span>
                <span className="text-[10px] text-slate-400">▾</span>
              </button>

              {catDropdownOpen && (
                <div className="absolute left-0 top-full mt-1 w-64 bg-white border border-[#d8d8d8] rounded py-1.5 z-50 divide-y divide-slate-100">
                  <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Catégories PC
                  </div>
                  <div className="py-1">
                    {CATEGORIES.map((cat) => (
                      <Link
                        key={cat.slug}
                        href={`/category/${cat.slug}`}
                        onClick={() => setCatDropdownOpen(false)}
                        className="block px-3 py-1.5 text-xs text-slate-700 hover:bg-blue-50 pcpp-link font-medium"
                      >
                        {cat.label}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <Link
              href="/guides"
              aria-current={pathname.startsWith("/guides") ? "page" : undefined}
              className={`px-3 py-1.5 rounded transition-colors ${
                pathname.startsWith("/guides")
                  ? "text-[#2c87c3] font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Guides d&apos;achat
            </Link>

            <Link
              href="/builds"
              aria-current={pathname.startsWith("/builds") ? "page" : undefined}
              className={`px-3 py-1.5 rounded transition-colors ${
                pathname.startsWith("/builds")
                  ? "text-[#2c87c3] font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Builds communauté
            </Link>
            <Link
              href="/deals"
              aria-current={pathname.startsWith("/deals") ? "page" : undefined}
              className={`px-3 py-1.5 rounded transition-colors ${
                pathname.startsWith("/deals")
                  ? "text-[#2c87c3] font-bold"
                  : "hover:text-slate-900"
              }`}
            >
              Bons plans
            </Link>
          </nav>

          <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-slate-500 py-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Prix live Algérie (DA)</span>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-700 bg-[#11111c] px-4 py-3 space-y-3">
          {/* Mobile Search input */}
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un composant…"
              className="w-full bg-white border border-[#d8d8d8] rounded px-3 py-2 text-sm"
            />
            {query && (
              <div className="mt-2 bg-white border border-[#d8d8d8] rounded p-2 max-h-48 overflow-y-auto divide-y divide-slate-100">
                {results.map((p) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      selectProduct(p.id);
                      setMobileMenuOpen(false);
                    }}
                    className="py-2 text-xs font-semibold text-slate-800 flex justify-between items-center cursor-pointer hover:bg-slate-50 px-1 rounded"
                  >
                    <span>{p.brand} {p.model}</span>
                    <span className="text-emerald-700 tabular-nums font-bold">{p.best ? `${p.best.priceDa.toLocaleString("fr-DZ")} DA` : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
            <Link
              href="/builder"
              onClick={() => setMobileMenuOpen(false)}
              className="btn-blue p-2.5 text-center text-xs"
            >
              System Builder
            </Link>
            <Link
              href="/category/cpu"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-[#26293b] text-slate-200 text-center"
            >
              Tous les Produits
            </Link>
            <Link
              href="/guides"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-[#26293b] text-slate-200 text-center"
            >
              Guides d&apos;achat
            </Link>
            <Link
              href="/builds"
              onClick={() => setMobileMenuOpen(false)}
              className="p-2.5 rounded bg-[#26293b] text-slate-200 text-center"
            >
              Builds Communauté
            </Link>
          </div>

          <div className="pt-2 border-t border-slate-700 flex items-center justify-between text-xs">
            <label className="text-slate-400 font-medium">Wilaya :</label>
            <select
              value={wilaya}
              onChange={(e) => handleWilayaChange(e.target.value)}
              className="border border-slate-600 rounded px-2 py-1 text-xs bg-[#26293b] text-slate-200"
            >
              {WILAYAS.map((w) => (
                <option key={w} value={w}>
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
