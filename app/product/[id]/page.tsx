import type { Metadata } from "next";
import RecordVisit from "@/components/RecordVisit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bestOffer, isRuptured, productImage } from "@/lib/data/products";
import { getOffers, getPriceHistory, getProduct, getProducts, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import ProductOffersTable from "@/components/ProductOffersTable";
import BytekAd from "@/components/BytekAd";
import PriceChart from "@/components/PriceChart";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, SITE_URL, formatNumber, formatPrice, languageAlternates } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "en" as const;

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
  const t = await getT(LOCALE);
  const product = await getProduct(params.id);
  if (!product) return { title: t("product.notFound") };

  const allOffers = await getOffers();
  const offers = allOffers.filter((o) => o.productId === product.id && !isRuptured(o));
  const minPrice = offers.length > 0 ? Math.min(...offers.map((o) => o.priceDa)) : null;

  const name = `${product.brand} ${product.model}`;
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
    alternates: languageAlternates(`/product/${product.id}`, "en"),
    openGraph: {
      title,
      description: t("product.metaOgDescription", { brand: product.brand, model: product.model }),
      url: `/product/${product.id}`,
      type: "article",
      locale: OG_LOCALE.en,
      siteName: "DZ PartPicker",
      images: imgUrl ? [{ url: imgUrl, alt: name }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("product.metaOgDescription", { brand: product.brand, model: product.model }),
      images: imgUrl ? [imgUrl] : undefined,
    },
  };
}

