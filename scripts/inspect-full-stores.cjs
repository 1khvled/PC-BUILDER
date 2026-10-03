const fs = require('fs');

const fullData = JSON.parse(fs.readFileSync('D:/Projects/DZ-PartPicker/full.json', 'utf8'));
const offers = fullData.report?.['ouedkniss:all'] || [];

const storeCounts = {};
for (const o of offers) {
  const s = o.store || o.seller || "Unknown";
  storeCounts[s] = (storeCounts[s] || 0) + 1;
}

const sorted = Object.entries(storeCounts).sort((a, b) => b[1] - a[1]);
console.log(`Total offers: ${offers.length}`);
console.log(`Total unique stores: ${sorted.length}`);
console.log(`Top 30 stores:`);
for (let i = 0; i < Math.min(30, sorted.length); i++) {
  console.log(`  ${i + 1}. ${sorted[i][0]}: ${sorted[i][1]} offers`);
}

// Check specific stores:
const checkStores = [
  "Promotech IT", "AMI Informatique", "Ozinformatique", "Campus", "Campus Informatique",
  "KhabirTech", "Informatics", "DeskCom", "Click-DZ", "GamingDZ", "Lahlou", "Blida Computer",
  "Matos", "NextGen", "HardSoft", "KOTEK", "Digitec", "WifiDjelfa", "GigaStore", "LICB+"
];
console.log("\nStandalone store presence in full.json:");
for (const cs of checkStores) {
  const match = sorted.find(s => s[0].toLowerCase().includes(cs.toLowerCase()));
  if (match) {
    console.log(`  [FOUND] ${cs} -> "${match[0]}": ${match[1]} offers`);
  } else {
    console.log(`  [MISSING] ${cs}: 0 offers`);
  }
}
