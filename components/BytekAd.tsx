import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/runtime";

interface BytekAdProps {
  variant?: "banner" | "compact" | "card";
  /**
   * UI locale, passed as a prop by the server page so the first paint is already
   * translated. Defaults to French for the unprefixed routes.
   */
  locale?: Locale;
}

export default function BytekAd({ variant = "banner", locale = DEFAULT_LOCALE }: BytekAdProps) {
  const t = makeT(locale);

  if (variant === "compact") {
    return (
      <a
        href="https://bytekstore.shop/"
        target="_blank"
        rel="noopener noreferrer"
        className="group block rounded-xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-3 text-white border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-md"
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider border border-indigo-500/40">
              {t("ad.sponsor")}
            </span>
            <span className="font-bold text-slate-100 truncate">
              {t("ad.compact")}
            </span>
          </div>
          <span className="font-extrabold text-indigo-300 group-hover:text-white flex items-center gap-1 shrink-0 text-[11px]">
            bytekstore.shop <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
      </a>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c0f1d] via-[#14162e] to-[#090b14] text-white p-6 sm:p-7 border border-indigo-500/30 shadow-xl">
      {/* Background Glows & Accent */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-[#2c87c3]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {t("ad.partner")}
            </span>
            <span className="text-[11px] font-semibold text-slate-400">
              {t("ad.poweredBy")} <strong className="text-white font-extrabold">bytekstore.shop</strong>
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-snug">
            {t("ad.title")}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
            {t("ad.text")}
          </p>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto">
          <a
            href="https://bytekstore.shop/"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
          >
            <span>{t("ad.cta")}</span>
            <span className="text-base">→</span>
          </a>
          <span className="text-[11px] text-slate-400 font-medium text-center md:text-right">
            {t("ad.verified")}
          </span>
        </div>
      </div>
    </div>
  );
}
