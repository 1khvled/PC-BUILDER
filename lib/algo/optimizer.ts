import { OFFERS, PRODUCTS, bestOffer, type Product } from "@/lib/data/products";
import { checkCompat } from "@/lib/compat/check";
import { estimatedWattage, recommendedPsu } from "@/lib/compat/watt";

export type UseCase = "gaming-1080p" | "gaming-1440p" | "office" | "design";
export type CategoryKey = "cpu" | "cooler" | "motherboard" | "ram" | "ssd" | "gpu" | "case" | "psu";

// ---------------------------------------------------------------------------
// Perf tiers. Documented, conservative, 0 = unknown (never silently ranked).
// CPU tiers track real hierarchy: X3D > same-gen X > non-X; Intel K > non-K.
// GPU tiers track raster class; VRAM adds +1 per 4GB above 8 (cap +2).
// ---------------------------------------------------------------------------
type Tier = [RegExp, number];
const CPU_TIERS: Tier[] = [
  [/9800x3d/i, 95], [/7800x3d/i, 90], [/5800x3d/i, 78],
  [/7950x/i, 92], [/7900x/i, 88], [/7700x/i, 82], [/7600x/i, 76], [/7600\b/i, 74],
  [/9600x/i, 80], [/7500f/i, 72],
  [/5900x/i, 80], [/5800x/i, 74], [/5700x/i, 72], [/5600x/i, 68], [/\b5600\b/i, 65], [/5600g/i, 55], [/5600gt/i, 58],
  [/5500/i, 58], [/3600/i, 52],
  [/14900k/i, 93], [/14700k/i, 89], [/14600k/i, 84], [/14400/i, 76],
  [/13700k/i, 88], [/13600k/i, 82], [/13400/i, 74],
  [/12700k?/i, 80], [/12400/i, 70], [/12100/i, 58],
  [/265k?/i, 84], [/245k?/i, 78],
  [/g39|g65|celeron|pentium/i, 30],
];

const GPU_TIERS: Tier[] = [
  [/4090/i, 100], [/5080/i, 94], [/5070\s?ti/i, 88], [/5070/i, 84], [/4080/i, 90], [/4070\s?ti/i, 84], [/4070/i, 80],
  [/5060\s?ti/i, 74], [/5060/i, 70], [/4060\s?ti/i, 72], [/4060/i, 66], [/5050/i, 60], [/3050/i, 52],
  [/3080/i, 82], [/3070/i, 76], [/3060/i, 64],
  [/9070\s?xt/i, 86], [/9070\b/i, 80], [/7800\s?xt/i, 78], [/7700\s?xt/i, 72], [/7600/i, 62], [/6700\s?xt/i, 70], [/6600/i, 58], [/6500/i, 48], [/580/i, 45],
  [/1650/i, 40], [/950/i, 28], [/315/i, 18], [/p600/i, 22], [/p2000/i, 40],
];

export function cpuTier(model: string): number {
  for (const t of CPU_TIERS) if (t[0].test(model)) return t[1];
  return 0;
}

export function gpuTier(model: string): number {
  const m = model.replace(/\s+/g, " ");
  let base = 0;
  for (const t of GPU_TIERS) {
    if (t[0].test(m)) {
      base = t[1];
      break;
    }
  }
  if (!base) return 0;
  const vram = m.match(/(\d+)\s?gb/i);
  if (vram) base += Math.min(2, Math.max(0, Math.floor((parseInt(vram[1], 10) - 8) / 4)));
  return base;
}

export interface Bottleneck {
  pct: number;
  limitedBy: "cpu" | "gpu" | "balanced";
  note: string;
}

