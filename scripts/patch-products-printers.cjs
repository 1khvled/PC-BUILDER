const fs = require('fs');
const path = require('path');

const prodPath = path.join(__dirname, '..', 'lib', 'data', 'products.ts');
let content = fs.readFileSync(prodPath, 'utf8');

// 1. Update Category type and export SIDE_CATEGORIES / ALL_CATEGORIES
if (!content.includes('"printer"')) {
  content = content.replace(
    /export type Category =\s*\| "cpu" \| "cooler" \| "motherboard" \| "ram"\s*\| "ssd" \| "hdd" \| "gpu" \| "case" \| "psu" \| "monitor";/,
    `export type Category =
  | "cpu" | "cooler" | "motherboard" | "ram"
  | "ssd" | "hdd" | "gpu" | "case" | "psu" | "monitor"
  | "printer";`
  );

  content = content.replace(
    /export const CATEGORIES: \{ slug: Category; label: string \} = \[([\s\S]*?)\];/,
    (match) => `${match}

export const SIDE_CATEGORIES: { slug: Category; label: string }[] = [
  { slug: "printer", label: "Imprimantes" },
];

export const ALL_CATEGORIES = [...CATEGORIES, ...SIDE_CATEGORIES];`
  );
}

// 2. Add canonical printer products to PRODUCTS
const PRINTER_PRODUCTS = `  // --- Side Products: Printers (Not included in System Builder) ---
  { id: "printer-canon-g3411", category: "printer", brand: "Canon", model: "PIXMA G3411 / G3410 MegaTank WiFi", specs: { type: "inktank", color: true, wifi: true, ppm: 8.8 } },
  { id: "printer-canon-g2411", category: "printer", brand: "Canon", model: "PIXMA G2411 / G2410 MegaTank", specs: { type: "inktank", color: true, wifi: false, ppm: 8.8 } },
  { id: "printer-canon-g3420", category: "printer", brand: "Canon", model: "PIXMA G3420 / G3430 MegaTank WiFi", specs: { type: "inktank", color: true, wifi: true, ppm: 9.1 } },
  { id: "printer-canon-g2420", category: "printer", brand: "Canon", model: "PIXMA G2420 / G2470 MegaTank", specs: { type: "inktank", color: true, wifi: false, ppm: 9.1 } },
  { id: "printer-canon-mf3010", category: "printer", brand: "Canon", model: "i-SENSYS MF3010 3-en-1 Laser", specs: { type: "laser", color: false, wifi: false, ppm: 18 } },
  { id: "printer-canon-lbp6030", category: "printer", brand: "Canon", model: "i-SENSYS LBP6030B / LBP6018L Laser", specs: { type: "laser", color: false, wifi: false, ppm: 18 } },
  { id: "printer-canon-mg2540", category: "printer", brand: "Canon", model: "PIXMA MG2540S / MG2541S", specs: { type: "inkjet", color: true, wifi: false, ppm: 8.0 } },
  { id: "printer-epson-l3250", category: "printer", brand: "Epson", model: "EcoTank L3250 / L3251 WiFi", specs: { type: "ecotank", color: true, wifi: true, ppm: 10 } },
  { id: "printer-epson-l3210", category: "printer", brand: "Epson", model: "EcoTank L3210 USB", specs: { type: "ecotank", color: true, wifi: false, ppm: 10 } },
  { id: "printer-epson-l3150", category: "printer", brand: "Epson", model: "EcoTank L3150 WiFi", specs: { type: "ecotank", color: true, wifi: true, ppm: 10 } },
  { id: "printer-epson-l3110", category: "printer", brand: "Epson", model: "EcoTank L3110 USB", specs: { type: "ecotank", color: true, wifi: false, ppm: 10 } },
  { id: "printer-epson-l4260", category: "printer", brand: "Epson", model: "EcoTank L4260 Recto-Verso WiFi", specs: { type: "ecotank", color: true, wifi: true, duplex: true, ppm: 10.5 } },
  { id: "printer-epson-l8050", category: "printer", brand: "Epson", model: "EcoTank L8050 Photo 6 Couleurs WiFi", specs: { type: "ecotank_photo", color: true, wifi: true, inks: 6 } },
  { id: "printer-epson-m2170", category: "printer", brand: "Epson", model: "EcoTank M2170 Monochrome Recto-Verso WiFi", specs: { type: "ecotank_mono", color: false, wifi: true, duplex: true, ppm: 20 } },
  { id: "printer-hp-laser-107w", category: "printer", brand: "HP", model: "Laser 107w / 107a Monochrome", specs: { type: "laser", color: false, wifi: true, ppm: 20 } },
  { id: "printer-hp-mfp-135w", category: "printer", brand: "HP", model: "Laser MFP 135w Multifonction WiFi", specs: { type: "laser", color: false, wifi: true, ppm: 20 } },
  { id: "printer-hp-smart-tank-580", category: "printer", brand: "HP", model: "Smart Tank 580 / 515 Tout-en-un WiFi", specs: { type: "smart_tank", color: true, wifi: true, ppm: 12 } },
  { id: "printer-pantum-p2509", category: "printer", brand: "Pantum", model: "P2509 / P2500W Laser Monochrome", specs: { type: "laser", color: false, wifi: true, ppm: 22 } },
  { id: "printer-brother-hl1210w", category: "printer", brand: "Brother", model: "HL-1210W / HL-1212W Laser WiFi", specs: { type: "laser", color: false, wifi: true, ppm: 20 } },
  { id: "printer-brother-dcpt520w", category: "printer", brand: "Brother", model: "InkBenefit DCP-T520W Tout-en-un WiFi", specs: { type: "inktank", color: true, wifi: true, ppm: 17 } },
`;

if (!content.includes('printer-canon-g3411')) {
  content = content.replace(
    /(\{ id: "hdd-1tb"[^\n]+\n)/,
    `$1${PRINTER_PRODUCTS}`
  );
}

fs.writeFileSync(prodPath, content, 'utf8');
console.log('Successfully patched lib/data/products.ts with printers!');
