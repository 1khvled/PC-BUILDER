import type { Metadata } from "next";
import { languageAlternates } from "@/lib/i18n/config";

/**
 * Server layout for /builder.
 *
 * The page itself is a client component ("use client", it drives the whole
 * pick/price state machine), and Next forbids exporting `metadata` from a
 * client module — which is why /builder used to silently inherit the home
 * page's title. Declaring it here gives the page its own title and description
 * without touching the client bundle.
 */
export const metadata: Metadata = {
  title: "System Builder PC Algérie — Configurez votre PC au meilleur prix en DA",
  description:
    "Configurateur de PC pour l'Algérie : vérifiez la compatibilité CPU/carte mère, estimez la consommation et le total en dinars à partir des prix réels des boutiques. Livraison 58 wilayas.",
  keywords: [
    "configurateur pc algerie",
    "system builder algerie",
    "assemble pc algerie prix",
    "pc sur mesure algerie",
    "config pc prix da algerie",
  ],
  alternates: languageAlternates("/builder"),
};

export default function BuilderLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
