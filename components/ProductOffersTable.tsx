"use client";

import { useMemo, useState } from "react";
import { isRuptured, maxOf, minOf, type Offer } from "@/lib/data/products";
import { DEFAULT_LOCALE, formatNumber, formatPrice, type Locale } from "@/lib/i18n/config";
import { makeT, stockLabel, type TKey } from "@/lib/i18n/runtime";
import StoreLogo from "./StoreLogo";
import EmptyState from "./EmptyState";

interface ProductOffersTableProps {
  offers: Offer[];
  locale?: Locale;
}

type SortField = "price" | "store" | "condition" | "wilaya" | "stock";
type SortDir = "asc" | "desc";

function stockRank(o: Offer): number {
  if (isRuptured(o)) return 2;
  return o.stock === "En stock" ? 0 : 1;
}

export default function ProductOffersTable({ offers, locale = DEFAULT_LOCALE }: ProductOffersTableProps) {
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [conditionFilter, setConditionFilter] = useState<"all" | "new" | "used">("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [search, setSearch] = useState("");
  const [hideRuptured, setHideRuptured] = useState(true);

  const t = useMemo(() => makeT(locale), [locale]);
  const isFr = locale === "fr";
  const inStockValue = t("common.inStock");

  const availableWilayas = useMemo(() => {
    const s = new Set<string>();
    offers.forEach((o) => {
      if (o.wilaya) s.add(o.wilaya.trim());
    });
    return Array.from(s).sort();
  }, [offers]);

  const SORT_OPTIONS: { value: SortField; labelKey: TKey }[] = [
    { value: "price", labelKey: "offers.thPrice" },
    { value: "store", labelKey: "offers.thStore" },
    { value: "wilaya", labelKey: "offers.thWilaya" },
    { value: "condition", labelKey: "offers.thCondition" },
    { value: "stock", labelKey: "offers.thAvailability" },
  ];

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const rupturedCount = useMemo(() => offers.filter(isRuptured).length, [offers]);
  const visibleOffers = useMemo(
    () => (hideRuptured ? offers.filter((o) => !isRuptured(o)) : offers),
    [offers, hideRuptured]
  );

  const filteredAndSortedOffers = useMemo(() => {
    const list = visibleOffers.filter((o) => {
      if (conditionFilter !== "all" && o.condition !== conditionFilter) return false;
      if (selectedWilaya !== "all" && (!o.wilaya || !o.wilaya.toLowerCase().includes(selectedWilaya.toLowerCase()))) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          o.store.toLowerCase().includes(q) ||
          o.wilaya.toLowerCase().includes(q) ||
          o.titleRaw.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "price") {
        cmp = a.priceDa - b.priceDa;
      } else if (sortField === "store") {
        cmp = a.store.localeCompare(b.store);
      } else if (sortField === "condition") {
        cmp = a.condition.localeCompare(b.condition);
      } else if (sortField === "wilaya") {
        cmp = a.wilaya.localeCompare(b.wilaya);
      } else if (sortField === "stock") {
        cmp = stockRank(a) - stockRank(b);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [visibleOffers, conditionFilter, selectedWilaya, search, sortField, sortDir]);

  const newCount = useMemo(() => visibleOffers.filter((o) => o.condition === "new").length, [visibleOffers]);
  const usedCount = useMemo(() => visibleOffers.filter((o) => o.condition === "used").length, [visibleOffers]);

  const statsBase = useMemo(() => {
    const live = filteredAndSortedOffers.filter((o) => !isRuptured(o));
    return { list: live.length > 0 ? live : filteredAndSortedOffers, live: live.length > 0 };
  }, [filteredAndSortedOffers]);

  const stats = useMemo(() => {
    if (statsBase.list.length === 0) return null;
    const prices = statsBase.list.map((o) => o.priceDa);
    const min = minOf(prices) ?? 0;
    const sorted = [...prices].sort((a, b) => a - b);
    const avg = sorted[Math.floor(sorted.length / 2)];
    const max = maxOf(prices) ?? 0;
    return { min, avg, max };
  }, [statsBase]);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200/90 overflow-hidden">
      {/* Top Filter & Control Toolbar */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 bg-slate-50/70 space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-100">
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 3h18v18H3zM9 3v18M15 3v18M3 9h18M3 15h18" />
              </svg>
            </span>
            <div>
              <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>{isFr ? "Boutiques & Prix Disponibles" : "Retailers & In-Stock Offers"}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                  {filteredAndSortedOffers.length}
                </span>
              </h2>
              <p className="text-[11px] text-slate-500 font-medium">
                {isFr ? "Classé organiquement par ordre de prix croissant • Sans commission" : "Ranked organically by lowest price • Zero sponsor bias"}
              </p>
            </div>
          </div>

          {/* Quick Stats on Desktop */}
          {stats && (
            <div className="hidden lg:flex items-center gap-3 text-xs bg-white px-3 py-1.5 rounded-lg border border-slate-200/80 shadow-2xs">
              <span className="text-slate-500">
                {isFr ? "Médiane :" : "Median:"} <b className="text-slate-900 font-bold">{formatPrice(stats.avg, locale)}</b>
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-slate-500">
                {isFr ? "Écart :" : "Spread:"} <b className="text-emerald-700 font-bold">+{formatNumber(stats.max - stats.min, locale)} DA</b>
              </span>
            </div>
          )}
        </div>

        {/* Filters Row */}
        <div className="flex flex-wrap items-center justify-between gap-2.5 pt-1">
          <div className="flex flex-wrap items-center gap-2">
            {/* Condition Filter Segmented Tabs */}
            <div className="inline-flex rounded-lg border border-slate-200/80 bg-white p-0.5 shadow-2xs" role="group">
              <button
                type="button"
                onClick={() => setConditionFilter("all")}
                className={`px-3 py-1 h-7.5 inline-flex items-center gap-1.5 rounded-md text-xs font-bold transition-all ${
                  conditionFilter === "all"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                }`}
              >
                <span>{t("common.all")}</span>
                <span className="text-[10px] opacity-75">({offers.length})</span>
              </button>
              <button
                type="button"
                onClick={() => setConditionFilter("new")}
                className={`px-3 py-1 h-7.5 inline-flex items-center gap-1.5 rounded-md text-xs font-bold transition-all ${
                  conditionFilter === "new"
                    ? "bg-emerald-600 text-white shadow-xs"
                    : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50/50"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>{t("common.new")}</span>
                <span className="text-[10px] opacity-75">({newCount})</span>
              </button>
              {usedCount > 0 && (
                <button
                  type="button"
                  onClick={() => setConditionFilter("used")}
                  className={`px-3 py-1 h-7.5 inline-flex items-center gap-1.5 rounded-md text-xs font-bold transition-all ${
                    conditionFilter === "used"
                      ? "bg-amber-600 text-white shadow-xs"
                      : "text-slate-600 hover:text-amber-700 hover:bg-amber-50/50"
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                  <span>{t("common.used")}</span>
                  <span className="text-[10px] opacity-75">({usedCount})</span>
                </button>
              )}
            </div>

            {/* Wilaya Filter Dropdown */}
            {availableWilayas.length > 1 && (
              <div className="relative">
                <select
                  value={selectedWilaya}
                  onChange={(e) => setSelectedWilaya(e.target.value)}
                  className="appearance-none border border-slate-200/90 rounded-lg pl-8 pr-7 py-1 h-7.5 bg-white text-slate-700 text-xs font-bold outline-none cursor-pointer hover:border-slate-300 transition-colors shadow-2xs"
                >
                  <option value="all">{isFr ? `Toutes les wilayas (${availableWilayas.length})` : `All wilayas (${availableWilayas.length})`}</option>
                  {availableWilayas.map((w) => (
                    <option key={w} value={w}>
                      {w}
                    </option>
                  ))}
                </select>
                <svg className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2a8 8 0 0 0-8 8c0 5.25 8 12 8 12s8-6.75 8-12a8 8 0 0 0-8-8z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <svg className="w-3 h-3 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </div>
            )}

            {/* Hide Ruptured Toggle */}
            {rupturedCount > 0 && (
              <button
                type="button"
                onClick={() => setHideRuptured((v) => !v)}
                className={`inline-flex items-center gap-1.5 px-3 py-1 h-7.5 rounded-lg text-xs font-bold border transition-all shadow-2xs ${
                  hideRuptured
                    ? "bg-slate-900 text-white border-slate-900"
                    : "bg-white text-slate-600 border-slate-200/90 hover:border-slate-300"
                }`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${hideRuptured ? "bg-emerald-400" : "bg-rose-500"}`} />
                <span>
                  {hideRuptured
                    ? isFr
                      ? `En stock uniquement (-${rupturedCount})`
                      : `In stock only (-${rupturedCount})`
                    : isFr
                    ? "Afficher les ruptures"
                    : "Show out of stock"}
                </span>
              </button>
            )}
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-60">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={isFr ? "Filtrer boutique ou wilaya..." : "Filter store or wilaya..."}
              className="w-full border border-slate-200/90 rounded-lg pl-8 pr-7 py-1 h-7.5 text-xs bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#2c87c3] focus:ring-2 focus:ring-[#2c87c3]/20 shadow-2xs"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"
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
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Offers Display */}
      {filteredAndSortedOffers.length > 0 ? (
        <>
          {/* Mobile View: High-density touch cards */}
          <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-2.5">
            {filteredAndSortedOffers.map((o, idx) => {
              const ruptured = isRuptured(o);
              const isBest = statsBase.live && !ruptured && stats !== null && o.priceDa === stats.min;
              return (
                <div
                  key={`mob-${o.store}-${o.priceDa}-${idx}`}
                  className={`p-4 rounded-xl border transition-all ${
                    isBest
                      ? "bg-gradient-to-r from-emerald-50/70 to-white border-emerald-300 shadow-xs ring-1 ring-emerald-200/60"
                      : "bg-white border-slate-200/80 shadow-2xs"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <StoreLogo store={o.store} size={36} />
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5 truncate">
                          <span>{o.store}</span>
                          <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                          </svg>
                        </div>
                        <div className="text-[11px] text-slate-500 font-semibold flex items-center gap-1 mt-0.5">
                          <span>📍</span>
                          <span>{o.wilaya}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-lg font-black text-slate-900 tabular-nums">
                        {formatPrice(o.priceDa, locale)}
                      </div>
                      {isBest && (
                        <span className="inline-block text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                          {isFr ? "Meilleur Prix" : "Best Price"}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {o.titleRaw}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          o.condition === "new"
                            ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                            : "bg-amber-50 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {o.condition === "new" ? t("common.new") : t("common.used")}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600 flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${ruptured ? "bg-rose-500" : "bg-emerald-500"}`} />
                        <span>{ruptured ? t("common.outOfStock") : stockLabel(o.stock, locale) || inStockValue}</span>
                      </span>
                    </div>

                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs font-bold transition-all shadow-xs active:scale-95"
                    >
                      <span>{isFr ? "Voir l'offre" : "View Deal"}</span>
                      <span>↗</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Sleek Sortable Comparison Table */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm min-w-[700px]">
              <thead className="bg-slate-50/90 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200/80 sticky top-0 z-10 select-none">
                <tr>
                  <th scope="col" className="px-5 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("store")}
                      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider hover:text-slate-900 transition-colors"
                    >
                      <span>{t("offers.thStore")}</span>
                      <span className="text-slate-400">{sortField === "store" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("wilaya")}
                      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider hover:text-slate-900 transition-colors"
                    >
                      <span>{t("offers.thWilaya")}</span>
                      <span className="text-slate-400">{sortField === "wilaya" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3 text-center">
                    <button
                      type="button"
                      onClick={() => handleSort("condition")}
                      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider hover:text-slate-900 transition-colors"
                    >
                      <span>{t("offers.thCondition")}</span>
                      <span className="text-slate-400">{sortField === "condition" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-4 py-3">
                    <button
                      type="button"
                      onClick={() => handleSort("stock")}
                      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider hover:text-slate-900 transition-colors"
                    >
                      <span>{t("offers.thAvailability")}</span>
                      <span className="text-slate-400">{sortField === "stock" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => handleSort("price")}
                      className="inline-flex items-center gap-1.5 font-bold uppercase tracking-wider hover:text-slate-900 transition-colors ml-auto"
                    >
                      <span>{t("offers.thPrice")}</span>
                      <span className="text-slate-400">{sortField === "price" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}</span>
                    </button>
                  </th>
                  <th scope="col" className="px-5 py-3 text-right w-36">
                    {t("offers.thAction")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredAndSortedOffers.map((o, idx) => {
                  const ruptured = isRuptured(o);
                  const isBest = statsBase.live && !ruptured && stats !== null && o.priceDa === stats.min;
                  return (
                    <tr
                      key={`${o.store}-${o.priceDa}-${idx}`}
                      className={`transition-colors group ${
                        isBest
                          ? "bg-emerald-50/40 hover:bg-emerald-50/70"
                          : "hover:bg-slate-50/70"
                      }`}
                    >
                      {/* Store info */}
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-3">
                          <StoreLogo store={o.store} size={36} />
                          <div className="min-w-0">
                            <div className="font-extrabold text-slate-900 text-sm group-hover:text-[#2c87c3] transition-colors flex items-center gap-1.5">
                              <span className="truncate">{o.store}</span>
                              <svg className="w-3.5 h-3.5 text-blue-500 shrink-0" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                              </svg>
                            </div>
                            <div className="text-slate-500 truncate max-w-sm text-xs mt-0.5" title={o.titleRaw}>
                              {o.titleRaw}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Wilaya */}
                      <td className="px-4 py-3.5 text-slate-600 font-medium text-xs whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 bg-slate-100/80 px-2.5 py-1 rounded-md text-slate-700 font-semibold border border-slate-200/60">
                          <span>📍</span>
                          <span>{o.wilaya}</span>
                        </span>
                      </td>

                      {/* Condition */}
                      <td className="px-4 py-3.5 text-center whitespace-nowrap">
                        <span
                          className={`inline-block text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                            o.condition === "new"
                              ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                              : "bg-amber-50 text-amber-800 border border-amber-200"
                          }`}
                        >
                          {o.condition === "new" ? t("common.new") : t("common.used")}
                        </span>
                      </td>

                      {/* Stock */}
                      <td className="px-4 py-3.5 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 text-xs font-semibold">
                          <span className={`w-1.5 h-1.5 rounded-full ${ruptured ? "bg-rose-500" : "bg-emerald-500 animate-pulse"}`} />
                          <span className={ruptured ? "text-rose-700" : "text-slate-700"}>
                            {ruptured ? t("common.outOfStock") : stockLabel(o.stock, locale) || inStockValue}
                          </span>
                        </span>
                      </td>

                      {/* Price */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        {isBest && (
                          <span className="inline-block mb-1 text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-600 text-white shadow-2xs">
                            {isFr ? "Meilleur Prix" : "Best Deal"}
                          </span>
                        )}
                        <div className={`font-black text-base sm:text-lg tabular-nums tracking-tight ${isBest ? "text-emerald-700" : "text-slate-900"}`}>
                          {formatPrice(o.priceDa, locale)}
                        </div>
                      </td>

                      {/* Outbound Link Button */}
                      <td className="px-5 py-3.5 text-right whitespace-nowrap">
                        <a
                          href={o.url}
                          target="_blank"
                          rel="noopener noreferrer sponsored"
                          className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-white font-bold text-xs transition-all shadow-xs hover:shadow active:scale-95 ${
                            ruptured
                              ? "bg-slate-700 hover:bg-slate-800"
                              : "bg-gradient-to-r from-[#2c87c3] to-[#1e5c85] hover:from-[#2474a8] hover:to-[#17496a]"
                          }`}
                        >
                          <span>{ruptured ? (isFr ? "Voir quand même" : "View anyway") : (isFr ? "Voir l'offre" : "View Deal")}</span>
                          <span>↗</span>
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <div className="p-8">
          <EmptyState
            type="offers"
            title={t("offers.emptyTitle")}
            description={t("offers.emptyDescription")}
            actionText={t("common.resetFilters")}
            onAction={() => {
              setConditionFilter("all");
              setSelectedWilaya("all");
              setSearch("");
              setHideRuptured(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
