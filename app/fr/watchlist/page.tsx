import type { Metadata } from "next";
import WatchlistClient from "@/components/WatchlistClient";
import { OG_LOCALE, languageAlternates, type Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

const LOCALE: Locale = "fr";

export const metadata: Metadata = {
  title: "Mes pièces - prix suivis",
  description:
    "Les composants PC que vous suivez, avec ce qui a changé depuis votre dernière visite. Comparez les prix suivis en dinars algériens dans plus de 180 boutiques algériennes.",
  alternates: languageAlternates("/watchlist"),
  robots: { index: false, follow: true },
  openGraph: { title: "Mes pièces - prix suivis", locale: OG_LOCALE.fr },
};

export default async function FrenchWatchlistPage() {
  const t = await getT(LOCALE);
  return (
    <main className="max-w-4xl mx-auto px-4 py-6 pb-16 md:pb-0">
      <header className="mb-5">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
          {t("watch.title")}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">{t("watch.emptyHint")}</p>
      </header>
      <WatchlistClient locale={LOCALE} />
    </main>
  );
}
