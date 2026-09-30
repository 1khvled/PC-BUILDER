import type { Metadata } from "next";
import { OG_LOCALE, languageAlternates } from "@/lib/i18n/config";

/**
 * Metadata-only layout for /en/builder.
 *
 * The page itself is a Client Component ("use client"), so it cannot export
 * `metadata`. A server layout wrapping it can, which gives the builder proper
 * English SEO (title, description, keywords, hreflang, OpenGraph locale)
 * instead of falling back to the /en layout defaults.
 */
export const metadata: Metadata = {
  title: "System Builder PC Algeria — Configure your PC in DA",
  description:
    "Configure your PC part by part: automatic compatibility check, estimated power draw and a live total in Algerian Dinars (DA) built from real Algerian market prices.",
  keywords: [
    "pc builder algeria",
    "configure pc algeria",
    "pc configurator algeria",
    "pc parts budget algeria",
    "pc compatibility check algeria",
    "system builder algeria da",
  ],
  alternates: languageAlternates("/builder", "en"),
  openGraph: {
    title: "System Builder PC Algeria — Configure your PC in DA",
    description:
      "Configure your PC part by part: automatic compatibility check, estimated power draw and a live total in Algerian Dinars (DA) built from real Algerian market prices.",
    url: "/en/builder",
    type: "website",
    locale: OG_LOCALE.en,
    siteName: "DZ PartPicker",
  },
  twitter: {
    card: "summary_large_image",
    title: "System Builder PC Algeria — Configure your PC in DA",
    description:
      "Configure your PC part by part: automatic compatibility check, estimated power draw and a live total in Algerian Dinars (DA).",
  },
};

export default function EnglishBuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
