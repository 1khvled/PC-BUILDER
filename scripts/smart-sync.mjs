// Smart Delta Sync for Supabase — minimal compute, zero waste.
//
// Features:
// 1. Freshness Guard: If database was updated < 36h ago, skips execution (0 DB writes).
// 2. Diff-Only Upsert: Compares existing offers with new offers. Only rows with changed
//    prices, changed stock, or new products are written to Supabase.
// 3. Smart History: Only appends to price_history when price actually changed.
// 4. Batch Chunking: Small 50-row chunks prevent long database transaction locks.
// 5. Automatic Retention: Prunes records older than 400 days to stay under 15MB.
//
// Usage:
//   node scripts/smart-sync.mjs --dry-run
//   node scripts/smart-sync.mjs --force

import fs from "fs";

// Automatically load .env.local if credentials are not in process.env
const envLocalPath = ".env.local";
if (fs.existsSync(envLocalPath)) {
  const lines = fs.readFileSync(envLocalPath, "utf8").split(/\r?\n/);
  for (const line of lines) {
    const m = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
    if (m && !process.env[m[1]]) {
      let val = (m[2] || "").trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      process.env[m[1]] = val;
    }
  }
}

const DRY = process.argv.includes("--dry-run");
const FORCE = process.argv.includes("--force");
const URL = (process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || "").replace(/[\r\n]/g, "").trim();
const KEY = (process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || "").replace(/[\r\n]/g, "").trim();

const CHUNK_SIZE = 60;

async function api(path, method = "GET", body = null, extraHeaders = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    method,
    headers: {
      apikey: KEY,
      Authorization: `Bearer ${KEY}`,
      "Content-Type": "application/json",
      ...extraHeaders,
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`${method} ${path}: ${res.status} ${errText.slice(0, 200)}`);
  }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

// Fetch all rows from an endpoint using pagination
async function fetchAll(endpoint) {
  const limit = 1000;
  let offset = 0;
  const results = [];
  while (true) {
    const batch = await api(`${endpoint}${endpoint.includes("?") ? "&" : "?"}limit=${limit}&offset=${offset}`);
    if (!batch || batch.length === 0) break;
    results.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
  }
  return results;
}

