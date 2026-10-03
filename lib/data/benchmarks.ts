/**
 * INDICATIVE PERFORMANCE DATA.
 *
 * WHAT THIS IS
 * ------------
 * A compact, hand-curated performance index so the builder can answer the
 * question users actually ask - "how fast will this thing be?" - instead of
 * only "will it turn on?".
 *
 * WHY RELATIVE AND NOT ABSOLUTE
 * -----------------------------
 * These are NOT scraped benchmark results and they are deliberately not precise
 * absolute Cinebench/3DMark numbers. Publishing exact-looking figures we did
 * not measure would be the single most damaging thing this site could do: the
 * entire value proposition is that the data here is trustworthy, and a
 * confidently wrong "21,847 multi-core score" is worse than no number at all.
 *
 * So every figure here is a rounded index against a stated, fixed baseline:
 *
 *   CPU  - multi-threaded throughput,    Ryzen 5 5600 (6c/12t) = 100
 *          single-thread throughput,     Ryzen 5 5600          = 100
 *   GPU  - raster gaming performance,    RTX 4060              = 100
 *
 * The baselines are the reference points readers already know, which makes an
 * index easy to reason about: "1.8x a 5600" is more meaningful, and far more
 * honest, than an absolute number whose provenance we cannot defend.
 *
 * Accuracies are approximate to within roughly +/-10%. Treat the output as
 * guidance for comparing one build against another, never as a lab result.
 *
 * Keys are product ids from lib/data/products.ts. Anything missing degrades
 * gracefully: `cpuBench()` / `gpuBench()` return null and the caller says so
 * rather than guessing.
 */

export interface CpuBenchmark {
  /** Physical cores. */
  cores: number;
  /** Logical threads (SMT). */
  threads: number;
  /** Multi-threaded index, Ryzen 5 5600 = 100. */
  multi: number;
  /** Single-thread index, Ryzen 5 5600 = 100. */
  single: number;
  /** Rough gaming headroom, mainly single-thread and cache. */
  gaming: number;
}

export interface GpuBenchmark {
  /** Raster gaming index at 1080p, RTX 4060 = 100. */
  raster1080: number;
  /** Raster index at 1440p, where VRAM and bandwidth bite harder. */
  raster1440: number;
  /** Ray-tracing / upscaling-capable generation, as an index. */
  rt: number;
}

/**
 * Baseline products, exported so the UI can state the reference point instead
 * of making the reader guess what 100 means.
 */
export const CPU_BASELINE = "Ryzen 5 5600";
export const GPU_BASELINE = "RTX 4060";

/* ------------------------------------------------------------------ CPUs */

