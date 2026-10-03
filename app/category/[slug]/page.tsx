import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ALL_CATEGORIES as CATEGORIES, minOf } from "@/lib/data/products";
import { getOffers, getProducts } from "@/lib/data/catalog";
import CategoryCatalogClient from "@/components/CategoryCatalogClient";
import BytekAd from "@/components/BytekAd";
import AskAI from "@/components/AskAI";
import { categoryPrompt } from "@/lib/ai/prompt";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, SITE_URL, languageAlternates } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "en" as const;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const currentCat = CATEGORIES.find((c) => c.slug === params.slug);
  const t = await getT(LOCALE);
  if (!currentCat) return { title: t("category.notFound") };

  const label = categoryLabel(currentCat.slug, t);
  const title = t("category.metaTitle", { label });
  const description = t("category.metaDescription", { label });
  return {
    title,
    description,
    keywords: t("category.metaKeywords", { label, slug: currentCat.slug }).split(",").map((k) => k.trim()),
    alternates: languageAlternates(`/category/${params.slug}`, "en"),
    openGraph: {
      title,
      description: t("category.metaOgDescription", { label }),
      url: `/category/${params.slug}`,
      type: "website",
      locale: OG_LOCALE.en,
      siteName: "DZ PartPicker",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("category.metaOgDescription", { label }),
    },
  };
}

export default async function EnglishCategoryPage({ params }: { params: { slug: string } }) {
  const currentCat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!currentCat) {
    notFound();
  }
  const t = await getT(LOCALE);
  const label = categoryLabel(currentCat.slug, t);

  // Live products and offers directly from Supabase
  const [products, offers] = await Promise.all([
    getProducts(),
    getOffers(),
  ]);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: "en-DZ",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE_URL}` },
      { "@type": "ListItem", position: 2, name: "Components", item: `${SITE_URL}/#categories` },
      {
        "@type": "ListItem",
        position: 3,
        name: label,
        item: `${SITE_URL}/category/${params.slug}`,
      },
    ],
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <nav aria-label={t("common.breadcrumb")} className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          {t("common.home")}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{t("category.breadcrumbComponents")}</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{label}</span>
        <span className="ml-auto">
          <LocaleSwitcher pathname={`/category/${params.slug}`} />
        </span>
      </nav>

      {/* Interactive Client Catalog with Toolbar & Denser Cards */}
      <CategoryCatalogClient
        slug={params.slug}
        catLabel={label}
        offers={offers}
        products={products}
        locale={LOCALE}
      />

      {/* Category sponsorship. docs/MONETIZATION-PLAN.md lists this as a
          recommended slot that was never built. It sits BELOW the organic
          catalog, in its own visually separate block, and the ranking above is
          untouched - the plan's first guardrail is that organic ranking is
          never sold, so a sponsor may not buy a better position. */}
      <section aria-label={t("ad.sponsor")} className="pt-2">
        <BytekAd variant="compact" locale={LOCALE} placement={`en-category-${params.slug}`} />
      </section>
      <AskAI
        locale={LOCALE}
        placement={`en-category-${params.slug}-ai`}
        prompt={categoryPrompt({
          label,
          slug: params.slug,
          products: products.filter((p) => p.category === params.slug).length,
          cheapest: (() => {
            // Set lookup, not products.some per offer: the old form scanned the
            // whole catalogue once per offer (O(offers x products)).
            const inCat = new Set(
              products.filter((p) => p.category === params.slug).map((p) => p.id),
            );
            const prices = offers.filter((o) => inCat.has(o.productId)).map((o) => o.priceDa);
            const m = minOf(prices);
            if (m == null) return "no live price";
            return `${m.toLocaleString("en-US")} DA`;
          })(),
          locale: LOCALE,
        })}
      />
    </main>
  );
}
