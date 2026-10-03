const fs = require('fs');
const path = require('path');

// 1. Dictionaries
const enPath = path.join(__dirname, '..', 'lib', 'i18n', 'dictionaries', 'en.ts');
let en = fs.readFileSync(enPath, 'utf8');
if (!en.includes('"cats.printer"')) {
  en = en.replace(
    /"cats\.monitor":\s*"[^"]+",/,
    (m) => `${m}\n  "cats.printer": "Printers",`
  );
  fs.writeFileSync(enPath, en, 'utf8');
  console.log('Added cats.printer to en.ts');
}

const frPath = path.join(__dirname, '..', 'lib', 'i18n', 'dictionaries', 'fr.ts');
let fr = fs.readFileSync(frPath, 'utf8');
if (!fr.includes('"cats.printer"')) {
  fr = fr.replace(
    /"cats\.monitor":\s*"[^"]+",/,
    (m) => `${m}\n  "cats.printer": "Imprimantes",`
  );
  fs.writeFileSync(frPath, fr, 'utf8');
  console.log('Added cats.printer to fr.ts');
}

// 2. categories.ts
const catPath = path.join(__dirname, '..', 'lib', 'i18n', 'categories.ts');
let cat = fs.readFileSync(catPath, 'utf8');
if (!cat.includes('printer: "cats.printer"')) {
  cat = cat.replace(
    /monitor:\s*"cats\.monitor",/,
    'monitor: "cats.monitor",\n  printer: "cats.printer",'
  );
  fs.writeFileSync(catPath, cat, 'utf8');
  console.log('Added printer to CATEGORY_KEYS in categories.ts');
}

// 3. Category pages
const enCatPage = path.join(__dirname, '..', 'app', 'category', '[slug]', 'page.tsx');
let enCat = fs.readFileSync(enCatPage, 'utf8');
if (enCat.includes('import { CATEGORIES,')) {
  enCat = enCat.replace('import { CATEGORIES,', 'import { ALL_CATEGORIES as CATEGORIES,');
  fs.writeFileSync(enCatPage, enCat, 'utf8');
  console.log('Updated app/category/[slug]/page.tsx to use ALL_CATEGORIES');
}

const frCatPage = path.join(__dirname, '..', 'app', 'fr', 'category', '[slug]', 'page.tsx');
let frCat = fs.readFileSync(frCatPage, 'utf8');
if (frCat.includes('import { CATEGORIES,')) {
  frCat = frCat.replace('import { CATEGORIES,', 'import { ALL_CATEGORIES as CATEGORIES,');
  fs.writeFileSync(frCatPage, frCat, 'utf8');
  console.log('Updated app/fr/category/[slug]/page.tsx to use ALL_CATEGORIES');
}
