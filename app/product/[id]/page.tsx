import type { Metadata } from "next";
import RecordVisit from "@/components/RecordVisit";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bestOffer, isRuptured, minOf, maxOf, productImage } from "@/lib/data/products";
import { getOffers, getPriceHistory, getProduct, getScrapedAt } from "@/lib/data/catalog";
import ProductHeroGallery from "@/components/ProductHeroGallery";
import ProductSpecsCard from "@/components/ProductSpecsCard";
import ProductOffersTable from "@/components/ProductOffersTable";
import ProductShareButton from "@/components/ProductShareButton";
import BytekAd from "@/components/BytekAd";
import AskAI from "@/components/AskAI";
import { productPrompt } from "@/lib/ai/prompt";
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
  const minPrice = minOf(offers.map((o) => o.priceDa));

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

  const liveOffers = offers.filter((o) => !isRuptured(o));
  const allRuptured = offers.length > 0 && liveOffers.length === 0;
  const statsPool = liveOffers.length > 0 ? liveOffers : offers;
  const priceStats = statsPool.length > 0 ? {
    min: statsPool[0].priceDa,
    max: statsPool[statsPool.length - 1].priceDa,
    diff: statsPool[statsPool.length - 1].priceDa - statsPool[0].priceDa,
    live: liveOffers.length > 0,
  } : null;

  const lowestUsedOffer = statsPool.find((o) => o.condition === "used");
  const hasCheaperUsed = Boolean(
    best &&
    best.condition === "new" &&
    lowestUsedOffer &&
    lowestUsedOffer.priceDa < best.priceDa
  );

  const day = scrapedAt.slice(0, 10);
  const specs = Object.entries(product.specs);

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
      <RecordVisit productId={product.id} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }} />

      {/* Modern Breadcrumb & Quick Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 pb-2 border-b border-slate-200/60">
        <nav aria-label={t("common.breadcrumb")} className="flex items-center gap-2 text-xs text-slate-500 min-w-0">
          <Link href="/" className="hover:text-slate-900 transition-colors flex items-center gap-1 font-medium">
            <svg className="w-3.5 h-3.5 text-slate-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span>{t("common.home")}</span>
          </Link>
          <span className="text-slate-300">/</span>
          <Link href={`/category/${product.category}`} className="hover:text-slate-900 transition-colors font-medium">
            {catLabel}
          </Link>
          <span className="text-slate-300">/</span>
          <span className="text-slate-900 font-bold truncate">
            {product.brand} {product.model}
          </span>
        </nav>

        <div className="flex items-center gap-2 ml-auto">
          <ProductShareButton
            title={`${name} — Price in Algeria`}
            label="Share"
            copiedLabel="Link Copied!"
          />
          <LocaleSwitcher pathname={`/product/${product.id}`} />
        </div>
      </div>

      {/* Main Grid: Left Stage (8 cols) + Right Sticky Buy Box (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Product Showcase + Specs + Live Offers + Price Chart */}
        <div className="lg:col-span-8 order-2 lg:order-none space-y-8 min-w-0">
          {/* Hero Header Card */}
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-7 shadow-xs">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 sm:gap-8 items-center">
              {/* Product Media Showcase Gallery */}
              <div className="md:col-span-5">
                <ProductHeroGallery
                  src={productImage(product)}
                  alt={name}
                  brand={product.brand}
                  categoryLabel={catLabel}
                  isRuptured={allRuptured}
                  locale="en"
                />
              </div>

              {/* Product Identity & Live Market Highlights */}
              <div className="md:col-span-7 space-y-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-1.5">
                    <span className="text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                      {product.brand}
                    </span>
                    <span className="text-[11px] font-mono font-semibold text-slate-500 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/80">
                      SKU: {product.id}
                    </span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
                    {name}
                  </h1>
                </div>

                {/* 4-Stat Live Market Intelligence Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Best Price
                    </span>
                    <span className="text-sm font-black text-emerald-700 tabular-nums">
                      {best ? formatPrice(best.priceDa, LOCALE) : "N/A"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Stores
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      {offers.length} {offers.length > 1 ? "shops" : "shop"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Spread
                    </span>
                    <span className="text-sm font-black text-slate-900 tabular-nums">
                      {priceStats && priceStats.diff > 0 ? `+${formatNumber(priceStats.diff, LOCALE)} DA` : "0 DA"}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                      Delivery
                    </span>
                    <span className="text-sm font-black text-slate-900">
                      58 Wilayas
                    </span>
                  </div>
                </div>

                {/* Quick Spec Highlights */}
                {specs.length > 0 && (
                  <div className="pt-2 flex flex-wrap gap-1.5">
                    {specs.slice(0, 4).map(([k, v]) => (
                      <span
                        key={k}
                        className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-md bg-slate-100/90 text-slate-800 border border-slate-200/60"
                      >
                        <span className="text-slate-400 capitalize">{k.replace(/_/g, " ")}:</span>
                        <b className="font-bold text-slate-900">{Array.isArray(v) ? v.join(", ") : String(v)}</b>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Technical Specifications Section */}
          <section id="specs" className="scroll-mt-24">
            <ProductSpecsCard
              category={product.category}
              categoryLabel={catLabel}
              brand={product.brand}
              model={product.model}
              id={product.id}
              specs={product.specs}
              locale="en"
            />
          </section>

          {/* Store Comparison Matrix */}
          <section id="offers" className="space-y-4 scroll-mt-24">
            <BytekAd variant="strip" locale="en" placement="en-product-offers" />
            <ProductOffersTable offers={offers} locale={LOCALE} />
          </section>

          {/* Historical Price Analytics Card */}
          <section className="bg-white rounded-2xl border border-slate-200/90 p-5 sm:p-6 shadow-xs space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="p-1.5 rounded-lg bg-blue-50 text-[#2c87c3] border border-blue-100">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </span>
                <div>
                  <h2 className="font-extrabold text-base text-slate-900 tracking-tight">
                    {t("product.historyTitle")}
                  </h2>
                  <p className="text-[11px] text-slate-500">
                    {t("product.historyMeta", { count: history.length, plural: history.length > 1 ? "s" : "" })}
                  </p>
                </div>
              </div>
            </div>
            <PriceChart points={history} currentOffers={offers} />
          </section>

          {/* System Builder CTA Banner */}
          <section className="rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-md relative overflow-hidden">
            <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:16px_16px] opacity-15 pointer-events-none" />
            <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-blue-500/20 text-blue-300 border border-blue-400/30">
                  <span>⚡ PC Compatibility Check</span>
                </div>
                <h3 className="text-lg font-black tracking-tight text-white">
                  Building a PC with this {catLabel.toLowerCase()}?
                </h3>
                <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                  Test automated clearance, motherboard socket compatibility, and calculate your total build cost in Algerian Dinars.
                </p>
              </div>
              <Link
                href={`/builder?add=${product.category}:${product.id}`}
                className="shrink-0 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#2c87c3] to-[#1e5c85] hover:from-[#3597d8] hover:to-[#246e9f] text-white text-xs font-black shadow-md transition-all active:scale-95"
              >
                <span>Add to Builder</span>
                <span>🛠️</span>
              </Link>
            </div>
          </section>

          {/* Ask AI Widget */}
          <AskAI
            locale={LOCALE}
            placement="en-product"
            prompt={productPrompt({
              brand: product.brand,
              model: product.model,
              category: product.category,
              bestPrice: best ? best.priceDa : null,
              bestStore: best ? best.store : null,
              offersCount: offers.length,
              locale: LOCALE,
            })}
          />
        </div>

        {/* Right Column: Sticky Buy Box (4 cols) */}
        <div className="lg:col-span-4 lg:sticky lg:top-24 order-1 lg:order-none space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-md p-5 sm:p-6 space-y-5">
            {/* Header: Best Price */}
            <div>
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  {allRuptured
                    ? t("product.lastPriceLabel")
                    : hasCheaperUsed
                    ? t("product.bestNewPriceLabel")
                    : best?.condition === "used"
                    ? t("product.bestUsedPriceLabel")
                    : t("product.bestLabel")}
                </span>
                {best && (
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    best.condition === "new" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                  }`}>
                    {best.condition === "new" ? t("common.new") : t("common.used")}
                  </span>
                )}
              </div>

              {best ? (
                <>
                  <div
                    className={`text-3xl sm:text-4xl font-black tracking-tight mt-1 tabular-nums ${
                      allRuptured ? "text-slate-400 line-through" : "text-emerald-700"
                    }`}
                  >
                    {formatPrice(best.priceDa, LOCALE)}
                  </div>

                  {/* Store & Wilaya row */}
                  <div className="text-xs text-slate-600 mt-2 flex flex-wrap items-center gap-1.5 p-2.5 rounded-xl bg-slate-50 border border-slate-200/70">
                    <span className="text-slate-400">{t("common.at")}</span>
                    <b className="text-slate-900 font-extrabold">{best.store}</b>
                    <span className="text-slate-400">•</span>
                    <span className="text-slate-600 font-medium">📍 {best.wilaya}</span>
                    <span className={`ml-auto text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isRuptured(best) ? "bg-rose-100 text-rose-800" : "bg-emerald-100 text-emerald-800"
                    }`}>
                      {isRuptured(best) ? `✕ Out of Stock` : `✓ In Stock`}
                    </span>
                  </div>

                  {hasCheaperUsed && lowestUsedOffer && (
                    <div className="mt-2 text-xs text-amber-800 bg-amber-50/80 border border-amber-200 rounded-xl p-2.5 flex items-center justify-between">
                      <span className="font-semibold">{t("product.usedFrom", { price: formatPrice(lowestUsedOffer.priceDa, LOCALE) })}</span>
                      <a href="#offers" className="font-bold text-amber-900 underline hover:text-[#2c87c3] shrink-0 ml-2">
                        {t("common.viewOffers")} ↓
                      </a>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-sm text-rose-600 font-bold mt-2">
                  {t("product.noStoreInStock")}
                </div>
              )}
            </div>

            {/* Primary Action Buttons */}
            {best && (
              <div className="space-y-2.5">
                <a
                  href={best.url}
                  target="_blank"
                  rel="noreferrer sponsored"
                  aria-label={isRuptured(best) ? t("product.seeOutOfStockOnAria", { store: best.store }) : t("product.orderOnAria", { store: best.store })}
                  className={`w-full text-center py-3.5 px-4 rounded-xl text-white font-extrabold text-sm shadow-md transition-all flex items-center justify-center gap-2 active:scale-98 ${
                    isRuptured(best)
                      ? "bg-slate-700 hover:bg-slate-800"
                      : "bg-gradient-to-r from-[#2c87c3] to-[#1e5c85] hover:from-[#3296d6] hover:to-[#226895]"
                  }`}
                >
                  <span>{isRuptured(best) ? t("product.seeOutOfStockOn", { store: best.store }) : t("product.orderOn", { store: best.store })}</span>
                  <span className="text-base leading-none">↗</span>
                </a>

                <Link
                  href={`/builder?add=${product.category}:${product.id}`}
                  className="w-full text-center py-2.5 px-4 rounded-xl border border-slate-200 hover:border-[#2c87c3] hover:bg-blue-50/50 text-slate-800 font-bold text-xs transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
                >
                  <span>{t("product.addToBuilder")}</span>
                </Link>
              </div>
            )}

            {/* Price Intelligence & Savings Breakdown */}
            {priceStats && priceStats.diff > 0 && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs space-y-2">
                <div className="flex justify-between text-slate-600">
                  <span>Lowest Price:</span>
                  <b className="text-emerald-700">{formatPrice(priceStats.min, LOCALE)}</b>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Highest Price:</span>
                  <b className="text-slate-800">{formatPrice(priceStats.max, LOCALE)}</b>
                </div>
                <div className="flex justify-between text-slate-900 font-extrabold pt-1.5 border-t border-slate-200">
                  <span>Potential Savings:</span>
                  <span className="text-emerald-700 font-black">+{formatPrice(priceStats.diff, LOCALE)}</span>
                </div>
              </div>
            )}

            {/* Algerian Trust & Delivery Assurances */}
            <div className="pt-2 border-t border-slate-100 space-y-1.5 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <span className="text-slate-400">🚚</span>
                <span>Delivery to all 58 Wilayas (Yalidine, Maystro...)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">💵</span>
                <span>Cash on delivery directly with store</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-slate-400">✓</span>
                <span>Verified prices in Algerian Dinars (DA) • Snapshot of {day}</span>
              </div>
            </div>
          </div>

          {/* Cross-Sell Sponsor Card. This was a lavender gradient
              (`from-indigo-50 to-purple-50`) which has no dark-mode counterpart
              in the remap table, so in dark mode it rendered as a pale slab
              pinned to the right of the buy box. */}
          <a
            href="https://bytekstore.shop/?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=sponsor&utm_content=en-product-buybox"
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="block rounded-lg border border-line bg-surface-subtle p-3 text-[11px] leading-relaxed text-ink-2 transition-colors hover:border-[#0a63c9]/40"
          >
            <span className="tag mr-1.5 align-middle">{t("ad.sponsor")}</span>
            {t("ad.buybox")}
          </a>
        </div>
      </div>
    </main>
  );
}
