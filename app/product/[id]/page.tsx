import Link from "next/link";
import { notFound } from "next/navigation";
import { PRODUCTS, bestOffer, productImage } from "@/lib/data/products";
import { getOffers, getPriceHistory, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import ProductOffersTable from "@/components/ProductOffersTable";
import PriceChart from "@/components/PriceChart";

export function generateStaticParams() {
  return PRODUCTS.map((p) => ({ id: p.id }));
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const product = PRODUCTS.find((p) => p.id === params.id);
  if (!product) {
    notFound();
  }

  const allOffers = await getOffers();
  const history = await getPriceHistory(product.id);
  const scrapedAt = await getScrapedAt();
  const offers = allOffers.filter((o) => o.productId === product.id).sort((a, b) => a.priceDa - b.priceDa);
  // Hero = best NEW + available offer, never a dead/used listing while a live one exists
  const best = bestOffer(product.id, allOffers) ?? offers[0];
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${product.brand} ${product.model}`,
    brand: product.brand,
    category: product.category,
    image: productImage(product),
    offers: offers.slice(0, 20).map((o) => ({
      "@type": "Offer",
      price: o.priceDa,
      priceCurrency: "DZD",
      availability: /rupture/i.test(o.stock)
        ? "https://schema.org/OutOfStock"
        : "https://schema.org/InStock",
      itemCondition: o.condition === "new"
        ? "https://schema.org/NewCondition"
        : "https://schema.org/UsedCondition",
      seller: o.store,
      url: o.url,
    })),
  };
  const specs = Object.entries(product.specs);

  const priceStats = offers.length > 0 ? {
    min: offers[0].priceDa,
    max: offers[offers.length - 1].priceDa,
    diff: offers[offers.length - 1].priceDa - offers[0].priceDa,
  } : null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category}`} className="hover:text-slate-900 capitalize transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">
          {product.brand} {product.model}
        </span>
      </nav>

      {/* Main Product Layout with Sticky Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery Hero + Specs + Offers (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery Hero with Badges */}
          <div className="bg-white rounded-3xl shadow-xs border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#0b63e5] border border-blue-100">
                {product.category}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Réf : {product.id}
              </span>
              {best && (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Meilleur prix : {best.priceDa.toLocaleString("fr-DZ")} DA</span>
                </span>
              )}
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                📦 {offers.length} boutique{offers.length > 1 ? "s" : ""} indexée{offers.length > 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              {/* Image Container with Badges */}
              <div className="relative group shrink-0">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-inner group-hover:scale-102 transition-transform duration-300">
                  <Thumb src={productImage(product)} alt={product.model} size={132} />
                </div>
                {best && (
                  <div className="absolute -bottom-2 -right-2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-md shadow-md border border-slate-700">
                    Prix vérifiés DA
                  </div>
                )}
              </div>

              {/* Title & Key Highlights */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {product.brand}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-0.5 leading-tight">
                  {product.brand} {product.model}
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  Composant PC répertorié auprès des distributeurs et boutiques spécialisées en Algérie. Prix vérifié en direct et tri 100% neutre par prix croissant.
                </p>

                {/* Highlight Specs Chips */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-4">
                  {specs.slice(0, 5).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-xs px-3 py-1 rounded-lg bg-slate-100 text-slate-700 font-medium border border-slate-200/60"
                    >
                      <b className="text-slate-900 capitalize">{k} :</b> {String(v)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upgraded Spec Table */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#0b63e5]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="4" y="4" width="16" height="16" rx="2" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="4" y1="10" x2="20" y2="10" />
                </svg>
                <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                  Fiche Technique Détaillée
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">Données constructeur</span>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs sm:text-sm">
                <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/60 transition-colors">
                  <span className="text-slate-500 font-medium">Catégorie</span>
                  <span className="font-bold text-slate-900 capitalize">{product.category}</span>
                </div>
                <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/60 transition-colors">
                  <span className="text-slate-500 font-medium">Fabricant / Marque</span>
                  <span className="font-bold text-slate-900">{product.brand}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs sm:text-sm">
                <div className="p-4 flex items-center justify-between bg-slate-50/40 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-500 font-medium">Modèle exact</span>
                  <span className="font-bold text-slate-900">{product.model}</span>
                </div>
                <div className="p-4 flex items-center justify-between bg-slate-50/40 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-500 font-medium">Identifiant interne</span>
                  <span className="font-mono text-xs font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
                    {product.id}
                  </span>
                </div>
              </div>

              {specs.map(([key, val], idx) => (
                <div
                  key={key}
                  className={`grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs sm:text-sm ${
                    idx % 2 === 0 ? "bg-white" : "bg-slate-50/40"
                  } hover:bg-blue-50/30 transition-colors`}
                >
                  <div className="p-4 flex items-center justify-between sm:col-span-1">
                    <span className="text-slate-500 font-medium capitalize">{key.replace(/_/g, " ")}</span>
                  </div>
                  <div className="p-4 flex items-center justify-between sm:col-span-1">
                    <span className="font-bold text-slate-900 font-mono">{String(val)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Dynamic Sortable Offers Table */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                Comparatif des prix marchands en Algérie
              </h2>
              <span className="text-xs text-slate-400">
                Relevé le {scrapedAt.slice(0, 10)} • Tri organique par prix croissant
              </span>
            </div>
            <ProductOffersTable offers={offers} />
          </section>

          {/* Price History (PCPartPicker signature) */}
          <section className="bg-white rounded-2xl shadow-xs border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                Historique des prix
              </h2>
              <span className="text-xs text-slate-400">
                {history.length} relevé{history.length > 1 ? "s" : ""} • toutes boutiques
              </span>
            </div>
            <PriceChart points={history} />
          </section>

          {/* Facebook Marketplace Paste Box */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-xs anim-in-2">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-xl bg-blue-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                f
              </span>
              <h3 className="font-bold text-sm text-slate-900">
                Résoudre une annonce Facebook Marketplace à la demande
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Collez le lien d&apos;une annonce Facebook Marketplace pour vérifier son tarif et son historique face aux prix neufs du marché algérien (résolution à la demande, sans scraper permanent).
            </p>
            <form action="/api/fb-resolve" method="get" className="flex flex-wrap gap-2 mt-4">
              <input
                name="url"
                placeholder="https://www.facebook.com/marketplace/item/..."
                className="flex-1 min-w-[260px] border border-slate-200 rounded-xl px-3.5 py-2 text-xs bg-slate-50 focus:bg-white focus:border-[#0b63e5] outline-none shadow-2xs transition-all"
              />
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs transition-colors shadow-2xs"
              >
                Résoudre le prix
              </button>
            </form>
          </div>
        </div>

        {/* Right Column: Sticky Buy Box (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 shadow-md p-6 space-y-5">
            {/* Header / Price */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Meilleur tarif constaté
              </div>
              {best ? (
                <>
                  <div className="text-3xl sm:text-4xl font-black text-emerald-700 font-mono tracking-tight mt-1">
                    {best.priceDa.toLocaleString("fr-DZ")} DA
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>chez</span>
                    <b className="text-slate-900 font-bold">{best.store}</b>
                    <span className="text-slate-400">({best.wilaya})</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${best.condition === "new" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {best.condition === "new" ? "Neuf" : "Occasion"}
                    </span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${/rupture/i.test(best.stock) ? "bg-red-100 text-red-700" : "bg-slate-100 text-slate-600"}`}>
                      {best.stock}
                    </span>
                  </div>
                  {/rupture/i.test(best.stock) && (
                    <div className="text-xs text-red-600 font-semibold mt-1.5">
                      Rupture constatée au dernier relevé — vérifiez avant de commander.
                    </div>
                  )}
                  {best.condition === "used" && (
                    <div className="text-xs text-amber-700 font-semibold mt-1.5">
                      Offre d'occasion — exigez test + facture (voir guide Ouedkniss).
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 mt-1">
                    Stock relevé le {scrapedAt.slice(0, 10)} — confirmez toujours sur la boutique.
                  </div>
                </>
              ) : (
                <div className="text-sm text-slate-500 italic mt-2">
                  Aucun marchand actuellement en stock
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            {best && (
              <div className="space-y-2.5 pt-1">
                <a
                  href={best.url}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full text-center py-3 px-4 rounded-xl bg-[#0b63e5] hover:bg-[#094db5] active:bg-[#08429d] text-white font-bold text-sm shadow-md shadow-blue-500/20 transition-[transform,background-color] duration-150 active:scale-[0.96] card-lift flex items-center justify-center gap-2 group"
                >
                  <span>Commander sur {best.store}</span>
                  <span className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform">↗</span>
                </a>

                <Link
                  href={`/builder?p=${product.category}:${product.id}`}
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/50 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>+ Ajouter au System Builder</span>
                </Link>
              </div>
            )}

            {/* Price Range Comparison info */}
            {priceStats && priceStats.diff > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Prix le plus bas :</span>
                  <b className="text-emerald-700 font-mono">{priceStats.min.toLocaleString("fr-DZ")} DA</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Prix le plus haut :</span>
                  <b className="text-slate-800 font-mono">{priceStats.max.toLocaleString("fr-DZ")} DA</b>
                </div>
                <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                  <span>Économie possible :</span>
                  <span className="text-emerald-700 font-mono">+{priceStats.diff.toLocaleString("fr-DZ")} DA</span>
                </div>
              </div>
            )}

            {/* Guarantees Checklist */}
            <div className="pt-2 border-t border-slate-100 space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>La plupart des marchands proposent le paiement à la livraison</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Expédition vers 58 wilayas selon la boutique</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Comparateur indépendant sans commissions</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-emerald-600 font-bold shrink-0">✓</span>
                <span>Relevé vérifié le {scrapedAt.slice(0, 10)}</span>
              </div>
            </div>
          </div>

          {/* Help note */}
          <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 text-xs text-blue-900 leading-relaxed">
            <span className="font-bold block mb-0.5">Besoin d&apos;aide pour monter votre PC ?</span>
            Utilisez notre{" "}
            <Link href="/builder" className="font-bold underline hover:text-[#0b63e5]">
              System Builder
            </Link>{" "}
            pour vérifier automatiquement la compatibilité de ce composant avec votre processeur, carte mère et alimentation.
          </div>
        </div>
      </div>
    </main>
  );
}
