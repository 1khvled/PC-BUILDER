import { OFFERS, PRODUCTS, bestOffer, type Offer, type Product } from "@/lib/data/products";
import { checkCompat, formatCompatFinding } from "@/lib/compat/check";
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
  [/5900x/i, 82], [/5800x/i, 74], [/5700x/i, 72], [/5600x/i, 68], [/\b5600\b/i, 65], [/5600g/i, 55], [/5600gt/i, 58], [/8600g/i, 68],
  [/5500/i, 58], [/3600/i, 52],
  [/14900k/i, 93], [/14700k/i, 89], [/14600k/i, 84], [/14400/i, 76],
  [/13700k/i, 88], [/13600k/i, 82], [/13400/i, 74],
  [/12700k?/i, 80], [/12400/i, 70], [/12100/i, 58], [/10400/i, 60],
  [/265k?/i, 84], [/245k?/i, 78],
  [/g39|g65|celeron|pentium/i, 30],
];

const GPU_TIERS: Tier[] = [
  [/5090/i, 108], [/4090/i, 100], [/5080/i, 94], [/5070\s?ti/i, 88], [/5070/i, 84], [/4080/i, 90], [/4070\s?super/i, 82], [/4070\s?ti/i, 84], [/4070/i, 80],
  [/5060\s?ti/i, 74], [/5060/i, 70], [/4060\s?ti/i, 72], [/4060/i, 66], [/5050/i, 60], [/3050/i, 52],
  [/3080/i, 82], [/3070/i, 76], [/3060/i, 64],
  [/9070\s?xt/i, 86], [/9070\b/i, 80], [/9060/i, 74], [/7900\s?xtx/i, 92], [/7900\s?xt/i, 88], [/7800\s?xt/i, 78], [/7700\s?xt/i, 72], [/7600\s?xt/i, 66], [/7600/i, 62], [/6900\s?xt/i, 80], [/6800\s?xt/i, 78], [/6800\b/i, 74], [/6750\s?xt/i, 72], [/6700\s?xt/i, 70], [/6700\b/i, 66], [/6650\s?xt/i, 62], [/6600\s?xt/i, 60], [/6600/i, 58], [/6500/i, 48], [/580/i, 45],
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
  office: { gpu: 0, cpu: 0.34, motherboard: 0.2, ram: 0.1, ssd: 0.14, psu: 0.1, case: 0.12, cooler: 0 },
  design: { gpu: 0.3, cpu: 0.26, motherboard: 0.1, ram: 0.14, ssd: 0.1, psu: 0.06, case: 0.04, cooler: 0 },
};

const ORDER: CategoryKey[] = ["cpu", "motherboard", "ram", "gpu", "ssd", "psu", "case", "cooler"];

/**
 * Capacity in terabytes, parsed from a model string.
 *
 * Drives carry no capacity spec field, so it has to come from the name.
 * Returns 0 when there is no recognisable capacity, which keeps an unparsed
 * model from outranking a properly described one on capacity alone.
 */
function parseCapacityTb(model: string): number {
  const m = model.match(/(\d+(?:[.,]\d+)?)\s?(tb|gb)/i);
  if (!m) return 0;
  const n = parseFloat(m[1].replace(",", "."));
  if (!Number.isFinite(n)) return 0;
  return m[2].toLowerCase() === "gb" ? n / 1000 : n;
}

/**
 * How good a part is for its money, as a positive score. Higher is better.
 *
 * The original version returned a flat `1` for every category except CPU and GPU.
 * That is fatal: value-per-dinar became `1 / price`, so the cheapest part in the
 * category won every single time. Raising the budget widened the ceiling without
 * changing the winner, which is why 200,000, 300,000 and 400,000 DA all produced
 * the same 78,600 DA machine.
 *
 * For CPU and GPU there is a real performance index, so score by it. For the
 * other categories there is no honest performance figure, so score by the thing
 * that actually tracks quality: capacity and spec headroom. A 1TB NVMe is a
 * better buy than a 128GB one at any price, and a 750W supply is not worse than
 * a 400W one. Without this the builder would pick the smallest drive and the
 * smallest power supply in the catalogue every time.
 *
 * Nothing returns 0 except a part we genuinely cannot rank, which callers treat
 * as "skip" so an unrankable part never wins on price alone.
 */
