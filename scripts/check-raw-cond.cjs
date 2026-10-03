const fs = require('fs');
const path = require('path');
const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

let withCond = 0;
let condValues = {};
for (const o of all.slice(0, 1000)) {
  if (o.condition !== undefined) {
    withCond++;
    condValues[o.condition] = (condValues[o.condition] || 0) + 1;
  }
}
console.log('Sample 1000 items with condition:', withCond, condValues);
console.log('Sample listing keys:', Object.keys(all[0]));
