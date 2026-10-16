const fs = require('fs');
const seed = JSON.parse(fs.readFileSync('supabase-seed.json', 'utf8'));
const prods = new Map(seed.products.map(p => [p.id, p]));

const BRANDS = [
  'msi', 'asus', 'gigabyte', 'asrock', 'zotac', 'palit', 'inno3d', 'pny', 'xfx',
  'sapphire', 'powercolor', 'corsair', 'kingston', 'adata', 'teamgroup', 'crucial',
  'samsung', 'lexar', 'patriot', 'deepcool', 'thermalright', 'noctua', 'arctic',
  'be quiet', 'nzxt', 'lian li', 'antec', 'cooler master', 'thermaltake', 'seasonic',
  'fsp', 'evga', 'montech', 'fractal', 'hybrok', 'matos', 'redragon', 'havit',
  'gamemax', '1stplayer', 'nox', 'darkflash', 'xigmatek', 'aoc', 'lg', 'benq',
  'viewsonic', 'dell', 'hp', 'lenovo', 'acer', 'xiaomi', 'redmi', 'dahua',
  'hikvision', 'philips', 'koorui', 'cougar', 'aerocool'
];

const mismatches = [];

for (const o of seed.offers) {
  const p = prods.get(o.p);
  if (!p) continue;

  const pBrand = (p.brand || '').toLowerCase().trim();
  if (!pBrand) continue;

  const titleLower = o.t.toLowerCase();

  // Find which brands appear in title
  const foundBrands = BRANDS.filter(b => {
    const re = new RegExp('\\b' + b.replace('.', '\\.') + '\\b', 'i');
    return re.test(titleLower);
  });

  const containsPBrand = new RegExp('\\b' + pBrand.replace('.', '\\.') + '\\b', 'i').test(titleLower);

  const conflicting = foundBrands.filter(b => {
    if (b === pBrand) return false;
    // GPU vendors / mobo vendors
    if (['intel', 'amd'].includes(b) && ['motherboard', 'cooler', 'ram'].includes(p.c)) return false;
    if (p.c === 'gpu') return false; // GPUs often have Nvidia + Asus or AMD + Sapphire etc
    return true;
  });

  if (!containsPBrand && conflicting.length > 0) {
    mismatches.push({
      pid: p.id,
      cat: p.c,
      productBrand: pBrand,
      productModel: p.model,
      detectedBrands: conflicting,
      offerTitle: o.t,
      store: o.s,
      price: o.d,
      url: o.u
    });
  }
}

console.log('Brand mismatches count:', mismatches.length);
const byProd = {};
for (const m of mismatches) {
  if (!byProd[m.pid]) byProd[m.pid] = [];
  byProd[m.pid].push(m);
}

for (const [pid, list] of Object.entries(byProd)) {
  console.log(`\nProduct: ${pid} [Expected Brand: ${list[0].productBrand}] (${list[0].productModel}) - ${list.length} mismatches:`);
  list.slice(0, 5).forEach(m => {
    console.log(`  - Title: "${m.offerTitle}" [Detected: ${m.detectedBrands.join(', ')}] (${m.price} DA at ${m.store})`);
  });
  if (list.length > 5) console.log(`  ... and ${list.length - 5} more`);
}
