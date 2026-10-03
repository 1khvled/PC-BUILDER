const fs = require('fs');
const cheerio = require('cheerio');

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 1. TeqniyaStore
async function fetchTeqniyaStore() {
  console.log("\n[1/5] Scraping TeqniyaStore (teqniyastore.shop)...");
  const offers = [];
  try {
    const res = await fetch("https://www.teqniyastore.shop/js/products.js", { headers: { "User-Agent": UA } });
    const jsText = await res.text();
    
    // Evaluate PRODUCTS safely
    const fn = new Function(`${jsText}; return PRODUCTS;`);
    const products = fn();
    console.log(`  Loaded ${products.length} products from TeqniyaStore.`);

    for (const p of products) {
      if (!p.name || !p.price || p.price < 1000) continue;
      offers.push({
        id: `teqniya-${p.id}`,
        title: p.name,
        priceDa: p.price,
        url: `https://www.teqniyastore.shop/`,
        image: p.image || p.images?.[0] || "",
        wilaya: "Alger",
        seller: "TeqniyaStore",
        store: "TeqniyaStore",
        stock: (p.stock > 0) ? "En stock" : "Rupture",
        condition: "new",
        postedAt: new Date().toISOString(),
        isStore: true,
        isFromStore: true,
        query: `teqniyastore:${p.category || 'hardware'}`
      });
    }
    console.log(`  -> Valid offers from TeqniyaStore: ${offers.length}`);
  } catch (err) {
    console.error("  Error scraping TeqniyaStore:", err.message);
  }
  return offers;
}

// 2. Bytek Store
async function fetchBytekStore() {
  console.log("\n[2/5] Scraping Bytek Store (bytekstore.shop)...");
  const offers = [];
  try {
    const smRes = await fetch("https://www.bytekstore.shop/sitemap.xml", { headers: { "User-Agent": UA } });
    const smText = await smRes.text();
    const $sm = cheerio.load(smText, { xmlMode: true });
    const locs = [];
    $sm("loc").each((_, el) => locs.push($sm(el).text()));

    for (const url of locs) {
      if (url.includes("/blog/") || url === "https://www.bytekstore.shop/") continue;
      try {
        await sleep(300);
        const res = await fetch(url, { headers: { "User-Agent": UA } });
        if (!res.ok) continue;
        const html = await res.text();
        const $ = cheerio.load(html);
        
        let title = $("h1").first().text().trim() || $("title").text().replace(/—.*|\|.*/, "").trim();
        let price = null;
        const priceMatches = html.match(/(\d[\d\s.,]*\d)\s*(?:DA|DZD)/i) || html.match(/"price":\s*"(\d+)"/i);
        if (priceMatches) {
          price = parseInt(priceMatches[1].replace(/[^0-9]/g, ""), 10);
        }
        const img = $("meta[property='og:image']").attr("content") || $("img").first().attr("src") || "";

        if (title && price && price >= 1000) {
          offers.push({
            id: `bytek-${Buffer.from(url).toString('base64').slice(-12)}`,
            title,
            priceDa: price,
            url,
            image: img,
            wilaya: "Alger",
            seller: "Bytek Store",
            store: "Bytek Store",
            stock: "En stock",
            condition: "new",
            postedAt: new Date().toISOString(),
            isStore: true,
            isFromStore: true,
            query: "bytekstore"
          });
        }
      } catch (e) {}
    }
    console.log(`  -> Valid offers from Bytek Store: ${offers.length}`);
  } catch (err) {
    console.error("  Error scraping Bytek Store:", err.message);
  }
  return offers;
}

// 3. Promotech IT (WooCommerce API)
async function fetchPromotechIT() {
  console.log("\n[3/5] Scraping Promotech IT (promotech-it.com)...");
  const offers = [];
  try {
    for (let page = 1; page <= 6; page++) {
      const res = await fetch(`https://promotech-it.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) break;
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) break;

      for (const it of items) {
        const rawP = it.prices?.price;
        if (!rawP) continue;
        const priceDa = Math.round(parseInt(rawP, 10) / 100); // minor_unit: 2
        if (priceDa < 1000 || priceDa > 5000000) continue;
        const title = it.name || "";
        offers.push({
          id: `promotech-${it.id}`,
          title,
          priceDa,
          url: it.permalink || "",
          image: it.images?.[0]?.src || "",
          wilaya: "Alger",
          seller: "Promotech IT",
          store: "Promotech IT",
          stock: it.is_in_stock ? "En stock" : "Rupture",
          condition: "new",
          postedAt: new Date().toISOString(),
          isStore: true,
          isFromStore: true,
          query: "promotech"
        });
      }
      console.log(`  Promotech page ${page}: total valid so far: ${offers.length}`);
      if (items.length < 100) break;
      await sleep(500);
    }
  } catch (err) {
    console.error("  Error scraping Promotech IT:", err.message);
  }
  return offers;
}

// 4. AMI Informatique (WooCommerce API)
async function fetchAmiInformatique() {
  console.log("\n[4/5] Scraping AMI Informatique (ami-dz.com)...");
  const offers = [];
  try {
    for (let page = 1; page <= 3; page++) {
      const res = await fetch(`https://ami-dz.com/wp-json/wc/store/v1/products?per_page=100&page=${page}`, {
        headers: { "User-Agent": UA },
        signal: AbortSignal.timeout(15000)
      });
      if (!res.ok) break;
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) break;

      for (const it of items) {
        const rawP = it.prices?.price;
        if (!rawP) continue;
        const priceDa = Math.round(parseInt(rawP, 10) / 100); // minor_unit: 2
        if (priceDa < 1000 || priceDa > 5000000) continue;
        const title = it.name || "";
        offers.push({
          id: `ami-${it.id}`,
          title,
          priceDa,
          url: it.permalink || "",
          image: it.images?.[0]?.src || "",
          wilaya: "Alger",
          seller: "AMI Informatique",
          store: "AMI Informatique",
          stock: it.is_in_stock ? "En stock" : "Rupture",
          condition: "new",
          postedAt: new Date().toISOString(),
          isStore: true,
          isFromStore: true,
          query: "ami-dz"
        });
      }
      console.log(`  AMI Informatique page ${page}: total valid so far: ${offers.length}`);
      if (items.length < 100) break;
      await sleep(500);
    }
  } catch (err) {
    console.error("  Error scraping AMI Informatique:", err.message);
  }
  return offers;
}

