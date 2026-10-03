const cheerio = require('cheerio');

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

async function main() {
  console.log("Fetching Bytek sitemap...");
  const smRes = await fetch("https://www.bytekstore.shop/sitemap.xml", { headers: { "User-Agent": UA } });
  const smText = await smRes.text();
  const $sm = cheerio.load(smText, { xmlMode: true });
  const locs = [];
  $sm("loc").each((_, el) => locs.push($sm(el).text()));
  console.log(`Found ${locs.length} URLs in sitemap.`);

  const products = [];
  for (const url of locs) {
    if (url.includes("/blog/") || url === "https://www.bytekstore.shop/") continue;
    try {
      const res = await fetch(url, { headers: { "User-Agent": UA } });
      if (!res.ok) continue;
      const html = await res.text();
      const $ = cheerio.load(html);
      
      let title = $("h1").first().text().trim() || $("title").text().replace(/—.*|\|.*/, "").trim();
      let price = null;
      
      // Look for price in text
      const priceMatches = html.match(/(\d[\d\s.,]*\d)\s*(?:DA|DZD)/i) || html.match(/"price":\s*"(\d+)"/i);
      if (priceMatches) {
        price = parseInt(priceMatches[1].replace(/[^0-9]/g, ""), 10);
      }
      
      const img = $("meta[property='og:image']").attr("content") || $("img").first().attr("src") || "";

      if (title && price && price >= 1000) {
        products.push({ title, price, url, img });
        console.log(`  [Bytek] ${title} — ${price} DA`);
      }
    } catch (e) {
      console.log(`  Error on ${url}: ${e.message}`);
    }
  }

  console.log(`\nTotal products found from Bytek Store: ${products.length}`);
}

main();
