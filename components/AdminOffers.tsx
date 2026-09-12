"use client";

import { useMemo, useState } from "react";
import type { Offer } from "@/lib/data/products";

type AdminSortField = "title" | "store" | "price" | "condition" | "wilaya";
type AdminSortDir = "asc" | "desc";

export default function AdminOffers({ offers }: { offers: Offer[] }) {
  const [q, setQ] = useState("");
  const [cond, setCond] = useState("all");
  const [selectedStore, setSelectedStore] = useState("all");
  const [sortField, setSortField] = useState<AdminSortField>("price");
  const [sortDir, setSortDir] = useState<AdminSortDir>("asc");

  // Get distinct stores
  const storeList = useMemo(() => {
    const s = new Set<string>();
    offers.forEach((o) => s.add(o.store));
    return Array.from(s).sort();
  }, [offers]);

  const handleSort = (field: AdminSortField) => {
    if (sortField === field) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  };

  const filteredAndSorted = useMemo(() => {
    const list = offers.filter((o) => {
      if (cond !== "all" && o.condition !== cond) return false;
      if (selectedStore !== "all" && o.store !== selectedStore) return false;
      if (q.trim()) {
        const needle = q.toLowerCase();
        const match = `${o.titleRaw} ${o.store} ${o.wilaya}`.toLowerCase().includes(needle);
        if (!match) return false;
      }
      return true;
    });

    list.sort((a, b) => {
      let cmp = 0;
      if (sortField === "price") {
        cmp = a.priceDa - b.priceDa;
      } else if (sortField === "title") {
        cmp = a.titleRaw.localeCompare(b.titleRaw);
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
  }, [offers, cond, selectedStore, q, sortField, sortDir]);

  // Average price for currently filtered results
  const stats = useMemo(() => {
    if (filteredAndSorted.length === 0) return { avg: 0, min: 0, max: 0 };
    const prices = filteredAndSorted.map((o) => o.priceDa);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    return { avg, min, max };
  }, [filteredAndSorted]);

  const displayedList = filteredAndSorted.slice(0, 300);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
      {/* Controls Bar */}
      <div className="flex flex-wrap gap-2.5 items-center justify-between mb-3">
        <div className="flex flex-1 flex-wrap gap-2 items-center min-w-[280px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Recherche (titre, store, wilaya)…"
            className="flex-1 min-w-[180px] bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-emerald-500"
          />
          <select
            value={cond}
            onChange={(e) => setCond(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
          >
            <option value="all">Tous états (neuf+occ.)</option>
            <option value="new">Neuf uniquement</option>
            <option value="used">Occasion uniquement</option>
          </select>
          <select
            value={selectedStore}
            onChange={(e) => setSelectedStore(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
          >
            <option value="all">Tous les magasins ({storeList.length})</option>
            {storeList.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Metrics Badge */}
        <div className="flex items-center gap-3 text-xs bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 shrink-0">
          <span className="text-slate-400">
            Résultats : <b className="text-white">{filteredAndSorted.length}</b>
            {filteredAndSorted.length > 300 ? " (300 affichées)" : ""} / {offers.length}
          </span>
          {stats.avg > 0 && (
            <>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                Prix moyen : <b className="text-emerald-400 font-mono">{stats.avg.toLocaleString("fr-DZ")} DA</b>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                Min : <span className="font-mono text-white">{stats.min.toLocaleString("fr-DZ")} DA</span>
              </span>
            </>
          )}
        </div>
      </div>

      {/* Dense Table */}
      <div className="overflow-x-auto max-h-[520px] overflow-y-auto border border-slate-800 rounded-lg">
        <table className="w-full text-xs">
          <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 select-none z-10">
            <tr>
              <th
                onClick={() => handleSort("title")}
                className="text-left p-2.5 cursor-pointer hover:text-white hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Titre / Référence</span>
                  <span className="text-[10px] text-slate-500">
                    {sortField === "title" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </div>
              </th>
              <th
                onClick={() => handleSort("store")}
                className="text-left p-2.5 cursor-pointer hover:text-white hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Store</span>
                  <span className="text-[10px] text-slate-500">
                    {sortField === "store" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </div>
              </th>
              <th
                onClick={() => handleSort("wilaya")}
                className="text-left p-2.5 cursor-pointer hover:text-white hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center gap-1">
                  <span>Wilaya</span>
                  <span className="text-[10px] text-slate-500">
                    {sortField === "wilaya" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </div>
              </th>
              <th
                onClick={() => handleSort("condition")}
                className="text-center p-2.5 cursor-pointer hover:text-white hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center justify-center gap-1">
                  <span>État</span>
                  <span className="text-[10px] text-slate-500">
                    {sortField === "condition" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </div>
              </th>
              <th
                onClick={() => handleSort("price")}
                className="text-right p-2.5 cursor-pointer hover:text-white hover:bg-slate-900 transition-colors"
              >
                <div className="flex items-center justify-end gap-1">
                  <span>Prix (DA)</span>
                  <span className="text-[10px] text-slate-500">
                    {sortField === "price" ? (sortDir === "asc" ? "▲" : "▼") : "↕"}
                  </span>
                </div>
              </th>
              <th className="p-2.5 text-center w-16">Lien</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80">
            {displayedList.map((o, i) => (
              <tr key={i} className="hover:bg-slate-800/60 transition-colors">
                <td className="p-2.5 font-medium truncate max-w-[340px] text-slate-200">
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:underline hover:text-blue-400"
                    title={o.titleRaw}
                  >
                    {o.titleRaw}
                  </a>
                </td>
                <td className="p-2.5 font-semibold text-slate-300">{o.store}</td>
                <td className="p-2.5 text-slate-400">{o.wilaya}</td>
                <td className="p-2.5 text-center">
                  <span
                    className={`inline-block px-1.5 py-0.5 rounded text-[10px] font-bold ${
                      o.condition === "new"
                        ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80"
                        : "bg-amber-950 text-amber-400 border border-amber-800/80"
                    }`}
                  >
                    {o.condition === "new" ? "Neuf" : "Occasion"}
                  </span>
                </td>
                <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                  {o.priceDa.toLocaleString("fr-DZ")} DA
                </td>
                <td className="p-2.5 text-center">
                  <a
                    href={o.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-blue-400 hover:text-blue-300 hover:underline text-[11px]"
                  >
                    ↗
                  </a>
                </td>
              </tr>
            ))}
            {displayedList.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-500">
                  Aucune offre ne correspond aux critères de filtre.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