// 5. Ozinformatique (WooCommerce API)
async function fetchOzinformatique() {
  console.log("\n[5/5] Scraping Ozinformatique (ozinformatique.com)...");
  const offers = [];
  try {
    const res = await fetch(`https://ozinformatique.com/wp-json/wc/store/v1/products?per_page=100&page=1`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(15000)
    });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
        for (const it of items) {
          const rawP = it.prices?.price;
          if (!rawP) continue;
          const priceDa = Math.round(parseInt(rawP, 10) / 100);
          if (priceDa < 1000 || priceDa > 5000000) continue;
          offers.push({
            id: `oz-${it.id}`,
            title: it.name || "",
            priceDa,
            url: it.permalink || "",
            image: it.images?.[0]?.src || "",
            wilaya: "Alger",
            seller: "Ozinformatique",
            store: "Ozinformatique",
            stock: it.is_in_stock ? "En stock" : "Rupture",
            condition: "new",
            postedAt: new Date().toISOString(),
            isStore: true,
            isFromStore: true,
            query: "ozinformatique"
          });
        }
      }
    }
    console.log(`  -> Valid offers from Ozinformatique: ${offers.length}`);
  } catch (err) {
    console.error("  Error scraping Ozinformatique:", err.message);
  }
  return offers;
}

async function main() {
  console.log("=================================================");
  console.log("DZ-PartPicker: Ingesting New Standalone Stores");
  console.log("=================================================");

  const teqniyaOffers = await fetchTeqniyaStore();
  const bytekOffers = await fetchBytekStore();
  const promotechOffers = await fetchPromotechIT();
  const amiOffers = await fetchAmiInformatique();
  const ozOffers = await fetchOzinformatique();

  const allNewOffers = [
    ...teqniyaOffers,
    ...bytekOffers,
    ...promotechOffers,
    ...amiOffers,
    ...ozOffers
  ];

  console.log(`\nTotal new offers collected across 5 stores: ${allNewOffers.length}`);

  // Ingest into full.json
  const fullPath = 'D:/Projects/DZ-PartPicker/full.json';
  const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (!full.report) full.report = {};
  if (!Array.isArray(full.report['ouedkniss:all'])) full.report['ouedkniss:all'] = [];
  const existing = full.report['ouedkniss:all'];

  const seenMap = new Map();
  for (const o of existing) {
    if (o.url) seenMap.set(o.url, o);
  }

  let added = 0;
  let updated = 0;
  for (const no of allNewOffers) {
    if (!seenMap.has(no.url)) {
      seenMap.set(no.url, no);
      existing.push(no);
      added++;
    } else {
      const ex = seenMap.get(no.url);
      ex.priceDa = no.priceDa;
      ex.stock = no.stock;
      ex.postedAt = no.postedAt;
      updated++;
    }
  }

  console.log(`Database updated: +${added} newly added, ${updated} refreshed.`);
  console.log(`Total announcements now in full.json: ${existing.length}`);
  fs.writeFileSync(fullPath, JSON.stringify(full), 'utf8');

  // Register stores in discovered-stores.json
  const storesPath = 'D:/Projects/DZ-PartPicker/scripts/discovered-stores.json';
  const stores = JSON.parse(fs.readFileSync(storesPath, 'utf8'));
  const storeNames = new Set(stores.map(s => s.name.toLowerCase()));

  const newStoresToAdd = [
    { id: "store-teqniya", name: "TeqniyaStore", slug: "teqniyastore", url: "https://www.teqniyastore.shop/", wilaya: "Alger" },
    { id: "store-bytek", name: "Bytek Store", slug: "bytekstore", url: "https://www.bytekstore.shop/", wilaya: "Alger" },
    { id: "store-promotech", name: "Promotech IT", slug: "promotech-it", url: "https://promotech-it.com/", wilaya: "Alger" },
    { id: "store-ami", name: "AMI Informatique", slug: "ami-dz", url: "https://ami-dz.com/", wilaya: "Alger" },
    { id: "store-oz", name: "Ozinformatique", slug: "ozinformatique", url: "https://ozinformatique.com/", wilaya: "Alger" }
  ];

  for (const s of newStoresToAdd) {
    if (!storeNames.has(s.name.toLowerCase())) {
      stores.push(s);
      console.log(`Registered store: ${s.name}`);
    }
  }
  fs.writeFileSync(storesPath, JSON.stringify(stores, null, 2), 'utf8');

  console.log("All new stores successfully ingested!");
}

main().catch(console.error);
