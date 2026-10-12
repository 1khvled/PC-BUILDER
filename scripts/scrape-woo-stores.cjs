const fs = require('fs');

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const WOO_STORES = [
  { name: "Tiza Informatique", base: "https://tiza-informatique.com", wilaya: "Tizi Ouzou", maxPages: 4 },
  { name: "Informatics DZ", base: "https://informatics-dz.com", wilaya: "Boumerdes", maxPages: 4 },
  { name: "Campus Informatique", base: "https://campusinformatique.com", wilaya: "Alger", maxPages: 4 },
  { name: "KhabirTech", base: "https://khabirtech.com", wilaya: "M'sila", maxPages: 4 },
  { name: "DeskCom", base: "https://deskcom-dz.com", wilaya: "Oran", maxPages: 4 },
  { name: "Click Informatique", base: "https://click-dz.com", wilaya: "Oran", maxPages: 4 },
  { name: "Kotek DZ", base: "https://kotekdz.com", wilaya: "Alger", maxPages: 4 },
  { name: "GigaStore DZ", base: "https://gigastore-dz.com", wilaya: "Oran", maxPages: 4 },
  { name: "Ilem Informatique", base: "https://ilem-informatique.com", wilaya: "Alger", maxPages: 3 }
];

async function fetchWooStore(store) {
  console.log(`\nScraping WooCommerce Store: ${store.name} (${store.wilaya}) - ${store.base}`);
  const offers = [];

  for (let page = 1; page <= store.maxPages; page++) {
    const url = `${store.base}/wp-json/wc/store/v1/products?per_page=100&page=${page}`;
    try {
      const res = await fetch(url, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) break;
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) break;

      for (const it of items) {
        const rawP = it.prices?.price;
        if (!rawP) continue;
        const priceDa = Math.round(parseInt(rawP, 10) / 100);
        if (priceDa < 1000 || priceDa > 5000000) continue;
        const title = (it.name || "").replace(/&amp;/g, "&").replace(/&#8243;/g, '"').replace(/&Prime;/g, '"').trim();
        if (!title || title.length < 5) continue;

        offers.push({
          id: `${store.name.toLowerCase().replace(/[^a-z0-9]/g, '')}-${it.id}`,
          title,
          priceDa,
          url: it.permalink || `${store.base}/?p=${it.id}`,
          image: it.images?.[0]?.src || "",
          wilaya: store.wilaya,
          seller: store.name,
          store: store.name,
          stock: it.is_in_stock ? "En stock" : "Rupture",
          condition: "new",
          postedAt: new Date().toISOString(),
          isStore: true,
          isFromStore: true,
          query: `woo:${store.name.toLowerCase().replace(/[^a-z0-9]/g, '')}`
        });
      }
      console.log(`  Page ${page}: ${items.length} items (total valid from ${store.name}: ${offers.length})`);
      if (items.length < 100) break;
      await sleep(600);
    } catch (e) {
      console.log(`  [Notice] Page ${page} on ${store.name}: ${e.message}`);
      break;
    }
  }
  return offers;
}

async function main() {
  console.log("==========================================================");
  console.log("DZ-PartPicker: Multi-Wilaya eCommerce Stores Scraper");
  console.log("Stores across Tizi Ouzou, Oran, Boumerdes, M'sila, and Alger");
  console.log("==========================================================");

  let full = { done: {}, report: {} };
  try {
    full = JSON.parse(fs.readFileSync("full.json", "utf8"));
  } catch (e) {
    full = { ok: true, report: {} };
  }
  full.report = full.report || {};
  full.report["ouedkniss:all"] = full.report["ouedkniss:all"] || [];

  const existingOffers = full.report["ouedkniss:all"];
  console.log(`Starting listings count in full.json: ${existingOffers.length}`);

  const existingUrlMap = new Map();
  for (const o of existingOffers) {
    if (o.url) existingUrlMap.set(o.url, o);
  }

  let totalNew = 0;
  let totalRefreshed = 0;

  for (const store of WOO_STORES) {
    const storeOffers = await fetchWooStore(store);
    let sNew = 0;
    for (const off of storeOffers) {
      if (!existingUrlMap.has(off.url)) {
        existingUrlMap.set(off.url, off);
        existingOffers.push(off);
        sNew++;
        totalNew++;
      } else {
        const old = existingUrlMap.get(off.url);
        if (off.priceDa && off.priceDa !== old.priceDa) {
          old.priceDa = off.priceDa;
          totalRefreshed++;
        }
      }
    }
    console.log(`  -> Added ${sNew} new listings from ${store.name}`);
    await sleep(800);
  }

  console.log("\n==========================================================");
  console.log(`WooCommerce Ingestion Complete!`);
  console.log(`Total NEW unique listings added: ${totalNew}`);
  console.log(`Total listings refreshed: ${totalRefreshed}`);
  console.log(`Total listings in full.json: ${existingOffers.length}`);
  console.log("==========================================================");

  fs.writeFileSync("full.json", JSON.stringify(full), "utf8");
  console.log("Saved updated full.json!");
}

main().catch(console.error);
