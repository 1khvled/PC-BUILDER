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

function LightningIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
    </svg>
  );
}

function CheckIcon({ className = "w-3 h-3" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function TicketIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2z" />
      <path d="M13 5v2M13 11v2M13 17v2" />
    </svg>
  );
}

function ShieldCheckIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  );
}

function CpuIcon({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M9 1v3M15 1v3M9 20v3M15 20v3M20 9h3M20 15h3M1 9h3M1 15h3" />
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
        badgeClass: "bg-sky-500/20 text-sky-300 border border-sky-400/30",
        icon: <TelegramIcon className="w-3 h-3 fill-[#38bdf8]" />,
        text: isFr
          ? "Bons plans & Codes Promo AliExpress DZ : Économisez sur vos pièces & accessoires !"
          : "AliExpress DZ Deals & Promo Codes: Save big on PC parts & tech gear!",
        cta: isFr ? "Rejoindre Telegram" : "Join Telegram",
        href: TELEGRAM_CHANNEL_URL,
      },
      {
        id: "bytek-main",
        badge: isFr ? "PARTENAIRE" : "SPONSOR",
        badgeClass: "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30",
        icon: <LightningIcon className="w-3 h-3 text-indigo-400" />,
        text: isFr
          ? "Bytek Store • Souris & Périphériques Esport en Algérie (Livraison 58 Wilayas)"
          : "Bytek Store • Esports mice & pro gaming peripherals in Algeria (58 Wilayas)",
        cta: isFr ? "Boutique Bytek" : "Shop Bytek",
        href: BYTEK_URL,
      },
      {
        id: "telegram-choice",
        badge: "CHOICE",
        badgeClass: "bg-amber-500/20 text-amber-300 border border-amber-400/30",
        icon: <TelegramIcon className="w-3 h-3 fill-[#38bdf8]" />,
        text: isFr
          ? "Canal Telegram @DzAliexpress0 • Coupons exclusifs & promos Choice livrés en Algérie"
          : "Telegram Channel @DzAliexpress0 • Exclusive coupons & Choice promos shipped to Algeria",
        cta: "@DzAliexpress0",
        href: TELEGRAM_CHANNEL_URL,
      },
      {
        id: "bytek-trust",
        badge: isFr ? "58 WILAYAS" : "58 WILAYAS COD",
        badgeClass: "bg-emerald-500/20 text-emerald-300 border border-emerald-400/30",
        icon: <CheckIcon className="w-3 h-3 text-emerald-400" />,
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
        className={`relative overflow-hidden bg-[#0a0d14] text-white text-[10.5px] h-7.5 sm:h-8 flex items-center font-medium shadow-xs border-b border-white/[0.08] ${className}`}
      >
        {/* Left and right fade gradient masks */}
        <div className="pointer-events-none absolute inset-y-0 left-0 w-8 sm:w-16 bg-gradient-to-r from-[#0a0d14] to-transparent z-10" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-8 sm:w-16 bg-gradient-to-l from-[#0a0d14] to-transparent z-10" />

        {/* Ticker scrolling track */}
        <div className="dz-ticker-track flex items-center gap-6 sm:gap-8">
          {fullTrack.map((item, idx) => (
            <a
              key={`${item.id}-${idx}`}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 group shrink-0 px-2.5 py-0.5 rounded-full bg-white/[0.03] hover:bg-white/[0.08] border border-white/[0.06] hover:border-white/20 transition-all text-slate-300 hover:text-white"
            >
              <span className="w-3.5 h-3.5 rounded-full bg-white/[0.06] flex items-center justify-center shrink-0">
                {item.icon}
              </span>
              <span
                className={`px-1.5 py-0.2 rounded text-[8.5px] font-extrabold uppercase tracking-wider shrink-0 ${item.badgeClass}`}
              >
                {item.badge}
              </span>
              <span className="text-[10.5px] font-medium tracking-tight whitespace-nowrap text-slate-300">
                {item.text}
              </span>
              <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-sky-400 group-hover:text-cyan-300 group-hover:translate-x-0.5 transition-all shrink-0">
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
        className={`group block rounded-xl border border-white/[0.08] bg-gradient-to-r from-[#0c0f18] via-[#101524] to-[#0a0c14] p-3.5 sm:p-4 text-white hover:border-[#0088cc]/50 transition-all shadow-md ${className}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-[#0088cc]/15 border border-[#0088cc]/30 flex items-center justify-center text-[#38bdf8] shrink-0">
              <TelegramIcon className="w-4.5 h-4.5 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.2 rounded bg-sky-500/15 text-sky-300 font-bold text-[9.5px] uppercase tracking-wider border border-sky-400/20">
                  Telegram
                </span>
                <span className="font-semibold text-sm text-slate-100 truncate">
                  {t("aliexpress.bannerTitle")}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">
                {t("aliexpress.bannerDesc")}
              </p>
            </div>
          </div>
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0088cc] hover:bg-[#007cb8] text-white text-xs font-semibold transition-all shrink-0"
          >
            <span>{t("aliexpress.cta")}</span>
            <span aria-hidden="true" className="group-hover:translate-x-0.5 transition-transform">→</span>
          </a>
        </div>
      </aside>
    );
  }

  // Full Rich Banner variant (Redesigned: Clean Hardware Aesthetic, Zero AI Slop)
  return (
    <aside
      aria-label="AliExpress Deals & Coupons Channel"
      className={`rounded-2xl border border-white/[0.08] bg-gradient-to-br from-[#0c0f18] via-[#101524] to-[#0a0d15] p-5 sm:p-6 text-white shadow-xl relative overflow-hidden ${className}`}
    >
      {/* Subtle architectural gradient shimmer */}
      <div className="absolute top-0 right-0 w-80 h-40 bg-gradient-to-b from-[#0088cc]/8 to-transparent pointer-events-none rounded-tr-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
        <div className="space-y-3 max-w-2xl">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#0088cc]/15 border border-[#0088cc]/30 text-[#38bdf8] text-[11px] font-bold tracking-wide">
              <TelegramIcon className="w-3.5 h-3.5 fill-current" />
              <span>@DzAliexpress0</span>
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/[0.06] text-slate-300 border border-white/10 text-[10px] font-semibold uppercase tracking-wider">
              {t("aliexpress.navBadge")}
            </span>
          </div>

          <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
            {t("aliexpress.bannerTitle")}
          </h2>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
            {t("aliexpress.bannerDesc")}
          </p>

          <div className="flex flex-wrap gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 font-medium">
              <TicketIcon className="w-3.5 h-3.5 text-[#38bdf8]" />
              <span>{t("aliexpress.badge1")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 font-medium">
              <ShieldCheckIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>{t("aliexpress.badge2")}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/[0.08] text-slate-300 font-medium">
              <CpuIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>{t("aliexpress.badge3")}</span>
            </span>
          </div>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2.5 justify-center">
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0088cc] hover:bg-[#007cb8] text-white font-bold text-xs tracking-wide transition-all shadow-[0_2px_12px_rgba(0,136,204,0.3)] hover:shadow-[0_4px_18px_rgba(0,136,204,0.5)] group"
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
