import type { Metadata } from "next";
import Link from "next/link";
import { isRuptured, productImage } from "@/lib/data/products";
import { getOffers, getPriceHistory, getProducts, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import BytekAd from "@/components/BytekAd";
import EmptyState from "@/components/EmptyState";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, formatPrice, languageAlternates, type Locale } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

const LOCALE: Locale = "fr";
const WINDOW_DAYS = 7;
const MIN_PCT = 0.05;
const MIN_SAVING = 2000;

export const revalidate = 3600;

export async function generateMetadata(): Promise<Metadata> {
  const t = await getT(LOCALE);
  return {
    title: t("drops.meta.title"),
    description: t("drops.meta.description"),
    alternates: languageAlternates("/drops", "fr"),
    openGraph: { title: t("drops.meta.title"), locale: OG_LOCALE.fr },
  };
}

interface Drop {
  id: string;
  brand: string;
  model: string;
  category: string;
  then: number;
  now: number;
  saving: number;
  pct: number;
  store: string;
  wilaya: string;
  image?: string;
}

async function computeDrops(): Promise<Drop[]> {
  const [products, offers] = await Promise.all([getProducts(), getOffers()]);
  const cutoff = new Date(Date.now() - WINDOW_DAYS * 86400000).toISOString().slice(0, 10);
  const out: Drop[] = [];

  await Promise.all(
    products.map(async (p) => {
      const live = offers.filter((o) => o.productId === p.id && o.condition === "new" && !isRuptured(o));
      if (live.length === 0) return;
      const nowBest = live.reduce((a, b) => (a.priceDa <= b.priceDa ? a : b));

      let history: { day: string; price: number }[] = [];
      try {
        history = await getPriceHistory(p.id);
      } catch {
        return;
      }
      const old = history.filter((h) => h.day <= cutoff);
      if (old.length === 0) return;
      const thenBest = old.reduce((a, b) => (a.price <= b.price ? a : b)).price;
      if (thenBest <= nowBest.priceDa) return;

      const saving = thenBest - nowBest.priceDa;
      const pct = saving / thenBest;
      if (pct < MIN_PCT || saving < MIN_SAVING) return;
      out.push({
        id: p.id,
        brand: p.brand,
        model: p.model,
        category: p.category,
        image: productImage(p),
        then: thenBest,
        now: nowBest.priceDa,
        saving,
        pct,
        store: nowBest.store,
        wilaya: nowBest.wilaya,
      });
    }),
  );
  return out.sort((a, b) => b.saving - a.saving);
}

export default async function FrenchDropsPage() {
  const t = await getT(LOCALE);
  const [drops, scrapedAt] = await Promise.all([computeDrops(), getScrapedAt()]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-6">
      <nav aria-label={t("common.breadcrumb")} className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/fr" className="hover:text-slate-900">
          {t("common.home")}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-900">{t("drops.h1")}</span>
        <span className="ml-auto">
          <LocaleSwitcher pathname="/drops" />
        </span>
      </nav>

      <header className="mb-5 mt-3">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
          {t("drops.h1")}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {t("drops.subtitle", { days: WINDOW_DAYS })} • {scrapedAt.slice(0, 10)}
        </p>
      </header>

      <BytekAd variant="strip" locale={LOCALE} placement="fr-drops" />

      {drops.length === 0 ? (
        <div className="mt-6">
          <EmptyState
            type="products"
            title={t("drops.h1")}
            description={t("drops.empty", { days: WINDOW_DAYS })}
          />
        </div>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {drops.map((d) => (
            <li key={d.id}>
              <Link
                href={`/fr/product/${d.id}`}
                className="group flex h-full flex-col rounded-xl border border-slate-200 bg-white p-4 transition-all hover:-translate-y-0.5 hover:border-[#2c87c3]/60 hover:shadow-card-hover"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    {d.category}
                  </span>
                  <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-[11px] font-extrabold text-emerald-800">
                    −{Math.round(d.pct * 100)}%
                  </span>
                </div>
                <div className="mt-1 flex items-center gap-2">
                  {d.image ? <Thumb src={d.image} alt={d.model} size={32} /> : null}
                  <span className="truncate text-sm font-bold text-slate-900 group-hover:text-[#2c87c3]">
                    {d.brand} {d.model}
                  </span>
                </div>
                <div className="mt-2 flex items-baseline gap-2 font-mono tabular-nums">
                  <span className="text-xs text-slate-400 line-through">{formatPrice(d.then, LOCALE)}</span>
                  <span className="text-lg font-extrabold text-emerald-700">{formatPrice(d.now, LOCALE)}</span>
                </div>
                <div className="mt-1 text-[11px] text-slate-500">
                  {t("drops.now")}: {d.store} ({d.wilaya}) • −{formatPrice(d.saving, LOCALE)}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
