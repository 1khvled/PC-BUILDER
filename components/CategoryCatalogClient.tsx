"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, PRODUCTS, bestOffer, isRuptured, productImage, type Offer, type Product } from "@/lib/data/products";
import { useOffers } from "@/lib/data/use-offers";
import { LIVE_EXTRA } from "@/lib/data/live";
import { DEFAULT_LOCALE, formatNumber, formatPrice, localizedHref, type Locale } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { makeT, pluralSuffix } from "@/lib/i18n/runtime";
import Thumb from "./Thumb";
import EmptyState from "./EmptyState";
import { CompareToggle, CompareTray } from "./CompareTray";

interface CategoryCatalogClientProps {
  slug: string;
  catLabel: string;
  /** Live offers from the server (Supabase). Falls back to the static bake when omitted. */
  offers?: Offer[];
  /** Live products from the server (Supabase). Falls back to the static bake when omitted. */
  products?: Product[];
  /**
   * UI locale. Passed as a prop by the server page (the route already knows it),
   * which keeps the FIRST paint fully translated — no effect, no flash, no
   * hydration mismatch. Defaults to French for the unprefixed routes.
   */
  locale?: Locale;
}

type SortOption = "price-asc" | "price-desc" | "name-asc" | "offers-desc";

/** Precomputed per-product offer data. See the `productStats` memo. */
interface ProductStats {
  offers: Offer[];
  count: number;
  /** True when at least one offer is not a rupture. */
  inStock: boolean;
  /**
   * The hero offer, i.e. exactly what `bestOffer()` returns - which ranks by
   * STOCK/CONDITION TIER first and price second. It is deliberately NOT simply
   * the cheapest listing: a cheap used or unconfirmed offer must never beat a
   * confirmed new one.
   */
  best: Offer | null;
}

const EMPTY_OFFERS: Offer[] = [];
type ConditionOption = "all" | "new" | "used";

