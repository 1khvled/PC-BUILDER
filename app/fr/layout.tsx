import type { Metadata } from "next";
import { I18nProvider } from "@/lib/i18n/client";
import { HTML_LANG, OG_LOCALE, SITE_URL, languageAlternates } from "@/lib/i18n/config";

/**
 * Layout for the French half of the site (/fr/...).
 *
 * A nested App Router layout never renders <html>/<body>, so the French
 * language cannot be declared on the root element from here. Two things
 * compensate, and both are needed:
 *
 *   1. A tiny INLINE script, emitted as the very first thing in the stream, so
 *      it runs while the document is still being parsed - before first paint -
 *      and moves lang="fr-DZ" onto <html>. This is the same pre-paint trick the
 *      theme bootstrap uses, and it matters for screen readers, spell-checking
 *      and hreflang resolution.
 *   2. A server-rendered lang="fr-DZ" on a `display: contents` wrapper, so the
 *      correct language is already in the served markup for anything that reads
 *      the HTML without executing it.
 *
 * `data-locale="fr"` is what useLocale() reads (lib/i18n/client.tsx) to pick the
 * dictionary for shared chrome (Header, Footer, chart...).
 */
const localeInit = `(function(){try{var e=document.documentElement;e.lang=${JSON.stringify(
  HTML_LANG.fr,
)};e.setAttribute("data-locale","fr");}catch(e){}})();`;

export const metadata: Metadata = {
  title: {
    // No "| DZ PartPicker" suffix here: `template` appends it to every resolved
    // title (including this default), and doubling it looks broken in the SERP.
    default: "Comparateur de Prix Composants PC en Algérie (DA)",
    template: "%s | DZ PartPicker",
  },
  description:
    "Premier comparateur indépendant de composants PC en Algérie : CPU, GPU, RAM, SSD, Carte Mère, écran. Prix les plus bas en Dinars Algériens (DA), stocks vérifiés et livraison 58 wilayas.",
  keywords: [
    "comparateur prix pc algerie",
    "composants pc algerie",
    "carte graphique algerie prix",
    "processeur algerie prix da",
    "pc gamer algerie",
    "config pc algerie",
    "ouedkniss informatique",
    "prix dinar algerien hardware",
    "rtx 4060 algerie",
    "rx 580 algerie",
    "ryzen 5 algerie",
    "matos algerie",
    "system builder algerie",
  ],
  alternates: languageAlternates("/"),
  openGraph: {
    type: "website",
    locale: OG_LOCALE.fr,
    url: `${SITE_URL}/fr`,
    siteName: "DZ PartPicker",
    title: "DZ PartPicker - Les meilleurs prix PC d'Algérie en DA",
    description:
      "CPU, GPU, RAM, SSD, Cartes mères, écrans : comparez les prix en Dinars Algériens (DA) parmi plus de 180 boutiques en Algérie. Livraison 58 wilayas.",
    images: [{ url: "/brand/og-hero.webp", width: 1200, height: 630, alt: "DZ PartPicker - Comparateur PC Algérie" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DZ PartPicker - Comparateur de Prix PC en Algérie",
    description:
      "Trouvez vos composants PC au meilleur prix en Algérie (DA). Zéro commission, tri 100% organique.",
    images: ["/brand/og-hero.webp"],
  },
};

/** French site-level structured data, mirroring the en-DZ graph in the root layout. */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DZ PartPicker",
    url: `${SITE_URL}/fr`,
    inLanguage: HTML_LANG.fr,
    description: "Comparateur indépendant des prix PC en Algérie (DA).",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/fr/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DZ PartPicker",
    url: `${SITE_URL}/fr`,
    inLanguage: HTML_LANG.fr,
    logo: `${SITE_URL}/brand/logo.svg`,
    areaServed: "DZ",
    sameAs: ["https://bytekstore.shop/"],
  },
];

export default function FrenchLayout({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider locale="fr">
      {/* Pre-paint locale bootstrap - see the note at the top. */}
      <script dangerouslySetInnerHTML={{ __html: localeInit }} />
      {jsonLd.map((node, i) => (
        <script
          key={i}
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(node) }}
        />
      ))}
      <div lang={HTML_LANG.fr} style={{ display: "contents" }}>
        {children}
      </div>
    </I18nProvider>
  );
}
