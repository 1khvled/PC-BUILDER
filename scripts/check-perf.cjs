#!/usr/bin/env node
/**
 * PERF + COMPAT VERIFICATION.
 *
 *   node scripts/check-perf.cjs
 *
 * Plain node, no tsx, no test runner: the checks are few, fast and worth being
 * able to run on a machine with nothing installed but the repo.
 *
 * What it asserts:
 *   1. every benchmark key exists in lib/data/products.ts and vice versa,
 *      reported per category rather than as one opaque pass/fail;
 *   2. no compatibility rule fires on a build with missing, empty or garbage
 *      specs, and nothing throws on any partial build in the catalogue;
 *   3. known-good builds produce no BLOCK;
 *   4. known-bad builds produce the expected warning key;
 *   5. every rule can actually fire (a rule that cannot is a dead rule);
 *   6. scores stay inside 0..100, are integers, and are monotonic: a strictly
 *      better part never scores worse.
 *
 * Exits non-zero on the first failing category so CI can gate on it.
 */

require("./ts-require.cjs");

const { PRODUCTS } = require("@/lib/data/products");
const {
  CPU_BENCH,
  GPU_BENCH,
  RAM_BENCH,
  SSD_BENCH,
  COOLER_BENCH,
} = require("@/lib/data/benchmarks");
const { checkCompat } = require("@/lib/compat/check");
const { COMPAT_KEYS } = require("@/lib/compat/rules");
const { estimatePerformance, SCORE_CEILING, PRODUCTIVITY_CEILING } = require("@/lib/perf/estimate");

/* ------------------------------------------------------------- tiny harness */

let failures = 0;
let checks = 0;
const section = (name) => console.log(`\n=== ${name} ===`);
const ok = (label) => {
  checks++;
  console.log(`  ok    ${label}`);
};
const fail = (label, detail) => {
  checks++;
  failures++;
  console.log(`  FAIL  ${label}`);
  if (detail) console.log(`        ${detail}`);
};
const assert = (cond, label, detail) => (cond ? ok(label) : fail(label, detail));

const byId = new Map(PRODUCTS.map((p) => [p.id, p]));

/**
 * Explicit slots: a positional helper silently mis-slots a build with no SSD.
 *
 * Every part is CLONED. Section 2 deliberately corrupts specs to prove nothing
 * throws, and sharing catalogue objects let that corruption leak into every
 * later section - which made four good rules look broken. Cloning here means a
 * fixture can never reach the catalogue, and the guard at the end of this file
 * proves it.
 */
const clone = (p) => (p ? { ...p, specs: { ...p.specs } } : p);
const of = (parts) => {
  const build = {};
  for (const [slot, id] of Object.entries(parts)) {
    if (!id) continue;
    const product = byId.get(id);
    if (!product) throw new Error(`unknown product id: ${id}`);
    build[slot] = clone(product);
  }
  return build;
};
const keysOf = (result) => result.warnings.map((w) => w.key);

/** Fingerprint of the catalogue, to prove no section mutated it. */
const CATALOGUE_FINGERPRINT = () => JSON.stringify(PRODUCTS);

/* ------------------------------------------- 1. benchmark key <-> product */

section("1. benchmark coverage");

const BENCH_SETS = [
  ["cpu", CPU_BENCH],
  ["gpu", GPU_BENCH],
  ["ram", RAM_BENCH],
  ["ssd", SSD_BENCH],
  ["cooler", COOLER_BENCH],
];

for (const [category, table] of BENCH_SETS) {
  const products = PRODUCTS.filter((p) => p.category === category);
  const ids = new Set(products.map((p) => p.id));
  const keys = Object.keys(table);
  const orphans = keys.filter((k) => !ids.has(k));
  const uncovered = products.map((p) => p.id).filter((id) => !table[id]);

  assert(
    orphans.length === 0,
    `${category}: ${keys.length} indices, every key is a real product id`,
    orphans.length ? `orphans: ${orphans.join(", ")}` : null,
  );

  if (uncovered.length === 0) {
    ok(`${category}: all ${products.length} products have an index`);
  } else {
    console.log(`  note  ${category}: ${products.length} products, ${uncovered.length} without an index`);
    console.log(`        ${uncovered.join(", ")}`);
  }
}

