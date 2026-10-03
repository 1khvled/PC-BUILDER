const fs = require('fs');
const path = require('path');

// 1. lib/data/products.ts
const prodPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
let prod = fs.readFileSync(prodPath, 'utf8');

if (!prod.includes('export const ALL_CATEGORIES')) {
  prod = prod.replace(
    /export const CATEGORIES: \{ slug: Category; label: string \} = \[([\s\S]*?)\];/,
    `export const CATEGORIES: { slug: Category; label: string }[] = [$1];

export const SIDE_CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "printer", label: "Printers" },
];

export const ALL_CATEGORIES: { slug: Category; label: string }[] = [
  ...CATEGORIES,
  ...SIDE_CATEGORIES,
];`
  );
  fs.writeFileSync(prodPath, prod, 'utf8');
  console.log('Added ALL_CATEGORIES to lib/data/products.ts');
}

// 2. lib/scrapers/validate.ts
const valPath = path.join(__dirname, '..', 'lib', 'scrapers', 'validate.ts');
let val = fs.readFileSync(valPath, 'utf8');

if (!val.includes('printer: createBand')) {
  val = val.replace(
    /monitor: createBand\(3000, 400000\),/,
    'monitor: createBand(3000, 400000),\n  printer: createBand(6000, 300000),'
  );
  fs.writeFileSync(valPath, val, 'utf8');
  console.log('Added printer band to lib/scrapers/validate.ts');
}
