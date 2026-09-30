const fs = require('fs');

const full = JSON.parse(fs.readFileSync('full.json', 'utf8'));
const all = full.report['ouedkniss:all'] || [];

function matchCoreComponents(title, desc = '') {
  const text = (title + ' ' + desc).toLowerCase();

  // 1. CPU Detection
  let cpu = null;
  if (/5600x\b/i.test(text)) cpu = { id: 'cpu-r5-5600x', label: 'Ryzen 5 5600X' };
  else if (/5600gt\b/i.test(text)) cpu = { id: 'cpu-r5-5600gt', label: 'Ryzen 5 5600GT' };
  else if (/5600g\b/i.test(text)) cpu = { id: 'cpu-r5-5600g', label: 'Ryzen 5 5600G' };
  else if (/5600\b/i.test(text)) cpu = { id: 'cpu-r5-5600', label: 'Ryzen 5 5600' };
  else if (/5700x3d\b/i.test(text)) cpu = { id: 'cpu-r7-5700x3d', label: 'Ryzen 7 5700X3D' };
  else if (/5700x\b/i.test(text)) cpu = { id: 'cpu-r7-5700x', label: 'Ryzen 7 5700X' };
  else if (/7500f\b/i.test(text)) cpu = { id: 'cpu-r5-7500f', label: 'Ryzen 5 7500F' };
  else if (/7600x\b/i.test(text)) cpu = { id: 'cpu-r5-7600x', label: 'Ryzen 5 7600X' };
  else if (/7600\b/i.test(text)) cpu = { id: 'cpu-r5-7600', label: 'Ryzen 5 7600' };
  else if (/7800x3d\b/i.test(text)) cpu = { id: 'cpu-r7-7800x3d', label: 'Ryzen 7 7800X3D' };
  else if (/9800x3d\b/i.test(text)) cpu = { id: 'cpu-r7-9800x3d', label: 'Ryzen 7 9800X3D' };
  else if (/9600x\b/i.test(text)) cpu = { id: 'cpu-r5-9600x', label: 'Ryzen 5 9600X' };
  else if (/12400f\b|12400\b/i.test(text)) cpu = { id: 'cpu-i5-12400f', label: 'Core i5-12400F' };
  else if (/12100f\b|12100\b/i.test(text)) cpu = { id: 'cpu-i3-12100f', label: 'Core i3-12100F' };
  else if (/13400f\b|13400\b/i.test(text)) cpu = { id: 'cpu-i5-13400f', label: 'Core i5-13400F' };
  else if (/14400f\b|14400\b/i.test(text)) cpu = { id: 'cpu-i5-14400f', label: 'Core i5-14400F' };
  else if (/13600kf\b|13600k\b/i.test(text)) cpu = { id: 'cpu-i5-13600kf', label: 'Core i5-13600KF' };
  else if (/14600kf\b|14600k\b/i.test(text)) cpu = { id: 'cpu-i5-14600kf', label: 'Core i5-14600KF' };
  else if (/13700k\b|13700f\b|13700\b/i.test(text)) cpu = { id: 'cpu-i7-13700f', label: 'Core i7-13700' };
  else if (/14700k\b|14700kf\b/i.test(text)) cpu = { id: 'cpu-i7-14700kf', label: 'Core i7-14700KF' };

  // 2. GPU Detection
  let gpu = null;
  if (/4090\b/i.test(text)) gpu = { id: 'gpu-rtx4090-24gb', label: 'RTX 4090 24GB' };
  else if (/4080\s*super\b|4080s\b/i.test(text)) gpu = { id: 'gpu-rtx4080s-16gb', label: 'RTX 4080 SUPER' };
  else if (/4080\b/i.test(text)) gpu = { id: 'gpu-rtx4080-16gb', label: 'RTX 4080 16GB' };
  else if (/4070\s*ti\s*super\b|4070tis\b/i.test(text)) gpu = { id: 'gpu-rtx4070tis-16gb', label: 'RTX 4070 Ti SUPER' };
  else if (/4070\s*super\b|4070s\b/i.test(text)) gpu = { id: 'gpu-rtx4070s-12gb', label: 'RTX 4070 SUPER' };
  else if (/4070\b/i.test(text)) gpu = { id: 'gpu-rtx4070-12gb', label: 'RTX 4070 12GB' };
  else if (/4060\s*ti\b/i.test(text)) gpu = { id: 'gpu-rtx4060ti-8gb', label: 'RTX 4060 Ti 8GB' };
  else if (/4060\b/i.test(text)) gpu = { id: 'gpu-rtx4060-8gb', label: 'RTX 4060 8GB' };
  else if (/3080\b/i.test(text)) gpu = { id: 'gpu-rtx3080-10gb', label: 'RTX 3080 10GB' };
  else if (/3070\s*ti\b/i.test(text)) gpu = { id: 'gpu-rtx3070ti-8gb', label: 'RTX 3070 Ti 8GB' };
  else if (/3070\b/i.test(text)) gpu = { id: 'gpu-rtx3070-8gb', label: 'RTX 3070 8GB' };
  else if (/3060\s*ti\b/i.test(text)) gpu = { id: 'gpu-rtx3060ti-8gb', label: 'RTX 3060 Ti 8GB' };
  else if (/3060\b/i.test(text)) gpu = { id: 'gpu-rtx3060-12gb', label: 'RTX 3060 12GB' };
  else if (/3050\b/i.test(text)) gpu = { id: 'gpu-rtx3050-6gb', label: 'RTX 3050 6GB' };
  else if (/2060\s*super\b|2060s\b/i.test(text)) gpu = { id: 'gpu-rtx2060s-8gb', label: 'RTX 2060 SUPER' };
  else if (/2060\b/i.test(text)) gpu = { id: 'gpu-rtx2060-6gb', label: 'RTX 2060 6GB' };
  else if (/1660\s*super\b|1660s\b/i.test(text)) gpu = { id: 'gpu-gtx1660s-6gb', label: 'GTX 1660 SUPER' };
  else if (/1650\b/i.test(text)) gpu = { id: 'gpu-gtx1650-4gb', label: 'GTX 1650 4GB' };
  else if (/7800\s*xt\b/i.test(text)) gpu = { id: 'gpu-rx7800xt-16gb', label: 'RX 7800 XT 16GB' };
  else if (/7700\s*xt\b/i.test(text)) gpu = { id: 'gpu-rx7700xt-12gb', label: 'RX 7700 XT 12GB' };
  else if (/7600\s*xt\b/i.test(text)) gpu = { id: 'gpu-rx7600xt-16gb', label: 'RX 7600 XT 16GB' };
  else if (/7600\b/i.test(text)) gpu = { id: 'gpu-rx7600-8gb', label: 'RX 7600 8GB' };
  else if (/6700\s*xt\b/i.test(text)) gpu = { id: 'gpu-rx6700xt-12gb', label: 'RX 6700 XT 12GB' };
  else if (/6650\s*xt\b/i.test(text)) gpu = { id: 'gpu-rx6650xt-8gb', label: 'RX 6650 XT 8GB' };
  else if (/6600\s*xt\b/i.test(text)) gpu = { id: 'gpu-rx6600xt-8gb', label: 'RX 6600 XT 8GB' };
  else if (/6600\b/i.test(text)) gpu = { id: 'gpu-rx6600-8gb', label: 'RX 6600 8GB' };
  else if (/580\b/i.test(text)) gpu = { id: 'gpu-rx580-8gb', label: 'RX 580 8GB' };
  else if (/vega|igpu|intel\s+uhd|sans\s+carte\s+graphique/i.test(text)) gpu = { id: 'igpu', label: 'Graphiques intégrés (APU)' };

  // 3. Motherboard Detection
  let mobo = null;
  if (/b650\b/i.test(text)) mobo = { id: 'mobo-b650m', label: 'B650M (AM5 DDR5)' };
  else if (/a620\b/i.test(text)) mobo = { id: 'mobo-a620m', label: 'A620M (AM5 DDR5)' };
  else if (/b850\b/i.test(text)) mobo = { id: 'mobo-b850m', label: 'B850M (AM5 DDR5)' };
  else if (/x670\b/i.test(text)) mobo = { id: 'mobo-x670', label: 'X670 (AM5 DDR5)' };
  else if (/b550\b/i.test(text)) mobo = { id: 'mobo-b550m-a-pro', label: 'B550M (AM4 DDR4)' };
  else if (/a520\b/i.test(text)) mobo = { id: 'mobo-a520m', label: 'A520M (AM4 DDR4)' };
  else if (/b450\b/i.test(text)) mobo = { id: 'mobo-b450m', label: 'B450M (AM4 DDR4)' };
  else if (/h610\b/i.test(text)) mobo = { id: 'mobo-h610m', label: 'H610M (LGA1700 DDR4)' };
  else if (/b760\b/i.test(text)) mobo = { id: 'mobo-b760m', label: 'B760M (LGA1700)' };
  else if (/b660\b/i.test(text)) mobo = { id: 'mobo-b660m-e', label: 'B660M (LGA1700)' };
  else if (/z790\b/i.test(text)) mobo = { id: 'mobo-z790', label: 'Z790 (LGA1700 DDR5)' };
  else if (/h510\b|h410\b/i.test(text)) mobo = { id: 'mobo-h410m', label: 'H410M/H510M' };

  // 4. RAM Detection
  let ram = null;
  if (/32\s*g[bo]?\s*ddr5|ddr5\s*32\s*g/i.test(text)) ram = { id: 'ram-delta-32-d5', label: '32GB DDR5' };
  else if (/16\s*g[bo]?\s*ddr5|ddr5\s*16\s*g/i.test(text)) ram = { id: 'ram-vengeance-16-d5', label: '16GB DDR5' };
  else if (/32\s*g[bo]?\s*ddr4|ddr4\s*32\s*g/i.test(text)) ram = { id: 'ram-vengeance-32-d4', label: '32GB DDR4' };
  else if (/16\s*g[bo]?\s*ddr4|ddr4\s*16\s*g|16\s*gb|16\s*go/i.test(text)) ram = { id: 'ram-vengeance-16-d4', label: '16GB DDR4' };
  else if (/8\s*g[bo]?\s*ddr4|ddr4\s*8\s*g|8\s*gb|8\s*go/i.test(text)) ram = { id: 'ram-value-8-d4', label: '8GB DDR4' };

  // Storage
  let storage = 'SSD 512GB';
  if (/1\s*t[bo]|1000\s*g/i.test(text)) storage = 'SSD NVMe 1TB';
  else if (/2\s*t[bo]/i.test(text)) storage = 'SSD NVMe 2TB';
  else if (/256\s*g|240\s*g/i.test(text)) storage = 'SSD 256GB';
  else if (/512\s*g|480\s*g|500\s*g/i.test(text)) storage = 'SSD 512GB';

  return { cpu, gpu, mobo, ram, storage };
}

