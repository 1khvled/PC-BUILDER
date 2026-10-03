const fs = require('fs');

const path = 'D:/Projects/DZ-PartPicker/bake.cjs';
let content = fs.readFileSync(path, 'utf8');

const target = `"EL ASSLI HI TECH": "Alger", TRETEC: "Alger", "INFO TECH": "Alger"`;
const replacement = `"EL ASSLI HI TECH": "Alger", TRETEC: "Alger", "INFO TECH": "Alger",
  "TeqniyaStore": "Alger", "Bytek Store": "Alger", "AMI Informatique": "Alger", "Ozinformatique": "Alger", "Promotech IT": "Alger"`;

content = content.replace(target, replacement);
fs.writeFileSync(path, content, 'utf8');
console.log("WILAYA mapping updated!");
