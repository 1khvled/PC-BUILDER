"use client";

import { useState } from "react";
import Link from "next/link";
import { BUILDS } from "@/lib/data/builds";
import { PRODUCTS, bestOffer, productImage } from "@/lib/data/products";
import { checkCompat } from "@/lib/compat/check";
import Thumb from "@/components/Thumb";
import EmptyState from "@/components/EmptyState";

function totalOf(picks: Record<string, string>) {
  return Object.values(picks).reduce((s, id) => s + (bestOffer(id)?.priceDa ?? 0), 0);
}

const FILTERS = [
  { id: "all", label: "Tous les builds" },
  { id: "lt100", label: "< 100 000 DA" },
  { id: "100-200", label: "100k – 200k DA" },
  { id: "gt200", label: "200 000 DA+" },
];

export default function BuildsPage() {
  const [f, setF] = useState("all");
  const [q, setQ] = useState("");

  const list = BUILDS.map((b) => ({ b, total: totalOf(b.picks) })).filter(({ b, total }) => {
    if (f === "lt100" && total >= 100000) return false;
    if (f === "100-200" && (total < 100000 || total > 200000)) return false;
    if (f === "gt200" && total <= 200000) return false;
    if (q && !(b.title + b.author + b.wilaya + b.description).toLowerCase().includes(q.toLowerCase())) return false;
    return true;
  });

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Magazine Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900">
              Builds de la Communauté DZ
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Configurations complètes créées et testées par les gamers algériens • Prix calculés en direct et compatibilité validée
          </p>
        </div>

        <Link
          href="/builder"
          className="px-5 py-2.5 rounded-xl bg-[#0b63e5] hover:bg-[#094db5] text-white text-xs sm:text-sm font-bold shadow-2xs transition-all card-lift flex items-center gap-2"
        >
          <span>Créer un nouveau build</span>
          <span>→</span>
        </Link>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          {FILTERS.map((x) => (
            <button
              key={x.id}
              onClick={() => setF(x.id)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                f === x.id
                  ? "bg-slate-900 text-white shadow-2xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200/80"
              }`}
            >
              {x.label}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-xs min-w-[220px]">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Rechercher par titre, auteur, wilaya…"
            className="w-full border border-slate-200 rounded-xl pl-8 pr-7 py-1.5 text-xs bg-slate-50 focus:bg-white focus:border-[#0b63e5] outline-none shadow-2xs transition-all"
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
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-2.5 top-2 text-slate-400 hover:text-slate-600 text-xs"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Magazine-Style Community Builds Grid */}
      {list.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map(({ b, total }) => {
            const cpu = PRODUCTS.find((p) => p.id === b.picks.cpu);
            const gpu = PRODUCTS.find((p) => p.id === b.picks.gpu);
            const ram = PRODUCTS.find((p) => p.id === b.picks.ram);
            const compat = checkCompat(
              Object.fromEntries(
                Object.entries(b.picks).map(([k, id]) => [k, PRODUCTS.find((p) => p.id === id)])
              ) as never
            );

            const authorInitials = b.author.slice(0, 2).toUpperCase();

            return (
              <Link
                key={b.id}
                href={`/builds/${b.id}`}
                className="card-lift bg-white rounded-3xl p-6 border border-slate-200/90 shadow-xs hover:border-blue-300 flex flex-col justify-between group space-y-5 transition-all overflow-hidden relative"
              >
                <div>
                  {/* Top Bar: Author Chip & Likes Counter */}
                  <div className="flex items-center justify-between gap-3 mb-4">
                    {/* Author Chip */}
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-inner">
                        {authorInitials}
                      </div>
                      <div>
                        <div className="text-xs font-bold text-slate-900">{b.author}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <span>📍 {b.wilaya}</span>
                          <span>•</span>
                          <span>{b.createdAt}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold shrink-0 ${
                          compat.ok ? "bg-emerald-50 text-emerald-800 border border-emerald-200/70" : "bg-red-50 text-red-800 border border-red-200/70"
                        }`}
                      >
                        {compat.ok ? "✓ Compatible" : "À vérifier"}
                      </span>
                      <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                        <span>♥</span>
                        <span>{b.likes}</span>
                      </span>
                    </div>
                  </div>

                  {/* Main Build Info */}
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-2xl bg-slate-50 border border-slate-200/80 shrink-0 group-hover:scale-105 transition-transform duration-300 shadow-inner">
                      <Thumb src={gpu ? productImage(gpu) : undefined} alt={b.title} size={68} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h2 className="font-black text-lg text-slate-900 group-hover:text-[#0b63e5] transition-colors leading-snug">
                        {b.title}
                      </h2>

                      {/* Budget Badge */}
                      <div className="text-xl font-black text-emerald-700 font-mono tracking-tight mt-1">
                        {total.toLocaleString("fr-DZ")} DA
                      </div>
                    </div>
                  </div>

                  {/* Description Snippet */}
                  <p className="text-xs sm:text-sm text-slate-600 mt-3 line-clamp-2 leading-relaxed">
                    {b.description}
                  </p>
                </div>

                {/* Hardware Spec Badges Footer */}
                <div className="pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2">
                  <div className="flex flex-wrap gap-1.5 text-[11px]">
                    {cpu && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        CPU : <b className="text-slate-900">{cpu.brand} {cpu.model}</b>
                      </span>
                    )}
                    {gpu && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium">
                        GPU : <b className="text-slate-900">{gpu.brand} {gpu.model}</b>
                      </span>
                    )}
                    {ram && (
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium hidden sm:inline">
                        RAM : <b className="text-slate-900">{ram.model}</b>
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-bold text-[#0b63e5] group-hover:translate-x-0.5 transition-transform flex items-center gap-1">
                    <span>Voir build</span>
                    <span>→</span>
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <EmptyState
          type="builds"
          title="Aucun build ne correspond à vos filtres"
          description="Essayez d'ajuster la tranche de budget ou de rechercher un autre mot-clé (ex: RTX, Ryzen, Alger)."
          actionText="Réinitialiser les filtres"
          onAction={() => {
            setF("all");
            setQ("");
          }}
        />
      )}
    </main>
  );
}
