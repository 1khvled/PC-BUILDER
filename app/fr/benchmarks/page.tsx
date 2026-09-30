import type { Metadata } from "next";
import BenchmarksClient from "@/components/BenchmarksClient";
import { getProducts } from "@/lib/data/catalog";
import { getT } from "@/lib/i18n/server";
import { OG_LOCALE, languageAlternates, type Locale } from "@/lib/i18n/config";

const LOCALE: Locale = "fr";

export const metadata: Metadata = {
  title: "Benchmarks PC en Algérie - indice CPU, GPU, RAM et SSD",
  description:
    "Indice de performance de tous les CPU, GPU, kits mémoire et SSD suivis, avec la source indiquée sous chaque chiffre. Méthodologie et bases de référence publiées ouvertement.",
  alternates: languageAlternates("/benchmarks"),
  openGraph: { title: "Benchmarks PC - indice de performance", locale: OG_LOCALE.fr },
};

export default async function FrenchBenchmarksPage() {
  const t = await getT(LOCALE);
  const products = await getProducts();

  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-16 md:pb-0">
      <header className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t("benchmarks.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("benchmarks.subtitle")}</p>
      </header>
      <BenchmarksClient products={products} locale={LOCALE} />
    </main>
  );
}