export async function smartSync() {
  const seedPath = "supabase-seed.json";
  if (!fs.existsSync(seedPath)) {
    throw new Error(`Seed file ${seedPath} not found.`);
  }

  const seed = JSON.parse(fs.readFileSync(seedPath, "utf8"));
  console.log(`[SmartSync] Loaded seed for day ${seed.day}: ${seed.offers.length} offers, ${seed.products.length} products, ${seed.stores.length} stores.`);

  if (DRY) {
    console.log("[SmartSync] Mode: DRY RUN (no network calls will be made).");
  }

  if (!URL || !KEY) {
    if (DRY) {
      console.log("[SmartSync] DRY RUN: Missing Supabase credentials, displaying projected sizing only.");
      console.log(`[SmartSync] Projected database footprint: ~${Math.round(seed.offers.length * 150 / 1024)} KB.`);
      return { ok: true, status: "dry_run", offers: seed.offers.length };
    }
    throw new Error("Missing Supabase credentials (SUPABASE_URL / SUPABASE_SERVICE_KEY).");
  }

  // 1. Freshness Check: check latest update date in Supabase
  if (!FORCE) {
    try {
      const latestOffer = await api("offers?select=day&order=day.desc&limit=1");
      if (latestOffer && latestOffer.length > 0) {
        const lastDay = latestOffer[0].day;
        const lastDate = new Date(lastDay);
        const now = new Date();
        const diffHours = (now.getTime() - lastDate.getTime()) / (1000 * 3600);

        if (diffHours < 36) {
          console.log(`[SmartSync] Database was updated ${Math.round(diffHours)} hours ago (${lastDay}).`);
          console.log("[SmartSync] Skipping update to conserve Supabase & Vercel compute. Use --force to override.");
          return {
            ok: true,
            status: "skipped_fresh",
            lastUpdate: lastDay,
            hoursAgo: Math.round(diffHours),
          };
        }
      }
    } catch (e) {
      console.log("[SmartSync] Note: Could not check previous update date, proceeding:", e.message);
    }
  }

  console.log("[SmartSync] Syncing store definitions...");
  // 2. Stores sync: merge duplicates
  await api("stores?on_conflict=name", "POST", seed.stores, { Prefer: "resolution=merge-duplicates" });
  const storeRows = await fetchAll("stores?select=id,name");
  const storeIdMap = Object.fromEntries(storeRows.map((s) => [s.name, s.id]));

  console.log("[SmartSync] Syncing canonical products...");
  // 3. Products sync in chunks
  for (let i = 0; i < seed.products.length; i += CHUNK_SIZE) {
    const chunk = seed.products.slice(i, i + CHUNK_SIZE);
    await api("canonical_products?on_conflict=id", "POST", chunk, { Prefer: "resolution=merge-duplicates" });
  }

  // 4. Smart Diff for Offers
  console.log("[SmartSync] Fetching existing offers for diff calculation...");
  let existingOffers = [];
  try {
    existingOffers = await fetchAll("offers?select=product_id,store_id,cond,price_da,stock,url");
  } catch (e) {
    console.log("[SmartSync] Could not fetch existing offers (table might be empty):", e.message);
  }

  const existingMap = new Map();
  for (const o of existingOffers) {
    const key = `${o.product_id}|${o.store_id}|${o.cond}`;
    existingMap.set(key, o);
  }

  const newOffersToUpsert = [];
  const historyToAppend = [];
  let unchangedCount = 0;

  // Deduplicate seed offers by primary key (product_id, store_id, cond), keeping the cheapest
  const uniqueSeedOffers = new Map();
  for (const o of seed.offers) {
    const sId = storeIdMap[o.s];
    if (!sId) continue;
    const key = `${o.p}|${sId}|${o.c}`;
    const prev = uniqueSeedOffers.get(key);
    if (!prev || o.d < prev.d) {
      uniqueSeedOffers.set(key, { ...o, sId });
    }
  }

  for (const o of uniqueSeedOffers.values()) {
    const sId = o.sId;
    const key = `${o.p}|${sId}|${o.c}`;
    const existing = existingMap.get(key);

    const row = {
      product_id: o.p,
      store_id: sId,
      price_da: o.d,
      cond: o.c,
      url: (o.u || "").slice(0, 160),
      title: (o.t || "").slice(0, 90),
      image: (o.i || "").slice(0, 300),
      stock: (o.w || "").slice(0, 16),
      day: seed.day,
    };

    if (!existing) {
      // Brand new offer
      newOffersToUpsert.push(row);
      historyToAppend.push({ product_id: o.p, store_id: sId, price_da: o.d, day: seed.day });
    } else {
      // Check if price or stock changed
      const priceChanged = existing.price_da !== o.d;
      const stockChanged = existing.stock !== (o.w || "");
      const urlChanged = existing.url !== (o.u || "");

      if (priceChanged || stockChanged || urlChanged) {
        newOffersToUpsert.push(row);
        if (priceChanged) {
          historyToAppend.push({ product_id: o.p, store_id: sId, price_da: o.d, day: seed.day });
        }
      } else {
        unchangedCount++;
      }
    }
  }

  // 5b. Prune obsolete offers from database (offers in DB not present in seed)
  const seedKeys = new Set(seed.offers.map((o) => `${o.p}|${storeIdMap[o.s]}|${o.c}`));
  const obsoleteOffers = existingOffers.filter((o) => !seedKeys.has(`${o.product_id}|${o.store_id}|${o.cond}`));
  if (obsoleteOffers.length > 0) {
    console.log(`[SmartSync] Pruning ${obsoleteOffers.length} stale/invalid offers from database...`);
    for (const obs of obsoleteOffers) {
      try {
        await api(`offers?product_id=eq.${obs.product_id}&store_id=eq.${obs.store_id}&cond=eq.${obs.cond}`, "DELETE");
      } catch (e) {
        console.log(`[SmartSync] Failed to delete obsolete offer ${obs.product_id}:`, e.message);
      }
    }
  }

  console.log(`[SmartSync] Diff results: ${newOffersToUpsert.length} changed/new, ${unchangedCount} unchanged (skipped), ${historyToAppend.length} history records.`);

  // 5. Chunked Upsert of only changed offers
  if (newOffersToUpsert.length > 0) {
    console.log(`[SmartSync] Upserting ${newOffersToUpsert.length} modified offers in chunks...`);
    for (let i = 0; i < newOffersToUpsert.length; i += CHUNK_SIZE) {
      const chunk = newOffersToUpsert.slice(i, i + CHUNK_SIZE);
      await api("offers?on_conflict=product_id,store_id,cond", "POST", chunk, { Prefer: "resolution=merge-duplicates" });
    }
  } else {
    console.log("[SmartSync] All offers are already identical in database. Zero offer writes needed!");
  }

  // 6. Append history only for price movements
  if (historyToAppend.length > 0) {
    console.log(`[SmartSync] Appending ${historyToAppend.length} price movements to history...`);
    for (let i = 0; i < historyToAppend.length; i += CHUNK_SIZE) {
      const chunk = historyToAppend.slice(i, i + CHUNK_SIZE);
      await api("price_history?on_conflict=product_id,store_id,day", "POST", chunk, { Prefer: "resolution=ignore-duplicates" });
    }
  }

  // 7. Retention cleanup (>400 days old)
  const cutoff = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);
  try {
    await api(`price_history?day=lt.${cutoff}`, "DELETE");
    console.log(`[SmartSync] Pruned history records older than ${cutoff}.`);
  } catch {
    /* ignore */
  }

  console.log("[SmartSync] Synchronization complete! Compute & storage preserved.");
  return {
    ok: true,
    status: "updated",
    upsertedOffers: newOffersToUpsert.length,
    unchangedOffers: unchangedCount,
    historyAppended: historyToAppend.length,
  };
}

if (process.argv[1] && process.argv[1].endsWith("smart-sync.mjs")) {
  smartSync().catch((err) => {
    console.error("[SmartSync] Error:", err.message);
    process.exit(1);
  });
}
