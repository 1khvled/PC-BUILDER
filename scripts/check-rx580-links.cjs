const fs = require('fs');

async function checkUrl(id) {
  const query = `
    query AnnouncementGet($id: ID!) {
      announcement: announcementDetails(id: $id) {
        id
        status
        title
        price
      }
    }
  `;
  try {
    const res = await fetch('https://api.ouedkniss.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Origin': 'https://www.ouedkniss.com'
      },
      body: JSON.stringify({ query, variables: { id } })
    });
    if (!res.ok) return { id, status: `HTTP ${res.status}` };
    const json = await res.json();
    const ann = json.data?.announcement;
    if (!ann) return { id, alive: false, reason: 'NULL_OR_DELETED' };
    return { id, alive: true, status: ann.status, title: ann.title, price: ann.price };
  } catch (e) {
    return { id, alive: false, reason: e.message };
  }
}

async function main() {
  const seed = JSON.parse(fs.readFileSync('supabase-seed.json', 'utf8'));
  const okOffers = seed.offers.filter(o => o.u.includes('ouedkniss.com') && (o.p === 'gpu-rx580-8gb' || o.p === 'gpu-rx580-4gb'));
  console.log(`Checking ${okOffers.length} Ouedkniss RX 580 offers from seed...`);

  for (const o of okOffers) {
    const m = o.u.match(/-d(\d+)$/);
    const id = m ? m[1] : null;
    if (!id) {
      console.log(`Bad URL pattern: ${o.u}`);
      continue;
    }
    const res = await checkUrl(id);
    console.log(`ID ${id} | Alive: ${res.alive} | Status: ${res.status || res.reason} | ${o.t}`);
  }
}

main();
