const fs = require('fs');

let code = fs.readFileSync('bake.cjs', 'utf8');

// Fix store loop: restore clean pid matching
const badStoreMatch = `      let pid = isVeto ? null : matchRule(category, title);
  if (!pid && !isVeto && tCat && tCat !== category) {
    pid = matchRule(tCat, title);
    if (pid) category = tCat;
  }
  if (!pid && !isVeto) {
    // Universal fallback: test if title matches any canonical hardware rule across all categories
    for (const altCat of ["monitor", "psu", "case", "cooler", "ram", "ssd", "motherboard", "cpu", "gpu"]) {
      if (altCat === category) continue;
      const testPid = matchRule(altCat, title);
      if (testPid) {
        pid = testPid;
        category = altCat;
        break;
      }
    }
  }
  if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total // absurd price: ditch total`;

const cleanStoreMatch = `    const pid = isVeto ? null : matchRule(category, title);
    if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total`;

if (code.includes(badStoreMatch)) {
  code = code.replace(badStoreMatch, cleanStoreMatch);
  console.log("Restored clean store loop matching!");
}

// In Ouedkniss loop: apply the universal fallback matching
const okMatchTarget = `  const pid = isVeto ? null : matchRule(category, title);
  if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total`;

const okMatchReplacement = `  let pid = isVeto ? null : matchRule(category, title);
  if (!pid && !isVeto && tCat && tCat !== category) {
    pid = matchRule(tCat, title);
    if (pid) category = tCat;
  }
  if (!pid && !isVeto) {
    // Universal fallback: test if title matches any canonical hardware rule across all categories
    for (const altCat of ["monitor", "psu", "case", "cooler", "ram", "ssd", "motherboard", "cpu", "gpu"]) {
      if (altCat === category) continue;
      const testPid = matchRule(altCat, title);
      if (testPid) {
        pid = testPid;
        category = altCat;
        break;
      }
    }
  }
  if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total`;

if (code.includes(okMatchTarget)) {
  code = code.replace(okMatchTarget, okMatchReplacement);
  console.log("Applied universal fallback matching to Ouedkniss loop!");
}

fs.writeFileSync('bake.cjs', code, 'utf8');
console.log("Saved bake.cjs!");