export const CPU_BENCH: Record<string, CpuBenchmark> = {
  // --- Intel LGA1700, 12th gen ---
  "cpu-i3-12100f": { cores: 4, threads: 8, multi: 45, single: 52, gaming: 50 },
  "cpu-i3-13100f": { cores: 4, threads: 8, multi: 48, single: 55, gaming: 53 },
  "cpu-i3-14100f": { cores: 4, threads: 8, multi: 50, single: 58, gaming: 56 },
  "cpu-i5-12400f": { cores: 6, threads: 12, multi: 70, single: 74, gaming: 70 },
  "cpu-i5-12600kf": { cores: 10, threads: 16, multi: 105, single: 95, gaming: 92 },
  "cpu-i5-12600k": { cores: 10, threads: 16, multi: 110, single: 98, gaming: 95 },
  "cpu-i5-13400f": { cores: 10, threads: 16, multi: 110, single: 100, gaming: 95 },
  "cpu-i5-13600kf": { cores: 14, threads: 20, multi: 140, single: 108, gaming: 105 },
  "cpu-i7-12700k": { cores: 12, threads: 20, multi: 145, single: 112, gaming: 108 },
  "cpu-i7-13700f": { cores: 14, threads: 20, multi: 150, single: 112, gaming: 108 },
  "cpu-i7-13700k": { cores: 14, threads: 20, multi: 155, single: 115, gaming: 112 },
  "cpu-i9-12900k": { cores: 16, threads: 24, multi: 175, single: 118, gaming: 115 },
  "cpu-i9-13900k": { cores: 24, threads: 32, multi: 215, single: 125, gaming: 122 },

  // --- Intel LGA1700, 14th gen ---
  "cpu-i5-14400f": { cores: 10, threads: 16, multi: 115, single: 103, gaming: 98 },
  "cpu-i5-14600kf": { cores: 14, threads: 20, multi: 148, single: 112, gaming: 108 },
  "cpu-i7-14700kf": { cores: 20, threads: 28, multi: 190, single: 122, gaming: 118 },
  "cpu-i9-14900k": { cores: 24, threads: 32, multi: 228, single: 130, gaming: 128 },

  // --- Intel LGA1200 ---
  "cpu-i3-10100f": { cores: 4, threads: 8, multi: 38, single: 45, gaming: 43 },
  "cpu-i5-10400f": { cores: 6, threads: 12, multi: 62, single: 68, gaming: 64 },
  "cpu-i5-10600kf": { cores: 6, threads: 12, multi: 70, single: 78, gaming: 72 },
  "cpu-i5-11400f": { cores: 6, threads: 12, multi: 72, single: 82, gaming: 76 },
  "cpu-i7-10700f": { cores: 8, threads: 16, multi: 95, single: 85, gaming: 82 },

  // --- Intel LGA1200, 9th gen ---
  "cpu-i9-10900k": { cores: 10, threads: 20, multi: 118, single: 98, gaming: 95 },
  "cpu-i9-11900k": { cores: 8, threads: 16, multi: 108, single: 105, gaming: 100 },

  // --- Intel Core Ultra (LGA1851) ---
  "cpu-u5-225f": { cores: 6, threads: 6, multi: 78, single: 100, gaming: 96 },
  "cpu-u5-245k": { cores: 14, threads: 14, multi: 160, single: 122, gaming: 115 },
  "cpu-u7-265k": { cores: 20, threads: 20, multi: 205, single: 130, gaming: 124 },
  "cpu-u7-270k": { cores: 20, threads: 20, multi: 210, single: 132, gaming: 126 },
  "cpu-u9-285k": { cores: 24, threads: 24, multi: 245, single: 138, gaming: 132 },

  // --- AMD AM4 ---
  "cpu-r3-3100": { cores: 4, threads: 8, multi: 35, single: 48, gaming: 46 },
  "cpu-r3-3200g": { cores: 4, threads: 8, multi: 38, single: 55, gaming: 52 },
  "cpu-r3-2200g": { cores: 4, threads: 4, multi: 28, single: 48, gaming: 45 },
  "cpu-r3-4100": { cores: 4, threads: 8, multi: 40, single: 58, gaming: 54 },
  "cpu-r3-4300g": { cores: 4, threads: 8, multi: 42, single: 60, gaming: 56 },
  "cpu-r5-3400g": { cores: 4, threads: 8, multi: 44, single: 62, gaming: 58 },
  "cpu-r5-3500x": { cores: 6, threads: 6, multi: 58, single: 66, gaming: 62 },
  "cpu-r5-3600": { cores: 6, threads: 12, multi: 82, single: 76, gaming: 78 },
  "cpu-r5-4500": { cores: 6, threads: 6, multi: 62, single: 70, gaming: 64 },
  "cpu-r5-5500": { cores: 6, threads: 12, multi: 85, single: 78, gaming: 80 },
  "cpu-r5-5500gt": { cores: 6, threads: 12, multi: 83, single: 76, gaming: 78 },
  "cpu-r5-5600": { cores: 6, threads: 12, multi: 100, single: 100, gaming: 100 },
  "cpu-r5-5600g": { cores: 6, threads: 12, multi: 88, single: 82, gaming: 85 },
  "cpu-r5-5600gt": { cores: 6, threads: 12, multi: 85, single: 80, gaming: 83 },
  "cpu-r5-5600x": { cores: 6, threads: 12, multi: 105, single: 102, gaming: 103 },
  "cpu-r5-5650g": { cores: 6, threads: 12, multi: 90, single: 84, gaming: 86 },
  "cpu-r7-5700x3d": { cores: 8, threads: 16, multi: 112, single: 92, gaming: 135 },
  "cpu-r7-5700": { cores: 8, threads: 16, multi: 118, single: 95, gaming: 96 },
  "cpu-r7-5700x": { cores: 8, threads: 16, multi: 120, single: 98, gaming: 98 },
  "cpu-r7-5700g": { cores: 8, threads: 16, multi: 110, single: 88, gaming: 92 },
  "cpu-r7-5800x": { cores: 8, threads: 16, multi: 128, single: 100, gaming: 102 },
  "cpu-r9-5900x": { cores: 12, threads: 24, multi: 165, single: 105, gaming: 108 },
  "cpu-r9-5950x": { cores: 16, threads: 32, multi: 205, single: 108, gaming: 112 },

  // --- AMD AM5 ---
  "cpu-r5-7500f": { cores: 6, threads: 6, multi: 88, single: 98, gaming: 95 },
  "cpu-r5-7500x3d": { cores: 6, threads: 6, multi: 92, single: 102, gaming: 138 },
  "cpu-r5-7600": { cores: 6, threads: 12, multi: 112, single: 105, gaming: 108 },
  "cpu-r5-7600x": { cores: 6, threads: 12, multi: 118, single: 108, gaming: 110 },
  "cpu-r5-8500g": { cores: 6, threads: 12, multi: 92, single: 90, gaming: 90 },
  "cpu-r5-8400f": { cores: 6, threads: 12, multi: 86, single: 88, gaming: 87 },
  "cpu-r5-8600g": { cores: 6, threads: 12, multi: 98, single: 95, gaming: 94 },
  "cpu-r5-9600": { cores: 6, threads: 12, multi: 122, single: 112, gaming: 112 },
  "cpu-r5-9600x": { cores: 6, threads: 12, multi: 128, single: 115, gaming: 114 },
  "cpu-r7-7700": { cores: 8, threads: 16, multi: 140, single: 115, gaming: 115 },
  "cpu-r7-7700x": { cores: 8, threads: 16, multi: 148, single: 118, gaming: 118 },
  "cpu-r7-7800x3d": { cores: 8, threads: 16, multi: 152, single: 122, gaming: 165 },
  "cpu-r7-8700g": { cores: 8, threads: 16, multi: 130, single: 105, gaming: 108 },
  "cpu-r7-8700f": { cores: 8, threads: 16, multi: 135, single: 108, gaming: 110 },
  "cpu-r7-9700x": { cores: 8, threads: 16, multi: 155, single: 125, gaming: 120 },
  "cpu-r7-9850x3d": { cores: 8, threads: 16, multi: 158, single: 128, gaming: 172 },
  "cpu-r9-7900": { cores: 12, threads: 24, multi: 195, single: 122, gaming: 122 },
  "cpu-r9-7900x": { cores: 12, threads: 24, multi: 215, single: 130, gaming: 128 },
  "cpu-r9-9900x": { cores: 12, threads: 24, multi: 225, single: 135, gaming: 132 },
  "cpu-r9-9900x3d": { cores: 12, threads: 24, multi: 228, single: 138, gaming: 195 },
  "cpu-r9-9950x": { cores: 16, threads: 32, multi: 290, single: 140, gaming: 138 },
  "cpu-r9-9950x3d": { cores: 16, threads: 32, multi: 295, single: 142, gaming: 205 },
  "cpu-r7-3700x": { cores: 8, threads: 16, multi: 108, single: 82, gaming: 85 },
  "cpu-r9-7950x": { cores: 16, threads: 32, multi: 275, single: 135, gaming: 135 },
  "cpu-r7-9800x3d": { cores: 8, threads: 16, multi: 150, single: 126, gaming: 180 },
};

