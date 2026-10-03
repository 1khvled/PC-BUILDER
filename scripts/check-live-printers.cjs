const fs = require('fs');
const path = require('path');

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase-seed.json'), 'utf8'));
const offers = seed.offers || [];

const printerOffers = offers.filter(o => o.p && o.p.startsWith('printer-'));
console.log(`Total printer offers in seed: ${printerOffers.length}`);

const byProd = {};
for (const o of printerOffers) {
  if (!byProd[o.p]) byProd[o.p] = [];
  byProd[o.p].push(o);
}

for (const [p, list] of Object.entries(byProd)) {
  const prices = list.map(o => o.d).sort((a,b) => a-b);
  console.log(` - ${p}: ${list.length} offers (${prices[0]} DA to ${prices[prices.length-1]} DA)`);
}
