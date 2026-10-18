import Link from "next/link";
import HomeRecentStrip from "@/components/HomeRecentStrip";
import CurrencyConverter from "@/components/CurrencyConverter";
import { CATEGORIES, SIDE_CATEGORIES, bestOffer, minOf, productImage, isRuptured, type Product, type Offer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { LIVE_EXTRA } from "@/lib/data/live";
import { GUIDES } from "@/lib/data/guides";
import Thumb from "@/components/Thumb";
import BytekAd from "@/components/BytekAd";
import AliExpressDealsBanner from "@/components/AliExpressDealsBanner";

export const revalidate = 60;

function fmt(n: number) {
  return n.toLocaleString("fr-DZ") + " DA";
}

function CategorySvg({ slug }: { slug: string }) {
  switch (slug) {
    case "cpu":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <rect x="9" y="9" width="6" height="6" />
          <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
        </svg>
      );
    case "cooler":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="9" />
          <circle cx="12" cy="12" r="2.5" />
          <path d="M12 9.5V3M14.5 12H21M12 14.5V21M9.5 12H3" />
        </svg>
      );
    case "motherboard":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <rect x="7" y="7" width="4" height="4" />
          <path d="M15 7h2M15 10h2M7 15h10M7 18h5" />
        </svg>
      );
    case "ram":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="7" width="20" height="10" rx="1" />
          <path d="M6 17v2M10 17v2M14 17v2M18 17v2M6 11h2M11 11h2M16 11h2" />
        </svg>
      );
    case "ssd":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="5" width="16" height="14" rx="2" />
          <path d="M7 9h10M7 12h4M16 15h1" />
        </svg>
      );
    case "gpu":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="2" y="6" width="20" height="12" rx="2" />
          <circle cx="8.5" cy="12" r="2.5" />
          <circle cx="15.5" cy="12" r="2.5" />
          <path d="M2 10h2M2 14h2M6 18v2M10 18v2" />
        </svg>
      );
    case "case":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="5" y="3" width="14" height="18" rx="2" />
          <circle cx="12" cy="7" r="1" fill="currentColor" />
          <path d="M9 11h6M9 14h6M9 17h6" />
        </svg>
      );
    case "psu":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <circle cx="10" cy="12" r="3.5" />
          <path d="M16 8h2M16 12h2M16 16h2" />
        </svg>
      );
    case "monitor":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="4" width="18" height="12" rx="2" />
          <line x1="8" y1="20" x2="16" y2="20" />
          <line x1="12" y1="16" x2="12" y2="20" />
        </svg>
      );
    case "printer":
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="6 9 6 2 18 2 18 9" />
          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
          <rect x="6" y="14" width="12" height="8" />
        </svg>
      );
    default:
      return (
        <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="4" y="4" width="16" height="16" rx="2" />
          <path d="M9 9h6v6H9z" />
        </svg>
      );
  }
}

