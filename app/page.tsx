import type { Metadata } from "next";
import HomeRecentStrip from "@/components/HomeRecentStrip";
import CurrencyConverter from "@/components/CurrencyConverter";
import Link from "next/link";
import { CATEGORIES, SIDE_CATEGORIES, bestOffer, minOf, productImage, isRuptured, type Product, type Offer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { LIVE_EXTRA } from "@/lib/data/live";
import { listGuides } from "@/lib/data/guides-en";
import Thumb from "@/components/Thumb";
import BytekAd from "@/components/BytekAd";
import AliExpressDealsBanner from "@/components/AliExpressDealsBanner";
import CategoryIcon from "@/components/CategoryIcon";
import { formatPrice, languageAlternates, OG_LOCALE, SITE_URL, localizedHref } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";
import { pluralSuffix, stockLabel } from "@/lib/i18n/runtime";

export const revalidate = 60;

const LOCALE = "en" as const;

export const metadata: Metadata = {
  title: "Compare PC Component Prices in Algeria (DA)",
  description:
    "Independent PC component price comparison in Algeria: CPU, GPU, RAM, SSD, motherboards and monitors. Lowest prices in Algerian Dinars (DA), verified stock and delivery across all 58 wilayas.",
  keywords: [
    "pc parts price comparison algeria",
    "computer parts algeria",
    "graphics card price algeria",
    "rtx 4060 algeria price",
    "ryzen algeria price da",
    "gaming pc algeria",
    "pc build algeria",
    "ouedkniss computer parts",
    "algerian dinar hardware prices",
    "pcpartpicker algeria",
  ],
  alternates: languageAlternates("/", "en"),
  openGraph: {
    type: "website",
    locale: OG_LOCALE.en,
    title: "DZ PartPicker — Lowest PC part prices in Algeria (DA)",
    description:
      "CPU, GPU, RAM, SSD, motherboards and monitors compared in Algerian Dinars (DA) across 180+ Algerian stores. Delivery to all 58 wilayas.",
    url: "/",
    siteName: "DZ PartPicker",
    images: [{ url: "/brand/og-hero.webp", width: 1200, height: 630, alt: "DZ PartPicker — PC price comparison Algeria" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DZ PartPicker — PC part price comparison in Algeria",
    description:
      "Find PC parts at the lowest price in Algeria (DA). Zero commission, 100% organic ranking, delivery to all 58 wilayas.",
    images: ["/brand/og-hero.webp"],
  },
};

/** Home-page structured data, English edition of the French graph. */
function homeJsonLd(liveCount: number) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DZ PartPicker",
    url: `${SITE_URL}`,
    inLanguage: "en-DZ",
    description:
      "Independent comparison of PC part prices in Algeria, in Algerian Dinars (DA).",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
    mainEntity: {
      "@type": "ItemList",
      name: "Lowest PC part prices in Algeria",
      numberOfItems: liveCount,
    },
  };
}

export default async function EnglishHome() {
  const t = await getT(LOCALE);
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);
  const liveCount = offers.length + LIVE_EXTRA.length;
  const storeNames = new Set<string>();
  for (const o of offers) {
    if (o.store && o.store !== "—" && o.store.trim().length > 0) storeNames.add(o.store.trim());
  }
  for (const o of LIVE_EXTRA) {
    if (o.store && o.store !== "—" && o.store.trim().length > 0) storeNames.add(o.store.trim());
  }
  const storeCount = Math.max(storeNames.size, 200);

  const trending = products
    .map((p) => {
      const prodOffers = offers.filter((o) => o.productId === p.id && !isRuptured(o) && o.stock !== "Rupture" && o.stock !== "Sur commande");
      const best = prodOffers.length > 0 ? bestOffer(p.id, prodOffers) : undefined;
      return { p, best };
    })
    .filter((x): x is { p: Product; best: Offer } => Boolean(x.best && x.best.priceDa >= 3000))
    .sort((a, b) => a.best.priceDa - b.best.priceDa)
    .slice(0, 14);

  const popularGuides = listGuides(LOCALE).slice(0, 2);

  const stats = [
    { value: `${liveCount}`, label: t("home.statOffers") },
    { value: `${storeCount}+`, label: t("home.statStores") },
    { value: "58", label: t("home.statWilayas") },
    { value: scrapedAt.slice(0, 10), label: t("home.statSnapshot") },
  ];

  const steps = [
    { n: "1", title: t("home.step1Title"), text: t("home.step1Text"), href: "/category/cpu", cta: t("home.step1Cta") },
    { n: "2", title: t("home.step2Title"), text: t("home.step2Text"), href: "/deals", cta: t("home.step2Cta") },
    { n: "3", title: t("home.step3Title"), text: t("home.step3Text"), href: "/builder", cta: t("home.step3Cta") },
  ];

return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(liveCount)) }}
      />

      {/* ===================================================================
          MASTHEAD
          -------------------------------------------------------------------
          Short, because the product is the table directly below it. The four
          stat boxes this replaced were the clearest "landing page" tell on a
          site whose job is price lookup, so provenance is now one readable
          line of facts instead of four bordered chips.
          =================================================================== */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
          <div className="max-w-2xl">
            <h1 className="text-[28px] font-semibold leading-[1.15] text-balance sm:text-[38px]">
              {t("home.h1lead")}{" "}
              <span className="text-accent">{t("home.h1accent")}</span>{" "}
              {t("home.h1tail")}
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-pretty text-ink-2 sm:text-[15px]">
              {t("home.sub")}
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/builder" className="btn btn-primary px-4 py-2.5">
              {t("home.ctaBuilder")}
            </Link>
            <Link href="/deals" className="btn btn-secondary px-4 py-2.5">
              {t("home.ctaDeals")}
            </Link>
            <dl className="ml-auto flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {stats.map((st) => (
                <div key={st.label} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{st.label}</dt>
                  <dd className="data text-[13px] font-semibold text-ink">{st.value}</dd>
                  <span className="text-[11px] text-ink-3">{st.label}</span>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-shell space-y-8 px-4 py-8">
        {/* ===================================================================
            THE PRODUCT: a real price table, first thing on the page.

            The previous version put this in a two-column hero beside the
            headline and capped it at six rows. A comparison site should open
            on prices you can read down a column, with the store and wilaya
            that produced each one -- that is the whole value proposition, and
            it does not need a marketing band above it.
            =================================================================== */}
        <section className="panel-plain">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="h-sec">{t("home.lowestPrices")}</h2>
            <Link href="/deals" className="text-[12px] font-semibold text-accent hover:underline">
              {t("home.allDeals")}
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="dz-table min-w-[680px]">
              <caption className="sr-only">{t("home.tableCaption")}</caption>
              <thead>
                <tr>
                  <th scope="col" className="w-10 text-center">#</th>
                  {/* Inset to sit over the product name rather than the thumbnail. */}
                  <th scope="col" className="pl-[46px]">{t("category.tableProduct")}</th>
                  <th scope="col">{t("category.tableStore")}</th>
                  <th scope="col" className="w-28 text-center">{t("category.tableAvailability")}</th>
                  <th scope="col" className="text-right">{t("category.tableBestPrice")}</th>
                </tr>
              </thead>
              <tbody>
                {trending.map(({ p, best }, i) => (
                  <tr key={p.id}>
                    <td className="data text-center text-ink-4">{i + 1}</td>
                    <td>
                      <Link href={`/product/${p.id}`} className="group flex items-center gap-3">
                        <Thumb src={productImage(p)} alt={p.model} size={34} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-ink group-hover:text-accent">
                            {p.brand} {p.model}
                          </span>
                          <span className="block truncate text-[11px] text-ink-3">
                            {categoryLabel(p.category, t)}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="text-[12px]">
                      <span className="block truncate font-medium text-ink-2">{best?.store}</span>
                      <span className="block truncate text-[11px] text-ink-3">{best?.wilaya}</span>
                    </td>
                    <td className="text-center">
                      {stockLabel(best?.stock, LOCALE) ? (
                        <span className="tag tag-ok">
                          <span className="dot" aria-hidden="true" />
                          {t("common.inStock")}
                        </span>
                      ) : (
                        <span className="tag tag-bad">{t("common.outOfStock")}</span>
                      )}
                    </td>
                    <td className="num text-[14px] font-semibold text-ink">
                      {formatPrice(best?.priceDa ?? 0, LOCALE)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Categories. Price-forward and short: the from-price is the reason to
            click, so it sits alongside the label and the model count is
            secondary. No boxes -- a hairline list reads as an index, which is
            what this is. */}
        <section>
          <h2 className="h-sec mb-3">{t("home.browseByCategory")}</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((c) => {
              const items = products.filter((p) => p.category === c.slug);
              const prices = items
                .map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity)
                .filter(Number.isFinite);
              const minPrice = minOf(prices);
              const extraN = LIVE_EXTRA.filter((e) => e.category === c.slug).length;

              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group flex items-baseline justify-between gap-2 border-b border-line-soft py-2 transition-colors hover:border-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink group-hover:text-accent">
                      {categoryLabel(c.slug, t)}
                    </span>
                    <span className="text-[11px] text-ink-3">
                      {t("common.modelsCounted", {
                        count: items.length,
                        plural: pluralSuffix(items.length),
                      })}
                      {extraN > 0 && <span className="text-warn"> · +{extraN}</span>}
                    </span>
                  </span>
                  <span className="data shrink-0 text-[12px] font-semibold text-ink-2">
                    {minPrice ? formatPrice(minPrice, LOCALE) : "—"}
                  </span>
                </Link>
              );
            })}
          </div>

          {SIDE_CATEGORIES.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-3">
              <span className="text-[11px] text-ink-3">{t("home.sideProductsDesc")}</span>
              {SIDE_CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="rounded border border-line px-2 py-0.5 text-[11px] font-medium text-ink-2 transition-colors hover:border-accent hover:text-ink"
                >
                  {categoryLabel(c.slug, t)}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* How it works, as one compact strip rather than three tall cards.
            This copy stays for search intent; it just stops competing with the
            price table for attention. */}
        <section className="border-y border-line py-5">
          <h2 className="h-sub mb-3">{t("home.howItWorks")}</h2>
          <ol className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n} className="flex gap-2.5">
                <span className="data shrink-0 text-[12px] font-semibold text-accent">
                  {String(s.n).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <Link
                    href={localizedHref(s.href, LOCALE)}
                    className="text-[13px] font-medium text-ink hover:text-accent"
                  >
                    {s.title}
                  </Link>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{s.text}</p>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Sponsor. One placement, clearly subordinate: a hairline surface with
            a single accent edge, never a slab that out-weighs the data. */}
        <BytekAd variant="banner" locale={LOCALE} placement="en-home-top" />

        {/* Supporting content */}
        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <h2 className="h-sec mb-3">{t("home.guidesTitle")}</h2>
            <div className="border-t border-line">
              {popularGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group block border-b border-line-soft py-3 transition-colors hover:bg-surface-subtle"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-ink group-hover:text-accent">
                      {g.title}
                    </span>
                    <span className="data shrink-0 text-[11px] text-ink-3">
                      {t("common.minRead", { min: g.readMin })}
                    </span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-3">
                    {g.hook}
                  </p>
                </Link>
              ))}
            </div>
            <Link
              href="/guides"
              className="mt-3 inline-block text-[12px] font-semibold text-accent hover:underline"
            >
              {t("home.allGuides")}
            </Link>
          </section>

          <section className="lg:col-span-2 flex flex-col justify-between rounded-lg border border-line bg-surface-subtle p-5">
            <div>
              <span className="tag tag-ok">{t("home.builderBadge")}</span>
              <h2 className="mt-3 text-[16px] font-semibold leading-snug text-ink">
                {t("home.builderTitle")}
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
                {t("home.builderText")}
              </p>
            </div>
            <Link href="/builder" className="btn btn-primary mt-5 self-start px-4 py-2.5">
              {t("home.builderCta")}
            </Link>
          </section>
        </div>

        <HomeRecentStrip locale={"en"} />
        <AliExpressDealsBanner variant="banner" locale={LOCALE} />

        {/* USD→DA at the parallel rate. Sellers quote in dollars; the site prices
            in dinars. Without this the buyer does the multiplication by hand. */}
        <CurrencyConverter locale={LOCALE} />
      </div>
    </main>
  );
}
