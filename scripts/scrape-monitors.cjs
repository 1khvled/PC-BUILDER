const fs = require('fs');

const GRAPHQL_ENDPOINT = "https://api.ouedkniss.com/graphql";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": BROWSER_UA,
  "Origin": "https://www.ouedkniss.com",
  "Referer": "https://www.ouedkniss.com/",
  "Accept-Language": "fr-DZ,fr;q=0.9",
};

const QUERY = `query SearchQuery($q: String, $filter: SearchFilterInput) {
  search(q: $q, filter: $filter) {
    announcements {
      paginatorInfo {
        total
        count
        hasMorePages
      }
      data {
        id
        title
        price
        pricePreview
        description
        slug
        status
        refreshedAt
        cities {
          name
          region {
            name
          }
        }
        store {
          id
          name
          slug
        }
        user {
          username
        }
        defaultMedia {
          mediaUrl
        }
      }
    }
  }
}`;

const MARKET_MONITOR_QUERIES = [
  "Ecran 144Hz", "Ecran 165Hz", "Ecran 180Hz", "Ecran 200Hz", "Ecran 240Hz", "Ecran 280Hz", "Ecran 300Hz", "Ecran 360Hz", "Ecran 540Hz",
  "Ecran 24", "Ecran 27", "Ecran 32", "Ecran 34", "Ecran 49",
  "Ecran Gamer", "Moniteur Gaming", "Ecran Gaming",
  "Odyssey", "UltraGear",
  "AOC 24", "AOC 27", "MSI 24", "MSI 27", "ASUS TUF 27", "TUF 24", "ASUS TUF 24",
  "Matos Ecran", "Ecran Matos", "Matos 24", "Matos 27", "Matos 32", "Matos MSG",
  "BenQ Zowie", "Gigabyte 27", "Gigabyte 24", "Redragon Ecran", "Xiaomi G24", "Xiaomi G27", "Dahua Ecran"
];

// Top Algerian PC Hardware Stores on Ouedkniss
const TOP_STORES = [
  { id: "30409", name: "FUTURE CITY INFORMATIQUE", wilaya: "Alger" },
  { id: "31418", name: "TECHMATE DZ", wilaya: "Jijel" },
  { id: "17937", name: "IT DEVICE", wilaya: "Alger" },
  { id: "1059", name: "ADMIN Informatique", wilaya: "Alger" },
  { id: "12489", name: "Informatics", wilaya: "Boumerdès" },
  { id: "24255", name: "AT-informatics", wilaya: "Alger" },
  { id: "5162", name: "A&Y Info Tech", wilaya: "Alger" },
  { id: "2227", name: "WELTINFO", wilaya: "Alger" },
  { id: "16056", name: "IFTA COMPUTER", wilaya: "Alger" },
  { id: "26086", name: "PROMOTECH IT", wilaya: "Alger" },
  { id: "37907", name: "FAIZ TECH", wilaya: "Djelfa" },
  { id: "4919", name: "EL ASSLI HI TECH", wilaya: "Alger" },
  { id: "26242", name: "Zmika Store", wilaya: "Alger" },
  { id: "19321", name: "MBA INFO", wilaya: "Batna" },
  { id: "17106", name: "Technal Computer", wilaya: "Alger" },
  { id: "23236", name: "STORM TECH", wilaya: "Alger" },
  { id: "40172", name: "MC HARDEC", wilaya: "Alger" },
  { id: "24086", name: "GAMING ONE", wilaya: "Oran" },
  { id: "9192", name: "BUYMORE", wilaya: "Alger" },
  { id: "35481", name: "AN-TECH", wilaya: "Alger" },
  { id: "21547", name: "HWstore", wilaya: "Alger" },
  { id: "14517", name: "CLICK INFORMATIQUE ORAN", wilaya: "Oran" },
  { id: "5382", name: "Micro PC Algérie KOUBA", wilaya: "Alger" },
  { id: "34384", name: "TECH MANIA", wilaya: "Alger" },
  { id: "2149", name: "DIGITEC informatique", wilaya: "Alger" },
  { id: "31849", name: "TKI TEC", wilaya: "Alger" },
  { id: "14615", name: "ICT Informatique", wilaya: "Alger" },
  { id: "2660", name: "PC CLICK", wilaya: "Alger" },
  { id: "14033", name: "E K Service Informatique", wilaya: "Blida" },
  { id: "16395", name: "Gigastore", wilaya: "Oran" }
];

