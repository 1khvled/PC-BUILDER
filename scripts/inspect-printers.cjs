const fs = require('fs');
const path = require('path');
const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

const models = {};
for (const o of all) {
  const t = (o.title || '').toLowerCase();
  if (!/imprimante|ecotank|pixma|laserjet|deskjet|smart\s*tank|canon\s*g\d{4}|epson\s*l\d{4}|hp\s*laser/i.test(t)) continue;
  if (/ruban|encre|cartouche|bouteille|toner|cable|tête d'impression|papier/i.test(t) && !/imprimante/i.test(t)) continue;

  let modelKey = 'other';
  if (/l3250|l3251/i.test(t)) modelKey = 'Epson EcoTank L3250';
  else if (/l3150/i.test(t)) modelKey = 'Epson EcoTank L3150';
  else if (/l3210/i.test(t)) modelKey = 'Epson EcoTank L3210';
  else if (/l3110/i.test(t)) modelKey = 'Epson EcoTank L3110';
  else if (/l4260/i.test(t)) modelKey = 'Epson EcoTank L4260';
  else if (/l8050|l805\b/i.test(t)) modelKey = 'Epson EcoTank L8050';
  else if (/m2170|m2140/i.test(t)) modelKey = 'Epson EcoTank M2170 Mono';
  else if (/m1120|m1100/i.test(t)) modelKey = 'Epson EcoTank M1120 Mono';
  else if (/g3411|g3410/i.test(t)) modelKey = 'Canon PIXMA G3411 WiFi';
  else if (/g2411|g2410/i.test(t)) modelKey = 'Canon PIXMA G2411';
  else if (/g3420|g3430/i.test(t)) modelKey = 'Canon PIXMA G3420 WiFi';
  else if (/g2420|g2430/i.test(t)) modelKey = 'Canon PIXMA G2420';
  else if (/g640/i.test(t)) modelKey = 'Canon PIXMA G640 Photo';
  else if (/107w|107a/i.test(t)) modelKey = 'HP Laser 107w/107a Mono';
  else if (/135w|135a/i.test(t)) modelKey = 'HP Laser MFP 135w';
  else if (/150nw|150a/i.test(t)) modelKey = 'HP Color Laser 150nw';
  else if (/smart\s*tank\s*515|smart\s*tank\s*580/i.test(t)) modelKey = 'HP Smart Tank 580/515';
  else if (/m110w|m110we/i.test(t)) modelKey = 'HP LaserJet M110w';
  else if (/mf3010/i.test(t)) modelKey = 'Canon i-SENSYS MF3010';
  else if (/lbp6030/i.test(t)) modelKey = 'Canon i-SENSYS LBP6030B';
  else if (/hl-1210|hl-1212/i.test(t)) modelKey = 'Brother HL-1210W';
  else if (/dcp-t520|dcp-t720/i.test(t)) modelKey = 'Brother InkBenefit DCP-T520W';

  models[modelKey] = (models[modelKey] || 0) + 1;
}

console.log('Top printer models in catalog:');
for (const [k, v] of Object.entries(models).sort((a,b) => b[1] - a[1])) {
  console.log(` - ${k}: ${v} listings`);
}
