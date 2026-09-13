// Backfills offers.image + offers.stock from the generated upd_*.sql chunks.
// Usage: node scripts/backfill-images-stock.mjs [--dry-run]
// Reads SUPABASE creds from .env.local (never commit that file).
// Upserts in 100-row batches via PostgREST merge-duplicates (idempotent).
import fs from "fs";

const DRY = process.argv.includes("--dry-run");
const ROOT = new URL("../", import.meta.url).pathname.replace(/^\//, "") + "/";

function loadEnv() {
  const env = {};
  for (const line of fs.readFileSync(ROOT + ".env.local", "utf8").split(/\r?\n/)) {
    const i = line.indexOf("=");
    if (i > 0) env[line.slice(0, i).trim()] = line.slice(i + 1).trim();
  }
  return env;
}

// Parse (...) VALUES rows from an upd_*.sql chunk file.
function parseChunk(path) {
  const s = fs.readFileSync(path, "utf8");
  const body = s.slice(s.indexOf("(VALUES\n") + 8, s.lastIndexOf("\n) AS v("));
  const rows = [];
  const re = /'((?:''|[^'])*)','((?:''|[^'])*)',(\d+),'((?:''|[^'])*)'/g;
  let m;
  while ((m = re.exec(body)) !== null) {
    rows.push({
      p: m[1].replace(/''/g, "'"),
      s: m[2].replace(/''/g, "'"),
      c: Number(m[3]),
      v: m[4].replace(/''/g, "'"),
    });
  }
  return rows;
}

async function main() {
  const env = loadEnv();
  const URL = env.NEXT_PUBLIC_SUPABASE_URL || "";
  const KEY = env.SUPABASE_SERVICE_ROLE_KEY || "";
  if (!URL || !KEY) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY in .env.local");

  const api = async (path, method, body, extra = {}) => {
    const r = await fetch(`${URL}/rest/v1/${path}`, {
      method,
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...extra },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${(await r.text()).slice(0, 300)}`);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  };

  // Merge image + stock chunks by key (later files overwrite; values identical on overlap).
  const data = new Map();
  const imgFiles = fs.readdirSync(ROOT).filter((f) => /^upd_img_.*\.sql$/.test(f)).sort();
  const stockFiles = fs.readdirSync(ROOT).filter((f) => /^upd_stock_.*\.sql$/.test(f)).sort();
  for (const f of imgFiles)
    for (const r of parseChunk(ROOT + f)) {
      const k = `${r.p}|${r.s}|${r.c}`;
      if (!data.has(k)) data.set(k, {});
      data.get(k).image = r.v;
    }
  for (const f of stockFiles)
    for (const r of parseChunk(ROOT + f)) {
      const k = `${r.p}|${r.s}|${r.c}`;
      if (!data.has(k)) data.set(k, {});
      data.get(k).stock = r.v;
    }
  console.log(`chunks: img=${imgFiles.length} stock=${stockFiles.length} keys=${data.size}`);

  const storeRows = await api("stores?select=id,name", "GET");
  const sid = Object.fromEntries(storeRows.map((s) => [s.name, s.id]));
  // Full rows: merge-duplicates upserts INSERT first, so every NOT NULL
  // column must be present (values identical to DB for existing columns).
  const seed = JSON.parse(fs.readFileSync(ROOT + "supabase-seed.json", "utf8"));
  const seedByKey = new Map(seed.offers.map((o) => [`${o.p}|${o.s}|${o.c}`, o]));
  const rows = [];
  for (const [k, v] of data) {
    const [p, s, c] = k.split("|");
    if (!sid[s]) throw new Error(`unknown store ${s}`);
    const sd = seedByKey.get(k);
    if (!sd) throw new Error(`key missing from seed: ${k}`);
    rows.push({
      product_id: p, store_id: sid[s], price_da: sd.d, cond: sd.c,
      url: sd.u, title: sd.t, day: seed.day,
      image: v.image ?? "", stock: v.stock ?? "",
    });
  }
  console.log(`payload rows=${rows.length}`);

  if (DRY) {
    console.log("DRY RUN — no network writes.");
    return;
  }
  const N = 100;
  for (let i = 0; i < rows.length; i += N) {
    const batch = rows.slice(i, i + N);
    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await api("offers?on_conflict=product_id,store_id,cond", "POST", batch, {
          Prefer: "resolution=merge-duplicates,return=minimal",
        });
        lastErr = null;
        break;
      } catch (e) {
        lastErr = e;
        await new Promise((r) => setTimeout(r, 1500 * attempt));
      }
    }
    if (lastErr) throw lastErr;
    console.log(`upserted ${Math.min(i + N, rows.length)}/${rows.length}`);
  }

  // Full audit straight from the DB.
  const all = [];
  for (let from = 0; ; from += 1000) {
    const page = await api(`offers?select=product_id,image,stock&order=product_id&limit=1000&offset=${from}`, "GET");
    if (!page.length) break;
    all.push(...page);
    if (page.length < 1000) break;
  }
  const audit = {
    total: all.length,
    imageFilled: all.filter((o) => o.image).length,
    stockIn: all.filter((o) => o.stock === "in").length,
    stockOut: all.filter((o) => o.stock === "out").length,
    stockUnknown: all.filter((o) => !o.stock).length,
  };
  console.log("AUDIT " + JSON.stringify(audit));
  if (audit.total !== 1153 || audit.imageFilled !== 1153) throw new Error("AUDIT MISMATCH");
  console.log("BACKFILL OK");
}

main().catch((e) => {
  console.error("BACKFILL FAILED:", e.message);
  process.exit(1);
});
