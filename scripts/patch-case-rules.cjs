const fs = require('fs');

const path = 'D:/Projects/DZ-PartPicker/bake.cjs';
let content = fs.readFileSync(path, 'utf8');

const target = `{ id: "case-budget", cat: "case", all: ["cmt192"] },
  { id: "case-budget", cat: "case", all: ["ares"] },`;

const replacement = `{ id: "case-budget", cat: "case", any: ["cmt192", "ares", "budget", "haff", "m100a", "m100r"] },
  { id: "case-generic-office", cat: "case", any: ["bureautique", "standard", "office", "simple", "generique", "advance", "mikuso", "delux", "datazone", "segotep", "golden field"] },`;

// Handle either CRLF or LF
if (content.includes(target)) {
  content = content.replace(target, replacement);
} else {
  const targetCRLF = target.replace(/\n/g, '\r\n');
  const replacementCRLF = replacement.replace(/\n/g, '\r\n');
  if (content.includes(targetCRLF)) {
    content = content.replace(targetCRLF, replacementCRLF);
  } else {
    console.error("Target not found!");
    process.exit(1);
  }
}

fs.writeFileSync(path, content, 'utf8');
console.log("Successfully updated case rules in bake.cjs!");
