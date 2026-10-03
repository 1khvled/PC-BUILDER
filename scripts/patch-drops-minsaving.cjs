const fs = require('fs');
const path = require('path');

for (const p of ['app/drops/page.tsx', 'app/fr/drops/page.tsx']) {
  const filePath = path.join(__dirname, '..', p);
  let content = fs.readFileSync(filePath, 'utf8');

  content = content.replace(
    /const MIN_SAVING = 2000;/,
    'const MIN_SAVING = 1000;'
  );

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${p} with MIN_SAVING = 1000!`);
}