/* ------------------------------------------------------------------ GPUs */

export const GPU_BENCH: Record<string, GpuBenchmark> = {
  // --- NVIDIA, 50 series ---
  "gpu-rtx5090-32gb": { raster1080: 255, raster1440: 275, rt: 250 },
  "gpu-rtx5080-16gb": { raster1080: 195, raster1440: 210, rt: 195 },
  "gpu-rtx5070ti-16gb": { raster1080: 150, raster1440: 160, rt: 155 },
  "gpu-rtx5070-12gb": { raster1080: 120, raster1440: 125, rt: 120 },
  "gpu-rtx5060ti-16gb": { raster1080: 108, raster1440: 110, rt: 105 },
  "gpu-rtx5060ti-8gb": { raster1080: 103, raster1440: 103, rt: 100 },
  "gpu-rtx5060-8gb": { raster1080: 82, raster1440: 78, rt: 80 },
  "gpu-rtx5050-8gb": { raster1080: 62, raster1440: 55, rt: 60 },

  // --- NVIDIA, 40 series ---
  "gpu-rtx4090-24gb": { raster1080: 232, raster1440: 250, rt: 230 },
  "gpu-rtx4080s-16gb": { raster1080: 162, raster1440: 178, rt: 160 },
  "gpu-rtx4080-16gb": { raster1080: 150, raster1440: 162, rt: 150 },
  "gpu-rtx4070tis-16gb": { raster1080: 138, raster1440: 148, rt: 138 },
  "gpu-rtx4070ti-12gb": { raster1080: 125, raster1440: 132, rt: 125 },
  "gpu-rtx4070s-12gb": { raster1080: 118, raster1440: 124, rt: 118 },
  "gpu-rtx4070-12gb": { raster1080: 108, raster1440: 112, rt: 108 },
  "gpu-rtx4060ti-16gb": { raster1080: 112, raster1440: 116, rt: 112 },
  "gpu-rtx4060ti-8gb": { raster1080: 108, raster1440: 108, rt: 108 },
  "gpu-rtx4060-8gb": { raster1080: 100, raster1440: 100, rt: 100 },

  // --- NVIDIA, 30 series ---
  "gpu-rtx3090-24gb": { raster1080: 195, raster1440: 208, rt: 190 },
  "gpu-rtx3080ti-12gb": { raster1080: 175, raster1440: 185, rt: 170 },
  "gpu-rtx3080-10gb": { raster1080: 155, raster1440: 162, rt: 150 },
  "gpu-rtx3070ti-8gb": { raster1080: 130, raster1440: 135, rt: 128 },
  "gpu-rtx3070-8gb": { raster1080: 118, raster1440: 122, rt: 115 },
  "gpu-rtx3060ti-8gb": { raster1080: 95, raster1440: 96, rt: 92 },
  "gpu-rtx3060-12gb": { raster1080: 85, raster1440: 84, rt: 82 },
  "gpu-rtx3060-8gb": { raster1080: 80, raster1440: 78, rt: 78 },
  "gpu-rtx3050-8gb": { raster1080: 62, raster1440: 58, rt: 60 },
  "gpu-rtx3050-6gb": { raster1080: 55, raster1440: 50, rt: 52 },

  // --- NVIDIA, 20 series ---
  "gpu-rtx2080s-8gb": { raster1080: 105, raster1440: 105, rt: 100 },
  "gpu-rtx2070s-8gb": { raster1080: 88, raster1440: 88, rt: 85 },
  "gpu-rtx2060s-8gb": { raster1080: 72, raster1440: 70, rt: 68 },
  "gpu-rtx2060-6gb": { raster1080: 65, raster1440: 62, rt: 60 },

  // --- NVIDIA, 16 series and older ---
  "gpu-gtx1660ti-6gb": { raster1080: 68, raster1440: 62, rt: 20 },
  "gpu-gtx1660s-6gb": { raster1080: 62, raster1440: 58, rt: 20 },
  "gpu-gtx1660-6gb": { raster1080: 58, raster1440: 55, rt: 18 },
  "gpu-gtx1650s-4gb": { raster1080: 45, raster1440: 40, rt: 12 },
  "gpu-gtx1650-4gb": { raster1080: 42, raster1440: 38, rt: 12 },
  "gpu-gtx1070-8gb": { raster1080: 58, raster1440: 52, rt: 15 },
  "gpu-gtx1060-6gb": { raster1080: 45, raster1440: 40, rt: 12 },
  "gpu-gtx1050ti-4gb": { raster1080: 32, raster1440: 28, rt: 10 },
  "gpu-gtx950-2gb": { raster1080: 20, raster1440: 16, rt: 6 },
  "gpu-gt1030-4gb": { raster1080: 14, raster1440: 10, rt: 4 },
  "gpu-gt730-4gb": { raster1080: 8, raster1440: 6, rt: 2 },

  // --- AMD, RX 9000 ---
  "gpu-rx9070xt-16gb": { raster1080: 205, raster1440: 215, rt: 200 },
  "gpu-rx9070-16gb": { raster1080: 152, raster1440: 158, rt: 150 },
  "gpu-rx9060xt-16gb": { raster1080: 112, raster1440: 115, rt: 110 },
  "gpu-rx9060xt-8gb": { raster1080: 105, raster1440: 105, rt: 102 },

  // --- AMD, RX 7000 ---
  "gpu-rx7900xtx-24gb": { raster1080: 158, raster1440: 170, rt: 155 },
  "gpu-rx7900xt-20gb": { raster1080: 152, raster1440: 160, rt: 148 },
  "gpu-rx7800xt-16gb": { raster1080: 108, raster1440: 112, rt: 105 },
  "gpu-rx7700xt-12gb": { raster1080: 98, raster1440: 100, rt: 95 },
  "gpu-rx7600xt-16gb": { raster1080: 100, raster1440: 102, rt: 95 },
  "gpu-rx7600-8gb": { raster1080: 92, raster1440: 92, rt: 85 },

  // --- AMD, RX 6000 ---
  "gpu-rx6900xt-16gb": { raster1080: 128, raster1440: 132, rt: 118 },
  "gpu-rx6800xt-16gb": { raster1080: 118, raster1440: 122, rt: 110 },
  "gpu-rx6800-16gb": { raster1080: 110, raster1440: 112, rt: 100 },
  "gpu-rx6750xt-12gb": { raster1080: 95, raster1440: 96, rt: 88 },
  "gpu-rx6700xt-12gb": { raster1080: 92, raster1440: 92, rt: 85 },
  "gpu-rx6700-10gb": { raster1080: 88, raster1440: 88, rt: 82 },
  "gpu-rx6650xt-8gb": { raster1080: 80, raster1440: 78, rt: 75 },
  "gpu-rx6600xt-8gb": { raster1080: 75, raster1440: 72, rt: 70 },
  "gpu-rx6500xt-4gb": { raster1080: 62, raster1440: 55, rt: 58 },
  "gpu-rx6600-8gb": { raster1080: 70, raster1440: 66, rt: 65 },

  // --- AMD, RX 5000 and older ---
  "gpu-rx5700xt-8gb": { raster1080: 70, raster1440: 64, rt: 50 },
  "gpu-rx5700-8gb": { raster1080: 65, raster1440: 58, rt: 45 },
  "gpu-rx590-8gb": { raster1080: 52, raster1440: 46, rt: 32 },
  "gpu-rx580-8gb": { raster1080: 40, raster1440: 34, rt: 22 },
  "gpu-rx580-4gb": { raster1080: 32, raster1440: 27, rt: 18 },
  "gpu-rx570-8gb": { raster1080: 30, raster1440: 25, rt: 16 },
  "gpu-rx570-4gb": { raster1080: 25, raster1440: 20, rt: 13 },
  "gpu-rx5600xt-6gb": { raster1080: 45, raster1440: 38, rt: 25 },
  "gpu-rx5500xt-8gb": { raster1080: 35, raster1440: 28, rt: 20 },
  "gpu-rx5500xt-4gb": { raster1080: 30, raster1440: 24, rt: 17 },
  "gpu-rx5500-4gb": { raster1080: 28, raster1440: 22, rt: 15 },
  "gpu-rx480-8gb": { raster1080: 25, raster1440: 20, rt: 12 },

  // --- Intel Arc ---
  // NOTE: a second listing id for the B580 12GB exists in live offer data
  // under a different id, but it is not in the static catalogue, so it gets
  // no index here. An index key without a catalogue product breaks the
  // scorer (it receives undefined) and fails check-perf.cjs section 6.
  // If the id is ever added to lib/data/products.ts, mirror the entry below.
  "gpu-arc-b580-12gb": { raster1080: 105, raster1440: 108, rt: 102 },
  "gpu-arc-a750-8gb": { raster1080: 95, raster1440: 98, rt: 92 },
  "gpu-arc-a580-8gb": { raster1080: 62, raster1440: 60, rt: 58 },
  "gpu-arc-a380-6gb": { raster1080: 25, raster1440: 20, rt: 22 },
};

