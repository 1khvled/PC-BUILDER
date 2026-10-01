"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, type Product } from "@/lib/data/products";
import {
  CPU_BASELINE,
  GPU_BASELINE,
  CPU_BENCH,
  GPU_BENCH,
  RAM_BENCH,
  SSD_BENCH,
} from "@/lib/data/benchmarks";
import { sourcesFor, type BenchmarkSource } from "@/lib/data/benchmarkSources";
import { useT } from "@/lib/i18n/client";
import { localizedPath, type Locale } from "@/lib/i18n/config";

/**
 * SPECIFICATIONS + PERFORMANCE INDEX
 * ==================================
 * This page deliberately leads with facts, not scores.
 *
 * The specification chips come straight from the product record in the
 * catalogue: core counts, sockets, TDP, memory type, interface. They are
 * verifiable against the box and are what a buyer is actually deciding on.
 *
 * The performance figure is OUR OWN rounded index, labelled as ours, kept
 * because the builder reasons with it rather than because it is a lab result.
 * It sits below the specs and always carries its label. Presenting it as the
 * headline was the mistake - "100" next to a Ryzen 5 5600 reads like a
 * measurement, and it is not one.
 *
 * Every row links out to the public sources where real measured figures live,
 * so a reader who wants Cinebench or PassMark numbers can go and check.
 */

type Row = {
  product: Product;
  /** Objective specifications, already localised. These are the headline. */
  specs: { label: string; value: string }[];
  /** Our own index. Null when the category has no index for this part. */
  estimate: number | null;
  estimateLabel: string;
};

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

/**
 * WHAT BELONGS ON THIS PAGE
 * ========================
 * Only the parts where the buyer is actually choosing between a faster and a
 * slower option, and where the catalogue holds real specifications to compare.
 *
 * Deliberately excluded:
 * - monitor  A monitor's entire spec sheet here is size and refresh rate. Two
 *            numbers, no comparison worth a page, and it is not a component
 *            that slots into a build.
 * - cooler   One real field (height) and sockets. Its interesting number is a
 *            TDP rating WE invented, which is precisely what this page must
 *            not present as fact.
 * - case     Three clearance fields. Real, but fit checks belong on the product
 *            page and in the builder's compatibility warnings, not in a
 *            performance table.
 *
 * A category is added here only when it clears both tests: real specs in the
 * catalogue, and something meaningful to compare them on.
 */
const SCOPE: ReadonlySet<string> = new Set([
  "cpu",
  "gpu",
  "motherboard",
  "ram",
  "ssd",
  "psu",
]);

/** VRAM is not stored as a spec field; it lives in the model name. */
function vramFromModel(model: string): string | null {
  const m = model.match(/(\d+)\s?gb/i);
  return m ? `${m[1]} GB` : null;
}

function yesNo(v: unknown): string | null {
  if (typeof v === "boolean") return v ? "yes" : "no";
  if (typeof v === "string" && v.length > 0) return v;
  return null;
}

function buildRows(products: Product[], t: ReturnType<typeof useT>): Row[] {
  const rows: Row[] = [];

  for (const p of products) {
    if (!SCOPE.has(p.category)) continue;

    const s = p.specs as Record<string, unknown>;
    const str = (k: string) => (typeof s[k] === "string" ? (s[k] as string) : null);
    const int = (k: string) => (typeof s[k] === "number" ? (s[k] as number) : null);

    const specs: { label: string; value: string }[] = [];
    const add = (label: string, value: string | null | undefined) => {
      if (value) specs.push({ label, value });
    };

    // --- Specifications: what the part IS ---
    switch (p.category) {
      case "cpu": {
        const b = CPU_BENCH[p.id];
        add(t("benchmarks.cores"), b ? String(b.cores) : int("cores")?.toString() ?? null);
        add(t("benchmarks.threads"), b ? String(b.threads) : int("threads")?.toString() ?? null);
        add(t("benchmarks.socket"), str("socket"));
        add(t("benchmarks.ramType"), str("ram_type"));
        const tdp = int("tdp");
        add(t("benchmarks.tdp"), tdp ? `${tdp} W` : null);
        add(t("benchmarks.igpu"), yesNo(s.igpu));
        break;
      }
      case "gpu": {
        add(t("benchmarks.vram"), vramFromModel(p.model));
        const tdp = int("tdp_w");
        add(t("benchmarks.tdp"), tdp ? `${tdp} W` : null);
        add(t("benchmarks.length"), int("length_mm") ? `${s.length_mm} mm` : null);
        add(t("benchmarks.powerPins"), str("pins"));
        break;
      }
      case "motherboard": {
        add(t("benchmarks.chipset"), str("chipset"));
        add(t("benchmarks.socket"), str("socket"));
        add(t("benchmarks.ramType"), str("ram_type"));
        add(t("benchmarks.m2Slots"), int("m2") ? String(s.m2) : null);
        add(t("benchmarks.formFactor"), str("form_factor"));
        break;
      }
      case "ram": {
        // Only what the stick is actually labelled with. RAM_BENCH.bandwidth is
        // our relative index and its `latencyNs` is really the CL number, not a
        // nanosecond figure - (16/3200)*2000 = 10 ns for a 3200 CL16 kit. Neither
        // belongs in a column headed "specifications".
        add(t("benchmarks.capacity"), int("capacity_gb") ? `${s.capacity_gb} GB` : null);
        add(t("benchmarks.ramType"), str("type"));
        add(t("benchmarks.speed"), str("speed"));
        break;
      }
      case "ssd": {
        // SSD_BENCH carries real interface-speed figures (spec-sheet values, not
        // an index), so these are specifications rather than an estimate.
        const b = SSD_BENCH[p.id];
        add(t("benchmarks.interface"), b?.interface ?? str("interface"));
        add(t("benchmarks.seqRead"), b ? `${fmt(b.seqRead)} MB/s` : null);
        add(t("benchmarks.seqWrite"), b ? `${fmt(b.seqWrite)} MB/s` : null);
        add(t("benchmarks.random4k"), b ? `${fmt(b.random4k)} IOPS` : null);
        break;
      }
      case "psu": {
        add(t("benchmarks.wattage"), int("wattage") ? `${s.wattage} W` : null);
        add(t("benchmarks.efficiency"), str("rating"));
        break;
      }
      default:
        break;
    }

    if (specs.length === 0) continue;

    // --- Our index: what we THINK it does. Always labelled, never the headline. ---
    let estimate: number | null = null;
    let estimateLabel = "";
    if (p.category === "cpu") {
      const b = CPU_BENCH[p.id];
      if (b) { estimate = b.multi; estimateLabel = t("benchmarks.index"); }
    } else if (p.category === "gpu") {
      const b = GPU_BENCH[p.id];
      if (b) { estimate = b.raster1080; estimateLabel = t("benchmarks.raster1080"); }
    } else if (p.category === "ram") {
      const b = RAM_BENCH[p.id];
      if (b) { estimate = b.bandwidth; estimateLabel = t("benchmarks.index"); }
    } else if (p.category === "ssd") {
      const b = SSD_BENCH[p.id];
      if (b) { estimate = b.seqRead; estimateLabel = t("benchmarks.seqRead"); }
    }

    rows.push({ product: p, specs, estimate, estimateLabel });
  }

  return rows.sort((a, b) => (b.estimate ?? 0) - (a.estimate ?? 0));
}

