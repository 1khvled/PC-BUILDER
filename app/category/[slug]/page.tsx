import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/data/products";
import { getOffers, getProducts } from "@/lib/data/catalog";
import CategoryCatalogClient from "@/components/CategoryCatalogClient";

export const revalidate = 60;

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const currentCat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!currentCat) return { title: "Catégorie non trouvée" };
  const title = `${currentCat.label} au Meilleur Prix en Algérie (DA)`;
  const description = `Comparez les prix des ${currentCat.label} disponibles dans les boutiques d'informatique en Algérie (Alger, Sétif, Oran, Blida). Stocks vérifiés et devis en Dinars Algériens (DA).`;
  return {
    title,
    description,
    keywords: [
      currentCat.label.toLowerCase(),
      `prix ${currentCat.slug} algerie`,
      `meilleur ${currentCat.slug} algerie`,
      "composants pc algerie",
      "comparateur pc dz",
    ],
    openGraph: {
      title,
      description,
      url: `/category/${params.slug}`,
      type: "website",
    },
    alternates: {
      canonical: `/category/${params.slug}`,
    },
  };
}

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const currentCat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!currentCat) {
    notFound();
  }
  // Live products and offers directly from Supabase
  const [products, offers] = await Promise.all([
    getProducts(),
    getOffers(),
  ]);

  const breadcrumbsJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Accueil", item: "https://dzpartpicker.dz/" },
      { "@type": "ListItem", position: 2, name: "Composants", item: "https://dzpartpicker.dz/#categories" },
      { "@type": "ListItem", position: 3, name: currentCat.label, item: `https://dzpartpicker.dz/category/${params.slug}` },
    ],
  };

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbsJsonLd) }}
      />
      {/* Breadcrumb Navigation */}
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/" className="hover:text-slate-900 transition-colors">
          Accueil
        </Link>
        <span>/</span>
        <span className="text-slate-400">Composants</span>
        <span>/</span>
        <span className="text-slate-900 font-semibold">{currentCat.label}</span>
      </nav>

      {/* Interactive Client Catalog with Toolbar & Denser Cards */}
      <CategoryCatalogClient slug={params.slug} catLabel={currentCat.label} offers={offers} products={products} />
    </main>
  );
}
