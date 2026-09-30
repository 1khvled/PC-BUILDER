import type { Product } from "@/lib/data/products";
import { coolerBench, cpuBench } from "@/lib/data/benchmarks";
import {
  AM5_X3D_HARD_MAX,
  BIOS_REQUIREMENTS,
  ENTRY_CHIPSETS,
  ENTRY_VRM_CPU_INDEX,
  MEMORY_PLATFORM,
  amdSeries,
  chipsetOf,
  efficiencyRank,
  intelGeneration,
  isX3dModel,
} from "./platforms";
import { list, mm, mt, num, str, watts } from "./spec";
import { loadRatio, peakWattage, recommendedPsu, sustainedWattage } from "./watt";

/**
 * COMPATIBILITY RULES.
 *
 * A rule is a pure predicate over an already-extracted `CompatContext` and
 * returns either one translatable finding or `null` (nothing to say). It never
 * reads a product twice, never guesses, and never fires on a fact the
 * catalogue does not actually contain.
 *
 * Three rules govern everything below:
 *
 *   1. `block` means the build will not work or will not go together. Only
 *      for facts that are objective and stated in the specs.
 *   2. `warn` means it works but costs frames, noise or a return trip.
 *   3. `info` means it is worth knowing before you pay.
 *
 * Every key here must have an entry in `COMPAT_RULES` and every entry must be
 * a declared key - the mapped type below is what makes that a compile error
 * rather than a review comment.
 */

export type CompatSeverity = "block" | "warn" | "info";

export type CompatKey =
  /* --- blocks: the build will not work --- */
  | "compat.socketMismatch"
  | "compat.cpuRamType"
  | "compat.moboRamType"
  | "compat.coolerSocket"
  | "compat.coolerTooTall"
  | "compat.gpuTooLong"
  | "compat.caseFormFactor"
  | "compat.psuUnderWattage"
  /* --- warnings: works, but you paid for something you do not get --- */
  | "compat.coolerUnderSized"
  | "compat.ramTooFast"
  | "compat.m2Slots"
  | "compat.vrmEntry"
  /* --- info: know this before you pay --- */
  | "compat.psuOverkill"
  | "compat.psuLowEfficiency"
  | "compat.biosUpdate"
  | "compat.gpuClearanceTight";

export interface CompatFinding {
  /** Stable dictionary key. The UI must translate this, never render raw. */
  key: CompatKey;
  /** Values for the `{placeholders}` in the dictionary string. */
  vars?: Record<string, string | number>;
  severity: CompatSeverity;
}

export type Build = Partial<Record<string, Product>>;

/* ----------------------------------------------------------------- context */

export interface CompatContext {
  cpu: Product | null;
  gpu: Product | null;
  mobo: Product | null;
  ram: Product | null;
  psu: Product | null;
  pcCase: Product | null;
  cooler: Product | null;

  cpuSocket: string | null;
  cpuRamType: string | null;
  cpuTdp: number | null;

  moboSocket: string | null;
  moboRamType: string | null;
  chipset: string | null;
  formFactor: string | null;
  m2: number | null;

  ramType: string | null;
  ramSpeed: number | null;

  gpuLength: number | null;
  gpuTdp: number | null;

  psuWattage: number | null;
  psuRating: string | null;

  maxGpu: number | null;
  maxCooler: number | null;
  caseSupports: string[] | null;

  coolerHeight: number | null;
  coolerSockets: string[] | null;
  coolerRating: number | null;

  /** Every storage part in the build, NVMe ones flagged. */
  drives: { product: Product; nvme: boolean }[];

  power: {
    sustained: number;
    peak: number;
    recommended: number;
    load: number | null;
  };
}

/** 80 PLUS rank at or below which the efficiency advice fires. */
const BRONZE_RANK = efficiencyRank("Bronze") ?? 4;

/**
 * Clears less than this and the fit is tight. A 12V-2x6 / 16-pin cable needs
 * roughly 35 mm of bend radius, so the same slack that is fine for a card with
 * side connectors is not fine for a 5090.
 */
const GPU_CLEARANCE_SLACK_MM = 20;
const GPU_CLEARANCE_SLACK_MM_16PIN = 35;

/** Above this fraction of a supply's rating, efficiency starts to matter. */
const EFFICIENCY_LOAD_FLOOR = 0.55;

