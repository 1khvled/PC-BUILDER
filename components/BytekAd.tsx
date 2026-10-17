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

function MouseVector({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="5" y="2" width="14" height="20" rx="7" />
      <path d="M12 6v4" />
    </svg>
  );
}

function KeyboardVector({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M6 8h.01M10 8h.01M14 8h.01M18 8h.01M6 12h.01M10 12h.01M14 12h.01M18 12h.01M7 16h10" />
    </svg>
  );
}

function HeadsetVector({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
      <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
  );
}

function GamepadVector({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <line x1="6" y1="12" x2="10" y2="12" />
      <line x1="8" y1="10" x2="8" y2="14" />
      <line x1="15" y1="13" x2="15.01" y2="13" />
      <line x1="18" y1="11" x2="18.01" y2="11" />
      <rect x="2" y="6" width="20" height="12" rx="6" />
    </svg>
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
        className="group block rounded-lg border border-line bg-surface p-3 transition-colors hover:border-[#0a63c9]/40"
      >
        <div className="flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 min-w-0">
            <span className="tag shrink-0">{t("ad.sponsor")}</span>
            <span className="truncate font-medium text-ink">{t("ad.compact")}</span>
          </div>
          <span className="shrink-0 text-[11px] font-semibold text-[#0a63c9] dark:text-[#5b9cf5]">
            bytekstore.shop
          </span>
        </div>
        {/* Independence stated on this variant too: it is the one used on every
            text-heavy page, which is exactly where a reader is most likely to
            wonder whether the sponsor bought the placement. */}
        <p className="mt-1 text-[10px] leading-relaxed text-ink-3">{t("ad.independence")}</p>
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
        className="group flex items-center gap-3 rounded-lg border border-line bg-surface p-3 transition-colors hover:border-[#0a63c9]/40 sm:gap-4 sm:p-3.5"
      >
        <span className="dz-light-tile inline-flex items-center rounded border border-line px-1.5 py-1">
          <BytekLogo className="h-6 w-auto" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5">
            <span className="tag shrink-0">{t("ad.sponsor")}</span>
            <span className="truncate text-[13px] font-semibold text-ink">{t("ad.title")}</span>
          </div>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-relaxed text-ink-2">{t("ad.text")}</p>
        </div>
        <span className="hidden shrink-0 whitespace-nowrap text-xs font-semibold text-[#0a63c9] group-hover:underline sm:inline dark:text-[#5b9cf5]">
          {t("ad.cta")}
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
        className="group block rounded-lg border border-line bg-surface p-5 transition-colors hover:border-[#0a63c9]/40"
      >
        <div className="flex items-center gap-2.5">
          <span className="dz-light-tile inline-flex items-center rounded border border-line px-1.5 py-1">
            <BytekLogo className="h-6 w-auto" />
          </span>
          <span className="tag">{t("ad.sponsor")}</span>
        </div>
        <h3 className="mt-3 text-base font-semibold leading-snug text-ink">
          {t("ad.title")}
        </h3>
        <p className="mt-1.5 line-clamp-3 text-xs leading-relaxed text-ink-2">{t("ad.text")}</p>
        <span className="mt-3 inline-block text-xs font-semibold text-[#0a63c9] group-hover:underline dark:text-[#5b9cf5]">
          {t("ad.cta")}
        </span>
        <span className="mt-2 block text-[10px] leading-relaxed text-ink-3">{t("ad.independence")}</span>
      </a>
    );
  }

  if (variant === "peripherals") {
    return (
      <aside
        aria-label="Bytek Store Esports Peripherals"
        className="relative overflow-hidden rounded-lg border border-line bg-surface p-5 sm:p-7"
      >
        <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0a63c9] dark:bg-[#5b9cf5]" aria-hidden="true" />

        <div className="relative z-10 space-y-4 pl-2 sm:pl-3">
          {/* Header Row */}
          <div className="flex flex-col justify-between gap-3 border-b border-line pb-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2.5">
              <span className="dz-light-tile inline-flex items-center rounded border border-line px-1.5 py-1">
                <BytekLogo className="h-6 w-auto" />
              </span>
              <span className="tag tag-ok">
                <span className="dot" aria-hidden="true" />
                {t("ad.partner")}
              </span>
            </div>
            <a
              href={href}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="btn btn-primary self-start px-4 py-2 sm:self-auto"
            >
              <span>{t("bytek.shopAll")}</span>
            </a>
          </div>

          <div>
            <h3 className="text-lg font-semibold tracking-tight text-ink sm:text-xl">
              {t("bytek.peripheralsTitle")}
            </h3>
            <p className="mt-1 max-w-3xl text-[13px] leading-relaxed text-ink-2">
              {t("bytek.peripheralsSubtitle")}
            </p>
          </div>

          {/* 4 Cards Grid: Mice, Keyboards, Audio, Controllers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 pt-1">
            <a
              href={`${STORE_URL}wireless-gaming-mouse-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_mice&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-lg border border-line bg-surface-subtle hover:border-[#0a63c9]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-accent-soft text-[#0a63c9] dark:text-[#5b9cf5] flex items-center justify-center mb-2">
                  <MouseVector className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-ink">
                  {t("bytek.catMice")}
                </div>
                <div className="text-[11px] text-ink-3 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catMiceDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-semibold text-[#0a63c9] dark:text-[#5b9cf5]">
                <span>{t("bytek.shopMice")}</span>
                
              </div>
            </a>

            <a
              href={`${STORE_URL}gaming-keyboards-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_keyboards&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-lg border border-line bg-surface-subtle hover:border-[#0a63c9]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-accent-soft text-[#0a63c9] dark:text-[#5b9cf5] flex items-center justify-center mb-2">
                  <KeyboardVector className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-ink">
                  {t("bytek.catKeyboards")}
                </div>
                <div className="text-[11px] text-ink-3 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catKeyboardsDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-semibold text-[#0a63c9] dark:text-[#5b9cf5]">
                <span>{t("bytek.shopKeyboards")}</span>
                
              </div>
            </a>

            <a
              href={`${STORE_URL}gaming-headsets-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_audio&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-lg border border-line bg-surface-subtle hover:border-[#0a63c9]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-accent-soft text-[#0a63c9] dark:text-[#5b9cf5] flex items-center justify-center mb-2">
                  <HeadsetVector className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-ink">
                  {t("bytek.catAudio")}
                </div>
                <div className="text-[11px] text-ink-3 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catAudioDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-semibold text-[#0a63c9] dark:text-[#5b9cf5]">
                <span>{t("bytek.shopAudio")}</span>
                
              </div>
            </a>

            <a
              href={`${STORE_URL}gaming-controllers-algeria?utm_source=dzpartpicker&utm_medium=referral&utm_campaign=peripherals_controllers&utm_content=${encodeURIComponent(placement)}`}
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="group p-3 rounded-lg border border-line bg-surface-subtle hover:border-[#0a63c9]/40 transition-colors flex flex-col justify-between"
            >
              <div>
                <div className="w-8 h-8 rounded-lg bg-accent-soft text-[#0a63c9] dark:text-[#5b9cf5] flex items-center justify-center mb-2">
                  <GamepadVector className="w-4 h-4" />
                </div>
                <div className="text-xs font-semibold text-ink">
                  {t("bytek.catControllers")}
                </div>
                <div className="text-[11px] text-ink-3 mt-0.5 line-clamp-2 leading-snug">
                  {t("bytek.catControllersDesc")}
                </div>
              </div>
              <div className="mt-2 text-[10px] font-semibold text-[#0a63c9] dark:text-[#5b9cf5]">
                <span>{t("bytek.shopControllers")}</span>
                
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

  /* Sponsor placement. Previously a navy/indigo gradient slab with two blurred
     colour glows and a gradient CTA, which read as louder than the product
     content next to it -- and in dark mode it became a purple-blue rectangle
     sitting on a near-black canvas. It is now a plain surface with a hairline
     and an accent left edge: clearly a sponsor, clearly not competing. */
  return (
    <div className="relative overflow-hidden rounded-lg bg-surface border border-line p-5 sm:p-6">
      <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#0a63c9] dark:bg-[#5b9cf5]" aria-hidden="true" />

      <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pl-2 sm:pl-3">
        <div className="space-y-2.5 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="dz-light-tile inline-flex items-center rounded border border-line px-1.5 py-1">
              <BytekLogo className="h-6 w-auto" />
            </span>
            <span className="tag">
              <span className="dot dot-ok" aria-hidden="true" />
              {t("ad.partner")}
            </span>
          </div>

          <h3 className="text-[17px] sm:text-xl font-semibold tracking-tight text-ink leading-snug">
            {t("ad.title")}
          </h3>

          <p className="text-[13px] text-ink-2 leading-relaxed">
            {t("ad.text")}
          </p>

          {/* Concrete trust points: the three things that actually decide a purchase */}
          <ul className="flex flex-wrap gap-x-4 gap-y-1.5 pt-0.5">
            {TRUST_POINTS.map((k) => (
              <li key={k} className="inline-flex items-center gap-1.5 text-[11px] text-ink-2 font-medium">
                <span className="dot dot-ok" aria-hidden="true" />
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
            className="btn btn-primary px-5 py-2.5"
          >
            {t("ad.cta")}
          </a>
          <span className="text-[11px] text-ink-3 leading-relaxed text-center md:text-right md:max-w-[280px]">
            {t("ad.verified")}
            {/* Guardrail in docs/MONETIZATION-PLAN.md: editorial independence is
                stated wherever a sponsor is present. Rendering it inside the
                component means every placement inherits it, including any added
                later, instead of relying on the footer being read. */}
            <span className="block mt-0.5">{t("ad.independence")}</span>
          </span>
        </div>
      </div>
    </div>
  );
}