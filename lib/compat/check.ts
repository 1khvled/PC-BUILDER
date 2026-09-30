import { estimatedWattage } from "./watt";
import {
  COMPAT_RULES,
  COMPAT_RULE_COUNT,
  SEVERITY_RANK,
  buildContext,
  isBlocking,
  type Build,
  type CompatFinding,
  type CompatKey,
  type CompatSeverity,
} from "./rules";

export type {
  Build,
  CompatFinding,
  CompatKey,
  CompatSeverity,
} from "./rules";
export { COMPAT_KEYS, COMPAT_RULE_COUNT } from "./rules";

export interface CompatResult {
  /**
   * True when nothing blocks. `warn` and `info` findings do not clear it: a
   * build with four advice notes is still a build that turns on.
   */
  ok: boolean;
  /**
   * Structured findings, never display strings.
   *
   * These used to be English sentences assembled inside this module, which is
   * why the French builder rendered English warnings. Each finding is now a
   * stable dictionary key plus its `{placeholders}`; the caller translates it.
   */
  warnings: CompatFinding[];
  /** Steady-state draw plus transient headroom. What the UI shows as "W". */
  wattage: number;
  /** Steady-state DC draw: what the supply must deliver continuously. */
  sustained: number;
  /** Smallest sold PSU size that covers peak draw plus a margin. */
  recommended: number;
  /** How many findings of each severity, for a three-state banner. */
  counts: Record<CompatSeverity, number>;
  /** Rules that actually had the data to run. */
  rulesEvaluated: number;
}

/**
 * Runs every rule in `COMPAT_RULES` against the build.
 *
 * Nothing here knows what language the user reads, which is the point: the
 * module stays pure and the UI owns the wording. Findings come back sorted
 * blocks first so the worst news is the first thing on screen.
 */
export function checkCompat(build: Build): CompatResult {
  const ctx = buildContext(build);
  const warnings: CompatFinding[] = [];
  let evaluated = 0;

  for (const rule of Object.values(COMPAT_RULES)) {
    // A rule that throws on a partial build would take the whole card down;
    // a compatibility check must never be the reason the page is blank.
    const finding = rule(ctx);
    if (finding) warnings.push(finding);
    evaluated++;
  }

  warnings.sort((a, b) => SEVERITY_RANK[a.severity] - SEVERITY_RANK[b.severity]);

  const counts: Record<CompatSeverity, number> = { block: 0, warn: 0, info: 0 };
  for (const w of warnings) counts[w.severity]++;

  return {
    ok: !isBlocking(warnings),
    warnings,
    wattage: estimatedWattage(ctx.cpuTdp ?? 0, ctx.gpuTdp ?? 0),
    sustained: ctx.power.sustained,
    recommended: ctx.power.recommended,
    counts,
    rulesEvaluated: evaluated || COMPAT_RULE_COUNT,
  };
}

/**
 * Plain-text form of a finding, for the one payload that is not localised: the
 * /api/builds suggestion debug string. It prints the key rather than prose,
 * because the English sentences this replaces were the i18n bug in the first
 * place. Anything user-facing must go through the dictionary.
 */
export function formatCompatFinding(f: CompatFinding): string {
  const tag = f.severity === "block" ? "BLOCK" : f.severity === "warn" ? "WARN" : "INFO";
  return `${tag}: ${f.key}`;
}
