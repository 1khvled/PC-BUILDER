const fs = require('fs');
const path = require('path');
const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

const storePrinters = {};
for (const o of all) {
  const t = (o.title || '').toLowerCase();
  if (/imprimante|ecotank|pixma|laserjet|laser\s*mfp|smart\s*tank|canon\s*g\d{4}|epson\s*l\d{4}|hp\s*laser\s*107|i-sensys/i.test(t)) {
    if (/ruban|encre|cartouche|bouteille|toner|cable|tête d'impression|papier|canoscan|scanner seul/i.test(t) && !/imprimante/i.test(t)) continue;
    const s = o.store || o.seller || 'Autre';
    storePrinters[s] = (storePrinters[s] || 0) + 1;
  }
}

console.log('Stores with printers:');
for (const [s, count] of Object.entries(storePrinters).sort((a,b) => b[1] - a[1]).slice(0, 25)) {
  console.log(` - ${s}: ${count} printers`);
}
