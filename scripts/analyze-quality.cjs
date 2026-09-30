const fs = require('fs');
const full = JSON.parse(fs.readFileSync('full.json', 'utf8'));
const all = full.report['ouedkniss:all'] || [];
console.log('Total ouedkniss:all listings:', all.length);

// Check title-has-query-keywords ratio
let noKeyword = 0, hasKeyword = 0;
const badExamples = [];
for (const o of all) {
  if (!o.query || !o.title) continue;
  const qWords = o.query.toLowerCase().split(/\s+/).filter(w => w.length > 2);
  const tLow = (o.title || '').toLowerCase();
  const matched = qWords.filter(w => tLow.includes(w)).length;
  if (matched < Math.ceil(qWords.length * 0.5)) {
    noKeyword++;
    if (badExamples.length < 15) badExamples.push({ q: o.query, t: o.title.slice(0,90), p: o.priceDa, store: (o.store||o.seller||'?').slice(0,30) });
  } else {
    hasKeyword++;
  }
}
console.log('Listings with query keywords in title:', hasKeyword);
console.log('Listings WITHOUT query keywords:', noKeyword);
console.log('\nBad examples (title has no query keywords):');
badExamples.forEach(e => console.log('  Q:', e.q, '| T:', e.t, '| P:', e.p, '| S:', e.store));

// Check 'en configuration seulement' listings
const configOnly = all.filter(o => /en\s+config|configuration\s+seul/i.test(o.title || ''));
console.log('\n"En configuration seulement" listings:', configOnly.length);
configOnly.slice(0,5).forEach(o => console.log('  ', o.title?.slice(0,80), o.priceDa, o.query));

// Kit upgrade listings
const kits = all.filter(o => /kit\s+(upgrade|evol)/i.test(o.title || ''));
console.log('\nKit upgrade listings:', kits.length);
kits.slice(0,5).forEach(o => console.log('  ', o.title?.slice(0,80), o.priceDa, o.query));

// Store vs Individual distribution  
const stores = all.filter(o => o.isFromStore);
const indiv = all.filter(o => o.isFromStore === false);
console.log('\nStore listings:', stores.length, 'Individual listings:', indiv.length);

// How many have "Tray" (often sold only in config)
const tray = all.filter(o => /\btray\b/i.test(o.title || ''));
console.log('\nTray listings:', tray.length);
tray.slice(0,5).forEach(o => console.log('  ', o.title?.slice(0,80), o.priceDa, o.query));

// Listings with multiple product names (cross-category contamination)
let crossCat = 0;
const crossEx = [];
for (const o of all) {
  const t = (o.title || '').toLowerCase();
  const hasCPU = /ryzen|i[357]-?\d{4,5}|intel\s+core/i.test(t);
  const hasGPU = /rtx\s*\d{4}|gtx\s*\d{4}|rx\s*\d{3,4}/i.test(t);
  const hasRAM = /\b\d+g[bo]?\s*(ddr[45]|ram)\b|\b(ddr[45])\s*\d+g/i.test(t);
  const hasMobo = /\b[bzhax]\d{3}[me]?\b/i.test(t);
  const cats = [hasCPU, hasGPU, hasRAM, hasMobo].filter(Boolean).length;
  if (cats >= 2) {
    crossCat++;
    if (crossEx.length < 8) crossEx.push({ t: o.title.slice(0,100), p: o.priceDa, q: o.query });
  }
}
console.log('\nMulti-category listings (bundles/configs):', crossCat);
crossEx.forEach(e => console.log('  Q:', e.q, '| T:', e.t, '| P:', e.p));

// Check how many listings have old dates
const now = Date.now();
let old90 = 0, old180 = 0, old365 = 0, noDate = 0;
for (const o of all) {
  const d = o.postedAt || o.day || '';
  if (!d) { noDate++; continue; }
  const age = (now - new Date(d).getTime()) / (1000 * 86400);
  if (age > 365) old365++;
  else if (age > 180) old180++;
  else if (age > 90) old90++;
}
console.log('\nAge distribution: >365d:', old365, '>180d:', old180, '>90d:', old90, 'no date:', noDate);
