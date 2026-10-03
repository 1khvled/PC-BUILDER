const fs = require('fs');
const path = require('path');

const fullPath = path.join(__dirname, '..', 'full.json');
const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

// Combine ouedkniss:all and any standalone store listings
const rawListings = full.report['ouedkniss:all'] || [];

console.log(`Analyzing ${rawListings.length} total listings for prebuilts...`);

function parseSpecs(title, desc = '') {
  const t = (title + ' ' + (desc || '')).toLowerCase();

  // Non-PC veto: laptops, phones, screens, accessories only, repairs
  if (/laptop|pc portable|ordinateur portable|notebook|ultrabook|macbook|thinkpad/i.test(t)) return null;
  if (/playstation|ps5|ps4|xbox|nintendo|switch/i.test(t)) return null;
  if (/smartphone|téléphone|telephone|reparation|réparation|pièce de rechange|a7 2018|galaxy|iphone|redmi|oppo/i.test(t)) return null;
  if (/ecran seul|écran seul|sans unité|sans unite|bureau gamer seul|fauteuil|chaise gamer/i.test(t)) return null;

  // CPU detection
  let cpu = null;
  if (/9800x3d\b/i.test(t)) cpu = { id: 'cpu-r7-9800x3d', name: 'Ryzen 7 9800X3D', brand: 'AMD' };
  else if (/7800x3d\b/i.test(t)) cpu = { id: 'cpu-r7-7800x3d', name: 'Ryzen 7 7800X3D', brand: 'AMD' };
  else if (/7950x3d\b/i.test(t)) cpu = { id: 'cpu-r9-7950x3d', name: 'Ryzen 9 7950X3D', brand: 'AMD' };
  else if (/7950x\b/i.test(t)) cpu = { id: 'cpu-r9-7950x', name: 'Ryzen 9 7950X', brand: 'AMD' };
  else if (/7900x3d\b/i.test(t)) cpu = { id: 'cpu-r9-7900x', name: 'Ryzen 9 7900X3D', brand: 'AMD' };
  else if (/7900x\b|7900\b/i.test(t)) cpu = { id: 'cpu-r9-7900x', name: 'Ryzen 9 7900X', brand: 'AMD' };
  else if (/9700x\b/i.test(t)) cpu = { id: 'cpu-r7-9700x', name: 'Ryzen 7 9700X', brand: 'AMD' };
  else if (/9600x\b/i.test(t)) cpu = { id: 'cpu-r5-9600x', name: 'Ryzen 5 9600X', brand: 'AMD' };
  else if (/7700x\b/i.test(t)) cpu = { id: 'cpu-r7-7700x', name: 'Ryzen 7 7700X', brand: 'AMD' };
  else if (/7700\b/i.test(t)) cpu = { id: 'cpu-r7-7700', name: 'Ryzen 7 7700', brand: 'AMD' };
  else if (/7600x\b/i.test(t)) cpu = { id: 'cpu-r5-7600x', name: 'Ryzen 5 7600X', brand: 'AMD' };
  else if (/7600\b/i.test(t)) cpu = { id: 'cpu-r5-7600', name: 'Ryzen 5 7600', brand: 'AMD' };
  else if (/7500f\b/i.test(t)) cpu = { id: 'cpu-r5-7500f', name: 'Ryzen 5 7500F', brand: 'AMD' };
  else if (/5800x3d\b/i.test(t)) cpu = { id: 'cpu-r7-5800x3d', name: 'Ryzen 7 5800X3D', brand: 'AMD' };
  else if (/5800x\b/i.test(t)) cpu = { id: 'cpu-r7-5800x', name: 'Ryzen 7 5800X', brand: 'AMD' };
  else if (/5700x3d\b/i.test(t)) cpu = { id: 'cpu-r7-5700x3d', name: 'Ryzen 7 5700X3D', brand: 'AMD' };
  else if (/5700x\b/i.test(t)) cpu = { id: 'cpu-r7-5700x', name: 'Ryzen 7 5700X', brand: 'AMD' };
  else if (/5700g\b/i.test(t)) cpu = { id: 'cpu-r7-5700x', name: 'Ryzen 7 5700G', brand: 'AMD', igpu: true };
  else if (/5700\b/i.test(t)) cpu = { id: 'cpu-r7-5700x', name: 'Ryzen 7 5700', brand: 'AMD' };
  else if (/5600x\b/i.test(t)) cpu = { id: 'cpu-r5-5600x', name: 'Ryzen 5 5600X', brand: 'AMD' };
  else if (/5600gt\b/i.test(t)) cpu = { id: 'cpu-r5-5600gt', name: 'Ryzen 5 5600GT', brand: 'AMD', igpu: true };
  else if (/5600g\b/i.test(t)) cpu = { id: 'cpu-r5-5600g', name: 'Ryzen 5 5600G', brand: 'AMD', igpu: true };
  else if (/5600\b/i.test(t)) cpu = { id: 'cpu-r5-5600', name: 'Ryzen 5 5600', brand: 'AMD' };
  else if (/5500gt\b/i.test(t)) cpu = { id: 'cpu-r5-5500gt', name: 'Ryzen 5 5500GT', brand: 'AMD', igpu: true };
  else if (/5500\b/i.test(t)) cpu = { id: 'cpu-r5-5600', name: 'Ryzen 5 5500', brand: 'AMD' };
  else if (/4500\b/i.test(t)) cpu = { id: 'cpu-r5-5600', name: 'Ryzen 5 4500', brand: 'AMD' };
  else if (/3600x\b|3600\b/i.test(t)) cpu = { id: 'cpu-r5-5600', name: 'Ryzen 5 3600', brand: 'AMD' };
  else if (/14900k\b|14900kf\b/i.test(t)) cpu = { id: 'cpu-i7-14700kf', name: 'Core i9-14900K', brand: 'Intel' };
  else if (/14700k\b|14700kf\b/i.test(t)) cpu = { id: 'cpu-i7-14700kf', name: 'Core i7-14700KF', brand: 'Intel' };
  else if (/14600k\b|14600kf\b/i.test(t)) cpu = { id: 'cpu-i5-14600kf', name: 'Core i5-14600KF', brand: 'Intel' };
  else if (/14400f\b|14400\b/i.test(t)) cpu = { id: 'cpu-i5-14400f', name: 'Core i5-14400F', brand: 'Intel' };
  else if (/13900k\b|13900kf\b/i.test(t)) cpu = { id: 'cpu-i7-13700f', name: 'Core i9-13900K', brand: 'Intel' };
  else if (/13700k\b|13700kf\b|13700f\b|13700\b/i.test(t)) cpu = { id: 'cpu-i7-13700f', name: 'Core i7-13700F', brand: 'Intel' };
  else if (/13600k\b|13600kf\b/i.test(t)) cpu = { id: 'cpu-i5-13600kf', name: 'Core i5-13600KF', brand: 'Intel' };
  else if (/13500\b/i.test(t)) cpu = { id: 'cpu-i5-13400f', name: 'Core i5-13500', brand: 'Intel' };
  else if (/13400f\b|13400\b/i.test(t)) cpu = { id: 'cpu-i5-13400f', name: 'Core i5-13400F', brand: 'Intel' };
  else if (/12700k\b|12700kf\b|12700f\b|12700\b/i.test(t)) cpu = { id: 'cpu-i7-13700f', name: 'Core i7-12700F', brand: 'Intel' };
  else if (/12600k\b|12600kf\b/i.test(t)) cpu = { id: 'cpu-i5-13400f', name: 'Core i5-12600K', brand: 'Intel' };
  else if (/12400f\b|12400\b/i.test(t)) cpu = { id: 'cpu-i5-12400f', name: 'Core i5-12400F', brand: 'Intel' };
  else if (/12100f\b|12100\b/i.test(t)) cpu = { id: 'cpu-i3-12100f', name: 'Core i3-12100F', brand: 'Intel' };
  else if (/10400f\b|10400\b|11400f\b|11400\b/i.test(t)) cpu = { id: 'cpu-i5-12400f', name: 'Core i5-10400F', brand: 'Intel' };
  else if (/10100f\b|10100\b|10105f\b|10105\b/i.test(t)) cpu = { id: 'cpu-i3-12100f', name: 'Core i3-10100F', brand: 'Intel' };

  if (!cpu) return null;

  // GPU detection
  let gpu = null;
  if (/5090\b/i.test(t)) gpu = { id: 'gpu-rtx4090-24gb', name: 'RTX 5090 32GB' };
  else if (/5080\b/i.test(t)) gpu = { id: 'gpu-rtx4080s-16gb', name: 'RTX 5080 16GB' };
  else if (/4090\b/i.test(t)) gpu = { id: 'gpu-rtx4090-24gb', name: 'RTX 4090 24GB' };
  else if (/4080\s*super\b|4080s\b/i.test(t)) gpu = { id: 'gpu-rtx4080s-16gb', name: 'RTX 4080 SUPER 16GB' };
  else if (/4080\b/i.test(t)) gpu = { id: 'gpu-rtx4080-16gb', name: 'RTX 4080 16GB' };
  else if (/4070\s*ti\s*super\b|4070tis\b/i.test(t)) gpu = { id: 'gpu-rtx4070tis-16gb', name: 'RTX 4070 Ti SUPER 16GB' };
  else if (/4070\s*super\b|4070s\b/i.test(t)) gpu = { id: 'gpu-rtx4070s-12gb', name: 'RTX 4070 SUPER 12GB' };
  else if (/4070\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx4070-12gb', name: 'RTX 4070 Ti 12GB' };
  else if (/4070\b/i.test(t)) gpu = { id: 'gpu-rtx4070-12gb', name: 'RTX 4070 12GB' };
  else if (/4060\s*ti\s*16\s*g/i.test(t)) gpu = { id: 'gpu-rtx4060ti-16gb', name: 'RTX 4060 Ti 16GB' };
  else if (/4060\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx4060ti-8gb', name: 'RTX 4060 Ti 8GB' };
  else if (/4060\b/i.test(t)) gpu = { id: 'gpu-rtx4060-8gb', name: 'RTX 4060 8GB' };
  else if (/3090\b/i.test(t)) gpu = { id: 'gpu-rtx3080-10gb', name: 'RTX 3090 24GB' };
  else if (/3080\s*ti\b|3080\b/i.test(t)) gpu = { id: 'gpu-rtx3080-10gb', name: 'RTX 3080 10GB' };
  else if (/3070\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx3070ti-8gb', name: 'RTX 3070 Ti 8GB' };
  else if (/3070\b/i.test(t)) gpu = { id: 'gpu-rtx3070-8gb', name: 'RTX 3070 8GB' };
  else if (/3060\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx3060ti-8gb', name: 'RTX 3060 Ti 8GB' };
  else if (/3060\s*8\s*g/i.test(t)) gpu = { id: 'gpu-rtx3060-8gb', name: 'RTX 3060 8GB' };
  else if (/3060\b/i.test(t)) gpu = { id: 'gpu-rtx3060-12gb', name: 'RTX 3060 12GB' };
  else if (/3050\b/i.test(t)) gpu = { id: 'gpu-rtx3050-6gb', name: 'RTX 3050 6GB' };
  else if (/2080\b/i.test(t)) gpu = { id: 'gpu-rtx2060s-8gb', name: 'RTX 2080 8GB' };
  else if (/2070\b/i.test(t)) gpu = { id: 'gpu-rtx2060s-8gb', name: 'RTX 2070 8GB' };
  else if (/2060\s*super\b|2060s\b/i.test(t)) gpu = { id: 'gpu-rtx2060s-8gb', name: 'RTX 2060 SUPER 8GB' };
  else if (/2060\b/i.test(t)) gpu = { id: 'gpu-rtx2060-6gb', name: 'RTX 2060 6GB' };
  else if (/1660\s*super\b|1660s\b/i.test(t)) gpu = { id: 'gpu-gtx1660s-6gb', name: 'GTX 1660 SUPER 6GB' };
  else if (/1660\s*ti\b/i.test(t)) gpu = { id: 'gpu-gtx1660ti-6gb', name: 'GTX 1660 Ti 6GB' };
  else if (/1660\b/i.test(t)) gpu = { id: 'gpu-gtx1660s-6gb', name: 'GTX 1660 6GB' };
  else if (/1650\s*super\b/i.test(t)) gpu = { id: 'gpu-gtx1650-4gb', name: 'GTX 1650 SUPER 4GB' };
  else if (/1650\b/i.test(t)) gpu = { id: 'gpu-gtx1650-4gb', name: 'GTX 1650 4GB' };
  else if (/1070\b/i.test(t)) gpu = { id: 'gpu-gtx1660s-6gb', name: 'GTX 1070 8GB' };
  else if (/1060\b/i.test(t)) gpu = { id: 'gpu-gtx1650-4gb', name: 'GTX 1060 6GB' };
  else if (/1050\s*ti\b/i.test(t)) gpu = { id: 'gpu-gtx1650-4gb', name: 'GTX 1050 Ti 4GB' };
  else if (/7900\s*xtx\b/i.test(t)) gpu = { id: 'gpu-rx7900xtx-24gb', name: 'RX 7900 XTX 24GB' };
  else if (/7900\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7900xt-20gb', name: 'RX 7900 XT 20GB' };
  else if (/7900\s*gre\b/i.test(t)) gpu = { id: 'gpu-rx7800xt-16gb', name: 'RX 7900 GRE 16GB' };
  else if (/7800\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7800xt-16gb', name: 'RX 7800 XT 16GB' };
  else if (/7700\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7700xt-12gb', name: 'RX 7700 XT 12GB' };
  else if (/7600\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7600xt-16gb', name: 'RX 7600 XT 16GB' };
  else if (/7600\b/i.test(t)) gpu = { id: 'gpu-rx7600-8gb', name: 'RX 7600 8GB' };
  else if (/6900\s*xt\b|6950\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7800xt-16gb', name: 'RX 6900 XT 16GB' };
  else if (/6800\s*xt\b|6800\b/i.test(t)) gpu = { id: 'gpu-rx7700xt-12gb', name: 'RX 6800 16GB' };
  else if (/6750\s*xt\b|6700\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx6700xt-12gb', name: 'RX 6700 XT 12GB' };
  else if (/6650\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx6650xt-8gb', name: 'RX 6650 XT 8GB' };
  else if (/6600\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx6600xt-8gb', name: 'RX 6600 XT 8GB' };
  else if (/6600\b/i.test(t)) gpu = { id: 'gpu-rx6600-8gb', name: 'RX 6600 8GB' };
  else if (/6500\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx6600-8gb', name: 'RX 6500 XT 4GB' };
  else if (/580\b/i.test(t)) gpu = { id: 'gpu-rx580-8gb', name: 'RX 580 8GB' };
  else if (/arc\s+b580\b|b580\b/i.test(t) && /arc|intel/i.test(t)) gpu = { id: 'gpu-arc-b580-12gb', name: 'Intel Arc B580 12GB' };
  else if (/arc\s+a770\b|a770\b/i.test(t) && /arc|intel/i.test(t)) gpu = { id: 'gpu-arc-a750-8gb', name: 'Intel Arc A770 16GB' };
  else if (/arc\s+a750\b|a750\b/i.test(t) && /arc|intel/i.test(t) && !/samsung|galaxy/i.test(t)) gpu = { id: 'gpu-arc-a750-8gb', name: 'Intel Arc A750 8GB' };
  else if (/arc\s+a580\b|a580\b/i.test(t) && /arc|intel/i.test(t)) gpu = { id: 'gpu-arc-a580-8gb', name: 'Intel Arc A580 8GB' };
  else if (/arc\s+a380\b|a380\b/i.test(t) && /arc|intel/i.test(t)) gpu = { id: 'gpu-arc-a380-6gb', name: 'Intel Arc A380 6GB' };
  else if (cpu.igpu || /vega|igpu|sans\s+carte|apu|intel\s+uhd|graphique\s+int[eé]gr[eé]|sans\s+gpu/i.test(t)) {
    gpu = { id: 'igpu', name: 'Graphique Intégré' };
  }

  if (!gpu) return null;

  // Motherboard detection
  let mobo = null;
  if (/b650\b/i.test(t)) mobo = { id: 'mobo-b650m', name: 'B650M AM5' };
  else if (/a620\b/i.test(t)) mobo = { id: 'mobo-a620m', name: 'A620M AM5' };
  else if (/x670\b/i.test(t)) mobo = { id: 'mobo-x670', name: 'X670 AM5' };
  else if (/b850\b/i.test(t)) mobo = { id: 'mobo-b850m', name: 'B850M AM5' };
  else if (/x870\b/i.test(t)) mobo = { id: 'mobo-x670', name: 'X870 AM5' };
  else if (/b550\b/i.test(t)) mobo = { id: 'mobo-b550m-a-pro', name: 'B550M AM4' };
  else if (/a520\b/i.test(t)) mobo = { id: 'mobo-a520m', name: 'A520M AM4' };
  else if (/b450\b/i.test(t)) mobo = { id: 'mobo-b450m', name: 'B450M AM4' };
  else if (/a320\b/i.test(t)) mobo = { id: 'mobo-b450m', name: 'A320M AM4' };
  else if (/z790\b/i.test(t)) mobo = { id: 'mobo-z790', name: 'Z790 LGA1700' };
  else if (/b760\b/i.test(t)) mobo = { id: 'mobo-b760m', name: 'B760M LGA1700' };
  else if (/b660\b/i.test(t)) mobo = { id: 'mobo-b660m-e', name: 'B660M LGA1700' };
  else if (/h610\b/i.test(t)) mobo = { id: 'mobo-h610m', name: 'H610M LGA1700' };
  else if (/h510\b|h410\b|b460\b|b560\b/i.test(t)) mobo = { id: 'mobo-h610m', name: 'H510M LGA1200' };
  else {
    if (cpu.id.startsWith('cpu-r5-5') || cpu.id.startsWith('cpu-r7-5')) mobo = { id: 'mobo-b550m-a-pro', name: 'B550M AM4' };
    else if (cpu.id.startsWith('cpu-r5-7') || cpu.id.startsWith('cpu-r7-7') || cpu.id.startsWith('cpu-r5-9') || cpu.id.startsWith('cpu-r7-9') || cpu.id.startsWith('cpu-r9-7')) mobo = { id: 'mobo-b650m', name: 'B650M AM5' };
    else mobo = { id: 'mobo-h610m', name: 'H610M LGA1700' };
  }

  // RAM detection
  let ram = null;
  const isDdr5 = /ddr5/i.test(t) || mobo.id.includes('b650') || mobo.id.includes('a620') || mobo.id.includes('z790') || mobo.id.includes('b850');
  if (/64\s*g/i.test(t)) ram = { id: isDdr5 ? 'ram-delta-32-d5' : 'ram-vengeance-32-d4', name: '64GB (2x32GB)' };
  else if (/32\s*g/i.test(t)) ram = { id: isDdr5 ? 'ram-delta-32-d5' : 'ram-vengeance-32-d4', name: isDdr5 ? '32GB DDR5' : '32GB DDR4' };
  else if (/8\s*g/i.test(t)) ram = { id: 'ram-value-8-d4', name: '8GB DDR4' };
  else ram = { id: isDdr5 ? 'ram-vengeance-16-d5' : 'ram-vengeance-16-d4', name: isDdr5 ? '16GB DDR5' : '16GB DDR4' };

  // Storage
  let storage = 'SSD 512GB';
  let storageId = 'ssd-nvme-512gb';
  if (/2\s*t[bo]/i.test(t)) { storage = 'SSD NVMe 2TB'; storageId = 'ssd-nvme-1tb-g4'; }
  else if (/1\s*t[bo]|1000\s*g/i.test(t)) { storage = 'SSD NVMe 1TB'; storageId = 'ssd-nvme-1tb-g4'; }
  else if (/256\s*g|240\s*g/i.test(t)) { storage = 'SSD 256GB'; storageId = 'ssd-nvme-512gb'; }

  // PSU
  let psu = { id: 'psu-550-b', name: '550W Bronze' };
  if (/850\s*w/i.test(t)) psu = { id: 'psu-750-gold', name: '850W Gold' };
  else if (/750\s*w/i.test(t)) psu = { id: 'psu-750-gold', name: '750W Gold' };
  else if (/650\s*w/i.test(t)) psu = { id: 'psu-550-b', name: '650W Bronze' };

  return { cpu, gpu, mobo, ram, storage: { id: storageId, name: storage }, psu };
}

const seenTitles = new Set();
const prebuilds = [];
const now = Date.now();
const maxAge = 180 * 24 * 3600 * 1000;

for (const o of rawListings) {
  const title = (o.title || '').toLowerCase();
  const desc = (o.description || '').toLowerCase();
  const text = title + ' ' + desc;

  // PC Gamer / Desktop check
  const isPC = /pc\s*gamer|pc\s*gaming|unit[eé]\s+(centrale|gamer)|config\s+(pc|gamer)|setup\s+gamer|ordinateur\s+(de\s+)?bureau|tour\s+(pc|gamer|gaming)|desktop\s+(pc|gamer|gaming)|gaming\s+desktop|بيسي\s+قيمر|وحدات\s+مركزية/i.test(title) ||
               ((/unit[eé]\s+centrale|pc\s+gamer|pc\s+gaming|desktop\s+gamer/i.test(text)) && /i[3579]-?\d{4,5}|ryzen\s*[3579]\s*\d{4}/i.test(text));

  if (!isPC) continue;
  if (!o.priceDa || o.priceDa < 35000 || o.priceDa > 900000) continue;

  if (o.postedAt) {
    const age = now - new Date(o.postedAt).getTime();
    if (age > maxAge) continue;
  }

  const specs = parseSpecs(o.title, o.description);
  if (!specs) continue;

  // Deduplicate by store + cpu + gpu + ram
  const storeName = (o.store || o.seller || 'Boutique').trim();
  const key = `${storeName.toLowerCase()}|${specs.cpu.id}|${specs.gpu.id}|${specs.ram.name}`;
  if (seenTitles.has(key)) continue;
  seenTitles.add(key);

  prebuilds.push({
    id: `prebuild-${prebuilds.length + 1}`,
    title: (o.title || '').replace(/\s+/g, ' ').trim(),
    priceDa: o.priceDa,
    store: storeName,
    wilaya: o.wilaya || 'Alger',
    url: o.url,
    image: o.image || '',
    postedAt: o.postedAt || new Date().toISOString(),
    specs
  });
}

console.log(`Generated ${prebuilds.length} high-quality prebuilt systems.`);
const outputPath = path.join(__dirname, '..', 'lib', 'data', 'prebuilds-data.json');
fs.writeFileSync(outputPath, JSON.stringify(prebuilds, null, 2), 'utf8');
console.log(`Saved to ${outputPath}!`);
