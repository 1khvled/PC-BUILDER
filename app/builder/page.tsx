"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CATEGORIES, PRODUCTS, bestOffer, productImage, type Product } from "@/lib/data/products";
import { useOffers } from "@/lib/data/use-offers";
import { checkCompat } from "@/lib/compat/check";
import { recommendedPsu } from "@/lib/compat/watt";
import Thumb from "@/components/Thumb";

function CategoryIcon({ slug }: { slug: string }) {
  switch (slug) {
    case "cpu":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
    case "cooler":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 9.5V3M14.5 12H21M12 14.5V21M9.5 12H3" />
        </svg>
      );
    case "motherboard":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="4" height="4" />
          <path d="M15 7h2M15 10h2M7 15h10M7 18h5" />
        </svg>
      );
    case "ram":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="7" width="20" height="10" rx="1" />
          <path d="M6 17v2M10 17v2M14 17v2M18 17v2M6 11h2M11 11h2M16 11h2" />
        </svg>
      );
    case "ssd":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M7 9h10M7 12h4M16 15h1" />
        </svg>
      );
    case "gpu":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="8.5" cy="12" r="2.5" />
          <circle cx="15.5" cy="12" r="2.5" />
          <path d="M2 10h2M2 14h2M6 18v2M10 18v2" />
        </svg>
      );
    case "case":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <path d="M9 11h6M9 14h6M9 17h6" />
        </svg>
      );
    case "psu":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="10" cy="12" r="3.5" />
          <path d="M16 8h2M16 12h2M16 16h2" />
        </svg>
      );
    case "monitor":
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    default:
      return (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      );
  }
}

