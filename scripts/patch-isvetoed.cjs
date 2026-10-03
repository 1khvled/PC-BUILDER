const fs = require('fs');

const path = 'D:/Projects/DZ-PartPicker/bake.cjs';
let content = fs.readFileSync(path, 'utf8');

const target = '  if (url && NON_PC_SLUG_VETO.test(url)) return true;';
const replacement = `  if (url && NON_PC_SLUG_VETO.test(url)) return true;
  if (PHONE_CAR_VETO.test(title) || (url && PHONE_CAR_VETO.test(url))) return true;
  if (category !== "ssd" && category !== "monitor" && category !== "printer") {
    if (NON_PC_BRAND_VETO.test(title)) return true;
  }`;

if (!content.includes(target)) {
  console.error("Target string not found in bake.cjs!");
  process.exit(1);
}

content = content.replace(target, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log("Successfully patched isVetoed in bake.cjs!");
