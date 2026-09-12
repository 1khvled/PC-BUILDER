import Link from "next/link";
import { notFound } from "next/navigation";
import { CATEGORIES } from "@/lib/data/products";
import CategoryCatalogClient from "@/components/CategoryCatalogClient";

export function generateStaticParams() {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const currentCat = CATEGORIES.find((c) => c.slug === params.slug);
  if (!currentCat) {
    notFound();
  }

  return (
    <main className="max-w-7xl mx-auto px-4 py-6 space-y-6">
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
      <CategoryCatalogClient slug={params.slug} catLabel={currentCat.label} />
    </main>
  );
}
