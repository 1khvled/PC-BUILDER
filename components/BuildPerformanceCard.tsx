"use client";

import { useMemo } from "react";
import { estimatePerformance, BASELINES, type BuildPerformance, type PerfNoteKey } from "@/lib/perf/estimate";
import type { Product } from "@/lib/data/products";
import { useT } from "@/lib/i18n/client";
import type { TFn } from "@/lib/i18n/runtime";

/**
 * "How fast will this be?" card for the builder.
 *
 * Placed under the compatibility summary because the two answer different
 * questions and both matter: compatibility asks "will it work", this asks "was
 * it worth the money". A build can be perfectly compatible and still be badly
 * balanced - a 5700X3D behind a GTX 1650 throws away most of the CPU.
 *
 * Every number here is a rounded index (see lib/data/benchmarks.ts for why),
 * the baseline is always stated on screen, and partial builds show their
 * coverage instead of a confident wrong number.
 */

const TIER_STYLES: Record<string, { bar: string; text: string }> = {
  entry: { bar: "bg-slate-400", text: "text-slate-600" },
  mainstream: { bar: "bg-[#2c87c3]", text: "text-[#1f6a9c]" },
  performance: { bar: "bg-emerald-500", text: "text-emerald-700" },
  enthusiast: { bar: "bg-violet-500", text: "text-violet-700" },
  flagship: { bar: "bg-amber-500", text: "text-amber-700" },
};

function ScoreBar({ label, value, t }: { label: string; value: number | null; t: TFn }) {
  if (value == null) return null;
  return (
    <div className="flex items-center gap-2">
      <span className="w-24 shrink-0 text-[11px] font-semibold text-slate-600">{label}</span>
      <div className="relative h-2 flex-1 rounded-full bg-slate-200 overflow-hidden print:bg-slate-100">
        <div
          className={`h-full rounded-full transition-[width] duration-500 ${
            value >= 92 ? "bg-amber-500" : value >= 60 ? "bg-emerald-500" : value >= 40 ? "bg-[#2c87c3]" : "bg-slate-400"
          } print:bg-slate-400`}
          style={{ width: `${Math.max(3, Math.min(100, value))}%` }}
        />
      </div>
      <span className="w-8 shrink-0 text-right text-[11px] font-extrabold tabular-nums text-slate-900">{value}</span>
    </div>
  );
}

function NoteLine({ note, t }: { note: BuildPerformance["insights"][number]; t: TFn }) {
  const tone =
    note.severity === "bad"
      ? "text-red-700"
      : note.severity === "warn"
        ? "text-amber-700"
        : "text-slate-600";
  const dot = note.severity === "bad" ? "bg-red-500" : note.severity === "warn" ? "bg-amber-500" : "bg-slate-400";
  return (
    <li className="flex gap-1.5">
      <span className={`mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full ${dot}`} aria-hidden="true" />
      <span className={`text-[11px] leading-relaxed ${tone}`}>
        {t(note.key as PerfNoteKey, note.vars ?? {})}
      </span>
    </li>
  );
}

export default function BuildPerformanceCard({ build }: { build: Partial<Record<string, Product>> }) {
  const t = useT();
  const perf = useMemo(() => estimatePerformance(build), [build]);

  // Nothing picked yet: stay out of the way rather than showing a zeroed card.
  if (perf.coverage.total === 0) return null;

  const styles = perf.tier ? TIER_STYLES[perf.tier] : null;

  return (
    <div className="mt-3 rounded-xl border border-slate-200 bg-slate-50/70 p-3 sm:p-4 print:bg-white print:border-slate-300">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-700">
          {t("perf.title")}
        </h3>
        {perf.tier && (
          <span className={`text-xs font-extrabold ${styles?.text ?? ""}`}>
            {t(`perf.tier.${perf.tier}` as "perf.tier.entry")}
          </span>
        )}
      </div>

      <div className="mt-3 space-y-2">
        <ScoreBar label={t("perf.gaming")} value={perf.gaming} t={t} />
        <ScoreBar label={t("perf.productivity")} value={perf.productivity} t={t} />
      </div>

      {perf.gpuLabel && (
        <p className="mt-2 text-[11px] text-slate-500 tabular-nums">
          {perf.cpuLabel ? `${perf.cpuLabel} · ` : ""}
          {perf.gpuLabel}
        </p>
      )}

      {perf.insights.length > 0 && (
        <ul className="mt-2.5 space-y-1 border-t border-slate-200 pt-2.5 print:border-slate-300">
          {perf.insights.map((n) => (
            <NoteLine key={n.key} note={n} t={t} />
          ))}
        </ul>
      )}

      <p className="mt-2.5 text-[10px] leading-relaxed text-slate-400">
        {t("perf.baseline", { cpu: BASELINES.cpu, gpu: BASELINES.gpu })} · {t("perf.indicative")}
        {perf.coverage.total > perf.coverage.rated &&
          ` · ${t("perf.coverage", { rated: perf.coverage.rated, total: perf.coverage.total })}`}
      </p>
    </div>
  );
}
