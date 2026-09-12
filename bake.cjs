// Bakes full.json (live scrape) into lib/data/live.ts
// Usage: node bake.mjs  (reads full.json, writes lib/data/live.ts)
const fs = require("fs");

const full = JSON.parse(fs.readFileSync("full.json", "utf8"));
const report = full.report;

const WILAYA = { "LICB+": "Alger", "Click-DZ": "Alger", Digitec: "Alger", WifiDjelfa: "Djelfa", KOTEK: "Alger", GamingDZ: "Sétif", GigaStore: "Oran", Informatics: "Boumerdes", Lahlou: "Alger", HardSoft: "Oran", Campus: "Alger", KhabirTech: "M'sila" };
const NOW = new Date().toISOString();

// seed pairs win over live dupes (read from products.ts)
const src = fs.readFileSync("lib/data/products.ts", "utf8");
const seedPairs = new Set();
for (const m of src.matchAll(/productId:\s*"([^"]+)",\s*store:\s*"([^"]+)"/g)) {
  seedPairs.add(m[1] + "|" + m[2]);
}

function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/12\s?go/g, "12gb").replace(/8\s?go/g, "8gb")
    .replace(/16\s?go/g, "16gb").replace(/32\s?go/g, "32gb")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}
function clean(s) {
  return (s || "")
    .replace(/�/g, "")
    .replace(/^\d(?=[A-HJ-Z][A-Z])/, "")
    .replace(/\s+/g, " ").trim();
}

