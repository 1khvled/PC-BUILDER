"use client";

import { useMemo, useState } from "react";
import type { Offer } from "@/lib/data/products";
import Thumb from "./Thumb";
import EmptyState from "./EmptyState";

interface ProductOffersTableProps {
  offers: Offer[];
}

type SortField = "price" | "store" | "condition" | "wilaya";
type SortDir = "asc" | "desc";

export default function ProductOffersTable({ offers }: ProductOffersTableProps) {
  const [sortField, setSortField] = useState<SortField>("price");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [conditionFilter, setConditionFilter] = useState<"all" | "new" | "used">("all");
  const [search, setSearch] = useState("");

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredAndSortedOffers = useMemo(() => {
    const list = offers.filter((o) => {
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
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return list;
  }, [offers, conditionFilter, search, sortField, sortDir]);

  const newCount = useMemo(() => offers.filter((o) => o.condition === "new").length, [offers]);
  const usedCount = useMemo(() => offers.filter((o) => o.condition === "used").length, [offers]);

  const stats = useMemo(() => {
    if (filteredAndSortedOffers.length === 0) return null;
    const prices = filteredAndSortedOffers.map((o) => o.priceDa);
    const min = Math.min(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const max = Math.max(...prices);
    return { min, avg, max };
  }, [filteredAndSortedOffers]);

  return (
    <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-200 bg-slate-50/70 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 mr-1">
            Offres Marchands ({filteredAndSortedOffers.length})
          </span>
          <div className="inline-flex rounded-xl border border-slate-200 bg-white p-0.5 text-xs shadow-2xs">
            <button
              onClick={() => setConditionFilter("all")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                conditionFilter === "all" ? "bg-slate-900 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Tous ({offers.length})
            </button>
            <button
              onClick={() => setConditionFilter("new")}
              className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                conditionFilter === "new" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Neuf ({newCount})
            </button>
            {usedCount > 0 && (
              <button
                onClick={() => setConditionFilter("used")}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                  conditionFilter === "used" ? "bg-amber-600 text-white shadow-2xs" : "text-slate-600 hover:text-slate-900"
                }`}
              >
                Occasion ({usedCount})
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3">
          {stats && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-slate-500 font-medium">
              <span>Moyenne : <b className="text-slate-800 font-mono">{stats.avg.toLocaleString("fr-DZ")} DA</b></span>
              <span className="text-slate-300">•</span>
              <span>Écart : <b className="font-mono">{(stats.max - stats.min).toLocaleString("fr-DZ")} DA</b></span>
            </div>
          )}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Filtrer boutique ou wilaya…"
              className="border border-slate-200 rounded-xl pl-7 pr-3 py-1.5 text-xs bg-white text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0b63e5] shadow-2xs w-48 sm:w-56"
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
            <thead className="bg-slate-50/80 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200 select-none">
              <tr>
                <th
                  onClick={() => handleSort("store")}
                  className="text-left px-4 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Marchand / Boutique</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "store" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("wilaya")}
                  className="text-left px-3 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center gap-1.5">
                    <span>Wilaya</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "wilaya" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th
                  onClick={() => handleSort("condition")}
                  className="text-center px-3 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-center gap-1.5">
                    <span>État</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "condition" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="text-left px-3 py-3">Disponibilité</th>
                <th
                  onClick={() => handleSort("price")}
                  className="text-right px-4 py-3 cursor-pointer hover:text-slate-900 hover:bg-slate-100/70 transition-colors"
                >
                  <div className="flex items-center justify-end gap-1.5">
                    <span>Prix (DA)</span>
                    <span className="text-[10px] text-slate-400">
                      {sortField === "price" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                    </span>
                  </div>
                </th>
                <th className="text-right px-4 py-3 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredAndSortedOffers.map((o, idx) => (
                <tr
                  key={idx}
                  className="rowline transition-colors hover:bg-blue-50/50 group"
                >
                  {/* Store info */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Thumb src={o.image} alt={o.store} size={38} />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 text-sm group-hover:text-[#0b63e5] transition-colors flex items-center gap-1.5">
                          <span>{o.store}</span>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" title="Boutique indexée" />
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
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      <span>{o.stock || "En stock vérifié"}</span>
                    </span>
                  </td>

                  {/* Price */}
                  <td className="px-4 py-3.5 text-right">
                    <div className="font-extrabold text-sm sm:text-base tabular-nums font-mono text-slate-900 group-hover:text-emerald-700 transition-colors">
                      {o.priceDa.toLocaleString("fr-DZ")} DA
                    </div>
                  </td>

                  {/* Outbound Link Button */}
                  <td className="px-4 py-3.5 text-right">
                    <a
                      href={o.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center justify-center px-3 py-1.5 rounded-lg bg-[#0b63e5] hover:bg-[#094db5] text-white font-bold text-xs transition-colors shadow-2xs"
                    >
                      <span>Acheter</span>
                      <svg className="w-3 h-3 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </a>
                  </td>
                </tr>
              ))}
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
            }}
          />
        </div>
      )}
    </div>
  );
}
