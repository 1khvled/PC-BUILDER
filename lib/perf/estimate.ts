import {
  CPU_BASELINE,
  CPU_BENCH,
  GPU_BASELINE,
  GPU_BENCH,
  cpuBench,
  gpuBench,
  ramBench,
  ssdBench,
  type CpuBenchmark,
  type GpuBenchmark,
} from "@/lib/data/benchmarks";
import type { Product } from "@/lib/data/products";
import { MEMORY_PLATFORM, isX3dModel } from "@/lib/compat/platforms";
import { gb as readGb, mt as readMt, str, watts } from "@/lib/compat/spec";
import { PLATFORM_OVERHEAD_W, peakWattage, recommendedPsu } from "@/lib/compat/watt";

/**
 * BUILD PERFORMANCE ESTIMATE.
 *
 * Turns the per-part indices in lib/data/benchmarks into an honest read on a
 * finished build, and - more usefully - spots the cases where money is being
 * wasted. A perfectly compatible build can still be a bad build: a 5700X3D
 * behind a GTX 1650, or a 5090 on a 650 W supply, both "work" and both
 * disappoint.
 *
 * Everything here is arithmetic on the indices. There is no model fitting and
 * no scraped data, so it degrades honestly: if a part has no index, the
 * estimate reports less coverage rather than inventing a number.
 *
 * TWO LISTS, ON PURPOSE
 * ---------------------
 * `notes` is the list the dictionary can render today (five legacy keys) and
 * `insights` is the graded, resolution-aware list. They describe the same
 * facts at two levels of detail: `notes` is the coarse fallback that keeps the
 * card working with the keys that exist, `insights` is what the card should
 * render once `perf.ins.*` are in the dictionaries. `insights` is a superset,
 * so `notes` is kept only as a migration shim and can be deleted with the
 * single render call that switches over.
 */

export type PerfTier = "entry" | "mainstream" | "performance" | "enthusiast" | "flagship";

export type PerfResolution = "1080p" | "1440p";

export const RESOLUTIONS: readonly PerfResolution[] = ["1080p", "1440p"];

export type PerfSeverity = "info" | "warn" | "bad";

/** Which side of the build is holding the frame rate back. */
export type BottleneckSide = "cpu" | "gpu";

/**
 * How bad the imbalance is. The thresholds are on the ratio between the two
 * sides, so the grade means the same thing for every pair of parts.
 */
export type BottleneckGrade = "none" | "mild" | "significant" | "severe";

export interface Bottleneck {
  resolution: PerfResolution;
  /** The side doing the limiting, null when the build is balanced. */
  side: BottleneckSide | null;
  grade: BottleneckGrade;
  /** GPU index / CPU index at this resolution. Above 1 means CPU-limited. */
  ratio: number;
}

/* --------------------------------------------------- the legacy note list */

export interface PerfNote {
  /** Stable key so the UI can translate it. Never render these strings raw. */
  key: PerfNoteKey;
  /** Filled-in values for the message template. */
  vars?: Record<string, string | number>;
  severity: PerfSeverity;
}

export type PerfNoteKey =
  | "perf.cpuBottleneckGpu"
  | "perf.gpuBottleneckCpu"
  | "perf.slowStorage"
  | "perf.slowMemory"
  | "perf.partialData"
;

/* --------------------------------------------------------- the insight list */

export interface PerfInsight {
  /** Stable dictionary key. Never render these strings raw. */
  key: PerfInsightKey;
  vars?: Record<string, string | number>;
  severity: PerfSeverity;
  /** Present on bottleneck insights; which resolution the grade refers to. */
  resolution?: PerfResolution;
  /** Present on bottleneck insights; how bad the imbalance is. */
  grade?: Exclude<BottleneckGrade, "none">;
  /**
   * Present on the upgrade-path insights: the single part whose replacement
   * would move the score most. Arithmetic on the existing indices only.
   */
  upgrade?: UpgradeKind;
}

