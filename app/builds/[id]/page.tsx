import Link from "next/link";
import { notFound } from "next/navigation";
import { BUILDS } from "@/lib/data/builds";
import { PRODUCTS, bestOffer, productImage } from "@/lib/data/products";
import { getOffers } from "@/lib/data/catalog";
import { checkCompat } from "@/lib/compat/check";
import { bottleneckPct } from "@/lib/algo/optimizer";
import Thumb from "@/components/Thumb";

export function generateStaticParams() {
  return BUILDS.map((b) => ({ id: b.id }));
}

export default async function BuildDetail({ params }: { params: { id: string } }) {
  const offers = await getOffers();
  const build = BUILDS.find((b) => b.id === params.id);
  if (!build) notFound();

  const rows = Object.entries(build.picks)
    .map(([cat, id]) => ({ cat, p: PRODUCTS.find((x) => x.id === id), best: bestOffer(id, offers) }))
    .filter((x) => x.p);

  const total = rows.reduce((s, r) => s + (r.best?.priceDa ?? 0), 0);
  const compat = checkCompat(Object.fromEntries(rows.map((r) => [r.cat, r.p])) as never);
  const cpu = rows.find((r) => r.cat === "cpu")?.p;
  const gpu = rows.find((r) => r.cat === "gpu")?.p;
  const bn = cpu && gpu ? bottleneckPct(cpu.model, gpu.model, "1080p") : null;

  const authorInitials = build.author.slice(0, 2).toUpperCase();

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/builds" className="hover:text-slate-900 transition-colors">
          Builds communauté
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{build.title}</span>
      </nav>

      {/* Main Build Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200/80">
            Build Communauté Algérie
          </span>

          <span className="text-xs font-bold text-rose-600 bg-rose-50 border border-rose-100 px-3 py-1 rounded-full flex items-center gap-1.5">
            <span>♥</span>
            <span>{build.likes} likes</span>
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
          {build.title}
        </h1>

        {/* Author Chip */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-slate-900 to-slate-700 text-white flex items-center justify-center font-bold text-xs shadow-sm">
            {authorInitials}
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900 flex items-center gap-2">
              <span>{build.author}</span>
              <span className="text-slate-400 font-normal">📍 {build.wilaya}</span>
            </div>
            <div className="text-[11px] text-slate-400">Publié le {build.createdAt}</div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-1">
          {build.description}
        </p>

        {/* Compatibility & Metrics Bar */}
        <div className="pt-3 flex flex-wrap items-center gap-2 text-xs">
          <span
            className={`px-3 py-1.5 rounded-xl font-bold ${
              compat.ok ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
            }`}
          >
            {compat.ok ? "✓ Compatibilité vérifiée" : "✕ Incompatibilités détectées"}
          </span>

          {bn && (
            <span className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 font-medium">
              Équilibre CPU/GPU (1080p) : <b>{bn.note}</b>
            </span>
          )}

          <div className="ml-auto flex items-baseline gap-2">
            <span className="text-xs text-slate-400 uppercase font-semibold">Total :</span>
            <span className="font-black text-2xl text-emerald-700 font-mono">
              {total.toLocaleString("fr-DZ")} DA
            </span>
          </div>
        </div>

        {compat.warnings.length > 0 && (
          <ul className="text-xs bg-red-50 border border-red-200 rounded-xl p-4 list-disc pl-6 space-y-1 text-red-900 font-medium">
            {compat.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        )}
      </div>

      {/* Parts Table */}
      <div className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Liste des Pièces ({rows.length})</span>
          <span className="text-slate-400 font-normal normal-case">Prix du marché en DA</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3">Composant</th>
                <th className="text-left px-3 py-3">Marchand</th>
                <th className="text-right px-4 py-3">Prix (DA)</th>
                <th className="text-right px-4 py-3 w-28">Lien</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rows.map(({ cat, p, best }) => (
                <tr key={cat} className="rowline hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Thumb src={productImage(p!)} alt={p!.model} size={44} />
                      <div className="min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                          {cat}
                        </span>
                        <Link
                          href={`/product/${p!.id}`}
                          className="font-bold text-sm text-[#0b63e5] hover:underline block truncate"
                        >
                          {p!.brand} {p!.model}
                        </Link>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3.5 text-slate-600">
                    {best ? (
                      <div>
                        <div className="font-semibold text-slate-800">{best.store}</div>
                        <div className="text-[11px] text-slate-400">{best.wilaya}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Pas d&apos;offre indexée</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-sm text-slate-900 tabular-nums font-mono">
                      {best ? `${best.priceDa.toLocaleString("fr-DZ")} DA` : "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {best ? (
                      <a
                        href={best.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-[#0b63e5] text-white font-bold text-xs transition-colors shadow-2xs"
                      >
                        <span>Voir</span>
                        <span className="ml-1">↗</span>
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={`/builder?p=${Object.entries(build.picks).map(([k, v]) => `${k}:${v}`).join(",")}`}
          className="px-6 py-3 rounded-xl bg-[#0b63e5] hover:bg-[#094db5] text-white font-bold text-sm shadow-2xs transition-all card-lift"
        >
          Reprendre cette configuration dans le Builder →
        </Link>
        <Link
          href="/builds"
          className="px-6 py-3 rounded-xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors"
        >
          ← Tous les builds
        </Link>
      </div>
    </main>
  );
}
