import type { Metadata } from "next";
import Link from "next/link";
import { PREBUILDS } from "@/lib/data/prebuilds";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import PrebuildsClient from "@/components/PrebuildsClient";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, languageAlternates } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "fr" as const;

export const metadata: Metadata = {
  title: "PC Gamer Montés & Configurations en Algérie",
  description:
    "Trouvez et comparez les PC gamers complets et unités centrales des boutiques d'Alger, Oran, Sétif et Blida. Comparatif automatique des prix face aux pièces détachées.",
  keywords: [
    "pc gamer montes algerie",
    "pc complet algerie prix",
    "pc gaming assemble algerie",
    "unite centrale algerie prix da",
    "vente pc algerie",
  ],
  alternates: languageAlternates("/prebuilds"),
  openGraph: {
    title: "PC Gamer Montés & Unités Centrales en Algérie",
    description:
      "Comparez les PC gamers complets des boutiques algériennes face au prix exact de leurs composants achetés séparément, en Dinars Algériens (DA).",
    url: "/prebuilds",
    type: "website",
    locale: OG_LOCALE.fr,
    siteName: "DZ PartPicker",
  },
  twitter: {
    card: "summary_large_image",
    title: "PC Gamer Montés & Unités Centrales en Algérie",
    description:
      "Comparez les PC gamers complets des boutiques algériennes face au prix exact de leurs composants achetés séparément, en Dinars Algériens (DA).",
  },
};

export default async function PrebuildsPage() {
  const t = await getT(LOCALE);
  const [offers, scrapedAt] = await Promise.all([
    getOffers(),
    getScrapedAt(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-start justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              {t("prebuilds.h1")}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
            {t("prebuilds.subtitle", { date: scrapedAt.slice(0, 10) })}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <LocaleSwitcher pathname="/prebuilds" />
          <Link
            href="/builder"
            className="px-5 py-2.5 rounded-lg bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>{t("prebuilds.cta")}</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Interactive Catalog Client */}
      <PrebuildsClient prebuilds={PREBUILDS} offers={offers} />
    </main>
  );
}