export type PerfInsightKey =
  | "perf.ins.cpuBottleneckMild"
  | "perf.ins.cpuBottleneckSignificant"
  | "perf.ins.cpuBottleneckSevere"
  | "perf.ins.gpuBottleneckMild"
  | "perf.ins.gpuBottleneckSignificant"
  | "perf.ins.gpuBottleneckSevere"
  | "perf.ins.storageSlow"
  | "perf.ins.memorySlow"
  | "perf.ins.memoryCapacity"
  | "perf.ins.psuHeadroom"
  | "perf.ins.upgradeGpu"
  | "perf.ins.upgradeCpu"
  | "perf.ins.balanced";

/** The part whose replacement is worth the money. */
export type UpgradeKind = "gpu" | "cpu" | "ram" | "ssd";

/**
 * The single highest-value upgrade, or null when nothing is clearly holding
 * the build back. `factor` is how much faster that one part would have to be,
 * `gain` is the score it would move at the stated resolution. Both are
 * arithmetic on the indices already on screen, nothing more.
 */
export interface UpgradeAdvice {
  kind: UpgradeKind;
  factor: number;
  gain: number;
  resolution: PerfResolution;
  /** The score this build gets today, so the copy can say "from X to Y". */
  score: number;
}

export interface BuildPerformance {
  /** 0-100 at 1080p. Null when we have no GPU index. */
  gaming: number | null;
  /** 0-100 at 1440p. Differs from `gaming`: the GPU matters more there. */
  gaming1440: number | null;
  /** 0-100, relative across builds. Null when there is no CPU. */
  productivity: number | null;
  tier: PerfTier | null;
  /** Same score, read at 1440p. Often a tier lower. */
  tier1440: PerfTier | null;
  /** Parts we had an index for, out of the parts that matter for a score. */
  coverage: { rated: number; total: number };
  cpuLabel: string | null;
  gpuLabel: string | null;
  /** Graded, resolution-aware. This is the list the card should render. */
  bottlenecks: Bottleneck[];
  /** The graded findings. Render these once `perf.ins.*` exist. */
  insights: PerfInsight[];
  /** The single most valuable upgrade, when there is an obvious one. */
  upgrade: UpgradeAdvice | null;
  /**
   * @deprecated Coarse fallback kept for the five dictionary keys that exist
   * today. Render `insights` instead and this can go.
   */
  notes: PerfNote[];
}

/* --------------------------------------------------------------- the model */

/**
 * Compressive, not linear. Going from half a reference card to a reference
 * card matters far more to a buyer than going from two-and-a-half to three,
 * and a linear map would flatten every build above the middle into the same
 * number. Below 1 it is deliberately steeper than above it: the difference
 * between a smooth and a stuttering machine is the difference people feel.
 */
export const SCORE_EXPONENT = 0.6;

/**
 * How much of the frame the CPU is responsible for, per resolution.
 *
 * At 1080p the CPU issues every draw call, so it carries half the weight. At
 * 1440p the GPU has more pixels to fill for the same amount of CPU work, so
 * the CPU's share of the total drops. This is the entire reason the two
 * resolutions score differently: the same parts are simply better matched at
 * one resolution than the other.
 */
export const CPU_WEIGHT: Record<PerfResolution, number> = { "1080p": 0.5, "1440p": 0.35 };

/** Imbalance below this is not worth mentioning. */
const GRADE_MILD = 1.15;
const GRADE_SIGNIFICANT = 1.45;
const GRADE_SEVERE = 2;

/** Bandwidth index at which memory stops helping CPU-bound work. */
const RAM_BOOST_CAP = 200;

/** 4K random read IOPS below which a drive is felt on every load screen. */
const STORAGE_BAD_IOPS = 120;
const STORAGE_WARN_IOPS = 400;
const STORAGE_WARN_SEQ = 2000;

/** Memory bandwidth index below which the kit is a real drag. */
const MEMORY_BANDWIDTH_WARN = 60;

/** Practical minimum for a machine bought now, GB. */
const RAM_TARGET_GB = 16;

/** Minimum projected gain, in score points, before an upgrade is worth naming. */
const MIN_USEFUL_GAIN = 4;

