// Builds supabase-seed.json from baked files (no re-scrape).
// Usage: node scripts/seed-from-live.cjs
const fs = require("fs");

const WILAYA = { "LICB+": "Alger", "Click-DZ": "Alger", Digitec: "Alger", WifiDjelfa: "Djelfa", KOTEK: "Alger", GamingDZ: "Sétif", GigaStore: "Oran", Informatics: "Boumerdes", Lahlou: "Alger", HardSoft: "Oran", Campus: "Alger", KhabirTech: "M'sila", DeskCom: "Oran", NextGen: "Sétif", Ouedkniss: "Alger" };
const CPU_LAPTOP = /laptop|notebook|12400h|12400u|5600h|5600u/i;

function parseObjLine(line) {
  // { key: "str", key2: 123 } -> JSON (keys are bare identifiers, values JSON).
  // Key-quoting runs OUTSIDE string literals only: titles like
  // "( Up to R:4850 , W:3600)" contain ", W:" which is not a key.
  // (Split respects backslash escapes: titles like 2.5\" MAGMA carry \"
  // which must not toggle the in/out-of-string tracking. JSON.parse consumes
  // the escapes natively on the rejoined string.)
  const parts = line.trim().replace(/,$/, "").split(/(?<!\\)"/);
  for (let i = 0; i < parts.length; i += 2) {
    parts[i] = parts[i].replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
  }
  return JSON.parse(parts.join('"'));
}

function stockFlag(t) {
  const s = String(t || "");
  if (/rupture|out of stock|sold out|puis|indisponible/i.test(s)) return "out";
  if (/en stock|^in stock/i.test(s)) return "in";
  return "";
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
  // Availability first, price second: an in-stock offer beats a cheaper
  // rupture one; unknown stock sits between. (Stale rupture rows used to win
  // the seed on price alone and poison best-deal displays.)
  const stockRank = (o) => { const f = stockFlag(o.stock); return f === "in" ? 0 : f === "" ? 1 : 2; };
  for (const o of all) {
    if (!o.productId || !o.store) continue;
    // laptop-CPU guard (new bake rule, applied retroactively)
    if (prodCat[o.productId] === "cpu" && /laptop|notebook|12400h|12400u|5600h|5600u/i.test(o.titleRaw || "")) continue;
    const key = o.productId + "|" + o.store + "|" + o.condition;
    const cur = best.get(key);
    if (!cur || stockRank(o) < stockRank(cur) || (stockRank(o) === stockRank(cur) && o.priceDa < cur.priceDa)) best.set(key, o);
  }
  const liSrc = fs.readFileSync("lib/data/live-images.ts", "utf8");
  const localImg = Object.fromEntries([...liSrc.matchAll(/"([^"]+)":\s*"([^"]+)"/g)].map((m) => [m[1], m[2]]));
  const offers = [...best.values()].map((o) => ({
    p: o.productId, s: o.store, d: o.priceDa, c: o.condition === "used" ? 0 : 1,
    u: (o.url || "").slice(0, 160), t: (o.titleRaw || "").slice(0, 90),
    i: ((o.image || localImg[o.productId]) || "").slice(0, 300), w: stockFlag(o.stock),
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
