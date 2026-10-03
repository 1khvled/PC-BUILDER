const fs = require('fs');
const path = require('path');

const en = fs.readFileSync(path.join(__dirname, '..', 'lib', 'i18n', 'dictionaries', 'en.ts'), 'utf8');
const fr = fs.readFileSync(path.join(__dirname, '..', 'lib', 'i18n', 'dictionaries', 'fr.ts'), 'utf8');

console.log('EN contains category.monitor:', en.includes('"category.monitor"'));
console.log('EN contains common.monitor:', en.includes('"common.monitor"'));

const catKeysEn = [...en.matchAll(/"(category|nav|home)\.[^"]*monitor[^"]*":/g)].map(m => m[0]);
console.log('Monitor related keys in EN:', catKeysEn);