export default async function EnglishProductPage({ params }: { params: { id: string } }) {
  const t = await getT(LOCALE);
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
  const name = `${product.brand} ${product.model}`;
  const catLabel = categoryLabel(product.category, t);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name,
    brand: product.brand,
    category: catLabel,
    inLanguage: "en-DZ",
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
    inLanguage: "en-DZ",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}` },
      { "@type": "ListItem", position: 2, name: catLabel, item: `${SITE_URL}/category/${product.category}` },
      { "@type": "ListItem", position: 3, name, item: `${SITE_URL}/product/${product.id}` },
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

  const day = scrapedAt.slice(0, 10);

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-8">
      <RecordVisit productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />
      {/* Breadcrumbs */}
      <nav aria-label={t("common.breadcrumb")} className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          {t("common.home")}
        </Link>
        <span>/</span>
        <Link href={`/category/${product.category}`} className="hover:text-slate-900 transition-colors">
          {catLabel}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">
          {name}
        </span>
        <span className="ml-auto shrink-0">
          <LocaleSwitcher pathname={`/product/${product.id}`} />
        </span>
      </nav>

      {/* Main Product Layout with Sticky Buy Box

          On a phone the grid collapses to one column, which put the buy box -
          the cheapest price, the store, the wilaya and the availability, i.e.
          the four things the whole page exists to answer - BELOW the specs
          table, the 274-row offers comparison and the price chart. `order-1`
          on mobile lifts it directly under the breadcrumbs; `lg:order-none`
          restores the two-column desktop layout. */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Gallery Hero + Specs + Offers (8 cols) */}
        <div className="lg:col-span-8 order-2 lg:order-none space-y-8">
          {/* Gallery Hero with Badges */}
          <div className="bg-white rounded border border-slate-200 p-6 sm:p-8 relative overflow-hidden">
            {/* Top Badges Row */}
            <div className="flex flex-wrap items-center gap-2 mb-6">
              <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-blue-50 text-[#2c87c3] border border-blue-100">
                {catLabel}
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-3 py-1 rounded-full">
                {t("product.ref", { id: product.id })}
              </span>
              {allRuptured ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-rose-100 text-rose-800 border border-rose-200 flex items-center gap-1.5 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-rose-600 animate-pulse" />
                  <span>{t("product.allRuptured")}</span>
                </span>
              ) : best ? (
                <span className="text-xs font-bold px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200/80 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  <span>{t("product.bestPrice", { price: formatPrice(best.priceDa, LOCALE) })}</span>
                </span>
              ) : null}
              <span className="text-xs font-semibold px-3 py-1 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                📦 {t("common.storesIndexed", { count: offers.length, plural: offers.length > 1 ? "s" : "" })}
              </span>
            </div>

            {/* Global Out-of-stock Alert Banner */}
            {allRuptured && (
              <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-rose-200 text-rose-800 flex items-center justify-center font-extrabold text-xs shrink-0 mt-0.5">
                  ✕
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-rose-950">
                    {t("product.ruptureAlertTitle")}
                  </h3>
                  <p className="text-xs text-rose-800/90 mt-0.5 leading-relaxed">
                    {t("product.ruptureAlertText")}
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
                    {t("common.verifiedPrices")}
                  </div>
                )}
              </div>

              {/* Title & Key Highlights */}
              <div className="min-w-0 flex-1 text-center sm:text-left">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {product.brand}
                </div>
                <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 mt-0.5 leading-tight">
                  {name}
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 mt-2 leading-relaxed">
                  {t("common.organicSort")}
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
                  {t("product.specsTitle")}
                </h2>
              </div>
              <span className="text-xs text-slate-400 font-medium">{t("product.specsSource")}</span>
            </div>

            <div className="divide-y divide-slate-100">
              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs sm:text-sm">
                <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/60 transition-colors">
                  <span className="text-slate-500 font-medium">{t("product.specCategory")}</span>
                  <span className="font-bold text-slate-900">{catLabel}</span>
                </div>
                <div className="p-4 flex items-center justify-between bg-white hover:bg-slate-50/60 transition-colors">
                  <span className="text-slate-500 font-medium">{t("product.specManufacturer")}</span>
                  <span className="font-bold text-slate-900">{product.brand}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 text-xs sm:text-sm">
                <div className="p-4 flex items-center justify-between bg-slate-50/40 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-500 font-medium">{t("product.specModel")}</span>
                  <span className="font-bold text-slate-900">{product.model}</span>
                </div>
                <div className="p-4 flex items-center justify-between bg-slate-50/40 hover:bg-slate-50 transition-colors">
                  <span className="text-slate-500 font-medium">{t("product.specInternalId")}</span>
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

          {/* Dynamic Sortable Offers Table */}
          <section className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900 tracking-tight">
                {t("product.compareTitle")}
              </h2>
              <span className="text-xs text-slate-400">
                {t("product.compareMeta", { date: day })}
              </span>
            </div>
            <BytekAd variant="strip" locale={"en"} placement="en-product-offers" />
            <ProductOffersTable offers={offers} locale={LOCALE} />
          </section>

          {/* Price History (PCPartPicker signature) */}
          <section className="bg-white rounded border border-slate-200 p-4 sm:p-5 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                {t("product.historyTitle")}
              </h2>
              <span className="text-xs text-slate-400">
                {t("product.historyMeta", { count: history.length, plural: history.length > 1 ? "s" : "" })}
              </span>
            </div>
            {/* NOTE: components/PriceChart.tsx is out of scope for this change
                set — its internal labels stay in French. */}
            <PriceChart points={history} currentOffers={offers} />
          </section>

        </div>

        {/* Right Column: Sticky Buy Box (4 cols)

            `lg:sticky` sits below `top-28`: the sticky header is two stacked
            bars (~112px), so the previous `top-20` tucked the top 32px of the
            buy box - including the price label - underneath it. */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 order-1 lg:order-none space-y-4">
          <div className="bg-white rounded border border-slate-200 shadow-md p-6 space-y-5">
            {/* Header / Price */}
            <div>
              <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
                {allRuptured ? t("product.lastPriceLabel") : t("product.bestLabel")}
              </div>
              {best ? (
                <>
                  <div
                    className={`text-3xl sm:text-4xl font-extrabold tracking-tight mt-1 ${
                      allRuptured ? "text-slate-400 line-through" : "text-emerald-700"
                    }`}
                  >
                    {formatPrice(best.priceDa, LOCALE)}
                  </div>
                  <div className="text-xs text-slate-600 mt-1 flex flex-wrap items-center gap-1.5">
                    <span>{t("common.at")}</span>
                    <b className="text-slate-900 font-bold">{best.store}</b>
                    <span className="text-slate-400">({best.wilaya})</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${best.condition === "new" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"}`}>
                      {best.condition === "new" ? t("common.new") : t("common.used")}
                    </span>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${isRuptured(best) ? "bg-rose-100 text-rose-800 border border-rose-200" : "bg-emerald-100 text-emerald-800 border border-emerald-200"}`}>
                      {isRuptured(best) ? `✕ ${t("common.outOfStock")}` : `✓ ${t("common.inStock")}`}
                    </span>
                  </div>
                  {isRuptured(best) && (
                    <div className="text-xs text-rose-700 font-bold mt-2 bg-rose-50 border border-rose-200 rounded p-2.5 flex items-start gap-1.5">
                      <span className="shrink-0">✕</span>
                      <span>{t("product.ruptureNote")}</span>
                    </div>
                  )}
                  {best.condition === "used" && (
                    <div className="text-xs text-amber-700 font-semibold mt-1.5">
                      {t("product.usedNote")}
                    </div>
                  )}
                  <div className="text-[11px] text-slate-400 mt-1">
                    {t("product.stockCheckedOn", { date: day })}
                  </div>
                </>
              ) : (
                <div className="text-sm text-rose-600 font-bold mt-2">
                  {t("product.noStoreInStock")}
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
                  aria-label={isRuptured(best) ? t("product.seeOutOfStockOnAria", { store: best.store }) : t("product.orderOnAria", { store: best.store })}
                  className={`w-full text-center py-3 px-4 rounded text-white font-bold text-sm shadow-md transition-colors flex items-center justify-center gap-2 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${isRuptured(best)
                    ? "bg-rose-600 hover:bg-rose-700 active:bg-rose-800 focus-visible:ring-rose-500"
                    : "bg-[#2c87c3] hover:bg-[#1e5c85] active:bg-[#153f5b] focus-visible:ring-[#2c87c3]"}`}
                >
                  <span>{isRuptured(best) ? t("product.seeOutOfStockOn", { store: best.store }) : t("product.orderOn", { store: best.store })}</span>
                  <span>↗</span>
                </a>

                <Link
                  href={`/builder?add=${product.category}:${product.id}`}
                  className="w-full text-center py-2.5 px-4 rounded border border-slate-200 hover:border-[#2c87c3] hover:bg-blue-50/50 text-slate-800 font-semibold text-xs transition-colors flex items-center justify-center gap-1.5"
                >
                  <span>{t("product.addToBuilder")}</span>
                </Link>
              </div>
            )}

            {/* Price Range Comparison info */}
            {priceStats && priceStats.diff > 0 && (
              <div className="p-3.5 rounded bg-slate-50 border border-slate-200/80 text-xs space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>{t("product.rangeLow")}</span>
                  <b className="text-emerald-700">{formatPrice(priceStats.min, LOCALE)}</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>{t("product.rangeHigh")}</span>
                  <b className="text-slate-800">{formatPrice(priceStats.max, LOCALE)}</b>
                </div>
                <div className="flex justify-between text-slate-800 font-bold pt-1 border-t border-slate-200">
                  <span>{t("product.rangeSavings")}</span>
                  <span className="text-emerald-700">+{formatPrice(priceStats.diff, LOCALE)}</span>
                </div>
                {!priceStats.live && (
                  <div className="text-[11px] text-red-600 font-semibold">
                    {t("product.rangeAllOutOfStock")}
                  </div>
                )}
              </div>
            )}

            <p className="pt-2 border-t border-slate-100 text-xs text-slate-500">
              {t("product.footNote", { date: day })}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
