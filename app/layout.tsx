import type { Metadata } from "next";
import { Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import TopProgressBar from "@/components/TopProgressBar";
import BackToTop from "@/components/BackToTop";

export const metadata: Metadata = {
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
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap"
          rel="stylesheet"
        />
        <style>{`
          body {
            font-family: 'Inter', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #eef1f5;
            color: #0f172a;
          }
          .font-mono, .tabular-nums {
            font-variant-numeric: tabular-nums;
          }

          /* Accessible focus rings */
          *:focus-visible {
            outline: 2px solid #0b63e5;
            outline-offset: 2px;
          }

          @keyframes fadeUp {
            from { opacity: 0; transform: translateY(8px); }
            to { opacity: 1; transform: none; }
          }
          .anim-in { animation: fadeUp 0.35s ease both; }
          .anim-in-1 { animation: fadeUp 0.35s 0.04s ease both; }
          .anim-in-2 { animation: fadeUp 0.35s 0.08s ease both; }
          .anim-in-3 { animation: fadeUp 0.35s 0.12s ease both; }
          .anim-in-4 { animation: fadeUp 0.35s 0.16s ease both; }

          @keyframes shimmer {
            0% { background-position: -200% 0; }
            100% { background-position: 200% 0; }
          }
          .skeleton {
            background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
            background-size: 200% 100%;
            animation: shimmer 1.5s infinite linear;
          }

          .card-lift {
            transition: transform 0.2s cubic-bezier(0.16, 1, 0.3, 1), box-shadow 0.2s cubic-bezier(0.16, 1, 0.3, 1);
          }
          .card-lift:hover {
            transform: translateY(-3px);
            box-shadow: 0 12px 28px -6px rgba(15, 23, 42, 0.1), 0 8px 12px -6px rgba(15, 23, 42, 0.05);
          }

          .rowline {
            transition: background-color 0.15s ease;
          }
          .rowline:hover {
            background-color: #f8fafc;
          }

          /* Blue links signature PCPP style */
          a.pcpp-link, .pcpp-link {
            color: #0b63e5;
          }
          a.pcpp-link:hover, .pcpp-link:hover {
            color: #084db8;
            text-decoration: underline;
          }

          /* Toast notification animation */
          @keyframes toastSlide {
            0% { opacity: 0; transform: translate(-50%, 20px) scale(0.96); }
            100% { opacity: 1; transform: translate(-50%, 0) scale(1); }
          }
          .toast-slide {
            animation: toastSlide 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }

          /* Respect reduced-motion preferences */
          @media (prefers-reduced-motion: reduce) {
            *, ::before, ::after {
              animation-duration: 0.001ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.001ms !important;
              scroll-behavior: auto !important;
            }
            .card-lift:hover {
              transform: none !important;
            }
          }

          /* Print styles */
          @media print {
            header, footer, .no-print {
              display: none !important;
            }
            body {
              background-color: #ffffff !important;
              color: #0f172a !important;
            }
            .print-exact {
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
          }
        `}</style>
      </head>
      <body className="text-slate-900 min-h-full flex flex-col antialiased">
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
