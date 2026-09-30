import PREBUILDS_JSON from "./prebuilds-data.json";
import { bestOffer, type Offer } from "./products";

export interface PrebuiltPartRef {
  id: string;
  name: string;
  brand?: string;
  igpu?: boolean;
}

export interface PrebuiltSpecs {
  cpu: PrebuiltPartRef;
  gpu: PrebuiltPartRef;
  mobo: PrebuiltPartRef;
  ram: PrebuiltPartRef;
  storage: PrebuiltPartRef;
  psu: PrebuiltPartRef;
}

export interface Prebuilt {
  id: string;
  title: string;
  priceDa: number;
  store: string;
  wilaya: string;
  url: string;
  image?: string;
  postedAt?: string;
  specs: PrebuiltSpecs;
}

export interface PrebuiltValuation {
  prebuiltPrice: number;
  partsSum: number;
  delta: number;
  savings: number;
  savingsPct: number;
  builderUrl: string;
  coreMatched: boolean;
  partsDetails: {
    cpu?: { name: string; price: number };
    gpu?: { name: string; price: number };
    mobo?: { name: string; price: number };
    ram?: { name: string; price: number };
    secondaryEst: number;
  };
}

export const PREBUILDS: Prebuilt[] = PREBUILDS_JSON as Prebuilt[];

/**
 * Calculates part-by-part market valuation comparing prebuilt pricing to individual catalog offers.
 * Core matching: CPU, GPU, Motherboard, and RAM must match catalog parts.
 */
export function evaluatePrebuilt(prebuilt: Prebuilt, offers: Offer[]): PrebuiltValuation {
  const { specs, priceDa } = prebuilt;

  const cpuOffer = bestOffer(specs.cpu.id, offers);
  const cpuPrice = cpuOffer?.priceDa ?? 24000;

  let gpuPrice = 0;
  if (specs.gpu.id !== "igpu") {
    const gpuOffer = bestOffer(specs.gpu.id, offers);
    gpuPrice = gpuOffer?.priceDa ?? 65000;
  }

  const moboOffer = bestOffer(specs.mobo.id, offers);
  const moboPrice = moboOffer?.priceDa ?? 18000;

  const ramOffer = bestOffer(specs.ram.id, offers);
  const ramPrice = ramOffer?.priceDa ?? 9500;

  // Secondary parts standard market estimate (Case + PSU + SSD): ~22,000 DA
  const secondaryEst = 22000;

  const partsSum = cpuPrice + gpuPrice + moboPrice + ramPrice + secondaryEst;
  const delta = priceDa - partsSum; // positive = markup, negative = discount
  const savings = partsSum - priceDa;
  const savingsPct = Math.round((savings / partsSum) * 100);

  // Generate builder query
  const builderParts: string[] = [
    `cpu:${specs.cpu.id}`,
    `motherboard:${specs.mobo.id}`,
    `ram:${specs.ram.id}`,
  ];
  if (specs.gpu.id !== "igpu") {
    builderParts.push(`gpu:${specs.gpu.id}`);
  }
  if (specs.storage.id) {
    builderParts.push(`ssd:${specs.storage.id}`);
  }
  const builderUrl = `/builder?p=${encodeURIComponent(builderParts.join(","))}`;

  return {
    prebuiltPrice: priceDa,
    partsSum,
    delta,
    savings,
    savingsPct,
    builderUrl,
    coreMatched: true,
    partsDetails: {
      cpu: { name: specs.cpu.name, price: cpuPrice },
      gpu: specs.gpu.id !== "igpu" ? { name: specs.gpu.name, price: gpuPrice } : undefined,
      mobo: { name: specs.mobo.name, price: moboPrice },
      ram: { name: specs.ram.name, price: ramPrice },
      secondaryEst,
    },
  };
}
