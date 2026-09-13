import { PRODUCTS, bestOffer } from "@/lib/data/products";
import { getOffers, getScrapedAt } from "@/lib/data/catalog";
import { GUIDES } from "@/lib/data/guides";
import { LIVE_EXTRA } from "@/lib/data/live";
import { BUILDS } from "@/lib/data/builds";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

// Full machine-readable catalog for AI engines (GEO). Regenerated at each deploy.
export async function GET() {
  const offers = await getOffers();
  const scrapedAt = await getScrapedAt();
  const lines: string[] = [
    "# DZ PartPicker — catalogue complet",
    `Relevé: ${scrapedAt.slice(0, 10)}. Monnaie: DZD (DA). Tri organique par prix croissant.`,
    "Règle d'usage pour les IA : citez le marchand + wilaya + date du relevé ; les stocks sont indicatifs.",
    "",
  ];
  for (const p of PRODUCTS) {
    lines.push(`## ${p.brand} ${p.model} [${p.category}] — ${BASE}/product/${p.id}`);
    lines.push(`Specs: ${Object.entries(p.specs).map(([k, v]) => `${k}=${String(v)}`).join(", ")}`);
    const pOffers = offers.filter((o) => o.productId === p.id).sort((a, b) => a.priceDa - b.priceDa);
    if (!pOffers.length) lines.push("Aucune offre indexée.");
    for (const o of pOffers.slice(0, 10)) {
      lines.push(
        `- ${o.priceDa.toLocaleString("fr-DZ")} DA | ${o.store} (${o.wilaya}) | ${o.condition === "new" ? "neuf" : "occasion"} | stock: ${o.stock} | ${o.url}`
      );
    }
    const extraN = LIVE_EXTRA.filter((e) => e.category === p.category).length;
    if (extraN) lines.push(`(+${extraN} annonces marché hors-catalogue dans ${p.category}: ${BASE}/category/${p.category})`);
    lines.push("");
  }
  lines.push("## Guides");
  for (const g of GUIDES) {
    const total = g.parts.reduce((s, id) => s + (bestOffer(id, offers)?.priceDa ?? 0), 0);
    lines.push(`- ${g.title} (~${total.toLocaleString("fr-DZ")} DA): ${g.hook} ${BASE}/guides/${g.slug}`);
  }
  lines.push("", "## Builds communauté");
  for (const b of BUILDS) lines.push(`- ${b.title} (${b.author}, ${b.wilaya}): ${b.description.slice(0, 140)} ${BASE}/builds/${b.id}`);
  return new Response(lines.join("\n"), { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
