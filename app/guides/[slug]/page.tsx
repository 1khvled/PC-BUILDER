import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { GUIDE_UI } from "@/lib/data/guides";
import { findGuide, listGuides } from "@/lib/data/guides-en";
import { bestOffer, productImage } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, absoluteUrl, formatPrice, languageAlternates } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "en" as const;
const UI = GUIDE_UI.en;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = await getT(LOCALE);
  const guide = findGuide(params.slug, LOCALE);
  if (!guide) return { title: t("guide.notFound") };
  const path = `/guides/${guide.slug}`;
  return {
    title: guide.title,
    description: guide.hook,
    keywords: [
      guide.title.toLowerCase(),
      "pc buying guide algeria",
      "gaming pc build algeria",
      "pc parts price algeria da",
      "ouedkniss used hardware",
    ],
    alternates: languageAlternates(path, "en"),
    openGraph: {
      title: `${guide.title} | DZ PartPicker`,
      description: guide.hook,
      url: path,
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

/**
 * JSON.stringify does not escape "<", so a literal `</script>` inside any
 * string would terminate the tag early and inject markup. Escaping "<" as
 * `<` is valid JSON and removes the breakout.
 */
function jsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

/** Stable, index-friendly anchor id for a guide section heading. */
function sectionId(h: string, i: number): string {
  const slug = h
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
  return `section-${i + 1}-${slug || "x"}`;
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
  const isBuild = guide.kind === "build";

  const sections = guide.blocks
    .map((b, i) => ({ b, i, id: b.h ? sectionId(b.h, i) : null }))
    .filter((s) => s.id);
  const related = listGuides(LOCALE).filter((g) => g.slug !== guide.slug).slice(0, 3);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    inLanguage: "en-DZ",
    headline: guide.title,
    description: guide.hook,
    url: absoluteUrl(`/guides/${guide.slug}`),
    mainEntityOfPage: absoluteUrl(`/guides/${guide.slug}`),
    datePublished: `${day}T00:00:00.000Z`,
    dateModified: `${day}T00:00:00.000Z`,
    wordCount: guide.blocks.reduce(
      (n, b) => n + (b.p ?? []).join(" ").split(/\s+/).length + (b.list ?? []).join(" ").split(/\s+/).length,
      guide.title.split(/\s+/).length + guide.hook.split(/\s+/).length,
    ),
    timeRequired: `PT${guide.readMin}M`,
    articleSection: guide.topic.en,
    keywords: guide.pitfalls.join(", "),
    image: absoluteUrl("/brand/og-hero.webp"),
    author: { "@id": `${absoluteUrl("/").replace(/\/$/, "")}/#organization` },
    publisher: {
      "@type": "Organization",
      name: "DZ PartPicker",
      url: absoluteUrl("/"),
    },
    isPartOf: {
      "@type": "WebSite",
      name: "DZ PartPicker",
      url: absoluteUrl("/"),
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: t("common.home"), item: absoluteUrl("/") },
      { "@type": "ListItem", position: 2, name: t("common.guides"), item: absoluteUrl("/guides") },
      { "@type": "ListItem", position: 3, name: guide.title, item: absoluteUrl(`/guides/${guide.slug}`) },
    ],
  };

  return (
    <main className="max-w-4xl mx-auto px-4 py-8 space-y-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLd([articleJsonLd, breadcrumbJsonLd]) }}
      />

      <nav aria-label={t("common.breadcrumb")} className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          {t("common.home")}
        </Link>
        <span>/</span>
        <Link href="/guides" className="hover:text-slate-900 transition-colors">
          {t("common.guides")}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-semibold truncate">{guide.title}</span>
        <span className="ml-auto shrink-0">
          <LocaleSwitcher pathname={`/guides/${guide.slug}`} />
        </span>
      </nav>

      <div className="bg-white rounded p-6 sm:p-10 border border-slate-200 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-[#2c87c3] border border-blue-100">
              {guide.topic.en}
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

        <div className="pt-2 flex flex-wrap items-center justify-between gap-4 bg-[#11111c] text-white rounded p-5 sm:p-6 mt-4 shadow-lg">
          <div>
            <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {isBuild ? t("guide.budgetTotal") : UI.partsCompared.replace("{count}", String(guide.parts.length))}
            </div>
            {isBuild ? (
              <>
                <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400 tracking-tight mt-1">
                  {missing > 0 ? `${t("common.from")} ` : ""}
                  {formatPrice(total, LOCALE)}
                </div>
                <div className="text-xs text-slate-400 mt-1">{t("guide.budgetAvail")}</div>
              </>
            ) : (
              <div className="text-sm text-slate-300 mt-2 max-w-md leading-relaxed">
                {UI.notABuild}
              </div>
            )}
          </div>
          <Link
            href={`/builder?p=${encodeURIComponent(builderQuery)}`}
            className="px-5 py-3 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white font-bold text-xs sm:text-sm shadow-md transition-colors flex items-center gap-2 shrink-0"
          >
            <span>{t("guide.openInBuilder")}</span>
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        {missing > 0 && (
          <p className="text-xs text-amber-800 bg-amber-50 border border-amber-200 rounded p-3.5">
            {t("guide.missingParts", { count: missing })}
          </p>
        )}

        <p className="text-[11px] text-slate-400 leading-relaxed border-t border-slate-100 pt-3">
          {UI.priceNote.replace("{date}", day)}
        </p>
      </div>

      {sections.length >= 3 && (
        <nav aria-label={UI.toc} className="bg-white rounded border border-slate-200 p-5 sm:p-6">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-3">
            {UI.toc}
          </div>
          <ol className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 list-decimal pl-5 text-sm text-slate-700">
            {sections.map((s) => (
              <li key={s.id} className="leading-snug">
                <a href={`#${s.id}`} className="hover:text-[#2c87c3] transition-colors">
                  {s.b.h}
                </a>
              </li>
            ))}
          </ol>
        </nav>
      )}

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
                          href={`/product/${p!.id}`}
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
                        rel="noreferrer noopener"
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

      <div className="bg-white rounded p-6 sm:p-10 border border-slate-200 space-y-8">
        {guide.blocks.map((b, i) => (
          <section key={i} id={b.h ? sectionId(b.h, i) : undefined} className="space-y-3 scroll-mt-20">
            {b.h && (
              <h2 className="font-black text-xl text-slate-900 tracking-tight flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#2c87c3]" aria-hidden="true" />
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

        <section className="bg-amber-50/80 border border-amber-200/90 rounded p-5 sm:p-6 space-y-3">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <span className="text-lg" aria-hidden="true">⚠️</span>
            <h3 className="font-black">{t("guide.pitfallsTitle")}</h3>
          </div>
          <ul className="list-disc pl-5 space-y-1.5 text-xs sm:text-sm text-amber-950 leading-relaxed">
            {guide.pitfalls.map((txt, j) => (
              <li key={j}>{txt}</li>
            ))}
          </ul>
        </section>
      </div>

      <section className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400">
          {UI.related}
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {related.map((g) => (
            <Link
              key={g.slug}
              href={`/guides/${g.slug}`}
              className="bg-white rounded border border-slate-200 hover:border-[#2c87c3] p-4 flex flex-col gap-2 transition-colors"
            >
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {g.topic.en} · {t("common.minRead", { min: g.readMin })}
              </span>
              <span className="text-sm font-bold text-slate-900 leading-snug">{g.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="flex flex-wrap gap-3 pt-2">
        <Link
          href={`/builder?p=${encodeURIComponent(builderQuery)}`}
          className="px-6 py-3 rounded bg-[#2c87c3] hover:bg-[#1e5c85] text-white font-bold text-sm transition-colors"
        >
          {t("guide.adaptBuild")}
        </Link>
        <Link
          href="/guides"
          className="px-6 py-3 rounded bg-white border border-slate-200 hover:bg-slate-50 text-slate-800 font-semibold text-sm transition-colors"
        >
          {t("guide.exploreAll")}
        </Link>
      </div>
    </main>
  );
}
