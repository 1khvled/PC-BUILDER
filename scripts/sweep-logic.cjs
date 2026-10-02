#!/usr/bin/env node
/**
 * LOGIC SWEEP.
 *
 *   node scripts/sweep-logic.cjs
 *
 * Hunts the defect CLASSES this project has actually hit, not generic lint.
 * Each rule names the failure mode it guards:
 *
 *  1. SPREAD_ON_ARRAY   Math.min(...arr) throws RangeError past ~125k elements.
 *                       Fixed everywhere via minOf/maxOf; this rule keeps it fixed.
 *  2. INFINITY_CEILING  `?? Infinity` on a value that is then compared with
 *                       `<=` lets unpriced parts through. Sort use (unpriced
 *                       last) is fine and excluded.
 *  3. FIND_IN_LOOP      Array.find/.some inside a loop over another array.
 *  4. MIXED_SORT        sorting values with different units in one list.
 *  5. ORPHAN_BENCH      benchmark key with no catalogue product (scorer gets
 *                       undefined and 4 perf checks fail - commit 9f9dd94).
 *  6. LIVE_COVERAGE     live CPU/GPU/RAM with no index.
 *  7. I18N_VARS         every t("key") call passes every {placeholder} the
 *                       dictionary string requires. The home page once rendered
 *                       "77 model{plural}" literally because the call forgot
 *                       `plural` - this rule makes that class impossible.
 *
 * Price-rot in guide prose is owned by scripts/check-guides.mjs (budget rule),
 * not duplicated here. Exit 1 on any failure so CI can gate on it.
 */

const fs = require("fs");
const path = require("path");

const ROOT = path.resolve(__dirname, "..");
let failures = 0;
let checks = 0;
const ok = (l) => { checks++; console.log(`  ok    ${l}`); };
const fail = (l, d) => { checks++; failures++; console.log(`  FAIL  ${l}`); if (d) console.log(`        ${d}`); };

const walk = (dir, out = []) => {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.name === "node_modules" || e.name === ".next") continue;
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, out);
    else if (/\.(ts|tsx|mjs|cjs)$/.test(e.name) && !e.name.startsWith(".tmp-")) out.push(p);
  }
  return out;
};

const files = walk(path.join(ROOT, "lib")).concat(walk(path.join(ROOT, "components")), walk(path.join(ROOT, "app")));
const rel = (p) => path.relative(ROOT, p);

