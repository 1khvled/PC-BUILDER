import type { Metadata } from "next";
import Link from "next/link";
import { isRuptured, productImage, type Offer, type Product } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";
import BytekAd from "@/components/BytekAd";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, formatNumber, formatPrice, languageAlternates } from "@/lib/i18n/config";
import { getT } from "@/lib/i18n/server";

interface Deal {
  id: string;
  brand: string;
  model: string;
  category: string;
  best: number;
  store: string;
  wilaya: string;
  avg: number;
  drop: number;
  saving: number;
  n: number;
}

function deals(products: Product[], offers: Offer[]): Deal[] {
  const out: Deal[] = [];
  for (const p of products) {
    const fresh = offers.filter((o) => o.productId === p.id && o.condition === "new" && !isRuptured(o));
    if (fresh.length < 3) continue;
    const prices = fresh.map((o) => o.priceDa).sort((a, b) => a - b);
    const best = prices[0];
    const avg = prices[Math.floor(prices.length / 2)]; // médiane : insensible aux prix absurdes
    const drop = (avg - best) / avg;
    const saving = avg - best;
    if (drop < 0.08 || saving < 2000) continue;
    const winner = fresh.find((o) => o.priceDa === best);
    out.push({
      id: p.id, brand: p.brand, model: p.model, category: p.category,
      best, store: winner?.store ?? "—", wilaya: winner?.wilaya ?? "",
      avg, drop, saving, n: fresh.length,
    });
  }
  return out.sort((a, b) => b.saving - a.saving);
}

export const revalidate = 60;

const LOCALE = "en" as const;

export const metadata: Metadata = {
  title: "PC Component Deals in Algeria (DA)",
  description:
    "Discover the best promotions and price drops on processors, graphics cards, SSD and RAM in Algeria. Real savings measured against each product's market median.",
  keywords: [
    "pc deals algeria",
    "pc component promotions algeria",
    "cheap gpu algeria",
    "ssd price drop algeria",
    "pc parts discount da",
    "algeria pc deals",
  ],
  alternates: languageAlternates("/deals", "en"),
  openGraph: {
    title: "PC Component Deals in Algeria (DA)",
    description:
      "New offers at least 8% below their product's market median, measured live in Algerian Dinars (DA).",
    url: "/en/deals",
    type: "website",
    locale: OG_LOCALE.en,
    siteName: "DZ PartPicker",
  },
  twitter: {
    card: "summary_large_image",
    title: "PC Component Deals in Algeria (DA)",
    description:
      "New offers at least 8% below their product's market median, measured live in Algerian Dinars (DA).",
  },
};

export default async function EnglishDealsPage() {
  const t = await getT(LOCALE);
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);
  const list = deals(products, offers);
  const productsMap = new Map(products.map((p) => [p.id, p]));
  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">{t("deals.h1")}</h1>
          <p className="text-xs text-slate-400">
            {t("deals.subtitle", { date: scrapedAt.slice(0, 10) })}
          </p>
        </div>
        <LocaleSwitcher pathname="/en/deals" />
      </div>
      <div className="mt-4 mb-4">
        <BytekAd variant="compact" locale={LOCALE} />
      </div>
      <div className="grid md:grid-cols-2 gap-3 mt-2">
        {list.map((d) => (
          <Link key={d.id} href={`/en/product/${d.id}`} className="bg-white rounded p-4 shadow-sm border flex gap-3 items-center">
            <Thumb src={productImage(productsMap.get(d.id)!)} alt={d.model} size={56} />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{d.brand} {d.model}</div>
              <div className="text-xs text-slate-400">
                {t("deals.metaLine", {
                  median: formatNumber(d.avg, LOCALE),
                  count: d.n,
                  store: `${d.store}${d.wilaya ? ` (${d.wilaya})` : ""}`,
                })}
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-extrabold text-emerald-700">{formatPrice(d.best, LOCALE)}</div>
              <div className="text-[11px] font-bold text-white bg-emerald-600 rounded-full px-2 py-0.5 inline-block mt-0.5">
                -{Math.round(d.drop * 100)}% (−{formatNumber(d.saving, LOCALE)})
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-slate-400 mt-6">{t("deals.empty")}</p>}
    </main>
  );
}
