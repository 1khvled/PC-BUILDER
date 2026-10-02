import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { bestOffer, minOf, productImage, type Product } from "@/lib/data/products";
import { getOffers, getProducts } from "@/lib/data/catalog";
import { COMPARE_MAX } from "@/lib/compare";
import Thumb from "@/components/Thumb";
import LocaleSwitcher from "@/components/LocaleSwitcher";
import { OG_LOCALE, formatPrice, languageAlternates, type Locale } from "@/lib/i18n/config";
import { categoryLabel } from "@/lib/i18n/categories";
import { getT } from "@/lib/i18n/server";

const LOCALE: Locale = "fr";

export const metadata: Metadata = {
  title: "Comparer des composants PC côte à côte - prix en Algérie (DA)",
  description:
    "Comparatif de composants PC côte à côte avec les prix algériens en direct, les caractéristiques et les boutiques les moins chères.",
  alternates: languageAlternates("/compare", "fr"),
  openGraph: { title: "Comparer des composants PC côte à côte", locale: OG_LOCALE.fr },
};

export const revalidate = 60;

export default async function FrenchComparePage({
  searchParams,
}: {
  searchParams: { ids?: string };
}) {
  const t = await getT(LOCALE);
  const ids = (searchParams.ids ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, COMPARE_MAX);

  if (ids.length === 0) {
    return (
      <main className="mx-auto max-w-3xl px-4 py-10 text-center">
        <h1 className="text-xl font-extrabold text-slate-900">{t("compare.title")}</h1>
        <p className="mt-2 text-sm text-slate-500">{t("compare.empty")}</p>
        <Link href="/fr" className="mt-4 inline-block rounded-lg bg-[#2c87c3] px-5 py-2.5 text-sm font-bold text-white">
          {t("common.home")}
        </Link>
      </main>
    );
  }

  const [products, offers] = await Promise.all([getProducts(), getOffers()]);
  const byId = new Map(products.map((p) => [p.id, p]));
  const picked: Product[] = [];
  for (const id of ids) {
    const p = byId.get(id);
    if (p && !picked.some((x) => x.id === id)) picked.push(p);
  }
  if (picked.length === 0) notFound();

  const specKeys: string[] = [];
  for (const p of picked) {
    for (const k of Object.keys(p.specs)) {
      if (!specKeys.includes(k)) specKeys.push(k);
    }
  }

  const bests = picked.map((p) => bestOffer(p.id, offers));
  const minPrice = minOf(bests.map((b) => b?.priceDa ?? Infinity).filter(Number.isFinite));

  return (
    <main className="mx-auto max-w-6xl px-4 py-6">
      <nav aria-label={t("common.breadcrumb")} className="flex items-center gap-2 text-xs text-slate-500">
        <Link href="/fr" className="hover:text-slate-900">
          {t("common.home")}
        </Link>
        <span>/</span>
        <span className="font-semibold text-slate-900">{t("compare.title")}</span>
        <span className="ml-auto">
          <LocaleSwitcher pathname="/compare" />
        </span>
      </nav>

      <h1 className="mt-3 text-2xl font-extrabold tracking-tight text-slate-900">
        {t("compare.title")}
      </h1>

      <div className="mt-4 overflow-x-auto rounded-xl border border-slate-200" tabIndex={0} role="region" aria-label={t("compare.title")}>
        <table className="w-full min-w-[560px] border-collapse bg-white text-sm">
          <thead>
            <tr className="border-b border-slate-200">
              <th className="w-36 px-4 py-3 text-left text-[11px] font-bold uppercase tracking-wider text-slate-400">
                {t("compare.spec")}
              </th>
              {picked.map((p) => (
                <th key={p.id} className="min-w-[160px] px-4 py-3 text-left align-top">
                  <div className="flex items-center gap-2">
                    <Thumb src={productImage(p)} alt={p.model} size={40} />
                    <div className="min-w-0">
                      <Link href={`/fr/product/${p.id}`} className="block truncate font-bold text-[#2c87c3] hover:underline">
                        {p.brand} {p.model}
                      </Link>
                      <span className="text-[11px] font-semibold uppercase text-slate-400">
                        {categoryLabel(p.category, t)}
                      </span>
                    </div>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            <tr className="bg-emerald-50/50">
              <td className="px-4 py-3 text-xs font-bold uppercase tracking-wide text-slate-500">
                {t("compare.bestPrice")}
              </td>
              {picked.map((p, i) => {
                const b = bests[i];
                const isMin = b && b.priceDa === minPrice;
                return (
                  <td key={p.id} className="px-4 py-3">
                    {b ? (
                      <div>
                        <div className={`font-extrabold tabular-nums ${isMin ? "text-emerald-700" : "text-slate-900"}`}>
                          {formatPrice(b.priceDa, LOCALE)}
                          {isMin && picked.length > 1 ? " ★" : ""}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {b.store} ({b.wilaya})
                        </div>
                      </div>
                    ) : (
                      <span className="text-slate-300">—</span>
                    )}
                  </td>
                );
              })}
            </tr>
            {specKeys.map((k) => (
              <tr key={k} className="hover:bg-slate-50/60">
                <td className="px-4 py-2.5 text-xs font-semibold capitalize text-slate-500">
                  {k.replace(/_/g, " ")}
                </td>
                {picked.map((p) => {
                  const v = (p.specs as Record<string, unknown>)[k];
                  return (
                    <td key={p.id} className="px-4 py-2.5 font-semibold tabular-nums text-slate-800">
                      {v == null || v === "" ? <span className="font-normal text-slate-300">—</span> : String(v)}
                    </td>
                  );
                })}
              </tr>
            ))}
            <tr>
              <td className="px-4 py-3" />
              {picked.map((p) => (
                <td key={p.id} className="px-4 py-3">
                  <Link
                    href={`/fr/builder?add=${p.category}:${p.id}`}
                    className="inline-block rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:border-[#2c87c3] hover:text-[#2c87c3]"
                  >
                    {t("compare.buildWith")}
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  );
}
