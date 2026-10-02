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

// Parse CLI flags
const argv = process.argv.slice(2);
function getArg(flag, defaultValue = null) {
  const idx = argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < argv.length) return argv[idx + 1];
  return defaultValue;
}
const hasFlag = (flag) => argv.includes(flag);

const MAX_AGE_DAYS = parseInt(getArg("--max-days", "90"), 10); // 3 months
const LIMIT_STORES = getArg("--limit") ? parseInt(getArg("--limit"), 10) : Infinity;
const ONLY_STORES = getArg("--stores") ? getArg("--stores").split(",").map(s => s.trim()) : [];
const AUTO_PUSH = hasFlag("--push");
const SKIP_STANDALONE = hasFlag("--skip-standalone");

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function normalizeAnnouncement(a, queryLabel = "sweep") {
  if (!a || !a.id) return null;

  const st = String(a.status || "").toUpperCase();
  if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") return null;

  // Strict Freshness: reject deals older than MAX_AGE_DAYS (90 days / 3 months default)
  const postDate = a.refreshedAt || a.createdAt;
  if (!postDate) return null;
  const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
  if (isNaN(ageDays) || ageDays > MAX_AGE_DAYS) return null;

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

async function fetchStorePage(storeId, page = 1) {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        query: QUERY,
        variables: { filter: { storeId: parseInt(storeId, 10), page, count: 48 } }
      }),
      signal: AbortSignal.timeout(12000)
    });
    if (!res.ok) return { items: [], hasMore: false, hitStale: false };
    const json = await res.json();
    const ann = json?.data?.search?.announcements;
    const rawItems = ann?.data || [];
    const hasMore = Boolean(ann?.paginatorInfo?.hasMorePages);

    let hitStale = false;
    const validOffers = [];
    for (const raw of rawItems) {
      const postDate = raw.refreshedAt || raw.createdAt;
      if (postDate) {
        const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
        if (ageDays > MAX_AGE_DAYS) {
          hitStale = true; // Hit stale threshold
          continue;
        }
      }
      const norm = normalizeAnnouncement(raw, `store:${storeId}`);
      if (norm) validOffers.push(norm);
    }

    return { items: validOffers, hasMore: hasMore && !hitStale, hitStale };
  } catch (err) {
    return { items: [], hasMore: false, hitStale: false };
  }
}

// Standalone Store: Blida Computer
async function sweepBlidaComputer() {
  console.log("\n[Standalone] Sweeping Blida Computer (blidacomputer.dz)...");
  const offers = [];
  try {
    const res = await fetch("https://blidacomputer.dz/wp-json/wc/store/v1/products?per_page=100&page=1", {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(15000)
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
    console.log(`  Blida Computer: ${offers.length} active live offers.`);
  } catch (err) {
    console.log(`  Blida Computer sweep error: ${err.message}`);
  }
  return offers;
}

// Standalone Store: Matos Gaming
async function sweepMatosGaming() {
  console.log("\n[Standalone] Sweeping Matos Gaming (matos-algerie.com)...");
  const offers = [];
  try {
    const res = await fetch("https://matos-algerie.com/wp-json/wc/store/v1/products?per_page=100", {
      headers: { "User-Agent": BROWSER_UA },
      signal: AbortSignal.timeout(15000)
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
    console.log(`  Matos Gaming: ${offers.length} active monitors/products.`);
  } catch (err) {
    console.log(`  Matos Gaming sweep error: ${err.message}`);
  }
  return offers;
}

async function main() {
  console.log("==========================================================");
  console.log(`DZ-PartPicker: Recurring Store Refresh Daemon`);
  console.log(`Freshness Rule: Max age ${MAX_AGE_DAYS} days (Stale ads auto-rejected & early-exited)`);
  console.log("==========================================================");

  // 1. Load Stores
  let stores = JSON.parse(fs.readFileSync("scripts/discovered-stores.json", "utf8"));
  if (ONLY_STORES.length > 0) {
    stores = stores.filter(s => ONLY_STORES.includes(String(s.id)));
  }
  if (Number.isFinite(LIMIT_STORES)) {
    stores = stores.slice(0, LIMIT_STORES);
  }
  console.log(`Targeting ${stores.length} stores for live sync...`);

  // 2. Load DB
  const full = JSON.parse(fs.readFileSync("full.json", "utf8"));
  if (!full.report) full.report = {};
  if (!Array.isArray(full.report["ouedkniss:all"])) full.report["ouedkniss:all"] = [];

  const initialCount = full.report["ouedkniss:all"].length;

  // Prune any legacy offers in full.json older than 3 months (90 days)
  const nowMs = Date.now();
  const maxMs = MAX_AGE_DAYS * 24 * 60 * 60 * 1000;
  const freshExisting = full.report["ouedkniss:all"].filter(o => {
    const d = o.postedAt || o.day;
    if (!d) return false;
    const age = nowMs - new Date(d).getTime();
    return !isNaN(age) && age <= maxMs;
  });
  console.log(`Cleaned up stale listings in full.json: ${initialCount} -> ${freshExisting.length} (pruned ${initialCount - freshExisting.length} old offers)`);

  const lookup = new Map();
  for (const o of freshExisting) {
    if (o.url) lookup.set(o.url, o);
  }

  // 3. Sweep Stores
  let newlyAdded = 0;
  let updatedCount = 0;

  for (let i = 0; i < stores.length; i++) {
    const s = stores[i];
    process.stdout.write(`[${i + 1}/${stores.length}] Store ${s.id} (${s.name}) ... `);
    let storeNew = 0;

    for (let page = 1; page <= 2; page++) {
      const { items, hasMore, hitStale } = await fetchStorePage(s.id, page);
      for (const item of items) {
        if (!lookup.has(item.url)) {
          lookup.set(item.url, item);
          freshExisting.push(item);
          storeNew++;
          newlyAdded++;
        } else {
          const ex = lookup.get(item.url);
          ex.priceDa = item.priceDa;
          ex.postedAt = item.postedAt;
          updatedCount++;
        }
      }
      if (hitStale || !hasMore) {
        // Stop paginating as soon as old items appear
        break;
      }
      await sleep(1200);
    }
    console.log(`+${storeNew} new fresh offers`);
    await sleep(800);
  }

  // 4. Standalone Stores
  if (!SKIP_STANDALONE) {
    const blida = await sweepBlidaComputer();
    for (const b of blida) {
      if (!lookup.has(b.url)) {
        lookup.set(b.url, b);
        freshExisting.push(b);
        newlyAdded++;
      }
    }
    const matos = await sweepMatosGaming();
    for (const m of matos) {
      if (!lookup.has(m.url)) {
        lookup.set(m.url, m);
        freshExisting.push(m);
        newlyAdded++;
      }
    }
  }

  // 5. Save full.json
  full.report["ouedkniss:all"] = freshExisting;
  fs.writeFileSync("full.json", JSON.stringify(full));
  console.log("\n==========================================================");
  console.log(`Refresh Finished: ${freshExisting.length} verified fresh offers (<= ${MAX_AGE_DAYS} days)`);
  console.log(`Newly added: ${newlyAdded}, Refreshed: ${updatedCount}`);
  console.log("==========================================================");

  // 6. Bake & Push if requested
  if (AUTO_PUSH) {
    console.log("\nBaking fresh catalog...");
    execSync("node bake.cjs", { stdio: "inherit" });
    console.log("\nPushing to Supabase...");
    execSync("node scripts/push-supabase.mjs", { stdio: "inherit" });
    console.log("\nALL SYNCS COMPLETE.");
  }
}

main().catch(err => {
  console.error("Daemon error:", err);
  process.exit(1);
});
