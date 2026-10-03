const fs = require('fs');
const path = require('path');

const enPath = path.join(__dirname, '..', 'lib', 'i18n', 'dictionaries', 'en.ts');
let en = fs.readFileSync(enPath, 'utf8');
if (!en.includes('prebuilds.sortNewest')) {
  en = en.replace(
    /"prebuilds\.sortPriceDesc":\s*"Price: descending",/,
    '"prebuilds.sortPriceDesc": "Price: descending",\n  "prebuilds.sortNewest": "Newest listings",'
  );
  fs.writeFileSync(enPath, en, 'utf8');
  console.log('Added prebuilds.sortNewest to en.ts');
}

const frPath = path.join(__dirname, '..', 'lib', 'i18n', 'dictionaries', 'fr.ts');
let fr = fs.readFileSync(frPath, 'utf8');
if (!fr.includes('prebuilds.sortNewest')) {
  fr = fr.replace(
    /"prebuilds\.sortPriceDesc":\s*"[^"]+",/,
    (m) => m + '\n  "prebuilds.sortNewest": "Offres les plus récentes",'
  );
  fs.writeFileSync(frPath, fr, 'utf8');
  console.log('Added prebuilds.sortNewest to fr.ts');
}