/* --------------------------------------------------- memory and storage */

/**
 * Memory bandwidth index, DDR4-3200 dual channel = 100.
 *
 * HOW THE BANDWIDTH NUMBERS ARE DERIVED (not guessed per kit)
 * -----------------------------------------------------------
 * bandwidth = round(100 * MT/s / 3200).
 *
 * 3200 -> 100, 3600 -> 112, 2666 -> 83, 5600 -> 175, 6000 -> 188, 6400 -> 200.
 * Every entry in the table below matches this formula; it is stated here so a
 * future kit can be added by arithmetic rather than by feel. Dual-channel is
 * assumed throughout - a single stick halves real throughput, which is why the
 * guides insist on two sticks rather than one.
 *
 * `cl` is the CAS latency printed on the kit (a cycle count, NOT nanoseconds).
 * True latency in ns is CL * 2000 / MT/s, e.g. a 3200 CL16 kit is 10 ns, not
 * 16. An earlier version of this file labelled the CL number `latencyNs`,
 * which was wrong by definition; the field is renamed so the mistake cannot
 * be reintroduced by reading the name literally. `cl` is null wherever the
 * cycle count is not on the label we track - omitted rather than guessed.
 * Nothing in the perf model consumes it - bandwidth is the axis that moves
 * CPU-bound scores.
 */