export default async function Home() {
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);
  const liveCount = offers.length + LIVE_EXTRA.length;
  const storeNames = new Set<string>();
  for (const o of offers) {
    if (o.store && o.store !== "—" && o.store.trim().length > 0) storeNames.add(o.store.trim());
  }
  for (const o of LIVE_EXTRA) {
    if (o.store && o.store !== "—" && o.store.trim().length > 0) storeNames.add(o.store.trim());
  }
  const storeCount = Math.max(storeNames.size, 200);

  const trending = products
    .map((p) => {
      const prodOffers = offers.filter((o) => o.productId === p.id && !isRuptured(o) && o.stock !== "Rupture" && o.stock !== "Sur commande");
      const best = prodOffers.length > 0 ? bestOffer(p.id, prodOffers) : undefined;
      return { p, best };
    })
    .filter((x): x is { p: Product; best: Offer } => Boolean(x.best && x.best.priceDa >= 3000))
    .sort((a, b) => a.best.priceDa - b.best.priceDa)
    .slice(0, 8);

  const popularGuides = GUIDES.slice(0, 2);

  const stats = [
    { value: `${liveCount}`, label: "offres indexées" },
    { value: `${storeCount}+`, label: "boutiques suivies" },
    { value: "58", label: "wilayas livrées" },
    { value: scrapedAt.slice(0, 10), label: "dernier relevé" },
  ];

  return (
    <main className="pb-12">
      {/* HERO — see the note on the English home page. The navy slab with a
          dot-grid texture, radial glows and a gradient word is replaced by a
          paper band with the live price table beside it, which is what the
          page is actually for. */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-shell px-4 pt-9 pb-7 sm:pt-12 sm:pb-9">
          {/* `grid-cols-1` is load-bearing: see the note on the English home page. */}
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,26rem)] lg:gap-10">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="dot dot-ok" aria-hidden="true" />
                <span className="label">Comparateur indépendant • {liveCount} offres indexées</span>
              </div>

              <h1 className="mt-3.5 text-[30px] font-bold leading-[1.06] tracking-[-0.032em] sm:text-[44px]">
                Assemblez votre PC au{" "}
                <span className="text-[#0a63c9] dark:text-[#5b9cf5]">meilleur prix</span>{" "}
                en Algérie.
              </h1>

              <p className="mt-4 max-w-xl text-[14px] leading-relaxed text-ink-2 sm:text-[15px]">
                Prix relevés chaque jour sur les boutiques DZ, triés par prix croissant.
                Zéro commission, tri 100% organique — vous achetez directement chez le marchand.
              </p>

              <div className="mt-6 flex flex-wrap items-center gap-2.5">
                <Link href="/fr/builder" className="btn btn-primary px-5 py-2.5">
                  Lancer le System Builder
                </Link>
                <Link href="/fr/deals" className="btn btn-secondary px-5 py-2.5">
                  Voir les bons plans
                </Link>
              </div>
            </div>

            <div className="panel self-start">
              <div className="panel-hd">
                <span className="label">Prix les plus bas du marché</span>
                <Link
                  href="/fr/deals"
                  className="text-[11px] font-semibold text-[#0a63c9] hover:underline dark:text-[#5b9cf5]"
                >
                  Tous les bons plans
                </Link>
              </div>
              <ul>
                {trending.slice(0, 6).map(({ p, best }, i) => (
                  <li key={p.id} className="border-b border-line-soft last:border-b-0">
                    <Link
                      href={`/fr/product/${p.id}`}
                      className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-surface-subtle"
                    >
                      <span className="data w-4 shrink-0 text-[11px] text-ink-4">{i + 1}</span>
                      <Thumb src={productImage(p)} alt={p.model} size={32} />
                      <span className="min-w-0 flex-1 overflow-hidden">
                        <span className="block truncate text-[12.5px] font-medium text-ink">{p.brand} {p.model}</span>
                        <span className="block truncate text-[10.5px] text-ink-3">
                          {best?.store} · {best?.wilaya}
                        </span>
                      </span>
                      <span className="data shrink-0 text-[13px] font-semibold text-ink">
                        {fmt(best?.priceDa ?? 0)}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-x-7 gap-y-4 border-t border-line pt-5 sm:gap-x-9">
            {stats.map((s) => (
              <div key={s.label} className="stat">
                <span className="stat-v">{s.value}</span>
                <span className="stat-k">{s.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-shell space-y-10 px-4 py-8">
        {/* Bytek Store Official Partner Ad */}
        <BytekAd variant="banner" locale="fr" placement="fr-home-top" />
        <HomeRecentStrip locale={"fr"} />

        {/* Comment ça marche */}
        <section>
          <h2 className="h-sec mb-3.5">Comment ça marche</h2>
          <ol className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
            {[
              {
                n: "1",
                title: "Choisissez vos composants",
                text: "Parcourez le catalogue ou configurez votre build complet dans le System Builder.",
                href: "/fr/category/cpu",
                cta: "Parcourir le catalogue",
              },
              {
                n: "2",
                title: "Comparez les prix en DA",
                text: "Chaque produit agrège les offres des boutiques DZ, neuf et occasion séparés.",
                href: "/fr/deals",
                cta: "Voir les bons plans",
              },
              {
                n: "3",
                title: "Achetez chez le marchand",
                text: "Lien direct vers la boutique, paiement à la livraison, expédition 58 wilayas.",
                href: "/fr/builder",
                cta: "Lancer le Builder",
              },
            ].map((s) => (
              <li key={s.n}>
                <Link
                  href={s.href}
                  className="group flex h-full flex-col rounded-lg border border-line bg-surface p-4 transition-colors hover:border-[#0a63c9]/40 dark:hover:border-[#5b9cf5]/40"
                >
                  <span className="label">{s.n.padStart(2, "0")}</span>
                  <span className="mt-2 text-[14px] font-semibold text-ink">{s.title}</span>
                  <span className="mt-1.5 flex-1 text-[12px] leading-relaxed text-ink-2">{s.text}</span>
                  <span className="mt-3 text-[12px] font-semibold text-[#0a63c9] group-hover:underline dark:text-[#5b9cf5]">
                    {s.cta}
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </section>

        {/* Parcourir par catégorie */}
        <section>
          <h2 className="h-sec mb-3.5">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-4">
            {CATEGORIES.map((c) => {
              const items = products.filter((p) => p.category === c.slug);
              const prices = items.map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity).filter(Number.isFinite);
              const minPrice = minOf(prices);
              const extraN = LIVE_EXTRA.filter((e) => e.category === c.slug).length;

              return (
                <Link
                  key={c.slug}
                  href={`/fr/category/${c.slug}`}
                  className="group flex flex-col rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-[#0a63c9]/40"
                >
                  <span className="flex items-center gap-2">
                    <CategorySvg slug={c.slug} />
                    <span className="truncate text-[13px] font-semibold text-ink">{c.label}</span>
                  </span>
                  <span className="mt-2.5 block">
                    <span className="label block">{minPrice ? "dès" : "\u00a0"}</span>
                    <span className="data mt-0.5 block text-[15px] font-semibold leading-none text-ink">
                      {minPrice ? fmt(minPrice) : "\u2014"}
                    </span>
                  </span>
                  <span className="mt-1.5 text-[11px] text-ink-3">
                    {items.length} modèle{items.length > 1 ? "s" : ""}
                    {extraN > 0 && <span className="text-[#8a5d00] dark:text-[#f0c168]"> · +{extraN} live</span>}
                  </span>
                </Link>
              );
            })}
          </div>
          {SIDE_CATEGORIES.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-line pt-3">
              <span className="label">Périphériques</span>
              <span className="text-[11px] text-ink-3">Matériel bureautique hors configurateur PC</span>
              <div className="ml-auto flex flex-wrap items-center gap-1.5">
                {SIDE_CATEGORIES.map((c) => {
                  const items = products.filter((p) => p.category === c.slug);
                  const prices = items.map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity).filter(Number.isFinite);
                  const minPrice = minOf(prices);
                  return (
                    <Link
                      key={c.slug}
                      href={`/fr/category/${c.slug}`}
                      className="inline-flex items-center gap-1.5 rounded border border-line bg-surface px-2 py-1 text-[11px] font-medium text-ink-2 transition-colors hover:border-[#0a63c9]/40 hover:text-ink"
                    >
                      <CategorySvg slug={c.slug} />
                      <span>{c.label}</span>
                      {minPrice && <span className="data text-ink-3">dès {fmt(minPrice)}</span>}
                    </Link>
                  );
                })}
              </div>
            </div>
          )}
        </section>

        {/* AliExpress Deals & Coupons Telegram Channel */}
        <AliExpressDealsBanner variant="banner" locale="fr" />

        {/* Guides & Builder CTA */}
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
          <section className="panel lg:col-span-3">
            <div className="panel-hd">
              <span className="label">Guides d'achat gaming DZ</span>
              <Link
                href="/fr/guides"
                className="text-[11px] font-semibold text-[#0a63c9] hover:underline dark:text-[#5b9cf5]"
              >
                Tous les guides
              </Link>
            </div>
            <div>
              {popularGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/fr/guides/${g.slug}`}
                  className="group block border-b border-line-soft px-4 py-3 transition-colors last:border-b-0 hover:bg-surface-subtle"
                >
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] font-semibold text-ink group-hover:text-[#0a63c9] dark:group-hover:text-[#5b9cf5]">
                      {g.title}
                    </span>
                    <span className="data shrink-0 text-[10.5px] text-ink-3">{g.readMin} min</span>
                  </div>
                  <div className="mt-1 line-clamp-2 text-[11.5px] leading-relaxed text-ink-3">{g.hook}</div>
                </Link>
              ))}
            </div>
          </section>

          <section className="panel flex flex-col justify-between p-5 lg:col-span-2">
            <div>
              <span className="tag tag-ok">Configurateur</span>
              <h3 className="mt-3 text-[17px] font-semibold leading-snug tracking-tight text-ink">
                Votre build complet, chiffré aux prix réels du marché DZ.
              </h3>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
                Vérification de compatibilité automatique, puissance estimée, permalien partageable.
              </p>
            </div>
            <Link href="/fr/builder" className="btn btn-primary mt-5 self-start px-4 py-2.5">
              Ouvrir le System Builder
            </Link>
          </section>
        </div>

        <CurrencyConverter locale="fr" />
      </div>
    </main>
  );
}