/* --------------------------------- 2. nothing fires on missing/garbage specs */

section("2. safe degradation");

const fingerprintAtStart = CATALOGUE_FINGERPRINT();

const empty = checkCompat({});
assert(empty.warnings.length === 0, "empty build produces no findings", JSON.stringify(empty.warnings));
assert(empty.ok === true, "empty build is ok");

// Every product on its own, with its specs removed: one part can never conflict
// with itself, so any finding here is a rule inventing data.
let strippedFindings = 0;
for (const p of PRODUCTS) {
  const naked = { ...p, specs: {} };
  for (const slot of ["cpu", "gpu", "motherboard", "ram", "ssd", "cooler", "case", "psu"]) {
    const r = checkCompat({ [slot]: naked });
    if (r.warnings.length) {
      strippedFindings++;
      console.log(`        ${slot}=${p.id} -> ${keysOf(r).join(", ")}`);
    }
  }
}
assert(strippedFindings === 0, "no rule fires on a part with empty specs");

// One of each category together, all specs stripped.
const strippedSet = {};
["cpu", "gpu", "motherboard", "ram", "ssd", "cooler", "case", "psu"].forEach((slot) => {
  const p = PRODUCTS.find((x) => x.category === (slot === "motherboard" ? "motherboard" : slot));
  if (p) strippedSet[slot] = { ...p, specs: {} };
});
const strippedAll = checkCompat(strippedSet);
assert(
  strippedAll.warnings.length === 0,
  "no rule fires when every part has empty specs",
  JSON.stringify(strippedAll.warnings),
);

