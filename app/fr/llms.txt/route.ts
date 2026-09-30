import { CATEGORIES, bestOffer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { GUIDES } from "@/lib/data/guides";

// (BASE is derived per-request; see below.)

// llms.txt convention: machine-readable site summary for AI engines (GEO).
export async function GET(req: Request) {
  // Origin comes from the request, so the URLs handed to AI crawlers are always
  // live. The previous env-var fallback pointed at dzpartpicker.dz, a host that
  // does not resolve: with NEXT_PUBLIC_SITE_URL unset it silently emitted a
  // whole catalogue of dead links.
  const BASE = new URL(req.url).origin;
  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);
  const lines: string[] = [
    "# DZ PartPicker",
    "",
    "> Comparateur indépendant des prix de composants PC en Algérie (dinars DA).",
    "> 12 boutiques (Alger, Sétif, Oran, Boumerdes, M'sila, Djelfa) + Ouedkniss. Tri 100% organique par prix croissant, neuf/occasion séparés.",
    `> Prix relevés le ${scrapedAt.slice(0, 10)}. Les stocks sont indicatifs : toujours confirmer sur la boutique.`,
    "",
    "## Pages",
    `- Builder (compatibilité auto): ${BASE}/fr/builder`,
    ...CATEGORIES.map((c) => `- ${c.label}: ${BASE}/fr/category/${c.slug}`),
    ...GUIDES.map((g) => `- Guide: ${g.title}: ${BASE}/fr/guides/${g.slug}`),
    "",
    "## Meilleurs prix par produit (DA, au relevé)",
  ];
  for (const p of products) {
    const b = bestOffer(p.id, offers);
    lines.push(
      `- ${p.brand} ${p.model} [${p.category}]: ${b ? `${b.priceDa.toLocaleString("fr-DZ")} DA chez ${b.store} (${b.wilaya}, ${b.condition === "new" ? "neuf" : "occasion"}) — ${BASE}/fr/product/${p.id}` : "pas d'offre indexée"}`
    );
  }
  lines.push("", `Données complètes: ${BASE}/fr/llms-full.txt`, `Sitemap: ${BASE}/fr/sitemap.xml`);
  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}
