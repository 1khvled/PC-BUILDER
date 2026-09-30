"use client";

import { useMemo, useState } from "react";
import type { Offer, PricePoint } from "@/lib/data/products";
import { formatNumber, type Locale } from "@/lib/i18n/config";
import StoreLogo from "./StoreLogo";
import { useI18n } from "@/lib/i18n/client";

const STORE_COLORS = [
  "#2c87c3", // Brand Blue
  "#10b981", // Emerald
  "#f59e0b", // Amber
  "#8b5cf6", // Purple
  "#ec4899", // Pink
  "#06b6d4", // Cyan
  "#f97316", // Orange
  "#64748b", // Slate
];

interface PriceChartProps {
  points: PricePoint[];
  currentOffers?: Offer[];
}

export default function PriceChart({ points, currentOffers = [] }: PriceChartProps) {
  // The locale is resolved from context when the page provides one, and from
  // the pre-paint `data-locale` attribute otherwise. Every number below is
  // formatted through it: they used to be hardcoded to `fr-DZ`, so the ENGLISH
  // price history showed French digit grouping (145 000 instead of 145,000).
  const { locale, t } = useI18n();
  const money = (n: number) => `${formatNumber(Math.round(n), locale)} DA`;
  const [hoveredPoint, setHoveredPoint] = useState<{
    store: string;
    day: string;
    price: number;
    x: number;
    y: number;
  } | null>(null);

  // Group historical data
  const days = useMemo(() => {
    const set = new Set<string>();
    points.forEach((p) => {
      if (p.day) set.add(p.day);
    });
    return Array.from(set).sort();
  }, [points]);

  const byStore = useMemo(() => {
    const map: Record<string, PricePoint[]> = {};
    points.forEach((p) => {
      if (!map[p.store]) map[p.store] = [];
      map[p.store].push(p);
    });
    return map;
  }, [points]);

  const sortedStores = useMemo(() => {
    return Object.keys(byStore)
      .map((s) => ({
        store: s,
        pts: byStore[s].sort((a, b) => (a.day < b.day ? -1 : 1)),
      }))
      .sort((a, b) => b.pts.length - a.pts.length);
  }, [byStore]);

  // Overall min, max, avg
  const stats = useMemo(() => {
    const allPrices = points.length > 0 ? points.map((p) => p.price) : currentOffers.map((o) => o.priceDa);
    if (allPrices.length === 0) return null;

    const min = Math.min(...allPrices);
    const max = Math.max(...allPrices);
    const sum = allPrices.reduce((acc, v) => acc + v, 0);
    const avg = Math.round(sum / allPrices.length);

    // Trend: compare oldest available day's min vs newest available day's min
    let trend: "down" | "up" | "stable" = "stable";
    let trendPct = 0;

    if (days.length >= 2) {
      const oldestDay = days[0];
      const newestDay = days[days.length - 1];
      const oldestPrices = points.filter((p) => p.day === oldestDay).map((p) => p.price);
      const newestPrices = points.filter((p) => p.day === newestDay).map((p) => p.price);

      if (oldestPrices.length > 0 && newestPrices.length > 0) {
        const oldMin = Math.min(...oldestPrices);
        const newMin = Math.min(...newestPrices);
        const diff = newMin - oldMin;
        trendPct = Math.round((Math.abs(diff) / oldMin) * 100);

        if (diff < -500) trend = "down";
        else if (diff > 500) trend = "up";
      }
    }

    return { min, max, avg, trend, trendPct, spread: max - min };
  }, [points, currentOffers, days]);

  // If we only have 1 or 0 days of historical tracking, show the live Market Price Barometer
  if (days.length < 2) {
    const validOffers = currentOffers.length > 0 ? currentOffers : points.map(p => ({
      priceDa: p.price,
      store: p.store,
      wilaya: "",
      stock: "En stock",
      condition: "new"
    }));

    const sortedOffers = [...validOffers].sort((a, b) => a.priceDa - b.priceDa);
    const minOffer = sortedOffers[0];
    const maxOffer = sortedOffers[sortedOffers.length - 1];
    const diff = minOffer && maxOffer ? maxOffer.priceDa - minOffer.priceDa : 0;

    // No history AND no live offer: the barometer has nothing to plot, and the
    // old code still painted its header, an empty scale bar and an empty
    // "tarifs par boutique" row. Say so plainly instead of showing a shell.
    if (sortedOffers.length === 0) {
      return (
        <div className="bg-white rounded-xl border border-slate-200 p-5">
          <h3 className="text-sm font-extrabold text-slate-900">{t("chart.barometer")}</h3>
          <p className="text-xs text-slate-500 mt-1">{t("product.noStoreInStock")}</p>
        </div>
      );
    }

    return (
      <div className="bg-white rounded-xl border border-slate-200 p-5 space-y-4">
        {/* Header Badges */}
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <span>{t("chart.barometer")}</span>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                {t("chart.realtime")}
              </span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {points.length > 0 ? t("chart.historyBuilding", { count: points.length, plural: Math.abs(points.length) > 1 ? "s" : "" }) : t("chart.historyBuildingLive")}
            </p>
          </div>

          {diff > 0 && (
            <div className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 shadow-sm">
              <span>{t("chart.potentialSaving")}</span>
              <span className="text-sm font-extrabold text-emerald-700">+{money(diff)}</span>
            </div>
          )}
        </div>

        {/* 3 Metric Cards */}
        {stats && (
          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">{t("chart.bestPrice")}</div>
              <div className="text-base sm:text-lg font-black text-emerald-800 mt-0.5">
                {money(stats.min)}
              </div>
              {minOffer && (
                <div className="text-[11px] text-emerald-700 flex items-center justify-center gap-1.5 mt-1 font-semibold truncate">
                  <StoreLogo store={minOffer.store} size={16} />
                  <span>{t("common.atStore", { store: minOffer.store })}</span>
                </div>
              )}
            </div>

            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500">{t("chart.avgPrice")}</div>
              <div className="text-base sm:text-lg font-black text-slate-800 mt-0.5">
                {money(stats.avg)}
              </div>
              <div className="text-[11px] text-slate-500 mt-1 font-semibold">{t("chart.indexedStores", { count: sortedOffers.length, plural: Math.abs(sortedOffers.length) > 1 ? "s" : "" })}</div>
            </div>

            <div className="p-3 rounded-lg bg-rose-50/70 border border-rose-100 text-center">
              <div className="text-[10px] font-bold uppercase tracking-wider text-rose-600">{t("chart.maxPrice")}</div>
              <div className="text-base sm:text-lg font-black text-rose-800 mt-0.5">
                {money(stats.max)}
              </div>
              {maxOffer && (
                <div className="text-[11px] text-rose-700 flex items-center justify-center gap-1.5 mt-1 font-semibold truncate">
                  <StoreLogo store={maxOffer.store} size={16} />
                  <span>{t("common.atStore", { store: maxOffer.store })}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Visual Spread Barometer */}
        {sortedOffers.length > 1 && stats && stats.spread > 0 && (
          <div className="pt-2">
            <div className="flex justify-between text-[11px] font-bold text-slate-500 mb-1.5">
              <span>{t("chart.spreadScale")}</span>
              <span>{t("chart.spreadValue", { value: money(stats.spread) })}</span>
            </div>
            <div className="relative w-full h-3 bg-gradient-to-r from-emerald-400 via-amber-300 to-rose-400 rounded-full shadow-inner overflow-hidden" />
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{money(stats.min)} ({t("chart.min")})</span>
              <span>{money(stats.avg)} ({t("chart.avg")})</span>
              <span>{money(stats.max)} ({t("chart.max")})</span>
            </div>
          </div>
        )}

        {/* Store Quotes Chips */}
        <div className="pt-2">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            {t("chart.storesHeading")}
          </div>
          <div className="flex flex-wrap gap-2">
            {sortedOffers.map((o, idx) => {
              const isBest = idx === 0;
              return (
                <div
                  key={`${o.store}-${idx}`}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border flex items-center gap-2 ${
                    isBest
                      ? "bg-emerald-50 border-emerald-300 text-emerald-950 font-bold shadow-sm"
                      : "bg-white border-slate-200 text-slate-700"
                  }`}
                >
                  <StoreLogo store={o.store} size={18} />
                  <span className="font-semibold">{o.store} :</span>
                  <span className={isBest ? "text-emerald-700 font-extrabold" : "text-slate-900 font-bold"}>
                    {money(o.priceDa)}
                  </span>
                  {isBest && (
                    <span className="text-[9px] bg-emerald-600 text-white font-extrabold px-1.5 py-0.5 rounded uppercase">{t("chart.topDeal")}</span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

  // Multi-day Interactive SVG Chart
  const W = 620;
  const H = 200;
  const PAD_X = 20;
  const PAD_Y = 25;
  // Right gutter reserved for the min/max scale labels. Without it the labels
  // are right-aligned onto the plot's last column and collide with the data
  // lines and the final x-axis date.
  const PAD_R = 66;
  const PLOT_W = W - PAD_X - PAD_R;

  const minVal = stats ? stats.min : 0;
  const maxVal = stats ? stats.max : 1;
  const span = Math.max(1, maxVal - minVal);

  const getX = (d: string) => {
    const idx = days.indexOf(d);
    return PAD_X + (idx / Math.max(1, days.length - 1)) * PLOT_W;
  };

  const getY = (v: number) => {
    return PAD_Y + (1 - (v - minVal) / span) * (H - PAD_Y * 2);
  };

  // Keep the two scale labels from stacking when the range is tight.
  // The min label sits BELOW the max label, so compare the absolute gap.
  const labelYMax = PAD_Y + 4;
  let labelYMin = H - PAD_Y + 4;
  if (Math.abs(labelYMax - labelYMin) < 13) {
    labelYMin = labelYMax + 13;
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 sm:p-6 space-y-5">
      {/* Top Header & Stats Summary */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-extrabold text-slate-900">{t("chart.evolution")}</h3>
            {stats && stats.trend === "down" && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                {t("chart.falling", { pct: stats.trendPct })}
              </span>
            )}
            {stats && stats.trend === "up" && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1">
                {t("chart.rising", { pct: stats.trendPct })}
              </span>
            )}
            {stats && stats.trend === "stable" && (
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200 flex items-center gap-1">
                {t("chart.stable")}
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {t("chart.dailySince", { date: days[0], count: days.length })}
          </p>
        </div>

        {/* Min / Avg / Max Snapshot */}
        {stats && (
          <div className="flex items-center gap-4 text-right">
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("chart.floor")}</div>
              <div className="text-sm sm:text-base font-extrabold text-emerald-600">
                {money(stats.min)}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("chart.average")}</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-700">
                {money(stats.avg)}
              </div>
            </div>
            <div className="w-px h-8 bg-slate-200" />
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{t("chart.ceiling")}</div>
              <div className="text-sm sm:text-base font-extrabold text-slate-800">
                {money(stats.max)}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* SVG Interactive Chart

          The SVG is a fixed 620-unit-wide viewBox, so on a 360px phone the
          scale labels and the 10px axis text render at roughly 6px: the price
          history was effectively unreadable. Below `sm` the plot is therefore
          given a 560px floor and the container scrolls sideways, which keeps
          every label legible. The reserved right gutter (PAD_R) is untouched,
          so the min/max labels still clear the plot on both layouts. */}
      <div className="relative overflow-x-auto">
        <div className="relative min-w-[560px sm:min-w-0">
        {/* Hover Tooltip */}
        {hoveredPoint && (
          <div
            className="absolute z-20 pointer-events-none -translate-x-1/2 -translate-y-full -top-3 bg-slate-900 text-white text-xs rounded-lg px-3 py-2 shadow-xl border border-slate-700 min-w-[130px]"
            style={{
              left: `${(hoveredPoint.x / W) * 100}%`,
              top: `${(hoveredPoint.y / H) * 100}%`,
            }}
          >
            <div className="text-[10px] font-semibold text-slate-400">{hoveredPoint.day}</div>
            <div className="font-extrabold text-emerald-400 text-sm mt-0.5">
              {money(hoveredPoint.price)}
            </div>
            <div className="text-[11px] text-slate-200 truncate mt-0.5 font-medium">
              {t("common.atStore", { store: hoveredPoint.store })}
            </div>
          </div>
        )}

        <svg
          viewBox={`0 0 ${W} ${H}`}
          className="w-full h-auto select-none"
          role="img"
          aria-label={t("chart.aria")}
        >
          {/* Horizontal Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map((f) => {
            const yPos = PAD_Y + f * (H - PAD_Y * 2);
            return (
              <line
                key={f}
                x1={PAD_X}
                x2={PAD_X + PLOT_W}
                y1={yPos}
                y2={yPos}
                stroke="#f1f5f9"
                strokeWidth="1"
              />
            );
          })}

          {/* Store Polylines & Nodes */}
          {sortedStores.slice(0, 5).map(({ store, pts }, i) => {
            const color = STORE_COLORS[i % STORE_COLORS.length];
            const polylinePoints = pts.map((p) => `${getX(p.day)},${getY(p.price)}`).join(" ");

            return (
              <g key={store}>
                <polyline
                  points={polylinePoints}
                  fill="none"
                  stroke={color}
                  strokeWidth="2.5"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  className="transition-all duration-200"
                />
                {pts.map((p) => {
                  const cx = getX(p.day);
                  const cy = getY(p.price);
                  return (
                    <circle
                      key={`${store}-${p.day}-${p.price}`}
                      cx={cx}
                      cy={cy}
                      r="4.5"
                      fill={color}
                      stroke="#ffffff"
                      strokeWidth="2"
                      className="cursor-pointer transition-transform hover:scale-150"
                      onMouseEnter={() => setHoveredPoint({ store, day: p.day, price: p.price, x: cx, y: cy })}
                      onMouseLeave={() => setHoveredPoint(null)}
                      /* Touch: `hover` does not exist on a phone, so every data
                         point was permanently unreadable. Focus + click give
                         keyboard and finger the same affordance as the mouse. */
                      tabIndex={0}
                      role="button"
                      aria-label={`${p.day} — ${money(p.price)} — ${t("common.atStore", { store })}`}
                      onFocus={() => setHoveredPoint({ store, day: p.day, price: p.price, x: cx, y: cy })}
                      onBlur={() => setHoveredPoint(null)}
                      onClick={() => setHoveredPoint({ store, day: p.day, price: p.price, x: cx, y: cy })}
                    />
                  );
                })}
              </g>
            );
          })}

          {/* X Axis Labels */}
          <text x={PAD_X} y={H - 5} fontSize="10" fill="#94a3b8" fontWeight="600">
            {days[0]}
          </text>
          <text x={PAD_X + PLOT_W} y={H - 5} fontSize="10" fill="#94a3b8" fontWeight="600" textAnchor="end">
            {days[days.length - 1]}
          </text>

          {/* Y Axis Reference Labels — parked in the right gutter, clear of the plot */}
          <text x={PAD_X + PLOT_W + 8} y={labelYMax} fontSize="10" fill="#64748b" fontWeight="600">
            {money(maxVal)}
          </text>
          <text x={PAD_X + PLOT_W + 8} y={labelYMin} fontSize="10" fill="#64748b" fontWeight="600">
            {money(minVal)}
          </text>
        </svg>
        </div>
      </div>

      {/* Legend & Store Indicators */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{t("chart.stores")}</span>
          {sortedStores.slice(0, 5).map(({ store, pts }, i) => (
            <span key={store} className="text-xs text-slate-700 flex items-center gap-1.5 font-medium bg-slate-50 px-2 py-1 rounded-md border border-slate-200/60">
              <span
                className="w-2 h-2 rounded-full inline-block shadow-sm shrink-0"
                style={{ background: STORE_COLORS[i % STORE_COLORS.length] }}
              />
              <StoreLogo store={store} size={16} />
              <span className="font-semibold">{store}</span>
              <span className="text-[10px] text-slate-500 font-bold">
                ({money(pts[pts.length - 1].price)})
              </span>
            </span>
          ))}
        </div>

        <div className="text-[11px] text-slate-400 italic">
          {t("chart.hoverHint")}
        </div>
      </div>
    </div>
  );
}
