const sharp = require('sharp');
const path = require('path');

async function processLogo() {
  const input = path.resolve('assets/logo-source.png');
  
  // 1. Trim black borders to find exact bounding box of the DZ symbol
  const trimmed = await sharp(input)
    .trim({ background: '#000000', threshold: 15 })
    .toBuffer({ resolveWithObject: true });
    
  console.log('Trimmed dimensions:', trimmed.info.width, trimmed.info.height);
  
  // 2. Output crisp header/nav logo (height 80px)
  await sharp(trimmed.data)
    .resize({ height: 80, fit: 'inside' })
    .webp({ quality: 95 })
    .toFile('public/brand/logo.webp');
  console.log('Generated public/brand/logo.webp');

  // Also replace logo-clean with high-res trimmed logo (kept out of public/
  // so the 800KB+ source never ships to the CDN; regenerate on demand)
  await sharp(trimmed.data)
    .resize({ height: 160, fit: 'inside' })
    .png({ quality: 95 })
    .toFile('assets/logo-clean.png');
  console.log('Generated assets/logo-clean.png');

  // 3. Create square 512x512 icon with dark obsidian background and centered DZ
  const dzSymbol = await sharp(trimmed.data)
    .resize({ width: 440, height: 440, fit: 'inside' })
    .toBuffer();
    
  await sharp({
    create: {
      width: 512,
      height: 512,
      channels: 4,
      background: { r: 11, g: 13, b: 20, alpha: 1 } // #0b0d14 sleek obsidian
    }
  })
  .composite([{ input: dzSymbol, gravity: 'center' }])
  .png()
  .toFile('public/brand/icon.png');
  console.log('Generated public/brand/icon.png');
  
  // Also copy icon.png as favicon
  await sharp('public/brand/icon.png')
    .resize(48, 48)
    .png()
    .toFile('public/favicon.ico');
  console.log('Generated public/favicon.ico');
}

processLogo().catch(console.error);
