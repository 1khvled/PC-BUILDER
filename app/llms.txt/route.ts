import { CATEGORIES, bestOffer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { listGuides } from "@/lib/data/guides-en";

/**
 * English mirror of /llms.txt.
 *
 * Two fixes over the French route this mirrors:
 * 1. Base URLs come from the incoming request origin, not from an env fallback.
 *    The FR route hardcodes `|| "https://dzpartpicker.dz"`, a host that does not
 *    resolve, so if NEXT_PUBLIC_SITE_URL is unset every URL handed to an AI
 *    crawler points at a dead domain. Deriving the origin is always correct.
 * 2. English copy and English guide titles, so the payload matches the locale of
 *    the URL it is served from.
 */
export async function GET(req: Request) {
  const base = new URL(req.url).origin;

  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);

  const lines: string[] = [
    "# DZ PartPicker",
    "",
    "> Independent price comparison for PC components in Algeria, priced in Algerian dinars (DA).",
    "> 180+ Algerian stores (Algiers, Setif, Oran, Boumerdes, M'sila, Djelfa) plus Ouedkniss listings. 100% organic ranking by ascending price, new and used kept separate.",
    `> Prices recorded on ${scrapedAt.slice(0, 10)}. Stock is indicative: always confirm with the store.`,
    "",
    "## Pages",
    `- System Builder (automatic compatibility check): ${base}/builder`,
    ...CATEGORIES.map((c) => `- ${c.label} (${c.slug}): ${base}/category/${c.slug}`),
    ...listGuides("en").map((g) => `- Guide: ${g.title}: ${base}/guides/${g.slug}`),
    "",
    "## Lowest price per product (DA, at the recorded snapshot)",
  ];

  for (const p of products) {
    const b = bestOffer(p.id, offers);
    lines.push(
      b
        ? `- ${p.brand} ${p.model} [${p.category}]: ${b.priceDa.toLocaleString("en-DZ")} DA at ${b.store} (${b.wilaya}, ${b.condition === "new" ? "new" : "used"}) - ${base}/product/${p.id}`
        : `- ${p.brand} ${p.model} [${p.category}]: no indexed offer`,
    );
  }

  lines.push(
    "",
    `Full dataset: ${base}/llms-full.txt`,
    `Sitemap: ${base}/sitemap.xml`,
    `French version of this file: ${base}/fr/llms.txt`,
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}