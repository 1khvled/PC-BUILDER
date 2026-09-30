"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { type Prebuilt, evaluatePrebuilt } from "@/lib/data/prebuilds";
import { type Offer } from "@/lib/data/products";

interface PrebuildsClientProps {
  prebuilds: Prebuilt[];
  offers: Offer[];
}

export default function PrebuildsClient({ prebuilds, offers }: PrebuildsClientProps) {
  const [search, setSearch] = useState("");
  const [cpuBrand, setCpuBrand] = useState<"all" | "AMD" | "Intel">("all");
  const [gpuFilter, setGpuFilter] = useState<"all" | "rtx40" | "rtx30" | "radeon" | "igpu">("all");
  const [selectedWilaya, setSelectedWilaya] = useState("all");
  const [dealOnly, setDealOnly] = useState(false);
  const [sortBy, setSortBy] = useState<"price-asc" | "price-desc" | "savings">("price-asc");

  // Wilaya list
  const wilayas = useMemo(() => {
    const set = new Set<string>();
    prebuilds.forEach((p) => {
      if (p.wilaya) set.add(p.wilaya);
    });
    return Array.from(set).sort();
  }, [prebuilds]);

  // Evaluated prebuilds with price comparisons
  const evaluated = useMemo(() => {
    return prebuilds.map((p) => {
      const valuation = evaluatePrebuilt(p, offers);
      return { ...p, valuation };
    });
  }, [prebuilds, offers]);

  // Filtered & sorted
  const filtered = useMemo(() => {
    return evaluated
      .filter((item) => {
        // Text search
        if (search.trim()) {
          const q = search.toLowerCase();
          const matchTitle = item.title.toLowerCase().includes(q);
          const matchStore = item.store.toLowerCase().includes(q);
          const matchCpu = item.specs.cpu.name.toLowerCase().includes(q);
          const matchGpu = item.specs.gpu.name.toLowerCase().includes(q);
          if (!matchTitle && !matchStore && !matchCpu && !matchGpu) return false;
        }

        // CPU Brand
        if (cpuBrand !== "all" && item.specs.cpu.brand !== cpuBrand) {
          return false;
        }

        // GPU Filter
        if (gpuFilter !== "all") {
          const gName = item.specs.gpu.name.toLowerCase();
          const gId = item.specs.gpu.id;
          if (gpuFilter === "igpu" && gId !== "igpu") return false;
          if (gpuFilter === "rtx40" && !gName.includes("40")) return false;
          if (gpuFilter === "rtx30" && !gName.includes("30")) return false;
          if (gpuFilter === "radeon" && !gName.includes("rx") && !gName.includes("90")) return false;
        }

        // Wilaya
        if (selectedWilaya !== "all" && item.wilaya !== selectedWilaya) {
          return false;
        }

        // Deals only (cheaper than building parts)
        if (dealOnly && item.valuation.savings <= 0) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.priceDa - b.priceDa;
        if (sortBy === "price-desc") return b.priceDa - a.priceDa;
        if (sortBy === "savings") return b.valuation.savings - a.valuation.savings;
        return 0;
      });
  }, [evaluated, search, cpuBrand, gpuFilter, selectedWilaya, dealOnly, sortBy]);

  return (
    <div className="space-y-6">
      {/* Information Alert */}
      <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl p-4 sm:p-5 flex items-start gap-3.5 text-blue-950 text-xs sm:text-sm">
        <span className="text-xl shrink-0">ℹ️</span>
        <div className="space-y-1">
          <p className="font-bold text-blue-900">
            Comparatif Intelligent : PC Monté vs Pièces Détachées
          </p>
          <p className="text-blue-800/90 leading-relaxed text-xs">
            Les <strong>4 composants vitaux (CPU, Carte Graphique, Carte Mère et RAM)</strong> sont
            rigoureusement appariés à notre base de données pour calculer le coût réel des pièces
            séparées dans les magasins algériens. Le boîtier et le stockage sont valorisés au prix standard du marché.
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-4 sm:p-5 space-y-4 shadow-sm">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Search Input */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Rechercher un modèle
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Ex: Ryzen 5, RTX 4060, B550..."
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2c87c3]"
            />
          </div>

          {/* CPU Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Processeur (CPU)
            </label>
            <div className="flex rounded-lg border border-slate-200 overflow-hidden text-xs">
              <button
                type="button"
                onClick={() => setCpuBrand("all")}
                className={`flex-1 py-2 font-semibold transition-colors ${
                  cpuBrand === "all" ? "bg-slate-900 text-white" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                Tous
              </button>
              <button
                type="button"
                onClick={() => setCpuBrand("AMD")}
                className={`flex-1 py-2 font-semibold transition-colors border-l border-slate-200 ${
                  cpuBrand === "AMD" ? "bg-red-600 text-white" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                AMD
              </button>
              <button
                type="button"
                onClick={() => setCpuBrand("Intel")}
                className={`flex-1 py-2 font-semibold transition-colors border-l border-slate-200 ${
                  cpuBrand === "Intel" ? "bg-blue-600 text-white" : "hover:bg-slate-50 text-slate-700"
                }`}
              >
                Intel
              </button>
            </div>
          </div>

          {/* GPU Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Carte Graphique (GPU)
            </label>
            <select
              value={gpuFilter}
              onChange={(e) => setGpuFilter(e.target.value as never)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2c87c3] bg-white"
            >
              <option value="all">Toutes les cartes</option>
              <option value="rtx40">GeForce RTX 40 Series</option>
              <option value="rtx30">GeForce RTX 30 Series</option>
              <option value="radeon">AMD Radeon RX</option>
              <option value="igpu">Graphiques intégrés (APU)</option>
            </select>
          </div>

          {/* Wilaya Filter */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1">
              Wilaya boutique
            </label>
            <select
              value={selectedWilaya}
              onChange={(e) => setSelectedWilaya(e.target.value)}
              className="w-full text-xs sm:text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:border-[#2c87c3] bg-white"
            >
              <option value="all">Toutes les wilayas ({wilayas.length})</option>
              {wilayas.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Bottom Bar: Deal Toggle & Sort */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-xs">
          <label className="flex items-center gap-2 cursor-pointer select-none font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={dealOnly}
              onChange={(e) => setDealOnly(e.target.checked)}
              className="w-4 h-4 rounded border-slate-300 text-[#2c87c3] focus:ring-[#2c87c3]"
            />
            <span>🔥 Afficher uniquement les bonnes affaires (moins cher que les pièces)</span>
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">Trier par :</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as never)}
              className="px-2.5 py-1.5 rounded-lg border border-slate-200 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="price-asc">Prix croissant</option>
              <option value="price-desc">Prix décroissant</option>
              <option value="savings">Meilleure économie</option>
            </select>
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between text-xs text-slate-500 font-medium px-1">
        <span>
          {filtered.length} unité(s) centrale(s) gamer trouvée(s)
        </span>
        <span>Relevé en direct des boutiques algériennes</span>
      </div>

      {/* Grid of Prebuilt Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((item) => {
          const { valuation, specs } = item;
          const isDeal = valuation.savings > 0;

          return (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-slate-200 hover:border-[#2c87c3] transition-all p-5 flex flex-col justify-between space-y-4 shadow-sm group hover:shadow-md relative overflow-hidden"
            >
              {/* Card Top: Store and Wilaya Badge */}
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="font-bold text-xs text-slate-800 truncate" title={item.store}>
                      {item.store}
                    </span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 shrink-0">
                    📍 {item.wilaya}
                  </span>
                </div>

                {/* Prebuilt Title */}
                <h3 className="font-extrabold text-slate-900 group-hover:text-[#2c87c3] transition-colors text-sm line-clamp-2 leading-snug">
                  {item.title}
                </h3>

                {/* Core Specs Chips */}
                <div className="space-y-2 pt-1 border-t border-slate-100">
                  <div className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                    Configuration Principale :
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {/* CPU Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-800 border border-slate-200/80">
                      <span>🧠</span>
                      <span>{specs.cpu.name}</span>
                    </span>

                    {/* GPU Chip */}
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded border ${
                        specs.gpu.id === "igpu"
                          ? "bg-amber-50 text-amber-800 border-amber-200"
                          : "bg-blue-50 text-blue-900 border-blue-200"
                      }`}
                    >
                      <span>🎮</span>
                      <span>{specs.gpu.name}</span>
                    </span>

                    {/* Mobo Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200/80">
                      <span>🔌</span>
                      <span>{specs.mobo.name}</span>
                    </span>

                    {/* RAM Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200/80">
                      <span>⚡</span>
                      <span>{specs.ram.name}</span>
                    </span>

                    {/* Storage Chip */}
                    <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded bg-slate-50 text-slate-700 border border-slate-200/80">
                      <span>💾</span>
                      <span>{specs.storage.name}</span>
                    </span>
                  </div>
                </div>

                {/* Price Valuation Breakdown */}
                <div className="bg-slate-50 rounded-lg p-3 space-y-1.5 border border-slate-200/70 text-xs">
                  <div className="flex items-center justify-between text-slate-500 text-[11px]">
                    <span>Prix des pièces séparées :</span>
                    <span className="font-semibold tabular-nums">
                      {valuation.partsSum.toLocaleString("fr-DZ")} DA
                    </span>
                  </div>

                  <div className="flex items-center justify-between font-bold">
                    <span>Prix PC Monté boutique :</span>
                    <span className="text-sm text-slate-900 tabular-nums">
                      {item.priceDa.toLocaleString("fr-DZ")} DA
                    </span>
                  </div>

                  {/* Savings / Delta Badge */}
                  <div className="pt-1 border-t border-slate-200/60 flex items-center justify-between text-[11px]">
                    <span className="text-slate-500">Différence :</span>
                    {isDeal ? (
                      <span className="font-black text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                        🔥 Économie : −{valuation.savings.toLocaleString("fr-DZ")} DA
                      </span>
                    ) : (
                      <span className="font-semibold text-slate-600">
                        +{valuation.delta.toLocaleString("fr-DZ")} DA (Montage & marge)
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  {/* Open in Builder Button */}
                  <Link
                    href={valuation.builderUrl}
                    className="flex-1 py-2 px-3 rounded-lg bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs font-bold transition-colors text-center flex items-center justify-center gap-1.5 shadow-sm"
                  >
                    <span>Ouvrir dans Builder</span>
                    <span>→</span>
                  </Link>

                  {/* Store Link */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors shrink-0 flex items-center gap-1"
                    title="Voir l'annonce boutique sur Ouedkniss"
                  >
                    <span>Boutique</span>
                    <span>↗</span>
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200 space-y-3">
          <p className="text-3xl">🔍</p>
          <p className="font-bold text-slate-800">Aucun PC monté ne correspond à ces critères</p>
          <p className="text-xs text-slate-500">Essayez de réinitialiser vos filtres ou votre terme de recherche.</p>
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setCpuBrand("all");
              setGpuFilter("all");
              setSelectedWilaya("all");
              setDealOnly(false);
            }}
            className="px-4 py-2 rounded-lg bg-[#2c87c3] text-white text-xs font-bold hover:bg-[#1e5c85]"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}
