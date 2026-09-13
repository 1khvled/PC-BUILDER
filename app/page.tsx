import Link from "next/link";
import { CATEGORIES, OFFERS, PRODUCTS, bestOffer, productImage } from "@/lib/data/products";
import { LIVE_EXTRA, SCRAPED_AT } from "@/lib/data/live";
import { GUIDES } from "@/lib/data/guides";
import { BUILDS } from "@/lib/data/builds";
import Thumb from "@/components/Thumb";

function fmt(n: number) {
  return n.toLocaleString("fr-DZ") + " DA";
}

function CategorySvg({ slug }: { slug: string }) {
  switch (slug) {
    case "cpu":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
    case "cooler":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 9.5V3M14.5 12H21M12 14.5V21M9.5 12H3" />
        </svg>
      );
    case "motherboard":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="4" height="4" />
          <path d="M15 7h2M15 10h2M7 15h10M7 18h5" />
        </svg>
      );
    case "ram":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="10" rx="1" />
          <path d="M6 17v2M10 17v2M14 17v2M18 17v2M6 11h2M11 11h2M16 11h2" />
        </svg>
      );
    case "ssd":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M7 9h10M7 12h4M16 15h1" />
        </svg>
      );
    case "gpu":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="8.5" cy="12" r="2.5" />
          <circle cx="15.5" cy="12" r="2.5" />
          <path d="M2 10h2M2 14h2M6 18v2M10 18v2" />
        </svg>
      );
    case "case":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <path d="M9 11h6M9 14h6M9 17h6" />
        </svg>
      );
    case "psu":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="10" cy="12" r="3.5" />
          <path d="M16 8h2M16 12h2M16 16h2" />
        </svg>
      );
    case "monitor":
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      );
  }
}

