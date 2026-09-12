import fs from "fs";
import path from "path";
import Link from "next/link";
import { OFFERS, PRODUCTS, type Product } from "@/lib/data/products";
import { LIVE_EXTRA, SCRAPED_AT } from "@/lib/data/live";
import { STORE_CATS, STORE_NAMES, STORE_WILAYA } from "@/lib/scrapers/stores";
import { selfCheck } from "@/lib/algo/optimizer";
import AdminOffers from "@/components/AdminOffers";
import Thumb from "@/components/Thumb";

export const metadata = { robots: "noindex", title: "Admin — Ops Console" };
const KEY = process.env.ADMIN_KEY || "dz-admin-2026";

function schemaTables(): string[] {
  try {
    const sql = fs.readFileSync(path.join(process.cwd(), "supabase", "schema.sql"), "utf8");
    return (sql.match(/create table if not exists (\w+)/g) || []).map((s) => s.split(" ").pop() as string);
  } catch {
    return [];
  }
}

export default function AdminPage({ searchParams }: { searchParams: { key?: string } }) {
  if (searchParams.key !== KEY) {
    return (
      <main className="min-h-screen bg-slate-950 text-slate-200 flex items-center justify-center p-4">
        <form className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-sm shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 font-bold">
              🔒
            </div>
            <div>
              <h1 className="font-extrabold text-white text-base">DZ-PartPicker Ops</h1>
              <p className="text-xs text-slate-500">Accès restreint équipe technique</p>
            </div>
          </div>
          <div>
            <label className="text-xs text-slate-400 font-medium">Clé d&apos;authentification admin</label>
            <input
              name="key"
              type="password"
              placeholder="Entrez votre clé secrète"
              className="mt-1.5 w-full bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-slate-100 placeholder:text-slate-600 focus:outline-none focus:border-emerald-500"
            />
          </div>
          <button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-2.5 rounded-lg transition-colors shadow-2xs">
            Déverrouiller la console
          </button>
          <div className="text-center">
            <Link href="/" className="text-xs text-slate-500 hover:text-slate-400">
              ← Retour au site public
            </Link>
          </div>
        </form>
      </main>
    );
  }

  const checks = selfCheck();
  const allChecksPass = checks.every((c) => c.ok);

  // Offers by store & category
  const byStore: Record<string, { total: number; cats: Record<string, number> }> = {};
  for (const s of STORE_NAMES) byStore[s] = { total: 0, cats: {} };
  for (const o of OFFERS) {
    const p = PRODUCTS.find((x) => x.id === o.productId);
    const cat = p?.category ?? "?";
    if (!byStore[o.store]) byStore[o.store] = { total: 0, cats: {} };
    byStore[o.store].total++;
    byStore[o.store].cats[cat] = (byStore[o.store].cats[cat] ?? 0) + 1;
  }

  const newOffersCount = OFFERS.filter((o) => o.condition === "new").length;
  const usedOffersCount = OFFERS.filter((o) => o.condition === "used").length;

  const gpuPrices = OFFERS.filter((o) => PRODUCTS.find((x) => x.id === o.productId)?.category === "gpu")
    .map((o) => o.priceDa)
    .sort((a, b) => a - b);
  const medianGpu = gpuPrices.length ? gpuPrices[Math.floor(gpuPrices.length / 2)] : 0;

  const extraByCat: Record<string, number> = {};
  for (const e of LIVE_EXTRA) extraByCat[e.category] = (extraByCat[e.category] ?? 0) + 1;

  const tables = schemaTables();
  const allCats = ["cpu", "cooler", "motherboard", "ram", "ssd", "gpu", "psu", "case", "monitor"];

  // Per-product price metrics calculation
  const productPriceStats = PRODUCTS.map((p) => {
    const pOffers = OFFERS.filter((o) => o.productId === p.id);
    if (pOffers.length === 0) {
      return {
        product: p,
        count: 0,
        min: 0,
        avg: 0,
        max: 0,
        spread: 0,
        spreadPct: 0,
        cheapest: null,
      };
    }
    const prices = pOffers.map((o) => o.priceDa);
    const min = Math.min(...prices);
    const max = Math.max(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const spread = max - min;
    const spreadPct = min > 0 ? Math.round((spread / min) * 100) : 0;
    const sorted = [...pOffers].sort((a, b) => a.priceDa - b.priceDa);
    return {
      product: p,
      count: pOffers.length,
      min,
      avg,
      max,
      spread,
      spreadPct,
      cheapest: sorted[0],
    };
  }).sort((a, b) => b.count - a.count);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-700 flex items-center justify-center p-1.5 shadow-inner">
              <img src="/brand/logo.svg" alt="DZ PartPicker" className="w-full h-full object-contain" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-lg sm:text-xl text-white tracking-tight">
                  DZ-PartPicker · Console Ops
                </h1>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Relevé du {SCRAPED_AT.slice(0, 10)} • Environnement Next.js 14 • 58 wilayas
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              className="px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
            >
              ← Site public
            </Link>
            <a
              href="/api/cron/refresh?scope=full&full=1"
              target="_blank"
              rel="noreferrer"
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-colors shadow-2xs flex items-center gap-1.5"
            >
              <span>⚡ Full Re-scrape</span>
            </a>
          </div>
        </div>

        {/* 1) KPI Cards Row */}
        <div>
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
            Indicateurs Clés de Performance (KPIs)
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Offres Matchées</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5 font-mono">{OFFERS.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">{newOffersCount} neufs • {usedOffersCount} occ.</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Catalogue Canonique</div>
              <div className="text-xl font-extrabold text-blue-400 mt-0.5 font-mono">{PRODUCTS.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">9 catégories</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">File d&apos;attente Matcher</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5 font-mono">{LIVE_EXTRA.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">annonces live</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Ratio Neuf</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5 font-mono">
                {Math.round((newOffersCount / (OFFERS.length || 1)) * 100)}%
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">qualité indexation</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Boutiques Suivies</div>
              <div className="text-xl font-extrabold text-slate-200 mt-0.5 font-mono">{STORE_NAMES.length}</div>
              <div className="text-[10px] text-slate-500 mt-0.5">Woo + Shopify + OK</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Médiane GPU DA</div>
              <div className="text-xl font-extrabold text-emerald-400 mt-0.5 font-mono text-sm sm:text-base">
                {medianGpu.toLocaleString("fr-DZ")}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{gpuPrices.length} GPU relevés</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Santé Algo</div>
              <div className={`text-xl font-extrabold mt-0.5 ${allChecksPass ? "text-emerald-400" : "text-red-400"}`}>
                {allChecksPass ? "PASS" : "FAIL"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{checks.length} règles vérifiées</div>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Base Supabase</div>
              <div className="text-xl font-extrabold text-amber-400 mt-0.5 font-mono text-sm">
                {tables.length > 0 ? "PRÊTE" : "—"}
              </div>
              <div className="text-[10px] text-slate-500 mt-0.5">{tables.length} tables schema.sql</div>
            </div>
          </div>
        </div>

        {/* 2) NEW: Per-Product Price Table (Spread Bar, Min/Avg/Max DA, Cheapest Store) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="font-bold text-sm text-white flex items-center gap-2">
                <span>Dispersion & Prix par Produit Canonique</span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-400">
                  {PRODUCTS.length} composants
                </span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Nombre d&apos;offres matchées, prix min, prix moyen, prix max, spread bar et magasin le moins cher
              </p>
            </div>
          </div>

          <div className="overflow-x-auto max-h-96 overflow-y-auto border border-slate-800 rounded-lg">
            <table className="w-full text-xs">
              <thead className="sticky top-0 bg-slate-950 text-slate-400 border-b border-slate-800 select-none z-10">
                <tr>
                  <th className="text-left p-2.5">Produit</th>
                  <th className="text-center p-2.5">Catégorie</th>
                  <th className="text-center p-2.5">Offres</th>
                  <th className="text-right p-2.5">Min (DA)</th>
                  <th className="text-right p-2.5">Moyenne (DA)</th>
                  <th className="text-right p-2.5">Max (DA)</th>
                  <th className="text-center p-2.5 w-40">Écart / Spread</th>
                  <th className="text-left p-2.5">Marchand le moins cher</th>
                  <th className="text-center p-2.5">Fiche</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {productPriceStats.map((item) => (
                  <tr key={item.product.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2.5">
                      <div className="flex items-center gap-2">
                        <Thumb src={`/p/${item.product.id}.webp`} alt={item.product.model} size={28} />
                        <span className="font-semibold text-slate-200">
                          {item.product.brand} {item.product.model}
                        </span>
                      </div>
                    </td>
                    <td className="p-2.5 text-center">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                        {item.product.category}
                      </span>
                    </td>
                    <td className="p-2.5 text-center font-mono">
                      <span
                        className={`inline-block px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          item.count > 0 ? "bg-emerald-950 text-emerald-400 border border-emerald-800/80" : "bg-red-950 text-red-400 border border-red-800/80"
                        }`}
                      >
                        {item.count}
                      </span>
                    </td>
                    <td className="p-2.5 text-right font-mono font-bold text-emerald-400">
                      {item.min > 0 ? `${item.min.toLocaleString("fr-DZ")} DA` : "—"}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-300">
                      {item.avg > 0 ? `${item.avg.toLocaleString("fr-DZ")} DA` : "—"}
                    </td>
                    <td className="p-2.5 text-right font-mono text-slate-400">
                      {item.max > 0 ? `${item.max.toLocaleString("fr-DZ")} DA` : "—"}
                    </td>
                    <td className="p-2.5">
                      {item.spread > 0 ? (
                        <div className="space-y-1">
                          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                            <span>+{item.spread.toLocaleString("fr-DZ")} DA</span>
                            <span className="text-amber-400">+{item.spreadPct}%</span>
                          </div>
                          {/* Visual Spread Bar */}
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500 rounded-full"
                              style={{ width: `${Math.min(Math.max(item.spreadPct * 2, 10), 100)}%` }}
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="text-center text-slate-600">—</div>
                      )}
                    </td>
                    <td className="p-2.5 text-slate-300">
                      {item.cheapest ? (
                        <span className="font-medium text-emerald-300">
                          {item.cheapest.store} <span className="text-slate-500 text-[11px]">({item.cheapest.wilaya})</span>
                        </span>
                      ) : (
                        <span className="text-slate-600 italic">Pas d&apos;offre</span>
                      )}
                    </td>
                    <td className="p-2.5 text-center">
                      <Link
                        href={`/product/${item.product.id}`}
                        target="_blank"
                        className="text-blue-400 hover:text-blue-300 hover:underline"
                      >
                        ↗
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 3) Store x Category Coverage Matrix (red zeros for broken scrapers) */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <div>
              <h2 className="font-bold text-sm text-white">
                Matrice de Couverture Marchands × Catégories
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Les zéros rouges indiquent une catégorie suivie sans offre matchée (sélecteur ou rupture de stock)
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Offres indexées
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 inline-block" /> Zéro rouge (alerte)
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-700 inline-block" /> Non suivi
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg">
            <table className="w-full text-xs">
              <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="text-left p-2.5">Boutique</th>
                  <th className="text-left p-2.5">Wilaya</th>
                  {allCats.map((c) => (
                    <th key={c} className="p-2.5 text-center uppercase tracking-wider text-[10px]">
                      {c.slice(0, 4)}
                    </th>
                  ))}
                  <th className="p-2.5 text-center font-bold">Total</th>
                  <th className="p-2.5 text-center">Retest Scrape</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/70">
                {STORE_NAMES.map((s) => (
                  <tr key={s} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-2.5 font-bold text-slate-200">{s}</td>
                    <td className="p-2.5 text-slate-400">{STORE_WILAYA(s)}</td>
                    {allCats.map((c) => {
                      const n = byStore[s]?.cats[c] ?? 0;
                      const tracked = STORE_CATS(s).includes(c);
                      return (
                        <td key={c} className="p-2 text-center font-mono">
                          {n === 0 ? (
                            tracked ? (
                              <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-red-950 text-red-400 font-bold border border-red-800/80 animate-pulse">
                                0
                              </span>
                            ) : (
                              <span className="text-slate-700">—</span>
                            )
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-5 rounded bg-emerald-950/80 text-emerald-400 font-semibold border border-emerald-800/60">
                              {n}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="p-2.5 text-center font-mono font-bold text-white bg-slate-950/40">
                      {byStore[s]?.total ?? 0}
                    </td>
                    <td className="p-2.5 text-center">
                      <a
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-blue-400 hover:text-blue-300 font-semibold transition-colors text-[11px]"
                        target="_blank"
                        rel="noreferrer"
                        href={`/api/cron/refresh?store=${encodeURIComponent(s)}&cat=gpu`}
                      >
                        Tester GPU ↗
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4) Matcher Queue & Actions */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Matcher Queue */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-white flex items-center justify-between">
              <span>File d&apos;attente Matcher (Annonces Live Hors Catalogue)</span>
              <span className="text-xs text-amber-400 font-mono">{LIVE_EXTRA.length} annonces</span>
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Produits extraits des stores mais n&apos;ayant pas encore trouvé de correspondance canonique. À ajouter dans les alias.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              {Object.entries(extraByCat)
                .sort((a, b) => b[1] - a[1])
                .map(([c, n]) => (
                  <div
                    key={c}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-800 text-xs"
                  >
                    <span className="text-slate-400 uppercase font-semibold text-[10px]">{c} :</span>
                    <b className="text-amber-400 font-mono">{n}</b>
                  </div>
                ))}
            </div>
          </div>

          {/* Quick Actions & Scraping Links */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-white">Actions & Déclencheurs Scrapers</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Déclenchez manuellement les tâches cron de rafraîchissement ou inspectez l&apos;état JSON de l&apos;algorithme.
            </p>
            <div className="flex flex-wrap gap-2 pt-1">
              <a
                className="px-3.5 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white font-bold text-xs transition-colors shadow-2xs flex items-center gap-1.5"
                target="_blank"
                rel="noreferrer"
                href="/api/cron/refresh?scope=full&full=1"
              >
                <span>⚡ Lancer Full Scrape</span>
              </a>
              <a
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                target="_blank"
                rel="noreferrer"
                href="/api/builds"
              >
                <span>Diagnostic JSON Builds & Algo ↗</span>
              </a>
              <a
                className="px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 transition-colors flex items-center gap-1.5"
                target="_blank"
                rel="noreferrer"
                href="/api/products"
              >
                <span>Index Produits API ↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* 5) Algo Selfcheck & DB Status */}
        <div className="grid md:grid-cols-2 gap-4">
          {/* Algo Selfcheck */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-white flex items-center justify-between">
              <span>Vérification Automatique des Algorithmes</span>
              <span className={`text-xs font-bold ${allChecksPass ? "text-emerald-400" : "text-red-400"}`}>
                {allChecksPass ? "✓ TOUS LES TESTS PASSENT" : "✕ TESTS EN ÉCHEC"}
              </span>
            </h2>
            <ul className="text-xs space-y-2 max-h-48 overflow-y-auto">
              {checks.map((c) => (
                <li
                  key={c.name}
                  className="flex items-start gap-2 p-2 rounded-lg bg-slate-950 border border-slate-800"
                >
                  <span className="text-sm">{c.ok ? "✅" : "❌"}</span>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-slate-200">{c.name}</div>
                    <div className="text-slate-400 text-[11px] leading-relaxed mt-0.5">{c.detail}</div>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          {/* Database & Supabase Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-sm space-y-3">
            <h2 className="font-bold text-sm text-white">Statut Base de Données (PostgreSQL / Supabase)</h2>
            <div className="text-xs bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Mode d&apos;exécution :</span>
                <span className="font-semibold text-emerald-400">Bake TypeScript Statique (live.ts)</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400">Supabase Storage :</span>
                <span className="text-amber-400 font-semibold">Non connecté — push annulé par l'admin</span>
              </div>
              <div className="pt-2 border-t border-slate-800">
                <div className="text-slate-400 mb-1">Tables définies dans schema.sql :</div>
                <div className="flex flex-wrap gap-1.5">
                  {tables.map((t) => (
                    <span
                      key={t}
                      className="px-2 py-0.5 rounded bg-slate-900 border border-slate-700 text-slate-300 font-mono text-[10px]"
                    >
                      {t}
                    </span>
                  ))}
                  {tables.length === 0 && <span className="text-slate-500 italic">schema.sql non trouvé</span>}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6) All Offers Table with Click-to-Sort Headers */}
        <div>
          <h2 className="font-bold text-sm text-white mb-2">
            Toutes les Offres Marchands ({OFFERS.length} relevées)
          </h2>
          <AdminOffers offers={OFFERS} />
        </div>
      </div>
    </main>
  );
}