// { id, cat, all[], any[], none[] } — match only within same category
const RULES = [
  { id: "cpu-r5-5600", cat: "cpu", all: ["ryzen", "5600"], none: ["5600g", "5600gt", "5600x", "5600f", "5600h", "5600u", "laptop", "notebook"] },
  { id: "cpu-i5-12400f", cat: "cpu", all: ["12400"], none: ["laptop", "notebook", "12400h", "12400u"] },
  { id: "cpu-r5-7600x", cat: "cpu", all: ["7600x"] },
  { id: "cpu-r5-9600x", cat: "cpu", all: ["9600x"] },
  { id: "cpu-r7-9800x3d", cat: "cpu", all: ["9800x3d"] },
  { id: "cooler-h212-v3", cat: "cooler", all: ["212"], any: ["hyper", "spectrum"] },
  { id: "mobo-b550m-a-pro", cat: "motherboard", all: ["msi", "b550"] },
  { id: "mobo-b660m-e", cat: "motherboard", all: ["b660"] },
  { id: "mobo-b650m", cat: "motherboard", all: ["b650"] },
  { id: "ram-vengeance-16-d4", cat: "ram", all: ["16gb", "ddr4"], none: ["32gb", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-delta-32-d5", cat: "ram", all: ["32gb", "ddr5"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ssd-970evo-1tb", cat: "ssd", all: ["970", "1tb"] },
  { id: "gpu-rtx3060-12gb", cat: "gpu", all: ["3060"], any: ["12gb"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx4060-8gb", cat: "gpu", all: ["4060"], none: ["laptop", "notebook", "portable", "ti", "super"] },
  { id: "gpu-rtx4070-12gb", cat: "gpu", all: ["4070"], none: ["laptop", "notebook", "portable", "ti", "super"] },
  { id: "gpu-rtx5070-12gb", cat: "gpu", all: ["5070"], none: ["laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rx580-8gb", cat: "gpu", all: ["rx 580"] },
  { id: "gpu-rtx5060-8gb", cat: "gpu", all: ["5060"], none: ["laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx5080-16gb", cat: "gpu", all: ["5080"] },
  { id: "case-v217", cat: "case", all: ["v217"] },
  { id: "psu-mwe650-b", cat: "psu", all: ["mwe", "650"] },
  { id: "mon-mag255f", cat: "monitor", all: ["255f"] },
];

const OK_CAT = { "rtx 3060": "gpu", "rtx 4060": "gpu", "rtx 4070": "gpu", "rx 580": "gpu", "ryzen 5 5600": "cpu", "i5 12400": "cpu", b550: "motherboard", "16gb ddr4": "ram", ddr5: "ram", "nvme 1tb": "ssd", "650w": "psu", "ecran 144hz": "monitor" };
// non-parts never stored as extras (keeps DB + bundle lean)
const EXTRA_JUNK = /laptop|notebook|macbook|printer|imprimante|scanner|projecteur|datashow|webcam|tablet|smartphone|console|manette/i;

function matchRule(category, title) {
  const t = " " + norm(title) + " ";
  const has = (tok) => t.includes(tok);
  for (const r of RULES) {
    if (r.cat !== category) continue;
    if (!(r.all || []).every(has)) continue;
    if (r.any && !r.any.some(has)) continue;
    if ((r.none || []).some(has)) continue;
    return r.id;
  }
  return null;
}

const matched = []; // Offer-shaped
const extras = [];
const seenExtra = new Set();

function pushExtra(category, e) {
  const key = category + "|" + e.store + "|" + e.title;
  if (seenExtra.has(key)) return;
  seenExtra.add(key);
  extras.push(e);
}

for (const [key, val] of Object.entries(report)) {
  if (key === "ouedkniss:all" || !val.offers || !Array.isArray(val.offers)) continue;
  const [store, category] = key.split("/");
  if (!store || !category || !WILAYA[store]) continue;
  let extraCount = 0;
  for (const o of val.offers) {
    const title = clean(o.title);
    if (!title || !o.priceDa) continue;
    const cond = /\bused\b|occasion|r[eé]cup[eé]ration/i.test(title) ? "used" : "new";
    const pid = matchRule(category, title);
    if (pid) {
      if (seedPairs.has(pid + "|" + store)) continue; // seed wins
      matched.push({ productId: pid, store, wilaya: WILAYA[store], titleRaw: title.slice(0, 120), priceDa: o.priceDa, url: o.url, stock: o.stock || "En stock", condition: cond, image: o.image || "", scrapedAt: NOW });
    } else if (!EXTRA_JUNK.test(title) && extraCount < 12) {
      extraCount++;
      pushExtra(category, { category, title: title.slice(0, 120), priceDa: o.priceDa, store, wilaya: WILAYA[store], url: o.url, image: o.image || "", condition: cond });
    }
  }
}

// ouedkniss
let okExtra = 0;
for (const o of report["ouedkniss:all"] || []) {
  const category = OK_CAT[o.query] || "gpu";
  const title = clean(o.title);
  if (!title || !o.priceDa) continue;
  const isNew = /neuf|new|blister|jamais|scell/i.test(title);
  // used 3060 cards still match the canonical 3060 product (condition used)
  const pid = matchRule(category, title) || (category === "gpu" && /3060/.test(norm(title)) ? "gpu-rtx3060-12gb" : null);
  if (pid) {
    matched.push({ productId: pid, store: "Ouedkniss", wilaya: o.wilaya || "DZ", titleRaw: title.slice(0, 120), priceDa: o.priceDa, url: o.url, stock: "Ouedkniss", condition: isNew ? "new" : "used", image: o.image || "", scrapedAt: NOW });
  } else if (!EXTRA_JUNK.test(title) && okExtra < 150) {
    okExtra++;
    pushExtra(category, { category, title: title.slice(0, 120), priceDa: o.priceDa, store: "Ouedkniss", wilaya: o.wilaya || "DZ", url: o.url, image: o.image || "", condition: isNew ? "new" : "used" });
  }
}

// cap 6 cheapest per canonical product (bundle size)
const byPid = new Map();
for (const m of matched) {
  if (!byPid.has(m.productId)) byPid.set(m.productId, []);
  byPid.get(m.productId).push(m);
}
const capped = [];
for (const arr of byPid.values()) {
  arr.sort((a, b) => a.priceDa - b.priceDa);
  capped.push(...arr.slice(0, 6));
}

const esc = (s) => JSON.stringify(s);
function offerSrc(o) {
  return `  { productId: ${esc(o.productId)}, store: ${esc(o.store)}, wilaya: ${esc(o.wilaya)}, titleRaw: ${esc(o.titleRaw)}, priceDa: ${o.priceDa}, url: ${esc(o.url)}, stock: ${esc(o.stock)}, condition: ${esc(o.condition)}, image: ${esc(o.image)}, scrapedAt: ${esc(o.scrapedAt)} },`;
}
function extraSrc(o) {
  return `  { category: ${esc(o.category)}, title: ${esc(o.title)}, priceDa: ${o.priceDa}, store: ${esc(o.store)}, wilaya: ${esc(o.wilaya)}, url: ${esc(o.url)}, image: ${esc(o.image)}, condition: ${esc(o.condition)} },`;
}

const out = `// AUTO-GENERATED by bake.mjs from live scrape (${NOW.slice(0, 10)}). Do not hand-edit.
import type { Offer } from "./products";

export interface LiveExtra {
  category: string;
  title: string;
  priceDa: number;
  store: string;
  wilaya: string;
  url: string;
  image: string;
  condition: "new" | "used";
}

export const SCRAPED_AT = ${esc(NOW)};
export const LIVE_PRODUCTS: Offer["productId"][] = [];
export const LIVE_OFFERS: Offer[] = [
${capped.map(offerSrc).join("\n")}
];
export const LIVE_EXTRA: LiveExtra[] = [
${extras.map(extraSrc).join("\n")}
];
`;
fs.writeFileSync("lib/data/live.ts", out);
// one photo per product: first matched STORE image (Ouedkniss last, often lazy/broken)
const imgSrc = {};
const ordered = [...matched.filter((m) => m.store !== "Ouedkniss"), ...matched.filter((m) => m.store === "Ouedkniss")];
for (const m of ordered) {
  if (m.image && !imgSrc[m.productId]) imgSrc[m.productId] = m.image;
}
fs.writeFileSync("lib/data/live-images-src.json", JSON.stringify(imgSrc, null, 1));
// compact Supabase seed (offers + one history snapshot; extras are re-scraped, never stored)
const prodSrc = fs.readFileSync("lib/data/products.ts", "utf8");
const seedProducts = [...prodSrc.matchAll(/\{ id: "([^"]+)", category: "([^"]+)", brand: "([^"]+)", model: "([^"]+)" }/g)]
  .map((m) => ({ id: m[1], category: m[2], brand: m[3], model: m[4] }));
const seed = {
  scraped_at: NOW,
  day: NOW.slice(0, 10),
  products: seedProducts,
  stores: [...new Set(capped.map((o) => o.store))].map((s) => ({ name: s, wilaya: WILAYA[s] || "Alger" })),
  offers: capped.map((o) => ({
    p: o.productId, s: o.store, d: o.priceDa, c: o.condition === "used" ? 0 : 1,
    u: o.url.slice(0, 160), t: o.titleRaw.slice(0, 90),
  })),
};
fs.writeFileSync("supabase-seed.json", JSON.stringify(seed));
const seedKB = Math.round(Buffer.byteLength(JSON.stringify(seed)) / 1024);
console.log("matched offers:", matched.length, "capped:", capped.length, "extras:", extras.length, "products hit:", byPid.size, "with photo:", Object.keys(imgSrc).length, "seed:", seedKB + "KB");
