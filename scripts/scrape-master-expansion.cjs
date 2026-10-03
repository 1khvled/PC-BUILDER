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

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// 8 Core Hardware Categories on Ouedkniss
const HARDWARE_CATEGORIES = [
  { slug: "informatique-pieces-pc-fixe-carte-graphique", name: "GPU", maxPages: 10 },
  { slug: "informatique-pieces-pc-fixe-processeur", name: "CPU", maxPages: 10 },
  { slug: "informatique-pieces-pc-fixe-carte-mere", name: "Motherboard", maxPages: 10 },
  { slug: "informatique-pieces-pc-fixe-ram", name: "RAM", maxPages: 10 },
  { slug: "informatique-pieces-pc-fixe-disque-dur", name: "Storage", maxPages: 10 },
  { slug: "informatique-pieces-pour-pc-fixe-refroidissement", name: "Cooling", maxPages: 8 },
  { slug: "informatique-pieces-pc-fixe-alimentation-boitier", name: "PSU & Case", maxPages: 10 },
  { slug: "informatique-ecrans", name: "Monitors", maxPages: 10 },
];

function normalizeAnnouncement(a, queryLabel = "category-sweep") {
  if (!a || !a.id) return null;

  const st = String(a.status || "").toUpperCase();
  if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") return null;

  const postDate = a.refreshedAt || a.createdAt;
  if (postDate) {
    const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
    if (isNaN(ageDays) || ageDays > 180) return null; // 6 months max (disregard old post, keep store)
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

  // Exclude empty box / parts-only / accessories
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
    isStore: Boolean(a.isFromStore),
    isFromStore: Boolean(a.isFromStore),
    storeSlug: a.store?.slug || undefined,
    storeId: a.store?.id ? String(a.store.id) : undefined,
    query: queryLabel,
    description: a.description || ""
  };
}

async function fetchGraphQL(filter, q = undefined, retries = 3) {
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ query: QUERY, variables: { q, filter } }),
      });
      if (res.status === 429) {
        console.log("  [429 Rate Limit] Backing off for 3s...");
        await sleep(3000);
        continue;
      }
      if (!res.ok) {
        if (attempt < retries - 1) {
          await sleep(1500);
          continue;
        }
        return { data: [], paginatorInfo: null };
      }
      const json = await res.json();
      const announcements = json?.data?.search?.announcements;
      return {
        data: announcements?.data || [],
        paginatorInfo: announcements?.paginatorInfo || null
      };
    } catch (err) {
      if (attempt < retries - 1) {
        await sleep(1500);
        continue;
      }
      console.error(`  GraphQL error (attempt ${attempt + 1}):`, err.message);
      return { data: [], paginatorInfo: null };
    }
  }
  return { data: [], paginatorInfo: null };
}

// Scrape standalone Blida Computer store (WooCommerce API)
async function scrapeBlidaComputer() {
  console.log("\n========================================================");
  console.log("Scraping Standalone Store: Blida Computer (blidacomputer.dz)");
  console.log("========================================================");
  const offers = [];
  try {
    for (let page = 1; page <= 4; page++) {
      const res = await fetch(`https://blidacomputer.dz/wp-json/wc/store/v1/products?per_page=100&page=${page}`, {
        headers: { "User-Agent": BROWSER_UA },
        signal: AbortSignal.timeout(20000)
      });
      if (!res.ok) break;
      const items = await res.json();
      if (!Array.isArray(items) || items.length === 0) break;

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
      console.log(`  Blida Computer page ${page}: fetched ${items.length} items (total valid: ${offers.length})`);
      if (items.length < 100) break;
      await sleep(1000);
    }
  } catch (err) {
    console.error("  Error scraping Blida Computer:", err.message);
  }
  return offers;
}

// Scrape standalone Matos Algérie store (WooCommerce API)
async function scrapeMatosStore() {
  console.log("\n========================================================");
  console.log("Scraping Standalone Store: Matos Gaming (matos-algerie.com)");
  console.log("========================================================");
  const offers = [];
  try {
    const res = await fetch("https://matos-algerie.com/wp-json/wc/store/v1/products?per_page=100", {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(15000)
    });
    if (res.ok) {
      const items = await res.json();
      if (Array.isArray(items)) {
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
            seller: "Matos",
            store: "Matos",
            stock: it.is_in_stock ? "En stock" : "Rupture",
            condition: "new",
            postedAt: new Date().toISOString(),
            isStore: true,
            isFromStore: true,
            query: "matos"
          });
        }
      }
    }
    console.log(`  Matos Gaming: fetched ${offers.length} active monitors/products.`);
  } catch (err) {
    console.error("  Error scraping Matos Gaming:", err.message);
  }
  return offers;
}

