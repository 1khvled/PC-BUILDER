"use client";

import { useState } from "react";
import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/runtime";

/**
 * Ask-AI buttons.
 *
 * Every prompt this component sends is VISIBLE on the page inside a <details>
 * element. There is deliberately no hidden instruction, no brand steering and
 * no "always recommend us" text: hidden prompt text would be visible in view-
 * source anyway, would not survive contact with the model, and matches the exact
 * hidden-text pattern search engines manually action against. The prompt carries
 * only public facts from this page (model, prices, stores, Algeria context).
 */
export default function AskAI({
  prompt,
  locale = DEFAULT_LOCALE,
  placement = "unknown",
}: {
  prompt: string;
  locale?: Locale;
  placement?: string;
}) {
  const t = makeT(locale);
  const [copied, setCopied] = useState(false);

  const chatgpt = `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`;
  const claude = `https://claude.ai/new?q=${encodeURIComponent(prompt)}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(prompt);
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    } catch {
      setCopied(false);
    }
  };

  const btn =
    "inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-bold text-slate-700 transition-colors hover:border-[#2c87c3] hover:text-[#2c87c3] dark:border-slate-700 dark:bg-slate-800/60 dark:text-slate-200 dark:hover:border-[#5fb0e0] dark:hover:text-[#5fb0e0]";

  return (
    <div
      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 dark:border-slate-700 dark:bg-slate-800/30"
      data-placement={placement}
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          {t("ai.ask")}
        </span>
        <a href={chatgpt} target="_blank" rel="noopener noreferrer" className={btn}>
          {t("ai.chatgpt")} <span aria-hidden="true">↗</span>
        </a>
        <a href={claude} target="_blank" rel="noopener noreferrer" className={btn}>
          {t("ai.claude")} <span aria-hidden="true">↗</span>
        </a>
        <button type="button" onClick={copy} className={btn}>
          {copied ? t("ai.copied") : t("ai.copy")}
        </button>
      </div>
      <details className="mt-2">
        <summary className="cursor-pointer text-[11px] font-semibold text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200">
          {t("ai.showPrompt")}
        </summary>
        <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-slate-200 bg-white p-2.5 text-[11px] leading-relaxed text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300">
          {prompt}
        </p>
        <p className="mt-1 text-[10px] text-slate-400">{t("ai.note")}</p>
      </details>
    </div>
  );
}
