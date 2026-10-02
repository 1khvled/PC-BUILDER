import type { Metadata } from "next";
import RecordVisit from "@/components/RecordVisit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bestOffer, isRuptured, minOf, productImage } from "@/lib/data/products";
import { getOffers, getPriceHistory, getProduct, getProducts, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import ProductOffersTable from "@/components/ProductOffersTable";
import PriceChart from "@/components/PriceChart";
import FbResolveForm from "@/components/FbResolveForm";
import BytekAd from "@/components/BytekAd";
import AskAI from "@/components/AskAI";
import { productPrompt } from "@/lib/ai/prompt";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, formatNumber, languageAlternates } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "fr" as const;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const t = await getT(LOCALE);
  const product = await getProduct(params.id);
  if (!product) return { title: t("product.notFound") };

  const allOffers = await getOffers();
  const offers = allOffers.filter((o) => o.productId === product.id && !isRuptured(o));
  const minPrice = minOf(offers.map((o) => o.priceDa));

  const title = minPrice
    ? t("product.metaTitlePrice", { brand: product.brand, model: product.model, price: formatNumber(minPrice, LOCALE) })
    : t("product.metaTitle", { brand: product.brand, model: product.model });
  const description = t("product.metaDescription", { brand: product.brand, model: product.model });
  const imgUrl = productImage(product);

  return {
    title,
    description,
    keywords: t("product.metaKeywords", {
      brand: product.brand,
      model: product.model,
      category: product.category,
    }).split(",").map((k) => k.trim()),
    openGraph: {
      title,
      description: t("product.metaOgDescription", { brand: product.brand, model: product.model }),
      url: `/product/${product.id}`,
      type: "article",
      locale: OG_LOCALE.fr,
      siteName: "DZ PartPicker",
      images: imgUrl ? [{ url: imgUrl, alt: `${product.brand} ${product.model}` }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("product.metaOgDescription", { brand: product.brand, model: product.model }),
      images: imgUrl ? [imgUrl] : undefined,
    },
    alternates: languageAlternates(`/product/${product.id}`),
  };
}