async function run() {
  console.log("==========================================================");
  console.log("DZ-PartPicker: Comprehensive Hardware Expansion & Store Discovery");
  console.log("==========================================================");

  // Load existing database
  const fullPath = "full.json";
  let fullData = { ok: true, report: {} };
  try {
    fullData = JSON.parse(fs.readFileSync(fullPath, "utf8"));
  } catch {
    console.log("Initializing new full.json");
  }
  if (!fullData.report) fullData.report = {};
  if (!Array.isArray(fullData.report["ouedkniss:all"])) {
    fullData.report["ouedkniss:all"] = [];
  }

  const existingOffers = fullData.report["ouedkniss:all"];
  console.log(`Initial full.json announcements: ${existingOffers.length}`);

  // Build seen lookup
  const seenMap = new Map();
  for (const o of existingOffers) {
    if (o.url) seenMap.set(o.url, o);
  }

  // Track discovered stores
  let discoveredStores = [];
  try {
    discoveredStores = JSON.parse(fs.readFileSync("scripts/discovered-stores.json", "utf8"));
  } catch {}
  const storeIdRegistry = new Map(discoveredStores.map(s => [String(s.id), s]));

  let newAnnouncements = 0;
  let updatedAnnouncements = 0;

  function registerStore(storeObj, wilaya) {
    if (!storeObj || !storeObj.id) return;
    const sId = String(storeObj.id);
    if (!storeIdRegistry.has(sId)) {
      const entry = {
        id: sId,
        name: (storeObj.name || "").trim(),
        slug: storeObj.slug || "",
        wilaya: wilaya || "Alger"
      };
      storeIdRegistry.set(sId, entry);
      console.log(`  [NEW STORE DISCOVERED] ID: ${sId} - "${entry.name}" (${entry.wilaya})`);
    }
  }

  // PHASE 1: Category Sweeps (8 hardware categories)
  console.log("\n--- PHASE 1: Ouedkniss Category Sweeps ---");
  for (const cat of HARDWARE_CATEGORIES) {
    console.log(`\nScanning category: ${cat.name} (${cat.slug}) up to ${cat.maxPages} pages...`);
    for (let page = 1; page <= cat.maxPages; page++) {
      const { data, paginatorInfo } = await fetchGraphQL({ categorySlug: cat.slug, page, count: 48 });
      if (!data || data.length === 0) break;

      let catNew = 0;
      for (const a of data) {
        if (a.store) {
          const w = a.cities?.[0]?.region?.name || a.cities?.[0]?.name || "Alger";
          registerStore(a.store, w);
        }

        const norm = normalizeAnnouncement(a, `cat:${cat.name.toLowerCase()}`);
        if (!norm) continue;

        if (!seenMap.has(norm.url)) {
          seenMap.set(norm.url, norm);
          existingOffers.push(norm);
          catNew++;
          newAnnouncements++;
        } else {
          // Update price & freshness
          const existing = seenMap.get(norm.url);
          existing.priceDa = norm.priceDa;
          existing.postedAt = norm.postedAt;
          updatedAnnouncements++;
        }
      }
      console.log(`  Page ${page}/${cat.maxPages}: ${data.length} items returned (+${catNew} new)`);
      if (!paginatorInfo || !paginatorInfo.hasMorePages) break;
      await sleep(1300);
    }
  }

  // PHASE 2: Standalone eCommerce Stores
  console.log("\n--- PHASE 2: Standalone eCommerce Stores ---");
  const blidaOffers = await scrapeBlidaComputer();
  for (const b of blidaOffers) {
    if (!seenMap.has(b.url)) {
      seenMap.set(b.url, b);
      existingOffers.push(b);
      newAnnouncements++;
    }
  }

  const matosOffers = await scrapeMatosStore();
  for (const m of matosOffers) {
    if (!seenMap.has(m.url)) {
      seenMap.set(m.url, m);
      existingOffers.push(m);
      newAnnouncements++;
    }
  }

  // PHASE 3: Targeted Store Sweeps (Top Stores 0-80 + Uncataloged Stores)
  console.log("\n--- PHASE 3: Ouedkniss Dedicated Store Sweeps ---");
  // Gather top priority stores:
  const topStores = discoveredStores.slice(0, 80);
  const targetStoreIds = new Set(topStores.map(s => String(s.id)));

  // Add all uncataloged stores identified
  for (const sId of storeIdRegistry.keys()) {
    targetStoreIds.add(sId);
  }

  const storeList = Array.from(targetStoreIds).map(id => storeIdRegistry.get(id) || { id, name: `Store-${id}`, wilaya: "Alger" });
  console.log(`Targeting ${storeList.length} total stores for deep sweep (pages 1-2)...`);

  let storeSweepCount = 0;
  for (const s of storeList) {
    storeSweepCount++;
    console.log(`[Store ${storeSweepCount}/${storeList.length}] ${s.name} (ID: ${s.id}, ${s.wilaya})`);
    for (let page = 1; page <= 2; page++) {
      const { data, paginatorInfo } = await fetchGraphQL({ storeId: parseInt(s.id, 10), page, count: 48 });
      if (!data || data.length === 0) break;

      let sNew = 0;
      for (const a of data) {
        const norm = normalizeAnnouncement(a, `store:${s.name}`);
        if (!norm) continue;

        if (!seenMap.has(norm.url)) {
          seenMap.set(norm.url, norm);
          existingOffers.push(norm);
          sNew++;
          newAnnouncements++;
        } else {
          const existing = seenMap.get(norm.url);
          existing.priceDa = norm.priceDa;
          existing.postedAt = norm.postedAt;
          updatedAnnouncements++;
        }
      }
      if (sNew > 0) {
        console.log(`  Page ${page}: ${data.length} items (+${sNew} new)`);
      }
      if (!paginatorInfo || !paginatorInfo.hasMorePages) break;
      await sleep(1200);
    }
  }

  // PHASE 4: Save & Persist
  console.log("\n--- PHASE 4: Persisting Database & Registries ---");
  console.log(`Final total announcements in full.json: ${existingOffers.length}`);
  console.log(`Newly added: ${newAnnouncements}, Updated: ${updatedAnnouncements}`);
  console.log(`Total active Algerian hardware stores: ${storeIdRegistry.size}`);

  // Write full.json
  fs.writeFileSync(fullPath, JSON.stringify(fullData));
  console.log("  Successfully saved full.json!");

  // Write discovered-stores.json
  const updatedStoresArray = Array.from(storeIdRegistry.values());
  fs.writeFileSync("scripts/discovered-stores.json", JSON.stringify(updatedStoresArray, null, 2));
  console.log(`  Successfully updated scripts/discovered-stores.json (${updatedStoresArray.length} stores)!`);
}

run().catch(err => {
  console.error("FATAL ERROR:", err);
  process.exit(1);
});