const TIER_BREAKS: { min: number; tier: PerfTier }[] = [
  { min: 92, tier: "flagship" },
  { min: 78, tier: "enthusiast" },
  { min: 60, tier: "performance" },
  { min: 40, tier: "mainstream" },
];

/**
 * The index that scores 100, per resolution, plus the GPU-only ceilings used
 * when a build has no CPU yet.
 *
 * Derived from the catalogue rather than hardcoded, so 100 always means "the
 * fastest CPU + GPU pairing we stock" and cannot silently drift out of range
 * when a new part is added. Both baselines stay on screen: index 100 is the
 * 5600 / 4060 pair, score 100 is the best build we can sell.
 */
export interface ScoreCeiling extends Record<PerfResolution, number> {
  gpuOnly1080: number;
  gpuOnly1440: number;
}

export const SCORE_CEILING: ScoreCeiling = (() => {
  const w1080 = CPU_WEIGHT["1080p"];
  const w1440 = CPU_WEIGHT["1440p"];
  let c1080 = 0;
  let c1440 = 0;
  let gpuOnly1080 = 0;
  let gpuOnly1440 = 0;
  for (const c of Object.values(CPU_BENCH)) {
    for (const g of Object.values(GPU_BENCH)) {
      const a = Math.pow(c.gaming, w1080) * Math.pow(g.raster1080, 1 - w1080);
      if (a > c1080) c1080 = a;
      const b = Math.pow(c.gaming, w1440) * Math.pow(g.raster1440, 1 - w1440);
      if (b > c1440) c1440 = b;
    }
  }
  for (const g of Object.values(GPU_BENCH)) {
    if (g.raster1080 > gpuOnly1080) gpuOnly1080 = g.raster1080;
    if (g.raster1440 > gpuOnly1440) gpuOnly1440 = g.raster1440;
  }
  return { "1080p": c1080, "1440p": c1440, gpuOnly1080, gpuOnly1440 };
})();

/** Highest multi-threaded index in the catalogue, with the memory boost. */
export const PRODUCTIVITY_CEILING = (() => {
  let maxMulti = 0;
  for (const c of Object.values(CPU_BENCH)) if (c.multi > maxMulti) maxMulti = c.multi;
  return maxMulti * (1 + RAM_BOOST_CAP / 1000);
})();

function clamp(value: number, lo: number, hi: number): number {
  return value < lo ? lo : value > hi ? hi : value;
}

/**
 * Index -> score, compressive, always inside 0..100.
 *
 * The ceiling is the best pairing in the catalogue, so the top build lands on
 * exactly 100 and nothing can exceed it. Monotonic: a strictly better part can
 * never score lower, which is the property the verification script asserts.
 */
export function scoreAgainstCeiling(index: number, ceiling: number): number {
  if (!Number.isFinite(index) || !Number.isFinite(ceiling) || ceiling <= 0) return 0;
  const ratio = clamp(index / ceiling, 0, 1);
  return Math.round(100 * Math.pow(ratio, SCORE_EXPONENT));
}

function tierFor(gaming: number): PerfTier {
  for (const b of TIER_BREAKS) if (gaming >= b.min) return b.tier;
  return "entry";
}

/** Combined CPU/GPU index at one resolution, on the 5600 + 4060 = 100 scale. */
function pairingIndex(c: CpuBenchmark, g: GpuBenchmark, res: PerfResolution): number {
  const w = CPU_WEIGHT[res];
  const gpuIndex = res === "1080p" ? g.raster1080 : g.raster1440;
  return Math.pow(c.gaming, w) * Math.pow(gpuIndex, 1 - w);
}

function gradeFor(imbalance: number): BottleneckGrade {
  if (imbalance >= GRADE_SEVERE) return "severe";
  if (imbalance >= GRADE_SIGNIFICANT) return "significant";
  if (imbalance >= GRADE_MILD) return "mild";
  return "none";
}

function bottleneckFor(c: CpuBenchmark, g: GpuBenchmark, res: PerfResolution): Bottleneck {
  const gpuIndex = res === "1080p" ? g.raster1080 : g.raster1440;
  const ratio = gpuIndex / c.gaming;
  const imbalance = ratio >= 1 ? ratio : 1 / ratio;
  const grade = gradeFor(imbalance);
  return { resolution: res, side: grade === "none" ? null : ratio >= 1 ? "cpu" : "gpu", grade, ratio };
}

