const fs = require('fs');
const path = require('path');

const historyJson = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'lib', 'data', 'price-history.json'), 'utf8'));
const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase-seed.json'), 'utf8'));
const offers = seed.offers || [];

console.log('Total history rows:', historyJson.length);
console.log('Sample history row:', historyJson[0]);

const historyByProduct = {};
for (const h of historyJson) {
  if (!historyByProduct[h.p]) historyByProduct[h.p] = [];
  historyByProduct[h.p].push(h);
}

console.log('Distinct products with history:', Object.keys(historyByProduct).length);

// Check drops with current cutoff vs earliest point
let currentDrops = 0;
let earlyDrops = 0;
const cutoff = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

for (const [pId, history] of Object.entries(historyByProduct)) {
  const prodOffers = offers.filter(o => o.p === pId && o.c === 1 && o.w !== 'out');
  if (prodOffers.length === 0) continue;
  const nowBest = prodOffers.reduce((a, b) => (a.d <= b.d ? a : b)).d;

  // 1. Current strict 7d cutoff
  const old7 = history.filter(h => h.d <= cutoff);
  if (old7.length > 0) {
    const thenBest = Math.min(...old7.map(h => h.pr));
    const saving = thenBest - nowBest;
    if (saving >= 2000 && saving / thenBest >= 0.05) currentDrops++;
  }

  // 2. Flexible earlier point (any earlier day or min 1000 DA)
  const earlier = history.filter(h => h.d < new Date().toISOString().slice(0, 10));
  if (earlier.length > 0) {
    const thenBest = Math.min(...earlier.map(h => h.pr));
    const saving = thenBest - nowBest;
    if (saving >= 1000 && saving / thenBest >= 0.05) earlyDrops++;
  }
}

console.log('Current drops count (7d cutoff, >=2000 DA):', currentDrops);
console.log('Flexible drops count (earlier day, >=1000 DA):', earlyDrops);
