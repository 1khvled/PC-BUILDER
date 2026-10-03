const https = require('https');

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

async function probeSite(url) {
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(8000) });
    const text = await res.text();
    console.log(`\n=== URL: ${url} (Status: ${res.status}) ===`);
    console.log(`  Length: ${text.length}`);
    const isWp = text.includes("wp-content") || text.includes("woocommerce");
    const isPresta = text.includes("prestashop") || text.includes("presta");
    const isShopify = text.includes("cdn.shopify.com") || text.includes("Shopify.theme");
    console.log(`  Tech: WP/Woo: ${isWp}, PrestaShop: ${isPresta}, Shopify: ${isShopify}`);
    // Check title
    const mTitle = text.match(/<title>([^<]+)<\/title>/i);
    if (mTitle) console.log(`  Title: ${mTitle[1].trim()}`);
    // Sample product or link snippets
    const links = [...text.matchAll(/href=["']([^"']*(?:produit|product|item|category|categorie)[^"']*)["']/gi)].map(m => m[1]);
    console.log(`  Matching links found: ${links.length} (sample: ${links.slice(0, 5).join(", ")})`);
  } catch (err) {
    console.log(`\n=== URL: ${url} ERROR: ${err.message} ===`);
  }
}

async function main() {
  await probeSite("https://primecomputerdz.dz");
  await probeSite("https://pcline.dz");
  await probeSite("https://ilem-informatique.com");
  await probeSite("https://expertinformatique.store");
}

main();
