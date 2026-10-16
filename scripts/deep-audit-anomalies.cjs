const fs = require('fs');

const seed = JSON.parse(fs.readFileSync('supabase-seed.json', 'utf8'));
const prods = new Map(seed.products.map(p => [p.id, p]));

// Refined, high-precision anomaly detectors
const checks = [
  // 1. Audio / Headphones / Soundbars / Standalone Speakers (excluding micro-atx and monitor built-in speakers)
  {
    name: 'Audio/Headset',
    regex: /\b(casque|headset|ecouteur|ecouteurs|earphone|earphones|airpod|airpods|earbud|earbuds|microphone|micro[\s-]casque|soundbar|soundcard|baffle\b|haut[\s-]parleur\b)\b/i
  },
  // 2. Input peripherals (keyboards, mice, controllers, mousepads)
  {
    name: 'Peripheral/Input',
    regex: /\b(souris|mouse\b|clavier|keyboard|manette|controller|joystick|volant|gamepad|tapis\s*de\s*souris|mousepad)\b/i
  },
  // 3. Furniture / Bags / Enclosures
  {
    name: 'Furniture/Bags',
    regex: /\b(chaise\s*gamer|fauteuil\s*gamer|gaming\s*chair|bureau\s*gamer|gaming\s*desk|sacoche|sac\s*[aà]\s*dos|support\s*casque)\b/i
  },
  // 4. External storage / Caddies matching internal components (excluding legitimate internal SSDs/HDDs)
  {
    name: 'ExternalCaddy',
    regex: /\b(caddy\s*(?:hdd|ssd)|boitier\s*externe\s*(?:pour|hdd|ssd)|adaptateur\s*sata\s*vers\s*usb)\b/i
  },
  // 5. Cables / Power strips
  {
    name: 'Cables/Strips',
    regex: /\b(cable\s*hdmi|cable\s*displayport|cable\s*dp|cable\s*vga|multiprise|rallonge\s*electrique)\b/i
  },
  // 6. Accessories / Brackets / Thermal paste
  {
    name: 'AccessoriesOnly',
    regex: /\b(pate\s*thermique|thermal\s*paste|thermal\s*pad|support\s*gpu|gpu\s*holder|riser\s*pcie|vertical\s*gpu\s*mount)\b/i
  },
  // 7. Case fans matching CPU cooler
  {
    name: 'CaseFanOnCooler',
    regex: /\b(pack\s*(?:de\s*)?\d+\s*fans?|pack\s*(?:de\s*)?\d+\s*ventilateurs?|ventilateur\s*(?:de\s*)?boitier|case\s*fan)\b/i,
    onlyCat: 'cooler'
  },
  // 8. Laptop screens on desktop monitors
  {
    name: 'LaptopScreenOnMonitor',
    regex: /\b(dalle\s*pc\s*portable|dalle\s*laptop|dalle\s*(?:13|14|15|16|17)[.,]\d)\b/i,
    onlyCat: 'monitor'
  },
  // 9. TV on monitors
  {
    name: 'TVOnMonitor',
    regex: /\b(smart\s*tv|t[eé]l[eé]viseur|d[eé]mo\s*satellite|r[eé]cepteur)\b/i,
    onlyCat: 'monitor'
  },
  // 10. Ink/Toner on printer
  {
    name: 'ConsumableOnPrinter',
    regex: /\b(bouteille\s*d['']encre|cartouche\s*d['']encre|toner\s*(?:noir|cyan|magenta|jaune)|ruban\s*encreur)\b/i,
    onlyCat: 'printer'
  },
  // 11. Faulty / Broken / For parts
  {
    name: 'FaultyOrRepair',
    regex: /\b(en\s*panne|pour\s*pi[eè]ces?|bloqu[eé]|sans\s*afficheur|r[eé]paration\s*de)\b/i
  },
  // 12. Empty boxes
  {
    name: 'EmptyBox',
    regex: /\b(boite\s*vide|carton\s*seul|emballage\s*seul|sans\s*carte|sans\s*gpu|sans\s*processeur)\b/i
  }
];

const flagged = [];
for (const o of seed.offers) {
  const p = prods.get(o.p);
  if (!p) continue;

  for (const c of checks) {
    if (c.onlyCat && c.onlyCat !== p.c) continue;
    if (c.regex.test(o.t)) {
      flagged.push({
        check: c.name,
        productId: o.p,
        category: p.c,
        productModel: p.model,
        offerTitle: o.t,
        store: o.s,
        price: o.d,
        url: o.u
      });
      break;
    }
  }
}

console.log('REAL anomalies flagged in seed: ' + flagged.length);
flagged.forEach((f, idx) => {
  console.log(`[${idx + 1}] [${f.check}] Prod: ${f.productId} (${f.category} - ${f.productModel})`);
  console.log(`     Title: "${f.offerTitle}" (${f.price} DA at ${f.store})`);
  console.log(`     URL: ${f.url}`);
});
