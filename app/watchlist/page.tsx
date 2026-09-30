import type { Metadata } from "next";
import WatchlistClient from "@/components/WatchlistClient";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";
import { OG_LOCALE, languageAlternates } from "@/lib/i18n/config";

const LOCALE: Locale = "en";

export const metadata: Metadata = {
  title: "My parts - tracked prices",
  description:
    "The PC components you are tracking, with what changed since your last visit. Compare tracked prices in Algerian Dinars across 180+ Algerian stores.",
  alternates: languageAlternates("/watchlist", "en"),
  robots: { index: false, follow: true },
  openGraph: { title: "My parts - tracked prices", locale: OG_LOCALE.en },
};

export default async function WatchlistPage() {
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
