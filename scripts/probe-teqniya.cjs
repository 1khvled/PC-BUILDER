const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

async function probe(url) {
  console.log(`\n=== Probing ${url} ===`);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: AbortSignal.timeout(10000) });
    console.log(`Status: ${res.status}`);
    const text = await res.text();
    console.log(`Length: ${text.length}`);
    const mTitle = text.match(/<title>([^<]+)<\/title>/i);
    if (mTitle) console.log(`Title: ${mTitle[1].trim()}`);
    
    // Check shopify
    const shopRes = await fetch(`${url}/products.json?limit=20`, { headers: { "User-Agent": UA } });
    if (shopRes.ok) {
      const data = await shopRes.json();
      console.log(`Shopify products.json OK! Count: ${data.products?.length}`);
      if (data.products?.length) {
        for (const p of data.products.slice(0, 5)) {
          console.log(`  - ${p.title} (${p.variants?.[0]?.price} DA)`);
        }
      }
    } else {
      console.log(`Shopify products.json status: ${shopRes.status}`);
    }

    // Check WooCommerce
    const wooRes = await fetch(`${url}/wp-json/wc/store/v1/products?per_page=10`, { headers: { "User-Agent": UA } });
    if (wooRes.ok) {
      const data = await wooRes.json();
      console.log(`WooCommerce Store API OK! Count: ${data.length}`);
    } else {
      console.log(`WooCommerce Store API status: ${wooRes.status}`);
    }

    // Check sitemap
    const smRes = await fetch(`${url}/sitemap.xml`, { headers: { "User-Agent": UA } });
    console.log(`Sitemap status: ${smRes.status}`);
    if (smRes.ok) {
      const smText = await smRes.text();
      console.log(`Sitemap length: ${smText.length}, sample: ${smText.slice(0, 500)}`);
    }

    // Check YouCan / EcoTrack / Lightfunnels / etc.
    const isYouCan = text.includes("youcan") || text.includes("youcan.shop");
    console.log(`Is YouCan: ${isYouCan}`);

  } catch (err) {
    console.log(`Error: ${err.message}`);
  }
}

async function main() {
  await probe("https://www.teqniyastore.shop");
  await probe("https://bytekstore.shop");
}

main();
