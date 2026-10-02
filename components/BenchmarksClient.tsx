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
 * SPECIFICATIONS + PERFORMANCE INDEX, REBUILT
 * ==========================================
 * The previous page rendered one flat list sorted by a single number. That
 * number mixed CPU multi-thread indices (~100s) with SSD sequential reads
 * (~1000s MB/s), so every drive outranked every processor and the order meant
 * nothing. Sorting across categories with different units is not a ranking.
 *
 * Each category is now its own table with its own columns and its own sort.
 * Specifications lead - they are facts from the product record - and our index
 * sits in clearly labelled columns, never as the headline. Anything we did not
 * measure or cannot defend is absent rather than estimated: unindexed parts
 * show their specs with no number, and unknown values show as dashes.
 */

type Dir = "asc" | "desc";

function fmt(n: number): string {
  return n.toLocaleString("en-US");
}

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


function Th({
  label,
  sortKey,
  activeKey,
  dir,
  onSort,
  align = "left",
}: {
  label: string;
  sortKey?: string;
  activeKey?: string;
  dir?: Dir;
  onSort?: (k: string) => void;
  align?: "left" | "right" | "center";
}) {
  const cls = `px-2.5 py-2 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap ${
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left"
  } ${onSort ? "cursor-pointer select-none hover:text-slate-900 dark:hover:text-white" : "text-slate-400 dark:text-slate-500"}`;
  if (!onSort || !sortKey) return <th className={cls}>{label}</th>;
  const active = activeKey === sortKey;
  return (
    <th className={cls} onClick={() => onSort(sortKey)} aria-sort={active ? (dir === "asc" ? "ascending" : "descending") : undefined}>
      <span className={active ? "text-[#2c87c3] dark:text-[#5fb0e0]" : undefined}>
        {label} {active ? (dir === "asc" ? "▲" : "▼") : ""}
      </span>
    </th>
  );
}

/**
 * Sources cell.
 *
 * The old version returned a wrapping <span> of <a>s, and the browser placed
 * the four ↗ links on their own line under the row content - exactly the "pure
 * slop" pile the screenshot showed. One flat row with a tight gap, each link
 * nowrap, wrapping only at the cell edge rather than mid-sentence.
 */
function SourceCell({ sources, t }: { sources: BenchmarkSource[]; t: ReturnType<typeof useT> }) {
  return (
    <td className="px-2.5 py-2 align-top">
      <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
        {sources.map((s) => (
          <a
            key={s.id}
            href={s.url}
            target={s.kind === "reported" ? "_blank" : undefined}
            rel={s.kind === "reported" ? "noopener noreferrer" : undefined}
            title={s.kind === "derived" ? t("benchmarks.derivedNote") : t("benchmarks.reportedNote")}
            className={`whitespace-nowrap text-[10px] underline decoration-dotted underline-offset-2 ${
              s.kind === "derived"
                ? "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                : "text-[#2c87c3] hover:text-[#1f6a9c] dark:text-[#5fb0e0] dark:hover:text-[#8ecbf0]"
            }`}
          >
            {t(s.labelKey as "benchmarks.source.ours")}
            {s.kind === "reported" && <span aria-hidden="true"> ↗</span>}
          </a>
        ))}
      </div>
    </td>
  );
}

function useSort<T>(defaultKey: string, defaultDir: Dir) {
  const [key, setKey] = useState(defaultKey);
  const [dir, setDir] = useState<Dir>(defaultDir);
  const onSort = (k: string) => {
    if (k === key) setDir(dir === "asc" ? "desc" : "asc");
    else {
      setKey(k);
      setDir("desc");
    }
  };
  const apply = (rows: T[], get: (r: T, k: string) => number | string | null) => {
    const mul = dir === "asc" ? 1 : -1;
    return [...rows].sort((a, b) => {
      const va = get(a, key);
      const vb = get(b, key);
      if (va == null && vb == null) return 0;
      if (va == null) return 1;
      if (vb == null) return -1;
      if (typeof va === "number" && typeof vb === "number") return mul * (va - vb);
      return mul * String(va).localeCompare(String(vb));
    });
  };
  return { key, dir, onSort, apply };
}

function Section({
  id,
  title,
  count,
  children,
}: {
  id: string;
  title: string;
  count: number;
  children: React.ReactNode;
}) {
  return (
    <section aria-labelledby={id} className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800/40">
      <header className="flex items-baseline justify-between gap-2 border-b border-slate-200 bg-slate-50/60 px-3 py-2 dark:border-slate-700 dark:bg-slate-800/60">
        <h2 id={id} className="text-sm font-extrabold text-slate-900 dark:text-white">
          {title}
        </h2>
        <span className="font-mono text-[11px] tabular-nums text-slate-400">{count}</span>
      </header>
      <div className="overflow-x-auto">{children}</div>
    </section>
  );
}

