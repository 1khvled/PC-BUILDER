import type { Metadata } from "next";
import Link from "next/link";
import { PREBUILDS } from "@/lib/data/prebuilds";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import PrebuildsClient from "@/components/PrebuildsClient";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, languageAlternates } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

export const revalidate = 60;

const LOCALE = "en" as const;

export const metadata: Metadata = {
  title: "Prebuilt Gaming PCs & Full Configurations in Algeria",
  description:
    "Find and compare complete prebuilt gaming PCs and desktops from stores in Algiers, Oran, Sétif and Blida. Automatic price comparison against the same parts bought separately.",
  keywords: [
    "prebuilt gaming pc algeria",
    "ready made pc algeria price",
    "gaming pc assemble algeria",
    "pc complet da algerie",
    "desktop pc algeria price",
    "ouedkniss pc gamer complet",
  ],
  alternates: languageAlternates("/prebuilds", "en"),
  openGraph: {
    title: "Prebuilt Gaming PCs in Algeria (DA)",
    description:
      "Compare prebuilt gaming PCs from Algerian stores against the exact price of their components bought separately, in Algerian Dinars (DA).",
    url: "/en/prebuilds",
    type: "website",
    locale: OG_LOCALE.en,
    siteName: "DZ PartPicker",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prebuilt Gaming PCs in Algeria (DA)",
    description:
      "Compare prebuilt gaming PCs from Algerian stores against the exact price of their components bought separately, in Algerian Dinars (DA).",
  },
};

/**
 * NOTE: `prebuilds.meta.title` is not used here — the title is spelled out so
 * the root "| DZ PartPicker" template is applied exactly once. (The French page
 * keeps its historical double-suffixed title untouched.)
 */
export default async function EnglishPrebuildsPage() {
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
          <LocaleSwitcher pathname="/en/prebuilds" />
          <Link
            href="/en/builder"
            className="px-5 py-2.5 rounded-lg bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
          >
            <span>{t("prebuilds.cta")}</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Interactive Catalog Client */}
      <PrebuildsClient prebuilds={PREBUILDS} offers={offers} locale={LOCALE} />
    </main>
  );
}
