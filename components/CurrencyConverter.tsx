"use client";

import { useEffect, useState } from "react";
import { DEFAULT_USD_DA, usdToDa } from "@/lib/fx";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/runtime";

const RATE_KEY = "dz-fx-rate";

/**
 * USD <-> DA converter.
 *
 * One line, two inputs, no page of its own. The rate is editable because the
 * parallel rate moves weekly - a hardcoded 240 would be wrong within a month
 * and there is no honest fixed rate. Persisted per visitor in localStorage.
 */
export default function CurrencyConverter({ locale = DEFAULT_LOCALE }: { locale?: Locale }) {
  const t = makeT(locale);
  const [usd, setUsd] = useState("100");
  const [rate, setRate] = useState<string>(String(DEFAULT_USD_DA));
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(RATE_KEY);
      if (saved && Number(saved) > 0) setRate(saved);
    } catch {
      /* private mode: the default still works */
    }
  }, []);

  const rateNum = Number(rate) > 0 ? Number(rate) : DEFAULT_USD_DA;
  const usdNum = Number(usd);
  const da = usdToDa(usdNum, rateNum);

  const saveRate = (v: string) => {
    setRate(v);
    setTouched(true);
    try {
      if (Number(v) > 0) localStorage.setItem(RATE_KEY, v);
    } catch {
      /* ignore */
    }
  };

  const input =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 font-mono text-sm font-bold tabular-nums text-slate-900 focus:border-[#2c87c3] focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white";

  return (
    <section
      aria-label={t("fx.title")}
      className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800/40"
    >
      <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
        <h2 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t("fx.title")}
        </h2>
        <label className="ml-auto flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400">
          {t("fx.rate")}
          <input
            type="number"
            min={1}
            value={rate}
            onChange={(e) => saveRate(e.target.value)}
            className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1 font-mono text-xs font-bold tabular-nums dark:border-slate-700 dark:bg-slate-900"
            aria-label={t("fx.rate")}
          />
          <span className="font-mono">DA</span>
        </label>
      </div>

      <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto_1fr] sm:items-center">
        <label className="block">
          <span className="mb-1 block text-[11px] font-semibold text-slate-500">$ USD</span>
          <input
            type="number"
            min={0}
            value={usd}
            onChange={(e) => setUsd(e.target.value)}
            className={input}
            inputMode="decimal"
          />
        </label>
        <span aria-hidden="true" className="hidden text-slate-300 sm:block">
          =
        </span>
        <div>
          <span className="mb-1 block text-[11px] font-semibold text-slate-500">{t("fx.da")}</span>
          <output className="block rounded-lg bg-slate-100 px-3 py-2 font-mono text-sm font-extrabold tabular-nums text-slate-900 dark:bg-slate-900 dark:text-white">
            {Number.isFinite(usdNum) ? da.toLocaleString("en-US") : "—"} DA
          </output>
        </div>
      </div>

      <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
        {touched ? t("fx.savedNote") : t("fx.note")}
      </p>
    </section>
  );
}
