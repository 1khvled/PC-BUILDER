const fs = require('fs');
const path = require('path');

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase-seed.json'), 'utf8'));
const offers = seed.offers || [];
const products = seed.products || [];
const prodMap = new Map(products.map(p => [p.id, p]));

const ramMismatches = [];
const ssdMismatches = [];
const monitorMismatches = [];

for (const o of offers) {
  const p = prodMap.get(o.p);
  if (!p) continue;
  const title = (o.t || '').toLowerCase();

  // 1. RAM Capacity & Generation
  if (p.category === 'ram') {
    const is32 = p.id.includes('32');
    const is16 = p.id.includes('16');
    const is64 = p.id.includes('64');
    const isDdr5 = p.id.includes('d5') || p.id.includes('ddr5');
    const isDdr4 = p.id.includes('d4') || p.id.includes('ddr4');

    if (is16 && (title.includes('32gb') || title.includes('32 gb') || title.includes('2x16gb') || title.includes('2x16 gb') || title.includes('64gb'))) {
      ramMismatches.push({ id: p.id, expected: p.model, title: o.t, store: o.s, price: o.d });
    }
    if (is32 && (title.includes('16gb') || title.includes('16 gb') || title.includes('2x8gb') || title.includes('2x8 gb') || title.includes('8gb')) && !title.includes('32gb') && !title.includes('2x16')) {
      ramMismatches.push({ id: p.id, expected: p.model, title: o.t, store: o.s, price: o.d });
    }
    if (isDdr4 && (title.includes('ddr5') || title.includes('d5\b'))) {
      ramMismatches.push({ id: p.id, expected: p.model, title: o.t, store: o.s, price: o.d });
    }
    if (isDdr5 && (title.includes('ddr4') || title.includes('d4\b'))) {
      ramMismatches.push({ id: p.id, expected: p.model, title: o.t, store: o.s, price: o.d });
    }
  }

  // 2. SSD Capacity
  if (p.category === 'ssd') {
    const is1tb = p.id.includes('1tb');
    const is2tb = p.id.includes('2tb');
    const is500gb = p.id.includes('500gb') || p.id.includes('512gb');

    if (is1tb && (title.includes('2tb') || title.includes('2 tb') || title.includes('500gb') || title.includes('512gb') || title.includes('250gb') || title.includes('256gb')) && !title.includes('1tb') && !title.includes('1 tb') && !title.includes('1000gb')) {
      ssdMismatches.push({ id: p.id, expected: p.model, title: o.t, store: o.s, price: o.d });
    }
    if (is2tb && (title.includes('1tb') || title.includes('1 tb') || title.includes('500gb') || title.includes('512gb')) && !title.includes('2tb') && !title.includes('2 tb')) {
      ssdMismatches.push({ id: p.id, expected: p.model, title: o.t, store: o.s, price: o.d });
    }
    if (is500gb && (title.includes('1tb') || title.includes('1 tb') || title.includes('2tb') || title.includes('2 tb')) && !title.includes('500gb') && !title.includes('512gb')) {
      ssdMismatches.push({ id: p.id, expected: p.model, title: o.t, store: o.s, price: o.d });
    }
  }
}

console.log(`RAM mismatches: ${ramMismatches.length}`);
ramMismatches.forEach(m => console.log(` - [${m.id}] ${m.store} (${m.price} DA): "${m.title}"`));

console.log(`SSD mismatches: ${ssdMismatches.length}`);
ssdMismatches.forEach(m => console.log(` - [${m.id}] ${m.store} (${m.price} DA): "${m.title}"`));
