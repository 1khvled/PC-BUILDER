const fs = require('fs');
const path = require('path');

const bakePath = path.join(__dirname, '..', 'bake.cjs');
const code = fs.readFileSync(bakePath, 'utf8');

const rulesMatch = code.match(/const RULES = \[([\s\S]*?)\n\];/);
const rulesCode = 'const RULES = [' + rulesMatch[1] + ']; return RULES;';
const fn = new Function(rulesCode);
const RULES = fn();

const componentCats = ['cooler', 'cpu', 'gpu', 'motherboard', 'ram', 'ssd', 'psu'];

console.log('=== Checking Component Rules for Flagrant Mismatches ===\n');

for (let i = 0; i < RULES.length; i++) {
  const r = RULES[i];
  if (!componentCats.includes(r.cat)) continue;

  const id = r.id;
  const all = r.all || [];
  const any = r.any || [];
  const tokens = [...all, ...any];

  // Specific cooler mismatch check
  if (r.cat === 'cooler') {
    // If id is AM1204 but token is AC902
    if (id === 'cooler-am1204' && tokens.some(t => t.includes('902'))) {
      console.log(`[DISCREPANCY] Cooler Rule #${i}: id="${id}" matches token "${tokens}"`);
    }
    // If id is a specific model but matches a different model
    if (id.includes('ak400') && tokens.some(t => t.includes('ag400') || t.includes('ak500') || t.includes('ak620'))) {
      console.log(`[DISCREPANCY] Cooler Rule #${i}: id="${id}" matches "${tokens}"`);
    }
    if (id.includes('ag400') && tokens.some(t => t.includes('ak400') || t.includes('ag500') || t.includes('ag620'))) {
      console.log(`[DISCREPANCY] Cooler Rule #${i}: id="${id}" matches "${tokens}"`);
    }
  }

  // Check GPU mismatches
  if (r.cat === 'gpu') {
    const idModel = (id.match(/(4090|4080|4070|4060|3090|3080|3070|3060|3050|2060|1660|1650|7900|7800|7700|7600|6700|6600|580|570|b580|a750|a580|a380)/) || [])[1];
    if (idModel) {
      for (const t of tokens) {
        const tokModel = (t.match(/(4090|4080|4070|4060|3090|3080|3070|3060|3050|2060|1660|1650|7900|7800|7700|7600|6700|6600|580|570|b580|a750|a580|a380)/) || [])[1];
        if (tokModel && tokModel !== idModel) {
          console.log(`[DISCREPANCY] GPU Rule #${i}: id="${id}" (model ${idModel}) matches token "${t}" (model ${tokModel})`);
        }
      }
    }
  }

  // Check CPU mismatches
  if (r.cat === 'cpu') {
    const idModel = (id.match(/(5600x|5600g|5600gt|5600|5500|7500f|7600x|7600|7700x|7700|7800x3d|9800x3d|9600x|9700x|12400f|12400|12100f|12100|13400f|13400|14400f|14400|13600kf|13600k|14600kf|14600k|13700f|13700k|14700kf|14700k)/) || [])[1];
    if (idModel) {
      for (const t of tokens) {
        const tokModel = (t.match(/(5600x|5600g|5600gt|5600|5500|7500f|7600x|7600|7700x|7700|7800x3d|9800x3d|9600x|9700x|12400f|12400|12100f|12100|13400f|13400|14400f|14400|13600kf|13600k|14600kf|14600k|13700f|13700k|14700kf|14700k)/) || [])[1];
        if (tokModel && tokModel !== idModel) {
          console.log(`[DISCREPANCY] CPU Rule #${i}: id="${id}" (model ${idModel}) matches token "${t}" (model ${tokModel})`);
        }
      }
    }
  }

  // Check Motherboard mismatches (b550 vs b450 vs b650 vs h610 vs b760)
  if (r.cat === 'motherboard') {
    const idChipset = (id.match(/(b450|b550|a520|b650|a620|b850|x670|x870|h610|b660|b760|z790|z890)/) || [])[1];
    if (idChipset) {
      for (const t of tokens) {
        const tokChipset = (t.match(/(b450|b550|a520|b650|a620|b850|x670|x870|h610|b660|b760|z790|z890)/) || [])[1];
        if (tokChipset && tokChipset !== idChipset) {
          console.log(`[DISCREPANCY] Mobo Rule #${i}: id="${id}" (chipset ${idChipset}) matches token "${t}" (chipset ${tokChipset})`);
        }
      }
    }
  }
}
