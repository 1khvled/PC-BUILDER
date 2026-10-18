"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Thumb from "./Thumb";
import { clearCompare, loadCompare } from "@/lib/compare";
import { makeT } from "@/lib/i18n/runtime";
import { DEFAULT_LOCALE, localizedHref, type Locale } from "@/lib/i18n/config";
import { productImage, type Product } from "@/lib/data/products";

/**
 * Sticky compare tray.
 *
 * Appears once the visitor flags a first product, and stays out of the way
 * otherwise. Mounted by CategoryCatalogClient; the /compare page reads the
 * same ids from the URL so a shared link works without localStorage.
 */
export function CompareToggle({ productId, locale = DEFAULT_LOCALE }: { productId: string; locale?: Locale }) {
  const t = makeT(locale);
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(loadCompare().includes(productId));
    const sync = () => setOn(loadCompare().includes(productId));
    window.addEventListener("storage", sync);
    window.addEventListener("dz-compare", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("dz-compare", sync);
    };
  }, [productId]);

  const click = async () => {
    const { toggleCompare } = await import("@/lib/compare");
    const r = toggleCompare(productId);
    setOn(r.added);
    window.dispatchEvent(new Event("dz-compare"));
  };

  return (
    <button
      type="button"
      onClick={click}
      aria-pressed={on}
      title={on ? t("compare.remove") : t("compare.add")}
      className={`flex min-h-[44px] items-center rounded-lg border px-2.5 text-xs font-semibold transition-colors ${
        on
          ? "border-[#2c87c3] bg-blue-50 text-[#2c87c3]"
          : "border-slate-200 text-slate-500 hover:border-[#2c87c3] hover:text-[#2c87c3]"
      }`}
    >
      <span aria-hidden="true" className="mr-1 text-sm">
        {on ? "☑" : "☐"}
      </span>
      {t("compare.short")}
    </button>
  );
}

export function CompareTray({
  products,
  locale = DEFAULT_LOCALE,
}: {
  products: Product[];
  locale?: Locale;
}) {
  const t = makeT(locale);
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    const sync = () => setIds(loadCompare());
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener("dz-compare", sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener("dz-compare", sync);
    };
  }, []);

  if (ids.length === 0) return null;
  const picked = ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => !!p);
  const href = (path: string) => localizedHref(path, locale);

  return (
    <div className="fixed inset-x-0 bottom-16 z-40 px-4 pb-2 sm:bottom-4 md:bottom-6 print:hidden">
      <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-3 py-2 shadow-dropdown backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-x-auto">
          {picked.map((p) => (
            <span key={p.id} className="flex shrink-0 items-center gap-1.5 rounded-lg bg-slate-100 py-1 pl-1 pr-2 text-[11px] font-semibold dark:bg-slate-800">
              <Thumb src={productImage(p)} alt={p.model} size={24} />
              <span className="max-w-[120px] truncate">{p.model}</span>
            </span>
          ))}
          {ids.length > picked.length && (
            <span className="shrink-0 text-[11px] text-slate-400">+{ids.length - picked.length}</span>
          )}
        </div>
        <button
          type="button"
          onClick={() => {
            clearCompare();
            setIds([]);
            window.dispatchEvent(new Event("dz-compare"));
          }}
          className="shrink-0 px-2 py-2 text-[11px] font-semibold text-slate-400 hover:text-rose-600"
        >
          {t("compare.clear")}
        </button>
        <Link
          href={href(`/compare?ids=${encodeURIComponent(ids.join(","))}`)}
          className="shrink-0 rounded-lg bg-[#2c87c3] px-4 py-2 text-xs font-bold text-white transition-colors hover:bg-[#1e5c85]"
        >
          {t("compare.tray", { n: ids.length })}
        </Link>
      </div>
    </div>
  );
}
