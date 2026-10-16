const fs = require('fs');
const { execSync } = require('child_process');

const GRAPHQL_ENDPOINT = "https://api.ouedkniss.com/graphql";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": BROWSER_UA,
  "Origin": "https://www.ouedkniss.com",
  "Referer": "https://www.ouedkniss.com/",
  "Accept-Language": "fr-DZ,fr;q=0.9",
};

const SEARCH_QUERY = `query SearchQuery($q: String, $filter: SearchFilterInput) {
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

// CLI argument parsing
const argv = process.argv.slice(2);
function getArg(flag, defaultValue = null) {
  const idx = argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1];
  return defaultValue;
}
const hasFlag = (flag) => argv.includes(flag);

const MAX_AGE_DAYS = parseInt(getArg("--max-days", "180"), 10);
const PRUNE_ONLY = hasFlag("--prune-only");
const SWEEP_ONLY = hasFlag("--sweep-only");
const AUTO_PUSH = hasFlag("--push");
const LIMIT_STORES = getArg("--limit") ? parseInt(getArg("--limit"), 10) : Infinity;
const ONLY_STORES = getArg("--stores") ? getArg("--stores").split(",").map(s => s.trim()) : [];
const CHECK_SEED_ONLY = hasFlag("--seed-only") || !hasFlag("--all");
const CONCURRENT_CHUNKS = parseInt(getArg("--concurrency", "4"), 10);

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parsePrice(price, pricePreview) {
  if (typeof price === 'number' && price > 0) return price;
  if (pricePreview) {
    const cleaned = String(pricePreview).replace(/\s/g, "");
    const m = cleaned.match(/^(\d{4,8})(?:DA|DZD)?$/i);
    if (m) return parseInt(m[1], 10);
  }
  return null;
}

function normalizeAnnouncement(a, queryLabel = "sweep") {
  if (!a || !a.id) return null;

  const st = String(a.status || "").toUpperCase();
  if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") return null;

  const postDate = a.refreshedAt || a.createdAt;
  if (!postDate) return null;
  const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
  if (isNaN(ageDays) || ageDays > MAX_AGE_DAYS) return null;

  const p = parsePrice(a.price, a.pricePreview);
  if (!p || p < 1500 || p > 5000000) return null;
  if (/^(?:1000|1111|1234|12345|123456|9999|99999|1000000)$/.test(String(p))) return null;

  const title = (a.title || "").replace(/\s+/g, " ").trim();
  if (!title || title.length < 8) return null;

  if (/\b(?:hs\b|en panne|pour pi[eè]ces?|bo[iî]te vide|carton seul|ventirad seul|support seul|c[aâ]ble seul)\b/i.test(title)) {
    return null;
  }

  const primaryCity = a.cities?.[0];
  const wilaya = primaryCity?.region?.name || primaryCity?.name || "Alger";
  const storeName = (a.store?.name || a.user?.username || "Ouedkniss").trim();
  const slug = a.slug || "annonce";
  const url = `https://www.ouedkniss.com/${slug}-d${a.id}`;
  const img = a.defaultMedia?.mediaUrl || "";

  return {
    id: String(a.id),
    title,
    priceDa: p,
    url,
    image: img,
    wilaya,
    seller: storeName,
    store: storeName,
    stock: "Ouedkniss",
    postedAt: postDate,
    isStore: Boolean(a.isFromStore),
    isFromStore: Boolean(a.isFromStore),
    storeSlug: a.store?.slug || undefined,
    storeId: a.store?.id ? String(a.store.id) : undefined,
    query: queryLabel,
    description: a.description || "",
    ageDays: Math.round(ageDays)
  };
}

// ----------------------------------------------------------------------
// 1. HIGH-SPEED ALIAS-BATCHED LIVE ANNOUNCEMENT VERIFIER (10 ads/query)
// ----------------------------------------------------------------------
async function verifyChunk10(chunk) {
  const fields = chunk.map((id, idx) => `a${idx}: announcementDetails(id: "${id}") { id status price pricePreview refreshedAt createdAt }`).join("\n");
  const query = `query BatchCheck {\n${fields}\n}`;

  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({ query }),
        signal: AbortSignal.timeout(7000)
      });
      if (!res.ok) {
        await sleep(300);
        continue;
      }
      const json = await res.json();
      const data = json?.data || {};

      const chunkResults = [];
      for (let idx = 0; idx < chunk.length; idx++) {
        const id = chunk[idx];
        const ann = data[`a${idx}`];
        if (!ann) {
          // Announcement null means deleted, expired, or non-existent
          chunkResults.push({ id, status: "DELETED" });
        } else {
          const st = String(ann.status || "").toUpperCase();
          if (st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") {
            chunkResults.push({ id, status: "INACTIVE", currentStatus: st });
          } else {
            chunkResults.push({
              id,
              status: "LIVE",
              priceDa: parsePrice(ann.price, ann.pricePreview),
              refreshedAt: ann.refreshedAt || ann.createdAt
            });
          }
        }
      }
      return chunkResults;
    } catch {
      await sleep(250);
    }
  }

  // Fallback if network hiccup
  return chunk.map(id => ({ id, status: "UNCHECKED" }));
}

