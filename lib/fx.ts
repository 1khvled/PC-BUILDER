/**
 * Parallel-market USD rate, in DA per USD.
 *
 * Shop prices on this site are all in dinars, but half the Algerian market
 * still talks in dollars - Ouedkniss listings, Facebook sellers, importers
 * quoting "prix caba". The converter exists so a buyer can sanity-check a
 * dollar quote against the DA prices on this site in one step.
 *
 * The rate moves, so it is editable and persisted per visitor. 240 is the
 * default the site ships with, not a promise.
 */
export const DEFAULT_USD_DA = 240;

export function usdToDa(usd: number, rate: number): number {
  if (!Number.isFinite(usd) || !Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round(usd * rate);
}

export function daToUsd(da: number, rate: number): number {
  if (!Number.isFinite(da) || !Number.isFinite(rate) || rate <= 0) return 0;
  return Math.round((da / rate) * 100) / 100;
}
