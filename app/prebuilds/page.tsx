import Link from "next/link";
import { PREBUILDS } from "@/lib/data/prebuilds";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import PrebuildsClient from "@/components/PrebuildsClient";

export const revalidate = 60;

export const metadata = {
  title: "PC Gamer Montés & Configurations en Algérie | DZ-PartPicker",
  description:
    "Trouvez et comparez les PC gamers complets et unités centrales des boutiques d'Alger, Oran, Sétif et Blida. Comparatif automatique des prix face aux pièces détachées.",
};

export default async function PrebuildsPage() {
  const [offers, scrapedAt] = await Promise.all([
    getOffers(),
    getScrapedAt(),
  ]);

  return (
    <main className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      {/* Header Banner */}
      <div className="flex flex-wrap items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
              PC Gamers Montés & Unités Centrales en Algérie
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1.5 max-w-3xl leading-relaxed">
            Configurations complètes vendues en boutiques (Alger, Oran, Sétif, Blida, etc.). Chaque PC monté est
            analysé et chiffré face au prix exact de ses composants achetés séparément • Relevé du {scrapedAt.slice(0, 10)}
          </p>
        </div>

        <Link
          href="/builder"
          className="px-5 py-2.5 rounded-lg bg-[#2c87c3] hover:bg-[#1e5c85] text-white text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <span>Créer mon build sur mesure</span>
          <span>→</span>
        </Link>
      </div>

      {/* Interactive Catalog Client */}
      <PrebuildsClient prebuilds={PREBUILDS} offers={offers} />
    </main>
  );
}
