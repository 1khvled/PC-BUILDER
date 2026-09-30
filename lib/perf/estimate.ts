import {
  CPU_BASELINE,
  GPU_BASELINE,
  cpuBench,
  gpuBench,
  ramBench,
  ssdBench,
} from "@/lib/data/benchmarks";
import type { Product } from "@/lib/data/products";

/**
 * BUILD PERFORMANCE ESTIMATE.
 *
 * Turns the per-part indices in lib/data/benchmarks into a single, honest
 * read on a finished build, and - more usefully - spots the cases where money
 * is being wasted. A perfectly compatible build can still be a bad build: a
 * 5700X3D behind a GTX 1650, or a 5090 on a 650 W supply, both "work" and both
 * disappoint.
 *
 * Everything here is arithmetic on the indices. There is no model fitting and
 * no scraped data, so it degrades honestly: if a part has no index, the
 * estimate reports less coverage rather than inventing a number.
 */

export type PerfTier = "entry" | "mainstream" | "performance" | "enthusiast" | "flagship";

export interface PerfNote {
  /** Stable key so the UI can translate it. Never render these strings raw. */
  key: PerfNoteKey;
  /** Filled-in values for the message template. */
  vars?: Record<string, string | number>;
  severity: "info" | "warn" | "bad";
}

export type PerfNoteKey =
  | "perf.cpuBottleneckGpu"
  | "perf.gpuBottleneckCpu"
  | "perf.slowStorage"
  | "perf.slowMemory"
  | "perf.partialData"
;

export interface BuildPerformance {
  /** 0-100, relative across builds. Null when we have too little to go on. */
  gaming: number | null;
  /** 0-100, relative across builds. Null when there is no CPU. */
  productivity: number | null;
  tier: PerfTier | null;
  /** Parts we had an index for, out of the parts that matter for a score. */
  coverage: { rated: number; total: number };
  cpuLabel: string | null;
  gpuLabel: string | null;
  notes: PerfNote[];
}

/** Cap a raw index at 100 so one very fast part cannot carry a bad build. */
function score(index: number | null, reference: number): number | null {
  if (index == null) return null;
  // Compressive curve: going from 50 -> 100 matters far more to a buyer than
  // 250 -> 300, and a linear map would make every high-end build look equal.
  const ratio = index / reference;
  return Math.round(100 * Math.pow(Math.min(ratio, 3), 0.32));
}

function tierFor(gaming: number): PerfTier {
  if (gaming >= 92) return "flagship";
  if (gaming >= 78) return "enthusiast";
  if (gaming >= 60) return "performance";
  if (gaming >= 40) return "mainstream";
  return "entry";
}

export function estimatePerformance(build: Partial<Record<string, Product>>): BuildPerformance {
  const cpu = build.cpu;
  const gpu = build.gpu;
  const ram = build.ram;
  const ssd = build.ssd;

  const c = cpu ? cpuBench(cpu.id) : null;
  const g = gpu ? gpuBench(gpu.id) : null;
  const r = ram ? ramBench(ram.id) : null;
  const s = ssd ? ssdBench(ssd.id) : null;

  const notes: PerfNote[] = [];

  /* ---------------------------------------------------- gaming score ---- */
  // The GPU is the ceiling for raster gaming; the CPU only matters when it is
  // close behind, which is the bottleneck case handled below.
  let gaming: number | null = null;
  if (c && g) {
    // Geometric mean of the two, weighted towards the GPU: a fast CPU cannot
    // make a slow GPU fast, but a slow CPU does drag a fast GPU down.
    const cpuSide = c.gaming;
    const gpuSide = g.raster1080;
    gaming = score(Math.pow(cpuSide * gpuSide, 0.5) / Math.pow(100, 0.5), 100);
  } else if (g) {
    gaming = score(g.raster1080, 100);
  }

  /* ----------------------------------------------- productivity score ---- */
  // CPU-bound work: rendering, compiling, encoding, simulation.
  let productivity: number | null = null;
  if (c) {
    const memoryBoost = r ? 1 + Math.min(r.bandwidth, 200) / 1000 : 1;
    productivity = score(c.multi * memoryBoost, 100);
  }

  /* ------------------------------------------------- bottleneck notes ---- */
  if (c && g && cpu && gpu) {
    const ratio = g.raster1080 / c.gaming;
    if (ratio >= 2.2) {
      notes.push({
        key: "perf.cpuBottleneckGpu",
        vars: { cpu: cpu.model, gpu: gpu.model },
        severity: "warn",
      });
    } else if (ratio <= 0.45) {
      notes.push({
        key: "perf.gpuBottleneckCpu",
        vars: { cpu: cpu.model, gpu: gpu.model },
        severity: "info",
      });
    }
  }

  /* ------------------------------------------- storage and memory notes -- */
  if (s) {
    // Below ~1500 MB/s sequential the drive is visible in load times; below
    // 1000 MB/s it dominates them.
    if (s.seqRead < 1000) {
      notes.push({ key: "perf.slowStorage", vars: { model: ssd!.model, read: s.seqRead }, severity: "warn" });
    }
  }
  if (r && r.bandwidth < 60) {
    notes.push({ key: "perf.slowMemory", vars: { model: ram!.model }, severity: "warn" });
  }

  /* ------------------------------------------------------- coverage ----- */
  const rated = [c, g, r, s].filter(Boolean).length;
  const total = [cpu, gpu, ram, ssd].filter(Boolean).length;

  if (gaming == null && productivity == null) {
    notes.push({ key: "perf.partialData", severity: "info" });
  }

  return {
    gaming,
    productivity,
    tier: gaming != null ? tierFor(gaming) : null,
    coverage: { rated, total },
    cpuLabel: c && cpu ? `${cpu.model} - ${c.cores}C/${c.threads}T` : null,
    gpuLabel: g && gpu ? `${gpu.model} - ${g.raster1080} index` : null,
    notes,
  };
}

/** Human-readable baseline, so "100" is never a mystery. */
export const BASELINES = { cpu: CPU_BASELINE, gpu: GPU_BASELINE };
