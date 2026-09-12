import { PRODUCTS, type Product, type Category } from "../data/products";

export const MATCH_THRESHOLD = 55;
export const RUNNER_UP_MARGIN = 12;

const CATEGORY_MAP: Record<string, Category> = {
  cpu: "cpu",
  processor: "cpu",
  processeur: "cpu",
  cooler: "cooler",
  cooling: "cooler",
  "cpu cooler": "cooler",
  refroidissement: "cooler",
  motherboard: "motherboard",
  mobo: "motherboard",
  "carte mere": "motherboard",
  ram: "ram",
  memory: "ram",
  memoire: "ram",
  ssd: "ssd",
  storage: "ssd",
  stockage: "ssd",
  gpu: "gpu",
  "video card": "gpu",
  "graphics card": "gpu",
  "carte graphique": "gpu",
  case: "case",
  boitier: "case",
  psu: "psu",
  "power supply": "psu",
  alimentation: "psu",
  monitor: "monitor",
  ecran: "monitor",
};

/**
 * Normalizes text for comparison: lowercases, removes diacritics, unifies units.
 */
function normalizeText(s: string): string {
  return (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\b(\d{1,3})\s?go\b/gi, "$1gb")
    .replace(/\b(\d{1,3})\s?g\b(?!\w)/gi, "$1gb")
    .replace(/rtx\s*(\d{3,4})/gi, "rtx $1")
    .replace(/gtx\s*(\d{3,4})/gi, "gtx $1")
    .replace(/rx\s*(\d{3,4})/gi, "rx $1")
    .replace(/ryzen\s*([3579])/gi, "ryzen $1")
    .replace(/i([3579])[\s-](\d{4,5}[a-z]*)/gi, "i$1 $2")
    .trim();
}

const SPEC_UNIT_REGEX = /^(\d+(?:gb|w|hz|mhz|tb|mm)|ddr[345]|lga\d*|am[45])$/;
const TIER_REGEX = /^(?:i[3579]|r[3579]|[3579])$/;

/**
 * Score an offer title against a product using brand/model token scoring plus spec regexes.
 */
