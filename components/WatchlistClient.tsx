"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES } from "@/lib/data/products";
import { priceMove, loadWatchlist, rememberCurrentPrice, type PriceMove, type Watchlist } from "@/lib/watchlist";
import WatchButton from "@/components/WatchButton";
import { useT } from "@/lib/i18n/client";
import { formatDate, formatPrice, localizedPath, type Locale } from "@/lib/i18n/config";

/**
 * "My parts" - the watchlist.
 *
 * Client component on purpose: the whole point is comparing today's price with
 * the price we remembered from the visitor's previous visit, and that baseline
 * only exists in their browser. Rendering this on the server would show an empty
 * list for everyone and then pop the contents in, which is worse than a brief
 * skeleton because it invites a layout shift.
 *
 * Prices and history are passed in from the server page, so no catalog data is
 * duplicated into the client bundle beyond the tracked ids.
 */

export interface WatchRow {
  id: string;
  category: string;
  brand: string;
  model: string;
  bestPrice: number | null;
  bestStore: string | null;
  bestWilaya: string | null;
  /** Cheapest price in the trailing 90-day window, for the trend bar. */
  price90: number | null;
}

function TrendBar({ current, past }: { current: number | null; past: number | null }) {
  if (current == null || past == null || past <= 0) return null;
  const ratio = Math.max(0.35, Math.min(1.65, current / past));
  const width = `${(ratio / 1.65) * 100}%`;
  const down = current < past;
  return (
    <div className="mt-1.5">
      <div className="h-1.5 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
        <div
          className={`h-full rounded-full ${down ? "bg-emerald-500" : "bg-amber-500"}`}
          style={{ width }}
        />
      </div>
    </div>
  );
}

function MoveBadge({ move, t }: { move: PriceMove; t: ReturnType<typeof useT> }) {
  // Under 1% is noise. Reporting it would train people to ignore the badge,
  // which is the one thing this page cannot afford.
  const meaningful = move.direction === "down" || move.direction === "up" ? Math.abs(move.pct) >= 1 : false;

  if (move.direction === "unknown" || move.previousPrice == null) {
    return <span className="text-[11px] text-slate-500">{t("watch.firstLook")}</span>;
  }
  if (!meaningful) {
    return <span className="text-[11px] text-slate-500">{t("watch.unchanged")}</span>;
  }
  const pct = Math.abs(Math.round(move.pct));
  return move.direction === "down" ? (
    <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 border border-emerald-200 px-1.5 py-0.5 text-[11px] font-bold text-emerald-700 dark:bg-emerald-500/10 dark:border-emerald-500/30 dark:text-emerald-300">
      <span aria-hidden="true">▼</span>
      {t("watch.dropped", { pct })}
    </span>
  ) : (
    <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 border border-amber-200 px-1.5 py-0.5 text-[11px] font-bold text-amber-700 dark:bg-amber-500/10 dark:border-amber-500/30 dark:text-amber-300">
      <span aria-hidden="true">▲</span>
      {t("watch.rose", { pct })}
    </span>
  );
}

export default function WatchlistClient({ locale }: { locale: Locale }) {
  const t = useT();
  const [list, setList] = useState<Watchlist | null>(null);
  const [rows, setRows] = useState<WatchRow[]>([]);

  useEffect(() => {
    const loaded = loadWatchlist();
    setList(loaded);

    const onChange = () => setList(loadWatchlist());
    window.addEventListener("dz:watchlist", onChange);
    return () => window.removeEventListener("dz:watchlist", onChange);
  }, []);

  // Fetch prices for just the tracked ids. Done after the list is read because
  // only the browser knows which ids matter, and requesting the whole 4 000+
  // product catalogue to filter it client-side would be wasteful.
  const ids = useMemo(() => (list ? Object.keys(list.items) : []), [list]);
  const idsKey = ids.join(",");
  useEffect(() => {
    if (!idsKey) {
      setRows([]);
      return;
    }
    let cancelled = false;
    fetch(`/api/watchlist?ids=${encodeURIComponent(idsKey)}`)
      .then((r) => r.json())
      .then((data: { rows?: WatchRow[] }) => {
        if (!cancelled) setRows(Array.isArray(data.rows) ? data.rows : []);
      })
      .catch(() => {
        // A failed price fetch must not break the page: the watchlist itself
        // is still perfectly usable, the prices are just unknown.
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, [idsKey]);

  // Record today's prices once the list is known, so the next visit has a
  // baseline. Done in an effect (never during render) because it writes to
  // localStorage, and doing that while rendering would be a side effect.
  useEffect(() => {
    if (!list) return;
    for (const row of rows) {
      rememberCurrentPrice(row.id, row.bestPrice);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [list === null]);

  const visible = useMemo(() => {
    if (!list) return [];
    return rows.filter((r) => list.items[r.id]);
  }, [list, rows]);

  const dropped = useMemo(
    () => visible.filter((r) => {
      const m = priceMove(list?.items[r.id], r.bestPrice);
      return m.direction === "down" && Math.abs(m.pct) >= 1;
    }).length,
    [visible, list],
  );

  if (!list) {
    return (
      <div className="space-y-2" aria-hidden="true">
        {[0, 1, 2].map((i) => (
          <div key={i} className="h-24 rounded-xl dz-skeleton" />
        ))}
      </div>
    );
  }

  if (visible.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center dark:border-slate-700 dark:bg-slate-800/40">
        <div className="text-3xl mb-2" aria-hidden="true">☆</div>
        <h2 className="font-extrabold text-slate-900 dark:text-white">{t("watch.empty")}</h2>
        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md mx-auto">{t("watch.emptyHint")}</p>
        <div className="mt-5 flex flex-wrap gap-2 justify-center">
          {CATEGORIES.slice(0, 6).map((c) => (
            <Link
              key={c.slug}
              href={localizedPath(`/category/${c.slug}`, locale)}
              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:border-[#2c87c3] hover:text-[#2c87c3] dark:border-slate-700 dark:text-slate-300"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-slate-600 dark:text-slate-400" role="status">
        {t("watch.summary", { count: visible.length, dropped })}
      </p>

      <ul className="space-y-2">
        {visible.map((row) => {
          const entry = list.items[row.id];
          const move = priceMove(entry, row.bestPrice);
          return (
            <li
              key={row.id}
              className="rounded-xl border border-slate-200 bg-white p-3 sm:p-4 dark:border-slate-700 dark:bg-slate-800/40"
            >
              <div className="flex items-start gap-3">
                <div className="min-w-0 flex-1">
                  <Link
                    href={localizedPath(`/product/${row.id}`, locale)}
                    className="font-bold text-slate-900 hover:text-[#2c87c3] dark:text-white dark:hover:text-[#5fb0e0]"
                  >
                    {row.brand} {row.model}
                  </Link>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {t("watch.added", { date: formatDate(new Date(entry.addedAt).toISOString().slice(0, 10), locale) })}
                  </p>
                  <div className="mt-1.5">
                    <MoveBadge move={move} t={t} />
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-extrabold tabular-nums text-slate-900 dark:text-white">
                    {row.bestPrice != null ? formatPrice(row.bestPrice, locale) : t("watch.noOffers")}
                  </div>
                  {row.bestStore && (
                    <div className="text-[11px] text-slate-500 dark:text-slate-400">
                      {row.bestStore}
                      {row.bestWilaya ? ` · ${row.bestWilaya}` : ""}
                    </div>
                  )}
                  <TrendBar current={row.bestPrice} past={row.price90} />
                </div>

                <WatchButton productId={row.id} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

