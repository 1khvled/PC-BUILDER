const fs = require('fs');
const path = require('path');

const bakePath = path.join(__dirname, '..', 'bake.cjs');
const code = fs.readFileSync(bakePath, 'utf8');

// Parse RULES array from bake.cjs
// Format: { cat: "...", id: "...", all: [...], any: [...], none: [...] }
const rulesMatch = code.match(/const RULES = \[([\s\S]*?)\n\];/);
if (!rulesMatch) {
  console.log('Could not find RULES in bake.cjs');
  process.exit(1);
}

// Evaluate RULES safely
const rulesCode = 'const RULES = [' + rulesMatch[1] + ']; return RULES;';
const fn = new Function(rulesCode);
const RULES = fn();
console.log(`Loaded ${RULES.length} rules from bake.cjs`);

// Audit for discrepancies
const discrepancies = [];

for (let i = 0; i < RULES.length; i++) {
  const r = RULES[i];
  const id = r.id;
  const tokens = [...(r.all || []), ...(r.any || [])];
  
  // Extract key model numbers or letters from ID
  // e.g. cooler-am1204 -> "am1204", "1204"
  // cpu-r5-5600x -> "5600x", "5600"
  // gpu-rtx4070-12gb -> "4070"
  const idNums = id.match(/\d{3,5}[a-z]*/gi) || [];
  const idLetters = id.replace(/^(cpu|gpu|cooler|mobo|ram|ssd|psu|case|monitor|printer)-/, '');

  for (const t of tokens) {
    const tokNums = t.match(/\d{3,5}[a-z]*/gi) || [];
    
    // Check if rule has explicit model number that contradicts id model number
    for (const inum of idNums) {
      for (const tnum of tokNums) {
        // e.g. inum = "1204", tnum = "902" or "902k"
        if (inum !== tnum && !inum.includes(tnum) && !tnum.includes(inum)) {
          // Verify if it's a real discrepancy or just generic (e.g. 120mm fan size vs model)
          const isFanSize = ['120', '140', '240', '280', '360', '420', '90', '92'].includes(tnum) && id.includes('cooler');
          const isCapacity = ['128', '256', '512', '1000', '2000', '4000', '16', '32', '64', '8', '12', '24'].includes(tnum);
          const isWattage = ['450', '500', '550', '600', '650', '700', '750', '800', '850', '1000', '1050', '1200'].includes(tnum) && id.includes('psu');

          if (!isFanSize && !isCapacity && !isWattage) {
            discrepancies.push({
              index: i,
              id: r.id,
              cat: r.cat,
              token: t,
              idNum: inum,
              tokNum: tnum,
              rule: r
            });
          }
        }
      }
    }
  }
}

console.log(`\nFound ${discrepancies.length} suspicious rule token mismatches:`);
for (const d of discrepancies) {
  console.log(` - Rule #${d.index}: id="${d.id}" has token="${d.token}" (idNum: ${d.idNum} vs tokNum: ${d.tokNum})`);
  console.log('   Full rule:', JSON.stringify(d.rule));
}