const STORE_MONITOR_QUERIES = [
  "Ecran", "Matos", "144Hz", "165Hz", "180Hz", "240Hz", "27"
];

const LAPTOP_MARKERS = /laptop|\blap\b|notebook|macbook|latitude|thinkpad|ideapad|vivobook|zenbook|elitebook|probook|thinkbook|yoga\b|surface\s*pro|pavilion|zephyrus|tuf\s*[af]\d{2}|\b\d{4,5}(?:hx|hs|h|u)\b|1[3-7][,.]\d\s*(?:pouce|fhd|ips|uhd|oled|qhd|\"|')|sodimm|so-dimm|so\s*dimm|portable|portatif|pc-portable/i;

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function queryOuedkniss(q, page = 1, storeId = null) {
  const filter = { page, count: 40 };
  if (storeId) {
    filter.stores = [parseInt(storeId, 10)];
  }
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        query: QUERY,
        variables: { q, filter }
      })
    });
    if (!res.ok) return [];
    const json = await res.json();
    const items = json?.data?.search?.announcements?.data || [];
    return items.map((a) => {
      if (!a || !a.id) return null;

      const st = String(a.status || "").toUpperCase();
      if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") return null;

      const postDate = a.refreshedAt;
      if (!postDate) return null;
      const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
      if (isNaN(ageDays) || ageDays > 45) return null;

      let p = a.price;
      if (!p && a.pricePreview) {
        const cleaned = String(a.pricePreview).replace(/\s/g, "");
        const m = cleaned.match(/^(\d{4,8})(?:DA|DZD)?$/i);
        if (m) p = parseInt(m[1], 10);
      }
      if (!p || p < 1500 || p > 5000000) return null;
      if (/^(?:1000|1111|1234|12345|123456|9999|99999|1000000)$/.test(String(p))) return null;

      const title = (a.title || "").replace(/\s+/g, " ").trim();
      if (!title || title.length < 10) return null;

      const titleLower = title.toLowerCase();
      // Exclude obvious accessories, broken units, full PC setups, or laptops
      if (/\b(?:hs\b|en panne|pour pi[eè]ces?|bo[iî]te vide|carton seul|ventirad seul|support seul|c[aâ]ble seul)\b/i.test(titleLower)) return null;
      if (/\b(?:pc complet|pc gamer complet|unit[eé] gamer|unit[eé] centrale|configuration compl[eè]te|setup gamer)\b/i.test(titleLower)) return null;
      if (LAPTOP_MARKERS.test(titleLower)) return null;

      const wilaya = a.cities?.[0]?.region?.name || "Alger";
      const storeName = (a.store?.name || a.user?.username || "Ouedkniss").trim();
      const url = `https://www.ouedkniss.com/${a.slug}-d${a.id}`;
      const img = a.defaultMedia?.mediaUrl || "";
      const desc = (a.description || "") + " " + a.title;
      const isNew = /neuf|sous emballage|jamais servi|scell/i.test(desc) && !/occasion|utilis|bon etat/i.test(desc);

      return {
        id: String(a.id),
        title,
        priceDa: p,
        url,
        image: img,
        wilaya,
        store: storeName,
        stock: "En stock",
        condition: isNew ? "new" : "used",
        postedAt: postDate,
        isStore: Boolean(a.store),
        isFromStore: Boolean(a.store),
        query: q
      };
    }).filter(Boolean);
  } catch (err) {
    return [];
  }
}

// Scrape direct Matos store (matos-algerie.com) via WooCommerce API
async function scrapeMatosStore() {
  console.log("Scraping direct store: MATOS (matos-algerie.com)...");
  const offers = [];
  try {
    let page = 1;
    while (page <= 5) {
      const res = await fetch(`https://matos-algerie.com/wp-json/wc/store/products?per_page=100&page=${page}`, {
        headers: { "User-Agent": BROWSER_UA }
      });
      if (!res.ok) break;
      const items = await res.json();
      if (!items || items.length === 0) break;

      for (const it of items) {
        const priceRaw = it.prices?.price;
        if (!priceRaw) continue;
        const priceDa = Math.round(parseInt(priceRaw, 10) / 100);
        if (priceDa < 1500 || priceDa > 5000000) continue;
        const title = it.name || "";
        const img = it.images?.[0]?.src || "";
        const url = it.permalink || "";
        offers.push({
          id: `matos-${it.id}`,
          title,
          priceDa,
          url,
          image: img,
          wilaya: "Alger",
          store: "Matos",
          stock: it.is_in_stock ? "En stock" : "Rupture",
          condition: "new",
          postedAt: new Date().toISOString(),
          isStore: true,
          isFromStore: true,
          query: "Matos"
        });
      }
      if (items.length < 100) break;
      page++;
    }
    console.log(`  Fetched ${offers.length} products from MATOS Algerie.`);
  } catch (err) {
    console.error("  Error scraping MATOS Algerie:", err.message);
  }
  return offers;
}

