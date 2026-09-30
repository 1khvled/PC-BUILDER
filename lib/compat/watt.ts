/**
 * POWER MODEL.
 *
 * Three different numbers get confused in a builder, and conflating them is how
 * people end up with a 650 W supply that shuts off under load:
 *
 *   sustained   the steady DC draw of the parts. What the supply must be able
 *               to deliver continuously. Below this it simply cannot run.
 *   transient   the short spike a GPU makes when it changes load (and the
 *               modern 12V-2x6 connectors are rated for the peak, not the
 *               average). Grows with GPU draw, not with CPU draw.
 *   recommended sustained + transient, rounded up to a size that is actually
 *               sold. This is what the user should buy.
 *
 * The multipliers below are deliberately conservative. Under-sizing a supply
 * costs a dead machine; over-sizing costs money and a fan that never spins
 * down.
 */

/**
 * Motherboard, chipset, fans, drives and USB devices. Not a measurement -
 * the constant allowance every build carries.
 */
export const PLATFORM_OVERHEAD_W = 150;

/**
 * Transient allowance at zero GPU draw. Modern GPUs spike well above their
 * rated board power for a few milliseconds at load changes; this is the floor.
 */
export const BASE_TRANSIENT_W = 60;

/** Additional transient allowance per watt of GPU draw. */
export const TRANSIENT_PER_GPU_WATT = 0.15;

/** Safety margin over the sustained figure before rounding to a real size. */
export const HEADROOM_FACTOR = 1.15;

/** Sizes actually sold in Algeria, ascending. */
export const PSU_SIZES = [400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 1000, 1050, 1200, 1300, 1600];

/**
 * Steady-state DC load in watts. Unknown TDPs are treated as 0 because a
 * missing spec is not a small CPU - it is an unknown one, and the rules
 * downstream check for that separately.
 */
export function sustainedWattage(cpuTdp: number, gpuTdp: number): number {
  return Math.max(0, cpuTdp) + Math.max(0, gpuTdp) + PLATFORM_OVERHEAD_W;
}

/**
 * Short-lived peak a load change can produce. Scaled by GPU draw: a 450 W card
 * spikes far harder than a 65 W one, and a CPU spike is already covered by the
 * platform allowance.
 */
export function transientWattage(gpuTdp: number): number {
  return Math.ceil(BASE_TRANSIENT_W + Math.max(0, gpuTdp) * TRANSIENT_PER_GPU_WATT);
}

/** The wattage the supply really has to deliver right now. */
export function peakWattage(sustained: number, gpuTdp: number): number {
  return sustained + transientWattage(gpuTdp);
}

/**
 * The figure shown as "estimated power" and fed to `recommendedPsu`. Kept on
 * its original name and scale so the builder's existing display keeps meaning
 * exactly what it meant before.
 */
export function estimatedWattage(cpuTdp: number, gpuTdp: number): number {
  const sustained = sustainedWattage(cpuTdp, gpuTdp);
  return Math.ceil(peakWattage(sustained, gpuTdp) * HEADROOM_FACTOR / 10) * 10;
}

/**
 * Smallest sold size that covers the load. Overshooting the ceiling of the size
 * list returns the largest known size rather than an invented one.
 */
export function recommendedPsu(watt: number): number {
  if (!Number.isFinite(watt) || watt <= 0) return PSU_SIZES[0];
  return PSU_SIZES.find((s) => s >= watt) ?? PSU_SIZES[PSU_SIZES.length - 1];
}

/**
 * How much of a supply a build actually uses, as a 0..1 load figure. Used for
 * the efficiency advice: a Bronze unit at 60 % of its rating wastes noticeably
 * more energy than the label suggests.
 */
export function loadRatio(psuWattage: number, sustained: number): number | null {
  if (!psuWattage || psuWattage <= 0) return null;
  return sustained / psuWattage;
}