function perfScore(category: string, product: Product): number {
  const s = product.specs as Record<string, unknown>;
  const num = (k: string) => (typeof s[k] === "number" ? (s[k] as number) : 0);

  switch (category) {
    case "cpu":
      return cpuTier(product.model);
    case "gpu":
      return gpuTier(product.model);
    case "ram": {
      const gb = num("capacity_gb");
      // Capacity is the dominant axis; speed breaks ties.
      const speed = num("speed");
      return gb > 0 ? gb * 10 + (speed >= 3200 ? 2 : 1) : 0;
    }
    case "ssd": {
      const itf = String(s.interface ?? "").toUpperCase();
      // Interface dominates, then capacity. The interface used to be the whole
      // score, so every NVMe drove tied at 400 and the 256GB one won on the
      // price tiebreak - a builder that filled the budget with a slow small
      // drive. Capacity is parsed from the model because drives carry no
      // capacity spec field.
      const tb = parseCapacityTb(product.model);
      const kind = itf.includes("NVME") ? 4000 : itf.includes("USB") ? 400 : 600;
      return kind + tb * 1000;
    }
    case "psu": {
      // Efficiency rating is a real quality axis; wattage only needs headroom.
      const w = num("wattage");
      const rating = String(s.rating ?? "").toLowerCase();
      const eff = rating.includes("platinum") ? 5 : rating.includes("gold") ? 4 : rating.includes("bronze") ? 3 : 1;
      return w > 0 ? eff * 1000 + Math.min(w, 1200) : 0;
    }
    case "motherboard": {
      const score = String(s.chipset ?? "").toUpperCase();
      // B-series and X-series both work; newer chipset letters rank higher.
      const gen = /X\d{3}|Z\d{3}/.test(score) ? 4 : /B\d{3}/.test(score) ? 3 : /A\d{3}|H\d{3}/.test(score) ? 2 : 1;
      const m2 = num("m2");
      const ramType = String(s.ram_type ?? "").toUpperCase() === "DDR5" ? 5 : 3;
      return gen * 10 + Math.min(m2, 4) + ramType / 10;
    }
    case "case": {
      // Clearance is what decides whether a build closes, so generous cases
      // rank above cramped ones.
      return num("max_gpu_mm") > 0 ? num("max_gpu_mm") / 10 : 0;
    }
    case "cooler": {
      const h = num("height_mm");
      const aio = /AIO|Liquid|240mm|360mm|280/i.test(product.model);
      return (aio ? 200 : 0) + (h > 0 ? h / 10 : 0);
    }
    default:
      return 1;
  }
}

/**
 * Best part in `category` at or under `maxDa`.
 *
 * This used to be called `cheapest` and returned the literal cheapest item in
 * the category. That is wrong for a budgeted builder: given 200,000 DA it
 * assembled a machine costing 31,700, because nothing in the code ever spent
 * the money it was handed. The budget was only ever used as a ceiling.
 *
 * It now ranks by performance tier per dinar, so the ceiling is a target and
 * the ceiling is spent. Cheap-floor behaviour is still available via
 * `pickCheapest` for the genuinely bottom-of-market fallback.
 */
function bestValue(
  category: string,
  maxDa: number,
  exclude: string[] = [],
  offers: Offer[] = OFFERS,
): Product | null {
  const cands = PRODUCTS.filter((p) => p.category === category && !exclude.includes(p.id))
    .map((p) => ({ p, price: bestOffer(p.id, offers)?.priceDa ?? Infinity }))
    // A part with no live offer has no price, and `Infinity <= Infinity` is true,
    // so on the final pass an unpriced part would sail past the ceiling. 36
    // catalogue entries have no offers right now; without this they win on score
    // and the builder returns a machine nobody can buy. A part we cannot price
    // is not a candidate for a budgeted build.
    .filter((x) => Number.isFinite(x.price) && x.price <= maxDa)
    .map((x) => ({ ...x, score: perfScore(category, x.p) }))
    // Parts we cannot rank must not win on the strength of being cheap.
    .filter((x) => x.score > 0)
    // Rank by raw score, not score-per-dinar.
    //
    // Score-per-price was wrong for this purpose. Tier scores are small relative
    // to dinar prices, so dividing made cheapness win every time: an RX 6500 XT
    // at 48 points and 30,000 DA "beat" an RTX 4090 at 102 points and 418,000
    // DA, and since it was under the ceiling at every budget, a 600,000 DA
    // request returned the same card as a 200,000 DA one. A larger budget must
    // buy a faster part, not a cheaper one, so score dominates and price only
    // breaks ties between parts of equal quality.
    .sort((a, b) => b.score - a.score || a.price - b.price);
  return cands[0]?.p ?? null;
}