let validPrebuilds = 0;
const results = [];
for (const o of all) {
  const t = (o.title || '').toLowerCase();
  const isPC = /pc\s+gamer|unit[eé]\s+(centrale|gamer)|config\s+pc|setup\s+gamer|ordinateur\s+bureau|بيسي\s+قيمر|وحدات\s+مركزية/i.test(t);
  if (!isPC) continue;
  if (!o.priceDa || o.priceDa < 40000 || o.priceDa > 1000000) continue;

  const core = matchCoreComponents(o.title, o.description);
  // User condition: "at least match same main core things GPU CPU MOTHERBOARD AND RAM must match these"
  if (core.cpu && core.gpu && core.mobo && core.ram) {
    validPrebuilds++;
    results.push({
      title: o.title,
      price: o.priceDa,
      store: (o.store || o.seller || 'Boutique').trim(),
      wilaya: o.wilaya || 'Alger',
      url: o.url,
      core,
      image: o.image || ''
    });
  }
}

console.log('Valid matching prebuilds (with CPU + GPU + Mobo + RAM):', validPrebuilds);
console.log('Sample matching prebuilds:');
results.slice(0, 10).forEach(r => {
  console.log(`\n[${r.store} (${r.wilaya})] - ${r.price.toLocaleString()} DA`);
  console.log(`  Title: ${r.title.slice(0, 80)}`);
  console.log(`  Core: ${r.core.cpu.label} | ${r.core.gpu.label} | ${r.core.mobo.label} | ${r.core.ram.label} | ${r.core.storage}`);
});
