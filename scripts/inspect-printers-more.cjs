const fs = require('fs');
const path = require('path');
const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

const titles = new Set();
for (const o of all) {
  const t = (o.title || '').toLowerCase();
  if (!/imprimante|ecotank|pixma|laserjet|deskjet|smart\s*tank|canon|epson|brother/i.test(t)) continue;
  if (/g341[01]|mf3010|lbp6030|g241[01]|l325[01]|l8050|l3210/i.test(t)) continue;
  if (/ruban|encre|cartouche|bouteille|toner|cable|tête d'impression|papier/i.test(t) && !/imprimante/i.test(t)) continue;
  titles.add(o.title.trim());
}

console.log('Distinct other printer titles (' + titles.size + '):');
[...titles].slice(0, 30).forEach(t => console.log(' - ' + t));