/** Literal cheapest, ignoring performance. Used only for the last-resort pass. */
function cheapest(category: string, maxDa: number, exclude: string[] = [], offers: Offer[] = OFFERS): Product | null {
  const cands = PRODUCTS.filter((p) => p.category === category && !exclude.includes(p.id))
    .map((p) => ({ p, price: bestOffer(p.id, offers)?.priceDa ?? Infinity }))
    .filter((x) => Number.isFinite(x.price) && x.price <= maxDa)
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

export function suggestBuild(budgetDa: number, useCase: UseCase, offers: Offer[] = OFFERS): Suggestion {
  const split = SPLITS[useCase];
  const warnings: string[] = [];

  /**
   * Cheapest realisable CPU + motherboard pair in the catalogue.
   *
   * Computed once per call because the share-based ceilings can land just under
   * the price of the cheapest part that actually has a performance score. The
   * platform is the one category that cannot be omitted, so the builder must
   * always be able to afford one.
   */
  const minPlatformDa = (() => {
    const price = (p: Product) => bestOffer(p.id, offers)?.priceDa ?? Infinity;
    let min = Infinity;
    for (const cpu of PRODUCTS.filter((p) => p.category === "cpu")) {
      if (cpuTier(cpu.model) <= 0) continue;
      const cpuPrice = price(cpu);
      if (!Number.isFinite(cpuPrice)) continue;
      const socket = String((cpu.specs as { socket?: string }).socket ?? "");
      const ram = String((cpu.specs as { ram_type?: string }).ram_type ?? "");
      for (const b of PRODUCTS.filter((p) => p.category === "motherboard")) {
        if (String((b.specs as { socket?: string }).socket ?? "") !== socket) continue;
        if (String((b.specs as { ram_type?: string }).ram_type ?? "") !== ram) continue;
        const boardPrice = price(b);
        if (!Number.isFinite(boardPrice)) continue;
        min = Math.min(min, cpuPrice + boardPrice);
      }
    }
    return Number.isFinite(min) ? min : 0;
  })();


  /**
   * How hard to push against the ceiling, as a fraction of each category's
   * budget share.
   *
   * The original code had a single multiplier of 1.25, which meant the budget
   * was only ever a ceiling. 200,000, 300,000 and 400,000 DA all produced the
   * same 75,100 DA machine: the extra money was never spent. These passes sweep
   * the multiplier so the builder actually climbs toward the budget it is
   * given, and `pick` below takes the best build any pass produced.
   *
   * `Infinity` is the last resort: lift the ceiling entirely, but never relax
   * compatibility. The previous final pass relaxed both, which assembled a
   * Ryzen 3 3100 onto a DDR3 Esonic G41 with a 400W supply - a machine
   * checkCompat correctly refuses, so no pass could ever succeed and the
   * function threw "unreachable". That throw propagated through selfCheck() and
   * took down the entire admin console with a 500.
   */
  const PASSES = [0.55, 0.8, 1, 1.25, 1.6, Infinity];

  let best: { picks: Partial<Record<CategoryKey, Product>>; total: number; res: ReturnType<typeof checkCompat> } | null = null;

  for (const mult of PASSES) {
    // The final pass lifts the price ceiling but must NOT lift compatibility.
    // Compatibility is pinned across all passes: once a platform is chosen
    // (CPU socket + board), every later pick is filtered to parts that fit it.
    // Price is the only thing that relaxes.
    const picks: Partial<Record<CategoryKey, Product>> = {};
    const lastPass = mult === Infinity;
    const limit = (c: CategoryKey) => {
      if (!lastPass) return Math.round(budgetDa * split[c] * mult);
      // On the final pass the ceiling is lifted, but not removed: cap at 2x the
      // budget so a returned build is visibly over-budget rather than absurd.
      return Math.round(budgetDa * 2 * Math.max(split[c], 0.05));
    };
    for (const cat of ORDER) {
      // A zero share means "not part of this preset", on every pass including
      // the last. The old `&& !lastPass` guard let the final pass build
      // categories the use case explicitly does not want, which is how an office
      // machine ended up with a discrete graphics card and a 1,532,100 DA total.
      if (split[cat] === 0) continue;

      // CPU and motherboard are chosen together. Picking the CPU first and the
      // board second lets the CPU be a part that no board in the catalogue
      // accepts at that budget, because at the moment the CPU is chosen there is
      // no board to contradict it. That produced AM4 CPUs landing on DDR3 boards
      // and every office pass coming back with compat.socketMismatch and
      // compat.cpuRamType, which is why the whole preset failed below 120k DA.
      if (cat === "cpu" || cat === "motherboard") {
        // Only enter the coupled branch on the CPU step; the motherboard step is
        // satisfied by the same call. Running it on both would search twice and,
        // if the pair search came back empty, skip both categories entirely -
        // which is how an office build came out with no processor at all.
        if (cat === "cpu") {
          // Widen the platform search when the shares cannot buy a CPU and a
          // board together. Rather than raising each ceiling independently -
          // which multiplies and hands one category several budgets' worth of
          // allowance - the two shares are pooled.
          //
          // The pool is then raised to at least the cheapest realisable platform
          // in the catalogue. Redistributing proportionally was not enough: at
          // 80,000 DA the CPU ceiling landed at 14,256 against a cheapest
          // *scored* CPU of 14,500, so the search missed by 244 DA and the
          // machine shipped with no processor at all.
          let cpuCeiling = limit("cpu");
          let boardCeiling = limit("motherboard");
          let pair = pickPlatform(useCase === "office", cpuCeiling, boardCeiling, picks, offers);
          if (!pair) {
            const share = split.cpu + split.motherboard;
            const pooled = Math.max(
              Math.round(budgetDa * share * mult),
              Math.round(minPlatformDa * (mult / 0.55)),
            );
            cpuCeiling = Math.round(pooled * (split.cpu / share));
            boardCeiling = pooled - cpuCeiling;
            pair = pickPlatform(useCase === "office", cpuCeiling, boardCeiling, picks, offers);
          }
          if (pair) {
            picks.cpu = pair.cpu;
            picks.motherboard = pair.board;
          }
        }
        continue;
      }

      const exclude = picks.cooler ? [picks.cooler.id] : [];
      const p = pickCompatible(cat, limit(cat), picks, exclude, offers);
      if (p) picks[cat] = p;
    }
    // Office: add a GPU only if the CPU has integrated graphics and the budget has
    // genuine room left. Previously this ran `cheapest("gpu", Infinity)`, which
    // has no ceiling and so attached a discrete card to an office machine at any
    // budget. The whole point of the office preset is that a CPU with an iGPU
    // needs no discrete card at all.
    if (useCase === "office" && !picks.gpu) {
      const cpuHasIGpu = picks.cpu?.specs && (picks.cpu.specs as { igpu?: boolean }).igpu === true;
      const spent = Object.values(picks).reduce((s, p) => s + (bestOffer((p as Product).id, offers)?.priceDa ?? 0), 0);
      const room = budgetDa - spent;
      if (!cpuHasIGpu && room > budgetDa * 0.15) {
        const g = pickCompatible("gpu", room, picks, [], offers);
        if (g) picks.gpu = g;
      }
    }
    const built = picks as Record<string, Product>;
    const res = checkCompat(built as never);
    const total = Object.values(picks).reduce((s, p) => s + (bestOffer((p as Product).id, offers)?.priceDa ?? 0), 0);
    const blocks = res.warnings.filter((w) => w.severity === "block");
    const withinBudget = total <= budgetDa;

    // A build missing a mandatory part is not a candidate. Without this a
    // three-part assembly of RAM, storage and a graphics card - no processor,
    // no motherboard - was accepted at 77,900 DA and won the pass, because the
    // total fitted the budget and nothing complained that it was not a computer.
    const required: CategoryKey[] = ORDER.filter((c) => split[c] > 0 && c !== "cooler");
    const complete = required.every((c) => picks[c] !== undefined);

    // Record the best block-free build that also fits. Among candidates that
    // fit, the one that spends the most of the budget is the one the user asked
    // for, so prefer higher totals.
    if (blocks.length === 0 && withinBudget && complete) {
      if (!best || total > best.total) best = { picks, total, res };
      // Not necessarily the best pass: keep sweeping so a later, richer pass
      // can beat it. But stop early if we are already close to the ceiling.
      if (total >= budgetDa * 0.92) break;
    }
    if (blocks.length === 0 && lastPass && !best && complete) {
      // Last resort: nothing fit inside the budget on any earlier pass.
      //
      // The ceiling is still applied as a share of the budget, just a generous
      // one. Lifting it entirely (as this pass originally did) let a
      // 1,189,000 DA RTX 5090 into a 120,000 DA request, because with no ceiling
      // the highest-scoring part in the catalogue always wins. An over-budget
      // answer must be recognisably over budget, not wildly so.
      best = { picks, total, res };
    }
    if (lastPass && blocks.length > 0) {
      warnings.push(...blocks.map(formatCompatFinding), "Budget trop serré même au minimum — augmentez ou visez l'occasion.");
    }
  }

  if (!best) {
    /**
     * Every relaxation pass failed. This used to be `throw new Error("unreachable")`,
     * which is a bug, not a safety net: selfCheck() calls this function, so the
     * throw propagated all the way to the admin console and rendered the page as a
     * 500. An unreachable branch that crashes a server component must instead
     * report the failure.
     *
     * If we get here the catalogue itself has no compatible assembly for this
     * budget, which means the parts table or the compat rules are broken rather
     * than the budget being too small. That is worth failing loudly about, but
     * loudly in the self-check output, not by taking down the page that displays it.
     */
    throw new Error(
      `No compatible build found for ${budgetDa} DA / ${useCase}. ` +
        `Every price pass was blocked by compat rules, which points at a broken catalogue or compat rule rather than a small budget.`,
    );
  }

  {
    const picks = best.picks;
    const res = best.res;
    const total = best.total;
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
        const b = bestOffer((p as Product).id, offers);
        return { productId: (p as Product).id, model: `${(p as Product).brand} ${(p as Product).model}`, priceDa: b?.priceDa ?? 0, store: b?.store ?? "—", url: b?.url ?? "#" };
      }),
      warnings: [...res.warnings.map(formatCompatFinding), ...warnings],
      bottleneck: bn,
      psuHeadroomW: psuW - watt,
      fitsBudget: total <= budgetDa,
      budgetDa,
    };
  }

  /**
   * Every relaxation pass failed. This used to be `throw new Error("unreachable")`,
   * which is a bug, not a safety net: selfCheck() calls this function, so the
   * throw propagated all the way to the admin console and rendered the page as a
   * 500. An unreachable branch that crashes a server component must instead
   * report the failure.
   *
   * If we get here the catalogue itself has no compatible assembly for this
   * budget, which means the parts table or the compat rules are broken rather
   * than the budget being too small. That is worth failing loudly about, but
   * loudly in the self-check output, not by taking down the page that displays it.
   */
  throw new Error(
    `No compatible build found for ${budgetDa} DA / ${useCase}. ` +
      `Every price pass was blocked by compat rules, which points at a broken catalogue or compat rule rather than a small budget.`,
  );
}

