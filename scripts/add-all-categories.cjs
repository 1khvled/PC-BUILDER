const fs = require('fs');
const path = require('path');

const prodPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
let prod = fs.readFileSync(prodPath, 'utf8');

const target = `export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "cpu", label: "CPU" },
  { slug: "cooler", label: "CPU Cooler" },
  { slug: "motherboard", label: "Motherboard" },
  { slug: "ram", label: "Memory" },
  { slug: "ssd", label: "Storage" },
  { slug: "hdd", label: "Hard Drives" },
  { slug: "gpu", label: "Video Card" },
  { slug: "case", label: "Case" },
  { slug: "psu", label: "Power Supply" },
  { slug: "monitor", label: "Monitor" },
];`;

const replacement = `export const CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "cpu", label: "CPU" },
  { slug: "cooler", label: "CPU Cooler" },
  { slug: "motherboard", label: "Motherboard" },
  { slug: "ram", label: "Memory" },
  { slug: "ssd", label: "Storage" },
  { slug: "hdd", label: "Hard Drives" },
  { slug: "gpu", label: "Video Card" },
  { slug: "case", label: "Case" },
  { slug: "psu", label: "Power Supply" },
  { slug: "monitor", label: "Monitor" },
];

export const SIDE_CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "printer", label: "Printers" },
];

export const ALL_CATEGORIES: { slug: Category; label: string }[] = [
  ...CATEGORIES,
  ...SIDE_CATEGORIES,
];`;

prod = prod.replace(target.replace(/\r\n/g, '\n'), replacement);
prod = prod.replace(target, replacement);

fs.writeFileSync(prodPath, prod, 'utf8');
console.log('Successfully added ALL_CATEGORIES to products.ts!');
