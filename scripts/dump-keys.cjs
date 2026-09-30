/**
 * Prints every CompatKey and PerfInsightKey with the exact {placeholders} its
 * rule actually passes. Run: node scripts/dump-keys.cjs
 * Read-only: it exercises the real rule table, it does not re-declare it.
 */
require("./ts-require.cjs");

const { buildContext, COMPAT_RULES, COMPAT_KEYS } = require("@/lib/compat/rules");
const { estimatePerformance } = require("@/lib/perf/estimate");
const { PRODUCTS } = require("@/lib/data/products");

const byId = new Map(PRODUCTS.map((p) => [p.id, p]));
const get = (id) => byId.get(id);

const builds = [
  { cpu: "cpu-r5-5600", motherboard: "mobo-b650m", ram: "ram-vengeance-16-d4", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" },
  { cpu: "cpu-i5-12400f", motherboard: "mobo-b660m-e", ram: "ram-delta-32-d5", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" },
  { cpu: "cpu-i5-12600kf", motherboard: "mobo-b660m-e", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" },
  { cpu: "cpu-r7-5700x3d", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ma621c", case: "case-gamma-c60", psu: "psu-650-gold" },
  { cpu: "cpu-u5-225f", motherboard: "mobo-h810m", ram: "ram-16gb-d5-6000", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" },
  { cpu: "cpu-r5-7600", motherboard: "mobo-b650m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx5090-32gb", cooler: "cooler-lt720", case: "case-vx310", psu: "psu-1000-gold" },
  { cpu: "cpu-i5-14600kf", motherboard: "mobo-z790", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-vx310", psu: "psu-750-gold" },
  { cpu: "cpu-r9-9950x3d", motherboard: "mobo-b850m", ram: "ram-64gb-d5-6000", ssd: "ssd-gen5-1tb", gpu: "gpu-rtx5090-32gb", cooler: "cooler-lt720", case: "case-cg580", psu: "psu-400-b" },
  { cpu: "cpu-r9-9950x3d", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rx9070-16gb", cooler: "cooler-ag200", case: "case-velox", psu: "psu-850-gold" },
  { cpu: "cpu-r5-7600x", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6400", ssd: "ssd-sn850x-1tb", gpu: "gpu-rx9070-16gb", cooler: "cooler-ak620", case: "case-velox", psu: "psu-750-gold" },
  { motherboard: "mobo-g41", ssd: "ssd-nv2-1tb" },
  { cpu: "cpu-i9-14900k", motherboard: "mobo-h610m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-4000d", psu: "psu-750-gold" },
  { cpu: "cpu-r7-9800x3d", motherboard: "mobo-b650m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx4070-12gb", cooler: "cooler-ak620", case: "case-4000d", psu: "psu-750-gold" },
  { cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-1300-plat" },
  { cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-vengeance-16-d4", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-550-b" },
  { cpu: "cpu-r5-7600", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6000", ssd: "ssd-sn850x-1tb", gpu: "gpu-rtx5080-16gb", cooler: "cooler-ak620", case: "case-gamma-c60", psu: "psu-850-gold" },
  { cpu: "cpu-i5-12400f", motherboard: "mobo-b660m-e", ram: "ram-16gb-d4-3600", ssd: "ssd-nv2-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" },
  { cpu: "cpu-r5-5600", motherboard: "mobo-b550m-a-pro", ram: "ram-8gb-d4-3600", ssd: "ssd-sata-1tb", gpu: "gpu-rtx4060-8gb", cooler: "cooler-ak400", case: "case-4000d", psu: "psu-650-gold" },
  { cpu: "cpu-r3-2200g", motherboard: "mobo-b450m", ram: "ram-8gb-d3-1600", ssd: "ssd-sata-2tb", gpu: "gpu-gtx1650-4gb", cooler: "cooler-am1204", case: "case-gamma-c60", psu: "psu-450-b" },
  { cpu: "cpu-r5-7600", motherboard: "mobo-b850m", ram: "ram-32gb-d5-6000", ssd: "ssd-portable-1tb", gpu: "gpu-rx9070xt-16gb", cooler: "cooler-lt720", case: "case-velox", psu: "psu-850-gold" },
];

const placeholders = new Map();
const severities = new Map();

const record = (map, key, vars) => {
  const names = vars ? Object.keys(vars).sort() : [];
  const prev = map.get(key) || [];
  for (const n of names) if (!prev.includes(n)) prev.push(n);
  map.set(key, prev);
};

/** A key can carry more than one severity (graded rules); keep them all. */
const recordSeverity = (key, sev) => {
  const prev = severities.get(key) || [];
  if (!prev.includes(sev)) prev.push(sev);
  severities.set(key, prev);
};

// Exhaustive-ish sweep over the catalogue so every rule is exercised, not just
// the ones the sample builds happen to trigger.
const all = (c) => PRODUCTS.filter((p) => p.category === c);
for (const cpu of all("cpu")) for (const mobo of all("motherboard")) recordCompat({ cpu, motherboard: mobo });
for (const cooler of all("cooler")) for (const cpu of all("cpu")) recordCompat({ cooler, cpu });
for (const cooler of all("cooler")) for (const pcCase of all("case")) recordCompat({ cooler, case: pcCase });
for (const gpu of all("gpu")) for (const pcCase of all("case")) recordCompat({ gpu, case: pcCase });
for (const mobo of all("motherboard")) for (const ssd of all("ssd")) recordCompat({ motherboard: mobo, ssd });
for (const ram of all("ram")) for (const cpu of all("cpu")) recordCompat({ ram, cpu });
for (const ram of all("ram")) for (const mobo of all("motherboard")) recordCompat({ ram, motherboard: mobo });
for (const cpu of all("cpu")) for (const pcCase of all("case")) recordCompat({ cpu, case: pcCase });
for (const mobo of all("motherboard")) for (const pcCase of all("case")) recordCompat({ motherboard: mobo, case: pcCase });
for (const psu of all("psu")) for (const cpu of all("cpu")) for (const gpu of all("gpu")) recordCompat({ psu, cpu, gpu });

function recordCompat(build) {
  const ctx = buildContext(build);
  for (const rule of Object.values(COMPAT_RULES)) {
    const f = rule(ctx);
    if (f) {
      record(placeholders, f.key, f.vars);
      recordSeverity(f.key, f.severity);
    }
  }
}

for (const b of builds) {
  const build = {};
  for (const [slot, id] of Object.entries(b)) build[slot] = get(id);
  for (const i of estimatePerformance(build).insights) {
    record(placeholders, i.key, i.vars);
    recordSeverity(i.key, i.severity);
  }
}

console.log(`\n== COMPAT (${COMPAT_KEYS.length} rules) ==`);
for (const k of COMPAT_KEYS) {
  const ph = placeholders.get(k) || [];
  console.log(`${k}\t${(severities.get(k) || ["?"]).join("|")}\t{${ph.join("}, {")}}`);
}

const perfSeen = [...placeholders.keys()].filter((k) => k.startsWith("perf.ins."));
console.log(`\n== PERF (${perfSeen.length} insights) ==`);
for (const k of perfSeen.sort()) {
  const ph = placeholders.get(k) || [];
  console.log(`${k}\t${(severities.get(k) || ["?"]).join("|")}\t{${ph.join("}, {")}}`);
}
