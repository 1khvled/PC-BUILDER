import Link from "next/link";
import { CATEGORIES } from "@/lib/data/products";

export default function NotFound() {
  return (
    <main className="max-w-7xl mx-auto px-4 py-10 sm:py-16">
      <div className="max-w-2xl mx-auto text-center bg-white rounded border border-slate-200 p-8 sm:p-12">
        <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Erreur 404
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-2">
          Page introuvable
        </h1>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          L&apos;adresse demandée n&apos;existe pas ou a été déplacée. Le comparateur
          continue de tourner — repartez d&apos;une page qui existe :
        </p>

        <div className="flex flex-wrap justify-center gap-2 mt-6">
          <Link
            href="/"
            className="px-5 py-2.5 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white font-bold text-sm transition-colors"
          >
            Accueil
          </Link>
          <Link
            href="/builder"
            className="px-5 py-2.5 rounded bg-slate-900 hover:bg-slate-700 text-white font-bold text-sm transition-colors"
          >
            System Builder
          </Link>
          <Link
            href="/deals"
            className="px-5 py-2.5 rounded border border-slate-200 hover:border-[#2c87c3] hover:bg-blue-50/50 text-slate-800 font-semibold text-sm transition-colors"
          >
            Bons plans
          </Link>
          <Link
            href="/guides"
            className="px-5 py-2.5 rounded border border-slate-200 hover:border-[#2c87c3] hover:bg-blue-50/50 text-slate-800 font-semibold text-sm transition-colors"
          >
            Guides d&apos;achat
          </Link>
        </div>
      </div>

      <div className="max-w-2xl mx-auto mt-6 bg-white rounded border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-500">
          Parcourir par composant
        </div>
        <div className="p-4 flex flex-wrap gap-2">
          {CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/category/${c.slug}`}
              className="px-3 py-1.5 rounded bg-slate-100 hover:bg-[#2c87c3] hover:text-white text-slate-700 font-semibold text-xs border border-slate-200/60 transition-colors"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