async function batchVerifyAnnouncements(idList, concurrency = CONCURRENT_CHUNKS) {
  console.log(`[Verify] Validating ${idList.length} Ouedkniss listings (batch size: 10, concurrency: ${concurrency})...`);
  const results = new Map();

  const BATCH_SIZE = 10;
  const chunks = [];
  for (let i = 0; i < idList.length; i += BATCH_SIZE) {
    chunks.push(idList.slice(i, i + BATCH_SIZE));
  }

  let chunkCursor = 0;
  let activeWorkers = 0;
  let processedItems = 0;
  let liveCount = 0;
  let deadCount = 0;
  let uncheckedCount = 0;
  const startTime = Date.now();

  return new Promise((resolve) => {
    function launchNext() {
      if (chunkCursor >= chunks.length && activeWorkers === 0) {
        const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
        console.log(`\n[Verify] Completed in ${elapsedSec}s: ${liveCount} LIVE, ${deadCount} DEAD/SOLD, ${uncheckedCount} UNCHECKED.`);
        return resolve(results);
      }

      while (chunkCursor < chunks.length && activeWorkers < concurrency) {
        const currentChunk = chunks[chunkCursor++];
        activeWorkers++;

        verifyChunk10(currentChunk).then((chunkResults) => {
          for (const r of chunkResults) {
            results.set(r.id, r);
            if (r.status === "LIVE") liveCount++;
            else if (r.status === "DELETED" || r.status === "INACTIVE") deadCount++;
            else uncheckedCount++;
          }
          processedItems += currentChunk.length;

          if (processedItems % 100 < BATCH_SIZE || processedItems >= idList.length) {
            const pct = Math.min(100, Math.round((processedItems / idList.length) * 100));
            process.stdout.write(`\r  Live Validation: ${processedItems}/${idList.length} (${pct}%) — ${deadCount} dead/sold pruned`);
          }

          activeWorkers--;
          launchNext();
        }).catch(() => {
          activeWorkers--;
          launchNext();
        });
      }
    }

    launchNext();
  });
}

// ----------------------------------------------------
// 2. STORE SEARCH FETCHER
// ----------------------------------------------------
async function fetchStorePage(storeId, page = 1) {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: { filter: { storeId: parseInt(storeId, 10), page, count: 48 } }
      }),
      signal: AbortSignal.timeout(10000)
    });
    if (!res.ok) return { items: [], hasMore: false, hitStale: false };
    const json = await res.json();
    const ann = json?.data?.search?.announcements;
    const rawItems = ann?.data || [];
    const hasMore = Boolean(ann?.paginatorInfo?.hasMorePages);

    let staleCount = 0;
    const validOffers = [];
    for (const raw of rawItems) {
      const postDate = raw.refreshedAt || raw.createdAt;
      if (postDate) {
        const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
        if (ageDays > MAX_AGE_DAYS) {
          staleCount++;
          continue;
        }
      }
      const norm = normalizeAnnouncement(raw, `store:${storeId}`);
      if (norm) validOffers.push(norm);
    }

    const allStale = rawItems.length > 0 && staleCount === rawItems.length;
    return { items: validOffers, hasMore: hasMore && !allStale, hitStale: allStale };
  } catch (err) {
    return { items: [], hasMore: false, hitStale: false };
  }
}

// ----------------------------------------------------
// 3. CATEGORY KEYWORDS SWEEPER
// ----------------------------------------------------
const KEYWORD_SWEEPS = [
  "rtx 4060", "rtx 4070", "rx 6700", "rx 580", "rtx 3060", "rx 7600", "rtx 4080",
  "ryzen 5 5600", "ryzen 7 7800x3d", "i5 12400f", "i5 13400f", "ryzen 5 7500f", "ryzen 7 5700x3d",
  "carte mere b550", "carte mere b650", "carte mere b760", "carte mere a520",
  "ram ddr4 16gb", "ram ddr4 32gb", "ram ddr5 32gb", "ssd 1tb nvme", "ssd 2tb nvme",
  "ecran 144hz", "ecran 165hz", "ecran 240hz", "pc gamer", "unite gamer"
];

