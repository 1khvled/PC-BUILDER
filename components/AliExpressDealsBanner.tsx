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
    const BYTEK_URL =
      "https://bytekstore.shop/?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=sponsor&utm_content=topbar_ticker";
    const isFr = locale === "fr";

    const tickerItems = [
      {
        id: "telegram-main",
        badge: isFr ? "PROMO" : "DEALS",
        badgeClass: "bg-amber-400 text-slate-950",
        icon: <TelegramIcon className="w-3 h-3 fill-[#0088cc]" />,
        text: isFr
          ? "Bons plans & Codes Promo AliExpress DZ : Économisez sur vos pièces & accessoires !"
          : "AliExpress DZ Deals & Promo Codes: Save big on PC parts & tech gear!",
        cta: isFr ? "Rejoindre Telegram" : "Join Telegram",
        href: TELEGRAM_CHANNEL_URL,
      },
      {
        id: "bytek-main",
        badge: isFr ? "PARTENAIRE" : "SPONSOR",
        badgeClass: "bg-indigo-500/30 text-indigo-200 border border-indigo-400/30",
        icon: (
          <span className="w-3.5 h-3.5 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 text-[11px] leading-none">
            ⚡
          </span>
        ),
        text: isFr
          ? "Bytek Store • Souris & Périphériques Esport en Algérie (Livraison 58 Wilayas)"
          : "Bytek Store • Esports mice & pro gaming peripherals in Algeria (58 Wilayas)",
        cta: isFr ? "Boutique Bytek" : "Shop Bytek",
        href: BYTEK_URL,
      },
      {
        id: "telegram-drops",
        badge: "DROPS",
        badgeClass: "bg-sky-400/20 text-sky-200 border border-sky-400/40",
        icon: <TelegramIcon className="w-3 h-3 fill-[#38bdf8]" />,
        text: isFr
          ? "Canal Telegram @DzAliexpress0 • Coupons exclusifs & promos Choice livrés en Algérie"
          : "Telegram Channel @DzAliexpress0 • Exclusive coupons & Choice promos shipped to Algeria",
        cta: "@DzAliexpress0",
        href: TELEGRAM_CHANNEL_URL,
      },
      {
        id: "bytek-trust",
        badge: isFr ? "EXPÉDITION 58W" : "58 WILAYAS COD",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/40",
        icon: (
          <span className="w-3.5 h-3.5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-[10px] leading-none font-bold">
            ✓
          </span>
        ),
        text: isFr
          ? "Bytek Store : Stock 100% réel en Algérie • Expédition express & Paiement à la livraison"
          : "Bytek Store: 100% verified real stock in Algeria • Express shipping & Cash on delivery",
        cta: "bytekstore.shop",
        href: BYTEK_URL,
      },
    ];

    // Duplicate list once to achieve seamless -50% CSS infinite marquee
    const fullTrack = [...tickerItems, ...tickerItems];

    return (
      <aside
        aria-label="Announcements & Deals Ticker"
        className={`relative overflow-hidden bg-gradient-to-r from-[#0b0e17] via-[#131627] to-[#0b0e17] text-white text-[11px] py-1.5 font-medium shadow-xs border-b border-indigo-500/20 ${className}`}
      >
        {/* Left and right fade gradient masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#0b0e17] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#0b0e17] to-transparent z-10" />

        {/* Bottom micro accent line */}
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

        {/* Ticker scrolling track */}
        <div className="dz-ticker-track flex items-center gap-6 sm:gap-10">
          {fullTrack.map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group shrink-0 px-2.5 py-0.5 rounded-full bg-white/[0.04] hover:bg-white/[0.09] border border-white/[0.06] hover:border-white/20 transition-all text-slate-200 hover:text-white"
            >
              <span className="w-4 h-4 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              <span
                className={`px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider shrink-0 ${item.badgeClass}`}
              >
                {item.badge}
              </span>
              <span className="text-[11px] font-medium tracking-tight whitespace-nowrap">
                {item.text}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10.5px] font-bold text-sky-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0">
                <span>{item.cta}</span>
                <span aria-hidden="true">→</span>
              </span>
            </a>
          ))}
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
