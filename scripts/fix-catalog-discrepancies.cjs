const fs = require('fs');
const path = require('path');

console.log('--- 1. Patching lib/data/products.ts ---');
const prodPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
let prod = fs.readFileSync(prodPath, 'utf8');

const NEW_PRODUCTS = `  { id: "cooler-ac902k", category: "cooler", brand: "Raidmax", model: "AC902K ARGB", specs: { height_mm: 133, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "cooler-ag500", category: "cooler", brand: "DeepCool", model: "AG500 ARGB", specs: { height_mm: 157, sockets: ["AM4", "AM5", "LGA1700", "LGA1200"] } },
  { id: "case-haf500", category: "case", brand: "Cooler Master", model: "HAF 500", specs: { form_factor: "ATX", max_gpu_len_mm: 410 } },
  { id: "ssd-sn850x-2tb", category: "ssd", brand: "WD", model: "Black SN850X 2TB NVMe", specs: { interface: "NVME" } },
`;

if (!prod.includes('"cooler-ac902k"')) {
  prod = prod.replace(
    /(\{ id: "cooler-am1204"[^\n]+\n)/,
    `$1${NEW_PRODUCTS}`
  );
  fs.writeFileSync(prodPath, prod, 'utf8');
  console.log('Added cooler-ac902k, cooler-ag500, case-haf500, ssd-sn850x-2tb to products.ts');
}

console.log('--- 2. Patching lib/data/benchmarks.ts ---');
const benchPath = path.join(__dirname, '..', 'lib', 'data', 'benchmarks.ts');
let bench = fs.readFileSync(benchPath, 'utf8');

if (!bench.includes('"cooler-ac902k"')) {
  bench = bench.replace(
    /"cooler-am1204": \{ tdpRating: 135, kind: "air" \},/,
    `"cooler-am1204": { tdpRating: 135, kind: "air" },\n  "cooler-ac902k": { tdpRating: 110, kind: "air" },\n  "cooler-ag500": { tdpRating: 160, kind: "air" },`
  );
}

if (!bench.includes('"ssd-sn850x-2tb"')) {
  bench = bench.replace(
    /"ssd-sn850x-1tb": \{ seqRead: 7300, seqWrite: 6600, random4k: 1200, interface: "PCIe 4.0 x4" \},/,
    `"ssd-sn850x-1tb": { seqRead: 7300, seqWrite: 6600, random4k: 1200, interface: "PCIe 4.0 x4" },\n  "ssd-sn850x-2tb": { seqRead: 7300, seqWrite: 6600, random4k: 1200, interface: "PCIe 4.0 x4" },`
  );
}
fs.writeFileSync(benchPath, bench, 'utf8');
console.log('Updated benchmarks.ts with new cooler and ssd ratings');

console.log('--- 3. Patching bake.cjs ---');
const bakePath = path.join(__dirname, '..', 'bake.cjs');
let bake = fs.readFileSync(bakePath, 'utf8');

// Remove bogus rules
bake = bake.replace(/\s*\{\s*id:\s*"cooler-am1204",\s*cat:\s*"cooler",\s*all:\s*\["ac902k"\]\s*\},?/, '');
bake = bake.replace(/\s*\{\s*id:\s*"cooler-ag400",\s*cat:\s*"cooler",\s*all:\s*\["ag500"\]\s*\},?/, '');
bake = bake.replace(/\s*\{\s*id:\s*"case-masterbox",\s*cat:\s*"case",\s*all:\s*\["haf500"\]\s*\},?/, '');
bake = bake.replace(/\s*\{\s*id:\s*"case-masterbox",\s*cat:\s*"case",\s*all:\s*\["haf700"\]\s*\},?/, '');
bake = bake.replace(/\s*\{\s*id:\s*"case-gungnir",\s*cat:\s*"case",\s*all:\s*\["prospect"\]\s*\},?/, '');
bake = bake.replace(/\s*\{\s*id:\s*"cooler-ml360",\s*cat:\s*"cooler",\s*all:\s*\["pl360"\]\s*\},?/, '');

// Add clean rules for the new parts
const NEW_BAKE_RULES = `
  { id: "cooler-ac902k", cat: "cooler", any: ["ac902k", "ac902"], none: ["am1204"] },
  { id: "cooler-ag500", cat: "cooler", all: ["ag500"], none: ["ag400", "ak400"] },
  { id: "case-haf500", cat: "case", any: ["haf500", "haf 500", "haf700"] },
  { id: "ssd-sn850x-2tb", cat: "ssd", all: ["sn850x", "2tb"], none: ["laptop", "notebook"] },
`;

if (!bake.includes('"cooler-ac902k"')) {
  bake = bake.replace(
    /\{ id: "cooler-am1204", cat: "cooler", all: \["am1204"\] \},/,
    `{ id: "cooler-am1204", cat: "cooler", all: ["am1204"], none: ["ac902k", "ac902"] },${NEW_BAKE_RULES}`
  );
}

// In cooler-ag400 exclude ag500
bake = bake.replace(
  /\{ id: "cooler-ag400", cat: "cooler", all: \["ag400"\] \},/,
  `{ id: "cooler-ag400", cat: "cooler", all: ["ag400"], none: ["ag500", "ag620", "ak500", "ak620"] },`
);

// In case-masterbox exclude haf
bake = bake.replace(
  /\{ id: "case-masterbox", cat: "case", all: \["mb520"\] \},/,
  `{ id: "case-masterbox", cat: "case", all: ["mb520"], none: ["haf", "haf500", "haf700"] },`
);

// In ssd-sn850x-1tb exclude 2tb
bake = bake.replace(
  /\{ id: "ssd-sn850x-1tb", cat: "ssd", all: \["sn850"\][^}]*\},/,
  `{ id: "ssd-sn850x-1tb", cat: "ssd", all: ["sn850"], none: ["2tb", "4tb", "laptop", "notebook"] },`
);

// In ssd-sata-512gb exclude 2tb
bake = bake.replace(
  /\{ id: "ssd-sata-512gb", cat: "ssd", all: \["s750"\][^}]*\},/,
  `{ id: "ssd-sata-512gb", cat: "ssd", all: ["s750"], none: ["1tb", "2tb", "nvme", "laptop", "notebook"] },`
);

fs.writeFileSync(bakePath, bake, 'utf8');
console.log('bake.cjs successfully patched and sanitized!');