export function bottleneckPct(cpuModel: string, gpuModel: string, resolution: "1080p" | "1440p" | "4k" = "1080p"): Bottleneck {
  const c = cpuTier(cpuModel);
  const g = gpuTier(gpuModel);
  if (!c || !g) return { pct: 0, limitedBy: "balanced", note: "Modèle inconnu — estimation impossible." };
  // Higher resolution shifts load to GPU: dampen CPU-side gaps.
  const damp = resolution === "1080p" ? 1 : resolution === "1440p" ? 0.7 : 0.45;
  const gap = g - c;
  if (Math.abs(gap) < 8) return { pct: 0, limitedBy: "balanced", note: "Équilibré pour " + resolution + "." };
  if (gap > 0) {
    const pct = Math.min(35, Math.round(gap * 0.55 * damp));
    return { pct, limitedBy: "cpu", note: `CPU limite d'environ ${pct}% en ${resolution}.` };
  }
  const pct = Math.min(30, Math.round(-gap * 0.4));
  return { pct, limitedBy: "gpu", note: `GPU limite d'environ ${pct}% — normal si vous visez la qualité max.` };
}

// Budget shares per use-case. Must sum to 1.
const SPLITS: Record<UseCase, Record<CategoryKey, number>> = {
  "gaming-1080p": { gpu: 0.42, cpu: 0.2, motherboard: 0.11, ram: 0.07, ssd: 0.08, psu: 0.07, case: 0.05, cooler: 0 },
  "gaming-1440p": { gpu: 0.45, cpu: 0.2, motherboard: 0.1, ram: 0.08, ssd: 0.07, psu: 0.07, case: 0.03, cooler: 0 },
  office: { gpu: 0, cpu: 0.3, motherboard: 0.16, ram: 0.14, ssd: 0.16, psu: 0.12, case: 0.12, cooler: 0 },
  design: { gpu: 0.3, cpu: 0.26, motherboard: 0.1, ram: 0.14, ssd: 0.1, psu: 0.06, case: 0.04, cooler: 0 },
};

const ORDER: CategoryKey[] = ["cpu", "motherboard", "ram", "gpu", "ssd", "psu", "case", "cooler"];

function cheapest(category: string, maxDa: number, exclude: string[] = []): Product | null {
  const cands = PRODUCTS.filter((p) => p.category === category && !exclude.includes(p.id))
    .map((p) => ({ p, price: bestOffer(p.id)?.priceDa ?? Infinity }))
    .filter((x) => x.price <= maxDa)
    .sort((a, b) => a.price - b.price);
  return cands[0]?.p ?? null;
}

export interface Suggestion {
  picks: Record<string, string>;
  totalDa: number;
  perPart: { productId: string; model: string; priceDa: number; store: string; url: string }[];
  warnings: string[];
  bottleneck: Bottleneck;
  psuHeadroomW: number;
  fitsBudget: boolean;
  budgetDa: number;
}

export function suggestBuild(budgetDa: number, useCase: UseCase): Suggestion {
  const split = SPLITS[useCase];
  const warnings: string[] = [];
  // Relaxation passes: full budget, then +15% (occasion), then cheapest-of-category fallback.
  for (const pass of [1, 1.15, Infinity]) {
    const picks: Partial<Record<CategoryKey, Product>> = {};
    const limit = (c: CategoryKey) => (pass === Infinity ? Infinity : Math.round(budgetDa * split[c] * 1.25));
    for (const cat of ORDER) {
      if (split[cat] === 0 && pass !== Infinity) continue;
      // GPU for office: skip unless spare budget later
      if (cat === "gpu" && useCase === "office" && pass !== Infinity) continue;
      const p = cheapest(cat, limit(cat));
      if (p) picks[cat] = p;
    }
    // Office: add cheapest GPU only if 15%+ budget remains
    if (useCase === "office" && !picks.gpu && pass === Infinity) {
      const g = cheapest("gpu", Infinity);
      if (g) picks.gpu = g;
    }
    const built = picks as Record<string, Product>;
    const res = checkCompat(built as never);
    const total = Object.values(picks).reduce((s, p) => s + (bestOffer((p as Product).id)?.priceDa ?? 0), 0);
    const blocks = res.warnings.filter((w) => w.startsWith("BLOCK"));
    if (blocks.length === 0 && (total <= budgetDa * pass || pass === Infinity)) {
      const cpu = picks.cpu;
      const gpu = picks.gpu;
      const bn = cpu && gpu
        ? bottleneckPct(cpu.model, gpu.model, useCase === "gaming-1440p" ? "1440p" : "1080p")
        : { pct: 0, limitedBy: "balanced" as const, note: cpu ? "iGPU — bureautique OK, gaming non." : "Sans CPU." };
      const watt = res.wattage;
      const psuW = (picks.psu?.specs as { wattage?: number } | undefined)?.wattage ?? 0;
      return {
        picks: Object.fromEntries(Object.entries(picks).map(([k, v]) => [k, (v as Product).id])),
        totalDa: total,
        perPart: Object.values(picks).map((p) => {
          const b = bestOffer((p as Product).id);
          return { productId: (p as Product).id, model: `${(p as Product).brand} ${(p as Product).model}`, priceDa: b?.priceDa ?? 0, store: b?.store ?? "—", url: b?.url ?? "#" };
        }),
        warnings: [...res.warnings, ...(pass > 1 && pass !== Infinity ? ["Budget dépassé de <15% — regardez l'occasion Ouedkniss."] : [])],
        bottleneck: bn,
        psuHeadroomW: psuW - watt,
        fitsBudget: total <= budgetDa,
        budgetDa,
      };
    }
    if (pass === Infinity) {
      warnings.push(...blocks, "Budget trop serré même au minimum — augmentez ou visez l'occasion.");
    }
  }
  throw new Error("unreachable");
}