function PartCell({ product, locale }: { product: Product; locale: Locale }) {
  return (
    <Link
      href={localizedPath(`/product/${product.id}`, locale)}
      className="font-bold text-slate-900 hover:text-[#2c87c3] dark:text-white dark:hover:text-[#5fb0e0]"
    >
      {product.brand} {product.model}
    </Link>
  );
}

const numTd = "px-2.5 py-2 text-right font-mono text-xs tabular-nums text-slate-700 dark:text-slate-200";
const txtTd = "px-2.5 py-2 text-xs text-slate-500 dark:text-slate-400";
const dash = <span className="text-slate-300 dark:text-slate-600">—</span>;

export default function BenchmarksClient({
  products,
  locale,
}: {
  products: Product[];
  locale: Locale;
}) {
  const t = useT();
  const [q, setQ] = useState("");

  const needle = q.trim().toLowerCase();
  const match = (p: Product) =>
    !needle ||
    `${p.brand} ${p.model} ${p.id}`.toLowerCase().includes(needle);

  const catLabel = (slug: string) => t(`cats.${slug}` as "cats.cpu");

  const cpus = useMemo(() => products.filter((p) => p.category === "cpu" && match(p)), [products, needle]);
  const gpus = useMemo(() => products.filter((p) => p.category === "gpu" && match(p)), [products, needle]);
  const rams = useMemo(() => products.filter((p) => p.category === "ram" && match(p)), [products, needle]);
  const ssds = useMemo(() => products.filter((p) => p.category === "ssd" && match(p)), [products, needle]);
  const boards = useMemo(
    () => products.filter((p) => p.category === "motherboard" && match(p)),
    [products, needle],
  );
  const psus = useMemo(() => products.filter((p) => p.category === "psu" && match(p)), [products, needle]);

  const cpuSort = useSort<Product>("gaming", "desc");
  const gpuSort = useSort<Product>("r1080", "desc");
  const ramSort = useSort<Product>("bw", "desc");
  const ssdSort = useSort<Product>("read", "desc");

  const cpuRows = cpuSort.apply(cpus, (p, k) => {
    const b = CPU_BENCH[p.id];
    const s = p.specs as Record<string, unknown>;
    if (k === "name") return `${p.brand} ${p.model}`;
    if (!b) return null;
    if (k === "gaming") return b.gaming;
    if (k === "multi") return b.multi;
    if (k === "single") return b.single;
    if (k === "cores") return b.cores;
    if (k === "tdp") return typeof s.tdp === "number" ? s.tdp : null;
    return b.gaming;
  });

  const gpuRows = gpuSort.apply(gpus, (p, k) => {
    const b = GPU_BENCH[p.id];
    const s = p.specs as Record<string, unknown>;
    if (k === "name") return `${p.brand} ${p.model}`;
    if (!b) return null;
    if (k === "r1080") return b.raster1080;
    if (k === "r1440") return b.raster1440;
    if (k === "rt") return b.rt;
    if (k === "tdp") return typeof s.tdp_w === "number" ? s.tdp_w : null;
    return b.raster1080;
  });

  const ramRows = ramSort.apply(rams, (p, k) => {
    const b = RAM_BENCH[p.id];
    const s = p.specs as Record<string, unknown>;
    if (k === "name") return `${p.brand} ${p.model}`;
    if (!b) return null;
    if (k === "bw") return b.bandwidth;
    if (k === "cap") return typeof s.capacity_gb === "number" ? s.capacity_gb : null;
    if (k === "speed") return typeof s.speed === "number" ? s.speed : null;
    return b.bandwidth;
  });

  const ssdRows = ssdSort.apply(ssds, (p, k) => {
    const b = SSD_BENCH[p.id];
    if (k === "name") return `${p.brand} ${p.model}`;
    if (!b) return null;
    if (k === "read") return b.seqRead;
    if (k === "write") return b.seqWrite;
    if (k === "rand") return b.random4k;
    return b.seqRead;
  });

  const th = (label: string, sortKey: string, srt: { key: string; dir: Dir; onSort: (k: string) => void }, align: "left" | "right" | "center" = "right") => (
    <Th label={label} sortKey={sortKey} activeKey={srt.key} dir={srt.dir} onSort={srt.onSort} align={align} />
  );

  return (
    <div className="space-y-5">
      <p className="text-xs leading-relaxed text-slate-600 dark:text-slate-400">
        {t("benchmarks.why")}
      </p>

      {/* Search across every table at once. */}
      <div className="flex flex-wrap items-center gap-2">
        <label className="flex min-w-0 flex-1 items-center gap-2 sm:max-w-xs">
          <span className="sr-only">{t("benchmarks.search")}</span>
          <input
            type="search"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("benchmarks.search")}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 focus:border-[#2c87c3] focus:outline-none dark:border-slate-700 dark:bg-slate-800/60 dark:text-white"
          />
        </label>
        {(cpus.length + gpus.length + rams.length + ssds.length + boards.length + psus.length) > 0 && (
          <span className="ml-auto font-mono text-[11px] tabular-nums text-slate-400">
            {cpus.length + gpus.length + rams.length + ssds.length + boards.length + psus.length}{" "}
            {t("benchmarks.components")}
          </span>
        )}
      </div>

      {/* ---- CPUs ---- */}
      {cpus.length > 0 && (
        <Section id="bench-cpu" title={catLabel("cpu")} count={cpus.length}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <Th label={t("benchmarks.specs")} sortKey="name" activeKey={cpuSort.key} dir={cpuSort.dir} onSort={cpuSort.onSort} align="left" />
                {th(t("benchmarks.cores"), "cores", cpuSort)}
                <Th label={t("benchmarks.socket")} align="left" />
                <Th label={t("benchmarks.tdp")} align="right" />
                {th(t("benchmarks.multi"), "multi", cpuSort)}
                {th(t("benchmarks.single"), "single", cpuSort)}
                {th(t("benchmarks.gaming"), "gaming", cpuSort)}
                <Th label={t("benchmarks.sources")} align="left" />
              </tr>
            </thead>
            <tbody>
              {cpuRows.map((p) => {
                const b = CPU_BENCH[p.id];
                const s = p.specs as Record<string, unknown>;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                    <td className="px-2.5 py-2 text-sm">
                      <PartCell product={p} locale={locale} />
                    </td>
                    <td className={numTd}>{b ? `${b.cores}C/${b.threads}T` : dash}</td>
                    <td className={txtTd}>{typeof s.socket === "string" ? s.socket : dash}</td>
                    <td className={numTd}>{typeof s.tdp === "number" ? `${s.tdp} W` : dash}</td>
                    <td className={numTd}>{b ? <b>{fmt(b.multi)}</b> : dash}</td>
                    <td className={numTd}>{b ? <b>{fmt(b.single)}</b> : dash}</td>
                    <td className={numTd}>{b ? <b>{fmt(b.gaming)}</b> : dash}</td>
                    <SourceCell sources={sourcesFor(p.id, p.category, p.model)} t={t} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* ---- GPUs ---- */}
      {gpus.length > 0 && (
        <Section id="bench-gpu" title={catLabel("gpu")} count={gpus.length}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <Th label={t("benchmarks.specs")} sortKey="name" activeKey={gpuSort.key} dir={gpuSort.dir} onSort={gpuSort.onSort} align="left" />
                <Th label={t("benchmarks.vram")} align="right" />
                <Th label={t("benchmarks.tdp")} align="right" />
                {th(t("benchmarks.raster1080"), "r1080", gpuSort)}
                {th(t("benchmarks.raster1440"), "r1440", gpuSort)}
                {th(t("benchmarks.rt"), "rt", gpuSort)}
                <Th label={t("benchmarks.sources")} align="left" />
              </tr>
            </thead>
            <tbody>
              {gpuRows.map((p) => {
                const b = GPU_BENCH[p.id];
                const s = p.specs as Record<string, unknown>;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                    <td className="px-2.5 py-2 text-sm">
                      <PartCell product={p} locale={locale} />
                    </td>
                    <td className={numTd}>{vramFromModel(p.model) ?? dash}</td>
                    <td className={numTd}>{typeof s.tdp_w === "number" ? `${s.tdp_w} W` : dash}</td>
                    <td className={numTd}>{b ? <b>{fmt(b.raster1080)}</b> : dash}</td>
                    <td className={numTd}>{b ? <b>{fmt(b.raster1440)}</b> : dash}</td>
                    <td className={numTd}>{b ? <b>{fmt(b.rt)}</b> : dash}</td>
                    <SourceCell sources={sourcesFor(p.id, p.category, p.model)} t={t} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* ---- RAM ---- */}
      {rams.length > 0 && (
        <Section id="bench-ram" title={catLabel("ram")} count={rams.length}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <Th label={t("benchmarks.specs")} sortKey="name" activeKey={ramSort.key} dir={ramSort.dir} onSort={ramSort.onSort} align="left" />
                {th(t("benchmarks.capacity"), "cap", ramSort)}
                <Th label={t("benchmarks.ramType")} align="left" />
                {th(t("benchmarks.speed"), "speed", ramSort)}
                {th(t("benchmarks.index"), "bw", ramSort)}
                <Th label={t("benchmarks.sources")} align="left" />
              </tr>
            </thead>
            <tbody>
              {ramRows.map((p) => {
                const b = RAM_BENCH[p.id];
                const s = p.specs as Record<string, unknown>;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                    <td className="px-2.5 py-2 text-sm">
                      <PartCell product={p} locale={locale} />
                    </td>
                    <td className={numTd}>{typeof s.capacity_gb === "number" ? `${s.capacity_gb} GB` : dash}</td>
                    <td className={txtTd}>{typeof s.type === "string" ? s.type : dash}</td>
                    <td className={numTd}>{typeof s.speed === "number" ? s.speed : dash}</td>
                    <td className={numTd}>{b ? <b>{fmt(b.bandwidth)}</b> : dash}</td>
                    <SourceCell sources={sourcesFor(p.id, p.category, p.model)} t={t} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* ---- SSDs: spec-sheet throughput, not an index ---- */}
      {ssds.length > 0 && (
        <Section id="bench-ssd" title={catLabel("ssd")} count={ssds.length}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <Th label={t("benchmarks.specs")} sortKey="name" activeKey={ssdSort.key} dir={ssdSort.dir} onSort={ssdSort.onSort} align="left" />
                <Th label={t("benchmarks.interface")} align="left" />
                {th(t("benchmarks.seqRead"), "read", ssdSort)}
                {th(t("benchmarks.seqWrite"), "write", ssdSort)}
                {th(t("benchmarks.random4k"), "rand", ssdSort)}
                <Th label={t("benchmarks.sources")} align="left" />
              </tr>
            </thead>
            <tbody>
              {ssdRows.map((p) => {
                const b = SSD_BENCH[p.id];
                const s = p.specs as Record<string, unknown>;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                    <td className="px-2.5 py-2 text-sm">
                      <PartCell product={p} locale={locale} />
                    </td>
                    <td className={txtTd}>{b?.interface ?? (typeof s.interface === "string" ? s.interface : dash)}</td>
                    <td className={numTd}>{b ? fmt(b.seqRead) : dash}</td>
                    <td className={numTd}>{b ? fmt(b.seqWrite) : dash}</td>
                    <td className={numTd}>{b ? fmt(b.random4k) : dash}</td>
                    <SourceCell sources={sourcesFor(p.id, p.category, p.model)} t={t} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* ---- Motherboards: specs only. No performance index exists for a board. ---- */}
      {boards.length > 0 && (
        <Section id="bench-mobo" title={catLabel("motherboard")} count={boards.length}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <Th label={t("benchmarks.specs")} align="left" />
                <Th label={t("benchmarks.chipset")} align="left" />
                <Th label={t("benchmarks.socket")} align="left" />
                <Th label={t("benchmarks.ramType")} align="left" />
                <Th label={t("benchmarks.m2Slots")} align="right" />
                <Th label={t("benchmarks.formFactor")} align="left" />
                <Th label={t("benchmarks.sources")} align="left" />
              </tr>
            </thead>
            <tbody>
              {boards.map((p) => {
                const s = p.specs as Record<string, unknown>;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                    <td className="px-2.5 py-2 text-sm">
                      <PartCell product={p} locale={locale} />
                    </td>
                    <td className={txtTd}>{typeof s.chipset === "string" ? s.chipset : dash}</td>
                    <td className={txtTd}>{typeof s.socket === "string" ? s.socket : dash}</td>
                    <td className={txtTd}>{typeof s.ram_type === "string" ? s.ram_type : dash}</td>
                    <td className={numTd}>{typeof s.m2 === "number" ? s.m2 : dash}</td>
                    <td className={txtTd}>{typeof s.form_factor === "string" ? s.form_factor : dash}</td>
                    <SourceCell sources={sourcesFor(p.id, p.category, p.model)} t={t} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* ---- PSUs: specs only. ---- */}
      {psus.length > 0 && (
        <Section id="bench-psu" title={catLabel("psu")} count={psus.length}>
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-700">
                <Th label={t("benchmarks.specs")} align="left" />
                <Th label={t("benchmarks.wattage")} align="right" />
                <Th label={t("benchmarks.efficiency")} align="left" />
                <Th label={t("benchmarks.sources")} align="left" />
              </tr>
            </thead>
            <tbody>
              {psus.map((p) => {
                const s = p.specs as Record<string, unknown>;
                return (
                  <tr key={p.id} className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 dark:border-slate-800 dark:hover:bg-slate-800/60">
                    <td className="px-2.5 py-2 text-sm">
                      <PartCell product={p} locale={locale} />
                    </td>
                    <td className={numTd}>{typeof s.wattage === "number" ? `${s.wattage} W` : dash}</td>
                    <td className={txtTd}>{typeof s.rating === "string" ? s.rating : dash}</td>
                    <SourceCell sources={sourcesFor(p.id, p.category, p.model)} t={t} />
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Section>
      )}

      {/* Methodology: stated once, at the bottom, where it does not compete
          with the numbers. */}
      <p className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-800/40 dark:text-slate-400">
        {t("benchmarks.scrapeNote")}
      </p>

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
    </div>
  );
}
