const fs = require('fs');
const path = require('path');

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase-seed.json'), 'utf8'));
const offers = (seed.offers || []).map(o => ({
  productId: o.p,
  priceDa: o.d,
  condition: o.c === 1 ? 'new' : 'used',
  stock: o.w === 'in' ? 'En stock' : (o.w === 'out' ? 'Rupture' : 'Ouedkniss'),
  store: o.s,
  wilaya: o.wi || 'Alger'
}));

const products = seed.products || [];

function isRuptured(o) {
  return /rupture|out of stock|sold out|épuisé|epuisé|indisponible|0\s*en\s*stock|stock\s*[=:]\s*0/i.test(o.stock || "");
}

function deals(minOffers, minDrop, minSaving) {
  const out = [];
  for (const p of products) {
    const fresh = offers.filter((o) => o.productId === p.id && o.condition === "new" && !isRuptured(o));
    if (fresh.length < minOffers) continue;
    const prices = fresh.map((o) => o.priceDa).sort((a, b) => a - b);
    const best = prices[0];
    const avg = prices[Math.floor(prices.length / 2)];
    const drop = (avg - best) / avg;
    const saving = avg - best;
    if (drop < minDrop || saving < minSaving) continue;
    const winner = fresh.find((o) => o.priceDa === best);
    out.push({
      id: p.id, brand: p.brand, model: p.model, category: p.category,
      best, store: winner?.store ?? "—",
      avg, drop, saving, n: fresh.length,
    });
  }
  return out.sort((a, b) => b.saving - a.saving);
}

console.log('Original criteria (>=3 offers, drop>=8%, saving>=2000):', deals(3, 0.08, 2000).length);
console.log('Rich criteria (>=2 offers, drop>=5%, saving>=1000):', deals(2, 0.05, 1000).length);

const richDeals = deals(2, 0.05, 1000);
console.log('\nTop 15 rich deals:');
richDeals.slice(0, 15).forEach(d => {
  console.log(` - [${d.category}] ${d.brand} ${d.model}: ${d.best} DA (was median ${d.avg} DA) -> Save ${d.saving} DA (-${Math.round(d.drop*100)}%) at ${d.store} (${d.n} offers)`);
});
