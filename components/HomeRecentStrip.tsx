"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { loadRecent } from "@/lib/recent";
import { useT } from "@/lib/i18n/client";
import { formatPrice, localizedPath, type Locale } from "@/lib/i18n/config";

/**
 * RECENTLY VIEWED STRIP
 * =====================
 * "Where was that PSU I was looking at?" is one of the most common ways a
 * shopping session ends without a purchase, and the home page is where people
 * land when they come back. This closes that loop.
 *
 * Renders nothing for a first-time visitor rather than an empty box: the whole
 * point is that it only appears once it has something to say.
 *
 * Prices come from /api/parts, which takes an explicit id list, so this costs
 * one small request and only for people who have actually looked at something.
 */
interface Row {
  id: string;
  brand: string;
  model: string;
  bestPrice: number | null;
  bestStore: string | null;
}

export default function HomeRecentStrip({ locale }: { locale: Locale }) {
  const t = useT();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [recent, setRecent] = useState<string[]>([]);

  useEffect(() => {
    const rec = loadRecent();
    setRecent(rec.items.map((e) => e.id).slice(0, 6));

    const ids = rec.items.map((e) => e.id).slice(0, 12);
    if (ids.length === 0) {
      setRows([]);
      return;
    }

    let cancelled = false;
    fetch(`/api/parts?ids=${encodeURIComponent(ids.join(","))}`)
      .then((r) => r.json())
      .then((data: { rows?: Row[] }) => {
        if (!cancelled) setRows(Array.isArray(data.rows) ? data.rows : []);
      })
      .catch(() => {
        // A failed price fetch must never break the home page. The rest of the
        // page is unaffected and the strip simply does not appear.
        if (!cancelled) setRows([]);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => (rows ?? []).filter((r) => recent.includes(r.id)).slice(0, 6),
    [rows, recent],
  );

  if (!rows || visible.length === 0) return null;

  return (
    <section className="mt-6" aria-labelledby="dz-recent-strip">
      <h2
        id="dz-recent-strip"
        className="mb-2 text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400"
      >
        {t("home.recentTitle")}
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((row) => (
          <li key={row.id}>
            <Link
              href={localizedPath(`/product/${row.id}`, locale)}
              className="flex min-w-0 items-center gap-2.5 rounded-lg border border-slate-200 bg-white px-3 py-2.5 transition-colors hover:border-[#2c87c3] dark:border-slate-700 dark:bg-slate-800/40 dark:hover:border-[#5fb0e0]"
            >
              <span className="min-w-0 flex-1">
                <span className="block truncate text-xs font-bold text-slate-900 dark:text-white">
                  {row.brand} {row.model}
                </span>
                {row.bestPrice != null ? (
                  <span className="mt-0.5 block text-[11px] font-extrabold tabular-nums text-slate-700 dark:text-slate-200">
                    {formatPrice(row.bestPrice, locale)}
                    {row.bestStore && (
                      <span className="ml-1 font-normal text-slate-500">· {row.bestStore}</span>
                    )}
                  </span>
                ) : (
                  <span className="mt-0.5 block text-[11px] text-slate-500">{t("watch.noOffers")}</span>
                )}
              </span>
              <span aria-hidden="true" className="shrink-0 text-slate-300 dark:text-slate-600">
                →
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