/**
 * A supply this far beyond the peak is more than the build can ever draw.
 *
 * `psuOverkill` and `psuLowEfficiency` are deliberately kept as two findings
 * because they are two different purchases: overkill says "you are paying for
 * capacity", low efficiency says "you are paying for losses". They also cannot
 * contradict each other, because their thresholds are disjoint:
 *
 *   overkill  fires when psuW >= 2 * peak, and peak > sustained
 *   efficiency fires when psuW <= sustained / 0.55 = 1.82 * sustained
 *
 * and 2 * sustained > 1.82 * sustained. So a supply is never reported as both
 * too big and too lossy. The verification script asserts this over every
 * PSU x CPU x GPU combination in the catalogue, so tightening either threshold
 * cannot quietly turn them into duplicate advice.
 */
const PSU_OVERKILL_FACTOR = 2;
const PSU_OVERKILL_ABS_W = 200;

/** Fraction of the rated dissipation at which a cooler is merely tight. */
const COOLER_TIGHT_FACTOR = 0.85;

export function buildContext(build: Build): CompatContext {
  const cpu = build.cpu ?? null;
  const gpu = build.gpu ?? null;
  const mobo = build.motherboard ?? null;
  const ram = build.ram ?? null;
  const psu = build.psu ?? null;
  const pcCase = build.case ?? null;
  const cooler = build.cooler ?? null;

  const cpuTdp = watts(cpu, "tdp");
  const gpuTdp = watts(gpu, "tdp_w");
  const sustained = sustainedWattage(cpuTdp ?? 0, gpuTdp ?? 0);
  const peak = peakWattage(sustained, gpuTdp ?? 0);
  const psuWattage = watts(psu, "wattage");

  // Every storage slot in the build, whatever the builder calls the key. The
  // current builder has one; this keeps the rule correct if that changes.
  const drives: CompatContext["drives"] = [];
  for (const part of Object.values(build)) {
    if (!part || part.category !== "ssd") continue;
    const iface = str(part, "interface");
    drives.push({ product: part, nvme: !!iface && iface.toUpperCase().includes("NVME") });
  }

  return {
    cpu,
    gpu,
    mobo,
    ram,
    psu,
    pcCase,
    cooler,

    cpuSocket: str(cpu, "socket"),
    cpuRamType: str(cpu, "ram_type"),
    cpuTdp,

    moboSocket: str(mobo, "socket"),
    moboRamType: str(mobo, "ram_type"),
    chipset: chipsetOf(str(mobo, "chipset")),
    formFactor: str(mobo, "form_factor"),
    m2: num(mobo, "m2"),

    ramType: str(ram, "type"),
    ramSpeed: mt(ram, "speed"),

    gpuLength: mm(gpu, "length_mm"),
    gpuTdp,

    psuWattage,
    psuRating: str(psu, "rating"),

    maxGpu: mm(pcCase, "max_gpu_mm"),
    maxCooler: mm(pcCase, "max_cooler_mm"),
    caseSupports: list(pcCase, "supports"),

    coolerHeight: mm(cooler, "height_mm"),
    coolerSockets: list(cooler, "sockets"),
    coolerRating: cooler ? (coolerBench(cooler.id)?.tdpRating ?? null) : null,

    drives,

    power: {
      sustained,
      peak,
      recommended: recommendedPsu(Math.ceil(peak * 1.15)),
      load: psuWattage ? loadRatio(psuWattage, sustained) : null,
    },
  };
}

/* ------------------------------------------------------------------- rules */

export type CompatRule = (ctx: CompatContext) => CompatFinding | null;

const finding = (
  key: CompatKey,
  severity: CompatSeverity,
  vars?: Record<string, string | number>,
): CompatFinding => (vars ? { key, severity, vars } : { key, severity });

/** Highest MT/s the memory controller on this platform is comfortable with. */
function memoryCeiling(ctx: CompatContext): number | null {
  const socket = ctx.moboSocket ?? ctx.cpuSocket;
  if (!socket) return null;
  const platform = MEMORY_PLATFORM[socket];
  if (!platform) return null;
  if (socket === "AM5" && isX3dModel(ctx.cpu?.model ?? null)) return AM5_X3D_HARD_MAX;
  return platform.hardMax;
}

/**
 * The board shipped before this CPU generation existed.
 *
 * Requires all three of: same socket, a chipset from the requirement's list,
 * and a CPU of the matching generation. The chipset test is the load-bearing
 * one - without it this fires for every 13th gen CPU on every LGA1700 board,
 * new boards included.
 */
function biosGap(ctx: CompatContext): { requirement: (typeof BIOS_REQUIREMENTS)[number] } | null {
  if (!ctx.chipset || !ctx.cpu) return null;
  const socket = ctx.moboSocket ?? ctx.cpuSocket;
  if (!socket) return null;
  const model = ctx.cpu.model;
  const gen = intelGeneration(model);
  const series = amdSeries(model);
  for (const requirement of BIOS_REQUIREMENTS) {
    if (requirement.socket !== socket) continue;
    if (!requirement.chipsets.includes(ctx.chipset)) continue;
    if (requirement.intelGen != null && requirement.intelGen === gen) return { requirement };
    if (requirement.amdSeries != null && requirement.amdSeries === series) return { requirement };
  }
  return null;
}

