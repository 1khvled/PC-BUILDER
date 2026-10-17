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
import { pluralSuffix } from "@/lib/i18n/runtime";

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
    .slice(0, 8);

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
    <main className="pb-12">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(liveCount)) }}
      />

      {/* ===================================================================
          HERO
          -------------------------------------------------------------------
          The previous version was a full-bleed navy slab with a dotted
          circuit texture, two radial glows and a blue-gradient word in the
          headline. In light mode it was marketing filler; in dark mode the
          slab collapsed onto the canvas and became a ~600px black void.

          The hero's actual job on a price-comparison site is to show a price.
          So it is now a paper band: type on the left, the live cheapest-offers
          table on the right, and the figures underneath. Everything is a
          surface colour, so both themes fall out of the token set with no
          special-casing.
          =================================================================== */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-shell px-4 pt-9 pb-7 sm:pt-12 sm:pb-9">
          {/* `grid-cols-1` is load-bearing, not decoration. With an implicit
              `auto` track the column sizes to the hero table's min-content --
              and a `truncate`d product name reports its FULL width as
              min-content because truncation sets `white-space: nowrap`. The
              panel therefore pushed itself 26px past the viewport on a 390px
              phone. `minmax(0, 1fr)` clamps the track to the free space. */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="dot dot-ok" aria-hidden="true" />
                <span className="label">{t("home.badge", { count: liveCount })}</span>
              </div>

              <h1 className="mt-3.5 text-[30px] font-bold leading-[1.06] tracking-[-0.032em] sm:text-[44px]">
                {t("home.h1lead")}{" "}
                <span className="text-[#0a63c9] dark:text-[#5b9cf5]">{t("home.h1accent")}</span>{" "}
                {t("home.h1tail")}
              </h1>

              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">
                {t("home.sub")}
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Link href="/builder" className="btn btn-primary px-5 py-2.5">
                  {t("home.ctaBuilder")}
                </Link>
                <Link href="/deals" className="btn btn-secondary px-5 py-2.5">
                  {t("home.ctaDeals")}
                </Link>
              </div>
            </div>

            {/* Live price table — the hero doubles as proof, not just a promise. */}
            <div className="panel self-start">
              <div className="panel-hd">
                <span className="label">{t("home.lowestPrices")}</span>
                <Link
                  href="/deals"
                  className="text-[11px] font-semibold text-[#0a63c9] hover:underline dark:text-[#5b9cf5]"
                >
                  {t("home.allDeals")}
                </Link>
              </div>
              <ul>
                {trending.slice(0, 6).map(({ p, best }, i) => (
                  <li key={p.id} className="border-b border-line-soft last:border-b-0">
                    <Link
                      href={`/product/${p.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-subtle"
                    >
                      <span className="data w-4 shrink-0 text-[11px] text-ink-4">{i + 1}</span>
                      <Thumb src={productImage(p)} alt={p.model} size={32} />
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <span className="block truncate text-[12.5px] font-medium text-ink">{p.brand} {p.model}</span>
                        <span className="block truncate text-[10.5px] text-ink-3">
                          {best?.store} · {best?.wilaya}
                        </span>
                      </span>
                      <span className="data shrink-0 text-[13px] font-semibold text-ink">
                        {formatPrice(best?.priceDa ?? 0, LOCALE)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Figures as a hairline-separated strip. Four identical bordered
              boxes were the other template tell on this page. */}
          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 border-t border-line pt-5 sm:gap-x-9">
            {stats.map((s) => (
              <div key={s.label} className="stat">
                <span className="stat-v">{s.value}</span>
                <span className="stat-k">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-shell space-y-10 px-4 py-8">
        {/* Bytek Store Official Partner Ad */}
        <BytekAd variant="banner" locale={LOCALE} placement="en-home-top" />
        <HomeRecentStrip locale={"en"} />

        {/* How it works */}
        <section>
          <h2 className="h-sec mb-3.5">{t("home.howItWorks")}</h2>
          <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {steps.map((s) => (
              <li key={s.n}>
                <Link
                  href={localizedHref(s.href, LOCALE)}
                  className="group flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors hover:border-[#0a63c3]/40 dark:hover:border-[#5b9cf5]/40"
                >
                  <span className="label">{String(s.n).padStart(2, "0")}</span>
                  <span className="mt-2 text-[14px] font-semibold text-ink">{s.title}</span>
                  <span className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-2">{s.text}</span>
                  <span className="mt-3 text-[12px] font-semibold text-[#0a63c9] group-hover:underline dark:text-[#5b9cf5]">
                    {s.cta}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Browse by category */}
        <section>
          <h2 className="h-sec mb-3.5">{t("home.browseByCategory")}</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c) => {
              const items = products.filter((p) => p.category === c.slug);
              const prices = items.map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity).filter(Number.isFinite);
              const minPrice = minOf(prices);
              const extraN = LIVE_EXTRA.filter((e) => e.category === c.slug).length;

              return (
                <Link
                  key={c.slug}
                  href={`/category/${c.slug}`}
                  className="group flex flex-col rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-[#0a63c9]/40"
                >
                  <span className="flex items-center gap-2">
                    <CategoryIcon slug={c.slug} className="h-4 w-4 shrink-0 text-ink-3 group-hover:text-[#0a63c9] dark:group-hover:text-[#5b9cf5]" />
                    <span className="truncate text-[13px] font-semibold text-ink">{categoryLabel(c.slug, t)}</span>
                  </span>
                  <span className="mt-2.5 block">
                    <span className="label block">{minPrice ? t("common.from") : "\u00a0"}</span>
                    <span className="data mt-0.5 block text-[15px] font-semibold leading-none text-ink">
                      {minPrice ? formatPrice(minPrice, LOCALE) : "\u2014"}
                    </span>
                  </span>
                  <span className="mt-1.5 text-[11px] text-ink-3">
                    {t("common.modelsCounted", { count: items.length, plural: pluralSuffix(items.length) })}
                    {extraN > 0 && <span className="text-[#8a5d00] dark:text-[#f0c168]"> · +{extraN} live</span>}
                  </span>
                </Link>
              );
            })}
          </div>
          {SIDE_CATEGORIES.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <span className="label">{t("home.sideProductsTag")}</span>
              <span className="text-[11px] text-ink-3">{t("home.sideProductsDesc")}</span>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {SIDE_CATEGORIES.map((c) => {
                  const items = products.filter((p) => p.category === c.slug);
                  const prices = items.map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity).filter(Number.isFinite);
                  const minPrice = minOf(prices);
                  return (
                    <Link
                      key={c.slug}
                      href={`/category/${c.slug}`}
                      className="inline-flex items-center gap-1.5 rounded border border-line bg-surface px-2 py-1 text-[11px] font-medium text-ink-2 transition-colors hover:border-[#0a63c9]/40 hover:text-ink"
                    >
                      <CategoryIcon slug={c.slug} className="h-3.5 w-3.5 text-ink-3" />
                      <span>{categoryLabel(c.slug, t)}</span>
                      {minPrice && (
                        <span className="data text-ink-3">{formatPrice(minPrice, LOCALE)}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* AliExpress Deals & Coupons Telegram Channel */}
        <AliExpressDealsBanner variant="banner" locale={LOCALE} />

        {/* Guides & Builder CTA */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <section className="panel lg:col-span-3">
            <div className="panel-hd">
              <span className="label">{t("home.guidesTitle")}</span>
              <Link
                href="/guides"
                className="text-[11px] font-semibold text-[#0a63c9] hover:underline dark:text-[#5b9cf5]"
              >
                {t("home.allGuides")}
              </Link>
            </div>
            <div>
              {popularGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/guides/${g.slug}`}
                  className="group block border-b border-line-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-ink group-hover:text-[#0a63c9] dark:group-hover:text-[#5b9cf5]">
                      {g.title}
                    </span>
                    <span className="data shrink-0 text-[10.5px] text-ink-3">
                      {t("common.minRead", { min: g.readMin })}
                    </span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink-3">{g.hook}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* Builder promo — a flat panel, not a second dark slab. */}
          <section className="lg:col-span-2 panel flex flex-col justify-between p-5">
            <div>
              <span className="tag tag-ok">{t("home.builderBadge")}</span>
              <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-ink">
                {t("home.builderTitle")}
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
                {t("home.builderText")}
              </p>
            </div>
            <Link href="/builder" className="btn btn-primary mt-5 self-start px-4 py-2.5">
              {t("home.builderCta")}
            </Link>
          </section>
        </div>

        {/* USD→DA at the parallel rate. Sellers quote in dollars; the site prices
            in dinars. Without this the buyer does the multiplication by hand. */}
        <CurrencyConverter locale={LOCALE} />
      </div>
    </main>
  );
}
