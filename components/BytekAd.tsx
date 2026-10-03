import { DEFAULT_LOCALE, type Locale } from "@/lib/i18n/config";
import { makeT } from "@/lib/i18n/runtime";

interface BytekAdProps {
  variant?: "banner" | "compact" | "card" | "strip" | "peripherals";
  /**
   * UI locale, passed as a prop by the server page so the first paint is already
   * translated. Defaults to French for the unprefixed routes.
   */
  locale?: Locale;
  /** Placement context, forwarded to the store as a utm_content value. */
  placement?: string;
}

/**
 * Outbound link to the sponsor.
 *
 * The utm_* parameters are deliberate: without them bytekstore.shop cannot tell
 * which surface on DZ PartPicker actually drives its traffic, which makes the
 * partnership impossible to measure or to price per placement. `placement`
 * should stay stable per call site so the report stays readable.
 */
const STORE_URL = "https://bytekstore.shop/";

/** `as const` so the keys stay literal and `t()` stays type-checked. */
const TRUST_POINTS = ["ad.pointStock", "ad.pointWilayas", "ad.pointCods"] as const;
function storeHref(placement: string) {
  return `${STORE_URL}products?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=sponsor&utm_content=${encodeURIComponent(placement)}`;
}

/** Light tile so the dark navy wordmark stays legible on the dark ad surface. */
function BytekLogo({ className = "h-7 w-auto" }: { className?: string }) {
  return (
    // `dz-light-tile`, not `bg-white`: the dark theme repaints `bg-white` dark,
    // which made this navy wordmark disappear in dark mode.
    <span className="inline-flex items-center justify-center rounded-lg dz-light-tile px-2.5 py-1.5 shadow-sm shrink-0">
      <img
        src="/brand/bytek-logo.webp"
        alt="Bytek Store"
        width={560}
        height={237}
        loading="lazy"
        decoding="async"
        className={className}
      />
    </span>
  );
}

