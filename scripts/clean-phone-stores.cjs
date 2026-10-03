const fs = require('fs');

console.log("Cleaning phone repair stores from full.json and discovered-stores.json...");

// 1. discovered-stores.json
const storesPath = 'D:/Projects/DZ-PartPicker/scripts/discovered-stores.json';
const stores = JSON.parse(fs.readFileSync(storesPath, 'utf8'));
const phoneStoreFilter = (s) => {
  const name = (s.name || '').toLowerCase();
  if (name.includes('phone') || name.includes('reparation phone')) {
    if (!name.includes('pc') && !name.includes('info') && !name.includes('gaming') && !name.includes('tech')) {
      return false; // remove
    }
  }
  return true;
};
const cleanedStores = stores.filter(phoneStoreFilter);
console.log(`discovered-stores.json: before ${stores.length}, after ${cleanedStores.length} (removed ${stores.length - cleanedStores.length})`);
fs.writeFileSync(storesPath, JSON.stringify(cleanedStores, null, 2), 'utf8');

// 2. full.json
const fullPath = 'D:/Projects/DZ-PartPicker/full.json';
const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
const allOffers = full.report?.['ouedkniss:all'] || [];

const isPhoneOffer = (o) => {
  const url = (o.url || '').toLowerCase();
  const title = (o.title || '').toLowerCase();
  const seller = (o.seller || o.store || '').toLowerCase();

  if (url.includes('smartphones-') || url.includes('pieces-de-rechange-') || url.includes('optiques-eclairage-')) return true;
  if (seller.includes('dadine') || seller.includes('reparation phone') || seller.includes('fouad phone')) return true;
  if (/^samsung\s+a\d+/i.test(title)) return true;
  if (/\b(?:phare\b|optique\b|pare[\s-]choc|toyota|hilux)\b/i.test(title)) return true;

  return false;
};

const cleanedOffers = allOffers.filter(o => !isPhoneOffer(o));
console.log(`full.json ouedkniss:all: before ${allOffers.length}, after ${cleanedOffers.length} (removed ${allOffers.length - cleanedOffers.length})`);
full.report['ouedkniss:all'] = cleanedOffers;
fs.writeFileSync(fullPath, JSON.stringify(full), 'utf8');

console.log("Cleanup complete!");
