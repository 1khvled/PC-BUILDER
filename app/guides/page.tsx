import Link from "next/link";
import { GUIDES } from "@/lib/data/guides";
import { PRODUCTS, bestOffer, productImage } from "@/lib/data/products";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";

export default async function GuidesPage() {
  const offers = await getOffers();
  const scrapedAt = await getScrapedAt();
  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Magazine Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#2c87c3]" />
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              Guides d&apos;Achat PC Gaming en Algérie
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            Configurations équilibrées pour éviter les goulots d&apos;étranglement, chiffrées aux prix réels des magasins d&apos;Alger, Sétif et Oran • Prix relevés le {scrapedAt.slice(0, 10)}
          </p>
        </div>

        <Link
          href="/builder"
          className="px-5 py-2.5 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
        >
          <span>Créer mon propre build</span>
          <span>→</span>
        </Link>
      </div>

      {/* Magazine-Style Guides Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {GUIDES.map((g, idx) => {
          const total = g.parts.reduce((sum, id) => sum + (bestOffer(id, offers)?.priceDa ?? 0), 0);
          const missing = g.parts.filter((id) => !bestOffer(id, offers)).length;
          const sampleProducts = g.parts
            .map((id) => PRODUCTS.find((p) => p.id === id))
            .filter((p): p is (typeof PRODUCTS)[0] => Boolean(p))
            .slice(0, 4);

          const tierBadge = missing > 0
            ? { label: "Budget Partiel", color: "bg-amber-50 text-amber-700 border-amber-200" }
            : total < 100000
            ? { label: "Budget Malin", color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
            : total <= 200000
            ? { label: "Milieu de Gamme", color: "bg-blue-50 text-blue-700 border-blue-200" }
            : { label: "Enthusiast / 1440p", color: "bg-purple-50 text-purple-700 border-purple-200" };

          return (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="bg-white rounded p-6 border border-slate-200/90 hover:border-[#2c87c3] flex flex-col justify-between group space-y-5 transition-colors overflow-hidden relative"
            >
              <div className="space-y-4">
                {/* Badges Bar: Reading Time + Budget Tier */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tierBadge.color}`}>
                    {tierBadge.label}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
                    <span>⏱</span>
                    <span>{g.readMin} min de lecture</span>
                  </span>
                </div>

                {/* Magazine Title with Hover Accent */}
                <h2 className="font-black text-lg sm:text-xl text-slate-900 group-hover:text-[#2c87c3] transition-colors leading-snug">
                  {g.title}
                </h2>

                {/* Author Chip */}
                <div className="flex items-center gap-2.5 pt-0.5">
                  <div className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-[10px] font-bold">
                    DZ
                  </div>
                  <div className="text-xs text-slate-500">
                    Par <span className="font-semibold text-slate-800">Équipe DZ-PCPP</span> • Édition 2026
                  </div>
                </div>

                {/* Hook Description */}
                <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
                  {g.hook}
                </p>

                {/* Sample Hardware Showcase with Hover Zoom */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                    Composants sélectionnés ({g.parts.length}) :
                  </div>
                  <div className="flex items-center gap-2 overflow-hidden">
                    {sampleProducts.map((p) => (
                      <div
                        key={p.id}
                        className="p-1 rounded bg-slate-50 border border-slate-200/80 shrink-0"
                        title={`${p.brand} ${p.model}`}
                      >
                        <Thumb src={productImage(p)} alt={p.model} size={40} />
                      </div>
                    ))}
                    {g.parts.length > 4 && (
                      <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">
                        +{g.parts.length - 4}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Total Budget & Action Footer */}
              <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-2">
                <div>
                  <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                    {missing > 0 ? "Budget partiel (dès)" : "Budget estimé"}
                  </span>
                  <div className="text-xl font-black text-emerald-700 tracking-tight">
                    {missing > 0 ? "Dès " : ""}
                    {total.toLocaleString("fr-DZ")} DA
                  </div>
                </div>

                <span className="px-3.5 py-2 rounded bg-slate-900 group-hover:bg-[#2c87c3] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0">
                  <span>Lire</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
