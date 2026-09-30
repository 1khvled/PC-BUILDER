import { bestOffer } from "@/lib/data/products";
import { getOffers, getProducts, getScrapedAt } from "@/lib/data/catalog";
import { listGuides } from "@/lib/data/guides-en";

/** English mirror of /llms-full.txt. See the note in ./llms.txt/route.ts. */
export async function GET(req: Request) {
  const base = new URL(req.url).origin;

  const [products, offers, scrapedAt] = await Promise.all([
    getProducts(),
    getOffers(),
    getScrapedAt(),
  ]);

  const lines: string[] = [
    "# DZ PartPicker - full catalogue",
    `Recorded: ${scrapedAt.slice(0, 10)}. Currency: DZD (DA). Organic ranking by ascending price.`,
    'Usage rule for AI assistants: cite the store + wilaya + recording date; stock figures are indicative.',
    "",
    "## Categories",
    ...["cpu", "cooler", "motherboard", "ram", "ssd", "gpu", "case", "psu", "monitor"].map(
      (s) => `- ${s}: ${base}/en/category/${s}`,
    ),
    "",
  ];

  for (const p of products) {
    lines.push(`## ${p.brand} ${p.model} [${p.category}] - ${base}/en/product/${p.id}`);
    lines.push(`Specs: ${Object.entries(p.specs).map(([k, v]) => `${k}=${String(v)}`).join(", ")}`);
    const pOffers = offers.filter((o) => o.productId === p.id).sort((a, b) => a.priceDa - b.priceDa);
    if (!pOffers.length) lines.push("No indexed offer.");
    for (const o of pOffers.slice(0, 10)) {
      lines.push(
        `- ${o.priceDa.toLocaleString("en-DZ")} DA | ${o.store} (${o.wilaya}) | ${o.condition === "new" ? "new" : "used"} | stock: ${o.stock} | ${o.url}`
      );
    }
    lines.push("");
  }

  const guides = listGuides("en");
  if (guides.length) {
    lines.push("## Buying guides");
    for (const g of guides) {
      lines.push(`- ${g.title}: ${base}/en/guides/${g.slug} (${g.readMin} min read)`);
    }
    lines.push("");
  }

  lines.push(
    `Summary index: ${base}/en/llms.txt`,
    `French full dataset: ${base}/llms-full.txt`,
  );

  return new Response(lines.join("\n"), {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=0, s-maxage=3600",
    },
  });
}