export default function Home() {
  const liveCount = OFFERS.length + LIVE_EXTRA.length;
  const trending = PRODUCTS.map((p) => ({ p, best: bestOffer(p.id) }))
    .filter((x) => x.best)
    .sort((a, b) => (a.best as { priceDa: number }).priceDa - (b.best as { priceDa: number }).priceDa)
    .slice(0, 8);

  const popularBuilds = BUILDS.slice(0, 2);
  const popularGuides = GUIDES.slice(0, 2);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      {/* Premium Hero Section with /brand/og-hero.webp Background */}
      <section
        className="rounded-3xl border border-slate-800 relative overflow-hidden shadow-2xl bg-slate-950 text-white"
        style={{
          backgroundImage: "url('/brand/og-hero.webp')",
          backgroundSize: "cover",
          backgroundPosition: "center 30%",
        }}
      >
        {/* Deep ambient dark overlay for razor-sharp readability */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/95 via-slate-950/85 to-slate-900/75 backdrop-blur-[1px]" />

        <div className="relative z-10 p-6 sm:p-10 lg:p-14 max-w-4xl space-y-6">
          {/* Live Pulse Ticker */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-400 backdrop-blur-md">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
            </span>
            <span>{liveCount} offres indexées en direct</span>
            <span className="text-emerald-400/40">•</span>
            <span className="text-slate-300 font-normal">Relevé le {SCRAPED_AT.slice(0, 10)}</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-white leading-[1.1]">
            Assemblez votre PC de rêve au{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-300 to-emerald-400">
              meilleur prix en Algérie.
            </span>
          </h1>

          <p className="text-sm sm:text-base lg:text-lg text-slate-300 max-w-2xl leading-relaxed">
            Le comparateur indépendant des prix en Dinars Algériens (DA). Vérifiez les stocks de LICB+, Digitec, Click-DZ, WifiDjelfa, GamingDZ et Ouedkniss sur les 58 wilayas. Zéro commission, vérification de compatibilité incluse.
          </p>

          {/* Live Key Stats Counter */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-2">
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-white font-mono">{liveCount}+</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Offres vérifiées</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-sky-400 font-mono">58</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Wilayas livrées</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-400 font-mono">100%</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Indépendant</div>
            </div>
            <div className="bg-white/5 border border-white/10 rounded-xl p-3 backdrop-blur-sm">
              <div className="text-xl sm:text-2xl font-extrabold text-amber-400 font-mono">0 DA</div>
              <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Frais cachés</div>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center gap-3.5 pt-2">
            <Link
              href="/builder"
              className="px-6 py-3.5 rounded-xl bg-[#0b63e5] hover:bg-[#094db5] active:bg-[#073ea0] text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 transition-all card-lift flex items-center gap-2.5 group"
            >
              <span>Lancer le System Builder</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
            <Link
              href="/category/cpu"
              className="px-5 py-3.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-semibold text-sm border border-white/20 backdrop-blur-sm transition-colors"
            >
              Catalogue des composants
            </Link>
            <Link
              href="/guides"
              className="px-5 py-3.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white font-semibold text-sm border border-slate-700 transition-colors"
            >
              Guides d&apos;achat gaming
            </Link>
          </div>
        </div>
      </section>

      {/* Upgraded Trending Strip — Meilleurs prix du moment */}
      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Tendances & Prix les Plus Bas du Marché
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Top offres relevées et vérifiées auprès des boutiques partenaires le {SCRAPED_AT.slice(0, 10)}
            </p>
          </div>
          <Link
            href="/category/gpu"
            className="text-xs font-bold text-[#0b63e5] hover:underline flex items-center gap-1"
          >
            <span>Voir toutes les cartes graphiques</span>
            <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
          {trending.map(({ p, best }) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="card-lift bg-white rounded-2xl p-4 border border-slate-200/90 shadow-2xs hover:border-blue-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-50 text-[#0b63e5] border border-blue-100">
                    {p.category}
                  </span>
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-50 px-2 py-0.5 rounded-full border border-slate-200/60">
                    📍 {best?.wilaya}
                  </span>
                </div>

                <div className="flex items-center gap-3.5 mt-2">
                  <div className="p-1 rounded-xl bg-slate-50 border border-slate-100 group-hover:scale-105 transition-transform shrink-0">
                    <Thumb src={productImage(p)} alt={p.model} size={56} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-[#0b63e5] transition-colors truncate">
                      {p.brand} {p.model}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5 truncate flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                      <span>{best?.store}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Meilleur prix</span>
                  <div className="text-base font-extrabold text-emerald-700 font-mono tracking-tight">
                    {fmt(best?.priceDa ?? 0)}
                  </div>
                </div>
                <span className="text-xs font-bold text-[#0b63e5] group-hover:translate-x-1 transition-transform flex items-center gap-0.5">
                  <span>Voir</span>
                  <span>→</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Parcourir par Catégorie (9 categories) */}
      <section className="space-y-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
            Parcourir par Catégorie de Pièces
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Sélectionnez une catégorie pour filtrer les composants compatibles, comparer les prix et trouver le revendeur le plus proche
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {CATEGORIES.map((c) => {
            const items = PRODUCTS.filter((p) => p.category === c.slug);
            const prices = items.map((p) => bestOffer(p.id)?.priceDa ?? Infinity).filter(Number.isFinite);
            const minPrice = prices.length ? Math.min(...prices) : null;
            const extraN = LIVE_EXTRA.filter((e) => e.category === c.slug).length;

            return (
              <Link
                key={c.slug}
                href={`/category/${c.slug}`}
                className="card-lift bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs hover:border-blue-300 flex items-center gap-4 group"
              >
                <div className="w-13 h-13 rounded-2xl bg-blue-50/70 border border-blue-100 group-hover:bg-[#0b63e5] group-hover:text-white flex items-center justify-center shrink-0 transition-colors shadow-2xs">
                  <CategorySvg slug={c.slug} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-extrabold text-sm sm:text-base text-slate-900 group-hover:text-[#0b63e5] transition-colors truncate">
                    {c.label}
                  </div>
                  <div className="text-xs text-slate-500 mt-0.5 font-medium">
                    {items.length} modèle{items.length > 1 ? "s" : ""}
                    {minPrice ? ` • dès ${fmt(minPrice)}` : ""}
                  </div>
                  {extraN > 0 && (
                    <div className="text-[10px] text-amber-700 font-semibold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                      <span>+{extraN} annonces live marché</span>
                    </div>
                  )}
                </div>
                <span className="text-slate-400 group-hover:text-[#0b63e5] group-hover:translate-x-1 transition-all text-base font-bold">
                  →
                </span>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Guides & Builds Magazine-Style Teaser Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Guides D'achat Teaser */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#0b63e5] border border-blue-100">
                  Dossier Spécial
                </span>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Guides d&apos;Achat Gaming DZ
                </h3>
              </div>
              <Link href="/guides" className="text-xs font-bold text-[#0b63e5] hover:underline">
                Tous les guides →
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Configurations équilibrées pour éviter les goulots d&apos;étranglement, chiffrées aux prix réels des boutiques d&apos;Alger, Oran et Sétif.
            </p>
            <div className="space-y-3 pt-1">
              {popularGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/70 transition-all block group card-lift"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-[#0b63e5] transition-colors">
                      {g.title}
                    </div>
                    <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md shrink-0">
                      ⏱ {g.readMin} min
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-1">{g.hook}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center gap-2">
                    <span className="font-semibold text-slate-700">{g.parts.length} pièces sélectionnées</span>
                    <span>•</span>
                    <span className="text-emerald-700 font-bold">Prix vérifiés en DA</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/guides"
            className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors block mt-2"
          >
            Explorer tous les guides recommandés
          </Link>
        </div>

        {/* Builds Communauté Teaser */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-100">
                  Communauté DZ
                </span>
                <h3 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Configurations de la Communauté
                </h3>
              </div>
              <Link href="/builds" className="text-xs font-bold text-[#0b63e5] hover:underline">
                Voir tous les builds →
              </Link>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Découvrez les PCs montés par les gamers algériens avec les prix vérifiés et les pièces en stock.
            </p>
            <div className="space-y-3 pt-1">
              {popularBuilds.map((b) => (
                <Link
                  key={b.id}
                  href={`/builds/${b.id}`}
                  className="p-4 rounded-xl border border-slate-200/80 hover:border-blue-300 hover:bg-slate-50/70 transition-all block group card-lift"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-bold text-sm text-slate-900 group-hover:text-[#0b63e5] transition-colors">
                      {b.title}
                    </div>
                    <span className="text-xs font-bold text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100 shrink-0">
                      📍 {b.wilaya}
                    </span>
                  </div>
                  <div className="text-xs text-slate-500 mt-1 line-clamp-1">{b.description}</div>
                  <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-between">
                    <span className="font-medium text-slate-600">par {b.author}</span>
                    <span className="text-rose-600 font-semibold">♥ {b.likes} mentions</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href="/builds"
            className="w-full text-center py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors block mt-2"
          >
            Découvrir tous les builds des membres
          </Link>
        </div>
      </div>
    </main>
  );
}
