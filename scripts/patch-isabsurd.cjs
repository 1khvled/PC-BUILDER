const fs = require('fs');
const path = require('path');

const bakePath = path.join(__dirname, '..', 'bake.cjs');
let code = fs.readFileSync(bakePath, 'utf8');

code = code.replace(
  'if (/^(?:1000|1111|1234|12345|123456|9999|99999|1000000)$/.test(String(price))) return true;',
  `if (/^(?:1000|1111|11111|111111|1234|12345|123456|9999|99999|999999|1000000)$/.test(String(price))) return true;\n  if (pid === "printer-canon-lbp6030" && price > 65000) return true;`
);

fs.writeFileSync(bakePath, code, 'utf8');
console.log('Successfully hardened isAbsurd in bake.cjs');