function SourceList({ sources, t }: { sources: BenchmarkSource[]; t: ReturnType<typeof useT> }) {
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1">
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

  // Only offer filters that actually have parts behind them, so the filter bar
  // can never select an empty view.
  const available = useMemo(() => {
    const set = new Set(all.map((r) => r.product.category));
    return CATEGORIES.filter((c) => set.has(c.slug));
  }, [all]);

  // CATEGORIES[].label is hardcoded English. The translated names live in the
  // `cats.*` dictionary family, which is what the category pages use.
  const catLabel = (slug: string) => t(`cats.${slug}` as "cats.cpu");

  const filterBtn = (active: boolean) =>
    `rounded-lg px-2.5 py-1 text-xs font-semibold transition-colors ${
      active
        ? "bg-slate-900 text-white dark:bg-white dark:text-slate-900"
        : "border border-slate-200 text-slate-600 hover:border-slate-300 dark:border-slate-700 dark:text-slate-300"
    }`;

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        {t("benchmarks.why")}
      </p>

      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
        {t("benchmarks.scrapeNote")}
      </p>

      {/* The baseline is stated up front, not buried under the table. An index
          without its reference point is meaningless, and that is exactly how
          "100" ends up being misread as a measured score. */}
      <details className="rounded-xl border border-slate-200 bg-white p-3 dark:border-slate-700 dark:bg-slate-800/40">
        <summary className="cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-200">
          {t("benchmarks.indexExplained")}
        </summary>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t("benchmarks.baselineCpu")}: <b className="text-slate-900 dark:text-white">100 = {CPU_BASELINE}</b>
          </p>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            {t("benchmarks.baselineGpu")}: <b className="text-slate-900 dark:text-white">100 = {GPU_BASELINE}</b>
          </p>
        </div>
      </details>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">{t("benchmarks.filter")}</span>
        <button onClick={() => setFilter("all")} className={filterBtn(filter === "all")}>
          {t("benchmarks.all")}
        </button>
        {available.map((c) => (
          <button key={c.slug} onClick={() => setFilter(c.slug)} className={filterBtn(filter === c.slug)}>
            {catLabel(c.slug)}
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
            {/* Name, then specs. The specifications are the content of this row;
                the index is a footnote, not a headline. */}
            <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
              <Link
                href={localizedPath(`/product/${row.product.id}`, locale)}
                className="text-sm font-bold text-slate-900 hover:text-[#2c87c3] dark:text-white dark:hover:text-[#5fb0e0]"
              >
                {row.product.brand} {row.product.model}
              </Link>
              {row.estimate != null && (
                <span className="inline-flex items-baseline gap-1 text-slate-400 dark:text-slate-500">
                  <span className="text-sm font-bold tabular-nums">{fmt(row.estimate)}</span>
                  <span className="text-[10px] uppercase tracking-wide">
                    {row.estimateLabel} · {t("benchmarks.ourEstimate")}
                  </span>
                </span>
              )}
            </div>

            <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1">
              {row.specs.map((x) => (
                <li key={x.label} className="text-[11px] text-slate-500 dark:text-slate-400">
                  {x.label}{" "}
                  <b className="tabular-nums text-slate-700 dark:text-slate-200">{x.value}</b>
                </li>
              ))}
            </ul>

            <SourceList sources={sourcesFor(row.product.id, row.product.category, row.product.model)} t={t} />
          </li>
        ))}
      </ul>
    </div>
  );
}
