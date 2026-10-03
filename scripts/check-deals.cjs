const fs = require('fs');
const path = require('path');
const seedPath = path.join(__dirname, '..', 'supabase-seed.json');
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
const OFFERS = seed.offers || [];
console.log('Sample offer 0:', OFFERS[0]);
console.log('Sample offer 1:', OFFERS[1]);

// Check conditions and status
const conditions = new Set(OFFERS.map(o => o.condition));
const statuses = new Set(OFFERS.map(o => o.status));
console.log('Conditions in offers:', [...conditions]);
console.log('Statuses in offers:', [...statuses]);
