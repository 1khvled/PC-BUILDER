import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDES } from "@/lib/data/guides";
import { PRODUCTS, bestOffer, productImage } from "@/lib/data/products";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";

export function generateStaticParams() {
  return GUIDES.map((g) => ({ slug: g.slug }));
}

export default async function GuidePage({ params }: { params: { slug: string } }) {
  const offers = await getOffers();
  const scrapedAt = await getScrapedAt();
  const guide = GUIDES.find((g) => g.slug === params.slug);
  if (!guide) notFound();

  const rows = guide.parts
    .map((id) => ({ p: PRODUCTS.find((x) => x.id === id), best: bestOffer(id, offers) }))
    .filter((x) => x.p);

  const total = rows.reduce((s, r) => s + (r.best?.priceDa ?? 0), 0);
  const missing = rows.filter((r) => !r.best).length;

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-slate-900 transition-colors">
          Guides
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{guide.title}</span>
      </nav>

      {/* Magazine Title & Author Header */}
      <div className="bg-white rounded p-6 sm:p-10 border border-slate-200 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2c87c3] border border-blue-100">
              Guide d&apos;Achat Gaming DZ
            </span>
            <span className="text-xs text-slate-400">
              ⏱ {guide.readMin} min de lecture
            </span>
          </div>

          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/70">
            Relevé le {scrapedAt.slice(0, 10)}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-900 leading-tight">
          {guide.title}
        </h1>

        {/* Author Chip */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            DZ
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">Rédaction DZ PartPicker</div>
            <div className="text-[11px] text-slate-400">Dossier technique & comparatif 58 wilayas</div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
          {guide.hook}
        </p>

        {/* Budget Highlight Card */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 bg-[#11111c] text-white rounded p-5 sm:p-6 mt-4 shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              Budget total estimé (prix les plus bas relevés) :
            </div>
            <div className="text-2xl sm:text-3xl font-black text-emerald-400 tracking-tight mt-1">
              {total.toLocaleString("fr-DZ")} DA
            </div>
            <div className="text-xs text-slate-400 mt-1">
              Composants disponibles dans les boutiques d&apos;Alger, Oran, Sétif et livrables 58 wilayas
            </div>
          </div>
          <Link
            href="/builder"
            className="px-5 py-3 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <span>Ouvrir dans le Builder</span>
            <span>→</span>
          </Link>
        </div>

        {missing > 0 && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-3.5">
            ⚠️ {missing} pièce(s) sans offre immédiatement matchée — consultez les annonces live de la catégorie correspondante.
          </p>
        )}
      </div>

      {/* Recommended Parts Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>Composants Recommandés ({rows.length})</span>
          <span className="text-slate-400 font-normal normal-case">Vérifié sur 58 wilayas</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3">Composant</th>
                <th className="text-left px-3 py-3">Boutique</th>
                <th className="text-right px-4 py-3">Prix (DA)</th>
                <th className="text-right px-4 py-3 w-28">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rows.map(({ p, best }) => (
                <tr key={p!.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Thumb src={productImage(p!)} alt={p!.model} size={44} />
                      <div className="min-w-0">
                        <Link
                          href={`/product/${p!.id}`}
                          className="font-bold text-sm text-[#2c87c3] hover:underline block truncate"
                        >
                          {p!.brand} {p!.model}
                        </Link>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {p!.category}
                        </span>
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
                    <span className="font-bold text-sm text-slate-900 tabular-nums">
                      {best ? `${best.priceDa.toLocaleString("fr-DZ")} DA` : "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {best ? (
                      <a
                        href={best.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded bg-slate-900 hover:bg-[#2c87c3] text-white font-bold text-xs transition-colors"
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

      {/* Guide Content Sections */}
      <div className="bg-white rounded p-6 sm:p-10 border border-slate-200 space-y-8">
        {guide.blocks.map((b, i) => (
          <section key={i} className="space-y-3">
            {b.h && (
              <h2 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2c87c3]" />
                <span>{b.h}</span>
              </h2>
            )}
            {(b.p ?? []).map((t, j) => (
              <p key={j} className="text-sm text-slate-700 leading-relaxed">
                {t}
              </p>
            ))}
            {b.list && (
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                {b.list.map((t, j) => (
                  <li key={j} className="leading-relaxed">{t}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Pitfalls Callout */}
        <section className="bg-amber-50/80 border border-amber-200/90 rounded p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <span className="text-lg">⚠️</span>
            <h3 className="font-black">Pièges à éviter sur le marché algérien</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-amber-950 leading-relaxed">
            {guide.pitfalls.map((t, j) => (
              <li key={j}>{t}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href="/builder"
          className="px-6 py-3 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white font-bold text-sm transition-colors"
        >
          Adapter ce build dans le configurateur →
        </Link>
        <Link
          href="/builds"
          className="px-6 py-3 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors"
        >
          Consulter les builds de la communauté
        </Link>
      </div>
    </main>
  );
}
