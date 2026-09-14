import Link from "next/link";
import { CATEGORIES, PRODUCTS, bestOffer, productImage } from "@/lib/data/products";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import { LIVE_EXTRA } from "@/lib/data/live";
import { GUIDES } from "@/lib/data/guides";
import Thumb from "@/components/Thumb";

function fmt(n: number) {
  return n.toLocaleString("fr-DZ") + " DA";
}

function CategorySvg({ slug }: { slug: string }) {
  switch (slug) {
    case "cpu":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
    case "cooler":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 9.5V3M14.5 12H21M12 14.5V21M9.5 12H3" />
        </svg>
      );
    case "motherboard":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="4" height="4" />
          <path d="M15 7h2M15 10h2M7 15h10M7 18h5" />
        </svg>
      );
    case "ram":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="10" rx="1" />
          <path d="M6 17v2M10 17v2M14 17v2M18 17v2M6 11h2M11 11h2M16 11h2" />
        </svg>
      );
    case "ssd":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M7 9h10M7 12h4M16 15h1" />
        </svg>
      );
    case "gpu":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="8.5" cy="12" r="2.5" />
          <circle cx="15.5" cy="12" r="2.5" />
          <path d="M2 10h2M2 14h2M6 18v2M10 18v2" />
        </svg>
      );
    case "case":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <path d="M9 11h6M9 14h6M9 17h6" />
        </svg>
      );
    case "psu":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="10" cy="12" r="3.5" />
          <path d="M16 8h2M16 12h2M16 16h2" />
        </svg>
      );
    case "monitor":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      );
  }
}

export default async function Home() {
  const offers = await getOffers();
  const scrapedAt = await getScrapedAt();
  const liveCount = offers.length + LIVE_EXTRA.length;
  const trending = PRODUCTS.map((p) => ({ p, best: bestOffer(p.id, offers) }))
    .filter((x) => x.best)
    .sort((a, b) => (a.best as { priceDa: number }).priceDa - (b.best as { priceDa: number }).priceDa)
    .slice(0, 8);

  const popularGuides = GUIDES.slice(0, 2);

  return (
    <main className="pb-8">
      {/* Hero band — flat dark navy, pcbuilder-style */}
      <section className="bg-[#11111c] text-white">
        <div className="max-w-7xl mx-auto px-4 py-10 sm:py-14">
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              {liveCount} offres indexées • Relevé le {scrapedAt.slice(0, 10)}
            </p>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mt-2 leading-tight">
              Assemblez votre PC au meilleur prix en Algérie.
            </h1>
            <p className="text-sm text-slate-300 mt-3 leading-relaxed max-w-2xl">
              Prix relevés chaque jour en Algérie, triés par prix croissant. Zéro commission.
            </p>
            <div className="flex flex-wrap items-center gap-2.5 mt-5">
              <Link href="/builder" className="btn-blue px-5 py-2.5 text-sm">
                Lancer le System Builder →
              </Link>
              <Link
                href="/deals"
                className="px-5 py-2.5 rounded text-sm font-bold border border-slate-500 text-white hover:bg-white/10"
              >
                Voir les bons plans
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        {/* Meilleurs prix du moment — dense price table */}
        <section className="panel">
          <div className="panel-hd flex items-center justify-between">
            <span>Prix les plus bas du marché</span>
            <Link href="/deals" className="pcpp-link font-bold normal-case tracking-normal">
              Tous les bons plans →
            </Link>
          </div>
          <table className="w-full text-sm mt-1">
            <caption className="sr-only">Les huit meilleurs prix relevés sur le marché algérien</caption>
            <tbody className="divide-y divide-slate-100">
              {trending.map(({ p, best }) => (
                <tr key={p.id} className="hover:bg-blue-50/50">
                  <td className="px-3 py-2 w-12">
                    <Thumb src={productImage(p)} alt={p.model} size={40} />
                  </td>
                  <td className="px-2 py-2">
                    <Link href={`/product/${p.id}`} className="pcpp-link font-bold text-sm">
                      {p.brand} {p.model}
                    </Link>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {best?.store} • {best?.wilaya}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-right whitespace-nowrap">
                    <span className="font-extrabold text-emerald-700 tabular-nums">{fmt(best?.priceDa ?? 0)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* Parcourir par catégorie */}
        <section>
          <h2 className="text-lg font-extrabold tracking-tight mb-3">
            Parcourir par catégorie
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {CATEGORIES.map((c) => {
              const items = PRODUCTS.filter((p) => p.category === c.slug);
              const prices = items.map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity).filter(Number.isFinite);
              const minPrice = prices.length ? Math.min(...prices) : null;
              const extraN = LIVE_EXTRA.filter((e) => e.category === c.slug).length;

              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="panel p-3.5 flex items-center gap-3.5 hover:border-[#2c87c3]"
                >
                  <div className="w-11 h-11 rounded bg-[#2c87c3] text-white flex items-center justify-center shrink-0">
                    <CategorySvg slug={c.slug} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm truncate">
                      {c.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {items.length} modèle{items.length > 1 ? "s" : ""}
                      {minPrice ? ` • dès ${fmt(minPrice)}` : ""}
                      {extraN > 0 && <span className="text-amber-700 font-semibold"> • +{extraN} annonces live</span>}
                    </div>
                  </div>
                  <span className="pcpp-link text-base font-bold">→</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guides & Builds */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Guides */}
          <section className="panel">
            <div className="panel-hd flex items-center justify-between">
              <span>Guides d&apos;achat gaming DZ</span>
              <Link href="/guides" className="pcpp-link font-bold normal-case tracking-normal">
                Tous les guides →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {popularGuides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="block px-3 py-2.5 hover:bg-blue-50/50">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm pcpp-link">{g.title}</span>
                    <span className="text-[11px] text-slate-500 shrink-0">⏱ {g.readMin} min</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 truncate">{g.hook}</div>
                </Link>
              ))}
            </div>
          </section>

        </div>
      </div>
    </main>
  );
}
