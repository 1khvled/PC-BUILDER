import type { Metadata } from "next";
import { Barlow_Condensed, Inter } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopProgressBar from "@/components/TopProgressBar";
import BackToTop from "@/components/BackToTop";

// Body: Inter (neutral, tabular-friendly figures for DA prices).
// Display: Barlow Condensed (industrial catalog voice for hero,
// panel headers and headline prices).
const sans = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-sans",
  display: "swap",
});
const display = Barlow_Condensed({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-display",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: process.env.NEXT_PUBLIC_SITE_URL ? new URL(process.env.NEXT_PUBLIC_SITE_URL) : undefined,
  title: "DZ PartPicker — Pick parts. Build your PC. Compare in DA.",
  description: "Comparateur indépendant de composants PC en Algérie : CPU, GPU, RAM, SSD. Prix le plus bas en DA avec lien marchand direct.",
  icons: { icon: "/brand/logo.svg" },
  openGraph: {
    title: "DZ PartPicker — Les meilleurs prix PC d'Algérie en DA",
    description: "CPU, GPU, RAM, SSD : le prix le plus bas en DA + lien marchand. Alger, Sétif, Oran, 58 wilayas.",
    images: [{ url: "/brand/og-hero.webp", width: 1200, height: 630 }],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`h-full ${sans.variable} ${display.variable}`}>
      <body className="min-h-full flex flex-col antialiased font-sans">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "DZ PartPicker",
              inLanguage: "fr-DZ",
              description: "Comparateur indépendant des prix PC en Algérie (DA).",
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
              areaServed: "DZ",
            }),
          }}
        />
        <Suspense fallback={null}>
          <TopProgressBar />
        </Suspense>
        <Header />
        <div className="flex-1">{children}</div>
        <Footer />
        <BackToTop />
      </body>
    </html>
  );
}
