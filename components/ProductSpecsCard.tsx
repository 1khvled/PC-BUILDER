"use client";

import { useMemo } from "react";
import type { Locale } from "@/lib/i18n/config";

interface ProductSpecsCardProps {
  category: string;
  categoryLabel: string;
  brand: string;
  model: string;
  id: string;
  specs: Record<string, any>;
  locale?: Locale;
}

const SPEC_LABELS_FR: Record<string, string> = {
  max_gpu_mm: "Longueur max GPU",
  max_cooler_mm: "Hauteur max Ventirad",
  supports: "Compatibilité Carte Mère",
  socket: "Socket Processeur",
  cores: "Cœurs Physiques",
  threads: "Threads Logiques",
  clock_ghz: "Fréquence de Base",
  boost_ghz: "Fréquence Boost",
  tdp_w: "Consommation (TDP)",
  vram_gb: "Mémoire Vidéo (VRAM)",
  length_mm: "Longueur Totale",
  recommended_psu_w: "Alimentation Recommandée",
  speed_mhz: "Fréquence Mémoire",
  capacity_gb: "Capacité",
  type: "Type de Mémoire",
  modules: "Configuration Modules",
  form_factor: "Facteur de Forme",
  chipset: "Chipset",
  ram_slots: "Slots Mémoire (RAM)",
  m2_slots: "Ports M.2 NVMe",
  wattage: "Puissance Maximale",
  rating: "Certification 80 PLUS",
  modular: "Modularité du Câblage",
  height_mm: "Hauteur Totale",
  radiator_mm: "Taille du Radiateur",
  size_in: "Diagonale Écran",
  res: "Résolution",
  refresh_hz: "Taux de Rafraîchissement",
  panel: "Type de Dalle",
  technology: "Technologie d'Impression",
  format: "Format Papier",
  color: "Couleur / Monochrome",
};

const SPEC_LABELS_EN: Record<string, string> = {
  max_gpu_mm: "Max GPU Length",
  max_cooler_mm: "Max CPU Cooler Height",
  supports: "Motherboard Support",
  socket: "CPU Socket",
  cores: "Physical Cores",
  threads: "Logical Threads",
  clock_ghz: "Base Clock",
  boost_ghz: "Boost Clock",
  tdp_w: "Thermal Design Power (TDP)",
  vram_gb: "Video Memory (VRAM)",
  length_mm: "Card Length",
  recommended_psu_w: "Recommended PSU",
  speed_mhz: "Memory Frequency",
  capacity_gb: "Capacity",
  type: "Memory Standard",
  modules: "Module Configuration",
  form_factor: "Form Factor",
  chipset: "Chipset",
  ram_slots: "RAM Slots",
  m2_slots: "M.2 NVMe Slots",
  wattage: "Maximum Wattage",
  rating: "80 PLUS Certification",
  modular: "Modularity",
  height_mm: "Total Height",
  radiator_mm: "Radiator Size",
  size_in: "Screen Size",
  res: "Resolution",
  refresh_hz: "Refresh Rate",
  panel: "Panel Technology",
  technology: "Printing Technology",
  format: "Paper Format",
  color: "Color / Mono",
};

function formatValue(key: string, val: any, locale: Locale): { text: string; pills?: string[] } {
  if (Array.isArray(val)) {
    return { text: val.join(", "), pills: val.map(String) };
  }
  if (typeof val === "boolean") {
    return { text: val ? (locale === "fr" ? "Oui" : "Yes") : (locale === "fr" ? "Non" : "No") };
  }

  const num = Number(val);
  const isNum = !isNaN(num);

  if (key.endsWith("_mm") && isNum) return { text: `${num} mm` };
  if (key.endsWith("_ghz") && isNum) return { text: `${num} GHz` };
  if (key.endsWith("_mhz") && isNum) return { text: `${num} MHz` };
  if (key.endsWith("_hz") && isNum) return { text: `${num} Hz` };
  if (key.endsWith("_w") && isNum) return { text: `${num} W` };
  if (key === "wattage" && isNum) return { text: `${num} Watts` };
  if (key === "size_in" && isNum) return { text: `${num}" (${Math.round(num * 2.54)} cm)` };
  if (key === "cores" && isNum) return { text: `${num} ${locale === "fr" ? "Cœurs" : "Cores"}` };
  if (key === "threads" && isNum) return { text: `${num} Threads` };
  if (key === "vram_gb" && isNum) return { text: `${num} GB GDDR` };
  if (key === "capacity_gb" && isNum) {
    if (num >= 1000) return { text: `${num / 1000} TB (${num} GB)` };
    return { text: `${num} GB` };
  }

  return { text: String(val) };
}

export default function ProductSpecsCard({
  category,
  categoryLabel,
  brand,
  model,
  id,
  specs,
  locale = "fr",
}: ProductSpecsCardProps) {
  const isFr = locale === "fr";
  const labelMap = isFr ? SPEC_LABELS_FR : SPEC_LABELS_EN;

  const entries = useMemo(() => {
    return Object.entries(specs || {}).map(([key, rawVal]) => {
      const label = labelMap[key] || key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      const formatted = formatValue(key, rawVal, locale);
      return {
        key,
        label,
        ...formatted,
      };
    });
  }, [specs, labelMap, locale]);

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 shadow-xs overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 bg-slate-50/90 border-b border-slate-200/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <span className="p-1.5 rounded-lg bg-blue-50 text-[#2c87c3] border border-blue-100">
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-extrabold text-slate-900 tracking-tight">
              {isFr ? "Fiche Technique & Spécifications" : "Technical Specifications & Hardware Details"}
            </h2>
            <p className="text-[11px] text-slate-500 font-medium">
              {isFr ? "Données vérifiées constructeur & compatibilité" : "Verified hardware attributes & dimensions"}
            </p>
          </div>
        </div>
        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200/80">
          {id}
        </span>
      </div>

      {/* Grid of Attributes */}
      <div className="p-5">
        {/* Core Identity Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4 pb-4 border-b border-slate-100">
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
              {isFr ? "Marque / Fabricant" : "Brand / Manufacturer"}
            </span>
            <span className="text-sm font-extrabold text-slate-900">{brand}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
              {isFr ? "Catégorie Matériel" : "Hardware Category"}
            </span>
            <span className="text-sm font-extrabold text-slate-900">{categoryLabel}</span>
          </div>
          <div className="p-3 rounded-lg bg-slate-50/70 border border-slate-200/60">
            <span className="text-[11px] uppercase tracking-wider font-bold text-slate-400 block mb-0.5">
              {isFr ? "Modèle Référencé" : "Catalog Model"}
            </span>
            <span className="text-sm font-extrabold text-slate-900 truncate block" title={model}>
              {model}
            </span>
          </div>
        </div>

        {/* Detailed Hardware Attributes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5">
          {entries.map((item) => (
            <div
              key={item.key}
              className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-slate-50 transition-colors border-b border-slate-100/80 last:border-b-0"
            >
              <span className="text-xs text-slate-600 font-medium">{item.label}</span>
              {item.pills && item.pills.length > 0 ? (
                <div className="flex flex-wrap gap-1 justify-end">
                  {item.pills.map((pill) => (
                    <span
                      key={pill}
                      className="px-2 py-0.5 text-[11px] font-bold rounded-md bg-slate-100 text-slate-800 border border-slate-200"
                    >
                      {pill}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-xs font-bold text-slate-900 font-mono tracking-tight text-right">
                  {item.text}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