function SpecPills({ product }: { product: Product }) {
  const specs = product.specs;
  const pills: string[] = [];

  if (specs.socket) pills.push(String(specs.socket));
  if (specs.tdp) pills.push(`${specs.tdp}W`);
  if (specs.tdp_w) pills.push(`${specs.tdp_w}W`);
  if (specs.ram_type) pills.push(String(specs.ram_type));
  if (specs.type) pills.push(String(specs.type));
  if (specs.capacity_gb) pills.push(`${specs.capacity_gb} Go`);
  if (specs.speed) pills.push(`${specs.speed} MHz`);
  if (specs.interface) pills.push(String(specs.interface));
  if (specs.form_factor) pills.push(String(specs.form_factor));
  if (specs.length_mm) pills.push(`${specs.length_mm} mm`);
  if (specs.height_mm) pills.push(`${specs.height_mm} mm`);
  if (specs.wattage) pills.push(`${specs.wattage}W`);
  if (specs.rating) pills.push(String(specs.rating));
  if (specs.size) pills.push(`${specs.size}"`);
  if (specs.hz) pills.push(`${specs.hz} Hz`);

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {pills.slice(0, 4).map((p, idx) => (
        <span
          key={idx}
          className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200/80 print:border-slate-300"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

const DEFAULT_BUILD: Record<string, string> = {
  cpu: "cpu-r5-5600",
  cooler: "cooler-h212-v3",
  motherboard: "mobo-b550m-a-pro",
  ram: "ram-vengeance-16-d4",
  ssd: "ssd-970evo-1tb",
  gpu: "gpu-rtx3060-12gb",
  case: "case-v217",
  psu: "psu-mwe650-b",
};

function serializePicks(picks: Record<string, string>): string {
  return Object.entries(picks)
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}:${v}`)
    .join(",");
}

function parsePicks(raw: string | null): Record<string, string> | null {
  if (!raw) return null;
  try {
    const parsed: Record<string, string> = {};
    for (const part of raw.split(",")) {
      const idx = part.indexOf(":");
      if (idx < 0) continue;
      const cat = part.slice(0, idx);
      const id = part.slice(idx + 1);
      if (cat && id && PRODUCTS.some((x) => x.id === id && x.category === cat)) parsed[cat] = id;
    }
    return Object.keys(parsed).length ? parsed : null;
  } catch {
    return null;
  }
}

export default function BuilderPage() {
  const offers = useOffers();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [picks, setPicks] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return DEFAULT_BUILD;
    return parsePicks(new URLSearchParams(window.location.search).get("p")) ?? DEFAULT_BUILD;
  });
  const [activeModalCat, setActiveModalCat] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  // Fermer le modal avec Échap pour une navigation clavier claire
  useEffect(() => {
    if (!activeModalCat) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setActiveModalCat(null);
        setModalSearch("");
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeModalCat]);

  // Keep the URL as the source of truth so "Copier le permalien" always shares the real build
  useEffect(() => {
    try {
      const s = serializePicks(picks);
      window.history.replaceState(null, "", s ? `/builder?p=${encodeURIComponent(s)}` : "/builder");
    } catch {
      /* noop */
    }
  }, [picks]);

  const build = useMemo(() => {
    const b: Record<string, Product> = {};
    for (const [cat, id] of Object.entries(picks)) {
      if (id) {
        const p = PRODUCTS.find((x) => x.id === id);
        if (p) b[cat] = p;
      }
    }
    return b;
  }, [picks]);

  const result = useMemo(() => checkCompat(build), [build]);

  const total = useMemo(
    () => Object.values(build).reduce((s, p) => s + (bestOffer(p.id, offers)?.priceDa ?? 0), 0),
    [build, offers]
  );

  const selectedCount = Object.keys(build).length;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((current) => (current === msg ? null : current));
    }, 2400);
  };

  const handleCopyLink = () => {
    try {
      const s = serializePicks(picks);
      const link = window.location.origin + "/builder" + (s ? `?p=${encodeURIComponent(s)}` : "");
      navigator.clipboard?.writeText(link);
      showToast("✓ Permalien copié — il restaure ce build exact !");
    } catch {
      showToast("Copie impossible dans ce navigateur.");
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleRemovePart = (category: string) => {
    const next = { ...picks };
    delete next[category];
    setPicks(next);
    showToast(`Composant retiré.`);
  };

  const handleSelectPart = (category: string, productId: string) => {
    setPicks((prev) => ({ ...prev, [category]: productId }));
    setActiveModalCat(null);
    setModalSearch("");
    showToast(`Composant mis à jour.`);
  };

  const handleReset = () => {
    setPicks({});
    showToast("Configurateur réinitialisé.");
  };

  const handleLoadDefault = () => {
    setPicks(DEFAULT_BUILD);
    showToast("Build gamer de référence chargé.");
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6">
      {/* Print-Only Professional Document Header */}
      <div className="hidden print:block mb-6 border-b-2 border-slate-900 pb-4">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              DZ PartPicker — Devis & Configuration PC
            </h1>
            <p className="text-xs text-slate-600 mt-1">
              Comparatif des prix du marché en Dinars Algériens (DA) • 58 Wilayas
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div>Date : {new Date().toLocaleDateString("fr-DZ")}</div>
            <div className="font-mono text-[10px] text-slate-400">dz-partpicker.dz/builder</div>
          </div>
        </div>
      </div>

      {/* Top Header & Toolbar (Screen Only) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 print:hidden">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              System Builder
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-bold bg-blue-100 text-[#0b63e5] border border-blue-200">
              Configurateur PC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prix les plus bas en Algérie relevés quotidiennement • Vérification automatique de compatibilité • 58 wilayas
          </p>
        </div>

        {/* Quick Toolbar with Print Button Next to Copier */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-lg font-semibold shadow-2xs transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b63e5]"
            title="Copier le lien partageable qui restaure cette sélection"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copier le permalien</span>
          </button>

          {/* Print-friendly export button next to Copier */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 rounded-lg font-semibold shadow-2xs transition-colors flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b63e5]"
            title="Imprimer ou enregistrer en PDF (fiche optimisée pour impression)"
          >
            <svg className="w-3.5 h-3.5 text-slate-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Imprimer / PDF</span>
          </button>

          <button
            onClick={handleLoadDefault}
            className="hidden sm:inline-flex px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium shadow-2xs transition-colors"
          >
            Exemple Gamer
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-white border border-slate-200 hover:text-red-600 hover:border-red-200 text-slate-600 rounded-lg font-medium shadow-2xs transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Progression de la configuration — clarté immédiate */}
      <div className="mt-4 bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-xs print:hidden">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
          <span className="text-slate-700">
            {selectedCount} sur {CATEGORIES.length} composants sélectionnés
          </span>
          <span className="text-slate-500 tabular-nums">{Math.round((selectedCount / CATEGORIES.length) * 100)} % complété</span>
        </div>
        <div className="mt-2 h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={selectedCount} aria-valuemin={0} aria-valuemax={CATEGORIES.length} aria-label="Progression de la configuration">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#0b63e5] to-emerald-500 transition-all"
            style={{ width: `${(selectedCount / CATEGORIES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* PCPartPicker Green Compatibility Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`mt-3 rounded-xl border p-3.5 sm:p-4 text-sm transition-all shadow-xs print:border-slate-300 print:bg-white ${
          result.ok
            ? "bg-[#e7f6ec] border-emerald-200 text-emerald-950"
            : "bg-red-50 border-red-200 text-red-950"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-semibold">
            <span
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-xs shrink-0 print:border ${
                result.ok ? "bg-emerald-600" : "bg-red-600"
              }`}
            >
              {result.ok ? "✓" : "!"}
            </span>
            <span>
              {result.ok
                ? "Compatibilité : Aucun problème ni incompatibilité détecté."
                : `Incompatibilités détectées (${result.warnings.length} avertissement${result.warnings.length > 1 ? "s" : ""})`}
            </span>
          </div>

          <div className="text-xs sm:text-sm font-medium text-slate-700 ml-auto flex items-center gap-2">
            <span>Puissance estimée : <b className="text-slate-900 font-bold">{result.wattage}W</b></span>
            <span className="text-slate-300 print:text-slate-500">•</span>
            <span className="text-slate-500">PSU conseillée : <b className="text-slate-800">{recommendedPsu(result.wattage)}W+</b></span>
          </div>
        </div>

        {result.warnings.length > 0 && (
          <ul className="mt-3 text-xs bg-red-100/60 border border-red-200 rounded-lg p-3 list-disc pl-6 space-y-1 text-red-900 font-medium print:bg-white">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Main PCPartPicker System Builder Table */}
      <div className="bg-white rounded-xl shadow-xs border border-slate-200 mt-4 overflow-hidden print:border-slate-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[860px] border-collapse">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 select-none print:bg-slate-100 print:text-slate-700">
              <tr>
                <th scope="col" className="text-left px-4 py-3 w-[150px]">Composant</th>
                <th scope="col" className="text-left px-3 py-3">Sélection</th>
                <th scope="col" className="text-right px-4 py-3 w-[140px]">Prix</th>
                <th scope="col" className="text-left px-4 py-3 w-[220px]">Où acheter</th>
                <th scope="col" className="text-right px-4 py-3 w-[110px] print:hidden">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 print:divide-slate-200">
              {CATEGORIES.map((cat, catIdx) => {
                const product = build[cat.slug];
                const best = product ? bestOffer(product.id, offers) : undefined;
                const allProductOffers = product ? offers.filter((o) => o.productId === product.id) : [];
                const otherCount = allProductOffers.length - 1;

                return (
                  <tr
                    key={cat.slug}
                    className={`rowline transition-colors group print:hover:bg-transparent ${product ? "" : "bg-amber-50/40"} hover:bg-blue-50/40`}
                  >
                    {/* Component Column */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-lg bg-slate-100 group-hover:bg-[#0b63e5] group-hover:text-white flex items-center justify-center text-slate-600 transition-colors shrink-0 print:border print:border-slate-200 text-xs font-bold" aria-hidden="true">
                          {product ? <CategoryIcon slug={cat.slug} /> : <span>{catIdx + 1}</span>}
                        </span>
                        <span className="font-bold text-slate-800 text-xs sm:text-sm">
                          {cat.label}
                        </span>
                      </div>
                    </td>

                    {/* Selection Column */}
                    <td className="px-3 py-3.5 align-top">
                      {product ? (
                        <div className="flex items-start gap-3">
                          <Thumb src={productImage(product)} alt={product.model} size={48} />
                          <div className="min-w-0">
                            <Link
                              href={`/product/${product.id}`}
                              className="font-bold text-sm text-[#0b63e5] hover:text-[#084db8] hover:underline truncate block print:text-slate-900"
                            >
                              {product.brand} {product.model}
                            </Link>
                            <SpecPills product={product} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-10 h-10 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 print:hidden">
                            <CategoryIcon slug={cat.slug} />
                          </div>
                          <span className="text-slate-400 text-xs italic">
                            Aucun composant sélectionné
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Price Column */}
                    <td className="px-4 py-3.5 text-right align-top">
                      {best ? (
                        <div className="font-extrabold text-sm sm:text-base text-slate-900 tabular-nums anim-in font-mono">
                          {best.priceDa.toLocaleString("fr-DZ")} DA
                        </div>
                      ) : (
                        <span className="text-slate-300 font-normal">—</span>
                      )}
                    </td>

                    {/* Where Column */}
                    <td className="px-4 py-3.5 align-top">
                      {best ? (
                        <div className="text-xs">
                          <a
                            href={best.url}
                            target="_blank"
                            rel="noreferrer"
                            className="font-semibold text-[#0b63e5] hover:underline block truncate print:text-slate-900"
                          >
                            {best.store} · {best.wilaya}
                          </a>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 print:border print:border-emerald-200">
                              {best.condition === "new" ? "Neuf" : "Occasion"}
                            </span>
                            {otherCount > 0 && (
                              <Link
                                href={`/product/${product!.id}`}
                                className="text-[11px] text-slate-400 hover:text-slate-600 underline print:hidden"
                              >
                                +{otherCount} offre{otherCount > 1 ? "s" : ""}
                              </Link>
                            )}
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveModalCat(cat.slug)}
                          className="px-3.5 py-1.5 rounded-lg bg-[#0b63e5] hover:bg-[#094db5] text-white font-bold text-xs transition-colors shadow-2xs print:hidden"
                        >
                          + Choisir
                        </button>
                      )}
                    </td>

                    {/* Action Column (Hidden in Print) */}
                    <td className="px-4 py-3.5 text-right align-top print:hidden">
                      {product ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveModalCat(cat.slug)}
                            className="px-2 py-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b63e5] transition-colors"
                            title="Changer de composant"
                          >
                            Changer
                          </button>
                          <button
                            onClick={() => handleRemovePart(cat.slug)}
                            className="w-7 h-7 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            title="Retirer de la configuration"
                            aria-label={`Retirer ${cat.label}`}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveModalCat(cat.slug)}
                          className="text-[#0b63e5] hover:text-[#084db8] hover:underline underline-offset-4 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0b63e5] rounded"
                        >
                          + Ajouter
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Sticky Total Bar (Styled like PCPartPicker System Total) */}
        <div className="flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-slate-900 text-white rounded-b-xl border-t border-slate-800 print:bg-slate-100 print:text-slate-900 print:border-slate-300 print:rounded-none">
          <div className="flex items-baseline gap-3 flex-wrap text-sm">
            <span className="text-slate-400 print:text-slate-600 font-medium">
              {selectedCount} sur {CATEGORIES.length} pièces :
            </span>
            <span
              key={total}
              className="text-xl sm:text-2xl font-black tracking-tight text-white print:text-slate-900 tabular-nums anim-in font-mono"
            >
              {total.toLocaleString("fr-DZ")} DA
            </span>
            <span className="text-slate-400 print:text-slate-500 text-xs">
              ≈ ${Math.round(total / 132).toLocaleString()} USD
            </span>
            <span className="text-slate-500 text-xs hidden sm:inline">
              • {result.wattage}W estimés
            </span>
          </div>

          <div className="flex items-center gap-2 text-xs font-semibold ml-auto print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-bold transition-colors flex items-center gap-1.5"
              title="Imprimer ou enregistrer en PDF"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 6 2 18 2 18 9" />
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                <rect x="6" y="14" width="12" height="8" />
              </svg>
              <span>Imprimer</span>
            </button>

            <button
              onClick={handleCopyLink}
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold transition-colors shadow-sm flex items-center gap-1.5"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              <span>Copier le lien du build</span>
            </button>
          </div>
        </div>
      </div>

      <p className="text-xs text-slate-400 mt-3 print:hidden">
        Format réplique de pcpartpicker.com/list adapté pour l&apos;Algérie. Les colonnes US (Base, Promo, Tax) sont adaptées en (Prix DA, Disponibilité, Marchand 58 wilayas). Le tri est 100% organique par prix croissant.
      </p>

      {/* Component Picker Modal */}
      {activeModalCat && (
        <div className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 anim-in print:hidden" onClick={() => { setActiveModalCat(null); setModalSearch(""); }}>
          <div role="dialog" aria-modal="true" aria-label={`Choisir un composant : ${CATEGORIES.find((c) => c.slug === activeModalCat)?.label ?? activeModalCat}`} className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-slate-50/80">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">
                  Choisir un composant : {CATEGORIES.find((c) => c.slug === activeModalCat)?.label}
                </h3>
                <p className="text-xs text-slate-500">
                  Sélectionnez parmi les produits indexés en Algérie
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveModalCat(null);
                  setModalSearch("");
                }}
                className="w-8 h-8 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold"
              >
                ✕
              </button>
            </div>

            {/* Modal Search Bar */}
            <div className="p-3 border-b border-slate-100 bg-white">
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Filtrer par marque, modèle…"
                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs text-slate-800 outline-none focus:border-[#0b63e5] focus:bg-white"
                autoFocus
              />
            </div>

            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              {PRODUCTS.filter((p) => p.category === activeModalCat)
                .filter((p) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase();
                  return `${p.brand} ${p.model}`.toLowerCase().includes(q);
                })
                .map((product) => {
                  const best = bestOffer(product.id, offers);
                  const isCurrent = picks[activeModalCat] === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`p-3 rounded-xl flex items-center gap-3 transition-colors ${
                        isCurrent ? "bg-blue-50/80 border border-blue-200" : "hover:bg-slate-50"
                      }`}
                    >
                      <Thumb src={productImage(product)} alt={product.model} size={52} />
                      <div className="min-w-0 flex-1">
                        <div className="font-bold text-sm text-slate-900">
                          {product.brand} {product.model}
                        </div>
                        <SpecPills product={product} />
                        <div className="text-xs text-slate-500 mt-1">
                          {best ? (
                            <span>
                              dès <b className="text-emerald-700 font-bold font-mono">{best.priceDa.toLocaleString("fr-DZ")} DA</b> chez {best.store} ({best.wilaya})
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">Pas d&apos;offre indexée</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectPart(activeModalCat, product.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors ${
                          isCurrent
                            ? "bg-slate-200 text-slate-700 cursor-default"
                            : "bg-[#0b63e5] hover:bg-[#094db5] text-white shadow-2xs"
                        }`}
                      >
                        {isCurrent ? "Sélectionné" : "Choisir"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 sm:right-10 z-50 bg-slate-900 text-white px-4 py-3 rounded-xl shadow-2xl border border-slate-700 flex items-center gap-2.5 text-xs sm:text-sm font-semibold toast-slide print:hidden">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
