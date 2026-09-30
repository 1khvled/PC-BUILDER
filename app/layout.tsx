import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopProgressBar from "@/components/TopProgressBar";
import BackToTop from "@/components/BackToTop";
import MobileBottomNav from "@/components/MobileBottomNav";

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
    default: "DZ PartPicker — Comparateur de Prix Composants PC en Algérie (DA)",
    template: "%s | DZ PartPicker",
  },
  description: "Premier comparateur indépendant de composants PC en Algérie : CPU, GPU, RAM, SSD, Carte Mère, Écran. Prix les plus bas en Dinars Algériens (DA), stocks vérifiés et livraison 58 wilayas.",
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
  alternates: {
    canonical: "./",
  },
  openGraph: {
    type: "website",
    locale: "fr_DZ",
    url: "https://dzpartpicker.dz",
    siteName: "DZ PartPicker",
    title: "DZ PartPicker — Les meilleurs prix PC d'Algérie en DA",
    description: "CPU, GPU, RAM, SSD, Cartes mères, Écrans : comparez les prix en Dinars Algériens (DA) parmi plus de 180 boutiques en Algérie. Livraison 58 wilayas.",
    images: [{ url: "/brand/og-hero.webp", width: 1200, height: 630, alt: "DZ PartPicker — Comparateur PC Algérie" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "DZ PartPicker — Comparateur de Prix PC en Algérie",
    description: "Trouvez vos composants PC au meilleur prix en Algérie (DA). Zéro commission, tri 100% organique.",
    images: ["/brand/og-hero.webp"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`h-full ${sans.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInit }} />
      </head>
      <body className="min-h-full flex flex-col antialiased font-sans overflow-x-hidden selection:bg-[#2c87c3] selection:text-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DZ PartPicker",
              url: "https://dzpartpicker.dz",
              inLanguage: "fr-DZ",
              description: "Comparateur indépendant des prix PC en Algérie (DA).",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://dzpartpicker.dz/?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DZ PartPicker",
              url: "https://dzpartpicker.dz",
              logo: "https://dzpartpicker.dz/brand/logo.svg",
              areaServed: "DZ",
              sameAs: ["https://bytekstore.shop/"],
            }),
          }}
        />
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <Header />
        <div id="main" className="flex-1 pb-16 md:pb-0">{children}</div>
        <Footer />
        <MobileBottomNav />
        <BackToTop />
      </body>
    </html>
  );
}
