/**
 * PLATFORM FACTS.
 *
 * Small, hand-checked tables about sockets, chipsets and memory controllers.
 * These are not performance numbers - they are published platform facts (what
 * DDR generation a socket takes, how far a memory controller goes before you
 * leave its comfort zone, which chipsets shipped before a CPU generation
 * existed). Every rule that needs one reads it from here so the fact is stated
 * exactly once.
 *
 * Anything unknown is `null` and produces no warning.
 */

export interface MemoryPlatform {
  /** DDR generation this socket normally uses. */
  type: "DDR3" | "DDR4" | "DDR5";
  /** MT/s we call the comfortable target for this platform. */
  sweet: number;
  /**
   * MT/s above which the memory controller is out of its comfort zone. Above
   * this, kits either run below their rated speed or need manual tuning.
   */
  hardMax: number;
}

/**
 * Keyed by socket. LGA1700 covers both DDR4 and DDR5 boards, so the RAM
 * generation is resolved from the motherboard's own `ram_type` first and this
 * table only supplies the speed envelope.
 */
export const MEMORY_PLATFORM: Record<string, MemoryPlatform> = {
  AM4: { type: "DDR4", sweet: 3200, hardMax: 4000 },
  AM5: { type: "DDR5", sweet: 6000, hardMax: 6200 },
  LGA1700: { type: "DDR5", sweet: 6000, hardMax: 7200 },
  LGA1200: { type: "DDR4", sweet: 3200, hardMax: 4000 },
  LGA1851: { type: "DDR5", sweet: 6400, hardMax: 8000 },
  // Pre-2021 platforms: only here so an old board + old CPU still resolves.
  LGA1151: { type: "DDR4", sweet: 3200, hardMax: 3600 },
  LGA1150: { type: "DDR3", sweet: 1600, hardMax: 2400 },
  LGA1155: { type: "DDR3", sweet: 1600, hardMax: 2400 },
  LGA775: { type: "DDR3", sweet: 1333, hardMax: 2400 },
  LGA1366: { type: "DDR3", sweet: 1600, hardMax: 2400 },
};

/** DDR5-6400 and above are fine on the X3D chips, which have more headroom. */
export const AM5_X3D_HARD_MAX = 6600;

/** 80 PLUS tiers we know about, best first. Used for the efficiency advice. */
export const EFFICIENCY_TIERS = ["Platinum", "Titanium", "Gold", "Silver", "Bronze", "White", "Standard"] as const;

/**
 * Chipsets with a small VRM. Fine for a 6-core part, not fine for a 16-core
 * one: the CPU throttles under a sustained all-core load long before it is
 * thermally limited.
 */
export const ENTRY_CHIPSETS = ["H410", "H510", "H610", "H810", "A320"];

/** Multi-threaded index at or above which an entry VRM becomes the problem. */
export const ENTRY_VRM_CPU_INDEX = 150;

export interface BiosRequirement {
  socket: string;
  /** Intel 5-digit model prefix, e.g. 14 for a 14th-gen "i7-14700K". */
  intelGen?: number;
  /** AMD Ryzen series digit, e.g. 9 for the 9000 series. */
  amdSeries?: number;
  /** Chipsets that shipped before this generation existed. */
  chipsets: string[];
}

/**
 * Boards that generally need a BIOS update before they boot a given CPU.
 *
 * This is never a block: the flash is free at the manufacturer, and the CPU is
 * already in the box. It is flagged because "it POSTs nothing and the seller
 * says it is dead" is the most expensive surprise in the whole builder.
 *
 * All three conditions must hold - same socket, one of the chipsets that
 * shipped before that generation, and a CPU of that generation. Dropping the
 * chipset test turns an info note into a lie ("your brand new B850 board needs
 * a BIOS update"), which is exactly the kind of warning people learn to
 * ignore. `scripts/check-perf.cjs` asserts that negative case.
 */
export const BIOS_REQUIREMENTS: BiosRequirement[] = [
  // 11th gen arrived in 2021, on 500-series boards.
  { socket: "LGA1200", intelGen: 11, chipsets: ["H410", "B460", "H470", "H510", "Z490"] },
  // 13th and 14th gen arrived after the entry LGA1700 boards.
  { socket: "LGA1700", intelGen: 13, chipsets: ["H610", "B660"] },
  { socket: "LGA1700", intelGen: 14, chipsets: ["H610", "B660"] },
  // Zen 3 (5000 series) on 2020 AMD boards.
  { socket: "AM4", amdSeries: 5, chipsets: ["B450", "A520"] },
  // Zen 5 (9000 series) on 2023 AM5 boards.
  { socket: "AM5", amdSeries: 9, chipsets: ["B650", "B650E"] },
];

/** 80 PLUS rating as it appears in our specs, normalised to upper case. */
export function normaliseRating(rating: string | null): string | null {
  if (!rating) return null;
  const t = rating.trim();
  if (!t) return null;
  const upper = t.toUpperCase();
  const hit = EFFICIENCY_TIERS.find((x) => upper.startsWith(x.toUpperCase()));
  return hit ?? t;
}

/** Lower is better. Returns null for an unknown rating. */
export function efficiencyRank(rating: string | null): number | null {
  const n = normaliseRating(rating);
  if (!n) return null;
  const idx = EFFICIENCY_TIERS.indexOf(n as (typeof EFFICIENCY_TIERS)[number]);
  return idx === -1 ? null : idx;
}

/** Intel generation from a model such as "Core i7-14700KF" -> 14. */
export function intelGeneration(model: string | null): number | null {
  if (!model) return null;
  const m = /\d{5}/.exec(model);
  if (!m) return null;
  const prefix = m[0].slice(0, 2);
  const gen = Number(prefix);
  // Only 10th gen and later use 5-digit model numbers.
  return gen >= 10 && gen <= 20 ? gen : null;
}

/**
 * Ryzen series from a model such as "Ryzen 9 9950X3D" -> 9.
 *
 * The trailing `(?!\d)` rather than `\b` matters: a suffix like the X3D, X, G
 * or GT letters is a word character, so `\b` after the digits never matches
 * and every suffixed Ryzen - which is to say every one worth warning about -
 * would parse as unknown.
 */
export function amdSeries(model: string | null): number | null {
  if (!model) return null;
  const m = /\b(\d{4})(?!\d)/.exec(model);
  if (!m) return null;
  const series = Number(m[1][0]);
  return series >= 2 && series <= 9 ? series : null;
}

/** True for the X3D parts, whose memory controller is rated for more speed. */
export function isX3dModel(model: string | null): boolean {
  return !!model && /x3d/i.test(model);
}

/** The chipset string as written in the motherboard specs. */
export function chipsetOf(chipset: string | null): string | null {
  if (!chipset) return null;
  const t = chipset.trim().toUpperCase().replace(/\s+/g, "");
  return t.length ? t : null;
}
