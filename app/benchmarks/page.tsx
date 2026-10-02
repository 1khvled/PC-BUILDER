import type { Metadata } from "next";
import BenchmarksClient from "@/components/BenchmarksClient";
import BytekAd from "@/components/BytekAd";
import { getProducts } from "@/lib/data/catalog";
import { getT } from "@/lib/i18n/server";
import { OG_LOCALE, languageAlternates, type Locale } from "@/lib/i18n/config";

const LOCALE: Locale = "en";

export const metadata: Metadata = {
  title: "PC component specifications and performance index - Algeria",
  description:
    "Specifications for every CPU, GPU, memory kit and SSD we track, with our own clearly labelled performance estimate and links to the published sources. Baselines and method stated openly.",
  alternates: languageAlternates("/benchmarks", "en"),
  openGraph: {
    title: "PC component specifications and performance index",
    locale: OG_LOCALE.en,
  },
};

export default async function BenchmarksPage() {
  const t = await getT(LOCALE);
  // The full catalogue ships because the client filters and sorts it locally;
  // these are small records (id, category, brand, model) and it keeps filtering
  // instant instead of firing a request per keystroke.
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
      {/* Sponsor, below the reference table only. Reference pages earn trust by
          not selling the content itself; the ad sits after it, clearly separate. */}
      <div className="mt-6">
        <BytekAd variant="strip" locale={LOCALE} placement="en-benchmarks-bottom" />
      </div>
    </main>
  );
}
