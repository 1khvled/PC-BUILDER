const fs = require('fs');
const path = require('path');

const bakePath = path.join(__dirname, '..', 'bake.cjs');
let content = fs.readFileSync(bakePath, 'utf8');

// 1. Add printer rules to RULES
const PRINTER_RULES = `
  // --- Printers (Side Products) ---
  { cat: "printer", id: "printer-canon-g3411", any: ["g3411", "g3410"], none: ["tete", "tête", "encre", "cartouche", "ruban", "papier", "pad", "absorbeur", "batterie", "camera", "photo"] },
  { cat: "printer", id: "printer-canon-g2411", any: ["g2411", "g2410"], none: ["tete", "tête", "encre", "cartouche", "ruban", "papier", "pad", "absorbeur"] },
  { cat: "printer", id: "printer-canon-g3420", any: ["g3420", "g3430", "g3470"], none: ["tete", "tête", "encre", "cartouche"] },
  { cat: "printer", id: "printer-canon-g2420", any: ["g2420", "g2460", "g2470"], none: ["tete", "tête", "encre", "cartouche"] },
  { cat: "printer", id: "printer-canon-mf3010", any: ["mf3010", "mf 3010"], none: ["toner", "cartouche", "film", "rouleau", "tambour", "drum", "piece", "pièce"] },
  { cat: "printer", id: "printer-canon-lbp6030", any: ["lbp6030", "lbp 6030", "lbp6018", "lbp 6018", "6030b", "6030w"], none: ["toner", "cartouche", "film", "rouleau", "tambour"] },
  { cat: "printer", id: "printer-canon-mg2540", any: ["mg2540", "mg2541"], none: ["cartouche", "encre"] },
  { cat: "printer", id: "printer-epson-l3250", any: ["l3250", "l3251"], none: ["tete", "tête", "encre", "cartouche", "bouteille", "tampon", "pad"] },
  { cat: "printer", id: "printer-epson-l3210", any: ["l3210", "l3211"], none: ["tete", "tête", "encre", "cartouche", "bouteille", "tampon", "pad"] },
  { cat: "printer", id: "printer-epson-l3150", any: ["l3150"], none: ["tete", "tête", "encre", "cartouche", "bouteille", "tampon", "pad"] },
  { cat: "printer", id: "printer-epson-l3110", any: ["l3110"], none: ["tete", "tête", "encre", "cartouche", "bouteille", "tampon", "pad"] },
  { cat: "printer", id: "printer-epson-l4260", any: ["l4260"], none: ["tete", "tête", "encre", "cartouche"] },
  { cat: "printer", id: "printer-epson-l8050", any: ["l8050", "l805"], none: ["tete", "tête", "encre", "cartouche", "bouteille"] },
  { cat: "printer", id: "printer-epson-m2170", any: ["m2170", "m2140"], none: ["bouteille", "encre"] },
  { cat: "printer", id: "printer-hp-laser-107w", any: ["107w", "107a"], none: ["toner", "cartouche", "106a"] },
  { cat: "printer", id: "printer-hp-mfp-135w", any: ["135w", "135a"], none: ["toner", "cartouche"] },
  { cat: "printer", id: "printer-hp-smart-tank-580", all: ["smart", "tank"], any: ["580", "515", "516", "530", "670"], none: ["bouteille", "encre"] },
  { cat: "printer", id: "printer-pantum-p2509", all: ["pantum"], any: ["p2509", "p2500", "p2502"], none: ["toner", "cartouche"] },
  { cat: "printer", id: "printer-brother-hl1210w", all: ["brother"], any: ["1210", "1212"], none: ["toner", "tambour"] },
  { cat: "printer", id: "printer-brother-dcpt520w", all: ["brother"], any: ["t520", "t720", "t420"], none: ["bouteille", "encre"] },
`;

if (!content.includes('"printer-canon-g3411"')) {
  content = content.replace(
    /const RULES = \[/,
    `const RULES = [${PRINTER_RULES}`
  );
  console.log('Added printer rules to bake.cjs');
}

// 2. Add printer to detectTitleCategory
if (!content.includes('return "printer"')) {
  content = content.replace(
    /function detectTitleCategory\(title\) \{[\s\S]*?const t = " " \+ norm\(title\) \+ " ";/,
    (match) => `${match}\n  if (/\\b(imprimante|ecotank|pixma|laserjet|laser\\s*mfp|smart\\s*tank|copieur|multifonction\\s*laser|selphy|i-sensys|megatank)\\b/i.test(t)) return "printer";`
  );
  console.log('Added printer detection to detectTitleCategory');
}

// 3. Add printer to detectQueryCategory
if (!content.includes('return "printer";')) {
  content = content.replace(
    /function detectQueryCategory\(q\) \{[\s\S]*?if \(!q\) return "gpu";[\s\S]*?const low = q\.toLowerCase\(\)\.trim\(\);/,
    (match) => `${match}\n  if (/imprimante|ecotank|pixma|laserjet|smart\\s*tank|pantum/i.test(low)) return "printer";`
  );
  console.log('Added printer detection to detectQueryCategory');
}

// 4. Add printer to CAT_BANDS
if (!content.includes('printer: [')) {
  content = content.replace(
    /monitor: \[3000, 400000\]/,
    'monitor: [3000, 400000], printer: [6000, 300000]'
  );
  console.log('Added printer to CAT_BANDS');
}

// 5. Upgrade store condition logic in Ouedkniss loop (lines 1502)
content = content.replace(
  /const isNew = \/neuf\|new\|blister\|jamais\|scell\/i\.test\(title\);/,
  `const isUsed = /\\b(used|occasion|reconditionn[eé]|r[eé]cup[eé]ration|bon [eé]tat|tr[eè]s bon [eé]tat|[789]\\/10|مستعمل)\\b/i.test(title + " " + (o.description || ""));
  const isExplicitNew = /neuf|new|blister|jamais|scell|الجديد/i.test(title + " " + (o.description || ""));
  const cond = (o.isFromStore !== false) ? (isUsed ? "used" : "new") : (isExplicitNew ? "new" : "used");`
);

content = content.replace(/condition: isNew \? "new" : "used"/g, 'condition: cond');
console.log('Updated condition logic in bake.cjs');

fs.writeFileSync(bakePath, content, 'utf8');
console.log('bake.cjs successfully patched!');
