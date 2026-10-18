import Link from "next/link";
import HomeRecentStrip from "@/components/HomeRecentStrip";
import CurrencyConverter from "@/components/CurrencyConverter";
import { CATEGORIES, SIDE_CATEGORIES, bestOffer, minOf, productImage, isRuptured, type Product, type Offer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { LIVE_EXTRA } from "@/lib/data/live";
import { GUIDES } from "@/lib/data/guides";
import Thumb from "@/components/Thumb";
import { categoryLabel } from "@/lib/i18n/categories";
import { makeT } from "@/lib/i18n/runtime";
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
    .slice(0, 14);

  const popularGuides = GUIDES.slice(0, 2);

  const stats = [
    { value: `${liveCount}`, label: "offres indexées" },
    { value: `${storeCount}+`, label: "boutiques suivies" },
    { value: "58", label: "wilayas livrées" },
    { value: scrapedAt.slice(0, 10), label: "dernier relevé" },
  ];
  // Category labels must be localized; CATEGORIES carries English labels for URLs.
  const t = makeT("fr");


return (
    <main>
      {/* HERO — see the note on the English home page: short masthead, the
          price table is the product, provenance is one line of facts. */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto max-w-shell px-4 py-8 sm:py-10">
          <div className="max-w-2xl">
            <h1 className="text-[28px] font-semibold leading-[1.15] text-balance sm:text-[38px]">
              Assemblez votre PC au{" "}
              <span className="text-accent">meilleur prix</span>{" "}
              en Algérie.
            </h1>
            <p className="mt-3 text-[14px] leading-relaxed text-pretty text-ink-2 sm:text-[15px]">
              Prix relevés chaque jour sur les boutiques DZ, triés par prix croissant.
              Zéro commission, tri 100% organique — vous achetez directement chez le marchand.
            </p>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/fr/builder" className="btn btn-primary px-4 py-2.5">
              Lancer le System Builder
            </Link>
            <Link href="/fr/deals" className="btn btn-secondary px-4 py-2.5">
              Voir les bons plans
            </Link>
            <dl className="ml-auto flex flex-wrap items-baseline gap-x-4 gap-y-1">
              {stats.map((st) => (
                <div key={st.label} className="flex items-baseline gap-1.5">
                  <dt className="sr-only">{st.label}</dt>
                  <dd className="data text-[13px] font-semibold text-ink">{st.value}</dd>
                  <span className="text-[11px] text-ink-3">{st.label}</span>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-shell space-y-8 px-4 py-8">
        {/* Le produit : un vrai tableau de prix, en tête de page. */}
        <section className="panel-plain">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-4 py-3">
            <h2 className="h-sec">Prix les plus bas du marché</h2>
            <Link href="/fr/deals" className="text-[12px] font-semibold text-accent hover:underline">
              Tous les bons plans
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="dz-table min-w-[680px]">
              <caption className="sr-only">
                Les prix les plus bas relevés sur le marché algérien, avec la boutique et la wilaya de chaque offre
              </caption>
              <thead>
                <tr>
                  <th scope="col" className="w-10 text-center">#</th>
                  <th scope="col" className="pl-[46px]">Produit</th>
                  <th scope="col">Boutique</th>
                  <th scope="col" className="w-28 text-center">Disponibilité</th>
                  <th scope="col" className="text-right">Meilleur prix</th>
                </tr>
              </thead>
              <tbody>
                {trending.map(({ p, best }, i) => (
                  <tr key={p.id}>
                    <td className="data text-center text-ink-4">{i + 1}</td>
                    <td>
                      <Link href={`/fr/product/${p.id}`} className="group flex items-center gap-3">
                        <Thumb src={productImage(p)} alt={p.model} size={34} />
                        <span className="min-w-0">
                          <span className="block truncate text-[13px] font-medium text-ink group-hover:text-accent">
                            {p.brand} {p.model}
                          </span>
                          <span className="block truncate text-[11px] text-ink-3">
                            {categoryLabel(p.category, t)}
                          </span>
                        </span>
                      </Link>
                    </td>
                    <td className="text-[12px]">
                      <span className="block truncate font-medium text-ink-2">{best?.store}</span>
                      <span className="block truncate text-[11px] text-ink-3">{best?.wilaya}</span>
                    </td>
                    <td className="text-center">
                      {best && !isRuptured(best) && best.stock !== "Rupture" && best.stock !== "Sur commande" ? (
                        <span className="tag tag-ok">
                          <span className="dot" aria-hidden="true" />
                          En stock
                        </span>
                      ) : (
                        <span className="tag tag-bad">Rupture</span>
                      )}
                    </td>
                    <td className="num text-[14px] font-semibold text-ink">
                      {fmt(best?.priceDa ?? 0)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Catégories : un index, pas une grille de cartes. */}
        <section>
          <h2 className="h-sec mb-3">Parcourir par catégorie</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-1 sm:grid-cols-3 lg:grid-cols-5">
            {CATEGORIES.map((c) => {
              const items = products.filter((p) => p.category === c.slug);
              const prices = items
                .map((p) => bestOffer(p.id, offers)?.priceDa ?? Infinity)
                .filter(Number.isFinite);
              const minPrice = minOf(prices);
              const extraN = LIVE_EXTRA.filter((e) => e.category === c.slug).length;

              return (
                <Link
                  key={c.slug}
                  href={`/fr/category/${c.slug}`}
                  className="group flex items-baseline justify-between gap-2 border-b border-line-soft py-2 transition-colors hover:border-accent"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-[13px] font-medium text-ink group-hover:text-accent">
                      {categoryLabel(c.slug, t)}
                    </span>
                    <span className="text-[11px] text-ink-3">
                      {items.length} modèle{items.length > 1 ? "s" : ""}
                      {extraN > 0 && <span className="text-warn"> · +{extraN}</span>}
                    </span>
                  </span>
                  <span className="data shrink-0 text-[12px] font-semibold text-ink-2">
                    {minPrice ? fmt(minPrice) : "—"}
                  </span>
                </Link>
              );
            })}
          </div>

          {SIDE_CATEGORIES.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 border-t border-line pt-3">
              <span className="text-[11px] text-ink-3">Matériel bureautique hors configurateur PC</span>
              {SIDE_CATEGORIES.map((c) => (
                <Link
                  key={c.slug}
                  href={`/fr/category/${c.slug}`}
                  className="rounded border border-line px-2 py-0.5 text-[11px] font-medium text-ink-2 transition-colors hover:border-accent hover:text-ink"
                >
                  {categoryLabel(c.slug, t)}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Comment ça marche, en bandeau compact plutôt qu'en trois cartes. */}
        <section className="border-y border-line py-5">
          <h2 className="h-sub mb-3">Comment ça marche</h2>
          <ol className="grid gap-x-6 gap-y-3 sm:grid-cols-3">
            {[
              {
                n: "1",
                title: "Choisissez vos composants",
                text: "Parcourez le catalogue ou configurez votre build complet dans le System Builder.",
                href: "/fr/category/cpu",
              },
              {
                n: "2",
                title: "Comparez les prix en DA",
                text: "Chaque produit agrège les offres des boutiques DZ, neuf et occasion séparés.",
                href: "/fr/deals",
              },
              {
                n: "3",
                title: "Achetez chez le marchand",
                text: "Lien direct vers la boutique, paiement à la livraison, expédition 58 wilayas.",
                href: "/fr/builder",
              },
            ].map((s) => (
              <li key={s.n} className="flex gap-2.5">
                <span className="data shrink-0 text-[12px] font-semibold text-accent">
                  {String(s.n).padStart(2, "0")}
                </span>
                <span className="min-w-0">
                  <Link href={s.href} className="text-[13px] font-medium text-ink hover:text-accent">
                    {s.title}
                  </Link>
                  <p className="mt-0.5 text-[12px] leading-relaxed text-ink-3">{s.text}</p>
                </span>
              </li>
            ))}
          </ol>
        </section>

        <BytekAd variant="banner" locale="fr" placement="fr-home-top" />

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3">
            <h2 className="h-sec mb-3">Guides d'achat gaming DZ</h2>
            <div className="border-t border-line">
              {popularGuides.map((g) => (
                <Link
                  key={g.slug}
                  href={`/fr/guides/${g.slug}`}
                  className="group block border-b border-line-soft py-3 transition-colors hover:bg-surface-subtle"
                >
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-[13px] font-medium text-ink group-hover:text-accent">
                      {g.title}
                    </span>
                    <span className="data shrink-0 text-[11px] text-ink-3">{g.readMin} min</span>
                  </div>
                  <p className="mt-1 line-clamp-2 text-[12px] leading-relaxed text-ink-3">{g.hook}</p>
                </Link>
              ))}
            </div>
            <Link
              href="/fr/guides"
              className="mt-3 inline-block text-[12px] font-semibold text-accent hover:underline"
            >
              Tous les guides
            </Link>
          </section>

          <section className="lg:col-span-2 flex flex-col justify-between rounded-lg border border-line bg-surface-subtle p-5">
            <div>
              <span className="tag tag-ok">Configurateur</span>
              <h2 className="mt-3 text-[16px] font-semibold leading-snug text-ink">
                Votre build complet, chiffré aux prix réels du marché DZ.
              </h2>
              <p className="mt-2 text-[12px] leading-relaxed text-ink-2">
                Vérification de compatibilité automatique, puissance estimée, permalien partageable.
              </p>
            </div>
            <Link href="/fr/builder" className="btn btn-primary mt-5 self-start px-4 py-2.5">
              Ouvrir le System Builder
            </Link>
          </section>
        </div>

        <HomeRecentStrip locale={"fr"} />
        <AliExpressDealsBanner variant="banner" locale="fr" />
        <CurrencyConverter locale="fr" />
      </div>
    </main>
  );
}
