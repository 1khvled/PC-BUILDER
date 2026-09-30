#!/usr/bin/env node
/**
 * GUIDE BUILD AUDIT
 * =================
 * Checks every "build" guide against the real catalogue and the real benchmark
 * indices, so a bad recommendation fails here instead of on the page.
 *
 * Written because the office guide shipped a 33,900 DA F-series CPU with a
 * 32,900 DA graphics card it did not need, in a build that cost 143,200 DA
 * under a 90k title. Prose review did not catch it. Arithmetic does.
 *
 * RULES
 * -----
 * 1. BUDGET      - a guide whose slug claims a budget (170k, 90k...) must land
 *                  within tolerance of it. A title that lies about the price is
 *                  the worst defect on a price-comparison site.
 * 2. BALANCE     - no single component may dominate a build that is not
 *                  explicitly a high-end showcase. A GPU is allowed to dominate;
 *                  a CPU in a GPU-bound build is not.
 * 3. NO REDUNDANT
 *     GPU         - if the CPU has integrated graphics, a discrete GPU is
 *                  optional. If one is present anyway it must be justified, and
 *                  the most common case (an office/study build paying for a
 *                  discrete card) is simply wrong.
 * 4. F SUFFIX    - an F-series CPU has no iGPU and cannot output a signal
 *                  without a card. Flagged as info, because it is legitimate
 *                  when a GPU is present.
 * 5. BOTTLENECK  - run the real estimator so a CPU that cannot feed the GPU is
 *                  visible.
 * 6. PARITY      - FR and EN must list identical parts.
 *
 * Exit 0 = clean. Non-zero = the count of problems found.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { createRequire } from "node:module";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const require = createRequire(import.meta.url);

// Side effect: registers the .ts extension handler and the "@/" alias.
require(join(root, "scripts", "ts-require.cjs"));

const { CATEGORIES, bestOffer } = require(join(root, "lib", "data", "products.ts"));
const { getProducts, getOffers } = require(join(root, "lib", "data", "catalog.ts"));
const { estimatePerformance } = require(join(root, "lib", "perf", "estimate.ts"));

const CATEGORY_OF = {};
for (const p of CATEGORIES) CATEGORY_OF[p.slug] = p.slug;

function parseGuides(file) {
  const src = readFileSync(file, "utf8");
  const out = new Map();
  const re = /slug:\s*"([^"]+)"([\s\S]*?)(?=\n\s*slug:\s*"|\n\];)/g;
  let m;
  while ((m = re.exec(src)) !== null) {
    const slug = m[1];
    const body = m[2];
    const pm = body.match(/parts:\s*\[([\s\S]*?)\]/);
    const parts = pm ? [...pm[1].matchAll(/"([a-z0-9-]+)"/g)].map((x) => x[1]) : [];
    const km = body.match(/kind:\s*"(build|guide)"/);
    const im = body.match(/ignoreAudit:\s*true/);
    out.set(slug, { slug, parts, kind: km ? km[1] : "guide", ignore: !!im });
  }
  return out;
}

const fr = parseGuides(join(root, "lib", "data", "guides.ts"));
const en = parseGuides(join(root, "lib", "data", "guides-en.ts"));

const products = await getProducts();
const offers = await getOffers();
const byId = new Map(products.map((p) => [p.id, p]));

const price = (id) => {
  const b = bestOffer(id, offers);
  return b ? b.priceDa : null;
};
const catOf = (id) => byId.get(id)?.category ?? "?";

const fmt = (n) => (n == null ? "?" : n.toLocaleString("en-US") + " DA");

// CPUs whose model string marks them as having no integrated graphics.
function hasNoIGpu(id) {
  const p = byId.get(id);
  return !!p && /Core i\d-\d+[0-9]{3}F\b|[- ]\d{4,5}F\b/i.test(p.model);
}
function hasIGpu(id) {
  const p = byId.get(id);
  if (!p) return false;
  if (hasNoIGpu(id)) return false;
  // APU parts are the G suffix on Ryzen, and the 3200G-style desktop APU.
  return /[3579]\d{3}G\b|\bG\b\s*$/.test(p.model) || /APU|Vega/i.test(p.model);
}

const problems = [];
const add = (slug, rule, msg) => problems.push({ slug, rule, msg });

for (const [slug, g] of fr) {
  if (g.kind !== "build" || g.ignore) continue;

  const p = g.parts;
  const cpu = p.find((x) => catOf(x) === "cpu");
  const gpu = p.find((x) => catOf(x) === "gpu");
  const ram = p.find((x) => catOf(x) === "ram");
  const ssd = p.find((x) => catOf(x) === "ssd");

  const priced = p.map((x) => [x, price(x)]);
  const missing = priced.filter(([, v]) => v == null);
  const total = priced.reduce((a, [, v]) => a + (v ?? 0), 0);
  if (!total) {
    add(slug, "price", "no part has a live price");
    continue;
  }
  if (missing.length) {
    add(slug, "price", `${missing.length} part(s) have no live offer: ${missing.map((m) => m[0]).join(", ")}`);
  }

  // 1. BUDGET
  const claim = slug.match(/(\d+)k/);
  if (claim) {
    const target = Number(claim[1]) * 1000;
    const diff = total - target;
    const pct = (diff / target) * 100;
    if (Math.abs(pct) > 12) {
      add(slug, "budget", `slug claims ${fmt(target)}, build is ${fmt(total)} (${pct > 0 ? "+" : ""}${pct.toFixed(0)}%)`);
    }
  }

  // 2. BALANCE
  for (const [id, v] of priced) {
    if (v == null) continue;
    const share = (v / total) * 100;
    const c = catOf(id);
    if (c === "cpu" && share > 30) {
      add(slug, "balance", `CPU ${id} is ${share.toFixed(0)}% of the build (${fmt(v)})`);
    }
    if ((c === "ram" || c === "ssd") && share > 35) {
      add(slug, "balance", `${c} ${id} is ${share.toFixed(0)}% of the build (${fmt(v)})`);
    }
  }

  // 3. REDUNDANT GPU
  if (cpu && gpu && hasIGpu(cpu)) {
    add(slug, "redundant-gpu", `CPU ${cpu} has integrated graphics but a ${gpu} is also bought (${fmt(price(gpu))})`);
  }

  // 4. F SUFFIX WITHOUT GPU
  if (cpu && hasNoIGpu(cpu) && !gpu) {
    add(slug, "f-no-gpu", `CPU ${cpu} has no integrated graphics and no GPU is present: it cannot output a signal`);
  }

  // 5. BOTTLENECK (real estimator, not a guess)
  if (cpu && gpu && byId.has(cpu) && byId.has(gpu)) {
    const build = { cpu: byId.get(cpu), gpu: byId.get(gpu) };
    if (ram && byId.has(ram)) build.ram = byId.get(ram);
    if (ssd && byId.has(ssd)) build.ssd = byId.get(ssd);
    const perf = estimatePerformance(build);
    const heavy = perf.insights.filter((i) => i.severity === "bad" || i.severity === "warn");
    for (const ins of heavy) {
      add(slug, "perf", `${ins.key} (${ins.severity})`);
    }
  }

  // 6. PARITY
  if (!en.has(slug)) {
    add(slug, "parity", "missing from guides-en.ts");
  } else if (en.get(slug).parts.join(",") !== g.parts.join(",")) {
    add(slug, "parity", "FR and EN list different parts");
  }
}

if (problems.length === 0) {
  console.log("OK: every build guide passes.");
} else {
  const bySlug = new Map();
  for (const p of problems) {
    if (!bySlug.has(p.slug)) bySlug.set(p.slug, []);
    bySlug.get(p.slug).push(p);
  }
  for (const [slug, list] of bySlug) {
    console.log(`\n${slug}`);
    for (const p of list) console.log(`   [${p.rule}] ${p.msg}`);
  }
  console.log(`\n${problems.length} problem(s) across ${bySlug.size} guide(s).`);
}
process.exit(problems.length === 0 ? 0 : 1);