function insight(
  key: PerfInsightKey,
  severity: PerfSeverity,
  extra?: Partial<PerfInsight>,
): PerfInsight {
  return { key, severity, ...(extra ?? {}) } as PerfInsight;
}

const GRADE_SUFFIX: Record<Exclude<BottleneckGrade, "none">, "Mild" | "Significant" | "Severe"> = {
  mild: "Mild",
  significant: "Significant",
  severe: "Severe",
};

const GRADE_ORDER: Record<BottleneckGrade, number> = { none: 0, mild: 1, significant: 2, severe: 3 };

const GRADE_SEVERITY: Record<Exclude<BottleneckGrade, "none">, PerfSeverity> = {
  mild: "info",
  significant: "warn",
  severe: "bad",
};

/* --------------------------------------------------------------- estimate */

export function estimatePerformance(build: Partial<Record<string, Product>>): BuildPerformance {
  const cpu = build.cpu;
  const gpu = build.gpu;
  const ram = build.ram;
  const ssd = build.ssd;
  const psu = build.psu;

  const c = cpu ? cpuBench(cpu.id) : null;
  const g = gpu ? gpuBench(gpu.id) : null;
  const r = ram ? ramBench(ram.id) : null;
  const s = ssd ? ssdBench(ssd.id) : null;

  const insights: PerfInsight[] = [];
  const notes: PerfNote[] = [];

  /* -------------------------------------------------------- gaming score -- */
  let gaming: number | null = null;
  let gaming1440: number | null = null;

  if (c && g) {
    gaming = scoreAgainstCeiling(pairingIndex(c, g, "1080p"), SCORE_CEILING["1080p"]);
    gaming1440 = scoreAgainstCeiling(pairingIndex(c, g, "1440p"), SCORE_CEILING["1440p"]);
  } else if (g) {
    // GPU alone: normalise against the best card we stock, and say so by way
    // of the coverage line rather than pretending we saw a CPU.
    gaming = scoreAgainstCeiling(g.raster1080, SCORE_CEILING.gpuOnly1080);
    gaming1440 = scoreAgainstCeiling(g.raster1440, SCORE_CEILING.gpuOnly1440);
  }

  /* -------------------------------------------------- productivity score -- */
  // CPU-bound work: rendering, compiling, encoding, simulation.
  let productivity: number | null = null;
  if (c) {
    const memoryBoost = 1 + (r ? Math.min(r.bandwidth, RAM_BOOST_CAP) / 1000 : 0);
    productivity = scoreAgainstCeiling(c.multi * memoryBoost, PRODUCTIVITY_CEILING);
  }

  /* ------------------------------------------------------ bottlenecks --- */
  const bottlenecks: Bottleneck[] = c && g ? RESOLUTIONS.map((res) => bottleneckFor(c!, g!, res)) : [];

  // One insight per side, not per resolution: the same key twice would collide
  // in the card's key={insight.key} and say the same thing twice. Both
  // resolutions stay available as data in `bottlenecks`; the message names the
  // resolution the reported grade came from.
  for (const side of ["cpu", "gpu"] as const) {
    const worstForSide = bottlenecks
      .filter((b) => b.side === side)
      .sort((a, b) => GRADE_ORDER[b.grade] - GRADE_ORDER[a.grade])[0];
    if (!worstForSide || worstForSide.grade === "none") continue;
    const grade = worstForSide.grade as Exclude<BottleneckGrade, "none">;
    insights.push(
      insight(
        side === "cpu" ? `perf.ins.cpuBottleneck${GRADE_SUFFIX[grade]}` : `perf.ins.gpuBottleneck${GRADE_SUFFIX[grade]}`,
        GRADE_SEVERITY[grade],
        {
          vars: { cpu: cpu?.model ?? "", gpu: gpu?.model ?? "", res: worstForSide.resolution },
          resolution: worstForSide.resolution,
          grade,
        },
      ),
    );
  }

  /* --------------------------------------------- storage and memory notes */
  if (s && ssd) {
    const iops = s.random4k;
    const seq = s.seqRead;
    // On a fast system a slow drive is the part you feel; on an unknown or
    // slow system the drive is not what is holding you back, so it is only
    // worth a line when the rest of the build can actually use it.
    const systemFast = !!c && !!g;
    const bad = iops < STORAGE_BAD_IOPS;
    const warn = iops < STORAGE_WARN_IOPS || seq < STORAGE_WARN_SEQ;
    if (bad || (systemFast && warn)) {
      insights.push(
        insight("perf.ins.storageSlow", bad ? "bad" : "warn", {
          vars: { model: ssd.model, read: seq, iops },
        }),
      );
    }
    if (seq < 1000) {
      notes.push({ key: "perf.slowStorage", vars: { model: ssd.model, read: seq }, severity: "warn" });
    }
  }

  if (r && ram) {
    const socket = str(cpu, "socket");
    const platform = socket ? MEMORY_PLATFORM[socket] : null;
    const speed = readMt(ram, "speed");
    const tooSlowForPlatform =
      !!platform && !!speed && !isX3dModel(cpu?.model ?? null) && speed < platform.sweet * 0.7;
    if (r.bandwidth < MEMORY_BANDWIDTH_WARN || tooSlowForPlatform) {
      insights.push(
        insight("perf.ins.memorySlow", r.bandwidth < MEMORY_BANDWIDTH_WARN ? "warn" : "info", {
          vars: { model: ram.model, bandwidth: r.bandwidth },
        }),
      );
    }
    if (r.bandwidth < MEMORY_BANDWIDTH_WARN) {
      notes.push({ key: "perf.slowMemory", vars: { model: ram.model }, severity: "warn" });
    }

    // Capacity is a spec fact, not a benchmark, so it is read from the part
    // itself. 8 GB is genuinely a problem on a machine bought in 2026.
    const capacity = readGb(ram, "capacity_gb");
    if (cpu && capacity != null && capacity < RAM_TARGET_GB) {
      insights.push(
        insight("perf.ins.memoryCapacity", capacity <= 8 ? "warn" : "info", {
          vars: { capacity, target: RAM_TARGET_GB },
        }),
      );
    }
  }

  /* --------------------------------------------------- PSU headroom risk - */
  if (cpu && gpu && psu) {
    const psuW = watts(psu, "wattage");
    const cpuTdp = watts(cpu, "tdp") ?? 0;
    const gpuTdp = watts(gpu, "tdp_w") ?? 0;
    const peak = peakWattage(cpuTdp + gpuTdp + PLATFORM_OVERHEAD_W, gpuTdp);
    const recommended = recommendedPsu(Math.ceil(peak * 1.15));
    // Only the band that is not already a hard block: it will run, but a load
    // change has nowhere to go and boost clocks can drop under a spike.
    if (psuW != null && psuW >= peak && psuW < recommended) {
      insights.push(
        insight("perf.ins.psuHeadroom", "warn", {
          vars: { psu: psu.model, psuW, recommended },
        }),
      );
    }
  }

  /* -------------------------------------------------------- upgrade path - */
  // Arithmetic only: which single side of the build is furthest from being the
  // limit, and what the score would become if that side were replaced by
  // something that closes the gap. No product recommendations, no prices.
  const worst = worstBottleneck(bottlenecks);
  let upgrade: UpgradeAdvice | null = null;

  if (worst && worst.side && c && g) {
    const kind: UpgradeKind = worst.side === "gpu" ? "gpu" : "cpu";
    const imbalance = worst.ratio >= 1 ? worst.ratio : 1 / worst.ratio;
    // The smallest replacement that closes the gap, rounded to a tenth.
    const factor = Math.max(1.2, Math.round(imbalance * 10) / 10);
    const res = worst.resolution;
    const gpuIndex = res === "1080p" ? g.raster1080 : g.raster1440;
    const before = scoreAgainstCeiling(pairingIndex(c, g, res), SCORE_CEILING[res]);
    const after = scoreAgainstCeiling(
      kind === "gpu"
        ? Math.pow(c.gaming, CPU_WEIGHT[res]) * Math.pow(gpuIndex * factor, 1 - CPU_WEIGHT[res])
        : Math.pow(c.gaming * factor, CPU_WEIGHT[res]) * Math.pow(gpuIndex, 1 - CPU_WEIGHT[res]),
      SCORE_CEILING[res],
    );
    const gain = after - before;
    if (gain >= MIN_USEFUL_GAIN) {
      upgrade = { kind, factor, gain, resolution: res, score: before };
      insights.push(
        insight(kind === "gpu" ? "perf.ins.upgradeGpu" : "perf.ins.upgradeCpu", "info", {
          vars: {
            part: kind === "gpu" ? (gpu?.model ?? "") : (cpu?.model ?? ""),
            factor,
            gain,
            res,
            score: before,
          },
          resolution: res,
          upgrade: kind,
        }),
      );
    }
  }

  // "Balanced" means there is genuinely nothing to say, and only for a build we
  // can actually judge: a CPU on its own is an incomplete build, not a
  // balanced one, and telling a half-built machine it is fine is the kind of
  // false reassurance this whole module exists to avoid.
  if (!upgrade && insights.length === 0 && c && g) {
    insights.push(insight("perf.ins.balanced", "info"));
  }

  /* ------------------------------------------------ legacy note shim ----- */
  if (c && g && cpu && gpu) {
    const worstBn = worst;
    if (worstBn?.side === "cpu") {
      notes.push({
        key: "perf.cpuBottleneckGpu",
        vars: { cpu: cpu.model, gpu: gpu.model },
        severity: worstBn.grade === "mild" ? "info" : "warn",
      });
    } else if (worstBn?.side === "gpu") {
      notes.push({ key: "perf.gpuBottleneckCpu", vars: { cpu: cpu.model, gpu: gpu.model }, severity: "info" });
    }
  }

  /* ---------------------------------------------------------- coverage --- */
  const rated = [c, g, r, s].filter(Boolean).length;
  const total = [cpu, gpu, ram, ssd].filter(Boolean).length;

  if (gaming == null && productivity == null) {
    notes.push({ key: "perf.partialData", severity: "info" });
  }

  return {
    gaming,
    gaming1440,
    productivity,
    tier: gaming != null ? tierFor(gaming) : null,
    tier1440: gaming1440 != null ? tierFor(gaming1440) : null,
    coverage: { rated, total },
    cpuLabel: c && cpu ? `${cpu.model} - ${c.cores}C/${c.threads}T` : null,
    gpuLabel: g && gpu ? `${gpu.model} - ${g.raster1080} index` : null,
    bottlenecks,
    insights,
    upgrade,
    notes,
  };
}

