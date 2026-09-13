// Pushes supabase-seed.json (from bake.cjs) to Supabase via PostgREST. ZERO deps (Node 20+ fetch).
// Usage:
//   node scripts/push-supabase.mjs --dry-run                 (no network, prints sizing)
//   $env:SUPABASE_URL="https://xyz.supabase.co"; $env:SUPABASE_SERVICE_KEY="..."; node scripts/push-supabase.mjs
import fs from "fs";

const DRY = process.argv.includes("--dry-run");
const URL = process.env.SUPABASE_URL || "";
const KEY = process.env.SUPABASE_SERVICE_KEY || "";

async function main() {
  const seed = JSON.parse(fs.readFileSync("supabase-seed.json", "utf8"));
  const bytes = fs.statSync("supabase-seed.json").size;
  console.log(`seed: ${seed.offers.length} offers, ${seed.products.length} products, ${seed.stores.length} stores, day ${seed.day}, file ${Math.round(bytes / 1024)}KB`);

  // steady-state math for 500MB free tier
  const histRowsYear = seed.products.length * seed.stores.length * 365;
  const histMBYear = (histRowsYear * 90) / 1048576;
  console.log(`history growth: ~${histRowsYear.toLocaleString()} rows/yr ~= ${histMBYear.toFixed(1)}MB/yr (400-day retention => steady ~${(histMBYear * 400 / 365).toFixed(1)}MB)`);

  if (DRY) {
    console.log("DRY RUN — no network. Set SUPABASE_URL + SUPABASE_SERVICE_KEY to push.");
    return;
  }
  if (!URL || !KEY) throw new Error("Missing SUPABASE_URL / SUPABASE_SERVICE_KEY env vars.");

  const api = async (path, method, body, extra = {}) => {
    const r = await fetch(`${URL}/rest/v1/${path}`, {
      method,
      headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, "Content-Type": "application/json", ...extra },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!r.ok) throw new Error(`${method} ${path}: ${r.status} ${(await r.text()).slice(0, 200)}`);
    const t = await r.text();
    return t ? JSON.parse(t) : null;
  };

  // 1. stores upsert -> id map
  await api("stores", "POST", seed.stores, { Prefer: "resolution=merge-duplicates" });
  const storeRows = await api(`stores?select=id,name`, "GET");
  const sid = Object.fromEntries(storeRows.map((s) => [s.name, s.id]));
  console.log("stores mapped:", Object.keys(sid).length);

  // 2. products upsert (id-keyed; merge duplicates needs onConflict)
  await api("canonical_products", "POST", seed.products, { Prefer: "resolution=merge-duplicates" });
  console.log("products upserted:", seed.products.length);

  // 3. offers snapshot upsert
  const offers = seed.offers.map((o) => ({
    product_id: o.p, store_id: sid[o.s], price_da: o.d, cond: o.c, url: o.u, title: o.t, day: seed.day,
    image: o.i ?? "", stock: o.w ?? "",
  })).filter((o) => o.store_id);
  await api("offers?on_conflict=product_id,store_id,cond", "POST", offers, { Prefer: "resolution=merge-duplicates" });
  console.log("offers upserted:", offers.length);

  // 4. history append (ignore dupes if re-run same day)
  const hist = offers.map(({ product_id, store_id, price_da }) => ({ product_id, store_id, price_da, day: seed.day }));
  await api("price_history", "POST", hist, { Prefer: "resolution=ignore-duplicates" });
  console.log("history rows appended:", hist.length);

  // 5. retention prune (>400 days)
  const cutoff = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);
  await api(`price_history?day=lt.${cutoff}`, "DELETE");
  console.log("pruned history older than", cutoff);
  console.log("PUSH OK");
}

main().catch((e) => { console.error("PUSH FAILED:", e.message); process.exit(1); });