export default async function ProductPage({ params }: { params: { id: string } }) {
  const [product, allOffers, history, scrapedAt] = await Promise.all([
    getProduct(params.id),
    getOffers(),
    getPriceHistory(params.id),
    getScrapedAt(),
  ]);

  if (!product) {
    notFound();
  }
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
  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://dzpartpicker.dz/" },
      { "@type": "ListItem", position: 2, name: product.category, item: `https://dzpartpicker.dz/category/${product.category}` },
      { "@type": "ListItem", position: 3, name: `${product.brand} ${product.model}`, item: `https://dzpartpicker.dz/product/${product.id}` },
    ],
  };

  const specs = Object.entries(product.specs);

  // Stats ignore ruptures: a dead listing must never set the min/max or the "savings".
  // offers is already sorted ascending, filter preserves that order.
  const liveOffers = offers.filter((o) => !isRuptured(o));
  const allRuptured = offers.length > 0 && liveOffers.length === 0;
  const statsPool = liveOffers.length > 0 ? liveOffers : offers;
  const priceStats = statsPool.length > 0 ? {
    min: statsPool[0].priceDa,
    max: statsPool[statsPool.length - 1].priceDa,
    diff: statsPool[statsPool.length - 1].priceDa - statsPool[0].priceDa,
    live: liveOffers.length > 0,
  } : null;

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <RecordVisit productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      {/* Breadcrumbs */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/fr" className="hover:text-slate-900 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <Link href={`/fr/category/${product.category}`} className="hover:text-slate-900 capitalize transition-colors">
          {product.category}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">
          {product.brand} {product.model}
        </span>
        <span className="ml-auto shrink-0">
          <LocaleSwitcher pathname={`/product/${product.id}`} />
        </span>
      </nav>

      {/* Main Product Layout with Sticky Buy Box */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery Hero + Specs + Offers (8 cols) */}
        <div className="lg:col-span-8 space-y-8">
          {/* Gallery Hero with Badges */}
          <div className="bg-white rounded border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#2c87c3] border border-blue-100">
                {product.category}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                Réf : {product.id}
              </span>
              {allRuptured ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>Rupture de stock globale</span>
                </span>
              ) : best ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>Meilleur prix : {best.priceDa.toLocaleString("fr-DZ")} DA</span>
                </span>
              ) : null}
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                📦 {offers.length} boutique{offers.length > 1 ? "s" : ""} indexée{offers.length > 1 ? "s" : ""}
              </span>
            </div>

            {/* Global Rupture Alert Banner */}
            {allRuptured && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                  ✕
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-rose-950">
                    Composant actuellement en rupture de stock chez toutes les boutiques
                  </h3>
                  <p className="text-xs text-rose-800/90 mt-0.5 leading-relaxed">
                    Aucun marchand n&apos;a ce produit en stock pour le moment. Les offres listées ci-dessous correspondent aux derniers prix relevés avant rupture.
                  </p>
                </div>
              </div>
            )}

            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 sm:gap-8">
              {/* Image Container with Badges */}
              <div className="relative group shrink-0">
                <div className="p-3 rounded bg-slate-50 border border-slate-200/80 shadow-inner">
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
                  Prix relevés en Algérie, triés par prix croissant.
                </p>

                {/* Highlight Specs Chips */}
                <div className="flex flex-wrap justify-center sm:justify-start gap-1.5 mt-4">
                  {specs.slice(0, 5).map(([k, v]) => (
                    <span
                      key={k}
                      className="text-xs px-3 py-1 rounded bg-slate-100 text-slate-700 font-medium border border-slate-200/60"
                    >
                      <b className="text-slate-900 capitalize">{k} :</b> {String(v)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Upgraded Spec Table */}
          <section className="bg-white rounded border border-slate-200 overflow-hidden">
            <div className="p-4 sm:p-5 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4 text-[#2c87c3]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                  <span className="text-xs font-semibold text-slate-700 bg-slate-200/70 px-2 py-0.5 rounded">
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
                    <span className="font-bold text-slate-900">{String(val)}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Sponsor: peripherals sit next to component pricing, so the ad goes
              above the offers table where purchase intent is highest. */}
          <BytekAd variant="strip" locale="fr" placement="fr-product-offers" />
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
            <ProductOffersTable offers={offers} locale="fr" />
            <AskAI
              locale="fr"
              placement="fr-product"
              prompt={productPrompt({
                brand: product.brand,
                model: product.model,
                category: product.category,
                bestPrice: best ? best.priceDa : null,
                bestStore: best ? best.store : null,
                offersCount: offers.length,
                locale: "fr",
              })}
            />
          </section>

          {/* Price History (PCPartPicker signature) */}
          <section className="bg-white rounded border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                Historique des prix
              </h2>
              <span className="text-xs text-slate-400">
                {history.length} relevé{history.length > 1 ? "s" : ""} • toutes boutiques
              </span>
            </div>
            <PriceChart points={history} currentOffers={offers} />
          </section>

          {/* Facebook Marketplace Paste Box */}
          <div className="bg-white rounded border border-slate-200 p-5 sm:p-6">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
                f
              </span>
              <h3 className="font-bold text-sm text-slate-900">
                Résoudre une annonce Facebook Marketplace à la demande
              </h3>
            </div>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Collez le lien d&apos;une annonce Facebook Marketplace pour vérifier son tarif et son historique face aux prix neufs du marché algérien (résolution à la demande, sans scraper permanent).
            </p>
            <FbResolveForm />
          </div>
        </div>

        {/* Right Column: Sticky Buy Box (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-20 space-y-4">
          <div className="bg-white rounded border border-slate-200 shadow-md p-6 space-y-5">
            {/* Header / Price */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {allRuptured ? "Dernier tarif constaté (Épuisé)" : "Meilleur tarif constaté"}
              </div>
              {best ? (
                <>
                  <div
                    className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 ${
                      allRuptured ? "text-slate-400 line-through" : "text-emerald-700"
                    }`}
                  >
                    {best.priceDa.toLocaleString("fr-DZ")} DA
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>chez</span>
                    <b className="text-slate-900 font-bold">{best.store}</b>
                    <span className="text-slate-400">({best.wilaya})</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${best.condition === "new" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {best.condition === "new" ? "Neuf" : "Occasion"}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isRuptured(best) ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}>
                      {isRuptured(best) ? "✕ Rupture" : "✓ En stock"}
                    </span>
                  </div>
                  {isRuptured(best) && (
                    <div className="text-xs text-rose-700 font-bold mt-2 bg-rose-50 border border-rose-200 rounded p-2.5 flex items-start gap-1.5">
                      <span className="shrink-0">✕</span>
                      <span>Offre constatée en rupture de stock par le marchand.</span>
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
                <div className="text-sm text-rose-600 font-bold mt-2">
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
                  aria-label={isRuptured(best) ? `Voir quand même l'offre en rupture chez ${best.store}` : `Commander sur ${best.store}`}
                  className={`w-full text-center py-3 px-4 rounded text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isRuptured(best)
                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500"
                    : "bg-[#2c87c3] hover:bg-[#1e5c85] active:bg-[#153f5b] focus-visible:ring-[#2c87c3]"}`}
                >
                  <span>{isRuptured(best) ? `Voir l'offre sur ${best.store} (En rupture)` : `Commander sur ${best.store}`}</span>
                  <span>↗</span>
                </a>

                <Link
                  href={`/fr/builder?add=${product.category}:${product.id}`}
                  className="w-full text-center py-2.5 px-4 rounded border border-slate-200 hover:border-[#2c87c3] hover:bg-blue-50/50 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>+ Ajouter au System Builder</span>
                </Link>
              </div>
            )}

            {/* Price Range Comparison info */}
            {priceStats && priceStats.diff > 0 && (
              <div className="p-3.5 rounded bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Prix le plus bas :</span>
                  <b className="text-emerald-700">{priceStats.min.toLocaleString("fr-DZ")} DA</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Prix le plus haut :</span>
                  <b className="text-slate-800">{priceStats.max.toLocaleString("fr-DZ")} DA</b>
                </div>
                <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                  <span>Économie possible :</span>
                  <span className="text-emerald-700">+{priceStats.diff.toLocaleString("fr-DZ")} DA</span>
                </div>
                {!priceStats.live && (
                  <div className="text-[11px] text-red-600 font-semibold">
                    Toutes les offres sont en rupture — prix à titre indicatif.
                  </div>
                )}
              </div>
            )}

            <p className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              ✓ Indépendant, sans commission • Relevé le {scrapedAt.slice(0, 10)}
            </p>
          </div>
          <a
            href="https://bytekstore.shop/?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=sponsor&utm_content=fr-product-buybox"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block rounded-lg border border-indigo-200/70 bg-indigo-50/50 px-3 py-2 text-[11px] leading-relaxed text-slate-600 transition-colors hover:border-indigo-300 hover:bg-indigo-50"
          >
            <span className="mr-1.5 rounded bg-indigo-500/15 px-1.5 py-0.5 text-[9px] font-extrabold uppercase tracking-widest text-indigo-600">
              Sponsor
            </span>
            Besoin d'une souris, d'un clavier ou d'un casque avec ? Bytek Store stocke des périphériques esport en Algérie.
          </a>
        </div>
      </div>
    </main>
  );
}
