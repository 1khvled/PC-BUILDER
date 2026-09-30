import Link from "next/link";
import { CATEGORIES, bestOffer, productImage } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { LIVE_EXTRA } from "@/lib/data/live";
import { GUIDES } from "@/lib/data/guides";
import Thumb from "@/components/Thumb";

export const dynamic = "force-dynamic";
export const revalidate = 0;

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
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);
  const liveCount = offers.length + LIVE_EXTRA.length;
  const trending = products.map((p) => ({ p, best: bestOffer(p.id, offers) }))
    .filter((x) => x.best)
    .sort((a, b) => (a.best as { priceDa: number }).priceDa - (b.best as { priceDa: number }).priceDa)
    .slice(0, 8);

  const popularGuides = GUIDES.slice(0, 2);

  const stats = [
    { value: `${liveCount}`, label: "offres indexées" },
    { value: "60+", label: "boutiques suivies" },
    { value: "58", label: "wilayas livrées" },
    { value: scrapedAt.slice(0, 10), label: "dernier relevé" },
  ];

  return (
    <main className="pb-10">
      {/* Hero band — navy gradient, circuit dots + blue glows */}
      <section className="relative overflow-hidden bg-[#11111c] text-white">
        <div className="absolute inset-0 dz-hero-grid" aria-hidden="true" />
        <div className="absolute inset-0 dz-hero-glow" aria-hidden="true" />
        {/* accent baseline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2c87c3]/60 to-transparent" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-20">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.07] border border-white/15 backdrop-blur-sm text-xs font-semibold text-slate-200">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Comparateur indépendant • {liveCount} offres indexées
            </div>
            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 leading-[1.1]">
              Assemblez votre PC au{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5db2e8] to-[#2c87c3]">
                meilleur prix
              </span>{" "}
              en Algérie.
            </h1>
            <p className="text-sm sm:text-base text-slate-300/90 mt-4 leading-relaxed max-w-2xl">
              Prix relevés chaque jour sur les boutiques DZ, triés par prix croissant.
              Zéro commission, tri 100% organique — vous achetez directement chez le marchand.
            </p>
            <div className="flex flex-wrap items-center gap-3 mt-7">
              <Link href="/builder" className="btn-blue px-6 py-3 text-sm">
                Lancer le System Builder
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/deals"
                className="px-6 py-3 rounded-[10px] text-sm font-bold border border-white/20 text-white hover:bg-white/10 transition-colors backdrop-blur-sm"
              >
                Voir les bons plans
              </Link>
            </div>
          </div>

          {/* Stats chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/[0.06] border border-white/10 backdrop-blur-sm px-4 py-3"
              >
                <div className="text-lg sm:text-xl font-extrabold tracking-tight text-white tabular-nums truncate">
                  {s.value}
                </div>
                <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold mt-0.5">
                  {s.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 py-10 space-y-12">
        {/* Meilleurs prix du moment — dense price table */}
        <section className="panel">
          <div className="panel-hd">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              Prix les plus bas du marché
            </span>
            <Link href="/deals" className="pcpp-link font-bold normal-case tracking-normal">
              Tous les bons plans →
            </Link>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">Les huit meilleurs prix relevés sur le marché algérien</caption>
            <tbody className="divide-y divide-slate-100">
              {trending.map(({ p, best }, i) => (
                <tr key={p.id} className="group transition-colors hover:bg-blue-50/40">
                  <td className="pl-4 py-2.5 w-12">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 group-hover:bg-[#2c87c3] group-hover:text-white text-slate-500 text-[11px] font-extrabold flex items-center justify-center transition-colors tabular-nums">
                      {i + 1}
                    </span>
                  </td>
                  <td className="px-2 py-2.5 w-14">
                    <Thumb src={productImage(p)} alt={p.model} size={44} />
                  </td>
                  <td className="px-2 py-2.5">
                    <Link href={`/product/${p.id}`} className="pcpp-link font-bold text-sm">
                      {p.brand} {p.model}
                    </Link>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5">
                      <span>{best?.store}</span>
                      <span className="text-slate-300">•</span>
                      <span>{best?.wilaya}</span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <span className="font-extrabold text-emerald-700 tabular-nums group-hover:text-emerald-600 transition-colors">
                      {fmt(best?.priceDa ?? 0)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {/* How it works — 3 steps */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
            <h2 className="text-lg font-extrabold tracking-tight">Comment ça marche</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              {
                n: "1",
                title: "Choisissez vos composants",
                text: "Parcourez le catalogue ou configurez votre build complet dans le System Builder.",
                href: "/category/cpu",
                cta: "Parcourir le catalogue",
              },
              {
                n: "2",
                title: "Comparez les prix en DA",
                text: "Chaque produit agrège les offres des boutiques DZ, neuf et occasion séparés.",
                href: "/deals",
                cta: "Voir les bons plans",
              },
              {
                n: "3",
                title: "Achetez chez le marchand",
                text: "Lien direct vers la boutique, paiement à la livraison, expédition 58 wilayas.",
                href: "/builder",
                cta: "Lancer le Builder",
              },
            ].map((s) => (
              <Link
                key={s.n}
                href={s.href}
                className="panel p-5 group hover:border-[#2c87c3]/50 hover:shadow-card-hover transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="w-9 h-9 rounded-xl bg-blue-50 text-[#2c87c3] border border-blue-100 flex items-center justify-center font-extrabold text-sm">
                    {s.n}
                  </span>
                  <span className="text-slate-300 group-hover:text-[#2c87c3] group-hover:translate-x-1 transition-all" aria-hidden="true">→</span>
                </div>
                <div className="font-bold text-sm mt-3.5">{s.title}</div>
                <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">{s.text}</p>
                <span className="pcpp-link text-xs font-bold mt-2.5 inline-block">{s.cta}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* Parcourir par catégorie */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
            <h2 className="text-lg font-extrabold tracking-tight">Parcourir par catégorie</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
            {CATEGORIES.map((c) => {
              const items = products.filter((p) => p.category === c.slug);
              const prices = items.map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity).filter(Number.isFinite);
              const minPrice = prices.length ? Math.min(...prices) : null;
              const extraN = LIVE_EXTRA.filter((e) => e.category === c.slug).length;

              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="panel p-4 flex items-center gap-4 group hover:border-[#2c87c3]/60 hover:shadow-card-hover transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#3a94d2] to-[#2c87c3] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(44,135,195,0.5)] group-hover:scale-105 transition-transform">
                    <CategorySvg slug={c.slug} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm group-hover:text-[#2c87c3] transition-colors">
                      {c.label}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {items.length} modèle{items.length > 1 ? "s" : ""}
                      {minPrice ? <span className="text-emerald-700 font-semibold"> • dès {fmt(minPrice)}</span> : ""}
                      {extraN > 0 && <span className="text-amber-700 font-semibold"> • +{extraN} live</span>}
                    </div>
                  </div>
                  <span className="text-slate-300 group-hover:text-[#2c87c3] group-hover:translate-x-1 transition-all text-lg font-bold" aria-hidden="true">→</span>
                </Link>
              );
            })}
          </div>
        </section>

        {/* Guides & Builder CTA */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Guides */}
          <section className="panel lg:col-span-3">
            <div className="panel-hd">
              <span className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
                Guides d'achat gaming DZ
              </span>
              <Link href="/guides" className="pcpp-link font-bold normal-case tracking-normal">
                Tous les guides →
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {popularGuides.map((g) => (
                <Link key={g.slug} href={`/guides/${g.slug}`} className="block px-4 py-3.5 hover:bg-blue-50/40 transition-colors group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm pcpp-link">{g.title}</span>
                    <span className="text-[11px] text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">⏱ {g.readMin} min</span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 truncate">{g.hook}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Builder promo card */}
          <section className="lg:col-span-2 relative overflow-hidden rounded-xl bg-[#11111c] text-white p-6 flex flex-col justify-between min-h-[220px] shadow-card">
            <div className="absolute inset-0 dz-hero-grid opacity-60" aria-hidden="true" />
            <div className="absolute inset-0 dz-hero-glow" aria-hidden="true" />
            <div className="relative">
              <span className="inline-block px-2.5 py-1 rounded-full bg-[#2c87c3]/20 border border-[#2c87c3]/40 text-[11px] font-bold uppercase tracking-wider text-[#7cc0ea]">
                Configurateur
              </span>
              <h3 className="text-xl font-extrabold tracking-tight mt-3 leading-snug">
                Votre build complet, chiffré aux prix réels du marché DZ.
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                Vérification de compatibilité automatique, puissance estimée, permalien partageable.
              </p>
            </div>
            <Link href="/builder" className="relative btn-blue px-5 py-2.5 text-sm self-start mt-5">
              Ouvrir le System Builder
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
