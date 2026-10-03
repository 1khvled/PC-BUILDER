const fs = require('fs');
const path = require('path');

const histFile = path.join(__dirname, '..', 'lib', 'data', 'price-history.json');
let existing = [];
try {
  existing = JSON.parse(fs.readFileSync(histFile, 'utf8'));
} catch {}

const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase-seed.json'), 'utf8'));
const offers = seed.offers || [];

const urlToProduct = new Map();
for (const o of offers) {
  if (o.u && o.p) urlToProduct.set(o.u, { p: o.p, store: o.s, price: o.d });
}

const seen = new Set();
const merged = [];

// Keep existing first
for (const h of existing) {
  const key = `${h.d}|${h.p}|${h.s}|${h.pr}`;
  if (!seen.has(key)) {
    seen.add(key);
    merged.push(h);
  }
}

// Add newly generated history
for (const o of all) {
  const match = urlToProduct.get(o.url);
  if (!match) continue;
  if (!o.postedAt) continue;

  const day = o.postedAt.slice(0, 10);
  if (day < '2025-10-01') continue;

  const key = `${day}|${match.p}|${match.store}|${o.priceDa}`;
  if (!seen.has(key)) {
    seen.add(key);
    merged.push({
      d: day,
      p: match.p,
      s: match.store,
      pr: o.priceDa
    });
  }
}

// Sort by date ascending
merged.sort((a, b) => a.d.localeCompare(b.d));

console.log(`Writing ${merged.length} historical price rows to ${histFile}...`);
fs.writeFileSync(histFile, JSON.stringify(merged, null, 2), 'utf8');
console.log('Saved lib/data/price-history.json!');

// Test drops
const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);
let dropsCount = 0;
const historyByProd = {};
for (const h of merged) {
  if (!historyByProd[h.p]) historyByProd[h.p] = [];
  historyByProd[h.p].push(h);
}

for (const [pId, hist] of Object.entries(historyByProd)) {
  const live = offers.filter(o => o.p === pId && o.c === 1 && o.w !== 'out');
  if (live.length === 0) continue;
  const nowBest = live.reduce((a, b) => (a.d <= b.d ? a : b)).d;
  const old = hist.filter(h => h.d <= cutoff);
  if (old.length === 0) continue;
  const thenBest = Math.min(...old.map(h => h.pr));
  if (thenBest <= nowBest) continue;
  const saving = thenBest - nowBest;
  const pct = saving / thenBest;
  if (pct >= 0.05 && saving >= 1000) {
    dropsCount++;
  }
}

console.log(`Real price drops detected with 7d cutoff, >=5% and >=1000 DA: ${dropsCount}`);