export default function BytekAd({
  variant = "banner",
  locale = DEFAULT_LOCALE,
  placement = "unknown",
}: BytekAdProps) {
  const t = makeT(locale);
  const href = storeHref(placement);

  if (variant === "compact") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group block rounded-xl bg-gradient-to-r from-[#0f172a] via-[#1e1b4b] to-[#0f172a] p-3 text-white border border-indigo-500/30 hover:border-indigo-400 transition-all shadow-md"
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold text-[10px] uppercase tracking-wider border border-indigo-500/40 shrink-0">
              {t("ad.sponsor")}
            </span>
            <span className="font-bold text-slate-100 truncate">{t("ad.compact")}</span>
          </div>
          <span className="font-extrabold text-indigo-300 group-hover:text-white flex items-center gap-1 shrink-0 text-[11px]">
            bytekstore.shop <span className="group-hover:translate-x-0.5 transition-transform">→</span>
          </span>
        </div>
        {/* Independence stated on this variant too: it is the one used on every
            text-heavy page, which is exactly where a reader is most likely to
            wonder whether the sponsor bought the placement. */}
        <p className="mt-1 text-[10px] leading-relaxed text-slate-500">{t("ad.independence")}</p>
      </a>
    );
  }

  // Slim strip: sits under a product hero without stealing the buy box's space.
  if (variant === "strip") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group flex items-center gap-3 sm:gap-4 rounded-xl border border-indigo-500/25 bg-gradient-to-r from-[#0f172a] via-[#151634] to-[#0f172a] p-3 sm:p-3.5 text-white hover:border-indigo-400/70 transition-all"
      >
        <BytekLogo className="h-6 sm:h-7 w-auto" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 font-extrabold text-[9px] uppercase tracking-widest border border-indigo-500/40">
              {t("ad.sponsor")}
            </span>
            <span className="font-bold text-[13px] truncate">{t("ad.title")}</span>
          </div>
          <p className="text-[11px] text-slate-300/90 mt-0.5 line-clamp-2 leading-relaxed">{t("ad.text")}</p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1 text-xs font-extrabold text-indigo-300 group-hover:text-white whitespace-nowrap">
          <span className="hidden sm:inline">{t("ad.cta")}</span>
          <span className="text-base group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
      </a>
    );
  }

  if (variant === "card") {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer sponsored"
        className="group block rounded-2xl bg-gradient-to-br from-[#0c0f1d] via-[#14162e] to-[#090b14] text-white border border-indigo-500/30 p-5 hover:border-indigo-400/70 hover:shadow-card-hover transition-all"
      >
        <div className="flex items-center gap-3">
          <BytekLogo className="h-8 w-auto" />
          <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-extrabold text-[9px] uppercase tracking-widest border border-indigo-500/40">
            {t("ad.sponsor")}
          </span>
        </div>
        <h3 className="font-black text-base text-white mt-3 leading-snug group-hover:text-indigo-200 transition-colors">
          {t("ad.title")}
        </h3>
        <p className="text-xs text-slate-300/90 mt-1.5 leading-relaxed line-clamp-3">{t("ad.text")}</p>
        <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-extrabold text-indigo-300 group-hover:text-white">
          {t("ad.cta")}
          <span className="group-hover:translate-x-0.5 transition-transform">→</span>
        </span>
        <span className="mt-2 block text-[10px] leading-relaxed text-slate-500">{t("ad.independence")}</span>
      </a>
    );
  }

  if (variant === "peripherals") {
    return (
      <aside
        aria-label="Bytek Store Esports Peripherals"
        className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c0f1d] via-[#14162e] to-[#090b14] text-white p-5 sm:p-7 border border-indigo-500/35 shadow-xl"
      >
        {/* Ambient glows */}
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-10 -mb-10 w-48 h-48 bg-[#2c87c3]/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />

        <div className="relative z-10 space-y-4">
          {/* Header Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <BytekLogo className="h-7 sm:h-8 w-auto" />
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-500/40">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                {t("ad.partner")}
              </span>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-xs shadow-md transition-all self-start sm:self-auto group"
            >
              <span>{t("bytek.shopAll")}</span>
              <span className="group-hover:translate-x-0.5 transition-transform">→</span>
            </a>
          </div>

          <div>
            <h3 className="text-base sm:text-xl font-black text-white tracking-tight">
              {t("bytek.peripheralsTitle")}
            </h3>
            <p className="text-xs sm:text-sm text-slate-300/90 mt-1 max-w-3xl leading-relaxed">
              {t("bytek.peripheralsSubtitle")}
            </p>
          </div>

          {/* 4 Cards Grid: Mice, Keyboards, Audio, Controllers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            <a
              href={`${STORE_URL}wireless-gaming-mouse-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_mice&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-xl mb-1">🖱️</div>
                <div className="font-extrabold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  {t("bytek.catMice")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catMiceDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                <span>{t("bytek.shopMice")}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </a>

            <a
              href={`${STORE_URL}gaming-keyboards-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_keyboards&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-xl mb-1">⌨️</div>
                <div className="font-extrabold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  {t("bytek.catKeyboards")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catKeyboardsDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                <span>{t("bytek.shopKeyboards")}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </a>

            <a
              href={`${STORE_URL}gaming-headsets-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_audio&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-xl mb-1">🎧</div>
                <div className="font-extrabold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  {t("bytek.catAudio")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catAudioDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                <span>{t("bytek.shopAudio")}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </a>

            <a
              href={`${STORE_URL}gaming-controllers-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_controllers&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 hover:border-indigo-400/50 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="text-xl mb-1">🎮</div>
                <div className="font-extrabold text-xs text-white group-hover:text-indigo-300 transition-colors">
                  {t("bytek.catControllers")}
                </div>
                <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catControllersDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] text-indigo-400 font-bold flex items-center gap-1">
                <span>{t("bytek.shopControllers")}</span>
                <span className="group-hover:translate-x-0.5 transition-transform">→</span>
              </div>
            </a>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-[11px] text-slate-400 border-t border-white/5">
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              {TRUST_POINTS.map((k) => (
                <span key={k} className="inline-flex items-center gap-1.5 text-slate-300 font-semibold">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  {t(k)}
                </span>
              ))}
            </div>
            <span className="text-[10px] text-slate-500">{t("ad.independence")}</span>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0c0f1d] via-[#14162e] to-[#090b14] text-white p-6 sm:p-7 border border-indigo-500/30 shadow-xl">
      {/* Background Glows & Accent */}
      <div className="absolute top-0 right-0 -mt-10 -mr-10 w-60 h-60 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 -mb-10 w-48 h-48 bg-[#2c87c3]/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-80" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <BytekLogo className="h-8 sm:h-9 w-auto" />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-[10px] font-extrabold uppercase tracking-widest border border-indigo-500/40">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
              {t("ad.partner")}
            </span>
          </div>

          <h3 className="text-lg sm:text-2xl font-black tracking-tight text-white leading-snug">
            {t("ad.title")}
          </h3>

          <p className="text-xs sm:text-sm text-slate-300/90 leading-relaxed">
            {t("ad.text")}
          </p>

          {/* Concrete trust points: the three things that actually decide a purchase */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
            {TRUST_POINTS.map((k) => (
              <li key={k} className="inline-flex items-center gap-1.5 text-[11px] text-slate-300 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                {t(k)}
              </li>
            ))}
          </ul>
        </div>

        <div className="shrink-0 flex flex-col sm:flex-row md:flex-col items-stretch sm:items-center md:items-end gap-3 w-full md:w-auto">
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer sponsored"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 hover:shadow-indigo-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all text-center"
          >
            <span>{t("ad.cta")}</span>
            <span className="text-base">→</span>
          </a>
          <span className="text-[11px] text-slate-400 font-medium text-center md:text-right">
            {t("ad.verified")}
            {/* Guardrail in docs/MONETIZATION-PLAN.md: editorial independence is
                stated wherever a sponsor is present. Rendering it inside the
                component means every placement inherits it, including any added
                later, instead of relying on the footer being read. */}
            <span className="block mt-1 max-w-xs">{t("ad.independence")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}