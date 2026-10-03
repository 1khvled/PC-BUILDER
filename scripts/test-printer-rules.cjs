const fs = require('fs');
const path = require('path');
const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

const RULES = [
  { id: 'printer-canon-g3411', any: ['g3411', 'g3410'], none: ['tête', 'tete', 'encre', 'cartouche', 'ruban', 'papier', 'pad', 'absorbeur', 'batterie', 'camera', 'photo'] },
  { id: 'printer-canon-g2411', any: ['g2411', 'g2410'], none: ['tête', 'tete', 'encre', 'cartouche', 'ruban', 'papier', 'pad', 'absorbeur'] },
  { id: 'printer-canon-g3420', any: ['g3420', 'g3430', 'g3470'], none: ['tête', 'tete', 'encre', 'cartouche'] },
  { id: 'printer-canon-g2420', any: ['g2420', 'g2460', 'g2470'], none: ['tête', 'tete', 'encre', 'cartouche'] },
  { id: 'printer-canon-mf3010', any: ['mf3010', 'mf 3010'], none: ['toner', 'cartouche', 'film', 'rouleau', 'tambour', 'drum', 'piece', 'pièce'] },
  { id: 'printer-canon-lbp6030', any: ['lbp6030', 'lbp 6030', 'lbp6018', 'lbp 6018', '6030b', '6030w'], none: ['toner', 'cartouche', 'film', 'rouleau', 'tambour'] },
  { id: 'printer-canon-mg2540', any: ['mg2540', 'mg2541'], none: ['cartouche', 'encre'] },
  { id: 'printer-epson-l3250', any: ['l3250', 'l3251'], none: ['tête', 'tete', 'encre', 'cartouche', 'bouteille', 'tampon', 'pad'] },
  { id: 'printer-epson-l3210', any: ['l3210', 'l3211'], none: ['tête', 'tete', 'encre', 'cartouche', 'bouteille', 'tampon', 'pad'] },
  { id: 'printer-epson-l3150', any: ['l3150'], none: ['tête', 'tete', 'encre', 'cartouche', 'bouteille', 'tampon', 'pad'] },
  { id: 'printer-epson-l3110', any: ['l3110'], none: ['tête', 'tete', 'encre', 'cartouche', 'bouteille', 'tampon', 'pad'] },
  { id: 'printer-epson-l4260', any: ['l4260'], none: ['tête', 'tete', 'encre', 'cartouche'] },
  { id: 'printer-epson-l8050', any: ['l8050', 'l805\b'], none: ['tête', 'tete', 'encre', 'cartouche', 'bouteille'] },
  { id: 'printer-epson-m2170', any: ['m2170', 'm2140'], none: ['bouteille', 'encre'] },
  { id: 'printer-hp-laser-107w', any: ['107w', '107a'], none: ['toner', 'cartouche', '106a'] },
  { id: 'printer-hp-mfp-135w', any: ['135w', '135a'], none: ['toner', 'cartouche'] },
  { id: 'printer-hp-smart-tank-580', all: ['smart', 'tank'], any: ['580', '515', '516', '530', '670'], none: ['bouteille', 'encre'] },
  { id: 'printer-pantum-p2509', all: ['pantum'], any: ['p2509', 'p2500', 'p2502'], none: ['toner', 'cartouche'] },
  { id: 'printer-brother-hl1210w', all: ['brother'], any: ['1210', '1212'], none: ['toner', 'tambour'] },
  { id: 'printer-brother-dcpt520w', all: ['brother'], any: ['t520', 't720', 't420'], none: ['bouteille', 'encre'] },
];

const matches = {};
for (const o of all) {
  const t = (o.title || '').toLowerCase();
  if (/appareil photo|reflex|caméra|camera|objectif|vidéoprojecteur|videoprojecteur|data show|lumens|scanner seul|canoscan|batterie/i.test(t)) continue;
  if (!o.priceDa || o.priceDa < 8000 || o.priceDa > 250000) continue;

  for (const r of RULES) {
    if (r.all && !r.all.every(w => new RegExp('\\b' + w, 'i').test(t))) continue;
    if (r.any && !r.any.some(w => new RegExp(w, 'i').test(t))) continue;
    if (r.none && r.none.some(w => new RegExp(w, 'i').test(t))) continue;

    if (!matches[r.id]) matches[r.id] = [];
    matches[r.id].push({ title: o.title, priceDa: o.priceDa, store: o.store || o.seller });
    break;
  }
}

console.log('Matched printer offers:');
let total = 0;
for (const [id, list] of Object.entries(matches)) {
  total += list.length;
  console.log(` - ${id}: ${list.length} offers (min: ${Math.min(...list.map(l=>l.priceDa))} DA, max: ${Math.max(...list.map(l=>l.priceDa))} DA)`);
}
console.log(`Total matched printer offers: ${total}`);
