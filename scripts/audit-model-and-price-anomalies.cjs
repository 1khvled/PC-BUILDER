const fs = require('fs');

const seed = JSON.parse(fs.readFileSync('supabase-seed.json', 'utf8'));
const prods = new Map(seed.products.map(p => [p.id, p]));

// Group offers by product
const byProd = new Map();
for (const o of seed.offers) {
  if (!byProd.has(o.p)) byProd.set(o.p, []);
  byProd.get(o.p).push(o);
}

const anomalies = [];

// 1. Check Extreme Price Outliers
for (const [pid, offers] of byProd.entries()) {
  const prod = prods.get(pid);
  if (!prod || offers.length < 2) continue;

  const sortedPrices = offers.map(o => o.d).sort((a, b) => a - b);
  const median = sortedPrices[Math.floor(sortedPrices.length / 2)];

  for (const o of offers) {
    // If an offer is less than 35% of median price (e.g. median is 50,000 DA, offer is 15,000 DA)
    if (o.d < median * 0.35 && median > 10000) {
      anomalies.push({
        type: 'PRICE_TOO_LOW',
        productId: pid,
        model: prod.model,
        category: prod.c,
        title: o.t,
        price: o.d,
        medianPrice: median,
        ratio: (o.d / median).toFixed(2),
        store: o.s,
        url: o.u
      });
    }
    // If an offer is more than 280% of median price (e.g. median is 10,000 DA, offer is 40,000 DA -> probably a bundle or whole PC)
    if (o.d > median * 2.8 && median > 5000) {
      anomalies.push({
        type: 'PRICE_TOO_HIGH',
        productId: pid,
        model: prod.model,
        category: prod.c,
        title: o.t,
        price: o.d,
        medianPrice: median,
        ratio: (o.d / median).toFixed(2),
        store: o.s,
        url: o.u
      });
    }
  }
}

// 2. Check Generation & Spec Mismatches
for (const o of seed.offers) {
  const p = prods.get(o.p);
  if (!p) continue;
  const title = (o.t || '').toLowerCase();
  const model = (p.model || '').toLowerCase();
  const pid = o.p.toLowerCase();

  // RAM generation: DDR4 vs DDR5
  if (pid.includes('ddr4') && /\bddr5\b/i.test(title) && !/\bddr4\b/i.test(title)) {
    anomalies.push({ type: 'RAM_GEN_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
  if (pid.includes('ddr5') && /\bddr4\b/i.test(title) && !/\bddr5\b/i.test(title)) {
    anomalies.push({ type: 'RAM_GEN_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }

  // RAM capacity: 16GB vs 32GB vs 8GB
  if (pid.includes('32gb') && /\b(?:16gb|16\s*go|2x8gb|2x8\s*go|8gb|8\s*go)\b/i.test(title) && !/\b(?:32gb|32\s*go|2x16)\b/i.test(title)) {
    anomalies.push({ type: 'RAM_CAPACITY_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
  if (pid.includes('16gb') && /\b(?:8gb|8\s*go|1x8gb|1x8\s*go)\b/i.test(title) && !/\b(?:16gb|16\s*go|2x8)\b/i.test(title)) {
    anomalies.push({ type: 'RAM_CAPACITY_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }

  // SSD capacity: 1TB / 2TB vs 256GB / 512GB
  if ((pid.includes('1tb') || pid.includes('1000gb')) && /\b(?:256gb|256\s*go|250gb|128gb|512gb|500gb)\b/i.test(title) && !/\b(?:1tb|1\s*to|1000gb)\b/i.test(title)) {
    anomalies.push({ type: 'SSD_CAPACITY_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
  if ((pid.includes('2tb') || pid.includes('2000gb')) && /\b(?:256gb|512gb|500gb|1tb|1\s*to)\b/i.test(title) && !/\b(?:2tb|2\s*to)\b/i.test(title)) {
    anomalies.push({ type: 'SSD_CAPACITY_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }

  // GPU model: e.g. 4060 vs 4070 vs 3060 vs 1650 vs 580
  if (pid.includes('4070') && !pid.includes('4070-ti') && /\brtx\s*4060\b/i.test(title) && !/\brtx\s*4070\b/i.test(title)) {
    anomalies.push({ type: 'GPU_MODEL_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
  if (pid.includes('4080') && /\brtx\s*4070\b/i.test(title) && !/\brtx\s*4080\b/i.test(title)) {
    anomalies.push({ type: 'GPU_MODEL_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
  if (pid.includes('4060') && /\b(?:rtx\s*3050|gtx\s*1650|gtx\s*1660|rx\s*580)\b/i.test(title) && !/\brtx\s*4060\b/i.test(title)) {
    anomalies.push({ type: 'GPU_MODEL_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }

  // CPU generation/model: Ryzen 5 5600 vs 3600 vs 7600
  if (pid === 'cpu-r5-5600' && /\bryzen\s*5?\s*3600\b/i.test(title) && !/\bryzen\s*5?\s*5600\b/i.test(title)) {
    anomalies.push({ type: 'CPU_MODEL_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
  if (pid === 'cpu-r5-7600' && /\bryzen\s*5?\s*5600\b/i.test(title) && !/\bryzen\s*5?\s*7600\b/i.test(title)) {
    anomalies.push({ type: 'CPU_MODEL_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
  if (pid.includes('14600') && /\bi5\s*12600\b/i.test(title) && !/\bi5\s*14600\b/i.test(title)) {
    anomalies.push({ type: 'CPU_MODEL_MISMATCH', productId: o.p, model: p.model, title: o.t, price: o.d, store: o.s });
  }
}

console.log('Total Model / Price / Spec Anomalies found: ' + anomalies.length);
anomalies.forEach((a, i) => {
  console.log(`[${i + 1}] [${a.type}] Product: ${a.productId} (${a.model})`);
  console.log(`     Title: "${a.title}" | Price: ${a.price} DA (Median: ${a.medianPrice || 'N/A'}, ratio: ${a.ratio || 'N/A'}) at ${a.store}`);
});
