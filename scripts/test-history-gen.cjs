const fs = require('fs');
const path = require('path');

const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase-seed.json'), 'utf8'));
const offers = seed.offers || [];

// Map url to matched productId from seed offers
const urlToProduct = new Map();
for (const o of offers) {
  if (o.u && o.p) urlToProduct.set(o.u, { p: o.p, store: o.s, price: o.d });
}

console.log('Seed urlToProduct size:', urlToProduct.size);

// Build history rows: { d: 'YYYY-MM-DD', p: productId, s: store, pr: priceDa }
const historyRows = [];
const seen = new Set();

for (const o of all) {
  const match = urlToProduct.get(o.url);
  if (!match) continue;
  if (!o.postedAt) continue;

  const day = o.postedAt.slice(0, 10);
  if (day < '2025-10-01') continue;

  const key = `${day}|${match.p}|${match.store}|${o.priceDa}`;
  if (seen.has(key)) continue;
  seen.add(key);

  historyRows.push({
    d: day,
    p: match.p,
    s: match.store,
    pr: o.priceDa
  });
}

console.log('Generated history rows from full.json:', historyRows.length);
const distinctProducts = new Set(historyRows.map(h => h.p));
console.log('Distinct products in generated history:', distinctProducts.size);