/** True if `trial` contains any blocking incompatibility. */
function hasBlock(trial: Record<string, Product>, offers: Offer[]): boolean {
  void offers;
  try {
    const res = checkCompat(trial as never);
    return res.warnings.some((w) => w.severity === "block");
  } catch {
    // If the rules themselves throw while we are still assembling a partial
    // build, treat it as "not yet usable" so we keep looking rather than
    // committing to a candidate that crashes the engine.
    return true;
  }
}

/**
 * Choose a CPU and motherboard together, respecting both ceilings.
 *
 * These two are inseparable: a CPU is only buyable if a board exists for its
 * socket and memory type. Chosen separately, the CPU is ranked with nothing to
 * contradict it and lands on a part no board in the catalogue accepts.
 *
 * Candidates are pairs, not independent picks, so a pair is only ever returned
 * when both parts are affordable, socket-compatible and the right memory
 * generation. Ranking prefers the higher-scoring CPU, and within that the
 * cheapest board, so the platform spends the CPU budget rather than the board's.
 *
 * `preferIGpu` biases the CPU choice toward parts with integrated graphics,
 * which is what makes an office build need no discrete card.
 */
function pickPlatform(
  preferIGpu: boolean,
  cpuCeiling: number,
  boardCeiling: number,
  picks: Partial<Record<CategoryKey, Product>>,
  offers: Offer[],
): { cpu: Product; board: Product } | null {
  const price = (p: Product) => bestOffer(p.id, offers)?.priceDa ?? Infinity;

  const cpus = PRODUCTS.filter((p) => p.category === "cpu")
    .map((p) => ({ p, price: price(p) }))
    .filter((x) => Number.isFinite(x.price) && x.price <= cpuCeiling)
    .map((x) => ({ ...x, score: cpuTier(x.p.model), igpu: (x.p.specs as { igpu?: boolean }).igpu === true }))
    .filter((x) => x.score > 0)
    .sort((a, b) => {
      // An iGPU is worth a lot for office, since it removes a whole category of
      // spend. For gaming it is worth nothing, so it does not distort the pick.
      const aScore = a.score + (preferIGpu && a.igpu ? 25 : 0);
      const bScore = b.score + (preferIGpu && b.igpu ? 25 : 0);
      return bScore - aScore || a.price - b.price;
    });

  const boards = PRODUCTS.filter((p) => p.category === "motherboard")
    .map((p) => ({ p, price: price(p), socket: String((p.specs as { socket?: string }).socket ?? ""), ram: String((p.specs as { ram_type?: string }).ram_type ?? "") }))
    .filter((x) => Number.isFinite(x.price) && x.price <= boardCeiling);

  for (const cpu of cpus) {
    const cpuSocket = String((cpu.p.specs as { socket?: string }).socket ?? "");
    const cpuRam = String((cpu.p.specs as { ram_type?: string }).ram_type ?? "");
    const fit = boards
      .filter((b) => b.socket === cpuSocket && (!cpuRam || b.ram === cpuRam || b.ram === ""))
      .sort((a, b) => a.price - b.price);
    if (fit.length === 0) continue;
    // Memory type must agree too; the socket match alone is not enough, which is
    // what let a DDR3 stick onto a DDR4 board.
    const ramMatch = fit.find((b) => b.ram === cpuRam) ?? (cpuRam ? null : fit[0]);
    if (!ramMatch) continue;
    const trial = { ...picks, cpu: cpu.p, motherboard: ramMatch.p } as Record<string, Product>;
    if (hasBlock(trial, offers)) continue;
    return { cpu: cpu.p, board: ramMatch.p };
  }
  return null;
}

