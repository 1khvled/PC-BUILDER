const fs = require('fs');

const bakePath = 'D:/Projects/DZ-PartPicker/bake.cjs';
let code = fs.readFileSync(bakePath, 'utf8');

code = code.replace(`fs.writeFileSync("lib/data/live-images-src.json"`, `fs.writeFileSync(require('path').join(__dirname, "lib/data/live-images-src.json")`);
code = code.replace(`fs.readFileSync("lib/data/products.ts", "utf8")`, `fs.readFileSync(require('path').join(__dirname, "lib/data/products.ts"), "utf8")`);
code = code.replace(`fs.writeFileSync("supabase-seed.json"`, `fs.writeFileSync(require('path').join(__dirname, "supabase-seed.json")`);

fs.writeFileSync(bakePath, code, 'utf8');
console.log("All bake paths fixed!");
