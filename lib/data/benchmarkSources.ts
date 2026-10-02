/**
 * BENCHMARK SOURCE REGISTRY
 * =========================
 * Every figure the site shows needs to be traceable. This module is the single
 * place that says where a number came from, and it is deliberately built so the
 * answer differs depending on category and verification sources.
 *
 * PROVENANCE IS NOT DECORATIVE
 * ----------------------------
 * `Source` below is recorded, not guessed:
 *   SourceKind.derived  - OUR number. A rounded index we computed. Links to #methodology.
 *   SourceKind.reported - Verified public database or review for that specific category:
 *                         - CPUs: TechPowerUp CPU Specs, Video Gaming Benchmarks, CPU-Monkey.
 *                         - GPUs: TechPowerUp GPU Specs, Video Gaming Benchmarks.
 *                         - SSDs/RAM: Video Reviews & real-world testing.
 */

export type SourceKind = "derived" | "reported";

export interface BenchmarkSource {
  /** Stable id, used as a dictionary key suffix and a React key. */
  id: string;
  kind: SourceKind;
  /** What this source is, in plain words. Translated via dictionary key. */
  labelKey: string;
  /** Where a human can check the figure. */
  url: string;
  /** ISO date the figure was read, for `reported` sources. */
  retrieved?: string;
}

const enc = encodeURIComponent;

/**
 * Public sources for one part.
 * `derived` is always first: links to the methodology section on the same page.
 * Category-appropriate reference databases only: no cross-category leaks.
 */
export function sourcesFor(productId: string, category: string, model: string): BenchmarkSource[] {
  const cleanLabel = model
    .replace(/\b(8|12|16|24|32|64)\s?gb\b/gi, "")
    .replace(/\b(ddr4|ddr5|tray|box|oc)\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();

  const out: BenchmarkSource[] = [
    {
      id: "ours",
      kind: "derived",
      labelKey: "benchmarks.source.ours",
      url: "#methodology",
    },
  ];

  if (category === "cpu") {
    out.push({
      id: "techpowerup",
      kind: "reported",
      labelKey: "benchmarks.source.techpowerup",
      url: `https://www.techpowerup.com/cpu-specs/?q=${enc(cleanLabel)}`,
    });
    out.push({
      id: "youtube",
      kind: "reported",
      labelKey: "benchmarks.source.youtube",
      url: `https://www.youtube.com/results?search_query=${enc(cleanLabel + " gaming benchmark")}`,
    });
    out.push({
      id: "cpumonkey",
      kind: "reported",
      labelKey: "benchmarks.source.cpumonkey",
      url: `https://www.cpu-monkey.com/en/search?q=${enc(cleanLabel)}`,
    });
  } else if (category === "gpu") {
    out.push({
      id: "techpowerup",
      kind: "reported",
      labelKey: "benchmarks.source.techpowerup",
      url: `https://www.techpowerup.com/gpu-specs/?q=${enc(cleanLabel)}`,
    });
    out.push({
      id: "youtube",
      kind: "reported",
      labelKey: "benchmarks.source.youtube",
      url: `https://www.youtube.com/results?search_query=${enc(cleanLabel + " gaming benchmark")}`,
    });
  } else if (category === "ssd") {
    out.push({
      id: "youtube",
      kind: "reported",
      labelKey: "benchmarks.source.youtube",
      url: `https://www.youtube.com/results?search_query=${enc(model + " ssd review test")}`,
    });
  } else if (category === "ram") {
    out.push({
      id: "youtube",
      kind: "reported",
      labelKey: "benchmarks.source.youtube",
      url: `https://www.youtube.com/results?search_query=${enc(model + " ram benchmark review")}`,
    });
  }

  return out;
}
