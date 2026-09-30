"use client";

import { useMemo, useState } from "react";
import { isRuptured, type Offer } from "@/lib/data/products";
import { DEFAULT_LOCALE, formatNumber, formatPrice, type Locale } from "@/lib/i18n/config";
import { makeT, stockLabel, type TKey } from "@/lib/i18n/runtime";
import Thumb from "./Thumb";
import StoreLogo from "./StoreLogo";
import EmptyState from "./EmptyState";

interface ProductOffersTableProps {
  offers: Offer[];
  /**
   * UI locale, passed as a prop by the server page so the first paint is already
   * translated. Defaults to French for the unprefixed routes.
   */
  locale?: Locale;
}

type SortField = "price" | "store" | "condition" | "wilaya" | "stock";

// Availability rank: confirmed in-stock first, unknown stock second, ruptures last.
// NOTE: "En stock" is the canonical value stored in the DB (`stock` column
// normalises to it), so it is compared verbatim and never translated.
function stockRank(o: Offer): number {
  if (isRuptured(o)) return 2;
  return o.stock === "En stock" ? 0 : 1;
}
type SortDir = "asc" | "desc";

export default function ProductOffersTable({ offers, locale = DEFAULT_LOCALE }: ProductOffersTableProps) {
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [conditionFilter, setConditionFilter] = useState<"all" | "new" | "used">("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [search, setSearch] = useState("");
  const [hideRuptured, setHideRuptured] = useState(true);

  // --- i18n: static import, picked at render time from the locale prop -------
  const t = useMemo(() => makeT(locale), [locale]);
  const inStockValue = t("common.inStock");

  const availableWilayas = useMemo(() => {
    const s = new Set<string>();
    offers.forEach((o) => { if (o.wilaya) s.add(o.wilaya.trim()); });
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

  // Stats ignore ruptures: a shown-but-dead listing must never set the
  // min/avg/écart or win the "best price" badge. Falls back to all
  // visible offers only when every one of them is ruptured.
  const statsBase = useMemo(() => {
    const live = filteredAndSortedOffers.filter((o) => !isRuptured(o));
    return { list: live.length > 0 ? live : filteredAndSortedOffers, live: live.length > 0 };
  }, [filteredAndSortedOffers]);

  const stats = useMemo(() => {
    if (statsBase.list.length === 0) return null;
    const prices = statsBase.list.map((o) => o.priceDa);
    const min = Math.min(...prices);
    const sorted = [...prices].sort((a, b) => a - b);
    const avg = sorted[Math.floor(sorted.length / 2)]; // médiane
    const max = Math.max(...prices);
    return { min, avg, max };
  }, [statsBase]);

  return (
    <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span
            className="text-xs font-bold uppercase tracking-wider text-slate-600 mr-1"
            role="status"
            aria-live="polite"
          >
            {t("offers.title", { count: filteredAndSortedOffers.length })}
          </span>
          <div className="inline-flex rounded border border-slate-200 bg-white p-0.5 text-xs" role="group" aria-label={t("offers.filterByState")}>
            <button
              onClick={() => setConditionFilter("all")}
              aria-pressed={conditionFilter === "all"}
              className={`px-3 py-2 min-h-[40px] inline-flex items-center rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3] ${
                conditionFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {t("common.all")} ({offers.length})
            </button>
            <button
              onClick={() => setConditionFilter("new")}
              aria-pressed={conditionFilter === "new"}
              className={`px-3 py-2 min-h-[40px] inline-flex items-center rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                conditionFilter === "new" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              {t("common.new")} ({newCount})
            </button>
            {usedCount > 0 && (
              <button
                onClick={() => setConditionFilter("used")}
                aria-pressed={conditionFilter === "used"}
                className={`px-3 py-2 min-h-[40px] inline-flex items-center rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 ${
                  conditionFilter === "used" ? "bg-amber-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                {t("common.used")} ({usedCount})
              </button>
            )}
          </div>
          {availableWilayas.length > 1 && (
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              aria-label={t("offers.filterWilayaAria")}
              className="border border-slate-200 rounded-lg px-2.5 py-2 min-h-[40px] bg-white text-slate-700 text-xs font-semibold outline-none cursor-pointer hover:border-slate-300 transition-colors"
            >
              <option value="all">{t("offers.allWilayas", { count: availableWilayas.length })}</option>
              {availableWilayas.map((w) => (
                <option key={w} value={w}>
                  📍 {w}
                </option>
              ))}
            </select>
          )}

          {rupturedCount > 0 && (
            <button
              onClick={() => setHideRuptured((v) => !v)}
              aria-pressed={hideRuptured}
              title={t("offers.hideRupturesTitle")}
              className={`ml-1 inline-flex items-center gap-1.5 px-2.5 py-2 min-h-[40px] rounded text-[11px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3] ${
                hideRuptured ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`size-1.5 rounded-full ${hideRuptured ? "bg-slate-400" : "bg-red-500"}`} />
              <span>{hideRuptured ? t("offers.hideRuptures", { count: rupturedCount }) : t("offers.showRuptures")}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>{t("common.median")}: <b className="text-slate-800">{formatPrice(stats.avg, locale)}</b></span>
              <span className="text-slate-300">•</span>
              <span>{t("common.spread")}: <b>{formatNumber(stats.max - stats.min, locale)} DA</b></span>
            </div>
          )}
        {/* Sort. Below `md` the offers render as cards and the sortable
            <th> headers do not exist, so without this the table order was
            fixed at "price ascending" on every phone. */}
        <div className="flex items-center gap-2 md:hidden">
          <span className="sr-only">{t("category.sortBy")}</span>
          <select
            value={sortField}
            onChange={(e) => handleSort(e.target.value as SortField)}
            className="border border-slate-200 rounded-lg px-2.5 py-2 min-h-[40px] bg-white text-slate-700 text-xs font-semibold outline-none cursor-pointer"
          >
            {SORT_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {t(o.labelKey)}
              </option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setSortDir(sortDir === "asc" ? "desc" : "asc")}
            aria-label={t("category.sortBy")}
            className="px-2.5 py-2 min-h-[40px] min-w-[40px] inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 text-xs font-bold"
          >
            {sortDir === "asc" ? "\u2191" : "\u2193"}
          </button>
        </div>

          <div className="relative w-full sm:w-56">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("offers.searchPlaceholder")}
              aria-label={t("offers.searchAria")}
              className="border border-slate-200 rounded-lg pl-8 pr-3 py-2 min-h-[40px] text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2c87c3] focus:ring-2 focus:ring-[#2c87c3]/25 w-full sm:w-56"
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
          </div>
        </div>
      </div>

      {/* Offers Display */}
      {filteredAndSortedOffers.length > 0 ? (
        <>
          {/* Mobile View: High-density touch-optimized cards */}
          <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-3">
            {filteredAndSortedOffers.map((o, idx) => {
              const ruptured = isRuptured(o);
              const isBest = statsBase.live && !ruptured && stats !== null && o.priceDa === stats.min;
              const unknownStock = !ruptured && o.stock !== "En stock";
              return (
                <div
                  key={`mob-${o.store}-${o.priceDa}-${idx}`}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isBest
                      ? "bg-emerald-50/60 border-emerald-300 shadow-sm"
                      : "bg-white border-slate-200/90 shadow-sm"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <StoreLogo store={o.store} size={36} />
                      <div className="min-w-0">
                        <div className="font-extrabold text-slate-900 text-sm flex items-center gap-1.5">
                          <span className="truncate">{o.store}</span>
                          <span className="size-1.5 rounded-full bg-emerald-500 shrink-0" />
                        </div>
                        <div className="text-[11px] text-slate-500 font-medium">📍 {o.wilaya}</div>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-base font-black text-emerald-700 tabular-nums">
                        {formatPrice(o.priceDa, locale)}
                      </div>
                      {isBest && (
                        <span className="inline-block text-[9px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-emerald-600 text-white shadow-xs">
                          {t("offers.bestPrice")}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs text-slate-600 line-clamp-2 mt-2 leading-relaxed">
                    {o.titleRaw}
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-3 pt-2.5 border-t border-slate-100 text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          o.condition === "new"
                            ? "bg-emerald-100 text-emerald-800 border border-emerald-200"
                            : "bg-amber-100 text-amber-800 border border-amber-200"
                        }`}
                      >
                        {o.condition === "new" ? t("common.new") : t("common.used")}
                      </span>
                      <span className="text-[11px] text-slate-600 font-medium flex items-center gap-1">
                        <span className={`size-1.5 rounded-full ${ruptured ? "bg-red-500" : unknownStock ? "bg-slate-300" : "bg-emerald-500"}`} />
                        <span>{ruptured ? t("common.outOfStock") : stockLabel(o.stock, locale) || inStockValue}</span>
                      </span>
                    </div>

                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={t("common.viewOffer")}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs font-bold transition-colors touch-manipulation min-h-[44px]"
                    >
                      <span>{t("common.viewOffer")}</span>
                      <span>→</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Desktop View: Sortable Table */}
          <div className="hidden md:block max-h-[70vh] overflow-auto">
            <table className="w-full text-sm min-w-[640px]">
              <caption className="sr-only">{t("offers.caption")}</caption>
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 select-none sticky top-0 z-10">
              <tr>
                <th
                  scope="col"
                  aria-sort={sortField === "store" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className="text-left px-4 py-0"
                >
                  {/* A real <button>, not a click handler on the <th>: the old
                      markup was reachable by mouse only - no tab stop, no
                      Enter/Space, and nothing announced as a control. */}
                  <button
                    type="button"
                    onClick={() => handleSort("store")}
                    className="w-full min-h-[40px] flex items-center gap-1.5 py-2.5 text-left uppercase tracking-wider text-[11px] font-bold hover:text-slate-900 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c87c3]"
                  >
                    <span>{t("offers.thStore")}</span>
                    <span className="text-[10px] text-slate-400" aria-hidden="true">
                      {sortField === "store" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "wilaya" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className="text-left px-3 py-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("wilaya")}
                    className="w-full min-h-[40px] flex items-center gap-1.5 py-2.5 text-left uppercase tracking-wider text-[11px] font-bold hover:text-slate-900 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c87c3]"
                  >
                    <span>{t("offers.thWilaya")}</span>
                    <span className="text-[10px] text-slate-400" aria-hidden="true">
                      {sortField === "wilaya" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "condition" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className="text-center px-3 py-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("condition")}
                    className="w-full min-h-[40px] flex items-center justify-center gap-1.5 py-2.5 text-center uppercase tracking-wider text-[11px] font-bold hover:text-slate-900 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c87c3]"
                  >
                    <span>{t("offers.thCondition")}</span>
                    <span className="text-[10px] text-slate-400" aria-hidden="true">
                      {sortField === "condition" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "stock" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className="text-left px-3 py-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("stock")}
                    className="w-full min-h-[40px] flex items-center gap-1.5 py-2.5 text-left uppercase tracking-wider text-[11px] font-bold hover:text-slate-900 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c87c3]"
                  >
                    <span>{t("offers.thAvailability")}</span>
                    <span className="text-[10px] text-slate-400" aria-hidden="true">
                      {sortField === "stock" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "price" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  className="text-right px-4 py-0"
                >
                  <button
                    type="button"
                    onClick={() => handleSort("price")}
                    className="w-full min-h-[40px] flex items-center justify-end gap-1.5 py-2.5 text-right uppercase tracking-wider text-[11px] font-bold hover:text-slate-900 transition-colors rounded-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2c87c3]"
                  >
                    <span>{t("offers.thPrice")}</span>
                    <span className="text-[10px] text-slate-400" aria-hidden="true">
                      {sortField === "price" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </button>
                </th>
                <th scope="col" className="text-right px-4 py-3 w-32">{t("offers.thAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAndSortedOffers.map((o, idx) => {
                const ruptured = isRuptured(o);
                const isBest = statsBase.live && !ruptured && stats !== null && o.priceDa === stats.min;
                const unknownStock = !ruptured && o.stock !== "En stock";
                return (
                <tr
                  key={`${o.store}-${o.priceDa}-${idx}`}
                  className={`transition-colors group ${isBest ? "bg-emerald-50/70 hover:bg-emerald-50" : "hover:bg-blue-50/50"}`}
                >
                  {/* Store info */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <StoreLogo store={o.store} size={38} />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-[#2c87c3] transition-colors flex items-center gap-1.5">
                          <span>{o.store}</span>
                          <span className="size-1.5 rounded-full bg-emerald-500" title={t("offers.storeIndexedTitle")} />
                        </div>
                        <div className="text-slate-500 truncate max-w-xs text-[11px] mt-0.5">{o.titleRaw}</div>
                      </div>
                    </div>
                  </td>

                  {/* Wilaya */}
                  <td className="px-3 py-3.5 text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                      <span>📍</span>
                      <span>{o.wilaya}</span>
                    </span>
                  </td>

                  {/* Condition */}
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.condition === "new"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                          : "bg-amber-100 text-amber-800 border border-amber-200/60"
                      }`}
                    >
                      {o.condition === "new" ? t("common.new") : t("common.used")}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-3 py-3.5">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${ruptured ? "bg-red-500" : unknownStock ? "bg-slate-300" : "bg-emerald-500"}`} />
                      <span className={ruptured ? "font-semibold text-red-700" : ""}>
                        {ruptured ? t("common.outOfStock") : stockLabel(o.stock, locale) || t("common.observedPrice")}
                      </span>
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 text-right">
                    {isBest && (
                      <span className="inline-block mb-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        {t("offers.bestPrice")}
                      </span>
                    )}
                    <div className={`font-extrabold text-sm sm:text-base tabular-nums transition-colors ${isBest ? "text-emerald-700" : "text-slate-900 group-hover:text-emerald-700"}`}>
                      {formatPrice(o.priceDa, locale)}
                    </div>
                  </td>

                  {/* Outbound Link Button */}
                  <td className="px-4 py-3.5 text-right">
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      aria-label={ruptured
                        ? t("offers.viewOutOfStockAria", { store: o.store, price: formatPrice(o.priceDa, locale) })
                        : t("offers.buyAtAria", { store: o.store, price: formatPrice(o.priceDa, locale) })}
                      className={`inline-flex items-center justify-center px-3.5 py-2 min-h-[40px] rounded text-white font-bold text-xs transition-colors shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${ruptured
                        ? "bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500"
                        : "bg-[#2c87c3] hover:bg-[#1e5c85] active:bg-[#153f5b] focus-visible:ring-[#2c87c3]"}`}
                    >
                      <span>{ruptured ? t("common.viewAnyway") : t("common.buy")}</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
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
        <div className="p-6">
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
