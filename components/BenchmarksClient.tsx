"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, type Category, type Product } from "@/lib/data/products";
import {
  CPU_BASELINE,
  GPU_BASELINE,
  CPU_BENCH,
  GPU_BENCH,
  RAM_BENCH,
  SSD_BENCH,
  COOLER_BENCH,
} from "@/lib/data/benchmarks";
import { sourcesFor, type BenchmarkSource } from "@/lib/data/benchmarkSources";
import { useT } from "@/lib/i18n/client";
import { localizedPath, type Locale } from "@/lib/i18n/config";

/**
 * The benchmark page.
 *
 * The design rule here is honesty about provenance. Every row shows an index we
 * computed AND the public sources a reader can check it against, and the two are
 * visually distinguished: our own number is labelled as ours, and external links
 * are marked as opening elsewhere. A visitor should never be left wondering
 * whether a figure came from a lab or from us.
 */

type Row = {
  product: Product;
  /** The headline index for this category, and what it means. */
  primary: number | null;
  primaryLabel: string;
  /** Extra columns, already localised. */
  extra: { label: string; value: string }[];
};

function num(n: number): string {
  return n.toLocaleString("en-US");
}

function buildRows(products: Product[], t: ReturnType<typeof useT>): Row[] {
  const rows: Row[] = [];
  for (const p of products) {
    let primary: number | null = null;
    let primaryLabel = t("benchmarks.index");
    const extra: { label: string; value: string }[] = [];

    switch (p.category as Category) {
      case "cpu": {
        const b = CPU_BENCH[p.id];
        if (!b) break;
        primary = b.multi;
        primaryLabel = t("benchmarks.index");
        extra.push({ label: t("benchmarks.cores"), value: `${b.cores}` });
        extra.push({ label: t("benchmarks.threads"), value: `${b.threads}` });
        break;
      }
      case "gpu": {
        const b = GPU_BENCH[p.id];
        if (!b) break;
        primary = b.raster1080;
        primaryLabel = t("benchmarks.raster1080");
        extra.push({ label: t("benchmarks.raster1440"), value: num(b.raster1440) });
        extra.push({ label: t("benchmarks.rt"), value: num(b.rt) });
        break;
      }
      case "ram": {
        const b = RAM_BENCH[p.id];
        if (!b) break;
        primary = b.bandwidth;
        primaryLabel = t("benchmarks.bandwidth");
        extra.push({ label: t("benchmarks.latency"), value: `${b.latencyNs} ns` });
        break;
      }
      case "ssd": {
        const b = SSD_BENCH[p.id];
        if (!b) break;
        primary = b.seqRead;
        primaryLabel = t("benchmarks.seqRead");
        extra.push({ label: t("benchmarks.seqWrite"), value: `${num(b.seqWrite)} MB/s` });
        extra.push({ label: t("benchmarks.random4k"), value: `${num(b.random4k)} IOPS` });
        break;
      }
      case "cooler": {
        const b = COOLER_BENCH[p.id] as { rating_w?: number } | undefined;
        if (!b) break;
        primary = b.rating_w ?? null;
        primaryLabel = "W";
        break;
      }
      default:
        break;
    }

    // Only show parts we actually have a figure for. A row of blanks is worse
    // than an absent row: it implies we have data we do not have.
    if (primary == null) continue;
    rows.push({ product: p, primary, primaryLabel, extra });
  }

  return rows.sort((a, b) => (b.primary ?? 0) - (a.primary ?? 0));
}

function SourceList({ sources, t }: { sources: BenchmarkSource[]; t: ReturnType<typeof useT> }) {
  return (
    <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
      {sources.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target={s.kind === "reported" ? "_blank" : undefined}
          rel={s.kind === "reported" ? "noopener noreferrer" : undefined}
          title={s.kind === "derived" ? t("benchmarks.derivedNote") : t("benchmarks.reportedNote")}
          className={`text-[10px] underline decoration-dotted underline-offset-2 ${
            s.kind === "derived"
              ? "text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              : "text-[#2c87c3] hover:text-[#1f6a9c] dark:text-[#5fb0e0] dark:hover:text-[#8ecbf0]"
          }`}
        >
          {t(s.labelKey as "benchmarks.source.ours")}
          {s.kind === "reported" && <span aria-hidden="true"> ↗</span>}
        </a>
      ))}
    </div>
  );
}

export default function BenchmarksClient({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  const t = useT();
  const [filter, setFilter] = useState<string>("all");

  const all = useMemo(() => buildRows(products, t), [products, t]);
  const rows = useMemo(
    () => (filter === "all" ? all : all.filter((r) => r.product.category === filter)),
    [all, filter],
  );

  // Categories that actually have indexed parts, so the filter never offers an
  // empty view.
  const available = useMemo(() => {
    const set = new Set(all.map((r) => r.product.category));
    return CATEGORIES.filter((c) => set.has(c.slug));
  }, [all]);

  return (
    <div className="space-y-5">
      {/* Baselines first. An index without its reference point is meaningless,
          and burying that under the table is how people end up misreading it. */}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("benchmarks.baselineCpu")}
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">100 = {CPU_BASELINE}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/40">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            {t("benchmarks.baselineGpu")}
          </p>
          <p className="mt-0.5 text-lg font-extrabold text-slate-900 dark:text-white">100 = {GPU_BASELINE}</p>
        </div>
      </div>

      <p className="text-xs text-slate-600 dark:text-slate-400">{t("benchmarks.why")}</p>
      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
        {t("benchmarks.scrapeNote")}
      </p>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("benchmarks.filter")}</span>
        <button
          onClick={() => setFilter("all")}
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
            filter === "all"
              ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
              : "border border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
          }`}
        >
          {t("benchmarks.all")}
        </button>
        {available.map((c) => (
          <button
            key={c.slug}
            onClick={() => setFilter(c.slug)}
            className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
              filter === c.slug
                ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
                : "border border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
            }`}
          >
            {c.label}
          </button>
        ))}
        <span className="ml-auto text-xs text-slate-500 dark:text-slate-400">
          {rows.length} {t("benchmarks.components")}
        </span>
      </div>

      <ul className="space-y-1.5">
        {rows.map((row) => (
          <li
            key={row.product.id}
            className="rounded-lg border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/40"
          >
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <Link
                href={localizedPath(`/product/${row.product.id}`, locale)}
                className="font-bold text-sm text-slate-900 hover:text-[#2c87c3] dark:text-white dark:hover:text-[#5fb0e0]"
              >
                {row.product.brand} {row.product.model}
              </Link>
              <span className="inline-flex items-baseline gap-1">
                <span className="text-base font-extrabold tabular-nums text-slate-900 dark:text-white">
                  {num(row.primary ?? 0)}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">{row.primaryLabel}</span>
              </span>
              {row.extra.map((x) => (
                <span key={x.label} className="text-[11px] text-slate-500 dark:text-slate-400">
                  {x.label} <b className="tabular-nums text-slate-700 dark:text-slate-200">{x.value}</b>
                </span>
              ))}
            </div>
            <SourceList sources={sourcesFor(row.product.id, row.product.category, row.product.model)} t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
