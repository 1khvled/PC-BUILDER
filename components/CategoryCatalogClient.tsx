"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { OFFERS, PRODUCTS, bestOffer, productImage, type Product } from "@/lib/data/products";
import { LIVE_EXTRA } from "@/lib/data/live";
import Thumb from "./Thumb";
import EmptyState from "./EmptyState";

interface CategoryCatalogClientProps {
  slug: string;
  catLabel: string;
}

type SortOption = "price-asc" | "price-desc" | "name-asc" | "offers-desc";
type ConditionOption = "all" | "new" | "used";

export default function CategoryCatalogClient({ slug, catLabel }: CategoryCatalogClientProps) {
  const [sort, setSort] = useState<SortOption>("price-asc");
  const [condition, setCondition] = useState<ConditionOption>("all");
  const [store, setStore] = useState<string>("all");
  const [search, setSearch] = useState<string>("");
  const [viewMode, setViewMode] = useState<"cards" | "table">("cards");

  const rawProducts = useMemo(() => PRODUCTS.filter((p) => p.category === slug), [slug]);
  const rawExtras = useMemo(() => LIVE_EXTRA.filter((e) => e.category === slug), [slug]);

  // Extract unique stores that exist in this category's offers and extras
  const availableStores = useMemo(() => {
    const storeSet = new Set<string>();
    const catProductIds = new Set(rawProducts.map((p) => p.id));
    for (const o of OFFERS) {
      if (catProductIds.has(o.productId) && o.store) {
        storeSet.add(o.store);
      }
    }
    for (const e of rawExtras) {
      if (e.store) storeSet.add(e.store);
    }
    return Array.from(storeSet).sort();
  }, [rawProducts, rawExtras]);

  // Filter and sort canonical products
  const filteredProducts = useMemo(() => {
    const list = rawProducts.filter((p) => {
      const pOffers = OFFERS.filter((o) => o.productId === p.id);

      // Search filter
      if (search.trim()) {
        const q = search.toLowerCase();
        const specsStr = Object.values(p.specs).join(" ").toLowerCase();
        const matchesName = `${p.brand} ${p.model}`.toLowerCase().includes(q);
        const matchesId = p.id.toLowerCase().includes(q);
        if (!matchesName && !matchesId && !specsStr.includes(q)) return false;
      }

      // Condition filter
      if (condition !== "all") {
        const hasMatchingCondition = pOffers.some((o) => o.condition === condition);
        if (!hasMatchingCondition) return false;
      }

      // Store filter
      if (store !== "all") {
        const hasMatchingStore = pOffers.some((o) => o.store === store);
        if (!hasMatchingStore) return false;
      }

      return true;
    });

    list.sort((a, b) => {
      const bestA = bestOffer(a.id)?.priceDa ?? Infinity;
      const bestB = bestOffer(b.id)?.priceDa ?? Infinity;
      const offersA = OFFERS.filter((o) => o.productId === a.id).length;
      const offersB = OFFERS.filter((o) => o.productId === b.id).length;

      if (sort === "price-asc") return bestA - bestB;
      if (sort === "price-desc") return (bestB === Infinity ? -1 : bestB) - (bestA === Infinity ? -1 : bestA);
      if (sort === "name-asc") return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      if (sort === "offers-desc") return offersB - offersA;
      return 0;
    });

    return list;
  }, [rawProducts, search, condition, store, sort]);

  // Filter extras according to toolbar state
  const filteredExtras = useMemo(() => {
    return rawExtras.filter((e) => {
      if (search.trim()) {
        const q = search.toLowerCase();
        if (!e.title.toLowerCase().includes(q) && !e.store.toLowerCase().includes(q) && !e.wilaya.toLowerCase().includes(q)) {
          return false;
        }
      }
      if (condition !== "all" && e.condition !== condition) return false;
      if (store !== "all" && e.store !== store) return false;
      return true;
    }).sort((a, b) => {
      if (sort === "price-asc") return a.priceDa - b.priceDa;
      if (sort === "price-desc") return b.priceDa - a.priceDa;
      return 0;
    });
  }, [rawExtras, search, condition, store, sort]);

  const resetFilters = () => {
    setSort("price-asc");
    setCondition("all");
    setStore("all");
    setSearch("");
  };

  const isFiltered = search !== "" || condition !== "all" || store !== "all" || sort !== "price-asc";

  return (
    <div className="space-y-6">
      {/* Category Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-1">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900">
              {catLabel}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-[#0b63e5] border border-blue-100">
              {rawProducts.length} modèles canoniques
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Comparez les prix en temps réel parmi les boutiques d&apos;informatique d&apos;Algérie • Relevé en Dinars Algériens (DA)
          </p>
        </div>

        <Link
          href="/builder"
          className="px-4 py-2.5 rounded-xl bg-[#0b63e5] hover:bg-[#094db5] text-white text-xs sm:text-sm font-bold shadow-2xs transition-all card-lift flex items-center gap-2"
        >
          <span>Ouvrir dans le System Builder</span>
          <span>→</span>
        </Link>
      </div>

      {/* Filter / Sort Interactive Toolbar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3.5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          {/* Search inside category */}
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={`Rechercher dans ${catLabel}…`}
              className="w-full bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-[#0b63e5] rounded-xl pl-8 pr-7 py-2 text-xs text-slate-900 outline-none transition-all placeholder:text-slate-400 shadow-2xs"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-2 top-2 text-slate-400 hover:text-slate-600 text-xs p-0.5"
              >
                ✕
              </button>
            )}
          </div>

          {/* View mode toggle: Dense Cards vs Dense Table */}
          <div className="inline-flex rounded-xl border border-slate-200 p-0.5 bg-slate-50 text-xs">
            <button
              onClick={() => setViewMode("cards")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "cards" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Affichage fiches denses"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
              </svg>
              <span>Fiches</span>
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-colors flex items-center gap-1.5 ${
                viewMode === "table" ? "bg-white text-slate-900 shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
              title="Affichage tableau comparatif"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              <span>Tableau</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 text-xs">
          <div className="flex flex-wrap items-center gap-2.5">
            {/* Condition Toggle: All, Neuf, Occasion */}
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
              <button
                onClick={() => setCondition("all")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  condition === "all" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Tous
              </button>
              <button
                onClick={() => setCondition("new")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  condition === "new" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Neuf
              </button>
              <button
                onClick={() => setCondition("used")}
                className={`px-2.5 py-1 rounded-md font-semibold transition-colors ${
                  condition === "used" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Occasion
              </button>
            </div>

            {/* Store Filter Dropdown */}
            {availableStores.length > 0 && (
              <div className="relative flex items-center">
                <select
                  value={store}
                  onChange={(e) => setStore(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 font-medium outline-none cursor-pointer hover:bg-white transition-colors"
                >
                  <option value="all">Toutes les boutiques ({availableStores.length})</option>
                  {availableStores.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Sort Dropdown */}
          <div className="flex items-center gap-2 ml-auto">
            <span className="text-slate-400 font-medium hidden sm:inline">Trier par :</span>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortOption)}
              className="border border-slate-200 rounded-lg px-2.5 py-1 bg-slate-50 text-slate-700 font-semibold outline-none cursor-pointer hover:bg-white transition-colors"
            >
              <option value="price-asc">Prix : croissant (moins cher)</option>
              <option value="price-desc">Prix : décroissant (haut de gamme)</option>
              <option value="name-asc">Nom du produit (A - Z)</option>
              <option value="offers-desc">Nombre d&apos;offres marchands</option>
            </select>

            {isFiltered && (
              <button
                onClick={resetFilters}
                className="text-xs text-rose-600 hover:underline font-semibold ml-1"
                title="Réinitialiser tous les filtres"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Product Catalog Display */}
      {filteredProducts.length > 0 ? (
        viewMode === "cards" ? (
          /* Denser Magazine Cards View */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {filteredProducts.map((p) => {
              const best = bestOffer(p.id);
              const pOffers = OFFERS.filter((o) => o.productId === p.id);
              const specs = Object.entries(p.specs).slice(0, 3);
              const hasNew = pOffers.some((o) => o.condition === "new");
              const hasUsed = pOffers.some((o) => o.condition === "used");

              return (
                <div
                  key={p.id}
                  className="card-lift bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-blue-300 flex flex-col justify-between group transition-all"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-2.5">
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 text-[#0b63e5] border border-blue-100">
                          {p.category}
                        </span>
                        {hasNew && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                            Neuf
                          </span>
                        )}
                        {hasUsed && (
                          <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-amber-50 text-amber-700 border border-amber-100">
                            Occasion
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] font-mono font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                        {pOffers.length} offre{pOffers.length > 1 ? "s" : ""}
                      </span>
                    </div>

                    {/* Image + Title */}
                    <div className="flex items-start gap-3.5">
                      <div className="p-1 rounded-xl bg-slate-50 border border-slate-100 shrink-0 group-hover:scale-105 transition-transform">
                        <Thumb src={productImage(p)} alt={p.model} size={54} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/product/${p.id}`}
                          className="font-bold text-sm text-slate-900 group-hover:text-[#0b63e5] transition-colors block leading-snug"
                        >
                          {p.brand} {p.model}
                        </Link>
                        <div className="text-[11px] text-slate-400 mt-0.5 font-medium">
                          Réf : {p.id}
                        </div>

                        {/* Specs Pills */}
                        <div className="flex flex-wrap gap-1 mt-2">
                          {specs.map(([k, v]) => (
                            <span
                              key={k}
                              className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-medium"
                            >
                              {k}: {String(v)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Action Footer */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-end justify-between gap-2">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        Dès
                      </span>
                      {best ? (
                        <>
                          <div className="text-base font-extrabold text-emerald-700 font-mono tracking-tight">
                            {best.priceDa.toLocaleString("fr-DZ")} DA
                          </div>
                          <div className="text-[11px] text-slate-500 truncate max-w-[170px]">
                            chez <b className="text-slate-700">{best.store}</b> ({best.wilaya})
                          </div>
                        </>
                      ) : (
                        <div className="text-xs text-slate-400 italic">Offres épuisées</div>
                      )}
                    </div>

                    <Link
                      href={`/product/${p.id}`}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#0b63e5] text-white font-semibold text-xs transition-colors shadow-2xs shrink-0 flex items-center gap-1"
                    >
                      <span>Voir offres</span>
                      <span>→</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Dense Table View */
          <div className="bg-white rounded-xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[700px]">
                <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
                  <tr>
                    <th className="text-left px-4 py-3">Produit</th>
                    <th className="text-left px-3 py-3">Spécifications</th>
                    <th className="text-center px-3 py-3">Offres</th>
                    <th className="text-right px-4 py-3">Meilleur Prix</th>
                    <th className="text-left px-4 py-3">Boutique</th>
                    <th className="text-right px-4 py-3 w-28">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-xs">
                  {filteredProducts.map((p) => {
                    const best = bestOffer(p.id);
                    const pOffers = OFFERS.filter((o) => o.productId === p.id);
                    const specs = Object.entries(p.specs).slice(0, 3);

                    return (
                      <tr key={p.id} className="rowline hover:bg-blue-50/40 transition-colors group">
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <Thumb src={productImage(p)} alt={p.model} size={44} />
                            <div className="min-w-0">
                              <Link
                                href={`/product/${p.id}`}
                                className="font-bold text-sm text-[#0b63e5] hover:underline block truncate"
                              >
                                {p.brand} {p.model}
                              </Link>
                              <span className="text-[11px] text-slate-400 font-medium">
                                Réf : {p.id}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-3 py-3.5">
                          <div className="flex flex-wrap gap-1">
                            {specs.map(([k, v]) => (
                              <span
                                key={k}
                                className="text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-medium border border-slate-200/80"
                              >
                                {k}: {String(v)}
                              </span>
                            ))}
                          </div>
                        </td>

                        <td className="px-3 py-3.5 text-center font-mono">
                          <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold text-[11px]">
                            {pOffers.length}
                          </span>
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          {best ? (
                            <div className="font-extrabold text-sm text-slate-900 tabular-nums font-mono">
                              {best.priceDa.toLocaleString("fr-DZ")} DA
                            </div>
                          ) : (
                            <span className="text-slate-300 font-normal">—</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-slate-600">
                          {best ? (
                            <div>
                              <div className="font-semibold text-slate-800 text-xs">{best.store}</div>
                              <div className="text-[11px] text-slate-400">{best.wilaya}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400 italic">Pas d&apos;offre</span>
                          )}
                        </td>

                        <td className="px-4 py-3.5 text-right">
                          <Link
                            href={`/product/${p.id}`}
                            className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs"
                          >
                            Voir offres →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )
      ) : (
        <EmptyState
          type="products"
          title={`Aucun produit trouvé dans ${catLabel}`}
          description="Aucun produit ne correspond à votre filtre de recherche actuel. Réinitialisez les filtres pour afficher tout le catalogue."
          actionText="Réinitialiser les filtres"
          onAction={resetFilters}
        />
      )}

      {/* Live Market Ads (Hors Catalogue) */}
      {filteredExtras.length > 0 && (
        <section className="space-y-3 pt-6 border-t border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                <span>Annonces Live du Marché Algérien</span>
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800">
                  {filteredExtras.length} annonces
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Relevé direct sur Ouedkniss et boutiques partenaires (hors catalogue canonique)
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {filteredExtras.map((e, idx) => (
              <a
                key={idx}
                href={e.url}
                target="_blank"
                rel="noreferrer"
                className="card-lift bg-white rounded-xl p-3.5 border border-slate-200/90 shadow-2xs flex gap-3 items-center group"
              >
                <Thumb src={e.image} alt={e.title} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-semibold text-slate-900 group-hover:text-[#0b63e5] transition-colors truncate">
                    {e.title}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1.5">
                    <span>{e.store}</span>
                    <span>•</span>
                    <span>{e.wilaya}</span>
                    <span>•</span>
                    <span
                      className={`font-bold ${
                        e.condition === "new" ? "text-emerald-700" : "text-amber-700"
                      }`}
                    >
                      {e.condition === "new" ? "Neuf" : "Occasion"}
                    </span>
                  </div>
                  <div className="font-extrabold text-sm text-emerald-700 font-mono mt-1">
                    {e.priceDa.toLocaleString("fr-DZ")} DA
                  </div>
                </div>
                <span className="text-slate-400 group-hover:text-[#0b63e5] text-xs font-bold shrink-0">
                  ↗
                </span>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