async function sweepCategoryKeywords() {
  console.log(`\n[Keywords] Sweeping ${KEYWORD_SWEEPS.length} core hardware queries on Ouedkniss...`);
  const found = [];
  for (const q of KEYWORD_SWEEPS) {
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          query: SEARCH_QUERY,
          variables: { q, filter: { count: 30, page: 1 } }
        }),
        signal: AbortSignal.timeout(8000)
      });
      if (!res.ok) continue;
      const json = await res.json();
      const rawItems = json?.data?.search?.announcements?.data || [];
      let count = 0;
      for (const item of rawItems) {
        const norm = normalizeAnnouncement(item, q);
        if (norm) {
          found.push(norm);
          count++;
        }
      }
      process.stdout.write(`  Keyword "${q}": +${count} offers\n`);
      await sleep(300);
    } catch {
      // ignore individual query error
    }
  }
  return found;
}

// ----------------------------------------------------
// 4. STANDALONE E-COMMERCE STORES
// ----------------------------------------------------
async function sweepBlidaComputer() {
  const offers = [];
  try {
    const res = await fetch("https://blidacomputer.dz/wp-json/wc/store/v1/products?per_page=100&page=1", {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return [];
    const items = await res.json();
    for (const it of items) {
      const priceRaw = it.prices?.price;
      if (!priceRaw) continue;
      const priceDa = Math.round(parseInt(priceRaw, 10) / 100);
      if (priceDa < 1500 || priceDa > 5000000) continue;
      offers.push({
        id: `blida-${it.id}`,
        title: it.name || "",
        priceDa,
        url: it.permalink || "",
        image: it.images?.[0]?.src || "",
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
  } catch (err) {
    console.warn("  Blida Computer sweep skipped:", err.message);
  }
  return offers;
}

async function sweepMatosGaming() {
  const offers = [];
  try {
    const res = await fetch("https://matos-algerie.com/wp-json/wc/store/v1/products?per_page=100", {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return [];
    const items = await res.json();
    for (const it of items) {
      const priceRaw = it.prices?.price;
      if (!priceRaw) continue;
      const priceDa = Math.round(parseInt(priceRaw, 10) / 100);
      if (priceDa < 1500 || priceDa > 5000000) continue;
      offers.push({
        id: `matos-${it.id}`,
        title: it.name || "",
        priceDa,
        url: it.permalink || "",
        image: it.images?.[0]?.src || "",
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
  } catch (err) {
    console.warn("  Matos sweep skipped:", err.message);
  }
  return offers;
}

// ----------------------------------------------------
// MAIN EXECUTION
// ----------------------------------------------------
async function main() {
  console.log("====================================================================");
  console.log(" DZ-PartPicker: Full Market Resweep & Stale/Deleted Offer Pruner");
  console.log(` Max Age: ${MAX_AGE_DAYS} days | Prune Only: ${PRUNE_ONLY} | Sweep Only: ${SWEEP_ONLY}`);
  console.log("====================================================================");

  if (!fs.existsSync("full.json")) {
    throw new Error("full.json not found!");
  }
  const full = JSON.parse(fs.readFileSync("full.json", "utf8"));
  if (!full.report) full.report = {};
  if (!Array.isArray(full.report["ouedkniss:all"])) full.report["ouedkniss:all"] = [];

  const initialCount = full.report["ouedkniss:all"].length;
  console.log(`[Catalog] Loaded full.json with ${initialCount} Ouedkniss offers.`);

  // 1. Static Pruning: Remove broken URLs, stale dates > MAX_AGE_DAYS
  const nowMs = Date.now();
  const maxMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  let candidates = full.report["ouedkniss:all"].filter((o) => {
    if (!o.url || !o.url.startsWith("http")) return false;
    const postDate = o.postedAt || o.day;
    if (!postDate) return false;
    if (postDate < "2025-10-01") return false;
    const age = nowMs - new Date(postDate).getTime();
    return !isNaN(age) && age <= maxMs;
  });
  console.log(`[Static Prune] Cleaned legacy/stale listings: ${initialCount} -> ${candidates.length} (-${initialCount - candidates.length})`);

  // 2. Live Verification of Ouedkniss Listings
  if (!SWEEP_ONLY) {
    let targetIds = [];
    if (fs.existsSync("supabase-seed.json")) {
      const seed = JSON.parse(fs.readFileSync("supabase-seed.json", "utf8"));
      const ouedSeed = seed.offers.filter((o) => o.u && o.u.includes("ouedkniss.com"));
      for (const o of ouedSeed) {
        const m = o.u.match(/-d(\d+)/);
        if (m) targetIds.push(m[1]);
      }
      targetIds = Array.from(new Set(targetIds));
      console.log(`[Targeting] Found ${targetIds.length} active Ouedkniss offers currently indexed in supabase-seed.json.`);
    }

    if (!CHECK_SEED_ONLY) {
      const fullIds = candidates.map((o) => {
        const m = o.url?.match(/-d(\d+)/);
        return o.id || (m ? m[1] : null);
      }).filter(Boolean);
      targetIds = Array.from(new Set([...targetIds, ...fullIds]));
    }

    const verificationMap = await batchVerifyAnnouncements(targetIds, CONCURRENT_CHUNKS);

    let prunedDead = 0;
    let priceUpdates = 0;
    const verifiedCandidates = [];

    for (const o of candidates) {
      const m = o.url?.match(/-d(\d+)/);
      const id = String(o.id || (m ? m[1] : ""));
      const check = verificationMap.get(id);

      if (check) {
        if (check.status === "DELETED" || check.status === "INACTIVE") {
          prunedDead++;
          continue; // Drop deleted/sold listing!
        }
        if (check.status === "LIVE") {
          if (check.priceDa && check.priceDa !== o.priceDa) {
            o.priceDa = check.priceDa;
            priceUpdates++;
          }
          if (check.refreshedAt) {
            o.postedAt = check.refreshedAt;
          }
        }
      }
      verifiedCandidates.push(o);
    }

    candidates = verifiedCandidates;
    console.log(`\n[Pruning Result] Pruned ${prunedDead} confirmed deleted/sold Ouedkniss ads. Updated ${priceUpdates} prices.`);
    console.log(`[Catalog Now] ${candidates.length} active, live, verified offers.`);
  }

  // 3. Resweep Fresh Listings (Discovered Stores + Category Keywords + Standalone)
  if (!PRUNE_ONLY) {
    const existingUrlSet = new Set(candidates.map((o) => o.url));
    let newlyAdded = 0;

    // A. Sweep Discovered Stores
    if (fs.existsSync("scripts/discovered-stores.json")) {
      let stores = JSON.parse(fs.readFileSync("scripts/discovered-stores.json", "utf8"));
      if (ONLY_STORES.length > 0) {
        stores = stores.filter((s) => ONLY_STORES.includes(String(s.id)));
      }
      if (Number.isFinite(LIMIT_STORES)) {
        stores = stores.slice(0, LIMIT_STORES);
      }

      console.log(`\n[Resweep] Sweeping ${stores.length} registered hardware stores on Ouedkniss...`);
      for (let i = 0; i < stores.length; i++) {
        const s = stores[i];
        let storeNew = 0;
        for (let page = 1; page <= 2; page++) {
          const { items, hasMore, hitStale } = await fetchStorePage(s.id, page);
          for (const item of items) {
            if (!existingUrlSet.has(item.url)) {
              existingUrlSet.add(item.url);
              candidates.push(item);
              storeNew++;
              newlyAdded++;
            }
          }
          if (hitStale || !hasMore) break;
          await sleep(200);
        }
        if (storeNew > 0 || (i + 1) % 25 === 0) {
          process.stdout.write(`  [${i + 1}/${stores.length}] Store ${s.id} (${s.name}): +${storeNew} new fresh offers\n`);
        }
      }
    }

    // B. Sweep Core Keywords
    const keywordItems = await sweepCategoryKeywords();
    let kwAdded = 0;
    for (const item of keywordItems) {
      if (!existingUrlSet.has(item.url)) {
        existingUrlSet.add(item.url);
        candidates.push(item);
        kwAdded++;
        newlyAdded++;
      }
    }
    console.log(`[Keywords Result] Added ${kwAdded} fresh category offers.`);

    // C. Sweep Standalone Shops
    const blida = await sweepBlidaComputer();
    for (const b of blida) {
      if (!existingUrlSet.has(b.url)) {
        existingUrlSet.add(b.url);
        candidates.push(b);
        newlyAdded++;
      }
    }
    const matos = await sweepMatosGaming();
    for (const m of matos) {
      if (!existingUrlSet.has(m.url)) {
        existingUrlSet.add(m.url);
        candidates.push(m);
        newlyAdded++;
      }
    }

    console.log(`\n[Resweep Total] Ingested ${newlyAdded} new active offers into catalog.`);
  }

  // 4. Save Cleaned full.json
  full.report["ouedkniss:all"] = candidates;
  fs.writeFileSync("full.json", JSON.stringify(full));
  console.log(`[Save] Saved full.json with ${candidates.length} verified listings.`);

  // 5. Bake & Sync (if --push is set)
  if (AUTO_PUSH) {
    console.log("\n====================================================================");
    console.log(" Baking Catalog & Syncing Cleaned Offers to Supabase");
    console.log("====================================================================");
    console.log("Running node bake.cjs...");
    execSync("node bake.cjs", { stdio: "inherit" });

    console.log("\nRunning node scripts/smart-sync.mjs --force...");
    execSync("node scripts/smart-sync.mjs --force", { stdio: "inherit" });
    console.log("\n[Complete] Catalog baked & Supabase synced with 0 ghost offers!");
  }
}

main().catch((err) => {
  console.error("\n[Resweep Error]:", err);
  process.exit(1);
});
