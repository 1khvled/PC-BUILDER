// Builds supabase-seed.json from baked files (no re-scrape).
// Usage: node scripts/seed-from-live.cjs
const fs = require("fs");

const WILAYA = { "LICB+": "Alger", "Click-DZ": "Alger", Digitec: "Alger", WifiDjelfa: "Djelfa", KOTEK: "Alger", GamingDZ: "Sétif", GigaStore: "Oran", Informatics: "Boumerdes", Lahlou: "Alger", HardSoft: "Oran", Campus: "Alger", KhabirTech: "M'sila" };
const CPU_LAPTOP = /laptop|notebook|12400h|12400u|5600h|5600u/i;

function parseObjLine(line) {
  // { key: "str", key2: 123 } -> JSON (keys are bare identifiers, values JSON)
  const json = line.trim().replace(/,$/, "").replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
  return JSON.parse(json);
}

function main() {
  const live = fs.readFileSync("lib/data/live.ts", "utf8");
  const liveBlock = live.split("LIVE_OFFERS: Offer[] = [")[1].split("];")[0];
  const liveOffers = liveBlock.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("{")).map(parseObjLine);

  const prodSrc = fs.readFileSync("lib/data/products.ts", "utf8");
  const day = new Date().toISOString().slice(0, 10);
  const seedOffers = prodSrc.split("\n")
    .map((l) => l.trim())
    .filter((l) => l.startsWith("{ productId:"))
    .map((l) => parseObjLine(l.replace(/new Date\(\)\.toISOString\(\)/g, `"${day}T00:00:00.000Z"`)));

  const products = [...prodSrc.matchAll(/\{ id: "([^"]+)", category: "([^"]+)", brand: "([^"]+)", model: "([^"]+)"/g)]
    .map((m) => ({ id: m[1], category: m[2], brand: m[3], model: m[4] }));
  console.log(`parsed: live=${liveOffers.length} seedSrc=${seedOffers.length}`);
  const prodCat = Object.fromEntries(products.map((p) => [p.id, p.category]));

  const all = [...seedOffers, ...liveOffers];
  // DB rule: ONE row per (product, store, condition) = the lowest price. Mission is lowest-price, not archives.
  const best = new Map();
  for (const o of all) {
    if (!o.productId || !o.store) continue;
    // laptop-CPU guard (new bake rule, applied retroactively)
    if (prodCat[o.productId] === "cpu" && /laptop|notebook|12400h|12400u|5600h|5600u/i.test(o.titleRaw || "")) continue;
    const key = o.productId + "|" + o.store + "|" + o.condition;
    if (!best.has(key) || o.priceDa < best.get(key).priceDa) best.set(key, o);
  }
  const offers = [...best.values()].map((o) => ({
    p: o.productId, s: o.store, d: o.priceDa, c: o.condition === "used" ? 0 : 1,
    u: (o.url || "").slice(0, 160), t: (o.titleRaw || "").slice(0, 90),
  }));
  const seed = {
    scraped_at: new Date().toISOString(),
    day,
    products,
    stores: [...new Set(offers.map((o) => o.s))].map((s) => ({ name: s, wilaya: WILAYA[s] || "Alger" })),
    offers,
  };
  fs.writeFileSync("supabase-seed.json", JSON.stringify(seed));
  console.log(`products: ${products.length}, stores: ${seed.stores.length}, offers: ${offers.length}, seed KB: ${Math.round(Buffer.byteLength(JSON.stringify(seed)) / 1024)}`);
}
main();
