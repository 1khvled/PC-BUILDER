const fs = require('fs');

const full = JSON.parse(fs.readFileSync('full.json', 'utf8'));
const all = full.report['ouedkniss:all'] || [];

function parseSpecs(title, desc = '') {
  const t = (title + ' ' + desc).toLowerCase();
  
  // CPU
  let cpu = null;
  if (/5600x\b/i.test(t)) cpu = { id: 'cpu-r5-5600x', name: 'AMD Ryzen 5 5600X', brand: 'AMD' };
  else if (/5600gt\b/i.test(t)) cpu = { id: 'cpu-r5-5600gt', name: 'AMD Ryzen 5 5600GT', brand: 'AMD', igpu: true };
  else if (/5600g\b/i.test(t)) cpu = { id: 'cpu-r5-5600g', name: 'AMD Ryzen 5 5600G', brand: 'AMD', igpu: true };
  else if (/5600\b/i.test(t)) cpu = { id: 'cpu-r5-5600', name: 'AMD Ryzen 5 5600', brand: 'AMD' };
  else if (/5500gt\b/i.test(t)) cpu = { id: 'cpu-r5-5500gt', name: 'AMD Ryzen 5 5500GT', brand: 'AMD', igpu: true };
  else if (/5500\b/i.test(t)) cpu = { id: 'cpu-r5-5600', name: 'AMD Ryzen 5 5500', brand: 'AMD' };
  else if (/5700x3d\b/i.test(t)) cpu = { id: 'cpu-r7-5700x3d', name: 'AMD Ryzen 7 5700X3D', brand: 'AMD' };
  else if (/5700x\b/i.test(t)) cpu = { id: 'cpu-r7-5700x', name: 'AMD Ryzen 7 5700X', brand: 'AMD' };
  else if (/7500f\b/i.test(t)) cpu = { id: 'cpu-r5-7500f', name: 'AMD Ryzen 5 7500F', brand: 'AMD' };
  else if (/7600x\b/i.test(t)) cpu = { id: 'cpu-r5-7600x', name: 'AMD Ryzen 5 7600X', brand: 'AMD' };
  else if (/7600\b/i.test(t)) cpu = { id: 'cpu-r5-7600', name: 'AMD Ryzen 5 7600', brand: 'AMD' };
  else if (/7700x\b/i.test(t)) cpu = { id: 'cpu-r7-7700x', name: 'AMD Ryzen 7 7700X', brand: 'AMD' };
  else if (/7700\b/i.test(t)) cpu = { id: 'cpu-r7-7700', name: 'AMD Ryzen 7 7700', brand: 'AMD' };
  else if (/7800x3d\b/i.test(t)) cpu = { id: 'cpu-r7-7800x3d', name: 'AMD Ryzen 7 7800X3D', brand: 'AMD' };
  else if (/9800x3d\b/i.test(t)) cpu = { id: 'cpu-r7-9800x3d', name: 'AMD Ryzen 7 9800X3D', brand: 'AMD' };
  else if (/9600x\b/i.test(t)) cpu = { id: 'cpu-r5-9600x', name: 'AMD Ryzen 5 9600X', brand: 'AMD' };
  else if (/12400f\b|12400\b/i.test(t)) cpu = { id: 'cpu-i5-12400f', name: 'Intel Core i5-12400F', brand: 'Intel' };
  else if (/12100f\b|12100\b/i.test(t)) cpu = { id: 'cpu-i3-12100f', name: 'Intel Core i3-12100F', brand: 'Intel' };
  else if (/13400f\b|13400\b/i.test(t)) cpu = { id: 'cpu-i5-13400f', name: 'Intel Core i5-13400F', brand: 'Intel' };
  else if (/14400f\b|14400\b/i.test(t)) cpu = { id: 'cpu-i5-14400f', name: 'Intel Core i5-14400F', brand: 'Intel' };
  else if (/13600kf\b|13600k\b/i.test(t)) cpu = { id: 'cpu-i5-13600kf', name: 'Intel Core i5-13600KF', brand: 'Intel' };
  else if (/14600kf\b|14600k\b/i.test(t)) cpu = { id: 'cpu-i5-14600kf', name: 'Intel Core i5-14600KF', brand: 'Intel' };
  else if (/13700k\b|13700f\b|13700\b/i.test(t)) cpu = { id: 'cpu-i7-13700f', name: 'Intel Core i7-13700', brand: 'Intel' };
  else if (/14700k\b|14700kf\b|14700\b/i.test(t)) cpu = { id: 'cpu-i7-14700kf', name: 'Intel Core i7-14700KF', brand: 'Intel' };

  if (!cpu) return null;

  // GPU
  let gpu = null;
  if (/4090\b/i.test(t)) gpu = { id: 'gpu-rtx4090-24gb', name: 'RTX 4090 24GB' };
  else if (/4080\s*super\b|4080s\b/i.test(t)) gpu = { id: 'gpu-rtx4080s-16gb', name: 'RTX 4080 SUPER 16GB' };
  else if (/4080\b/i.test(t)) gpu = { id: 'gpu-rtx4080-16gb', name: 'RTX 4080 16GB' };
  else if (/4070\s*ti\s*super\b|4070tis\b/i.test(t)) gpu = { id: 'gpu-rtx4070tis-16gb', name: 'RTX 4070 Ti SUPER' };
  else if (/4070\s*super\b|4070s\b/i.test(t)) gpu = { id: 'gpu-rtx4070s-12gb', name: 'RTX 4070 SUPER 12GB' };
  else if (/4070\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx4070-12gb', name: 'RTX 4070 Ti 12GB' };
  else if (/4070\b/i.test(t)) gpu = { id: 'gpu-rtx4070-12gb', name: 'RTX 4070 12GB' };
  else if (/4060\s*ti\s*16\s*g/i.test(t)) gpu = { id: 'gpu-rtx4060ti-16gb', name: 'RTX 4060 Ti 16GB' };
  else if (/4060\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx4060ti-8gb', name: 'RTX 4060 Ti 8GB' };
  else if (/4060\b/i.test(t)) gpu = { id: 'gpu-rtx4060-8gb', name: 'RTX 4060 8GB' };
  else if (/3080\s*ti\b|3080\b/i.test(t)) gpu = { id: 'gpu-rtx3080-10gb', name: 'RTX 3080 10GB' };
  else if (/3070\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx3070ti-8gb', name: 'RTX 3070 Ti 8GB' };
  else if (/3070\b/i.test(t)) gpu = { id: 'gpu-rtx3070-8gb', name: 'RTX 3070 8GB' };
  else if (/3060\s*ti\b/i.test(t)) gpu = { id: 'gpu-rtx3060ti-8gb', name: 'RTX 3060 Ti 8GB' };
  else if (/3060\s*8\s*g/i.test(t)) gpu = { id: 'gpu-rtx3060-8gb', name: 'RTX 3060 8GB' };
  else if (/3060\b/i.test(t)) gpu = { id: 'gpu-rtx3060-12gb', name: 'RTX 3060 12GB' };
  else if (/3050\b/i.test(t)) gpu = { id: 'gpu-rtx3050-6gb', name: 'RTX 3050 6GB' };
  else if (/2060\s*super\b|2060s\b/i.test(t)) gpu = { id: 'gpu-rtx2060s-8gb', name: 'RTX 2060 SUPER 8GB' };
  else if (/2060\b/i.test(t)) gpu = { id: 'gpu-rtx2060-6gb', name: 'RTX 2060 6GB' };
  else if (/1660\s*super\b|1660s\b/i.test(t)) gpu = { id: 'gpu-gtx1660s-6gb', name: 'GTX 1660 SUPER 6GB' };
  else if (/1660\s*ti\b/i.test(t)) gpu = { id: 'gpu-gtx1660ti-6gb', name: 'GTX 1660 Ti 6GB' };
  else if (/1650\b/i.test(t)) gpu = { id: 'gpu-gtx1650-4gb', name: 'GTX 1650 4GB' };
  else if (/9060\s*xt\s*16\s*g/i.test(t)) gpu = { id: 'gpu-rx9060xt-16gb', name: 'RX 9060 XT 16GB' };
  else if (/9060\s*xt|9060/i.test(t)) gpu = { id: 'gpu-rx9060xt-8gb', name: 'RX 9060 XT 8GB' };
  else if (/7900\s*xtx\b/i.test(t)) gpu = { id: 'gpu-rx7900xtx-24gb', name: 'RX 7900 XTX 24GB' };
  else if (/7900\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7900xt-20gb', name: 'RX 7900 XT 20GB' };
  else if (/7800\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7800xt-16gb', name: 'RX 7800 XT 16GB' };
  else if (/7700\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7700xt-12gb', name: 'RX 7700 XT 12GB' };
  else if (/7600\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx7600xt-16gb', name: 'RX 7600 XT 16GB' };
  else if (/7600\b/i.test(t)) gpu = { id: 'gpu-rx7600-8gb', name: 'RX 7600 8GB' };
  else if (/6700\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx6700xt-12gb', name: 'RX 6700 XT 12GB' };
  else if (/6650\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx6650xt-8gb', name: 'RX 6650 XT 8GB' };
  else if (/6600\s*xt\b/i.test(t)) gpu = { id: 'gpu-rx6600xt-8gb', name: 'RX 6600 XT 8GB' };
  else if (/6600\b/i.test(t)) gpu = { id: 'gpu-rx6600-8gb', name: 'RX 6600 8GB' };
  else if (/580\b/i.test(t)) gpu = { id: 'gpu-rx580-8gb', name: 'RX 580 8GB' };
  else if (cpu.igpu || /vega|igpu|sans\s+carte|apu/i.test(t)) gpu = { id: 'igpu', name: 'Graphique Intégré (APU)' };

  if (!gpu) return null;

  // Motherboard
  let mobo = null;
  if (/b650\b/i.test(t)) mobo = { id: 'mobo-b650m', name: 'B650M AM5' };
  else if (/a620\b/i.test(t)) mobo = { id: 'mobo-a620m', name: 'A620M AM5' };
  else if (/b850\b/i.test(t)) mobo = { id: 'mobo-b850m', name: 'B850M AM5' };
  else if (/x670\b/i.test(t)) mobo = { id: 'mobo-x670', name: 'X670 AM5' };
  else if (/b550\b/i.test(t)) mobo = { id: 'mobo-b550m-a-pro', name: 'B550M AM4' };
  else if (/a520\b/i.test(t)) mobo = { id: 'mobo-a520m', name: 'A520M AM4' };
  else if (/b450\b/i.test(t)) mobo = { id: 'mobo-b450m', name: 'B450M AM4' };
  else if (/h610\b/i.test(t)) mobo = { id: 'mobo-h610m', name: 'H610M LGA1700' };
  else if (/b760\b/i.test(t)) mobo = { id: 'mobo-b760m', name: 'B760M LGA1700' };
  else if (/b660\b/i.test(t)) mobo = { id: 'mobo-b660m-e', name: 'B660M LGA1700' };
  else if (/z790\b/i.test(t)) mobo = { id: 'mobo-z790', name: 'Z790 LGA1700' };
  else {
    // Infer default compatible mobo if not specified in title
    if (cpu.id.startsWith('cpu-r5-5') || cpu.id.startsWith('cpu-r7-5')) mobo = { id: 'mobo-b550m-a-pro', name: 'B550M AM4', inferred: true };
    else if (cpu.id.startsWith('cpu-r5-7') || cpu.id.startsWith('cpu-r7-7') || cpu.id.startsWith('cpu-r5-9') || cpu.id.startsWith('cpu-r7-9')) mobo = { id: 'mobo-b650m', name: 'B650M AM5', inferred: true };
    else if (cpu.id.includes('12') || cpu.id.includes('13') || cpu.id.includes('14')) mobo = { id: 'mobo-h610m', name: 'H610M LGA1700', inferred: true };
  }

  if (!mobo) return null;

  // RAM
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

  // Case & PSU
  let psu = { id: 'psu-550-b', name: '550W Bronze' };
  if (/750\s*w/i.test(t)) psu = { id: 'psu-750-gold', name: '750W Gold' };
  else if (/650\s*w/i.test(t)) psu = { id: 'psu-550-b', name: '650W Bronze' };

  return { cpu, gpu, mobo, ram, storage: { id: storageId, name: storage }, psu };
}

let count = 0;
const matched = [];
for (const o of all) {
  const t = (o.title || '').toLowerCase();
  const isPC = /pc\s+gamer|unit[eé]\s+(centrale|gamer)|config\s+pc|setup\s+gamer|ordinateur\s+bureau|بيسي\s+قيمر|وحدات\s+مركزية/i.test(t);
  if (!isPC) continue;
  if (!o.priceDa || o.priceDa < 40000 || o.priceDa > 900000) continue;

  const specs = parseSpecs(o.title, o.description);
  if (!specs) continue;

  count++;
  matched.push({
    title: o.title,
    priceDa: o.priceDa,
    store: (o.store || o.seller || 'Boutique').trim(),
    wilaya: o.wilaya || 'Alger',
    url: o.url,
    specs
  });
}

console.log('Total extracted Prebuilt PCs with 4 core parts:', count);
console.log('Sample 6:');
matched.slice(0, 6).forEach(m => {
  console.log(`- [${m.store} - ${m.wilaya}] ${m.priceDa.toLocaleString()} DA`);
  console.log(`  Title: ${m.title.slice(0, 85)}`);
  console.log(`  Specs: ${m.specs.cpu.name} | ${m.specs.gpu.name} | ${m.specs.mobo.name} | ${m.specs.ram.name} | ${m.specs.storage.name}`);
});
