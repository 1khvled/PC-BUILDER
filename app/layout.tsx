import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopProgressBar from "@/components/TopProgressBar";
import BackToTop from "@/components/BackToTop";

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
    <html lang="fr" className="h-full">
      <head>
        <script src="https://cdn.tailwindcss.com"></script>
        <style>{`
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            background-color: #f4f4f3;
            color: #191b2a;
          }
          .tabular-nums {
            font-variant-numeric: tabular-nums;
          }

          /* Accessible focus rings */
          *:focus-visible {
            outline: 2px solid #2c87c3;
            outline-offset: 2px;
          }

          /* Flat white panel, 4px radius — the only card style on the site */
          .panel {
            background: #ffffff;
            border: 1px solid #d8d8d8;
            border-radius: 4px;
          }
          .panel-hd {
            background: #f0f0ef;
            border-bottom: 1px solid #d8d8d8;
            padding: 8px 12px;
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #55555f;
          }

          /* Primary blue button */
          .btn-blue {
            background: #2c87c3;
            color: #fff;
            font-weight: 700;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .btn-blue:hover { background: #1e5c85; }
          .btn-blue:active { background: #153f5b; }

          /* Dark navy button */
          .btn-dark {
            background: #11111c;
            color: #fff;
            font-weight: 700;
            border-radius: 4px;
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
          }
          .btn-dark:hover { background: #26293b; }

          /* Blue links signature PCPP style */
          a.pcpp-link, .pcpp-link {
            color: #2c87c3;
          }
          a.pcpp-link:hover, .pcpp-link:hover {
            color: #1e5c85;
            text-decoration: underline;
          }

          /* Print styles */
          @media print {
            header, footer, .no-print {
              display: none !important;
            }
            body {
              background-color: #ffffff !important;
              color: #191b2a !important;
            }
            .print-exact {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </head>
      <body className="min-h-full flex flex-col antialiased">
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
