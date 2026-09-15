"use client";

import { useMemo, useState } from "react";
import { isRuptured, type Offer } from "@/lib/data/products";
import Thumb from "./Thumb";
import EmptyState from "./EmptyState";

interface ProductOffersTableProps {
  offers: Offer[];
}

type SortField = "price" | "store" | "condition" | "wilaya" | "stock";

// Availability rank: confirmed in-stock first, unknown stock second, ruptures last.
function stockRank(o: Offer): number {
  if (isRuptured(o)) return 2;
  return o.stock === "En stock" ? 0 : 1;
}
type SortDir = "asc" | "desc";

export default function ProductOffersTable({ offers }: ProductOffersTableProps) {
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [conditionFilter, setConditionFilter] = useState<"all" | "new" | "used">("all");
  const [search, setSearch] = useState("");
  const [hideRuptured, setHideRuptured] = useState(true);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const rupturedCount = useMemo(() => offers.filter(isRuptured).length, [offers]);
  const visibleOffers = useMemo(
    () => (hideRuptured ? offers.filter((o) => !isRuptured(o)) : offers),
    [offers, hideRuptured]
  );

  const filteredAndSortedOffers = useMemo(() => {
    const list = visibleOffers.filter((o) => {
      if (conditionFilter !== "all" && o.condition !== conditionFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const match =
          o.store.toLowerCase().includes(q) ||
          o.wilaya.toLowerCase().includes(q) ||
          o.titleRaw.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "price") {
        cmp = a.priceDa - b.priceDa;
      } else if (sortField === "store") {
        cmp = a.store.localeCompare(b.store);
      } else if (sortField === "condition") {
        cmp = a.condition.localeCompare(b.condition);
      } else if (sortField === "wilaya") {
        cmp = a.wilaya.localeCompare(b.wilaya);
      } else if (sortField === "stock") {
        cmp = stockRank(a) - stockRank(b);
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [visibleOffers, conditionFilter, search, sortField, sortDir]);

  const newCount = useMemo(() => visibleOffers.filter((o) => o.condition === "new").length, [visibleOffers]);
  const usedCount = useMemo(() => visibleOffers.filter((o) => o.condition === "used").length, [visibleOffers]);

  // Stats ignore ruptures: a shown-but-dead listing must never set the
  // min/avg/écart or win the "Meilleur prix" badge. Falls back to all
  // visible offers only when every one of them is ruptured.
  const statsBase = useMemo(() => {
    const live = filteredAndSortedOffers.filter((o) => !isRuptured(o));
    return { list: live.length > 0 ? live : filteredAndSortedOffers, live: live.length > 0 };
  }, [filteredAndSortedOffers]);

  const stats = useMemo(() => {
    if (statsBase.list.length === 0) return null;
    const prices = statsBase.list.map((o) => o.priceDa);
    const min = Math.min(...prices);
    const sorted = [...prices].sort((a, b) => a - b);
    const avg = sorted[Math.floor(sorted.length / 2)]; // médiane
    const max = Math.max(...prices);
    return { min, avg, max };
  }, [statsBase]);

  return (
    <div className="bg-white rounded shadow-sm border border-slate-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-600 mr-1">
            Offres Marchands ({filteredAndSortedOffers.length})
          </span>
          <div className="inline-flex rounded border border-slate-200 bg-white p-0.5 text-xs" role="group" aria-label="Filtrer par état">
            <button
              onClick={() => setConditionFilter("all")}
              aria-pressed={conditionFilter === "all"}
              className={`px-3 py-1.5 rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3] ${
                conditionFilter === "all" ? "bg-slate-900 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Tous ({offers.length})
            </button>
            <button
              onClick={() => setConditionFilter("new")}
              aria-pressed={conditionFilter === "new"}
              className={`px-3 py-1.5 rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${
                conditionFilter === "new" ? "bg-emerald-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
              }`}
            >
              Neuf ({newCount})
            </button>
            {usedCount > 0 && (
              <button
                onClick={() => setConditionFilter("used")}
                aria-pressed={conditionFilter === "used"}
                className={`px-3 py-1.5 rounded font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600 ${
                  conditionFilter === "used" ? "bg-amber-600 text-white" : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                }`}
              >
                Occasion ({usedCount})
              </button>
            )}
          </div>
          {rupturedCount > 0 && (
            <button
              onClick={() => setHideRuptured((v) => !v)}
              aria-pressed={hideRuptured}
              title="Les ruptures restent consultables mais ne polluent plus le comparatif"
              className={`ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-semibold border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2c87c3] ${
                hideRuptured ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:border-slate-300"
              }`}
            >
              <span className={`size-1.5 rounded-full ${hideRuptured ? "bg-slate-400" : "bg-red-500"}`} />
              <span>{hideRuptured ? `Ruptures masquées (${rupturedCount})` : "Afficher les ruptures"}</span>
            </button>
          )}
        </div>

        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Médiane : <b className="text-slate-800">{stats.avg.toLocaleString("fr-DZ")} DA</b></span>
              <span className="text-slate-300">•</span>
              <span>Écart : <b>{(stats.max - stats.min).toLocaleString("fr-DZ")} DA</b></span>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer boutique ou wilaya…"
              aria-label="Filtrer les offres par boutique ou wilaya"
              className="border border-slate-200 rounded pl-8 pr-3 py-2 text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#2c87c3] focus:ring-2 focus:ring-[#2c87c3]/25 w-48 sm:w-56"
            />
            <svg
              className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2 pointer-events-none"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </div>
        </div>
      </div>

      {/* Sortable Table */}
      {filteredAndSortedOffers.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[640px]">
            <caption className="sr-only">Comparatif des offres marchands triées par prix croissant en Dinars Algériens</caption>
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-600 border-b border-slate-200 select-none sticky top-0">
              <tr>
                <th
                  scope="col"
                  aria-sort={sortField === "store" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  onClick={() => handleSort("store")}
                  className="text-left px-4 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors focus-visible:outline-none focus-visible:bg-blue-50"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Marchand / Boutique</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "store" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "wilaya" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  onClick={() => handleSort("wilaya")}
                  className="text-left px-3 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors focus-visible:outline-none focus-visible:bg-blue-50"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Wilaya</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "wilaya" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "condition" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  onClick={() => handleSort("condition")}
                  className="text-center px-3 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors focus-visible:outline-none focus-visible:bg-blue-50"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>État</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "condition" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "stock" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  onClick={() => handleSort("stock")}
                  className="text-left px-3 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors focus-visible:outline-none focus-visible:bg-blue-50"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Disponibilité</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "stock" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  scope="col"
                  aria-sort={sortField === "price" ? (sortDir === "asc" ? "ascending" : "descending") : "none"}
                  onClick={() => handleSort("price")}
                  className="text-right px-4 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors focus-visible:outline-none focus-visible:bg-blue-50"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Prix (DA)</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "price" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th scope="col" className="text-right px-4 py-3 w-32">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAndSortedOffers.map((o, idx) => {
                const ruptured = isRuptured(o);
                const isBest = statsBase.live && !ruptured && stats !== null && o.priceDa === stats.min;
                const unknownStock = !ruptured && o.stock !== "En stock";
                return (
                <tr
                  key={`${o.store}-${o.priceDa}-${idx}`}
                  className={`transition-colors group ${isBest ? "bg-emerald-50/70 hover:bg-emerald-50" : "hover:bg-blue-50/50"}`}
                >
                  {/* Store info */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Thumb src={o.image} alt={o.store} size={38} />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-[#2c87c3] transition-colors flex items-center gap-1.5">
                          <span>{o.store}</span>
                          <span className="size-1.5 rounded-full bg-emerald-500" title="Boutique indexée" />
                        </div>
                        <div className="text-slate-500 truncate max-w-xs text-[11px] mt-0.5">{o.titleRaw}</div>
                      </div>
                    </div>
                  </td>

                  {/* Wilaya */}
                  <td className="px-3 py-3.5 text-slate-600 font-medium">
                    <span className="inline-flex items-center gap-1.5 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/60">
                      <span>📍</span>
                      <span>{o.wilaya}</span>
                    </span>
                  </td>

                  {/* Condition */}
                  <td className="px-3 py-3.5 text-center">
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        o.condition === "new"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-200/60"
                          : "bg-amber-100 text-amber-800 border border-amber-200/60"
                      }`}
                    >
                      {o.condition === "new" ? "Neuf" : "Occasion"}
                    </span>
                  </td>

                  {/* Stock */}
                  <td className="px-3 py-3.5">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <span className={`size-2 rounded-full ${ruptured ? "bg-red-500" : unknownStock ? "bg-slate-300" : "bg-emerald-500"}`} />
                      <span className={ruptured ? "font-semibold text-red-700" : ""}>{ruptured ? "Rupture" : o.stock || "Prix constaté"}</span>
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 text-right">
                    {isBest && (
                      <span className="inline-block mb-1 text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-full bg-emerald-600 text-white">
                        Meilleur prix
                      </span>
                    )}
                    <div className={`font-extrabold text-sm sm:text-base tabular-nums transition-colors ${isBest ? "text-emerald-700" : "text-slate-900 group-hover:text-emerald-700"}`}>
                      {o.priceDa.toLocaleString("fr-DZ")} DA
                    </div>
                  </td>

                  {/* Outbound Link Button */}
                  <td className="px-4 py-3.5 text-right">
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer sponsored"
                      aria-label={ruptured ? `Voir quand même l'offre en rupture chez ${o.store} — ${o.priceDa.toLocaleString("fr-DZ")} DA` : `Acheter chez ${o.store} — ${o.priceDa.toLocaleString("fr-DZ")} DA`}
                      className={`inline-flex items-center justify-center px-3.5 py-2 rounded text-white font-bold text-xs transition-colors shadow-sm hover:shadow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${ruptured
                        ? "bg-red-600 hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500"
                        : "bg-[#2c87c3] hover:bg-[#1e5c85] active:bg-[#153f5b] focus-visible:ring-[#2c87c3]"}`}
                    >
                      <span>{ruptured ? "Voir quand même" : "Acheter"}</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="p-6">
          <EmptyState
            type="offers"
            title="Aucune offre trouvée"
            description="Aucune offre ne correspond à vos filtres actuels. Essayez de réinitialiser la recherche ou de sélectionner 'Tous'."
            actionText="Réinitialiser les filtres"
            onAction={() => {
              setConditionFilter("all");
              setSearch("");
              setHideRuptured(false);
            }}
          />
        </div>
      )}
    </div>
  );
}