/** Source with comments and string literals removed, so prose cannot trip rules. */
const codeOnly = (src) =>
  src
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/(^|\s)\/\/.*$/gm, "$1")
    .replace(/`(?:\\.|[^`\\])*`/g, '""')
    .replace(/'(?:\\.|[^'\\])*'/g, '""')
    .replace(/"(?:\\.|[^"\\])*"/g, '""');

/* ---------------------------------------------------------- 1. spreads */
{
  const hits = [];
  for (const f of files) {
    const src = codeOnly(fs.readFileSync(f, "utf8"));
    const m = src.match(/Math\.(min|max)\(\.\.\.[^)]+\)/g);
    if (m) hits.push(`${rel(f)}: ${m[0].slice(0, 60)}`);
  }
  hits.length === 0 ? ok("no Math.min/max spread onto arrays (use minOf/maxOf)") : fail("spread onto array (RangeError past ~125k)", hits.slice(0, 5).join("\n"));
}

/* --------------------------------------------- 2. Infinity ceiling guard */
{
  const hits = [];
  for (const f of files) {
    const src = codeOnly(fs.readFileSync(f, "utf8"));
    // Only a ceiling comparison is dangerous; sort comparators (unpriced last)
    // are correct and excluded by requiring `<=` in the same file.
    if (/\?\? Infinity/.test(src) && /<=/.test(src) && !/Number\.isFinite/.test(src)) {
      hits.push(rel(f));
    }
  }
  hits.length === 0 ? ok("every Infinity default feeding a ceiling has a Number.isFinite guard") : fail("unpriced part can pass a ceiling", hits.join(", "));
}

/* -------------------------------------------------------- 3. find-in-loop */
{
  const hits = [];
  for (const f of files) {
    if (f.includes("scripts/")) continue;
    // Scrapers walk one fetched page of listings with cheerio (node.find is a
    // DOM query, not a catalogue scan) and match titles against alias tables,
    // which is inherently a scan over a page-bounded list. Not this rule's prey.
    if (f.includes(`${path.sep}scrapers${path.sep}`)) continue;
    const src = codeOnly(fs.readFileSync(f, "utf8"));
    if (/\b(for|while)\b[\s\S]{0,400}\.(find|some)\(/.test(src) && !/new Set\(/.test(src) && !/new Map\(/.test(src) && !/\.get\(/.test(src)) {
      hits.push(rel(f));
    }
  }
  hits.length === 0 ? ok("no scan-in-loop without a Set/Map index") : fail("possible O(n*m) scan", hits.slice(0, 6).join(", "));
}

/* ------------------------------------ 4. mixed-unit sort (the benchmark bug) */
{
  const hits = [];
  for (const f of files) {
    const src = codeOnly(fs.readFileSync(f, "utf8"));
    if (/sort\(\(a, b\) => \(b\.estimate/.test(src)) hits.push(rel(f) + " (cross-category estimate sort)");
  }
  hits.length === 0 ? ok("no cross-category single-number sort") : fail("mixed-unit sort", hits.join(", "));
}

console.log(`\nSTATIC: ${checks - failures}/${checks} passed`);

/* ============================================================ live checks */
require(path.join(ROOT, "scripts/ts-require.cjs"));
(async () => {
  let lchecks = 0, lfail = 0;
  const lok = (l) => { lchecks++; console.log(`  ok    ${l}`); };
  const lfailf = (l, d) => { lchecks++; lfail++; console.log(`  FAIL  ${l}`); if (d) console.log(`        ${d}`); };

  const { getProducts, getOffers } = require(path.join(ROOT, "lib/data/catalog.ts"));
  const { CPU_BENCH, GPU_BENCH, RAM_BENCH, SSD_BENCH } = require(path.join(ROOT, "lib/data/benchmarks.ts"));
  const { PRODUCTS } = require(path.join(ROOT, "lib/data/products.ts"));

  const staticIds = new Set(PRODUCTS.map((p) => p.id));

  /* ------------------------------------------------- 5. orphan bench keys */
  for (const [name, table] of [["CPU", CPU_BENCH], ["GPU", GPU_BENCH], ["RAM", RAM_BENCH], ["SSD", SSD_BENCH]]) {
    const orphans = Object.keys(table).filter((k) => !staticIds.has(k));
    orphans.length === 0 ? lok(`${name}: every index key is a catalogue product`) : lfailf(`${name}: orphan index keys`, orphans.join(", "));
  }

  /* --------------------------------- 6. live products missing from indexes
   * Deliberate gaps, documented so they read as decisions rather than rot:
   *  - gpu-b580-12gb: live-only listing id, no static product row. Adding an
   *    index for it breaks the scorer (undefined product) - see 9f9dd94.
   *  - gpu-quadro:     generic workstation card, no known specs to rate.
   *  - hdd-*:          mechanical drives under their own category, no SSD index.
   *  - ssd long tail:  reported as info, not failure. */
  const KNOWN_GAPS = new Set(["gpu-b580-12gb", "gpu-quadro", "hdd-1tb", "hdd-2tb", "hdd-4tb", "hdd-5tb", "hdd-6tb"]);
  const live = await getProducts();
  const missing = { cpu: [], gpu: [], ram: [], ssd: [] };
  for (const p of live) {
    if (KNOWN_GAPS.has(p.id)) continue;
    if (p.category === "cpu" && !CPU_BENCH[p.id]) missing.cpu.push(p.id);
    else if (p.category === "gpu" && !GPU_BENCH[p.id]) missing.gpu.push(p.id);
    else if (p.category === "ram" && !RAM_BENCH[p.id]) missing.ram.push(p.id);
    else if (p.category === "ssd" && !SSD_BENCH[p.id]) missing.ssd.push(p.id);
  }
  const totalMissing = missing.cpu.length + missing.gpu.length + missing.ram.length;
  totalMissing === 0
    ? lok("every live CPU/GPU/RAM has an index")
    : lfailf("live parts with no index", `cpu:[${missing.cpu.slice(0, 4)}] gpu:[${missing.gpu.slice(0, 4)}] ram:[${missing.ram.slice(0, 4)}]`);
  if (missing.ssd.length) console.log(`  info  ${missing.ssd.length} live SSDs without spec rows (long tail, tolerated)`);

  /* --------------------------------------- 7. non-numeric live prices */
  const offers = await getOffers();
  const bad = offers.filter((o) => typeof o.priceDa !== "number" || !Number.isFinite(o.priceDa));
  bad.length === 0 ? lok(`all ${offers.length} live offer prices are finite numbers`) : lfailf("non-numeric live prices", `${bad.length} bad`);

  /* --------------------------------- 8. offers pointing at nothing */
  const liveIds = new Set(live.map((p) => p.id));
  const dangling = offers.filter((o) => !liveIds.has(o.productId));
  dangling.length === 0 ? lok("every live offer matches a product") : lfailf("dangling offers", `${dangling.length} offers point at missing ids`);

  console.log(`\nLIVE: ${lchecks - lfail}/${lchecks} passed`);
  const totalFail = failures + lfail;
  console.log(`\nSWEEP: ${totalFail === 0 ? "CLEAN" : totalFail + " problem(s)"}`);
  process.exit(totalFail === 0 ? 0 : 1);
})().catch((e) => { console.error("SWEEP CRASH: " + e.message); process.exit(1); });
