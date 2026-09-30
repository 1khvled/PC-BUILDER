import type { Metadata } from "next";
import { OG_LOCALE } from "@/lib/i18n/config";

/**
 * Metadata for /en/does-not-exist-style URLs handled by the [..rest] catch-all:
 * a 404 must never be indexable. No hreflang alternates here on purpose — a
 * dead URL must not claim reciprocity with the live pages.
 */
export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
  openGraph: {
    title: "Page not found | DZ PartPicker",
    description: "This page does not exist on the English DZ PartPicker site.",
    url: "/en",
    type: "website",
    locale: OG_LOCALE.en,
    siteName: "DZ PartPicker",
  },
};

export default function EnglishCatchAllLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
