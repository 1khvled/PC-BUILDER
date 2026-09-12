import type { Product } from "@/lib/data/products";
import { estimatedWattage } from "./watt";

export type Build = Partial<Record<string, Product>>;

export interface CompatResult {
  ok: boolean;
  warnings: string[];
  wattage: number;
}

// 8 rules from PLAN section 7 — code only, no DB
export function checkCompat(build: Build): CompatResult {
  const warnings: string[] = [];
  const cpu = build.cpu;
  const mobo = build.motherboard;
  const ram = build.ram;
  const gpu = build.gpu;
  const psu = build.psu;
  const pcCase = build.case;
  const cooler = build.cooler;
  const ssd = build.ssd;

  if (cpu && mobo && cpu.specs.socket !== mobo.specs.socket) {
    warnings.push(`BLOCK: CPU socket ${cpu.specs.socket} != motherboard ${mobo.specs.socket}`);
  }
  const ramType = (ram?.specs as { type?: string } | undefined)?.type;
  if (cpu && ramType && (cpu.specs as { ram_type?: string }).ram_type !== ramType) {
    warnings.push(`BLOCK: CPU needs ${(cpu.specs as { ram_type?: string }).ram_type}, RAM is ${ramType}`);
  }
  if (mobo && ramType && (mobo.specs as { ram_type?: string }).ram_type !== ramType) {
    warnings.push(`BLOCK: Motherboard needs ${(mobo.specs as { ram_type?: string }).ram_type}, RAM is ${ramType}`);
  }
  const gpuLen = (gpu?.specs as { length_mm?: number } | undefined)?.length_mm;
  const maxGpu = (pcCase?.specs as { max_gpu_mm?: number } | undefined)?.max_gpu_mm;
  if (gpuLen && maxGpu && gpuLen > maxGpu) {
    warnings.push(`BLOCK: GPU ${gpuLen}mm > case max ${maxGpu}mm`);
  }
  const coolerH = (cooler?.specs as { height_mm?: number } | undefined)?.height_mm;
  const maxCooler = (pcCase?.specs as { max_cooler_mm?: number } | undefined)?.max_cooler_mm;
  if (coolerH && maxCooler && coolerH > maxCooler) {
    warnings.push(`WARN: cooler ${coolerH}mm > case max ${maxCooler}mm`);
  }
  const form = (mobo?.specs as { form_factor?: string } | undefined)?.form_factor;
  const supports = (pcCase?.specs as { supports?: string[] } | undefined)?.supports;
  if (form && supports && !supports.includes(form)) {
    warnings.push(`BLOCK: case doesn't support ${form}`);
  }
  const cpuTdp = (cpu?.specs as { tdp?: number } | undefined)?.tdp ?? 0;
  const gpuTdp = (gpu?.specs as { tdp_w?: number } | undefined)?.tdp_w ?? 0;
  const wattage = estimatedWattage(cpuTdp, gpuTdp);
  const psuW = (psu?.specs as { wattage?: number } | undefined)?.wattage ?? 0;
  if (psuW && psuW < wattage) {
    warnings.push(`WARN: PSU ${psuW}W < estimated ${wattage}W`);
  }
  const iface = (ssd?.specs as { interface?: string } | undefined)?.interface;
  const m2 = (mobo?.specs as { m2?: number } | undefined)?.m2 ?? 0;
  if (iface === "NVME" && mobo && m2 < 1) {
    warnings.push("WARN: motherboard has no M.2 slot for NVMe SSD");
  }
  return { ok: !warnings.some((w) => w.startsWith("BLOCK")), warnings, wattage };
}
