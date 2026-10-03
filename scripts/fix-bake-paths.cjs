const fs = require('fs');
const path = require('path');

const bakePath = 'D:/Projects/DZ-PartPicker/bake.cjs';
let code = fs.readFileSync(bakePath, 'utf8');

// Replace path references with path.join(__dirname, ...)
code = code.replace(`fs.readFileSync("full.json"`, `fs.readFileSync(require('path').join(__dirname, "full.json")`);
code = code.replace(`fs.readFileSync("lib/data/products.ts"`, `fs.readFileSync(require('path').join(__dirname, "lib/data/products.ts")`);
code = code.replace(`"lib/data/live.ts"`, `require('path').join(__dirname, "lib/data/live.ts")`);
code = code.replace(`"supabase-seed.json"`, `require('path').join(__dirname, "supabase-seed.json")`);

fs.writeFileSync(bakePath, code, 'utf8');
console.log("bake.cjs paths made absolute to __dirname!");
