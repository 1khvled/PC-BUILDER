import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { findGuide } from "@/lib/data/guides-en";
import { bestOffer, productImage } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, SITE_URL, formatPrice, languageAlternates } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "en" as const;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = await getT(LOCALE);
  const guide = findGuide(params.slug, LOCALE);
  if (!guide) return { title: t("guide.notFound") };
  return {
    title: guide.title,
    description: guide.hook,
    keywords: [
      `${guide.title}`.toLowerCase(),
      "pc buying guide algeria",
      "gaming pc build algeria",
      "pc parts price algeria da",
      "ouedkniss used hardware",
    ],
    alternates: languageAlternates(`/guides/${guide.slug}`, "en"),
    openGraph: {
      title: `${guide.title} | DZ PartPicker`,
      description: guide.hook,
      url: `/en/guides/${guide.slug}`,
      type: "article",
      locale: OG_LOCALE.en,
      siteName: "DZ PartPicker",
    },
    twitter: {
      card: "summary_large_image",
      title: `${guide.title} | DZ PartPicker`,
      description: guide.hook,
    },
  };
}

export default async function EnglishGuidePage({ params }: { params: { slug: string } }) {
  const t = await getT(LOCALE);
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);
  const guide = findGuide(params.slug, LOCALE);
  if (!guide) notFound();

  const rows = guide.parts
    .map((id) => ({ p: products.find((x) => x.id === id), best: bestOffer(id, offers) }))
    .filter((x) => x.p);

  const total = rows.reduce((s, r) => s + (r.best?.priceDa ?? 0), 0);
  const builderQuery = rows.map((r) => `${r.p!.category}:${r.p!.id}`).join(",");
  const missing = rows.filter((r) => !r.best).length;
  const day = scrapedAt.slice(0, 10);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    inLanguage: "en-DZ",
    headline: guide.title,
    description: guide.hook,
    url: `${SITE_URL}/en/guides/${guide.slug}`,
    author: { "@type": "Organization", name: "DZ PartPicker" },
    publisher: { "@type": "Organization", name: "DZ PartPicker" },
    mainEntityOfPage: `${SITE_URL}/en/guides/${guide.slug}`,
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }} />

      {/* Breadcrumbs */}
      <nav aria-label={t("common.breadcrumb")} className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/en" className="hover:text-slate-900 transition-colors">
          {t("common.home")}
        </Link>
        <span>/</span>
        <Link href="/en/guides" className="hover:text-slate-900 transition-colors">
          {t("common.guides")}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{guide.title}</span>
        <span className="ml-auto shrink-0">
          <LocaleSwitcher pathname={`/en/guides/${guide.slug}`} />
        </span>
      </nav>

      {/* Magazine Title & Author Header */}
      <div className="bg-white rounded p-6 sm:p-10 border border-slate-200 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2c87c3] border border-blue-100">
              {t("guide.badge")}
            </span>
            <span className="text-xs text-slate-400">
              ⏱ {t("common.minRead", { min: guide.readMin })}
            </span>
          </div>

          <span className="text-xs font-medium text-slate-500 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200/70">
            {t("common.snapshotOn", { date: day })}
          </span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          {guide.title}
        </h1>

        {/* Author Chip */}
        <div className="flex items-center gap-3 pt-1 border-t border-slate-100">
          <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs">
            DZ
          </div>
          <div>
            <div className="text-xs font-bold text-slate-900">{t("guide.author")}</div>
            <div className="text-[11px] text-slate-400">{t("guide.authorSub")}</div>
          </div>
        </div>

        <p className="text-sm sm:text-base text-slate-600 leading-relaxed pt-2">
          {guide.hook}
        </p>

        {/* Budget Highlight Card */}
        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 bg-[#11111c] text-white rounded p-5 sm:p-6 mt-4 shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {t("guide.budgetTotal")}
            </div>
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight mt-1">
              {missing > 0 ? `${t("common.from")} ` : ""}
              {formatPrice(total, LOCALE)}
            </div>
            <div className="text-xs text-slate-400 mt-1">
              {t("guide.budgetAvail")}
            </div>
          </div>
          <Link
            href={`/en/builder?p=${encodeURIComponent(builderQuery)}`}
            className="px-5 py-3 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <span>{t("guide.openInBuilder")}</span>
            <span>→</span>
          </Link>
        </div>

        {missing > 0 && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-3.5">
            {t("guide.missingParts", { count: missing })}
          </p>
        )}
      </div>

      {/* Recommended Parts Table */}
      <div className="bg-white rounded border border-slate-200 overflow-hidden">
        <div className="p-4 bg-slate-50/80 border-b border-slate-200 flex items-center justify-between text-xs font-bold uppercase tracking-wider text-slate-500">
          <span>{t("guide.recommended", { count: rows.length })}</span>
          <span className="text-slate-400 font-normal normal-case">{t("guide.verifiedWilayas")}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-400 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3">{t("guide.thComponent")}</th>
                <th className="text-left px-3 py-3">{t("guide.thStore")}</th>
                <th className="text-right px-4 py-3">{t("guide.thPrice")}</th>
                <th className="text-right px-4 py-3 w-28">{t("guide.thAction")}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {rows.map(({ p, best }) => (
                <tr key={p!.id} className="hover:bg-blue-50/30 transition-colors group">
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <Thumb src={productImage(p!)} alt={p!.model} size={44} />
                      <div className="min-w-0">
                        <Link
                          href={`/en/product/${p!.id}`}
                          className="font-bold text-sm text-[#2c87c3] hover:underline block truncate"
                        >
                          {p!.brand} {p!.model}
                        </Link>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                          {categoryLabel(p!.category, t)}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="px-3 py-3.5 text-slate-600">
                    {best ? (
                      <div>
                        <div className="font-semibold text-slate-800">{best.store}</div>
                        <div className="text-[11px] text-slate-400">{best.wilaya}</div>
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">{t("common.noIndexedOffer")}</span>
                    )}
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    <span className="font-bold text-sm text-slate-900 tabular-nums">
                      {best ? formatPrice(best.priceDa, LOCALE) : "—"}
                    </span>
                  </td>

                  <td className="px-4 py-3.5 text-right">
                    {best ? (
                      <a
                        href={best.url}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-1.5 rounded bg-slate-900 hover:bg-[#2c87c3] text-white font-bold text-xs transition-colors"
                      >
                        <span>{t("guide.view")}</span>
                        <span className="ml-1">↗</span>
                      </a>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Guide Content Sections */}
      <div className="bg-white rounded p-6 sm:p-10 border border-slate-200 space-y-8">
        {guide.blocks.map((b, i) => (
          <section key={i} className="space-y-3">
            {b.h && (
              <h2 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2c87c3]" />
                <span>{b.h}</span>
              </h2>
            )}
            {(b.p ?? []).map((txt, j) => (
              <p key={j} className="text-sm text-slate-700 leading-relaxed">
                {txt}
              </p>
            ))}
            {b.list && (
              <ul className="list-disc pl-5 space-y-2 text-sm text-slate-700">
                {b.list.map((txt, j) => (
                  <li key={j} className="leading-relaxed">{txt}</li>
                ))}
              </ul>
            )}
          </section>
        ))}

        {/* Pitfalls Callout */}
        <section className="bg-amber-50/80 border border-amber-200/90 rounded p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <span className="text-lg">⚠️</span>
            <h3 className="font-black">{t("guide.pitfallsTitle")}</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-amber-950 leading-relaxed">
            {guide.pitfalls.map((txt, j) => (
              <li key={j}>{txt}</li>
            ))}
          </ul>
        </section>
      </div>

      {/* Footer Navigation Buttons */}
      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={`/en/builder?p=${encodeURIComponent(builderQuery)}`}
          className="px-6 py-3 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white font-bold text-sm transition-colors"
        >
          {t("guide.adaptBuild")}
        </Link>
        <Link
          href="/en/guides"
          className="px-6 py-3 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors"
        >
          {t("guide.exploreAll")}
        </Link>
      </div>
    </main>
  );
}