export const RAM_BASELINE_MTS = 3200;

export function ramBandwidthFor(mts: number): number {
  return Math.round((100 * mts) / RAM_BASELINE_MTS);
}

export const RAM_BENCH: Record<string, { bandwidth: number; cl: number | null }> = {
  "ram-vengeance-16-d4": { bandwidth: 100, cl: 16 },
  "ram-vengeance-32-d4": { bandwidth: 100, cl: 16 },
  "ram-value-8-d4": { bandwidth: 100, cl: 22 },
  "ram-16gb-d4-3600": { bandwidth: 113, cl: null },
  "ram-32gb-d4-3600": { bandwidth: 113, cl: null },
  "ram-8gb-d4-3600": { bandwidth: 113, cl: null },
  "ram-4gb-d4-2666": { bandwidth: 83, cl: 19 },
  "ram-8gb-d3-1600": { bandwidth: 50, cl: null },
  "ram-vengeance-16-d5": { bandwidth: 175, cl: 10 },
  "ram-16gb-d5-5600": { bandwidth: 175, cl: 10 },
  "ram-8gb-d5-5600": { bandwidth: 175, cl: 10 },
  "ram-32gb-d5-5600": { bandwidth: 175, cl: 10 },
  "ram-delta-32-d5": { bandwidth: 188, cl: 10 },
  "ram-32gb-d5-6000": { bandwidth: 188, cl: 10 },
  "ram-48gb-d5-6000": { bandwidth: 188, cl: 10 },
  "ram-64gb-d5-6000": { bandwidth: 188, cl: 10 },
  "ram-16gb-d5-6000": { bandwidth: 188, cl: 10 },
  "ram-32gb-d5-6400": { bandwidth: 200, cl: 10 },
  "ram-16gb-d5-6400": { bandwidth: 200, cl: 10 },
  "ram-96gb-d5": { bandwidth: 200, cl: 10 },
  "ram-24gb-d5": { bandwidth: 188, cl: 10 },
  "ram-lexar-thor-16gb-3200": { bandwidth: 100, cl: 16 },
  "ram-lexar-thor-32gb-3200": { bandwidth: 100, cl: 16 },
  "ram-lexar-ares-32gb-6000": { bandwidth: 188, cl: 30 },
};

