"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type Prebuilt, evaluatePrebuilt } from "@/lib/data/prebuilds";
import { type Offer } from "@/lib/data/products";
import { DEFAULT_LOCALE, formatNumber, formatPrice, localizedHref, type Locale } from "@/lib/i18n/config";
import { makeT, pluralSuffix } from "@/lib/i18n/runtime";
import EmptyState from "./EmptyState";

interface PrebuildsClientProps {
  prebuilds: Prebuilt[];
  offers: Offer[];
  /**
   * UI locale, passed as a prop by the server page so the first paint is already
   * translated. Defaults to French for the unprefixed routes.
   */
  locale?: Locale;
}

export default function PrebuildsClient({ prebuilds, offers, locale = DEFAULT_LOCALE }: PrebuildsClientProps) {
  const [search, setSearch] = useState("");
  const [cpuBrand, setCpuBrand] = useState<"all" | "AMD" | "Intel">("all");
  const [gpuFilter, setGpuFilter] = useState<"all" | "rtx40" | "rtx30" | "radeon" | "igpu">("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [dealOnly, setDealOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"savings" | "discount-pct" | "price-asc" | "price-desc" | "gpu-tier" | "cpu-tier">("savings");

  // --- i18n: static import, picked at render time from the locale prop -------
  const t = useMemo(() => makeT(locale), [locale]);

  // Wilaya list
  const wilayas = useMemo(() => {
    const set = new Set<string>();
    prebuilds.forEach((p) => {
      if (p.wilaya) set.add(p.wilaya);
    });
    return Array.from(set).sort();
  }, [prebuilds]);

  // Evaluated prebuilds with price comparisons
  const evaluated = useMemo(() => {
    return prebuilds.map((p) => {
      const valuation = evaluatePrebuilt(p, offers);
      return { ...p, valuation, discountPct: valuation.savingsPct };
    });
  }, [prebuilds, offers]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    const getGpuScore = (name: string): number => {
      const n = name.toLowerCase();
      if (n.includes("4090")) return 100;
      if (n.includes("4080")) return 95;
      if (n.includes("4070 ti")) return 90;
      if (n.includes("4070 super") || n.includes("4070")) return 85;
      if (n.includes("7900") || n.includes("7800")) return 83;
      if (n.includes("4060 ti") || n.includes("7700")) return 75;
      if (n.includes("4060") || n.includes("3070")) return 70;
      if (n.includes("3060 ti") || n.includes("6700")) return 65;
      if (n.includes("3060") || n.includes("6600")) return 55;
      if (n.includes("3050") || n.includes("2060")) return 45;
      if (n.includes("1660") || n.includes("580") || n.includes("590") || n.includes("5500")) return 35;
      if (n.includes("vega") || n.includes("uhd") || n.includes("rad") || n.includes("igpu")) return 15;
      return 30;
    };

    const getCpuScore = (name: string): number => {
      const n = name.toLowerCase();
      if (n.includes("9800x3d") || n.includes("7800x3d") || n.includes("14900") || n.includes("13900")) return 100;
      if (n.includes("7950") || n.includes("7900") || n.includes("9900") || n.includes("14700") || n.includes("13700")) return 90;
      if (n.includes("5700x3d") || n.includes("5800x3d") || n.includes("7700") || n.includes("14600") || n.includes("13600")) return 80;
      if (n.includes("7600") || n.includes("7500f") || n.includes("14400") || n.includes("13400") || n.includes("12600")) return 70;
      if (n.includes("5600") || n.includes("12400") || n.includes("5500")) return 55;
      if (n.includes("3600") || n.includes("12100")) return 45;
      return 30;
    };

    return evaluated
      .filter((item) => {
        // Text search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchStore = item.store.toLowerCase().includes(q);
          const matchCpu = item.specs.cpu.name.toLowerCase().includes(q);
          const matchGpu = item.specs.gpu.name.toLowerCase().includes(q);
          if (!matchTitle && !matchStore && !matchCpu && !matchGpu) return false;
        }

        // CPU Brand
        if (cpuBrand !== "all" && item.specs.cpu.brand !== cpuBrand) {
          return false;
        }

        // GPU Filter
        if (gpuFilter !== "all") {
          const gName = item.specs.gpu.name.toLowerCase();
          const gId = item.specs.gpu.id;
          if (gpuFilter === "igpu" && gId !== "igpu") return false;
          if (gpuFilter === "rtx40" && !gName.includes("40")) return false;
          if (gpuFilter === "rtx30" && !gName.includes("30")) return false;
          if (gpuFilter === "radeon" && !gName.includes("rx") && !gName.includes("90")) return false;
        }

        // Wilaya
        if (selectedWilaya !== "all" && item.wilaya !== selectedWilaya) {
          return false;
        }

        // Deals only (cheaper than building parts)
        if (dealOnly && item.valuation.savings <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceDa - b.priceDa;
        if (sortBy === "price-desc") return b.priceDa - a.priceDa;
        if (sortBy === "savings") return b.valuation.savings - a.valuation.savings;
        if (sortBy === "discount-pct") return b.discountPct - a.discountPct;
        if (sortBy === "gpu-tier") return getGpuScore(b.specs.gpu.name) - getGpuScore(a.specs.gpu.name);
        if (sortBy === "cpu-tier") return getCpuScore(b.specs.cpu.name) - getCpuScore(a.specs.cpu.name);
        return 0;
      });
  }, [evaluated, search, cpuBrand, gpuFilter, selectedWilaya, dealOnly, sortBy]);

  return (
    <div className="space-y-6">
      {/* Information Alert */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 text-blue-950 text-xs sm:text-sm">
        <span className="text-xl shrink-0">ℹ️</span>
        <div className="space-y-1">
          <p className="font-bold text-blue-900">
            {t("prebuilds.infoTitle")}
          </p>
          <p className="text-blue-800/90 leading-relaxed text-xs">
            {t("prebuilds.infoText")}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="prebuilds-search">
              {t("prebuilds.searchLabel")}
            </label>
            <input
              id="prebuilds-search"
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t("prebuilds.searchPlaceholder")}
              className="w-full text-base sm:text-sm px-3 py-2.5 min-h-[44px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#2c87c3]"
            />
          </div>

          {/* CPU Filter */}
          <div>
            <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              {t("prebuilds.cpuLabel")}
            </span>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs" role="group" aria-label={t("prebuilds.cpuLabel")}>
              <button
                type="button"
                onClick={() => setCpuBrand("all")}
                className={`flex-1 py-2.5 min-h-[44px] inline-flex items-center justify-center font-semibold transition-colors ${
                  cpuBrand === "all" ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                {t("common.all")}
              </button>
              <button
                type="button"
                onClick={() => setCpuBrand("AMD")}
                className={`flex-1 py-2.5 min-h-[44px] inline-flex items-center justify-center font-semibold transition-colors border-l border-slate-200 ${
                  cpuBrand === "AMD" ? "bg-red-600 text-white" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                AMD
              </button>
              <button
                type="button"
                onClick={() => setCpuBrand("Intel")}
                className={`flex-1 py-2.5 min-h-[44px] inline-flex items-center justify-center font-semibold transition-colors border-l border-slate-200 ${
                  cpuBrand === "Intel" ? "bg-blue-600 text-white" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                Intel
              </button>
            </div>
          </div>

          {/* GPU Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="prebuilds-gpu">
              {t("prebuilds.gpuLabel")}
            </label>
            <select
              id="prebuilds-gpu"
              value={gpuFilter}
              onChange={(e) => setGpuFilter(e.target.value as never)}
              className="w-full text-base sm:text-sm px-3 py-2.5 min-h-[44px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#2c87c3] bg-white"
            >
              <option value="all">{t("prebuilds.gpuAll")}</option>
              <option value="rtx40">GeForce RTX 40 Series</option>
              <option value="rtx30">GeForce RTX 30 Series</option>
              <option value="radeon">AMD Radeon RX</option>
              <option value="igpu">{t("prebuilds.gpuIgpu")}</option>
            </select>
          </div>

          {/* Wilaya Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1" htmlFor="prebuilds-wilaya">
              {t("prebuilds.wilayaLabel")}
            </label>
            <select
              id="prebuilds-wilaya"
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full text-base sm:text-sm px-3 py-2.5 min-h-[44px] rounded-lg border border-slate-200 focus:outline-none focus:border-[#2c87c3] bg-white"
            >
              <option value="all">{t("category.allWilayas", { count: wilayas.length })}</option>
              {wilayas.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Bar: Deal Toggle & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2.5 cursor-pointer select-none font-semibold text-slate-700 min-h-[44px]">
            <input
              type="checkbox"
              checked={dealOnly}
              onChange={(e) => setDealOnly(e.target.checked)}
              className="w-5 h-5 rounded border-slate-300 text-[#2c87c3] focus:ring-[#2c87c3] shrink-0"
            />
            <span>🔥 {t("prebuilds.dealOnly")}</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">{t("prebuilds.sortBy")}</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as never)}
              aria-label={t("prebuilds.sortBy")}
              className="px-2.5 py-2 min-h-[44px] rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="savings">🔥 {t("prebuilds.sortSavings")}</option>
              <option value="discount-pct">📊 {t("prebuilds.sortDiscount")}</option>
              <option value="price-asc">💰 {t("prebuilds.sortPriceAsc")}</option>
              <option value="price-desc">💎 {t("prebuilds.sortPriceDesc")}</option>
              <option value="gpu-tier">🎮 {t("prebuilds.sortGpuTier")}</option>
              <option value="cpu-tier">⚡ {t("prebuilds.sortCpuTier")}</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          {t("common.unitsFound", { count: filtered.length, plural: pluralSuffix(filtered.length) })}
        </span>
        <span>{t("prebuilds.liveSource")}</span>
      </div>

      {/* Grid of Prebuilt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const { valuation, specs } = item;
          const isDeal = valuation.savings > 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-[#2c87c3] transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm group hover:shadow-md relative overflow-hidden"
            >
              {/* Card Top: Store and Wilaya Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-xs text-slate-800 truncate" title={item.store}>
                      {item.store}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    📍 {item.wilaya}
                  </span>
                </div>

                {/* Prebuilt Title */}
                <h2 className="font-extrabold text-slate-900 group-hover:text-[#2c87c3] transition-colors text-sm line-clamp-2 leading-snug">
                  {item.title}
                </h2>

                {/* Core Specs Chips */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    {t("prebuilds.mainConfig")}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* CPU Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200/80">
                      <span>🧠</span>
                      <span>{specs.cpu.name}</span>
                    </span>

                    {/* GPU Chip */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded border ${
                        specs.gpu.id === "igpu"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-900 border-blue-200"
                      }`}
                    >
                      <span>🎮</span>
                      <span>{specs.gpu.name}</span>
                    </span>

                    {/* Mobo Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200/80">
                      <span>🔌</span>
                      <span>{specs.mobo.name}</span>
                    </span>

                    {/* RAM Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200/80">
                      <span>⚡</span>
                      <span>{specs.ram.name}</span>
                    </span>

                    {/* Storage Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200/80">
                      <span>💾</span>
                      <span>{specs.storage.name}</span>
                    </span>
                  </div>
                </div>

                {/* Price Valuation Breakdown */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>{t("prebuilds.partsPrice")}</span>
                    <span className="font-semibold tabular-nums">
                      {formatPrice(valuation.partsSum, locale)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-bold">
                    <span>{t("prebuilds.prebuiltPrice")}</span>
                    <span className="text-sm text-slate-900 tabular-nums">
                      {formatPrice(item.priceDa, locale)}
                    </span>
                  </div>

                  {/* Savings / Delta Badge */}
                  <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">{t("prebuilds.difference")}</span>
                    {isDeal ? (
                      <span className="font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        🔥 {t("prebuilds.savings", { amount: formatNumber(valuation.savings, locale) })}
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-600">
                        {t("prebuilds.markup", { amount: formatNumber(valuation.delta, locale) })}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Open in Builder Button */}
                  <Link
                    href={localizedHref(valuation.builderUrl, locale)}
                    className="flex-1 py-2.5 min-h-[44px] px-3 rounded-lg bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>{t("prebuilds.openBuilder")}</span>
                    <span>→</span>
                  </Link>

                  {/* Store Link */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 min-h-[44px] px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                    title={t("prebuilds.storeTitle")}
                  >
                    <span>{t("prebuilds.storeBtn")}</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <EmptyState
          type="search"
          title={t("prebuilds.emptyTitle")}
          description={t("prebuilds.emptyText")}
          actionText={t("common.resetFilters")}
          onAction={() => {
            setSearch("");
            setCpuBrand("all");
            setGpuFilter("all");
            setSelectedWilaya("all");
            setDealOnly(false);
          }}
        />
      )}
    </div>
  );
}
