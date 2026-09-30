import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopProgressBar from "@/components/TopProgressBar";
import BackToTop from "@/components/BackToTop";
import MobileBottomNav from "@/components/MobileBottomNav";
import { I18nProvider } from "@/lib/i18n/client";
import { HTML_LANG, OG_LOCALE, SITE_URL, languageAlternates } from "@/lib/i18n/config";
import { safeJsonLd } from "@/lib/seo/jsonld";

// Inter everywhere: one neutral face, tabular-friendly figures for DA prices.
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f4f4f3" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0d14" },
  ],
};

/**
 * Pre-paint theme resolution. This must stay inline and blocking in <head>:
 * if the class is applied after hydration the visitor sees a white flash
 * before the dark palette settles. Mirrors the logic of components/ThemeToggle.
 */
const themeInit = `
(function(){try{
  var s=localStorage.getItem("dz_theme");
  var d=(s==="dark")||((!s||s==="system")&&window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark",d);
  document.documentElement.style.colorScheme=d?"dark":"light";
}catch(e){}})();
`;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz"),
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
  authors: [{ name: "DZ PartPicker Team" }],
  creator: "DZ PartPicker",
  publisher: "DZ PartPicker",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/brand/logo.svg",
    apple: "/brand/logo.svg",
  },
  alternates: languageAlternates("/", "en"),
  openGraph: {
    type: "website",
    locale: OG_LOCALE.en,
    url: `${SITE_URL}/`,
    siteName: "DZ PartPicker",
    title: "DZ PartPicker - Lowest PC part prices in Algeria (DA)",
    description:
      "CPU, GPU, RAM, SSD, motherboards and monitors compared in Algerian Dinars (DA) across 180+ Algerian stores. Delivery to all 58 wilayas.",
    images: [{ url: "/brand/og-hero.webp", width: 1200, height: 630, alt: "DZ PartPicker - PC price comparison Algeria" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DZ PartPicker - PC part price comparison in Algeria",
    description:
      "Find PC parts at the lowest price in Algeria (DA). Zero commission, 100% organic ranking, delivery to all 58 wilayas.",
    images: ["/brand/og-hero.webp"],
  },
};

/** English site-level structured data. The fr-DZ twin lives in app/fr/layout.tsx. */
const jsonLd = [
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "DZ PartPicker",
    url: `${SITE_URL}/`,
    inLanguage: HTML_LANG.en,
    description:
      "Independent comparison of PC part prices in Algeria, in Algerian Dinars (DA).",
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/?q={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  },
  {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "DZ PartPicker",
    url: `${SITE_URL}/`,
    inLanguage: HTML_LANG.en,
    logo: `${SITE_URL}/brand/logo.svg`,
    areaServed: "DZ",
    sameAs: ["https://bytekstore.shop/"],
  },
];

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // English is the site default and owns the unprefixed routes, so <html lang>
    // is server-rendered here rather than patched by script after the fact.
    <html lang={HTML_LANG.en} data-locale="en" className={`h-full ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col antialiased font-sans overflow-x-hidden selection:bg-[#2c87c3] selection:text-white">
        <>
          {jsonLd.map((node, i) => (
            <script
              key={i}
              type="application/ld+json"
              dangerouslySetInnerHTML={{ __html: safeJsonLd(node) }}
            />
          ))}
          <Suspense fallback={null}>
            <TopProgressBar />
          </Suspense>
          <Header />
          <div id="main" className="flex-1 pb-16 md:pb-0">{children}</div>
          <Footer />
          <MobileBottomNav />
          <BackToTop />
        </>
      </body>
    </html>
  );
}
