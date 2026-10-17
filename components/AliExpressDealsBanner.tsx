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
        className={`group block rounded-lg border border-line bg-surface p-3.5 transition-colors hover:border-[#0a63c9]/40 sm:p-4 ${className}`}
      >
        <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#0088cc]/10 text-[#0077b3] dark:text-[#38bdf8]">
              <TelegramIcon className="h-4 w-4 fill-current" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="tag">Telegram</span>
                <span className="truncate text-sm font-semibold text-ink">
                  {t("aliexpress.bannerTitle")}
                </span>
              </div>
              <p className="mt-0.5 line-clamp-1 text-xs text-ink-3">
                {t("aliexpress.bannerDesc")}
              </p>
            </div>
          </div>
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary shrink-0 px-4 py-2"
          >
            <span>{t("aliexpress.cta")}</span>
          </a>
        </div>
      </aside>
    );
  }

  // Full Rich Banner variant.
  //
  // Same reasoning as the Bytek placements: this was a navy gradient slab with
  // tinted glass pills, which on the near-black dark canvas read as a blue
  // rectangle floating in space. It is now a plain surface with an accent
  // edge and flat tags.
  return (
    <aside
      aria-label="AliExpress Deals & Coupons Channel"
      className={`relative overflow-hidden rounded-lg border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0088cc]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col justify-between gap-5 pl-2 sm:pl-3 md:flex-row md:items-center">
        <div className="max-w-2xl space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="tag">
              <TelegramIcon className="h-3.5 w-3.5 fill-current" />
              <span>@DzAliexpress0</span>
            </span>
            <span className="tag">{t("aliexpress.navBadge")}</span>
          </div>

          <h2 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
            {t("aliexpress.bannerTitle")}
          </h2>

          <p className="text-[13px] leading-relaxed text-ink-2">
            {t("aliexpress.bannerDesc")}
          </p>

          <div className="flex flex-wrap gap-1.5 pt-0.5 text-xs">
            <span className="tag">
              <TicketIcon className="h-3.5 w-3.5 text-[#0a63c9] dark:text-[#5b9cf5]" />
              <span>{t("aliexpress.badge1")}</span>
            </span>
            <span className="tag">
              <ShieldCheckIcon className="h-3.5 w-3.5 text-[#0a7a4a] dark:text-[#4ade9b]" />
              <span>{t("aliexpress.badge2")}</span>
            </span>
            <span className="tag">
              <CpuIcon className="h-3.5 w-3.5 text-[#0a63c9] dark:text-[#5b9cf5]" />
              <span>{t("aliexpress.badge3")}</span>
            </span>
          </div>
        </div>

        <div className="flex shrink-0 flex-col justify-center gap-2.5 sm:flex-row md:flex-col">
          <a
            href={TELEGRAM_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary px-5 py-2.5"
          >
            <TelegramIcon className="h-4 w-4 fill-current" />
            <span>{t("aliexpress.cta")}</span>
          </a>
        </div>
      </div>
    </aside>
  );
}
