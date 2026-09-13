import { CATEGORIES, PRODUCTS, bestOffer } from "@/lib/data/products";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import { GUIDES } from "@/lib/data/guides";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

// llms.txt convention: machine-readable site summary for AI engines (GEO).
export async function GET() {
  const offers = await getOffers();
  const scrapedAt = await getScrapedAt();
  const lines: string[] = [
    "# DZ PartPicker",
    "",
    "> Comparateur indépendant des prix de composants PC en Algérie (dinars DA).",
    "> 12 boutiques (Alger, Sétif, Oran, Boumerdes, M'sila, Djelfa) + Ouedkniss. Tri 100% organique par prix croissant, neuf/occasion séparés.",
    `> Prix relevés le ${scrapedAt.slice(0, 10)}. Les stocks sont indicatifs : toujours confirmer sur la boutique.`,
    "",
    "## Pages",
    `- Builder (compatibilité auto): ${BASE}/builder`,
    ...CATEGORIES.map((c) => `- ${c.label}: ${BASE}/category/${c.slug}`),
    ...GUIDES.map((g) => `- Guide: ${g.title}: ${BASE}/guides/${g.slug}`),
    "",
    "## Meilleurs prix par produit (DA, au relevé)",
  ];
  for (const p of PRODUCTS) {
    const b = bestOffer(p.id, offers);
    lines.push(
      `- ${p.brand} ${p.model} [${p.category}]: ${b ? `${b.priceDa.toLocaleString("fr-DZ")} DA chez ${b.store} (${b.wilaya}, ${b.condition === "new" ? "neuf" : "occasion"}) — ${BASE}/product/${p.id}` : "pas d'offre indexée"}`
    );
  }
  lines.push("", `Données complètes: ${BASE}/llms-full.txt`, `Sitemap: ${BASE}/sitemap.xml`);
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
