import Link from "next/link";
import { PRODUCTS, isRuptured, productImage, type Offer } from "@/lib/data/products";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import Thumb from "@/components/Thumb";

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

function deals(offers: Offer[]): Deal[] {
  const out: Deal[] = [];
  for (const p of PRODUCTS) {
    const fresh = offers.filter((o) => o.productId === p.id && o.condition === "new" && !isRuptured(o));
    if (fresh.length < 2) continue;
    const prices = fresh.map((o) => o.priceDa).sort((a, b) => a - b);
    const best = prices[0];
    const avg = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
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

export default async function DealsPage() {
  const offers = await getOffers();
  const scrapedAt = await getScrapedAt();
  const list = deals(offers);
  return (
    <main className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-extrabold tracking-tight">Bons plans</h1>
      <p className="text-xs text-slate-400">
        Offres neuves ≥8% sous la moyenne de leur produit (économie ≥2 000 DA) • relevé du {scrapedAt.slice(0, 10)}
      </p>
      <div className="grid md:grid-cols-2 gap-3 mt-4">
        {list.map((d, i) => (
          <Link key={d.id} href={`/product/${d.id}`} className="bg-white rounded p-4 shadow-sm border flex gap-3 items-center">
            <Thumb src={productImage(PRODUCTS.find((p) => p.id === d.id)!)} alt={d.model} size={56} />
            <div className="min-w-0 flex-1">
              <div className="font-bold text-sm truncate">{d.brand} {d.model}</div>
              <div className="text-xs text-slate-400">moyenne {d.avg.toLocaleString("fr-DZ")} DA • {d.n} offres • {d.store}{d.wilaya ? ` (${d.wilaya})` : ""}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="font-extrabold text-emerald-700">{d.best.toLocaleString("fr-DZ")} DA</div>
              <div className="text-[11px] font-bold text-white bg-emerald-600 rounded-full px-2 py-0.5 inline-block mt-0.5">
                -{Math.round(d.drop * 100)}% (−{d.saving.toLocaleString("fr-DZ")})
              </div>
            </div>
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="text-sm text-slate-400 mt-6">Aucun bon plan en ce moment — revenez après le prochain relevé.</p>}
    </main>
  );
}