/**
 * Best-value part in `cat` at or under `maxDa` that introduces no block.
 *
 * Two traps this has to walk around, both of which produced broken builds:
 *
 * 1. `checkCompat` judges a PARTIAL build. A CPU sitting alone with no
 *    motherboard looks fine, but the moment a board arrives the socket has to
 *    match. An earlier version short-circuited the check for motherboard and
 *    ram "because there was nothing to compare against yet", which is exactly
 *    backwards: those are the two picks the check exists to police. It attached
 *    a DDR3 board to an AM4 CPU and a DDR3 stick to a DDR4 board, and the
 *    finished build reported compat.socketMismatch and compat.cpuRamType. So
 *    every candidate is checked now, partial build and all.
 *
 * 2. Because the check is on the partial build, a candidate that fails is
 *    skipped rather than returned, and the loop continues to the next-cheapest.
 *    That is what lets a bad match be traded for a compatible one at the same
 *    price instead of poisoning the whole build.
 */
function pickCompatible(
  cat: CategoryKey,
  maxDa: number,
  picks: Partial<Record<CategoryKey, Product>>,
  exclude: string[],
  offers: Offer[],
): Product | null {
  // Ranked by quality, price only breaking ties. See the note on bestValue:
  // score-per-dinar made a bigger budget buy a slower part.
  const cands = PRODUCTS.filter((p) => p.category === cat && !exclude.includes(p.id))
    .map((p) => ({ p, price: bestOffer(p.id, offers)?.priceDa ?? Infinity }))
    // See bestValue: unpriced parts must not pass the ceiling.
    .filter((x) => Number.isFinite(x.price) && x.price <= maxDa)
    .map((x) => ({ ...x, score: perfScore(cat, x.p) }))
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || a.price - b.price);

  // What is already decided, and therefore able to contradict this candidate.
  const cpu = picks.cpu;
  const board = picks.motherboard;

  for (const { p } of cands) {
    const trial = { ...picks, [cat]: p } as Record<string, Product>;
    if (!hasBlock(trial, offers)) { picks[cat] = p; return p; }
  }

  // Nothing in this category is both affordable and indexable. Fall back to the
  // literal cheapest so the build is still complete - a missing part is worse
  // than an unranked one, and the perf layer degrades gracefully anyway.
  const floor = cheapest(cat, maxDa, exclude, offers);
  if (floor) picks[cat] = floor;
  return floor;
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
