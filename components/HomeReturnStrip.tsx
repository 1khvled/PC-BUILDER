"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { priceMove, loadWatchlist } from "@/lib/watchlist";
import { loadRecent } from "@/lib/recent";
import { useT } from "@/lib/i18n/client";
import { formatPrice, localizedPath, type Locale } from "@/lib/i18n/config";

/**
 * THE RETURN STRIP
 * ================
 * The home page is where a returning visitor lands, and until now it showed them
 * the same thing as a first-time visitor. This gives them a reason to have come
 * back: what they were tracking moved, and what they were looking at.
 *
 * Two surfaces, one component, because they answer the same question
 * ("what's new for me?") and splitting them would double the fetch:
 *   1. tracked parts that have dropped since their last visit
 *   2. recently viewed parts
 *
 * Both read from localStorage, so neither exists until the visitor has used the
 * feature. The strip renders nothing at all for a first-time visitor rather than
 * showing an empty box.
 *
 * Prices come from /api/watchlist, which takes an explicit id list, so this
 * costs one small request and only for people who have something to see.
 */

interface Row {
  id: string;
  brand: string;
  model: string;
  bestPrice: number | null;
  bestStore: string | null;
}

function Thumbish({ row, locale, t }: { row: Row; locale: Locale; t: ReturnType<typeof useT> }) {
  return (
    <Link
      href={localizedPath(`/product/${row.id}`, locale)}
      className="flex min-w-0 flex-1 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-[#2c87c3] dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-[#5fb0e0]"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
          {row.brand} {row.model}
        </span>
        {row.bestPrice != null ? (
          <span className="mt-0.5 block text-[11px] font-extrabold tabular-nums text-slate-700 dark:text-slate-200">
            {formatPrice(row.bestPrice, locale)}
            {row.bestStore && <span className="ml-1 font-normal text-slate-500">· {row.bestStore}</span>}
          </span>
        ) : (
          <span className="mt-0.5 block text-[11px] text-slate-500">{t("watch.noOffers")}</span>
        )}
      </span>
    </Link>
  );
}

export default function HomeReturnStrip({ locale }: { locale: Locale }) {
  const t = useT();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [dropped, setDropped] = useState<{ id: string; pct: number }[]>([]);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const watch = loadWatchlist();
    const rec = loadRecent();
    setRecent(rec.items.map((e) => e.id).slice(0, 6));

    // Union of both lists, deduped. The cap keeps one request small.
    const ids = Array.from(new Set([...Object.keys(watch.items), ...rec.items.map((e) => e.id)])).slice(0, 12);
    if (ids.length === 0) {
      setRows([]);
      return;
    }

    let cancelled = false;
    fetch(`/api/watchlist?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((data: { rows?: Row[] }) => {
        if (cancelled) return;
        const fetched = Array.isArray(data.rows) ? data.rows : [];
        setRows(fetched);
        setDropped(
          fetched
            .map((row) => {
              const move = priceMove(watch.items[row.id], row.bestPrice);
              return { id: row.id, pct: Math.abs(Math.round(move.pct)), move };
            })
            .filter((x) => x.move.direction === "down" && x.pct >= 1)
            .map((x) => ({ id: x.id, pct: x.pct })),
        );
      })
      .catch(() => {
        // A failed fetch must never break the home page. Showing nothing is the
        // correct failure: the rest of the page is unaffected.
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const droppedRows = useMemo(
    () => (rows ?? []).filter((r) => dropped.some((d) => d.id === r.id)),
    [rows, dropped],
  );
  const recentRows = useMemo(
    // Exclude anything already shown as a drop, so a part is not listed twice.
    () => (rows ?? []).filter((r) => recent.includes(r.id) && !dropped.some((d) => d.id === r.id)).slice(0, 6),
    [rows, recent, dropped],
  );

  if (!rows || (droppedRows.length === 0 && recentRows.length === 0)) return null;

  return (
    <section className="mt-6 space-y-3" aria-labelledby="dz-return-strip">
      {droppedRows.length > 0 && (
        <div>
          <div className="mb-2 flex items-center justify-between gap-2">
            <h2
              id="dz-return-strip"
              className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              {t("home.dropsTitle")}
            </h2>
            <Link
              href={localizedPath("/watchlist", locale)}
              className="text-[11px] font-bold text-[#2c87c3] hover:underline dark:text-[#5fb0e0]"
            >
              {t("home.viewAll")}
            </Link>
          </div>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {droppedRows.map((row) => (
              <li key={row.id} className="relative">
                <Thumbish row={row} locale={locale} t={t} />
                <span className="pointer-events-none absolute -top-1.5 left-2 inline-flex items-center gap-1 rounded-md border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-black text-emerald-700 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-300">
                  <span aria-hidden="true">▼</span>
                  {t("watch.dropped", { pct: dropped.find((d) => d.id === row.id)?.pct ?? 0 })}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {recentRows.length > 0 && (
        <div>
          <h2 className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("home.recentTitle")}
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {recentRows.map((row) => (
              <li key={row.id}>
                <Thumbish row={row} locale={locale} t={t} />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
