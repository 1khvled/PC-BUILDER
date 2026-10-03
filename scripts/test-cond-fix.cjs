const fs = require('fs');
const path = require('path');

const full = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'full.json'), 'utf8'));
const all = full.report['ouedkniss:all'] || [];

let newCount = 0;
let usedCount = 0;

for (const o of all) {
  const text = (o.title || '') + ' ' + (o.condition || '');
  const isUsed = /\b(used|occasion|reconditionn[eé]|r[eé]cup[eé]ration|bon [eé]tat|tr[eè]s bon [eé]tat|[789]\/10|مستعمل)\b/i.test(text);
  const isExplicitNew = /neuf|new|blister|jamais|scell|الجديد/i.test(text);
  
  let cond = 'used';
  if (o.isFromStore !== false) {
    cond = isUsed ? 'used' : 'new';
  } else {
    cond = isExplicitNew ? 'new' : 'used';
  }
  
  if (cond === 'new') newCount++;
  else usedCount++;
}

console.log('Stores new count:', newCount, 'Used count:', usedCount);