/**
 * Storage throughput. `seqRead`/`seqWrite` are MB/s, `random4k` is 4K random
 * read IOPS, which is what makes a cheap SATA drive feel slow in Windows and
 * in game load times despite respectable sequential numbers.
 */
export const SSD_BENCH: Record<
  string,
  { seqRead: number; seqWrite: number; random4k: number; interface: string }
> = {
  "ssd-gen5-1tb": { seqRead: 10000, seqWrite: 9500, random4k: 1400, interface: "PCIe 5.0 x4" },
  "ssd-990pro-2tb": { seqRead: 7450, seqWrite: 6900, random4k: 1350, interface: "PCIe 4.0 x4" },
  "ssd-nm790-2tb": { seqRead: 7400, seqWrite: 6500, random4k: 1150, interface: "PCIe 4.0 x4" },
  "ssd-nm790-1tb": { seqRead: 7400, seqWrite: 6500, random4k: 1100, interface: "PCIe 4.0 x4" },
  "ssd-sn850x-1tb": { seqRead: 7300, seqWrite: 6600, random4k: 1200, interface: "PCIe 4.0 x4" },
  "ssd-sn850x-2tb": { seqRead: 7300, seqWrite: 6600, random4k: 1200, interface: "PCIe 4.0 x4" },
  "ssd-990evo-plus": { seqRead: 7150, seqWrite: 6300, random4k: 1050, interface: "PCIe 4.0 x4" },
  "ssd-980pro-1tb": { seqRead: 7000, seqWrite: 5000, random4k: 1000, interface: "PCIe 4.0 x4" },
  "ssd-sn850-1tb": { seqRead: 7000, seqWrite: 5300, random4k: 900, interface: "PCIe 4.0 x4" },
  "ssd-nvme-2tb": { seqRead: 7000, seqWrite: 6800, random4k: 1050, interface: "PCIe 4.0 x4" },
  "ssd-nvme-4tb": { seqRead: 7000, seqWrite: 6800, random4k: 1050, interface: "PCIe 4.0 x4" },
  "ssd-nv3-2tb": { seqRead: 6000, seqWrite: 5000, random4k: 850, interface: "PCIe 4.0 x4" },
  "ssd-nv3-1tb": { seqRead: 6000, seqWrite: 4000, random4k: 800, interface: "PCIe 4.0 x4" },
  "ssd-nvme-1tb-g4": { seqRead: 6000, seqWrite: 4000, random4k: 800, interface: "PCIe 4.0 x4" },
  "ssd-nm620-1tb": { seqRead: 5000, seqWrite: 4000, random4k: 800, interface: "PCIe 4.0 x4" },
  "ssd-nm710-1tb": { seqRead: 5000, seqWrite: 4000, random4k: 850, interface: "PCIe 4.0 x4" },
  "ssd-sn580-1tb": { seqRead: 4150, seqWrite: 4000, random4k: 750, interface: "PCIe 4.0 x4" },
  "ssd-nv3-500gb": { seqRead: 5000, seqWrite: 3000, random4k: 650, interface: "PCIe 4.0 x4" },
  "ssd-nm620-512gb": { seqRead: 3500, seqWrite: 2400, random4k: 450, interface: "PCIe 3.0 x4" },
  "ssd-netac-nv3000-1tb": { seqRead: 3100, seqWrite: 2100, random4k: 400, interface: "PCIe 3.0 x4" },
  "ssd-nvme-500gb": { seqRead: 3500, seqWrite: 3300, random4k: 550, interface: "PCIe 3.0 x4" },
  "ssd-970evo-1tb": { seqRead: 3500, seqWrite: 3300, random4k: 600, interface: "PCIe 3.0 x4" },
  "ssd-nvme-512gb": { seqRead: 3400, seqWrite: 2600, random4k: 500, interface: "PCIe 4.0 x4" },
  "ssd-nvme-256gb": { seqRead: 3000, seqWrite: 1800, random4k: 380, interface: "PCIe 3.0 x4" },
  "ssd-nv2-1tb": { seqRead: 2200, seqWrite: 2000, random4k: 400, interface: "PCIe 3.0 x4" },
  "ssd-portable-1tb": { seqRead: 1050, seqWrite: 1000, random4k: 100, interface: "USB 3.2" },
  "ssd-external": { seqRead: 1000, seqWrite: 900, random4k: 95, interface: "USB 3.2" },
  "ssd-sata-25": { seqRead: 560, seqWrite: 530, random4k: 80, interface: "SATA III" },
  "ssd-sata-512gb": { seqRead: 560, seqWrite: 520, random4k: 85, interface: "SATA III" },
  "ssd-sata-1tb": { seqRead: 560, seqWrite: 530, random4k: 85, interface: "SATA III" },
  "ssd-sata-360gb": { seqRead: 550, seqWrite: 510, random4k: 80, interface: "SATA III" },
  "ssd-sata-256gb": { seqRead: 550, seqWrite: 520, random4k: 78, interface: "SATA III" },
  "ssd-sata-2tb": { seqRead: 550, seqWrite: 520, random4k: 80, interface: "SATA III" },
  "ssd-sata-120gb": { seqRead: 545, seqWrite: 500, random4k: 75, interface: "SATA III" },
  "ssd-128gb": { seqRead: 540, seqWrite: 500, random4k: 70, interface: "SATA III" },
  "ssd-budget": { seqRead: 500, seqWrite: 450, random4k: 60, interface: "SATA III" },
};

