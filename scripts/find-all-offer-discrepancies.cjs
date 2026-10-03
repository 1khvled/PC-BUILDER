const fs = require('fs');
const path = require('path');

const seed = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'supabase-seed.json'), 'utf8'));
const offers = seed.offers || [];
const products = seed.products || [];
const prodMap = new Map(products.map(p => [p.id, p]));

console.log(`Analyzing ${offers.length} offers for title vs product mismatches...`);

const suspicious = [];

for (const o of offers) {
  const p = prodMap.get(o.p);
  if (!p) continue;

  const title = (o.t || '').toLowerCase();
  const pModel = (p.model || '').toLowerCase();
  const pBrand = (p.brand || '').toLowerCase();

  // 1. Check cooler model number mismatch
  if (p.category === 'cooler') {
    // e.g. AM1204 vs AC902
    if (p.id === 'cooler-am1204' && !title.includes('1204') && (title.includes('902') || title.includes('ac902'))) {
      suspicious.push({ type: 'COOLER_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
    if (p.id.includes('ag400') && !title.includes('ag400') && (title.includes('ag500') || title.includes('ak500') || title.includes('ak620'))) {
      suspicious.push({ type: 'COOLER_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
    if (p.id.includes('ak400') && !title.includes('ak400') && (title.includes('ag400') || title.includes('ak500') || title.includes('ak620'))) {
      suspicious.push({ type: 'COOLER_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
  }

  // 2. Check GPU chipset mismatch (e.g. 4060 vs 4060 Ti vs 4070 vs 3060 vs 3050)
  if (p.category === 'gpu') {
    const gpuNums = ['4090', '4080', '4070', '4060', '3090', '3080', '3070', '3060', '3050', '2060', '1660', '1650', '7900', '7800', '7700', '7600', '6700', '6600', '580', '570', 'b580', 'a750', 'a580', 'a380'];
    const pGpu = gpuNums.find(n => p.id.includes(n));
    if (pGpu) {
      // Find what GPU number is in the offer title
      const titleGpuMatches = gpuNums.filter(n => new RegExp('\\b' + n + '\\b', 'i').test(title));
      // If title has a different GPU number and NOT the product GPU number
      if (titleGpuMatches.length > 0 && !titleGpuMatches.includes(pGpu)) {
        suspicious.push({ type: 'GPU_MISMATCH', pid: p.id, expected: p.model, found: titleGpuMatches.join(','), store: o.s, price: o.d, title: o.t });
      }
      // Check Ti / Super confusion (e.g. 4060 Ti under 4060 non-Ti, or 4070 Super under 4070)
      if (p.id === 'gpu-rtx4060-8gb' && /\b4060\s*ti\b/i.test(title)) {
        suspicious.push({ type: 'GPU_TI_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
      }
      if (p.id === 'gpu-rtx4070-12gb' && /\b4070\s*super\b|\b4070\s*ti\b/i.test(title)) {
        suspicious.push({ type: 'GPU_TI_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
      }
    }
  }

  // 3. Check CPU mismatch (e.g. 5600 vs 5600X vs 5600G vs 5500, 7500F vs 7600, 12400 vs 12400F)
  if (p.category === 'cpu') {
    if (p.id === 'cpu-r5-5600' && /\b5600x\b/i.test(title)) {
      suspicious.push({ type: 'CPU_X_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
    if (p.id === 'cpu-r5-5600' && /\b5600g\b|\b5600gt\b/i.test(title)) {
      suspicious.push({ type: 'CPU_G_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
    if (p.id === 'cpu-r5-7600' && /\b7600x\b/i.test(title)) {
      suspicious.push({ type: 'CPU_X_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
    if (p.id === 'cpu-r5-7500f' && /\b7600\b/i.test(title) && !title.includes('7500')) {
      suspicious.push({ type: 'CPU_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
  }

  // 4. Check Motherboard chipset mismatch (B550 vs B450 vs B650 vs H610 vs B760 vs Z790)
  if (p.category === 'motherboard') {
    const chipsets = ['b450', 'b550', 'a520', 'b650', 'a620', 'b850', 'x670', 'x870', 'h610', 'b660', 'b760', 'z790', 'z890'];
    const pChip = chipsets.find(c => p.id.includes(c));
    if (pChip) {
      const titleChipMatches = chipsets.filter(c => new RegExp('\\b' + c + '\\b', 'i').test(title));
      if (titleChipMatches.length > 0 && !titleChipMatches.includes(pChip)) {
        suspicious.push({ type: 'MOBO_CHIPSET_MISMATCH', pid: p.id, expected: p.model, found: titleChipMatches.join(','), store: o.s, price: o.d, title: o.t });
      }
    }
  }

  // 5. Check Case mismatch (e.g. MasterBox matching HAF 500/700)
  if (p.category === 'case') {
    if (p.id === 'case-masterbox' && (title.includes('haf') || title.includes('haf500') || title.includes('haf700'))) {
      suspicious.push({ type: 'CASE_MISMATCH', pid: p.id, expected: p.model, store: o.s, price: o.d, title: o.t });
    }
  }
}

console.log(`\nFound ${suspicious.length} offer discrepancies:`);
for (const s of suspicious) {
  console.log(`[${s.type}] ${s.pid} (Expected: ${s.expected})`);
  console.log(`  Store: ${s.store} (${s.price} DA)`);
  console.log(`  Title: "${s.title}"`);
}
