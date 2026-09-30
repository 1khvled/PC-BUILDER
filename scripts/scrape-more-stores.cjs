const fs = require('fs');

const GRAPHQL_ENDPOINT = "https://api.ouedkniss.com/graphql";

const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

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
        currentPage
        lastPage
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
        createdAt
        refreshedAt
        isFromStore
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

// Load discovered stores
let STORES = [];
try {
  const discovered = JSON.parse(fs.readFileSync('scripts/discovered-stores.json', 'utf8'));
  // Take top 80 stores across Algerian wilayas
  STORES = discovered.slice(0, 80).map(s => ({ id: s.id, name: s.name, wilaya: s.wilaya }));
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

async function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function queryStoreAnnouncements(storeId, page = 1) {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        query: QUERY,
        variables: {
          filter: {
            storeId: parseInt(storeId, 10),
            page,
            count: 48
          }
        }
      })
    });
    if (!res.ok) return { offers: [], hasMore: false };
    const json = await res.json();
    const paginator = json?.data?.search?.announcements?.paginatorInfo;
    const items = json?.data?.search?.announcements?.data || [];

    const offers = items.map((a) => {
      if (!a || !a.id) return null;

      const st = String(a.status || "").toUpperCase();
      if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") return null;

      const postDate = a.refreshedAt || a.createdAt;
      if (postDate) {
        const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
        if (isNaN(ageDays) || ageDays > 45) return null;
      }

      let p = a.price;
      if (!p && a.pricePreview) {
        const cleaned = String(a.pricePreview).replace(/\s/g, "");
        const m = cleaned.match(/^(\d{4,8})(?:DA|DZD)?$/i);
        if (m) p = parseInt(m[1], 10);
      }
      if (!p || p < 1500 || p > 5000000) return null;
      if (/^(?:1000|1111|1234|12345|123456|9999|99999|1000000)$/.test(String(p))) return null;

      const title = (a.title || "").replace(/\s+/g, " ").trim();
      if (!title || title.length < 8) return null;

      // Exclude obvious accessories / empty box
      if (/\b(?:hs\b|en panne|pour pi[eè]ces?|bo[iî]te vide|carton seul|ventirad seul|support seul|c[aâ]ble seul)\b/i.test(title)) return null;

      const primaryCity = a.cities?.[0];
      const wilaya = primaryCity?.region?.name || primaryCity?.name || "Alger";
      const storeName = (a.store?.name || a.user?.username || "Ouedkniss").trim();
      const slug = a.slug || "annonce";
      const url = `https://www.ouedkniss.com/${slug}-d${a.id}`;
      const img = a.defaultMedia?.mediaUrl || "";

      return {
        id: a.id,
        title,
        priceDa: p,
        url,
        image: img,
        wilaya,
        seller: storeName,
        store: storeName,
        stock: "Ouedkniss",
        postedAt: postDate || "",
        isFromStore: true,
        storeSlug: a.store?.slug || undefined,
        storeId: a.store?.id || String(storeId),
        query: "store-sweep",
        description: a.description || ""
      };
    }).filter(Boolean);

    return {
      offers,
      hasMore: Boolean(paginator && paginator.hasMorePages)
    };
  } catch (err) {
    console.error(`  Error querying storeId ${storeId} p${page}:`, err.message);
    return { offers: [], hasMore: false };
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
      if (priceDa < 1500 || priceDa > 5000000) continue;
      const title = it.name || "";
      const img = it.images?.[0]?.src || "";
      const url = it.permalink || "";
      offers.push({
        id: `blida-${it.id}`,
        title,
        priceDa,
        url,
        image: img,
        wilaya: "Blida",
        seller: "Blida Computer",
        store: "Blida Computer",
        stock: it.is_in_stock ? "En stock" : "Rupture",
        condition: "new",
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
  console.log("==========================================================");
  console.log(`DZ-PartPicker: Comprehensive Algeria Store Sweep (${STORES.length} Stores)`);
  console.log("==========================================================");

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

  const existingOffers = fullData.report["ouedkniss:all"];
  console.log(`Current listings in full.json ouedkniss:all: ${existingOffers.length}`);

  const existingUrlMap = new Map();
  for (const o of existingOffers) {
    if (o.url) existingUrlMap.set(o.url, o);
  }

  let totalNew = 0;
  let totalUpdated = 0;

  // 1. Standalone store: Blida Computer
  const blidaOffers = await scrapeBlidaComputer();
  for (const off of blidaOffers) {
    if (!existingUrlMap.has(off.url)) {
      existingUrlMap.set(off.url, off);
      existingOffers.push(off);
      totalNew++;
    } else {
      const old = existingUrlMap.get(off.url);
      if (off.priceDa && off.priceDa !== old.priceDa) {
        old.priceDa = off.priceDa;
        totalUpdated++;
      }
    }
  }

  // 2. Sweep stores across Algerian wilayas via storeId
  let storeIdx = 0;
  for (const store of STORES) {
    storeIdx++;
    process.stdout.write(`[${storeIdx}/${STORES.length}] Sweeping ${store.name} (${store.wilaya})... `);

    let storeAdded = 0;
    let storeRefreshed = 0;

    for (let page = 1; page <= 2; page++) {
      const { offers, hasMore } = await queryStoreAnnouncements(store.id, page);
      for (const off of offers) {
        if (!existingUrlMap.has(off.url)) {
          existingUrlMap.set(off.url, off);
          existingOffers.push(off);
          storeAdded++;
          totalNew++;
        } else {
          const old = existingUrlMap.get(off.url);
          let changed = false;
          if (off.priceDa && off.priceDa !== old.priceDa) {
            old.priceDa = off.priceDa;
            changed = true;
          }
          if (off.postedAt && off.postedAt > (old.postedAt || "")) {
            old.postedAt = off.postedAt;
            changed = true;
          }
          if (store.name && (!old.seller || old.seller === "Ouedkniss")) {
            old.seller = store.name;
            old.store = store.name;
            changed = true;
          }
          if (store.wilaya && (!old.wilaya || old.wilaya === "Alger")) {
            old.wilaya = store.wilaya;
            changed = true;
          }
          if (old.isFromStore !== true) {
            old.isFromStore = true;
            changed = true;
          }
          if (changed) {
            storeRefreshed++;
            totalUpdated++;
          }
        }
      }
      if (!hasMore) break;
      await sleep(250);
    }

    console.log(`(+${storeAdded} new, ~${storeRefreshed} refreshed)`);
    await sleep(350);
  }

  console.log("==========================================================");
  console.log(`Store Sweep Complete! Total NEW unique offers added: ${totalNew}`);
  console.log(`Total listings refreshed with store/wilaya/price: ${totalUpdated}`);
  console.log(`Total listings in full.json ouedkniss:all: ${existingOffers.length}`);
  console.log("==========================================================");

  fs.writeFileSync(fullPath, JSON.stringify(fullData), "utf8");
  console.log("Saved updated full.json!");
}

run().catch(console.error);