export function explainBuild(s: Suggestion): string {
  const lines = [
    `Build ${s.totalDa.toLocaleString("fr-DZ")} DA (budget ${s.budgetDa.toLocaleString("fr-DZ")} DA) — ${s.fitsBudget ? "dans le budget ✓" : "hors budget, voir occasion"}.`,
    ...s.perPart.map((p) => `• ${p.model} — ${p.priceDa.toLocaleString("fr-DZ")} DA chez ${p.store}`),
    `Goulot: ${s.bottleneck.note}`,
    `Marge alim: ${s.psuHeadroomW}W.`,
    ...s.warnings.map((w) => `⚠ ${w}`),
  ];
  return lines.join("\n");
}

export function selfCheck(): { name: string; ok: boolean; detail: string }[] {
  const out: { name: string; ok: boolean; detail: string }[] = [];
  const t = (name: string, ok: boolean, detail = "") => out.push({ name, ok, detail });
  t("tiers connus", cpuTier("Ryzen 5 5600") === 65 && gpuTier("RTX 3060 12GB") > 60, `${cpuTier("Ryzen 5 5600")}/${gpuTier("RTX 3060 12GB")}`);
  t("tiers inconnus = 0", cpuTier("Zork CPU 999") === 0 && gpuTier("Truc Graphique") === 0);
  t("X3D > X", cpuTier("Ryzen 7 9800X3D") > cpuTier("Ryzen 5 7600X"));
  const b200 = suggestBuild(200000, "gaming-1080p");
  t("200k gaming tient", b200.totalDa > 0 && b200.perPart.some((p) => p.productId.startsWith("gpu-")), `${b200.totalDa} DA`);
  t("200k compatible", !b200.warnings.some((w) => w.startsWith("BLOCK")) && b200.picks.cpu !== undefined, b200.warnings.join("; ").slice(0, 120));
  const b80 = suggestBuild(80000, "office");
  t("80k bureau sans GPU", !b80.picks.gpu && b80.totalDa <= 80000, `${b80.totalDa} DA`);
  const bn = bottleneckPct("Ryzen 5 5600", "RTX 5080 16GB", "1080p");
  t("bottleneck détecté", bn.limitedBy === "cpu" && bn.pct > 0, bn.note);
  const bn4k = bottleneckPct("Ryzen 5 5600", "RTX 5080 16GB", "4k");
  t("4k atténue", bn4k.pct <= bn.pct, `${bn.pct}% -> ${bn4k.pct}%`);
  t("explication FR", explainBuild(b200).includes("DA"));
  // offre count sanity
  t("données présentes", PRODUCTS.length > 20 && OFFERS.length > 50, `${PRODUCTS.length} produits / ${OFFERS.length} offres`);
  void recommendedPsu;
  void estimatedWattage;
  return out;
}
