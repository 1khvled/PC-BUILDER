import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/runtime";

interface AliExpressDealsBannerProps {
  variant?: "banner" | "strip" | "card" | "topbar";
  locale?: Locale;
  className?: string;
}

export const TELEGRAM_CHANNEL_URL = "https://t.me/DzAliexpress0";

export function TelegramIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.92-1.27 4.86-2.11 5.83-2.51 2.78-1.16 3.35-1.36 3.73-1.36.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.24 0 .38z" />
    </svg>
  );
}

export default function AliExpressDealsBanner({
  variant = "banner",
  locale = DEFAULT_LOCALE,
  className = "",
}: AliExpressDealsBannerProps) {
  const t = makeT(locale);

  if (variant === "topbar") {
    return (
      <aside
        aria-label="AliExpress Telegram Channel"
        className={`bg-gradient-to-r from-[#0077b5] via-[#0088cc] to-[#229ed9] text-white text-[11px] sm:text-xs py-1.5 px-3 font-semibold shadow-inner border-b border-white/10 ${className}`}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between sm:justify-center gap-2 sm:gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="w-5 h-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">
              <TelegramIcon className="w-3 h-3 fill-white" />
            </span>
            <span className="px-1.5 py-0.5 rounded bg-amber-400 text-slate-900 text-[10px] font-black uppercase tracking-wider shrink-0">
              {t("aliexpress.navBadge")}
            </span>
            <span className="truncate">{t("aliexpress.topbar")}</span>
          </div>
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-white text-[#0088cc] hover:bg-white/90 font-bold text-[11px] transition-colors shrink-0 shadow-xs"
          >
            <span>{t("aliexpress.topbarCta")}</span>
            <span aria-hidden="true">→</span>
          </a>
        </div>
      </aside>
    );
  }

  if (variant === "strip") {
    return (
      <aside
        aria-label="AliExpress Deals"
        className={`group block rounded-xl border border-sky-500/30 bg-gradient-to-r from-[#0d1e33] via-[#0e2746] to-[#0a1829] p-3.5 sm:p-4 text-white hover:border-sky-400 transition-all shadow-md ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#0088cc] to-[#29b6f6] flex items-center justify-center text-white shrink-0 shadow-[0_4px_12px_rgba(0,136,204,0.4)]">
              <TelegramIcon className="w-5 h-5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-sky-500/20 text-sky-300 font-extrabold text-[9px] uppercase tracking-wider border border-sky-500/40">
                  Telegram
                </span>
                <span className="font-bold text-sm text-slate-100 truncate">
                  {t("aliexpress.bannerTitle")}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">
                {t("aliexpress.bannerDesc")}
              </p>
            </div>
          </div>
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-[#0088cc] hover:bg-[#0077b5] text-white text-xs font-bold transition-all shadow-[0_0_12px_rgba(0,136,204,0.3)] shrink-0"
          >
            <span>{t("aliexpress.cta")}</span>
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>
      </aside>
    );
  }

  // Full Rich Banner variant
  return (
    <aside
      aria-label="AliExpress Deals & Coupons Channel"
      className={`rounded-2xl border border-sky-500/30 bg-gradient-to-br from-[#0c1c30] via-[#0d223c] to-[#071322] p-5 sm:p-6 text-white shadow-lg relative overflow-hidden ${className}`}
    >
      {/* Decorative ambient glow */}
      <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full bg-sky-500/10 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 w-48 h-48 rounded-full bg-amber-500/10 blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0088cc]/20 border border-[#0088cc]/40 text-[#38bdf8] text-[11px] font-black uppercase tracking-wider">
              <TelegramIcon className="w-3.5 h-3.5 fill-current" />
              <span>@DzAliexpress0</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-extrabold uppercase">
              {t("aliexpress.navBadge")}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-black tracking-tight text-white">
            {t("aliexpress.bannerTitle")}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t("aliexpress.bannerDesc")}
          </p>

          <div className="flex flex-wrap gap-2 pt-1 text-[11px]">
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-slate-200 font-medium">
              ⚡ {t("aliexpress.badge1")}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-slate-200 font-medium">
              📦 {t("aliexpress.badge2")}
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/[0.06] border border-white/10 text-slate-200 font-medium">
              💻 {t("aliexpress.badge3")}
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-gradient-to-r from-[#0088cc] to-[#0099e6] hover:from-[#0077b5] hover:to-[#0088cc] text-white font-extrabold text-sm transition-all shadow-[0_4px_16px_rgba(0,136,204,0.4)] hover:shadow-[0_4px_24px_rgba(0,136,204,0.6)] group"
          >
            <TelegramIcon className="w-4 h-4 fill-current" />
            <span>{t("aliexpress.cta")}</span>
            <span aria-hidden="true" className="group-hover:translate-x-1 transition-transform">→</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