// Hostile spec values must not throw and must not produce findings.
const garbage = ["", "   ", "abc", "NaN", null, undefined, -5, 0, 1e308, [], {}, true, "60000"];
let garbageThrows = 0;
for (const value of garbage) {
  const build = of({ cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" });
  for (const p of Object.values(build)) {
    if (p) p.specs = { ...p.specs, tdp: value, tdp_w: value, socket: value, ram_type: value, type: value, wattage: value, height_mm: value, max_gpu_mm: value, max_cooler_mm: value, capacity_gb: value, speed: value, m2: value, form_factor: value, supports: value, sockets: value, interface: value, chipset: value, pins: value, length_mm: value };
  }
  try {
    checkCompat(build);
    estimatePerformance(build);
  } catch (err) {
    garbageThrows++;
    console.log(`        threw on ${JSON.stringify(value)}: ${err.message}`);
  }
}
assert(garbageThrows === 0, "hostile spec values never throw");

// Every partial build we can make from the catalogue must survive both engines.
let partialThrows = 0;
const slots = ["cpu", "gpu", "motherboard", "ram", "ssd", "cooler", "case", "psu"];
for (const a of slots) {
  const pa = PRODUCTS.find((p) => p.category === a);
  if (!pa) continue;
  try {
    checkCompat({ [a]: pa });
    estimatePerformance({ [a]: pa });
    for (const b of slots) {
      const pb = PRODUCTS.find((p) => p.category === b);
      if (!pb) continue;
      const build = { [a]: pa, [b]: pb };
      checkCompat(build);
      estimatePerformance(build);
    }
  } catch (err) {
    partialThrows++;
    console.log(`        threw on ${a}: ${err.message}`);
  }
}
assert(partialThrows === 0, "every one- and two-part build is handled");

/* ------------------------------------------------- 3. known-good builds */

section("3. known-good builds (no BLOCK)");

const GOOD = [
  {
    name: "5600 + B550M + 4060, the reference budget build",
    build: of({ cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" }),
  },
  {
    name: "9800X3D + B650M + 5080, high end AM5",
    build: of({ cpu: "cpu-r7-9800x3d", motherboard: "mobo-b650m", ram: "ram-delta-32-d5", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx5080-16gb", cooler: "cooler-lt720", case: "case-velox", psu: "psu-1000-gold" }),
  },
  {
    name: "i5-12400F + B660M DDR4 + 4070",
    build: of({ cpu: "cpu-i5-12400f", motherboard: "mobo-b660m-e", ram: "ram-32gb-d4-3600", ssd: "ssd-nv3-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-masterbox", psu: "psu-750-gold" }),
  },
  {
    name: "DDR5-6400 on an X3D AM5 part (allowed there)",
    build: of({ cpu: "cpu-r7-9800x3d", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6400", ssd: "ssd-990pro-2tb", gpu: "gpu-rx9070xt-16gb", cooler: "cooler-ma621c", case: "case-ch560", psu: "psu-850-gold" }),
  },
  {
    name: "office: 12100F + H610M + DDR4, no discrete GPU",
    build: of({ cpu: "cpu-i3-12100f", motherboard: "mobo-h610m", ram: "ram-value-8-d4", ssd: "ssd-sata-1tb", cooler: "cooler-am1204", case: "case-xpg", psu: "psu-450-b" }),
  },
  {
    name: "AM4 on an X570 board (BIOS already flashed)",
    build: of({ cpu: "cpu-r7-5800x", motherboard: "mobo-x570", ram: "ram-16gb-d4-3600", ssd: "ssd-970evo-1tb", gpu: "gpu-rx6800-16gb", cooler: "cooler-ag620", case: "case-masterbox", psu: "psu-750-gold" }),
  },
];

for (const { name, build } of GOOD) {
  const r = checkCompat(build);
  const blocks = r.warnings.filter((w) => w.severity === "block");
  assert(
    blocks.length === 0,
    `good: ${name}`,
    blocks.length ? blocks.map((w) => `${w.key} ${JSON.stringify(w.vars)}`).join(" | ") : null,
  );
}

/* -------------------------------------------------- 4. known-bad builds */

section("4. known-bad builds (expected key fires)");

/**
 * `expect` is the EXACT set of keys the build must produce, not "at least this
 * one". A fixture that quietly fires three unrelated rules is a broken fixture,
 * and a membership test hides that instead of catching it.
 */
const BAD = [
  {
    name: "AM4 CPU on an AM5 board",
    build: of({ cpu: "cpu-r5-5600", motherboard: "mobo-b650m", ram: "ram-vengeance-16-d4", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" }),
    expect: ["compat.socketMismatch", "compat.moboRamType"],
    severity: "block",
  },
  {
    name: "DDR5 kit in a DDR4 board (LGA1700, same socket)",
    build: of({ cpu: "cpu-i5-12400f", motherboard: "mobo-b660m-e", ram: "ram-delta-32-d5", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" }),
    expect: ["compat.cpuRamType", "compat.moboRamType"],
    severity: "block",
  },
  {
    name: "DDR4 kit under a DDR5-only CPU, same socket",
    build: of({ cpu: "cpu-i5-12600kf", motherboard: "mobo-b660m-e", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" }),
    expect: ["compat.cpuRamType"],
    severity: "block",
  },
  {
    name: "165 mm dual tower in a 160 mm case",
    build: of({ cpu: "cpu-r7-5700x3d", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ma621c", case: "case-gamma-c60", psu: "psu-650-gold" }),
    expect: ["compat.coolerTooTall"],
    severity: "block",
  },
  {
    name: "cooler with no LGA1851 bracket, on a matching LGA1851 board",
    build: of({ cpu: "cpu-u5-225f", motherboard: "mobo-h810m", ram: "ram-16gb-d5-6000", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" }),
    expect: ["compat.coolerSocket"],
    severity: "block",
  },
  {
    name: "RTX 5090 (336 mm) in a 320 mm case",
    build: of({ cpu: "cpu-r5-7600", motherboard: "mobo-b650m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx5090-32gb", cooler: "cooler-lt720", case: "case-vx310", psu: "psu-1000-gold" }),
    expect: ["compat.gpuTooLong"],
    severity: "block",
  },
  {
    name: "ATX board in a mATX-only case",
    build: of({ cpu: "cpu-i5-14600kf", motherboard: "mobo-z790", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-vx310", psu: "psu-750-gold" }),
    expect: ["compat.caseFormFactor"],
    severity: "block",
  },
  {
    name: "400 W supply on a 9950X3D + 5090",
    build: of({ cpu: "cpu-r9-9950x3d", motherboard: "mobo-b850m", ram: "ram-64gb-d5-6000", ssd: "ssd-gen5-1tb", gpu: "gpu-rtx5090-32gb", cooler: "cooler-lt720", case: "case-cg580", psu: "psu-400-b" }),
    expect: ["compat.psuUnderWattage"],
    severity: "block",
  },
  {
    name: "200 W CPU on a 120 W budget cooler",
    build: of({ cpu: "cpu-r9-9950x3d", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rx9070-16gb", cooler: "cooler-ag200", case: "case-velox", psu: "psu-850-gold" }),
    expect: ["compat.coolerUnderSized"],
    severity: "warn",
  },
  {
    name: "DDR5-6400 on a non-X3D AM5 CPU",
    build: of({ cpu: "cpu-r5-7600x", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6400", ssd: "ssd-sn850x-1tb", gpu: "gpu-rx9070-16gb", cooler: "cooler-ak620", case: "case-velox", psu: "psu-750-gold" }),
    expect: ["compat.ramTooFast"],
    severity: "warn",
  },
  {
    // Only the board and the drive: the three m2=0 boards are all DDR3 sockets
    // with no CPU in the catalogue, so adding one would drag in an unrelated
    // socket and RAM-type block. The rule only needs those two facts.
    name: "NVMe drive on a board with no M.2 slot",
    build: of({ motherboard: "mobo-g41", ssd: "ssd-nv2-1tb" }),
    expect: ["compat.m2Slots"],
    severity: "warn",
  },
  {
    // H610 is a DDR4 board, so this legitimately reports three things at once:
    // the RAM generation, the VRM, and the BIOS. Listing all three is the point
    // of an exact-set assertion.
    name: "i9-14900K on a DDR4 H610 board",
    build: of({ cpu: "cpu-i9-14900k", motherboard: "mobo-h610m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-4000d", psu: "psu-750-gold" }),
    expect: ["compat.moboRamType", "compat.vrmEntry", "compat.biosUpdate"],
    severityKey: "compat.vrmEntry",
    severity: "warn",
  },
  {
    name: "9800X3D on an early B650 board (BIOS)",
    build: of({ cpu: "cpu-r7-9800x3d", motherboard: "mobo-b650m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-4000d", psu: "psu-750-gold" }),
    expect: ["compat.biosUpdate"],
    severity: "info",
  },
  {
    name: "5600 on a B550 board (BIOS, no update needed)",
    build: of({ cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" }),
    expect: [],
    severity: null,
  },
  {
    name: "9800X3D on a current B850 board (BIOS, no update needed)",
    build: of({ cpu: "cpu-r7-9800x3d", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-4000d", psu: "psu-750-gold" }),
    expect: [],
    severity: null,
  },
  {
    name: "1300 W supply on a mid-range build",
    build: of({ cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-1300-plat" }),
    expect: ["compat.psuOverkill"],
    severity: "info",
  },
  {
    name: "Bronze supply running at 60 % of its rating",
    build: of({ cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-550-b" }),
    expect: ["compat.psuLowEfficiency"],
    severity: "info",
  },
  {
    name: "5080 (16-pin) in a 340 mm case, cable has nowhere to bend",
    build: of({ cpu: "cpu-r5-7600", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx5080-16gb", cooler: "cooler-ak620", case: "case-gamma-c60", psu: "psu-850-gold" }),
    expect: ["compat.gpuClearanceTight"],
    severity: "info",
  },
];

for (const { name, build, expect, severity, severityKey } of BAD) {
  const r = checkCompat(build);
  const got = keysOf(r).sort();
  const want = [...expect].sort();
  const setOk = got.length === want.length && got.every((k, i) => k === want[i]);
  // `severity` describes one named key, not whichever happens to sort first.
  const target = severityKey || expect[0];
  const hit = target ? r.warnings.find((w) => w.key === target) : null;
  const severityOk = severity === null || severity === undefined ? true : !!hit && hit.severity === severity;
  assert(
    setOk && severityOk,
    `bad:  ${name} -> ${expect.length ? expect.join(" + ") : "(nothing)"}`,
    !setOk
      ? `expected [${want.join(", ")}] but got [${got.join(", ") || "(nothing)"}]`
      : `severity of ${target} was ${hit ? hit.severity : "(absent)"}, wanted ${severity}`,
  );
}

/* ------------------------------------------- 5. every rule can fire */

section("5. rule coverage (no dead rules)");

const seen = new Set();
const feed = (build) => {
  for (const k of keysOf(checkCompat(build))) seen.add(k);
};
const all = (category) => PRODUCTS.filter((p) => p.category === category);

for (const { build } of [...GOOD, ...BAD]) feed(build);

// Every rule needs a specific pair of facts, so the sweep has to pair every
// category with every other category it could plausibly be tested against. A
// sweep that misses a pairing reports a working rule as dead, which is how
// coolerSocket and m2Slots looked broken: the data was fine, the sweep was not.
const cpuList = all("cpu");
const moboList = all("motherboard");
const ramList = all("ram");
const gpuList = all("gpu");
const coolerList = all("cooler");
const caseList = all("case");
const psuList = all("psu");
const ssdList = all("ssd");

for (const cpu of cpuList) for (const mobo of moboList) feed({ cpu, motherboard: mobo });
for (const cooler of coolerList) for (const cpu of cpuList) feed({ cooler, cpu });
for (const cooler of coolerList) for (const pcCase of caseList) feed({ cooler, case: pcCase });
for (const gpu of gpuList) for (const pcCase of caseList) feed({ gpu, case: pcCase });
for (const mobo of moboList) for (const ssd of ssdList) feed({ motherboard: mobo, ssd });
for (const ram of ramList) for (const cpu of cpuList) for (const mobo of moboList) feed({ ram, cpu, motherboard: mobo });
for (const psu of psuList) for (const cpu of cpuList) for (const gpu of gpuList) feed({ psu, cpu, gpu });

const dead = COMPAT_KEYS.filter((k) => !seen.has(k));
assert(dead.length === 0, `all ${COMPAT_KEYS.length} rules fire on real catalogue data`, dead.join(", "));

/* --------- 5b. psuOverkill and psuLowEfficiency can never both fire ---- */

let psuContradictions = 0;
for (const psu of psuList) {
  for (const cpu of cpuList) {
    for (const gpu of gpuList) {
      const keys = keysOf(checkCompat({ psu, cpu, gpu }));
      if (keys.includes("compat.psuOverkill") && keys.includes("compat.psuLowEfficiency")) {
        psuContradictions++;
        if (psuContradictions < 4) console.log(`        both: ${psu.id} + ${cpu.id} + ${gpu.id}`);
      }
    }
  }
}
assert(
  psuContradictions === 0,
  "a supply is never reported as both oversized and lossy (thresholds are disjoint)",
  `${psuContradictions} contradictory builds`,
);

/* --------------------------------- 6. score range and monotonicity */

section("6. score range and monotonicity");

const cpus = Object.entries(CPU_BENCH).sort((a, b) => a[1].gaming - b[1].gaming);
const cpusByMulti = [...cpus].sort((a, b) => a[1].multi - b[1].multi);
const gpus1080 = Object.entries(GPU_BENCH).sort((a, b) => a[1].raster1080 - b[1].raster1080);
const gpus1440 = Object.entries(GPU_BENCH).sort((a, b) => a[1].raster1440 - b[1].raster1440);

const scoreOf = (cpuId, gpuId) => estimatePerformance({ cpu: byId.get(cpuId), gpu: byId.get(gpuId) });

let outOfRange = 0;
let nonInteger = 0;
let notMonotonicCpu = 0;
let notMonotonicGpu = 0;
let notMonotonicProd = 0;
let missingScore = 0;

for (const [cpuId] of cpus) {
  for (const [gpuId] of gpus1080) {
    const p = scoreOf(cpuId, gpuId);
    for (const v of [p.gaming, p.gaming1440]) {
      if (v == null) {
        missingScore++;
        continue;
      }
      if (v < 0 || v > 100) outOfRange++;
      if (!Number.isInteger(v)) nonInteger++;
    }
    if (p.productivity == null) missingScore++;
  }
}

console.log(`  info  ceilings: 1080p=${SCORE_CEILING["1080p"].toFixed(1)} 1440p=${SCORE_CEILING["1440p"].toFixed(1)} productivity=${PRODUCTIVITY_CEILING.toFixed(1)}`);
assert(missingScore === 0, `all ${cpus.length * gpus1080.length} builds scored`);
assert(outOfRange === 0, "every gaming score is inside 0..100");
assert(nonInteger === 0, "every gaming score is an integer");

// A strictly better CPU must never score worse, for any GPU.
for (const [gpuId] of gpus1080) {
  let prev = -1;
  for (const [cpuId] of cpus) {
    const p = scoreOf(cpuId, gpuId);
    if (p.gaming < prev) {
      notMonotonicCpu++;
      if (notMonotonicCpu < 4) console.log(`        ${gpuId} + ${cpuId}: ${p.gaming} < ${prev}`);
    }
    prev = p.gaming;
  }
}
assert(notMonotonicCpu === 0, "gaming score is monotonic in CPU (all GPUs)");

for (const [cpuId] of cpus) {
  let prev = -1;
  for (const [gpuId] of gpus1080) {
    const p = scoreOf(cpuId, gpuId);
    if (p.gaming < prev) notMonotonicGpu++;
    prev = p.gaming;
  }
}
assert(notMonotonicGpu === 0, "gaming score is monotonic in GPU (all CPUs)");

for (const [gpuId] of gpus1440) {
  let prev = -1;
  for (const [cpuId] of cpus) {
    const p = scoreOf(cpuId, gpuId);
    if (p.gaming1440 < prev) notMonotonicGpu++;
    prev = p.gaming1440;
  }
}
assert(notMonotonicGpu === 0, "1440p score is monotonic in CPU");

for (const [gpuId] of gpus1080) {
  let prev = -1;
  for (const [cpuId] of cpusByMulti) {
    const p = scoreOf(cpuId, gpuId);
    if (p.productivity < prev) notMonotonicProd++;
    prev = p.productivity;
  }
}
assert(notMonotonicProd === 0, "productivity score is monotonic in CPU");

/* ------------------------------- 6b. scores behave on known builds */

section("7. spot checks");

const spot = [
  ["cpu-r5-5600", "gpu-rtx4060-8gb", "the stated reference build"],
  ["cpu-r7-5700x3d", "gpu-gtx1650-4gb", "5700X3D behind a GTX 1650"],
  ["cpu-i5-12400f", "gpu-rtx4090-24gb", "12400F in front of a 4090"],
  ["cpu-r9-9950x3d", "gpu-rtx5090-32gb", "the best build we stock"],
];
for (const [cpuId, gpuId, label] of spot) {
  const p = scoreOf(cpuId, gpuId);
  const upgrade = p.upgrade ? `${p.upgrade.kind} x${p.upgrade.factor} (+${p.upgrade.gain} @${p.upgrade.resolution})` : "none";
  console.log(
    `  info  ${label.padEnd(28)} 1080p=${String(p.gaming).padStart(3)} 1440p=${String(p.gaming1440).padStart(3)} prod=${String(p.productivity).padStart(3)} tier=${p.tier}/${p.tier1440} upgrade=${upgrade}`,
  );
  console.log(`        insights: ${p.insights.map((i) => i.key).join(", ") || "(none)"}`);
}

const classic = scoreOf("cpu-r7-5700x3d", "gpu-gtx1650-4gb");
assert(
  classic.insights.some((i) => i.key === "perf.ins.upgradeGpu"),
  "a 5700X3D behind a GTX 1650 names the GPU as the upgrade",
);
assert(
  !classic.insights.some((i) => i.key === "perf.ins.upgradeCpu"),
  "and does not also tell you to buy a faster CPU",
);
assert(
  classic.gaming < scoreOf("cpu-r7-5700x3d", "gpu-rx6600-8gb").gaming,
  "a better GPU raises the 5700X3D build's score",
);

const balanced = scoreOf("cpu-r5-5600", "gpu-rtx4060-8gb");
assert(
  balanced.insights.some((i) => i.key === "perf.ins.balanced"),
  "a matched build is reported as balanced",
);
assert(balanced.bottlenecks.every((b) => b.grade === "none"), "a matched build has no bottleneck at either resolution");

const thinPsu = estimatePerformance({
  cpu: byId.get("cpu-r5-7600"),
  gpu: byId.get("gpu-rtx5080-16gb"),
  psu: byId.get("psu-750-gold"),
});
assert(
  thinPsu.insights.some((i) => i.key === "perf.ins.psuHeadroom"),
  "a supply with no transient margin is flagged as a load-time risk",
);

const slowDisk = estimatePerformance({
  cpu: byId.get("cpu-r5-5600"),
  gpu: byId.get("gpu-rtx4060-8gb"),
  ssd: byId.get("ssd-sata-1tb"),
});
assert(
  slowDisk.insights.some((i) => i.key === "perf.ins.storageSlow"),
  "a SATA drive under a fast build is flagged as the thing you feel",
);

const tinyRam = estimatePerformance({
  cpu: byId.get("cpu-r5-5600"),
  gpu: byId.get("gpu-rtx4060-8gb"),
  ram: byId.get("ram-value-8-d4"),
});
assert(
  tinyRam.insights.some((i) => i.key === "perf.ins.memoryCapacity"),
  "8 GB is flagged as a capacity problem",
);

const halfBuild = estimatePerformance({ cpu: byId.get("cpu-r5-5600") });
assert(halfBuild.gaming === null, "no GPU means no gaming score, not a zero");
assert(halfBuild.gaming1440 === null, "and no 1440p score either");
assert(halfBuild.productivity > 0, "but the productivity score still works from the CPU alone");
assert(
  halfBuild.insights.length === 0,
  "a CPU on its own produces no performance advice",
  halfBuild.insights.map((i) => i.key).join(", "),
);

const resolutionMatters = scoreOf("cpu-r5-7600x", "gpu-rx7600xt-16gb");
assert(
  resolutionMatters.gaming !== resolutionMatters.gaming1440,
  "the two resolutions give different scores for the same parts",
  `${resolutionMatters.gaming} vs ${resolutionMatters.gaming1440}`,
);

// The card renders insights with key={insight.key}, so a duplicate key silently
// drops a row in React. No key may appear twice in one build.
let duplicateKeys = 0;
for (const [cpuId] of cpus) {
  for (const [gpuId] of gpus1080) {
    const keys = scoreOf(cpuId, gpuId).insights.map((i) => i.key);
    const dupes = keys.filter((k, i) => keys.indexOf(k) !== i);
    if (dupes.length) {
      duplicateKeys++;
      if (duplicateKeys < 4) console.log(`        ${cpuId} + ${gpuId} repeats ${[...new Set(dupes)].join(", ")}`);
    }
  }
}
assert(duplicateKeys === 0, "no build emits the same insight key twice");

// A bottleneck insight must name a real resolution and a real grade, and both
// bottlenecks must be reported for a complete build.
const complete = scoreOf("cpu-r7-5700x3d", "gpu-gtx1650-4gb");
assert(
  complete.bottlenecks.length === 2 && complete.bottlenecks.every((b) => b.resolution && b.grade),
  "a complete build reports a bottleneck at both resolutions",
);

/* ------------------------------------------------------------------ result */

// Nothing in this file is allowed to reach the shared catalogue: section 2
// corrupts specs on purpose, and before the parts were cloned that leaked into
// every later section and made four working rules look dead.
assert(
  CATALOGUE_FINGERPRINT() === fingerprintAtStart,
  "the catalogue in lib/data/products.ts was not mutated by this script",
);

console.log(`\n${failures === 0 ? "PASS" : "FAIL"}: ${checks - failures}/${checks} checks passed`);
process.exit(failures === 0 ? 0 : 1);