/** The imbalance worth acting on: the worse of the two resolutions. */
function worstBottleneck(
  list: Bottleneck[],
): (Bottleneck & { grade: Exclude<BottleneckGrade, "none"> }) | null {
  const order: Record<BottleneckGrade, number> = { none: 0, mild: 1, significant: 2, severe: 3 };
  let best: (Bottleneck & { grade: Exclude<BottleneckGrade, "none"> }) | null = null;
  for (const bn of list) {
    if (bn.grade === "none") continue;
    const graded = bn as Bottleneck & { grade: Exclude<BottleneckGrade, "none"> };
    if (best === null || order[graded.grade] > order[best.grade]) best = graded;
  }
  return best;
}

/** Human-readable baselines, so "100" is never a mystery. */
export const BASELINES = { cpu: CPU_BASELINE, gpu: GPU_BASELINE };

/** The score reference, rounded for display. */
export const SCORE_REFERENCE = {
  gaming1080: Math.round(SCORE_CEILING["1080p"]),
  gaming1440: Math.round(SCORE_CEILING["1440p"]),
  productivity: Math.round(PRODUCTIVITY_CEILING),
  exponent: SCORE_EXPONENT,
};

/** Sanity bound used by the verification script and future callers. */
export const SCORE_RANGE = { min: 0, max: 100 };