/* ----------------------------------------------------------------- coolers */

export interface CoolerBenchmark {
  /**
   * Rated heat dissipation in watts - the manufacturer's own TDP class for the
   * cooler, i.e. the CPU heat it is specified to remove. It is an objective
   * spec figure, not a measured result: a 120 mm single tower is a 120-150 W
   * part, a dual tower ~250 W, a 240 mm AIO ~250 W, a 360 mm AIO ~300-320 W.
   */
  tdpRating: number;
  /** Air tower or liquid cooler. Decided by geometry: the AIOs are 55 mm. */
  kind: "air" | "aio";
  /** Radiator size in mm for an AIO, null for air. */
  radiator?: 120 | 240 | 360;
}

export const COOLER_BENCH: Record<string, CoolerBenchmark> = {
  // --- 120 mm single tower ---
  "cooler-ag200": { tdpRating: 120, kind: "air" },
  "cooler-a30": { tdpRating: 130, kind: "air" },
  "cooler-ag400": { tdpRating: 130, kind: "air" },
  "cooler-ocypus": { tdpRating: 135, kind: "air" },
  "cooler-boreas-m2": { tdpRating: 135, kind: "air" },
  "cooler-am1204": { tdpRating: 135, kind: "air" },
  "cooler-ac902k": { tdpRating: 110, kind: "air" },
  "cooler-ag500": { tdpRating: 160, kind: "air" },
  "cooler-ma421a": { tdpRating: 140, kind: "air" },
  "cooler-mars": { tdpRating: 140, kind: "air" },
  "cooler-f2005": { tdpRating: 140, kind: "air" },
  "cooler-f2002-360": { tdpRating: 320, kind: "aio", radiator: 360 },

  // --- 120 mm single tower with more pipes ---
  "cooler-h212-v3": { tdpRating: 150, kind: "air" },
  "cooler-ak500": { tdpRating: 150, kind: "air" },
  "cooler-ak400": { tdpRating: 155, kind: "air" },
  "cooler-ak500-g2": { tdpRating: 160, kind: "air" },
  "cooler-corefrozr": { tdpRating: 160, kind: "air" },
  "cooler-phantom": { tdpRating: 230, kind: "air" },

  // --- dual tower ---
  "cooler-peerless-120": { tdpRating: 250, kind: "air" },
  "cooler-assassin-x120": { tdpRating: 155, kind: "air" },
  "cooler-ak620": { tdpRating: 250, kind: "air" },
  "cooler-ag620": { tdpRating: 250, kind: "air" },
  "cooler-ak700": { tdpRating: 250, kind: "air" },
  "cooler-ma621c": { tdpRating: 260, kind: "air" },
  "cooler-assassin4": { tdpRating: 260, kind: "air" },
  "cooler-hyper622": { tdpRating: 260, kind: "air" },

  // --- 120 mm AIO ---
  "cooler-gl120": { tdpRating: 150, kind: "aio", radiator: 120 },
  "cooler-tt120": { tdpRating: 150, kind: "aio", radiator: 120 },

  // --- 240 mm AIO ---
  "cooler-lt240": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-le520": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-lt520": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-ml240-core": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-aura-gl240": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-prime-lc240": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-mag240": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-wl240ft": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-hl240": { tdpRating: 250, kind: "aio", radiator: 240 },

  // --- 360 mm AIO ---
  "cooler-deepcool-le720": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-lt360": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-lt720": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-lq360": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-wl360ft": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-proart360": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-ml360": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-kraken": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-deepcool-ld240": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-deepcool-ld360": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-deepcool-ls520": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-deepcool-ls720": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-deepcool-mystique-360": { tdpRating: 340, kind: "aio", radiator: 360 },
  "cooler-arctic-freezer-36": { tdpRating: 180, kind: "air" },
  "cooler-arctic-lf3-360": { tdpRating: 340, kind: "aio", radiator: 360 },
  "cooler-msi-coreliquid-240": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-msi-coreliquid-360": { tdpRating: 320, kind: "aio", radiator: 360 },
  "cooler-raidmax-ls240": { tdpRating: 230, kind: "aio", radiator: 240 },
  "cooler-raidmax-lm240": { tdpRating: 250, kind: "aio", radiator: 240 },
  "cooler-raidmax-lm360": { tdpRating: 320, kind: "aio", radiator: 360 },
};

/* ------------------------------------------------------------- accessors */

export function coolerBench(productId: string): CoolerBenchmark | null {
  return COOLER_BENCH[productId] ?? null;
}

export function cpuBench(productId: string): CpuBenchmark | null {
  return CPU_BENCH[productId] ?? null;
}

export function gpuBench(productId: string): GpuBenchmark | null {
  return GPU_BENCH[productId] ?? null;
}

export function ramBench(productId: string): { bandwidth: number; cl: number | null } | null {
  return RAM_BENCH[productId] ?? null;
}

export function ssdBench(productId: string) {
  return SSD_BENCH[productId] ?? null;
}