export function scoreOffer(
  title: string,
  product: {
    brand: string;
    model: string;
    specs?: Record<string, unknown> | any;
    category?: string;
  }
): number {
  if (!title || !product) return 0;

  const normTitle = normalizeText(title);
  const titleClean = normTitle.replace(/[^a-z0-9]+/g, " ");
  const titleTokens = new Set(titleClean.split(/\s+/).filter(Boolean));

  const normBrand = normalizeText(product.brand);
  const brandClean = normBrand.replace(/[^a-z0-9]+/g, " ");
  const brandTokens = brandClean.split(/\s+/).filter(Boolean);

  const normModel = normalizeText(product.model);
  const modelClean = normModel.replace(/[^a-z0-9]+/g, " ");
  const modelTokens = modelClean.split(/\s+/).filter(Boolean);

  let score = 0;

  // --- 1. BRAND TOKEN SCORING ---
  const brandMerged = brandClean.replace(/\s+/g, "");
  const titleMerged = titleClean.replace(/\s+/g, "");
  const isAmdProduct = brandTokens.includes("amd") || normModel.includes("ryzen") || normModel.includes("rx");
  const isIntelProduct = brandTokens.includes("intel") || normModel.includes("core i") || normModel.includes("12400");
  const isNvidiaProduct = brandTokens.includes("nvidia") || normModel.includes("rtx") || normModel.includes("gtx");

  const brandMatched =
    (brandClean.length > 0 && titleClean.includes(brandClean)) ||
    (brandMerged.length > 2 && titleMerged.includes(brandMerged)) ||
    (brandTokens.length > 0 && brandTokens.every((bt) => titleTokens.has(bt))) ||
    (isAmdProduct && titleTokens.has("ryzen")) ||
    (isIntelProduct && (titleClean.includes("core i") || /\bi[3579]\b/.test(titleClean))) ||
    (isNvidiaProduct && (titleClean.includes("geforce") || titleTokens.has("rtx") || titleTokens.has("gtx")));

  if (brandMatched) {
    score += 15;
  }

  // Brand conflict penalties
  if (isAmdProduct && titleTokens.has("intel") && !titleTokens.has("amd")) {
    score -= 40;
  }
  if (isIntelProduct && (titleTokens.has("amd") || titleTokens.has("ryzen")) && !titleTokens.has("intel")) {
    score -= 40;
  }

  // --- 2. MODEL TOKEN SCORING ---
  // Identify key identifier tokens (e.g. 5600, 12400f, 7600x, 3060, 4060, b550m, 212, 970, 650, v217, 255f)
  // Exclude single digits (like "5" from Ryzen 5), spec units (12gb, ddr4), and tier prefixes.
  const keyModelTokens = modelTokens.filter((t) => {
    if (SPEC_UNIT_REGEX.test(t)) return false;
    if (TIER_REGEX.test(t)) return false;
    if (brandTokens.includes(t)) return false;
    return /\d/.test(t) || ["v217", "mwe", "255f"].includes(t);
  });

  const secondaryTokens = modelTokens.filter((t) => {
    if (SPEC_UNIT_REGEX.test(t)) return false;
    if (brandTokens.includes(t)) return false;
    if (keyModelTokens.includes(t)) return false;
    return !["oc", "edition", "series", "black", "white"].includes(t);
  });

  if (keyModelTokens.length > 0) {
    let keyMatched = false;
    for (const kt of keyModelTokens) {
      // Direct token match, or base match (e.g. "12400" matching "12400f", "b550" matching "b550m")
      const baseKt = kt.replace(/[mf]$/, "");
      if (titleTokens.has(kt) || titleClean.includes(kt) || (baseKt.length >= 4 && titleTokens.has(baseKt))) {
        keyMatched = true;
        score += 40;

        // Specific sub-model conflict checks:
        // Suffix check: 5600 vs 5600x / 5600g
        if (kt === "5600" && /\b5600[xg]\b/i.test(title)) {
          score -= 30;
        }
        // GPU suffixes: Ti / Super
        const titleHasTi = /\b(ti|super)\b/i.test(title);
        const modelHasTi = /\b(ti|super)\b/i.test(product.model);
        if (titleHasTi && !modelHasTi) {
          score -= 30;
        }
        break;
      }
    }
    if (!keyMatched) {
      // Key model identifier absent from title
      score -= 35;
    }
  }

  // Secondary descriptive tokens (e.g. ryzen, core, ventus, shadow, gaming, trio, windforce, vengeance, delta, evo)
  let secMatches = 0;
  for (const st of secondaryTokens) {
    if (titleTokens.has(st) || titleClean.includes(st)) {
      secMatches++;
    }
  }
  score += Math.min(20, secMatches * 6);

  // --- 3. SPEC REGEXES ---

  // A. VRAM GB Regex (for GPUs)
  const isGpu =
    product.category === "gpu" ||
    normModel.includes("rtx") ||
    normModel.includes("gtx") ||
    normModel.includes("rx 580") ||
    normModel.includes("geforce");

  if (isGpu) {
    const prodVramMatch = normModel.match(/\b(\d{1,2})gb\b/);
    const prodVram =
      (product.specs?.vram_gb as number) ??
      (product.specs?.vram as number) ??
      (prodVramMatch ? parseInt(prodVramMatch[1], 10) : null);

    if (prodVram != null) {
      const rawMatches = normTitle.match(/\b\d{1,2}\s*gb\b/g) || [];
      const titleVramMatches = rawMatches.map((m) => parseInt(m, 10));
      if (titleVramMatches.length > 0) {
        if (titleVramMatches.includes(prodVram)) {
          score += 15;
        } else {
          score -= 25;
        }
      }
    }
  }

  // B. RAM GB + Type Regex
  const isRam = product.category === "ram" || normModel.includes("vengeance") || normModel.includes("delta");
  const prodRamCapMatch = normModel.match(/\b(\d{1,3})gb\b/);
  const prodRamCap =
    (product.specs?.capacity_gb as number) ??
    (product.specs?.capacity as number) ??
    (isRam && prodRamCapMatch ? parseInt(prodRamCapMatch[1], 10) : null);

  if (prodRamCap != null) {
    const rawMatches = normTitle.match(/\b\d{1,3}\s*gb\b/g) || [];
    const titleRamMatches = rawMatches.map((m) => parseInt(m, 10));
    if (titleRamMatches.length > 0) {
      if (titleRamMatches.includes(prodRamCap)) {
        score += 15;
      } else {
        score -= 25;
      }
    }
  }

  const prodRamTypeMatch = normModel.match(/\b(ddr[345])\b/i);
  const prodRamType =
    (product.specs?.type as string) ??
    (product.specs?.ram_type as string) ??
    (prodRamTypeMatch ? prodRamTypeMatch[1].toUpperCase() : null);

  if (prodRamType != null) {
    const titleRamTypeMatch = normTitle.match(/\b(ddr[345])\b/i);
    if (titleRamTypeMatch) {
      if (titleRamTypeMatch[1].toUpperCase() === String(prodRamType).toUpperCase()) {
        score += 12;
      } else {
        score -= 25;
      }
    }
  }

  // C. Socket Regex (CPU, Motherboard, Cooler)
  const socketRegex = /\b(am[45]|lga\s*\d{3,4}|str[45x]|tr4)\b/i;
  const prodSocket =
    (product.specs?.socket as string) ??
    (normModel.match(socketRegex)?.[0] ? normModel.match(socketRegex)![0].replace(/\s+/g, "").toUpperCase() : null);
  const prodSockets: string[] = Array.isArray(product.specs?.sockets)
    ? (product.specs.sockets as string[]).map((s) => s.replace(/\s+/g, "").toUpperCase())
    : [];

  if (prodSocket || prodSockets.length > 0) {
    const titleSocketMatch = normTitle.match(socketRegex);
    if (titleSocketMatch) {
      const titleSocket = titleSocketMatch[0].replace(/\s+/g, "").toUpperCase();
      const matches =
        (prodSocket && prodSocket.replace(/\s+/g, "").toUpperCase() === titleSocket) ||
        prodSockets.includes(titleSocket);
      if (matches) {
        score += 15;
      } else {
        score -= 25;
      }
    }
  }

  // D. Wattage Regex (PSU)
  const wattRegex = /\b(\d{3,4})\s*w(?:atts?)?\b/i;
  const prodWattMatch = normModel.match(wattRegex);
  const prodWatt =
    (product.specs?.wattage as number) ??
    (prodWattMatch ? parseInt(prodWattMatch[1], 10) : null);

  if (prodWatt != null) {
    const titleWattMatch = normTitle.match(wattRegex);
    if (titleWattMatch) {
      const titleWatt = parseInt(titleWattMatch[1], 10);
      if (titleWatt === prodWatt) {
        score += 15;
      } else {
        score -= 25;
      }
    }
  }

  return Math.max(0, Math.min(100, Math.round(score)));
}

/**
 * Finds the best product match for an offer title within a category.
 * Requires score >= MATCH_THRESHOLD (55) and >= RUNNER_UP_MARGIN (12) over runner-up.
 */
export function bestMatch(
  title: string,
  category: string
): { productId: string | null; score: number } {
  if (!title || !category) {
    return { productId: null, score: 0 };
  }

  const rawCat = category.toLowerCase().trim();
  const canonicalCat = CATEGORY_MAP[rawCat] || (rawCat as Category);

  const candidates = PRODUCTS.filter((p) => p.category === canonicalCat);
  if (candidates.length === 0) {
    return { productId: null, score: 0 };
  }

  const scored = candidates
    .map((p) => ({
      productId: p.id,
      score: scoreOffer(title, p),
    }))
    .sort((a, b) => b.score - a.score);

  const best = scored[0];
  const runnerUp = scored[1];

  if (!best || best.score < MATCH_THRESHOLD) {
    return { productId: null, score: best ? best.score : 0 };
  }

  if (runnerUp && best.score - runnerUp.score < RUNNER_UP_MARGIN) {
    return { productId: null, score: best.score };
  }

  return { productId: best.productId, score: best.score };
}