async function run() {
  console.log("==========================================================");
  console.log("DZ-PartPicker: Full Monitor Scrape & Refresh (Algeria)");
  console.log("==========================================================");

  const fullPath = "full.json";
  let fullData = { ok: true, report: {} };
  try {
    fullData = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch {
    console.log("Initializing new full.json structure");
  }
  if (!fullData.report) fullData.report = {};
  if (!Array.isArray(fullData.report["ouedkniss:all"])) {
    fullData.report["ouedkniss:all"] = [];
  }

  const existingUrls = new Set(fullData.report["ouedkniss:all"].map((x) => x.url));
  console.log(`Existing offers in full.json ouedkniss:all: ${existingUrls.size}`);

  let totalNew = 0;

  // 1. Direct Store: MATOS Algerie
  const matosOffers = await scrapeMatosStore();
  const matosMonitors = [];
  for (const off of matosOffers) {
    if (/ecran|moniteur|monitor|hz|\bips\b|4k|qhd|oled|zx25|rocket|neon|titan|sa0|studioart/i.test(off.title)) {
      matosMonitors.push(off);
    }
    if (!existingUrls.has(off.url)) {
      existingUrls.add(off.url);
      fullData.report["ouedkniss:all"].push(off);
      totalNew++;
    }
  }
  // Also register in fullData.report["Matos/monitor"]
  fullData.report["Matos/monitor"] = {
    count: matosMonitors.length,
    offers: matosMonitors
  };
  console.log(`Registered ${matosMonitors.length} Matos monitors under Matos/monitor!`);

  // 2. Sweep Market-Wide Monitor Queries on Ouedkniss (multi-page)
  console.log("\n--- Sweeping Market-Wide Monitor Queries on Ouedkniss ---");
  for (const q of MARKET_MONITOR_QUERIES) {
    let qAdded = 0;
    for (let page = 1; page <= 3; page++) {
      const offers = await queryOuedkniss(q, page);
      if (offers.length === 0) break;
      for (const off of offers) {
        if (!existingUrls.has(off.url)) {
          existingUrls.add(off.url);
          fullData.report["ouedkniss:all"].push(off);
          qAdded++;
          totalNew++;
        }
      }
      await sleep(350);
    }
    if (qAdded > 0) {
      console.log(`  Query "${q}": +${qAdded} new listings added`);
    }
  }

  // 3. Sweep Top Ouedkniss Hardware Stores for Monitor Queries
  console.log("\n--- Sweeping Top Stores on Ouedkniss for Monitors ---");
  let sIdx = 0;
  for (const store of TOP_STORES) {
    sIdx++;
    let storeAdded = 0;
    for (const sq of STORE_MONITOR_QUERIES) {
      const offers = await queryOuedkniss(sq, 1, store.id);
      for (const off of offers) {
        if (!existingUrls.has(off.url)) {
          existingUrls.add(off.url);
          fullData.report["ouedkniss:all"].push(off);
          storeAdded++;
          totalNew++;
        }
      }
      await sleep(300);
    }
    if (storeAdded > 0) {
      console.log(`  [${sIdx}/${TOP_STORES.length}] ${store.name} (${store.wilaya}): +${storeAdded} new monitors`);
    }
  }

  console.log("\n==========================================================");
  console.log(`Scrape Complete! Total NEW unique offers added: ${totalNew}`);
  console.log(`Total listings in full.json ouedkniss:all: ${fullData.report["ouedkniss:all"].length}`);
  console.log("==========================================================");

  fs.writeFileSync(fullPath, JSON.stringify(fullData), "utf8");
  console.log("Saved updated full.json!");
}

run();
