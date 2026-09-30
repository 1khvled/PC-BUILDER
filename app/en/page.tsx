import type { Metadata } from "next";
import Link from "next/link";
import { CATEGORIES, bestOffer, productImage, isRuptured, type Product, type Offer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { LIVE_EXTRA } from "@/lib/data/live";
import { listGuides } from "@/lib/data/guides-en";
import Thumb from "@/components/Thumb";
import BytekAd from "@/components/BytekAd";
import CategoryIcon from "@/components/CategoryIcon";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { formatPrice, languageAlternates, OG_LOCALE, SITE_URL, localizedHref } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";
import { stockLabel } from "@/lib/i18n/runtime";

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
    url: "/en",
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
    url: `${SITE_URL}/en`,
    inLanguage: "en-DZ",
    description:
      "Independent comparison of PC part prices in Algeria, in Algerian Dinars (DA).",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/en/?q={search_term_string}`,
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
    { value: "60+", label: t("home.statStores") },
    { value: "58", label: t("home.statWilayas") },
    { value: scrapedAt.slice(0, 10), label: t("home.statSnapshot") },
  ];

  const steps = [
    { n: "1", title: t("home.step1Title"), text: t("home.step1Text"), href: "/category/cpu", cta: t("home.step1Cta") },
    { n: "2", title: t("home.step2Title"), text: t("home.step2Text"), href: "/deals", cta: t("home.step2Cta") },
    { n: "3", title: t("home.step3Title"), text: t("home.step3Text"), href: "/builder", cta: t("home.step3Cta") },
  ];

  return (
    <main className="pb-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homeJsonLd(liveCount)) }}
      />

      {/* Hero band — navy gradient, circuit dots + blue glows */}
      <section className="relative overflow-hidden bg-[#11111c] text-white">
        <div className="absolute inset-0 dz-hero-grid" aria-hidden="true" />
        <div className="absolute inset-0 dz-hero-glow" aria-hidden="true" />
        {/* accent baseline */}
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#2c87c3]/60 to-transparent" aria-hidden="true" />

        <div className="relative max-w-7xl mx-auto px-4 py-14 sm:py-20">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs font-semibold text-slate-200">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-70" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                </span>
                {t("home.badge", { count: liveCount })}
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight mt-4 leading-[1.1]">
                {t("home.h1lead")}{" "}
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#5db2e8] to-[#2c87c3]">
                  {t("home.h1accent")}
                </span>{" "}
                {t("home.h1tail")}
              </h1>
              <p className="text-sm sm:text-base text-slate-300/90 mt-4 leading-relaxed max-w-2xl">
                {t("home.sub")}
              </p>
              <div className="flex flex-wrap items-center gap-3 mt-7">
                <Link href="/en/builder" className="btn-blue px-6 py-3 text-sm">
                  {t("home.ctaBuilder")}
                  <span aria-hidden="true">→</span>
                </Link>
                <Link
                  href="/en/deals"
                  className="px-6 py-3 rounded-[10px] text-sm font-bold border border-white/20 text-white hover:bg-white/10 transition-colors"
                >
                  {t("home.ctaDeals")}
                </Link>
              </div>
            </div>

            <LocaleSwitcher pathname="/en" tone="dark" />
          </div>

          {/* Stats chips */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-10 max-w-3xl">
            {stats.map((s) => (
              <div
                key={s.label}
                className="rounded-xl bg-white/[0.08] border border-white/10 px-4 py-3"
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
        {/* Bytek Store Official Partner Ad */}
        <BytekAd variant="banner" locale={LOCALE} placement="en-home-top" />

        {/* Lowest prices right now — dense price table */}
        <section className="panel">
          <div className="panel-hd">
            <span className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
              {t("home.lowestPrices")}
            </span>
            <Link href="/en/deals" className="pcpp-link font-bold normal-case tracking-normal">
              {t("home.allDeals")}
            </Link>
          </div>
          <table className="w-full text-sm">
            <caption className="sr-only">{t("home.tableCaption")}</caption>
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
                    <Link href={`/en/product/${p.id}`} className="pcpp-link font-bold text-sm">
                      {p.brand} {p.model}
                    </Link>
                    <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-1.5 flex-wrap">
                      <span>{best?.store}</span>
                      <span className="text-slate-300">•</span>
                      <span>{best?.wilaya}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-emerald-600 font-semibold inline-flex items-center gap-1 text-[11px]">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {stockLabel(best?.stock, LOCALE) || t("common.inStock")}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-2.5 text-right whitespace-nowrap">
                    <span className="font-extrabold text-emerald-700 tabular-nums group-hover:text-emerald-600 transition-colors">
                      {formatPrice(best?.priceDa ?? 0, LOCALE)}
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
            <h2 className="text-lg font-extrabold tracking-tight">{t("home.howItWorks")}</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {steps.map((s) => (
              <Link
                key={s.n}
                href={localizedHref(s.href, LOCALE)}
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

        {/* Browse by category */}
        <section>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-1 h-5 rounded-full bg-[#2c87c3]" aria-hidden="true" />
            <h2 className="text-lg font-extrabold tracking-tight">{t("home.browseByCategory")}</h2>
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
                  href={`/en/category/${c.slug}`}
                  className="panel p-4 flex items-center gap-4 group hover:border-[#2c87c3]/60 hover:shadow-card-hover transition-all"
                >
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-b from-[#3a94d2] to-[#2c87c3] text-white flex items-center justify-center shrink-0 shadow-[0_4px_12px_-4px_rgba(44,135,195,0.5)] group-hover:scale-105 transition-transform">
                    <CategoryIcon slug={c.slug} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-sm group-hover:text-[#2c87c3] transition-colors">
                      {categoryLabel(c.slug, t)}
                    </div>
                    <div className="text-xs text-slate-500 mt-1">
                      {t("common.modelsCounted", { count: items.length })}
                      {minPrice ? (
                        <span className="text-emerald-700 font-semibold">
                          {" "}• {t("common.fromPrice", { price: formatPrice(minPrice, LOCALE) })}
                        </span>
                      ) : ""}
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
                {t("home.guidesTitle")}
              </span>
              <Link href="/en/guides" className="pcpp-link font-bold normal-case tracking-normal">
                {t("home.allGuides")}
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {popularGuides.map((g) => (
                <Link key={g.slug} href={`/en/guides/${g.slug}`} className="block px-4 py-3.5 hover:bg-blue-50/40 transition-colors group">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-sm pcpp-link">{g.title}</span>
                    <span className="text-[11px] text-slate-400 shrink-0 bg-slate-100 px-2 py-0.5 rounded-full">⏱ {t("common.minRead", { min: g.readMin })}</span>
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
                {t("home.builderBadge")}
              </span>
              <h3 className="text-xl font-extrabold tracking-tight mt-3 leading-snug">
                {t("home.builderTitle")}
              </h3>
              <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                {t("home.builderText")}
              </p>
            </div>
            <Link href="/en/builder" className="relative btn-blue px-5 py-2.5 text-sm self-start mt-5">
              {t("home.builderCta")}
              <span aria-hidden="true">→</span>
            </Link>
          </section>
        </div>
      </div>
    </main>
  );
}
