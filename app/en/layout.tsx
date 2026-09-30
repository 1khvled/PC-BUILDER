import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/client";
import { HTML_LANG, OG_LOCALE, SITE_URL, languageAlternates } from "@/lib/i18n/config";

/**
 * Layout for the English mirror of the site (/en/...).
 *
 * The root layout (app/layout.tsx) is out of scope for this change set, so the
 * <html lang> attribute and the client-side locale cannot be rendered server-side
 * here — a nested layout in the App Router never renders <html>/<body>. Instead
 * we emit a tiny INLINE script as the first thing in the stream: it runs while
 * the document is being parsed, i.e. before first paint (exactly like the theme
 * bootstrap script already sitting in the root layout's <head>), and it sets:
 *
 *   <html lang="en">                -> correct language for screen readers,
 *                                      spell-checking and hreflang rendering
 *   <html data-locale="en">         -> the flag read by useLocale() (lib/i18n/client.tsx)
 *
 * See the final report for the one-line follow-up that can be applied to
 * app/layout.tsx once it becomes editable (it would make `lang` server-rendered).
 */
const localeInit = `(function(){try{var e=document.documentElement;e.lang=${JSON.stringify(
  HTML_LANG.en,
)};e.setAttribute("data-locale","en");}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    // No "| DZ PartPicker" suffix here: `template` appends it to every resolved
    // title (including this default), and doubling it looks broken in the SERP.
    default: "PC Component Price Comparison in Algeria (DA)",
    template: "%s | DZ PartPicker",
  },
  description:
    "Independent PC component price comparison in Algeria: CPU, GPU, RAM, SSD, motherboards and monitors. Lowest prices in Algerian Dinars (DA), verified stock and delivery across all 58 wilayas.",
  keywords: [
    "pc parts price comparison algeria",
    "computer parts algeria",
    "graphics card price algeria",
    "rtx 4060 algeria price",
    "ryzen algeria price da",
    "gaming pc algeria",
    "pc build algeria",
    "ouedkniss computer parts",
    "algerian dinar hardware prices",
    "pcpartpicker algeria",
    "system builder algeria",
    "prebuilt gaming pc algeria",
  ],
  alternates: languageAlternates("/", "en"),
  openGraph: {
    type: "website",
    locale: OG_LOCALE.en,
    url: `${SITE_URL}/en`,
    siteName: "DZ PartPicker",
    title: "DZ PartPicker — Lowest PC part prices in Algeria (DA)",
    description:
      "CPU, GPU, RAM, SSD, motherboards and monitors compared in Algerian Dinars (DA) across 180+ Algerian stores. Delivery to all 58 wilayas.",
    images: [{ url: "/brand/og-hero.webp", width: 1200, height: 630, alt: "DZ PartPicker — PC price comparison Algeria" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DZ PartPicker — PC part price comparison in Algeria",
    description:
      "Find PC parts at the lowest price in Algeria (DA). Zero commission, 100% organic ranking, delivery to all 58 wilayas.",
    images: ["/brand/og-hero.webp"],
  },
};

/** English site-level structured data, mirroring the fr-DZ graph in the root layout. */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DZ PartPicker",
    url: `${SITE_URL}/en`,
    inLanguage: "en-DZ",
    description:
      "Independent comparison of PC part prices in Algeria, in Algerian Dinars (DA).",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/en/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DZ PartPicker",
    url: `${SITE_URL}/en`,
    inLanguage: "en-DZ",
    logo: `${SITE_URL}/brand/logo.svg`,
    areaServed: "DZ",
    sameAs: ["https://bytekstore.shop/"],
  },
];

export default function EnglishLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider locale="en">
      {/* Pre-paint locale bootstrap — see the note above. */}
      <script dangerouslySetInnerHTML={{ __html: localeInit }} />
      {jsonLd.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      {/* Server-rendered language declaration for the English subtree.
          A nested App Router layout never renders <html>, so this cannot sit on
          the root element; `display: contents` keeps the box out of layout while
          still exposing lang="en-DZ" to assistive tech and in the served markup.
          The inline script above still moves it onto <html> before first paint. */}
      <div lang={HTML_LANG.en} style={{ display: "contents" }}>
        {children}
      </div>
    </I18nProvider>
  );
}
