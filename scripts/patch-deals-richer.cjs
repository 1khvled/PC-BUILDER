const fs = require('fs');
const path = require('path');

for (const p of ['app/deals/page.tsx', 'app/fr/deals/page.tsx']) {
  const filePath = path.join(__dirname, '..', p);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /if \(fresh\.length < 3\) continue;/,
    'if (fresh.length < 2) continue;'
  );

  content = content.replace(
    /if \(drop < 0\.08 \|\| saving < 2000\) continue;/,
    'if (drop < 0.05 || saving < 1000) continue;'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${p} with richer deals thresholds!`);
}
