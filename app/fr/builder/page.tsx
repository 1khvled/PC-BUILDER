"use client";

const t = makeT("fr");

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BytekAd from "@/components/BytekAd";
import AskAI from "@/components/AskAI";
import { builderPrompt } from "@/lib/ai/prompt";
import { CATEGORIES, PRODUCTS, bestOffer, isRuptured, productImage, type Product } from "@/lib/data/products";
import { useCatalog } from "@/lib/data/use-offers";
import { checkCompat } from "@/lib/compat/check";
import { makeT } from "@/lib/i18n/runtime";
import BuildPerformanceCard from "@/components/BuildPerformanceCard";
import { recommendedPsu } from "@/lib/compat/watt";
import Thumb from "@/components/Thumb";
import { useAnimatedNumber } from "@/lib/use-animated-number";
import { DEFAULT_USD_DA } from "@/lib/fx";

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
          className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200/70 print:border-slate-300"
        >
          {p}
        </span>
      ))}
    </div>
  );
}

/** Per-row price that counts to its new value instead of snapping. */
function RowPrice({ value }: { value: number }) {
  const display = useAnimatedNumber(value, 250);
  return (
    <div className="font-extrabold text-sm sm:text-base text-slate-900 tabular-nums">
      {Math.round(display).toLocaleString("fr-DZ")} DA
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
      if (cat && id) parsed[cat] = id;
    }
    return Object.keys(parsed).length ? parsed : null;
  } catch {
    return null;
  }
}

