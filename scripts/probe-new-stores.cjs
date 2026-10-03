const https = require('https');
const http = require('http');

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

const CANDIDATES = [
  "https://elasslihitech.com",
  "https://tiza-informatique.com",
  "https://primecomputerdz.dz",
  "https://promotech-it.com",
  "https://ozinformatique.com",
  "https://ami-dz.com",
  "https://ilem-informatique.com",
  "https://gscomputer.dz",
  "https://pcline.dz",
  "https://expertinformatique.store",
  "https://hardsoft.dz",
  "https://bytekstore.shop",
  "https://gamingdz.com",
  "https://informatics-dz.com",
  "https://campusinformatique.com",
  "https://khabirtech.com",
  "https://deskcom-dz.com",
  "https://click-dz.com",
  "https://kotekdz.com",
  "https://gigastore-dz.com"
];

async function checkUrl(base) {
  const result = { base, ok: false, status: 0, server: "", wooStoreApi: false, shopifyJson: false, sitemap: false };
  
  // 1. Check Homepage
  try {
    const res = await fetch(base, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(10000)
    });
    result.status = res.status;
    result.ok = res.ok;
    result.server = res.headers.get("server") || "";
  } catch (err) {
    result.error = err.message;
    return result;
  }

  // 2. Check Woo Store API
  try {
    const wooRes = await fetch(`${base}/wp-json/wc/store/v1/products?per_page=5`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000)
    });
    if (wooRes.ok) {
      const ct = wooRes.headers.get("content-type") || "";
      if (ct.includes("json")) {
        const data = await wooRes.json();
        if (Array.isArray(data) && data.length > 0) {
          result.wooStoreApi = true;
          result.wooSample = data[0]?.name;
        }
      }
    }
  } catch {}

  // 3. Check Shopify JSON
  try {
    const shopRes = await fetch(`${base}/products.json?limit=5`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000)
    });
    if (shopRes.ok) {
      const ct = shopRes.headers.get("content-type") || "";
      if (ct.includes("json")) {
        const data = await shopRes.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          result.shopifyJson = true;
          result.shopifySample = data.products[0]?.title;
        }
      }
    }
  } catch {}

  // 4. Check Sitemap
  try {
    const smRes = await fetch(`${base}/sitemap.xml`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000)
    });
    if (smRes.ok) {
      const ct = smRes.headers.get("content-type") || "";
      if (ct.includes("xml")) {
        result.sitemap = true;
      }
    }
  } catch {}

  return result;
}

async function main() {
  console.log(`Probing ${CANDIDATES.length} stores...`);
  for (const c of CANDIDATES) {
    const res = await checkUrl(c);
    console.log(`\nStore: ${res.base}`);
    console.log(`  Status: ${res.status} | Woo API: ${res.wooStoreApi} | Shopify: ${res.shopifyJson} | Sitemap: ${res.sitemap}`);
    if (res.wooSample) console.log(`  Woo Sample: ${res.wooSample}`);
    if (res.shopifySample) console.log(`  Shopify Sample: ${res.shopifySample}`);
    if (res.error) console.log(`  Error: ${res.error}`);
  }
}

main();
