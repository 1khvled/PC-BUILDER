import * as cheerio from "cheerio";
import { UA, delay, type RawOffer } from "./base";
import { quickCheck } from "./validate";
import { searchOuedknissFull, type OuedknissOffer } from "./ouedkniss-api";

export { searchOuedknissFull, type OuedknissOffer };

// Ouedkniss search pages are server-rendered Vue:
// - listings: <a href="/<slug>-d<id>"> (store links contain /store/ and are skipped)
// - price: <div dir="ltr" class="text-no-wrap ml-1">177 200</div> next to a دج div
export async function searchOuedkniss(keywords: string): Promise<RawOffer[]> {
  // Try deep API first (progressive enhancement)
  try {
    const apiOffers = await searchOuedknissFull(keywords);
    if (apiOffers && apiOffers.length > 0) {
      return apiOffers;
    }
  } catch (err) {
    console.warn("Ouedkniss deep API failed, falling back to page-1 parser:", err);
  }

  // Fallback: Existing page-1 HTML parser
  await delay(1500);
  const url = `https://www.ouedkniss.com/s?keywords=${encodeURIComponent(keywords)}`;
  const res = await fetch(url, {
    headers: { "User-Agent": UA, "Accept-Language": "fr-DZ,fr;q=0.9" },
  });
  if (!res.ok) throw new Error(`ouedkniss HTTP ${res.status}`);
  const loaded = cheerio.load(await res.text());
  const out: RawOffer[] = [];
  const seen = new Set<string>();
  loaded("a[href]").each((_, a) => {
    const href = loaded(a).attr("href") || "";
    const m = href.match(/-d(\d+)\/?$/);
    if (!m || href.includes("/store/") || seen.has(m[1])) return;
    seen.add(m[1]);
    const anchor = loaded(a);
    let title = anchor.text().replace(/\s+/g, " ").trim();
    if (!title) title = (anchor.find("img").attr("alt") || "").replace(/\s+/g, " ").trim();
    // anchor text trails into "177 200 دج + wilaya" — cut from the price marker
    const cut = title.search(/\d[\d\s.,]*\s*دج/);
    if (cut > 10) title = title.slice(0, cut).trim();
    // price: walk up to the card, find ml-1 div whose parent also holds دج
    let price: number | null = null;
    let node = anchor.parent();
    for (let i = 0; i < 6 && price === null; i++) {
      node.find("div.ml-1").each((_, d) => {
        if (price !== null) return;
        const parentTxt = loaded(d).parent().text();
        if (!parentTxt.includes("دج")) return;
        const digits = loaded(d).text().replace(/[^0-9]/g, "");
        if (!digits) return;
        const n = parseInt(digits, 10);
        if (n >= 500 && n <= 5_000_000) price = n;
      });
      node = node.parent();
    }
    if (!title || price === null) return;
    // image: inside anchor or nearby card
    let img = anchor.find("img").first();
    let src =
      img.attr("data-src") || img.attr("data-lazy-src") || img.attr("src") || "";
    if (src.startsWith("data:")) src = "";
    let image = "";
    try {
      image = src ? new URL(src, url).toString() : "";
    } catch {
      image = "";
    }
    out.push({
      title,
      priceDa: price,
      url: new URL(href, url).toString(),
      stock: "Ouedkniss",
      image,
    });
  });
  // no category band here: one query stream covers cpu/gpu/ram/ssd (bands applied at bake by query)
  return out.filter((o) => quickCheck(o)).slice(0, 30);
}
