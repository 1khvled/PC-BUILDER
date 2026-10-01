import type { Metadata } from "next";
import Link from "next/link";
import BytekAd from "@/components/BytekAd";
import { GUIDES, GUIDE_UI } from "@/lib/data/guides";
import { bestOffer, productImage, type Product } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, formatPrice, languageAlternates } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "fr" as const;
const UI = GUIDE_UI.fr;

export const metadata: Metadata = {
  title: "Guides d'Achat PC Gaming en Algérie",
  description:
    "Configs PC complètes et guides d'achat par composant, chiffrés sur les prix réels relevés chaque jour dans les boutiques d'Alger, Oran et Sétif. En Dinars Algériens (DA), livraison 58 wilayas.",
  keywords: [
    "guide achat pc gaming algerie",
    "comment assembler un pc algerie",
    "config pc 1080p algerie",
    "config pc 1440p algerie",
    "guide composant pc algerie da",
    "guide occasion ouedkniss",
    "quelle carte graphique acheter algerie",
  ],
  alternates: languageAlternates("/guides"),
  openGraph: {
    title: "Guides d'Achat PC Gaming en Algérie",
    description:
      "Configs complètes et guides par composant, chiffrés aux prix réels des boutiques algériennes, en Dinars Algériens (DA).",
    url: "/fr/guides",
    type: "website",
    locale: OG_LOCALE.fr,
    siteName: "DZ PartPicker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guides d'Achat PC Gaming en Algérie",
    description:
      "Configs complètes et guides par composant, chiffrés aux prix réels des boutiques algériennes, en Dinars Algériens (DA).",
  },
};

export default async function GuidesPage() {
  const t = await getT(LOCALE);
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);
  const day = scrapedAt.slice(0, 10);

  const builds = GUIDES.filter((g) => g.kind === "build");
  const topics = GUIDES.filter((g) => g.kind === "guide");

  function renderCard(g: (typeof GUIDES)[number]) {
    const rows = g.parts.map((id) => ({
      p: products.find((x) => x.id === id) as Product | undefined,
      best: bestOffer(id, offers),
    }));
    const total = rows.reduce((sum, r) => sum + (r.best?.priceDa ?? 0), 0);
    const missing = rows.filter((r) => !r.best).length;
    const sample = rows.filter((r) => r.p).slice(0, 5);

    const tier = missing > 0
      ? { label: t("guides.tierPartial"), color: "bg-amber-50 text-amber-700 border-amber-200" }
      : total < 200000
      ? { label: t("guides.tierSmart"), color: "bg-emerald-50 text-emerald-700 border-emerald-200" }
      : total < 400000
      ? { label: t("guides.tierMid"), color: "bg-blue-50 text-blue-700 border-blue-200" }
      : { label: t("guides.tierEnthusiast"), color: "bg-purple-50 text-purple-700 border-purple-200" };

    return (
      <Link
        key={g.slug}
        href={`/fr/guides/${g.slug}`}
        className="bg-white rounded p-6 border border-slate-200/90 hover:border-[#2c87c3] flex flex-col justify-between group space-y-5 transition-colors overflow-hidden relative"
      >
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-slate-200 bg-slate-50 text-slate-600">
                {g.topic.fr}
              </span>
              {g.kind === "build" && (
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${tier.color}`}>
                  {tier.label}
                </span>
              )}
            </div>
            <span className="text-xs text-slate-500 font-medium flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded-md border border-slate-200/60">
              <span aria-hidden="true">⏱</span>
              <span>{t("common.minRead", { min: g.readMin })}</span>
            </span>
          </div>

          <h2 className="font-black text-lg sm:text-xl text-slate-900 group-hover:text-[#2c87c3] transition-colors leading-snug">
            {g.title}
          </h2>

          <p className="text-xs sm:text-sm text-slate-600 line-clamp-3 leading-relaxed">
            {g.hook}
          </p>

          <div className="pt-2 border-t border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
              {t("guides.selectedParts", { count: g.parts.length })}
            </div>
            <div className="flex items-center gap-2 overflow-hidden">
              {sample.map(({ p }) =>
                p ? (
                  <div
                    key={p.id}
                    className="p-1 rounded bg-slate-50 border border-slate-200/80 shrink-0"
                    title={`${p.brand} ${p.model}`}
                  >
                    <Thumb src={productImage(p)} alt={p.model} size={40} />
                  </div>
                ) : null,
              )}
              {g.parts.length > sample.length && (
                <div className="w-10 h-10 rounded bg-slate-100 border border-slate-200/80 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">
                  +{g.parts.length - sample.length}
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-end justify-between gap-2">
          {g.kind === "build" ? (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                {missing > 0 ? t("guides.budgetPartial") : t("guides.budgetEstimated")}
              </span>
              <div className="text-xl font-black text-emerald-700 tracking-tight">
                {missing > 0 ? `${t("common.from")} ` : ""}
                {formatPrice(total, LOCALE)}
              </div>
            </div>
          ) : (
            <div>
              <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold block">
                {UI.notABuild}
              </span>
              <div className="text-sm font-bold text-slate-700 tracking-tight pt-1">
                {UI.partsCompared.replace("{count}", String(g.parts.length))}
              </div>
            </div>
          )}

          <span className="px-3.5 py-2 rounded bg-slate-900 group-hover:bg-[#2c87c3] text-white text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0">
            <span>{t("common.read")}</span>
            <span aria-hidden="true">→</span>
          </span>
        </div>
      </Link>
    );
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-10">
      <div className="flex flex-wrap items-start justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-[#2c87c3]" />
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {t("guides.h1")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-2xl leading-relaxed">
            {t("guides.subtitle", { date: day })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher pathname="/guides" />
          <Link
            href="/fr/builder"
            className="px-5 py-2.5 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2"
          >
            <span>{t("guides.cta")}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>

      <section className="space-y-5" aria-labelledby="dz-builds">
        <div>
          <h2 id="dz-builds" className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            {UI.builds}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{UI.buildsNote}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {builds.map(renderCard)}
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="dz-topics">
        <div>
          <h2 id="dz-topics" className="text-lg sm:text-xl font-black tracking-tight text-slate-900">
            {UI.topics}
          </h2>
          <p className="text-xs text-slate-500 mt-1">{UI.topicsNote}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map(renderCard)}
        </div>
      </section>

      <section aria-label={t("ad.sponsor")} className="pt-2">
        <BytekAd variant="card" locale={LOCALE} placement="fr-guides-index" />
      </section>
    </main>
  );
}
