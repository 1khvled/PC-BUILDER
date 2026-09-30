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

// Load all discovered stores
let STORES = [];
try {
  const discovered = JSON.parse(fs.readFileSync('scripts/discovered-stores.json', 'utf8'));
  STORES = discovered.slice(0, 60).map(s => ({ id: s.id, name: s.name, wilaya: s.wilaya }));
} catch {
  console.log("Could not load discovered-stores.json, using fallback.");
  STORES = [
    { id: "31418", name: "TECHMATE DZ", wilaya: "Jijel" },
    { id: "17937", name: "IT DEVICE", wilaya: "Alger" },
    { id: "30409", name: "FUTURE CITY INFORMATIQUE", wilaya: "Alger" },
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
}

const STORE_SAMPLE_QUERIES = [
  "RTX", "GTX", "Radeon", "Ryzen", "Intel", "B550", "B650", "B760", "Z790",
  "DDR4", "DDR5", "SSD", "NVMe", "PSU", "Watercooling", "Ecran", "144Hz", "165Hz", "180Hz", "240Hz", "Matos", "Boitier"
];

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function queryOuedkniss(q, storeId = null) {
  const filter = { page: 1, count: 40 };
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

      // 1. Status check: only active/published/edited listings
      const st = String(a.status || "").toUpperCase();
      if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") return null;

      // 2. Freshness check: reject dead/expired listings older than 90 days
      const postDate = a.refreshedAt;
      if (!postDate) return null;
      const ageDays = (Date.now() - new Date(postDate).getTime()) / (1000 * 864e5);
      if (isNaN(ageDays) || ageDays > 90) return null;

      // 3. Price validation: clean numeric price, reject placeholders
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

      // 4. Exclude broken, empty box, accessories, or entire PC units
      const titleLower = title.toLowerCase();
      if (/\b(?:hs\b|en panne|pour pi[eè]ces?|bo[iî]te vide|carton seul|ventirad seul|support seul|c[aâ]ble seul)\b/i.test(titleLower)) return null;
      if (/\b(?:pc complet|pc gamer complet|unit[eé] gamer|unit[eé] centrale|configuration compl[eè]te|setup gamer)\b/i.test(titleLower)) return null;

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

// Scrape standalone Blida Computer store (WooCommerce API)
async function scrapeBlidaComputer() {
  console.log("Scraping standalone store: Blida Computer (blidacomputer.dz)...");
  try {
    const res = await fetch("https://blidacomputer.dz/wp-json/wc/store/products?per_page=100", {
      headers: { "User-Agent": BROWSER_UA }
    });
    if (!res.ok) return [];
    const items = await res.json();
    const offers = [];
    for (const it of items) {
      const priceRaw = it.prices?.price;
      if (!priceRaw) continue;
      const priceDa = Math.round(parseInt(priceRaw, 10) / 100);
      if (priceDa < 1000 || priceDa > 5000000) continue;
      const title = it.name || "";
      const img = it.images?.[0]?.src || "";
      const url = it.permalink || "";
      const isNew = true; // Retail storefront new inventory
      offers.push({
        id: `blida-${it.id}`,
        title,
        priceDa,
        url,
        image: img,
        wilaya: "Blida",
        store: "Blida Computer",
        stock: it.is_in_stock ? "En stock" : "Rupture",
        condition: isNew ? "new" : "used",
        postedAt: new Date().toISOString(),
        isStore: true,
        isFromStore: true,
        query: "blidacomputer"
      });
    }
    console.log(`  Fetched ${offers.length} products from Blida Computer.`);
    return offers;
  } catch (err) {
    console.error("  Error scraping Blida Computer:", err.message);
    return [];
  }
}

async function run() {
  console.log(`Starting expanded scrape across Algeria: ${STORES.length} stores + Blida Computer standalone.`);

  const fullPath = "full.json";
  let fullData = { ok: true, report: {} };
  try {
    fullData = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch {
    console.log("Could not load full.json, initializing empty.");
  }
  if (!fullData.report) fullData.report = {};
  if (!Array.isArray(fullData.report["ouedkniss:all"])) {
    fullData.report["ouedkniss:all"] = [];
  }

  const existingUrls = new Set(fullData.report["ouedkniss:all"].map((x) => x.url));
  console.log(`Existing offers in full.json ouedkniss:all: ${existingUrls.size}`);

  let totalNew = 0;

  // 1. Standalone store: Blida Computer
  const blidaOffers = await scrapeBlidaComputer();
  for (const off of blidaOffers) {
    if (!existingUrls.has(off.url)) {
      existingUrls.add(off.url);
      fullData.report["ouedkniss:all"].push(off);
      totalNew++;
    }
  }

  // 2. Sweep top discovered stores on Ouedkniss across Algerian wilayas
  let storeIdx = 0;
  for (const store of STORES) {
    storeIdx++;
    console.log(`[${storeIdx}/${STORES.length}] Sweeping ${store.name} (${store.wilaya})...`);
    for (const sq of STORE_SAMPLE_QUERIES) {
      const offers = await queryOuedkniss(sq, store.id);
      let added = 0;
      for (const off of offers) {
        if (!existingUrls.has(off.url)) {
          existingUrls.add(off.url);
          fullData.report["ouedkniss:all"].push(off);
          added++;
          totalNew++;
        }
      }
      if (added > 0) {
        console.log(`  +${added} new from ${store.name} query "${sq}"`);
      }
      await sleep(400);
    }
  }

  console.log(`\nAll stores swept! Total new unique offers added: ${totalNew}`);
  console.log(`Total listings in full.json ouedkniss:all: ${fullData.report["ouedkniss:all"].length}`);

  if (totalNew > 0) {
    fs.writeFileSync(fullPath, JSON.stringify(fullData), "utf8");
    console.log("Saved updated full.json!");
  }
}

run();