export default function CategoryCatalogClient({ slug, catLabel, offers: serverOffers, products: serverProducts, locale = DEFAULT_LOCALE }: CategoryCatalogClientProps) {
  const staticOffers = useOffers();
  const offers = serverOffers ?? staticOffers;
  const allProducts = serverProducts ?? PRODUCTS;
  const [sort, setSort] = useState<SortOption>("price-asc");
  const [condition, setCondition] = useState<ConditionOption>("all");
  const [store, setStore] = useState<string>("all");
  const [wilaya, setWilaya] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  // --- i18n: dictionary is imported statically, picked at render time --------
  const t = useMemo(() => makeT(locale), [locale]);
  const label = useMemo(() => categoryLabel(slug, t), [slug, t]);
  // Slugs stay in the URL; only the prefix follows the locale.
  const href = (path: string) => localizedHref(path, locale);
  const isBuilderCategory = useMemo(() => CATEGORIES.some((c) => c.slug === slug), [slug]);

  // Load saved viewMode and preferred wilaya from localStorage
  useState(() => {
    if (typeof window === "undefined") return;
    try {
      const savedMode = localStorage.getItem("dz_view_mode");
      if (savedMode === "cards" || savedMode === "table") {
        setViewMode(savedMode);
      }
      const savedW = localStorage.getItem("dz_wilaya_pref");
      // The header persists the LABEL of the "all Algeria" aggregate, and that
      // label is localized, so it reads back differently per language. Only a
      // real wilaya - which always starts with its 2-digit code - may be
      // applied as a filter: treating the aggregate as a wilaya name matched no
      // offer and silently emptied the whole catalogue.
      if (savedW && /^\d{2}\s*-\s*\S/.test(savedW)) {
        const clean = savedW.replace(/^\d+\s*-\s*/, "").trim();
        // check if any offer in catalog has this wilaya
        setWilaya(clean);
      }
    } catch {
      /* ignore */
    }
  });

  const handleViewModeChange = (mode: "cards" | "table") => {
    setViewMode(mode);
    try {
      localStorage.setItem("dz_view_mode", mode);
    } catch {
      /* ignore */
    }
  };

  const rawProducts = useMemo(() => allProducts.filter((p) => p.category === slug), [slug, allProducts]);
  const rawExtras = useMemo(() => LIVE_EXTRA.filter((e) => e.category === slug), [slug]);

  /**
   * Per-product offers, hero offer, offer count and stock flag.
   *
   * Built once per `offers` change and shared by the filter, the sort and both
   * render branches. It exists for performance: the sort comparator used to
   * scan the whole 274-row offer list six times PER COMPARISON (four
   * `offers.filter()` calls plus two `bestOffer()` calls, each of which filters
   * again), and each render branch scanned it once more per product.
   *
   * `best` delegates to `bestOffer()` rather than reimplementing "cheapest":
   * that function ranks by stock/condition TIER before price, so a cheap used
   * or unconfirmed listing must not be able to displace a confirmed new one.
   * The ordering and the rendered output are unchanged.
   */
  const productStats = useMemo(() => {
    const byProduct = new Map<string, Offer[]>();
    for (const o of offers) {
      const list = byProduct.get(o.productId);
      if (list) list.push(o);
      else byProduct.set(o.productId, [o]);
    }
    const stats = new Map<string, ProductStats>();
    for (const p of rawProducts) {
      const list = byProduct.get(p.id);
      if (!list || list.length === 0) {
        stats.set(p.id, { offers: EMPTY_OFFERS, count: 0, inStock: false, best: null });
        continue;
      }
      const best = bestOffer(p.id, offers);
      const inStock = best !== undefined && !isRuptured(best);
      stats.set(p.id, {
        offers: list,
        count: list.length,
        inStock,
        best: best ?? null,
      });
    }
    return stats;
  }, [rawProducts, offers]);

  // Extract unique stores and wilayas that exist in this category's offers and extras
  const availableStores = useMemo(() => {
    const storeSet = new Set<string>();
    const catProductIds = new Set(rawProducts.map((p) => p.id));
    for (const o of offers) {
      if (catProductIds.has(o.productId) && o.store) {
        storeSet.add(o.store);
      }
    }
    for (const e of rawExtras) {
      if (e.store) storeSet.add(e.store);
    }
    return Array.from(storeSet).sort();
  }, [rawProducts, rawExtras, offers]);

  const availableWilayas = useMemo(() => {
    const wSet = new Set<string>();
    const catProductIds = new Set(rawProducts.map((p) => p.id));
    for (const o of offers) {
      if (catProductIds.has(o.productId) && o.wilaya) {
        wSet.add(o.wilaya.trim());
      }
    }
    for (const e of rawExtras) {
      if (e.wilaya) wSet.add(e.wilaya.trim());
    }
    return Array.from(wSet).sort();
  }, [rawProducts, rawExtras, offers]);

  // Filter and sort canonical products
  const filteredProducts = useMemo(() => {
    const list = rawProducts.filter((p) => {
      const st = productStats.get(p.id);
      const pOffers = st?.offers ?? EMPTY_OFFERS;

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const specsStr = Object.values(p.specs).join(" ").toLowerCase();
        const matchesName = `${p.brand} ${p.model}`.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !specsStr.includes(q)) return false;
      }

      // Condition filter
      if (condition !== "all") {
        const hasMatchingCondition = pOffers.some((o) => o.condition === condition);
        if (!hasMatchingCondition) return false;
      }

      // Store filter
      if (store !== "all") {
        const hasMatchingStore = pOffers.some((o) => o.store === store);
        if (!hasMatchingStore) return false;
      }

      // Wilaya filter
      if (wilaya !== "all") {
        const hasMatchingWilaya = pOffers.some((o) => o.wilaya && o.wilaya.toLowerCase().includes(wilaya.toLowerCase()));
        if (!hasMatchingWilaya) return false;
      }

      // Stock filter: if inStockOnly is active, exclude products where all offers are out of stock
      if (inStockOnly && !st?.inStock) return false;

      return true;
    });

    list.sort((a, b) => {
      // In-stock products always sort before entirely out-of-stock products
      const statA = productStats.get(a.id);
      const statB = productStats.get(b.id);
      const inStockA = statA?.inStock ?? false;
      const inStockB = statB?.inStock ?? false;
      if (inStockA !== inStockB) return inStockA ? -1 : 1;

      const bestA = statA?.best?.priceDa ?? Infinity;
      const bestB = statB?.best?.priceDa ?? Infinity;
      const offersA = statA?.count ?? 0;
      const offersB = statB?.count ?? 0;

      if (sort === "price-asc") return bestA - bestB;
      if (sort === "price-desc") return (bestB === Infinity ? -1 : bestB) - (bestA === Infinity ? -1 : bestA);
      if (sort === "name-asc") return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      if (sort === "offers-desc") return offersB - offersA;
      return 0;
    });

    return list;
  }, [rawProducts, search, condition, store, wilaya, sort, productStats]);

  // Filter extras according to toolbar state
  const filteredExtras = useMemo(() => {
    return rawExtras.filter((e) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.store.toLowerCase().includes(q) && !e.wilaya.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (condition !== "all" && e.condition !== condition) return false;
      if (store !== "all" && e.store !== store) return false;
      if (wilaya !== "all" && !e.wilaya.toLowerCase().includes(wilaya.toLowerCase())) return false;
      return true;
    }).sort((a, b) => {
      if (sort === "price-asc") return a.priceDa - b.priceDa;
      if (sort === "price-desc") return b.priceDa - a.priceDa;
      return 0;
    });
  }, [rawExtras, search, condition, store, wilaya, sort]);

  const resetFilters = () => {
    setSort("price-asc");
    setCondition("all");
    setStore("all");
    setWilaya("all");
    setSearch("");
    setInStockOnly(false);
  };

  const isFiltered = search !== "" || condition !== "all" || store !== "all" || wilaya !== "all" || sort !== "price-asc" || inStockOnly;

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {catLabel}
            </h1>
            <span
              className="px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-[#2c87c3] border border-blue-100"
              role="status"
              aria-live="polite"
            >
              {t("category.modelsCounted", { count: filteredProducts.length })}
              {filteredProducts.length !== rawProducts.length && (
                <span className="text-slate-400 font-semibold"> / {rawProducts.length}</span>
              )}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href={href("/builder")}
            className="btn-blue px-4 py-2.5 text-xs sm:text-sm"
          >
            <span>{t("common.openInBuilder")}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      {/* Filter / Sort Interactive Toolbar */}
      <div className="panel p-4 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search inside category */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("category.searchPlaceholder", { cat: label })}
              aria-label={t("category.searchPlaceholder", { cat: label })}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#2c87c3] focus:shadow-[0_0_0_3px_rgba(44,135,195,0.15)] rounded-full pl-9 pr-9 py-2.5 text-base sm:text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 min-h-[44px]"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-2 min-h-[36px] min-w-[36px] inline-flex items-center justify-center rounded-full"
                aria-label={t("category.clearSearch")}
              >
                ✕
              </button>
            )}
          </div>

          {/* View mode toggle: Dense Cards vs Dense Table */}
          <div className="inline-flex rounded-full border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => handleViewModeChange("cards")}
              className={`px-3.5 py-2 min-h-[40px] rounded-full font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "cards" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
              title={t("category.viewCardsTitle")}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>{t("category.viewCards")}</span>
            </button>
            <button
              onClick={() => handleViewModeChange("table")}
              className={`px-3.5 py-2 min-h-[40px] rounded-full font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"
              }`}
              title={t("category.viewTableTitle")}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span>{t("category.viewTable")}</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Condition Toggle: All, New, Used */}
            <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setCondition("all")}
                className={`px-3 py-2 min-h-[40px] inline-flex items-center rounded-full font-semibold transition-colors ${
                  condition === "all" ? "bg-slate-900 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("common.all")}
              </button>
              <button
                onClick={() => setCondition("new")}
                className={`px-3 py-2 min-h-[40px] inline-flex items-center rounded-full font-semibold transition-colors ${
                  condition === "new" ? "bg-emerald-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("common.new")}
              </button>
              <button
                onClick={() => setCondition("used")}
                className={`px-3 py-2 min-h-[40px] inline-flex items-center rounded-full font-semibold transition-colors ${
                  condition === "used" ? "bg-amber-600 text-white shadow-sm" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {t("common.used")}
              </button>
            </div>

            {/* In-Stock Only Quick Filter */}
            <button
              onClick={() => setInStockOnly(!inStockOnly)}
              className={`px-3 py-2 min-h-[40px] rounded-full font-semibold transition-all flex items-center gap-1.5 border ${
                inStockOnly
                  ? "bg-emerald-700 text-white border-emerald-700 shadow-sm"
                  : "bg-white text-slate-700 border-slate-200 hover:border-emerald-500"
              }`}
              title={t("category.inStockOnlyTitle")}
            >
              <span className={`w-2 h-2 rounded-full ${inStockOnly ? "bg-white animate-pulse" : "bg-emerald-500"}`} />
              <span>{t("category.inStockOnly")}</span>
            </button>

            {/* Store Filter Dropdown */}
            {availableStores.length > 0 && (
              <div className="relative flex items-center">
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  aria-label={t("category.filterByStore")}
                  className="border border-slate-200 rounded-full px-3 py-2 min-h-[40px] bg-white text-slate-700 font-medium outline-none cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <option value="all">{t("category.allStores", { count: availableStores.length })}</option>
                  {availableStores.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Wilaya Filter Dropdown */}
            {availableWilayas.length > 0 && (
              <div className="relative flex items-center">
                <select
                  value={wilaya}
                  onChange={(e) => setWilaya(e.target.value)}
                  aria-label={t("category.filterByWilaya")}
                  className="border border-slate-200 rounded-full px-3 py-2 min-h-[40px] bg-white text-slate-700 font-medium outline-none cursor-pointer hover:border-slate-300 transition-colors"
                >
                  <option value="all">{t("category.allWilayas", { count: availableWilayas.length })}</option>
                  {availableWilayas.map((w) => (
                    <option key={w} value={w}>
                      📍 {w}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sort Dropdown

              It leads the filter row on purpose. With the filter pills ahead of
              it, this control wrapped onto a third line on a 360px screen and
              fell below the fold: the one control that decides the order of
              150+ prices was the hardest one to reach. The caption is also the
              select's accessible name on every viewport - it used to be
              `hidden sm:inline`, so on a phone the select had no name at all. */}
          <div className="flex items-center gap-2 order-first w-full sm:order-none sm:w-auto sm:ml-auto">
            <span className="text-slate-400 font-medium shrink-0">{t("category.sortBy")}</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              aria-label={t("category.sortBy")}
              className="flex-1 sm:flex-none border border-slate-200 rounded-full px-3 py-2 min-h-[40px] bg-white text-slate-700 font-semibold outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="price-asc">{t("category.sortPriceAsc")}</option>
              <option value="price-desc">{t("category.sortPriceDesc")}</option>
              <option value="name-asc">{t("category.sortNameAsc")}</option>
              <option value="offers-desc">{t("category.sortOffersDesc")}</option>
            </select>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold px-2 py-2 min-h-[40px] shrink-0"
                title={t("common.resetTitle")}
              >
                {t("common.reset")}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Product Catalog Display */}
      {filteredProducts.length > 0 ? (
        viewMode === "cards" ? (
          /* Denser Magazine Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredProducts.map((p) => {
              const st = productStats.get(p.id);
              const pOffers = st?.offers ?? EMPTY_OFFERS;
              const hasInStock = st?.inStock ?? false;
              const isRupturedProduct = (st?.count ?? 0) > 0 && !hasInStock;
              const best = st?.best ?? null;
              const specs = Object.entries(p.specs).slice(0, 3);
              const hasNew = pOffers.some((o) => o.condition === "new");
              const hasUsed = pOffers.some((o) => o.condition === "used");

              return (
                <div
                  key={p.id}
                  className={`rounded-xl p-4 border flex flex-col justify-between overflow-hidden group transition-all hover:shadow-card-hover hover:-translate-y-0.5 ${
                    isRupturedProduct
                      ? "bg-slate-50/70 border-rose-200/90 hover:border-rose-300"
                      : "bg-white border-slate-200/90 hover:border-[#2c87c3]/60 shadow-card"
                  }`}
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#2c87c3] border border-blue-100">
                          {p.category}
                        </span>
                        {isRupturedProduct ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                            <span>{t("common.outOfStock")}</span>
                          </span>
                        ) : hasInStock ? (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            <span>{t("common.inStock")}</span>
                          </span>
                        ) : null}
                        {hasNew && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                            {t("common.new")}
                          </span>
                        )}
                        {hasUsed && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200/70">
                            {t("common.used")}
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {t("common.offersCounted", { count: pOffers.length, plural: pluralSuffix(pOffers.length) })}
                      </span>
                    </div>

                    {/* Image + Title */}
                    <div className="flex items-start gap-3.5">
                      <div className="relative p-1.5 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:border-blue-100 transition-colors">
                        <Thumb src={productImage(p)} alt={p.model} size={56} />
                        {isRupturedProduct && (
                          <div className="absolute inset-0 bg-white/70 flex items-center justify-center rounded-xl">
                            <span className="bg-rose-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                              {t("common.soldOut")}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={href(`/product/${p.id}`)}
                          className={`font-bold text-sm block leading-snug transition-colors ${
                            isRupturedProduct
                              ? "text-slate-700 group-hover:text-rose-600"
                              : "text-slate-900 group-hover:text-[#2c87c3]"
                          }`}
                        >
                          {p.brand} {p.model}
                        </Link>

                        {/* Specs Pills */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {specs.map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2.5">
                    <div className="flex items-baseline justify-between gap-2">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                          {isRupturedProduct ? t("common.lastKnownPrice") : t("common.from")}
                        </span>
                        {best ? (
                          <div
                            className={`text-base sm:text-lg font-extrabold tracking-tight tabular-nums ${
                              isRupturedProduct ? "text-slate-400 line-through" : "text-emerald-700 dark:text-emerald-400"
                            }`}
                          >
                            {formatPrice(best.priceDa, locale)}
                          </div>
                        ) : (
                          <div className="text-xs text-rose-500 font-medium italic">{t("category.offersExhausted")}</div>
                        )}
                      </div>
                      {best && (
                        <div className="text-right text-[11px] truncate max-w-[170px] text-slate-500 dark:text-slate-400">
                          {isRupturedProduct ? (
                            <span className="text-rose-600 dark:text-rose-400 font-semibold">{t("category.outOfStockAtStore", { store: best.store })}</span>
                          ) : (
                            <>
                              {t("common.at")} <b className="text-slate-700 dark:text-slate-200">{best.store}</b>
                              <span className="text-slate-400 block text-[10px]">({best.wilaya})</span>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 pt-1">
                      <CompareToggle productId={p.id} locale={locale} />
                      {isBuilderCategory && (
                        <Link
                          href={href(`/builder?add=${p.category}:${p.id}`)}
                          className={`px-2.5 py-1.5 min-h-[36px] rounded-lg border text-xs font-semibold transition-colors flex items-center shrink-0 ${
                            isRupturedProduct
                              ? "border-rose-200 text-rose-700 hover:bg-rose-50 dark:border-rose-800 dark:text-rose-400"
                              : "border-slate-200 hover:border-[#2c87c3] hover:text-[#2c87c3] hover:bg-blue-50/50 text-slate-700 dark:border-slate-700 dark:text-slate-300"
                          }`}
                          title={isRupturedProduct ? t("category.addBuilderBrokenTitle") : t("common.addToBuilder")}
                        >
                          {isRupturedProduct ? t("category.addBuilderBroken") : t("category.addBuilder")}
                        </Link>
                      )}
                      <Link
                        href={href(`/product/${p.id}`)}
                        className={`flex-1 px-3 py-1.5 min-h-[36px] rounded-lg text-white font-semibold text-xs transition-colors flex items-center justify-center gap-1 text-center shrink-0 ${
                          isRupturedProduct
                            ? "bg-rose-600 hover:bg-rose-700"
                            : "bg-slate-900 hover:bg-[#2c87c3] dark:bg-slate-700 dark:hover:bg-[#2c87c3]"
                        }`}
                      >
                        <span>{isRupturedProduct ? t("common.details") : t("common.viewOffers")}</span>
                        <span aria-hidden="true">→</span>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dense Table View */
          <div className="bg-white rounded-xl border border-slate-200 shadow-card overflow-hidden">
          {/* 700px of table inside a 360px viewport, so it scrolls sideways.
              A scrollable region must be focusable and named, or it cannot be
              scrolled at all with a keyboard. */}
          <div
            className="overflow-x-auto"
            tabIndex={0}
            role="region"
            aria-label={t("category.viewTableTitle")}
          >
            <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3">{t("category.tableProduct")}</th>
                    <th className="text-left px-3 py-3">{t("category.tableSpecs")}</th>
                    <th className="text-center px-3 py-3">{t("category.tableOffers")}</th>
                    <th className="text-center px-3 py-3">{t("category.tableAvailability")}</th>
                    <th className="text-right px-4 py-3">{t("category.tableBestPrice")}</th>
                    <th className="text-left px-4 py-3">{t("category.tableStore")}</th>
                    <th className="text-right px-4 py-3 w-28">{t("category.tableAction")}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.map((p) => {
                    const st = productStats.get(p.id);
                    const pOffers = st?.offers ?? EMPTY_OFFERS;
                    const hasInStock = st?.inStock ?? false;
                    const isRupturedProduct = (st?.count ?? 0) > 0 && !hasInStock;
                    const best = st?.best ?? null;
                    const specs = Object.entries(p.specs).slice(0, 3);

                    return (
                      <tr
                        key={p.id}
                        className={`transition-colors group ${
                          isRupturedProduct
                            ? "bg-rose-50/20 hover:bg-rose-50/40 text-slate-500"
                            : "hover:bg-blue-50/40"
                        }`}
                      >
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Thumb src={productImage(p)} alt={p.model} size={44} />
                            <div className="min-w-0">
                              <Link
                                href={href(`/product/${p.id}`)}
                                className={`font-bold text-sm block truncate ${
                                  isRupturedProduct
                                    ? "text-slate-700 hover:text-rose-600"
                                    : "text-[#2c87c3] hover:underline"
                                }`}
                              >
                                {p.brand} {p.model}
                              </Link>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {specs.map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-medium border border-slate-200/80"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3.5 text-center">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {pOffers.length}
                          </span>
                        </td>

                        {/* Stock Availability Column */}
                        <td className="px-3 py-3.5 text-center">
                          {isRupturedProduct ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 font-bold text-[10px] border border-rose-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-rose-600 animate-pulse" />
                              {t("common.outOfStock")}
                            </span>
                          ) : hasInStock ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 font-bold text-[10px] border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                              {t("common.inStock")}
                            </span>
                          ) : (
                            <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px]">
                              {t("common.checkAvailability")}
                            </span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {best ? (
                            <div>
                              <div
                                className={`font-extrabold text-sm tabular-nums ${
                                  isRupturedProduct ? "text-slate-400 line-through" : "text-slate-900"
                                }`}
                              >
                                {formatPrice(best.priceDa, locale)}
                              </div>
                              {isRupturedProduct && (
                                <span className="text-[10px] font-bold text-rose-600">{t("common.soldOut")}</span>
                              )}
                            </div>
                          ) : (
                            <span className="text-slate-300 font-normal">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          {best ? (
                            <div>
                              <div className="font-semibold text-slate-800 text-xs">{best.store}</div>
                              <div className="text-[11px] text-slate-400">{best.wilaya}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">{t("common.noOffer")}</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <CompareToggle productId={p.id} locale={locale} />
                            {isBuilderCategory && (
                              <Link
                                href={href(`/builder?add=${p.category}:${p.id}`)}
                                className="inline-flex items-center justify-center px-2.5 py-2 min-h-[40px] rounded-lg border border-slate-200 hover:border-[#2c87c3] hover:text-[#2c87c3] text-slate-700 font-semibold text-xs transition-colors"
                                title={t("common.addToBuilder")}
                              >
                                {t("category.addBuilder")}
                              </Link>
                            )}
                            <Link
                              href={href(`/product/${p.id}`)}
                              className={`inline-flex items-center justify-center px-3 py-2 min-h-[40px] rounded-lg text-white font-semibold text-xs transition-colors ${
                                isRupturedProduct ? "bg-rose-600 hover:bg-rose-700" : "bg-slate-900 hover:bg-[#2c87c3]"
                              }`}
                            >
                              {isRupturedProduct ? t("common.details") : `${t("common.viewOffers")} →`}
                            </Link>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <EmptyState
          type="products"
          title={t("category.emptyTitle", { cat: label })}
          description={t("category.emptyDescription")}
          actionText={t("common.resetFilters")}
          onAction={resetFilters}
        />
      )}

      {/* Live Market Ads (Hors Catalogue) */}
      {filteredExtras.length > 0 && (
        <section className="space-y-3.5 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-1 h-4 rounded-full bg-amber-500" aria-hidden="true" />
                <span>{t("category.liveTitle")}</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {t("common.listingsCounted", { count: filteredExtras.length, plural: pluralSuffix(filteredExtras.length) })}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {t("category.liveSubtitle")}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredExtras.map((e, idx) => (
              <a
                key={idx}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="bg-white rounded-xl p-4 border border-slate-200/90 shadow-card hover:shadow-card-hover hover:-translate-y-0.5 hover:border-[#2c87c3]/50 flex gap-3 items-center group transition-all"
              >
                <Thumb src={e.image} alt={e.title} size={52} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-[#2c87c3] transition-colors truncate">
                    {e.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                    <span>{e.store}</span>
                    <span>•</span>
                    <span>{e.wilaya}</span>
                    <span>•</span>
                    <span
                      className={`font-bold ${
                        e.condition === "new" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {e.condition === "new" ? t("common.new") : t("common.used")}
                    </span>
                    {e.postedAt ? (
                      <>
                        <span>•</span>
                        <span title={t("category.listedOn", { date: e.postedAt.slice(0, 10) })}>
                          {t("common.snapshotOnShort", { date: e.postedAt.slice(0, 10) })}
                        </span>
                      </>
                    ) : null}
                    {e.store === "Ouedkniss" ? (
                      <>
                        <span>•</span>
                        <span
                          title={e.isStore ? t("category.sellerProTitle") : t("category.sellerPrivateTitle")}
                          className={`font-bold ${e.isStore ? "text-[#2c87c3]" : "text-slate-500"}`}
                        >
                          {e.isStore ? t("category.sellerPro") : t("category.sellerPrivate")}
                        </span>
                      </>
                    ) : null}
                  </div>
                  <div className="font-extrabold text-sm text-emerald-700 mt-1 tabular-nums">
                    {formatPrice(e.priceDa, locale)}
                  </div>
                </div>
                <span className="text-slate-300 group-hover:text-[#2c87c3] group-hover:translate-x-0.5 transition-all text-sm font-bold shrink-0" aria-hidden="true">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
      <CompareTray products={rawProducts} locale={locale} />
    </div>
  );
}