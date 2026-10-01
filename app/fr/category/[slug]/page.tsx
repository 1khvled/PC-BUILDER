import type { Metadata } from "next";
import Link from "next/link";
import BytekAd from "@/components/BytekAd";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/data/products";
import { getOffers, getProducts } from "@/lib/data/catalog";
import CategoryCatalogClient from "@/components/CategoryCatalogClient";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, SITE_URL, languageAlternates } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const t = await getT("fr");
  const currentCat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!currentCat) return { title: t("category.notFound") };
  // The French route keeps its historical CATEGORIES label ("CPU", "Video Card", …)
  // so existing French SERP snippets do not change; only the /en mirror uses the
  // localized `cats.*` labels.
  const label = currentCat.label;
  const title = t("category.metaTitle", { label });
  const description = t("category.metaDescription", { label });
  return {
    title,
    description,
    keywords: t("category.metaKeywords", { label, slug: currentCat.slug }).split(",").map((k) => k.trim()),
    openGraph: {
      title,
      description: t("category.metaOgDescription", { label }),
      url: `/category/${params.slug}`,
      type: "website",
      locale: OG_LOCALE.fr,
      siteName: "DZ PartPicker",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description: t("category.metaOgDescription", { label }),
    },
    alternates: languageAlternates(`/category/${params.slug}`),
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const currentCat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!currentCat) {
    notFound();
  }
  const t = await getT("fr");
  // Live products and offers directly from Supabase
  const [products, offers] = await Promise.all([
    getProducts(),
    getOffers(),
  ]);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    inLanguage: "fr-DZ",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: `${SITE_URL}/` },
      { "@type": "ListItem", position: 2, name: "Composants", item: `${SITE_URL}/#categories` },
      { "@type": "ListItem", position: 3, name: currentCat.label, item: `${SITE_URL}/category/${params.slug}` },
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
        <Link href="/fr" className="hover:text-slate-900 transition-colors">
          {t("common.home")}
        </Link>
        <span>/</span>
        <span className="text-slate-400">{t("category.breadcrumbComponents")}</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{currentCat.label}</span>
        <span className="ml-auto">
          <LocaleSwitcher pathname={`/category/${params.slug}`} />
        </span>
      </nav>

      {/* Interactive Client Catalog with Toolbar & Denser Cards */}
      <CategoryCatalogClient slug={params.slug} catLabel={currentCat.label} offers={offers} products={products} locale="fr" />

      {/* Sponsorship. Placed below all organic content, in its own block, so it
          cannot be mistaken for a ranked result - the first guardrail in
          docs/MONETIZATION-PLAN.md is that organic ranking is never sold. */}
      <section aria-label={t("ad.sponsor")} className="pt-2">
        <BytekAd variant="compact" locale="fr" placement={`fr-category-${params.slug}`} />
      </section>
    </main>
  );
}