/**
 * EXHAUSTIVE RULE TABLE.
 *
 * `{ [K in CompatKey]: CompatRule }` means adding a key without a rule, or a
 * rule without a key, is a compile error. This is the mechanism that stops a
 * new check from shipping without a translation.
 */
export const COMPAT_RULES: { [K in CompatKey]: CompatRule } = {
  "compat.socketMismatch": (ctx) => {
    if (!ctx.cpuSocket || !ctx.moboSocket) return null;
    if (ctx.cpuSocket === ctx.moboSocket) return null;
    return finding("compat.socketMismatch", "block", {
      cpu: ctx.cpu?.model ?? ctx.cpuSocket,
      cpuSocket: ctx.cpuSocket,
      board: ctx.mobo?.model ?? "",
      moboSocket: ctx.moboSocket,
    });
  },

  "compat.cpuRamType": (ctx) => {
    if (!ctx.cpuRamType || !ctx.ramType) return null;
    if (ctx.cpuRamType.toUpperCase() === ctx.ramType.toUpperCase()) return null;
    return finding("compat.cpuRamType", "block", {
      cpu: ctx.cpu?.model ?? "",
      needed: ctx.cpuRamType,
      actual: ctx.ramType,
    });
  },

  "compat.moboRamType": (ctx) => {
    if (!ctx.moboRamType || !ctx.ramType) return null;
    if (ctx.moboRamType.toUpperCase() === ctx.ramType.toUpperCase()) return null;
    return finding("compat.moboRamType", "block", {
      board: ctx.mobo?.model ?? "",
      needed: ctx.moboRamType,
      actual: ctx.ramType,
    });
  },

  "compat.coolerSocket": (ctx) => {
    if (!ctx.coolerSockets || !ctx.cpuSocket) return null;
    if (ctx.coolerSockets.includes(ctx.cpuSocket)) return null;
    return finding("compat.coolerSocket", "block", {
      cooler: ctx.cooler?.model ?? "",
      socket: ctx.cpuSocket,
    });
  },

  "compat.coolerTooTall": (ctx) => {
    if (!ctx.coolerHeight || !ctx.maxCooler) return null;
    if (ctx.coolerHeight <= ctx.maxCooler) return null;
    return finding("compat.coolerTooTall", "block", {
      cooler: ctx.cooler?.model ?? "",
      height: ctx.coolerHeight,
      case: ctx.pcCase?.model ?? "",
      max: ctx.maxCooler,
    });
  },

  "compat.gpuTooLong": (ctx) => {
    if (!ctx.gpuLength || !ctx.maxGpu) return null;
    if (ctx.gpuLength <= ctx.maxGpu) return null;
    return finding("compat.gpuTooLong", "block", {
      gpu: ctx.gpu?.model ?? "",
      length: ctx.gpuLength,
      case: ctx.pcCase?.model ?? "",
      max: ctx.maxGpu,
    });
  },

  "compat.caseFormFactor": (ctx) => {
    if (!ctx.formFactor || !ctx.caseSupports) return null;
    if (ctx.caseSupports.includes(ctx.formFactor)) return null;
    return finding("compat.caseFormFactor", "block", {
      board: ctx.mobo?.model ?? "",
      form: ctx.formFactor,
      case: ctx.pcCase?.model ?? "",
    });
  },

  "compat.psuUnderWattage": (ctx) => {
    if (!ctx.psuWattage) return null;
    if (ctx.psuWattage >= ctx.power.sustained) return null;
    return finding("compat.psuUnderWattage", "block", {
      psu: ctx.psu?.model ?? "",
      psuW: ctx.psuWattage,
      sustained: ctx.power.sustained,
    });
  },

  "compat.coolerUnderSized": (ctx) => {
    if (!ctx.cpuTdp || !ctx.coolerRating || !ctx.cooler) return null;
    if (ctx.cpuTdp <= ctx.coolerRating) {
      if (ctx.cpuTdp <= ctx.coolerRating * COOLER_TIGHT_FACTOR) return null;
      return finding("compat.coolerUnderSized", "info", {
        cpu: ctx.cpu?.model ?? "",
        cooler: ctx.cooler.model,
        tdp: ctx.cpuTdp,
        rating: ctx.coolerRating,
      });
    }
    return finding("compat.coolerUnderSized", "warn", {
      cpu: ctx.cpu?.model ?? "",
      cooler: ctx.cooler.model,
      tdp: ctx.cpuTdp,
      rating: ctx.coolerRating,
    });
  },

  "compat.ramTooFast": (ctx) => {
    if (!ctx.ramSpeed || !ctx.ram) return null;
    const ceiling = memoryCeiling(ctx);
    if (ceiling == null || ctx.ramSpeed <= ceiling) return null;
    return finding("compat.ramTooFast", "warn", {
      ram: ctx.ram.model,
      speed: ctx.ramSpeed,
      limit: ceiling,
    });
  },

  "compat.m2Slots": (ctx) => {
    if (!ctx.mobo || ctx.m2 == null) return null;
    const nvme = ctx.drives.filter((d) => d.nvme).length;
    if (nvme <= ctx.m2) return null;
    return finding("compat.m2Slots", "warn", {
      board: ctx.mobo.model,
      drives: nvme,
      slots: ctx.m2,
    });
  },

  "compat.vrmEntry": (ctx) => {
    if (!ctx.chipset || !ctx.cpu) return null;
    if (!ENTRY_CHIPSETS.includes(ctx.chipset)) return null;
    // Graded on the CPU's own index, not its TDP: the problem is a high core
    // count drawing hard current on the board's small phases, which is what
    // makes an entry board throttle under a sustained all-core load.
    const bench = cpuBench(ctx.cpu.id);
    if (!bench || bench.multi < ENTRY_VRM_CPU_INDEX) return null;
    return finding("compat.vrmEntry", "warn", { cpu: ctx.cpu.model, chipset: ctx.chipset });
  },

  "compat.psuOverkill": (ctx) => {
    if (!ctx.psuWattage || !ctx.psu) return null;
    if (ctx.psuWattage < ctx.power.peak * PSU_OVERKILL_FACTOR) return null;
    if (ctx.psuWattage - ctx.power.peak < PSU_OVERKILL_ABS_W) return null;
    return finding("compat.psuOverkill", "info", {
      psu: ctx.psu.model,
      psuW: ctx.psuWattage,
      peak: ctx.power.peak,
      recommended: ctx.power.recommended,
    });
  },

  "compat.psuLowEfficiency": (ctx) => {
    if (!ctx.psu || ctx.power.load == null) return null;
    // A supply that cannot deliver is already blocked. Telling someone whose
    // 400 W unit is far too small that it is "inefficient" is noise on top of
    // a build that will not run.
    if (ctx.psuWattage == null || ctx.psuWattage < ctx.power.sustained) return null;
    if (ctx.power.load < EFFICIENCY_LOAD_FLOOR) return null;
    const rank = efficiencyRank(ctx.psuRating);
    if (rank == null || rank < BRONZE_RANK) return null;
    return finding("compat.psuLowEfficiency", "info", {
      rating: ctx.psuRating ?? "",
      psu: ctx.psu.model,
      load: Math.round(ctx.power.load * 100),
    });
  },

  "compat.biosUpdate": (ctx) => {
    const gap = biosGap(ctx);
    if (!gap || !ctx.mobo || !ctx.cpu) return null;
    return finding("compat.biosUpdate", "info", {
      cpu: ctx.cpu.model,
      board: ctx.mobo.model,
      chipset: ctx.chipset ?? "",
    });
  },

  "compat.gpuClearanceTight": (ctx) => {
    if (!ctx.gpuLength || !ctx.maxGpu) return null;
    if (ctx.gpuLength > ctx.maxGpu) return null;
    const pins = str(ctx.gpu, "pins") ?? "";
    const slackNeeded = /16/i.test(pins) ? GPU_CLEARANCE_SLACK_MM_16PIN : GPU_CLEARANCE_SLACK_MM;
    const slack = ctx.maxGpu - ctx.gpuLength;
    if (slack >= slackNeeded) return null;
    return finding("compat.gpuClearanceTight", "info", {
      gpu: ctx.gpu?.model ?? "",
      case: ctx.pcCase?.model ?? "",
      slack,
      needed: slackNeeded,
    });
  },
};

/** Declaration order, for deterministic output and for the test script. */
export const COMPAT_KEYS = Object.keys(COMPAT_RULES) as CompatKey[];

export const COMPAT_RULE_COUNT = COMPAT_KEYS.length;

export const SEVERITY_RANK: Record<CompatSeverity, number> = { block: 0, warn: 1, info: 2 };

/** `ok` means "nothing blocking"; `info` findings are not problems. */
export function isBlocking(findings: CompatFinding[]): boolean {
  return findings.some((f) => f.severity === "block");
}