export default function BuilderPage() {
  const { products, offers } = useCatalog();
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  // Row that just changed — drives the row-flash micro-animation.
  const [flashCat, setFlashCat] = useState<string | null>(null);

  const triggerFlash = (cat: string) => {
    setFlashCat(cat);
    window.setTimeout(() => {
      setFlashCat((cur) => (cur === cat ? null : cur));
    }, 650);
  };
  // Prerender-identical default first (hydration-safe); the shared URL —
  // then the saved local build — is applied in an effect below.
  const [picks, setPicks] = useState<Record<string, string>>(DEFAULT_BUILD);
  const [selectedOffers, setSelectedOffers] = useState<Record<string, string>>({});
  const isHydratedRef = useRef(false);
  const [modalSort, setModalSort] = useState<"price-asc" | "price-desc" | "name" | "stock">("price-asc");

  // Restore once on mount: handle ?add=..., then ?p=..., then localStorage, then default.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const addParam = params.get("add");
      const fromUrl = parsePicks(params.get("p"));
      const saved = parsePicks(window.localStorage.getItem("dz_builder_picks")) || DEFAULT_BUILD;

      if (addParam) {
        let cat = "";
        let id = "";
        if (addParam.includes(":")) {
          const idx = addParam.indexOf(":");
          cat = addParam.slice(0, idx);
          id = addParam.slice(idx + 1);
        } else {
          const prod = products.find((x) => x.id === addParam) || PRODUCTS.find((x) => x.id === addParam);
          if (prod) {
            cat = prod.category;
            id = prod.id;
          }
        }
        if (cat && id && (products.some((x) => x.id === id) || PRODUCTS.some((x) => x.id === id))) {
          const next = { ...saved, [cat]: id };
          setPicks(next);
          triggerFlash(cat);
          const found = products.find((x) => x.id === id) || PRODUCTS.find((x) => x.id === id);
          if (found) {
            showToast(`✓ ${found.brand} ${found.model} ajouté au configurateur !`);
          }
          return;
        }
      }

      if (fromUrl) {
        setPicks(fromUrl);
        return;
      }

      const localSaved = parsePicks(window.localStorage.getItem("dz_builder_picks"));
      if (localSaved) setPicks(localSaved);
      const savedOffers = JSON.parse(window.localStorage.getItem("dz_builder_offers") || "{}");
      if (savedOffers && typeof savedOffers === "object") setSelectedOffers(savedOffers);
    } catch {
      /* private mode etc. — stay on default */
    } finally {
      isHydratedRef.current = true;
    }
  }, []);
  const [activeModalCat, setActiveModalCat] = useState<string | null>(null);
  const [modalSearch, setModalSearch] = useState("");

  // Vrai dialogue modal : Échap ferme, Tab reste piégé à l'intérieur, et le
  // focus revient sur le bouton d'origine. Il déclarait aria-modal="true" sans
  // rien de tout cela, donc au clavier on sortait dans la page derriere et la
  // fermeture laissait le focus perdu.
  const modalRef = useRef<HTMLDivElement>(null);
  const lastTriggerRef = useRef<HTMLElement | null>(null);

  const openModal = (cat: string, trigger?: HTMLElement) => {
    lastTriggerRef.current = trigger ?? null;
    setActiveModalCat(cat);
  };

  const closeModal = () => {
    setActiveModalCat(null);
    setModalSearch("");
    lastTriggerRef.current?.focus?.();
    lastTriggerRef.current = null;
  };

  useEffect(() => {
    if (!activeModalCat) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        closeModal();
        return;
      }
      if (e.key !== "Tab") return;
      const root = modalRef.current;
      if (!root) return;
      const focusables = Array.from(
        root.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null || el === document.activeElement);
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeModalCat]);

  // Persist every change: the URL stays the shareable source of truth,
  // localStorage keeps the build across revisits.
  useEffect(() => {
    try {
      const s = serializePicks(picks);
      window.history.replaceState(null, "", s ? `/fr/builder?p=${encodeURIComponent(s)}` : "/fr/builder");
      window.localStorage.setItem("dz_builder_picks", s);
    } catch {
      /* noop */
    }
  }, [picks]);

  const build = useMemo(() => {
    const b: Record<string, Product> = {};
    for (const [cat, id] of Object.entries(picks)) {
      if (id) {
        const p = products.find((x) => x.id === id) || PRODUCTS.find((x) => x.id === id);
        if (p) b[cat] = p;
      }
    }
    return b;
  }, [picks, products]);

  const result = useMemo(() => checkCompat(build), [build]);

  const getSlotOffer = (category: string, product: Product | undefined) => {
    if (!product) return undefined;
    const catOffers = offers.filter((o) => o.productId === product.id && !isRuptured(o));
    const allProdOffers = offers.filter((o) => o.productId === product.id);
    const chosenUrl = selectedOffers[category];
    if (chosenUrl) {
      const match = allProdOffers.find((o) => o.url === chosenUrl);
      if (match) return match;
    }
    return catOffers.length > 0 ? catOffers[0] : bestOffer(product.id, offers);
  };

  const handleSelectOffer = (category: string, offerUrl: string) => {
    setSelectedOffers((prev) => ({ ...prev, [category]: offerUrl }));
    triggerFlash(category);
    showToast(t("builder.toastOfferSelected"));
  };

  const total = useMemo(
    () => Object.entries(build).reduce((s, [cat, p]) => s + (getSlotOffer(cat, p)?.priceDa ?? 0), 0),
    [build, offers, selectedOffers]
  );
  const animatedTotal = useAnimatedNumber(total, 300);

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
      const link = window.location.origin + "/fr/builder" + (s ? `?p=${encodeURIComponent(s)}` : "");
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(link)
          .then(() => showToast("✓ Permalien copié — il restaure ce build exact !"))
          .catch(() => fallbackCopy(link));
      } else {
        fallbackCopy(link);
      }
    } catch {
      fallbackCopy(window.location.href);
    }
  };

  const fallbackCopy = (text: string) => {
    try {
      const el = document.createElement("textarea");
      el.value = text;
      el.style.position = "fixed";
      el.style.left = "-999999px";
      document.body.appendChild(el);
      el.focus();
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
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
    triggerFlash(category);
    showToast(`Composant retiré.`);
  };

  const handleSelectPart = (category: string, productId: string) => {
    setPicks((prev) => ({ ...prev, [category]: productId }));
    closeModal();
    triggerFlash(category);
    showToast(`Composant mis à jour.`);
  };

  const handleReset = () => {
    setPicks({});
    setSelectedOffers({});
    try {
      window.localStorage.removeItem("dz_builder_picks");
      window.localStorage.removeItem("dz_builder_offers");
    } catch {}
    showToast(t("builder.toastReset"));
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
            <p className="text-2xl font-black text-slate-900 tracking-tight">
              DZ PartPicker — Devis & Configuration PC
            </p>
            <p className="text-xs text-slate-600 mt-1">
              Comparatif des prix du marché en Dinars Algériens (DA) • 58 Wilayas
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <div suppressHydrationWarning>Date : {new Date().toLocaleDateString("fr-DZ")}</div>
            <div className="text-[10px] text-slate-400">dz-partpicker.dz/builder</div>
          </div>
        </div>
      </div>

      {/* Top Header & Toolbar (Screen Only) */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 print:hidden">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              System Builder
            </h1>
            <span className="text-[11px] px-2.5 py-1 rounded-full font-bold bg-blue-50 text-[#2c87c3] border border-blue-100">
              Configurateur PC
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Prix les plus bas en Algérie relevés quotidiennement • Vérification automatique de compatibilité • 58 wilayas
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("builder.savedLocal")}</span>
            </span>
          </div>
        </div>

        {/* Quick Toolbar with Print Button Next to Copier */}
        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleCopyLink}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-[#2c87c3] hover:text-[#2c87c3] hover:bg-blue-50/50 text-slate-600 rounded-lg font-semibold transition-colors btn-press flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3]"
            title="Copier le lien partageable qui restaure cette sélection"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            <span>Copier le permalien</span>
          </button>

          {/* Print-friendly export button next to Copier */}
          <button
            onClick={handlePrint}
            className="px-3.5 py-2 bg-white border border-slate-200 hover:border-[#2c87c3] hover:text-[#2c87c3] hover:bg-blue-50/50 text-slate-600 rounded-lg font-semibold transition-colors btn-press flex items-center gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3]"
            title="Imprimer ou enregistrer en PDF (fiche optimisée pour impression)"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6 9 6 2 18 2 18 9" />
              <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
              <rect x="6" y="14" width="12" height="8" />
            </svg>
            <span>Imprimer / PDF</span>
          </button>

          <button
            onClick={handleLoadDefault}
            className="hidden sm:inline-flex px-3 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-lg font-medium transition-colors btn-press"
          >
            Exemple Gamer
          </button>
          <button
            onClick={handleReset}
            className="px-3 py-2 bg-white border border-slate-200 hover:text-red-600 hover:border-red-200 hover:bg-red-50/50 text-slate-600 rounded-lg font-medium transition-colors btn-press"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Progression de la configuration — clarté immédiate */}
      <div className="mt-4 panel px-4 py-3.5 print:hidden">
        <div className="flex items-center justify-between gap-3 text-xs font-semibold">
          <span className="text-slate-700 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-[#2c87c3]">
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M12 7v5l3 3" />
              </svg>
            </span>
            {selectedCount} sur {CATEGORIES.length} composants sélectionnés
          </span>
          <span className="text-slate-500 tabular-nums">{Math.round((selectedCount / CATEGORIES.length) * 100)} % complété</span>
        </div>
        <div className="mt-2.5 h-2 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={selectedCount} aria-valuemin={0} aria-valuemax={CATEGORIES.length} aria-label="Progression de la configuration">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2c87c3] to-[#5db2e8] transition-[width] duration-500 ease-out"
            style={{ width: `${(selectedCount / CATEGORIES.length) * 100}%` }}
          />
        </div>
      </div>

      {/* PCPartPicker Green Compatibility Banner */}
      <div
        role="status"
        aria-live="polite"
        className={`mt-3 rounded-xl border p-3.5 sm:p-4 text-sm transition-colors print:border-slate-300 print:bg-white ${
          result.ok
            ? "bg-emerald-50/80 border-emerald-200/80 text-emerald-950"
            : "bg-red-50/80 border-red-200/80 text-red-950"
        }`}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3 font-semibold">
            <span
              key={result.ok ? "ok" : "ko"}
              className={`w-7 h-7 rounded-full flex items-center justify-center text-white text-xs shrink-0 shadow-sm print:border animate-icon-pop ${
                result.ok ? "bg-emerald-600" : "bg-red-600"
              }`}
            >
              {result.ok ? "✓" : "!"}
            </span>
            <span>
              {result.warnings.length === 0
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
          <ul className="mt-3 space-y-1.5 text-xs font-medium print:bg-white">
            {result.warnings.map((w) => (
              <li
                key={w.key}
                className={
                  w.severity === "block"
                    ? "flex gap-2 rounded-lg border border-red-200 bg-red-100/60 p-2.5 text-red-900"
                    : w.severity === "warn"
                      ? "flex gap-2 rounded-lg border border-amber-200 bg-amber-100/60 p-2.5 text-amber-900"
                      : "flex gap-2 rounded-lg border border-slate-200 bg-slate-100/70 p-2.5 text-slate-700"
                }
              >
                <span aria-hidden="true" className="shrink-0 font-black">
                  {w.severity === "block" ? "✕" : w.severity === "warn" ? "!" : "i"}
                </span>
                <span>{t(w.key, w.vars ?? {})}</span>
              </li>
            ))}
          </ul>
        )}

          {/* Performance is a different question from compatibility: a build can be
              perfectly valid and still badly balanced. */}
          <BuildPerformanceCard build={build} />
      </div>

      {/* Main PCPartPicker System Builder Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-card mt-4 print:border-slate-300 print:shadow-none">
        {/* Mobile View: High-Density Ergonomic Component Cards */}
        {/* overflow-hidden moved here (was on the outer wrapper) so the total
            bar below can be position:sticky — an overflow-hidden ancestor is a
            scroll container and would trap the total inside the card stack. */}
        <div className="block md:hidden divide-y divide-slate-100 p-3 space-y-3 print:hidden overflow-hidden rounded-t-xl">
          {CATEGORIES.map((cat, catIdx) => {
            const product = build[cat.slug];
            const activeOffer = product ? getSlotOffer(cat.slug, product) : undefined;
            const best = activeOffer;
            const allProductOffers = product ? offers.filter((o) => o.productId === product.id) : [];
            const otherCount = allProductOffers.length - 1;

            return (
              <div
                key={`mob-builder-${cat.slug}`}
                className={`p-3.5 rounded-xl border transition-all ${
                  product
                    ? "bg-white border-slate-200/90 shadow-sm"
                    : "bg-amber-50/20 border-dashed border-slate-300"
                } ${flashCat === cat.slug ? "animate-row-flash" : ""}`}
              >
                {/* Card Top: Category label */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-md bg-slate-100 text-slate-600 flex items-center justify-center text-xs">
                      <CategoryIcon slug={cat.slug} />
                    </span>
                    <span className="font-extrabold text-xs text-slate-800 uppercase tracking-wider">
                      {cat.label}
                    </span>
                  </div>
                  {product && (
                    <button
                      onClick={() => handleRemovePart(cat.slug)}
                      className="text-xs text-red-500 hover:text-red-700 font-semibold px-2 py-0.5 rounded hover:bg-red-50"
                      aria-label={`Retirer ${cat.label}`}
                    >
                      ✕ Retirer
                    </button>
                  )}
                </div>

                {/* Card Body: Selected Product or Empty State */}
                {product ? (
                  <div className="pt-2.5 space-y-2">
                    <div className="flex items-start gap-3">
                      <Thumb src={productImage(product)} alt={product.model} size={48} />
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/fr/product/${product.id}`}
                          className="font-bold text-sm text-[#2c87c3] hover:underline truncate block"
                        >
                          {product.brand} {product.model}
                        </Link>
                        <SpecPills product={product} />
                      </div>
                    </div>

                    {/* Price & Merchant */}
                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs">
                      <div>
                        {best ? (
                          <div className="space-y-0.5">
                            <a
                              href={best.url}
                              target="_blank"
                              rel="noreferrer"
                              className="font-semibold text-slate-700 hover:text-[#2c87c3] text-[11px] block truncate"
                            >
                              🏪 {best.store} · {best.wilaya}
                            </a>
                            <div className="flex items-center gap-1.5">
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {best.condition === "new" ? "Neuf" : "Occasion"}
                              </span>
                              {otherCount > 0 && (
                                <Link
                                  href={`/fr/product/${product.id}`}
                                  className="text-[10px] text-slate-400 hover:underline"
                                >
                                  +{otherCount} offre{otherCount > 1 ? "s" : ""}
                                </Link>
                              )}
                            </div>
                            {allProductOffers.length > 1 && (
                              <div className="pt-1.5">
                                <label htmlFor={`mob-offer-${cat.slug}`} className="text-[10px] text-slate-400 font-bold block mb-1">
                                  {t("builder.pickOffer")}
                                </label>
                                <select
                                  id={`mob-offer-${cat.slug}`}
                                  value={activeOffer?.url || ""}
                                  onChange={(e) => handleSelectOffer(cat.slug, e.target.value)}
                                  className="w-full text-[11px] font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded px-2 py-1.5 focus:outline-none focus:border-[#2c87c3]"
                                >
                                  {allProductOffers.map((o) => (
                                    <option key={o.url} value={o.url}>
                                      {o.priceDa.toLocaleString("fr-DZ")} DA — {o.store} ({o.wilaya}) [{o.condition === "new" ? "Neuf" : "Occasion"}]
                                    </option>
                                  ))}
                                </select>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-slate-400 text-xs">Prix non disponible</span>
                        )}
                      </div>

                      <div className="text-right shrink-0">
                        {best ? (
                          <div className="text-base font-black text-emerald-700 tabular-nums">
                            {best.priceDa.toLocaleString("fr-DZ")} DA
                          </div>
                        ) : (
                          <span className="text-slate-300 font-normal">—</span>
                        )}
                        <button
                          onClick={(e) => openModal(cat.slug, e.currentTarget)}
                          className="text-xs text-[#2c87c3] hover:underline font-bold mt-0.5 block"
                        >
                          Changer
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="pt-3 pb-1 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-400 italic">
                      Aucun composant sélectionné
                    </span>
                    <button
                      onClick={(e) => openModal(cat.slug, e.currentTarget)}
                      className="btn-blue px-4 py-2 text-xs font-bold min-h-[38px] touch-manipulation"
                    >
                      + Choisir
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Desktop View: Main PCPartPicker System Builder Table */}
        <div className="hidden md:block overflow-x-auto overflow-y-hidden rounded-t-xl print:block">
          <table className="w-full text-sm min-w-[860px] border-collapse">
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none print:bg-slate-100 print:text-slate-700">
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
                const activeOffer = product ? getSlotOffer(cat.slug, product) : undefined;
                const best = activeOffer;
                const allProductOffers = product ? offers.filter((o) => o.productId === product.id) : [];
                const otherCount = allProductOffers.length - 1;

                return (
                  <tr
                    key={cat.slug}
                    className={`transition-colors group print:hover:bg-transparent ${product ? "" : "bg-amber-50/30"} hover:bg-blue-50/40 ${flashCat === cat.slug ? "animate-row-flash" : ""}`}
                  >
                    {/* Component Column */}
                    <td className="px-4 py-3.5 align-top">
                      <div className="flex items-center gap-2.5">
                        <span className="w-8 h-8 rounded-lg bg-slate-100 group-hover:bg-gradient-to-b group-hover:from-[#3a94d2] group-hover:to-[#2c87c3] group-hover:text-white group-hover:shadow-[0_4px_10px_-4px_rgba(44,135,195,0.5)] flex items-center justify-center text-slate-500 transition-all shrink-0 print:border print:border-slate-200" aria-hidden="true">
                          {product ? <CategoryIcon slug={cat.slug} /> : <span className="text-xs font-extrabold tabular-nums">{catIdx + 1}</span>}
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
                              href={`/fr/product/${product.id}`}
                              className="font-bold text-sm text-[#2c87c3] hover:text-[#1e5c85] hover:underline truncate block print:text-slate-900"
                            >
                              {product.brand} {product.model}
                            </Link>
                            <SpecPills product={product} />
                          </div>
                        </div>
                      ) : (
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-11 h-11 rounded-lg border border-dashed border-slate-300 bg-slate-50 flex items-center justify-center text-slate-400 print:hidden">
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
                        <RowPrice value={best.priceDa} />
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
                            className="font-semibold text-[#2c87c3] hover:underline block truncate print:text-slate-900"
                          >
                            {best.store} · {best.wilaya}
                          </a>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="inline-block text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200/70 print:border print:border-emerald-200">
                              {best.condition === "new" ? "Neuf" : "Occasion"}
                            </span>
                            {otherCount > 0 && (
                              <Link
                                href={`/fr/product/${product!.id}`}
                                className="text-[11px] text-slate-400 hover:text-slate-600 underline print:hidden"
                              >
                                +{otherCount} offre{otherCount > 1 ? "s" : ""}
                              </Link>
                            )}
                          </div>
                          {allProductOffers.length > 1 && (
                            <div className="mt-1.5 print:hidden">
                              <select
                                value={activeOffer?.url || ""}
                                onChange={(e) => handleSelectOffer(cat.slug, e.target.value)}
                                className="text-[11px] font-medium text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded px-2 py-1 focus:outline-none focus:border-[#2c87c3] max-w-[210px] truncate cursor-pointer"
                                title={t("builder.pickOffer")}
                              >
                                {allProductOffers.map((o) => (
                                  <option key={o.url} value={o.url}>
                                    {o.priceDa.toLocaleString("fr-DZ")} DA — {o.store} ({o.wilaya}) [{o.condition === "new" ? "Neuf" : "Occasion"}]
                                  </option>
                                ))}
                              </select>
                            </div>
                          )}
                        </div>
                      ) : (
                        <button
                          onClick={(e) => openModal(cat.slug, e.currentTarget)}
                          className="btn-blue px-3.5 py-1.5 text-xs print:hidden"
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
                            onClick={(e) => openModal(cat.slug, e.currentTarget)}
                            className="px-2.5 py-1.5 sm:py-1 text-[11px] font-semibold text-slate-600 hover:text-[#2c87c3] hover:bg-blue-50 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3] transition-colors btn-press"
                            title="Changer de composant"
                          >
                            Changer
                          </button>
                          <button
                            onClick={() => handleRemovePart(cat.slug)}
                            className="w-8 h-8 sm:w-7 sm:h-7 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center font-bold text-sm transition-colors btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500"
                            title="Retirer de la configuration"
                            aria-label={`Retirer ${cat.label}`}
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={(e) => openModal(cat.slug, e.currentTarget)}
                          className="text-[#2c87c3] hover:text-[#1e5c85] hover:underline underline-offset-4 text-xs font-bold focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3] rounded btn-press"
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
        {/* Mobile: sticks 64px up (clear of the fixed bottom nav) so the running
            total stays visible while scrolling a ~4000px card stack.
            Desktop: plain static bar, as before. Print: forced static. */}
        <div className="sticky bottom-16 md:static z-10 relative overflow-hidden flex flex-wrap items-center justify-between gap-4 px-5 py-4 bg-gradient-to-r from-[#11111c] via-[#181a2e] to-[#11111c] text-white rounded-b-xl border-t border-slate-800 print:static print:bg-slate-100 print:bg-none print:text-slate-900 print:border-slate-300 print:rounded-none">
          <div className="absolute inset-0 dz-hero-grid opacity-40 pointer-events-none print:hidden" aria-hidden="true" />
          <div className="relative flex items-baseline gap-3 flex-wrap text-sm">
            <span className="text-slate-400 print:text-slate-600 font-medium">
              {selectedCount} sur {CATEGORIES.length} pièces :
            </span>
            <span
              className="text-xl sm:text-2xl font-extrabold tracking-tight text-white print:text-slate-900 tabular-nums"
            >
              {Math.round(animatedTotal).toLocaleString("fr-DZ")} DA
            </span>
            <span className="text-slate-400 print:text-slate-500 text-xs">
              ≈ ${Math.round(animatedTotal / DEFAULT_USD_DA).toLocaleString()} USD
            </span>
            <span className="text-slate-500 text-xs hidden sm:inline">
              • {result.wattage}W estimés
            </span>
          </div>

          <div className="relative flex items-center gap-2 text-xs font-semibold ml-auto print:hidden">
            <button
              onClick={handlePrint}
              className="px-3.5 py-2 rounded-lg bg-white/10 hover:bg-white/15 border border-white/10 text-white font-bold transition-colors btn-press flex items-center gap-1.5"
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
              className="px-4 py-2 rounded-lg bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-white font-bold transition-colors btn-press shadow-[0_4px_14px_-4px_rgba(16,185,129,0.6)] flex items-center gap-1.5"
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
        Format réplique de pcpartpicker.com/list adapté pour l'Algérie. Les colonnes US (Base, Promo, Tax) sont adaptées en (Prix DA, Disponibilité, Marchand 58 wilayas). Le tri est 100% organique par prix croissant.
      </p>

      {/* Component Picker Modal */}
      {activeModalCat && (
        <div className="fixed inset-0 bg-slate-950/75 flex items-center justify-center p-4 z-50 print:hidden animate-backdrop-fade" onClick={closeModal}>
          <div ref={modalRef} role="dialog" aria-modal="true" aria-label={`Choisir un composant : ${CATEGORIES.find((c) => c.slug === activeModalCat)?.label ?? activeModalCat}`} className="bg-white rounded-2xl w-full max-w-2xl max-h-[85vh] flex flex-col shadow-pop border border-slate-200/80 overflow-hidden animate-modal-pop" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-200 flex items-center justify-between gap-3 bg-gradient-to-b from-slate-50 to-white">
              <div className="flex items-center gap-3">
                <span className="w-9 h-9 rounded-xl bg-gradient-to-b from-[#3a94d2] to-[#2c87c3] text-white flex items-center justify-center shadow-[0_4px_12px_-4px_rgba(44,135,195,0.5)] shrink-0">
                  <CategoryIcon slug={activeModalCat} />
                </span>
                <div>
                  <h3 className="font-extrabold text-base text-slate-900">
                    Choisir : {CATEGORIES.find((c) => c.slug === activeModalCat)?.label}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Sélectionnez parmi les produits indexés en Algérie
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                aria-label="Changer de composant"
                className="w-10 h-10 shrink-0 rounded-lg hover:bg-slate-200 text-slate-500 flex items-center justify-center font-bold btn-press transition-colors"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>

            {/* Modal Quick Catalog Link */}
            <div className="px-4 py-2 bg-slate-50/70 border-b border-slate-200/70 flex items-center justify-between text-xs">
              <span className="text-slate-500 font-medium">
                {(products.length ? products : PRODUCTS).filter((p) => p.category === activeModalCat).length} modèles indexés
              </span>
              <Link
                href={`/fr/category/${activeModalCat}`}
                onClick={closeModal}
                className="text-[#2c87c3] hover:underline font-semibold flex items-center gap-1"
              >
                <span>Explorer tout le catalogue avec filtres</span>
                <span aria-hidden="true">→</span>
              </Link>
            </div>

            {/* Modal Search Bar & Sorting */}
            <div className="p-3 border-b border-slate-100 bg-white flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
              <input
                type="text"
                value={modalSearch}
                onChange={(e) => setModalSearch(e.target.value)}
                placeholder="Filtrer par marque, modèle…"
                className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2.5 min-h-[44px] text-base sm:text-xs text-slate-800 outline-none focus:border-[#2c87c3] focus:bg-white focus:shadow-[0_0_0_3px_rgba(44,135,195,0.15)] transition-all"
                autoFocus
              />
              <div className="flex items-center gap-1.5 shrink-0">
                <label htmlFor="modal-sort-select-fr" className="text-[11px] font-bold uppercase tracking-wider text-slate-400 hidden sm:inline">
                  {t("builder.sortBy")}
                </label>
                <select
                  id="modal-sort-select-fr"
                  value={modalSort}
                  onChange={(e) => setModalSort(e.target.value as never)}
                  className="w-full sm:w-auto text-xs font-semibold text-slate-700 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-2 min-h-[44px] focus:outline-none focus:border-[#2c87c3]"
                >
                  <option value="price-asc">💰 {t("builder.sortPriceAsc")}</option>
                  <option value="price-desc">💎 {t("builder.sortPriceDesc")}</option>
                  <option value="name">🔤 {t("builder.sortName")}</option>
                  <option value="stock">✓ {t("builder.sortStock")}</option>
                </select>
              </div>
            </div>

            {/* Modal Product List */}
            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2.5">
              {(products.length ? products : PRODUCTS).filter((p) => p.category === activeModalCat)
                .filter((p) => {
                  if (!modalSearch.trim()) return true;
                  const q = modalSearch.toLowerCase();
                  return `${p.brand} ${p.model}`.toLowerCase().includes(q);
                })
                .sort((a, b) => {
                  const aBest = bestOffer(a.id, offers)?.priceDa ?? Infinity;
                  const bBest = bestOffer(b.id, offers)?.priceDa ?? Infinity;
                  const aInStock = offers.some((o) => o.productId === a.id && !isRuptured(o));
                  const bInStock = offers.some((o) => o.productId === b.id && !isRuptured(o));

                  if (modalSort === "price-asc") return aBest - bBest;
                  if (modalSort === "price-desc") return bBest - aBest;
                  if (modalSort === "name") return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
                  if (modalSort === "stock") return (bInStock ? 1 : 0) - (aInStock ? 1 : 0) || aBest - bBest;
                  return 0;
                })
                .map((product) => {
                  const pOffers = offers.filter((o) => o.productId === product.id);
                  const hasInStock = pOffers.some((o) => !isRuptured(o));
                  const isRupturedProduct = pOffers.length > 0 && !hasInStock;
                  const best = bestOffer(product.id, offers);
                  const isCurrent = picks[activeModalCat] === product.id;

                  return (
                    <div
                      key={product.id}
                      className={`p-3 rounded-xl mb-1 flex items-center gap-3 transition-colors ${
                        isCurrent
                          ? "bg-blue-50/80 border border-blue-200"
                          : isRupturedProduct
                          ? "bg-slate-50/70 hover:bg-rose-50/30 border border-transparent"
                          : "hover:bg-slate-50 border border-transparent"
                      }`}
                    >
                      <div className="relative shrink-0">
                        <Thumb src={productImage(product)} alt={product.model} size={52} />
                        {isRupturedProduct && (
                          <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                            <span className="bg-rose-600 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded shadow">
                              Épuisé
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-sm text-slate-900">
                            {product.brand} {product.model}
                          </span>
                          {isRupturedProduct && (
                            <span className="px-1.5 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold border border-rose-200">
                              ✕ Rupture
                            </span>
                          )}
                          {!isRupturedProduct && hasInStock && (
                            <span className="px-1.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                              ✓ En stock
                            </span>
                          )}
                        </div>
                        <SpecPills product={product} />
                        <div className="text-xs text-slate-500 mt-1">
                          {best ? (
                            isRupturedProduct ? (
                              <span>
                                Dernier prix : <span className="line-through text-slate-400">{best.priceDa.toLocaleString("fr-DZ")} DA</span>{" "}
                                <b className="text-rose-600 font-semibold">(Rupture chez {best.store})</b>
                              </span>
                            ) : (
                              <span>
                                dès <b className="text-emerald-700 font-bold">{best.priceDa.toLocaleString("fr-DZ")} DA</b> chez {best.store} ({best.wilaya})
                              </span>
                            )
                          ) : (
                            <span className="text-slate-400 italic">Pas d'offre indexée</span>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={() => handleSelectPart(activeModalCat, product.id)}
                        className={`px-3.5 py-1.5 rounded-lg text-xs font-bold shrink-0 transition-colors btn-press focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3] ${
                          isCurrent
                            ? "bg-slate-200 text-slate-700 cursor-default"
                            : isRupturedProduct
                            ? "bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200"
                            : "btn-blue"
                        }`}
                      >
                        {isCurrent ? "Sélectionné" : isRupturedProduct ? "Choisir (Rupture)" : "Choisir"}
                      </button>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}

      <div className="print:hidden">
        <BytekAd variant="peripherals" locale="fr" placement="fr-builder-peripherals" />
      </div>
      <div className="print:hidden">
        <AskAI
          locale="fr"
          placement="fr-builder-ai"
          prompt={builderPrompt({
            parts: Object.values(build).map((p) => `${p.brand} ${p.model}`),
            total,
            locale: "fr",
          })}
        />
      </div>

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div key={toastMessage} className="fixed bottom-6 right-6 sm:right-10 z-50 bg-[#11111c] text-white px-4 py-3 rounded-xl shadow-pop border border-white/10 flex items-center gap-2.5 text-xs sm:text-sm font-semibold print:hidden animate-toast-in">
          <span className="w-2 h-2 rounded-full bg-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}
    </main>
  );
}
