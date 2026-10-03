const fs = require('fs');
const path = require('path');

const GRAPHQL_ENDPOINT = 'https://api.ouedkniss.com/graphql';
const HEADERS = {
  'Content-Type': 'application/json',
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36',
  'Origin': 'https://www.ouedkniss.com',
  'Referer': 'https://www.ouedkniss.com/',
  'Accept-Language': 'fr-DZ,fr;q=0.9',
};

const QUERY = `query SearchQuery($q: String, $filter: SearchFilterInput) {
  search(q: $q, filter: $filter) {
    announcements {
      paginatorInfo {
        total
        count
        currentPage
        lastPage
        hasMorePages
      }
      data {
        id
        title
        price
        pricePreview
        description
        slug
        status
        createdAt
        refreshedAt
        isFromStore
        cities {
          name
          region {
            name
          }
        }
        store {
          id
          name
          slug
        }
        user {
          username
        }
        defaultMedia {
          mediaUrl
        }
      }
    }
  }
}`;

const CASE_QUERIES = [
  "boitier pc gamer",
  "boitier hybrok",
  "boitier gamemax",
  "boitier xigmatek",
  "boitier raidmax",
  "boitier havit",
  "boitier fsp",
  "boitier segotep",
  "boitier darkflash",
  "boitier mars gaming",
  "boitier cougar",
  "boitier galax",
  "boitier antec",
  "boitier bureautique",
  "case gaming atx",
  "boitier aquarium gaming",
  "refroidisseur cpu cooler",
  "watercooling deepcool",
  "watercooling raidmax",
  "air cooler thermalright"
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapeCases() {
  const fullPath = path.join(__dirname, '..', 'full.json');
  const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (!full.report['ouedkniss:all']) {
    full.report['ouedkniss:all'] = [];
  }
  const all = full.report['ouedkniss:all'];

  const existingIds = new Set(all.map(a => String(a.id)));
  console.log(`Initial full.json listings: ${all.length}`);

  let totalNew = 0;

  for (const q of CASE_QUERIES) {
    console.log(`\nQuerying Ouedkniss for: "${q}"...`);
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: 'POST',
        headers: HEADERS,
        body: JSON.stringify({
          query: QUERY,
          variables: {
            q,
            filter: {
              page: 1,
              count: 50
            }
          }
        }),
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) {
        console.log(`  Failed HTTP ${res.status}`);
        continue;
      }

      const json = await res.json();
      const items = json.data?.search?.announcements?.data || [];
      console.log(`  Found ${items.length} announcements for "${q}".`);

      let added = 0;
      for (const item of items) {
        if (!item || !item.id) continue;
        const idStr = String(item.id);
        if (existingIds.has(idStr)) continue;

        let priceNum = 0;
        if (typeof item.price === 'number') {
          priceNum = item.price;
        } else if (typeof item.pricePreview === 'string') {
          const m = item.pricePreview.replace(/\s+/g, '').match(/(\d+)/);
          if (m) priceNum = parseInt(m[1], 10);
        }

        const storeName = item.store?.name || item.user?.username || 'Ouedkniss Store';
        const wilaya = item.cities?.[0]?.region?.name || 'Alger';
        const media = item.defaultMedia?.mediaUrl || '';

        const record = {
          id: idStr,
          title: item.title || '',
          price: priceNum,
          pricePreview: item.pricePreview || `${priceNum} DA`,
          slug: item.slug || '',
          store: storeName,
          wilaya: wilaya,
          image: media,
          status: item.status || 'VALID',
          refreshedAt: item.refreshedAt || item.createdAt || new Date().toISOString()
        };

        all.push(record);
        existingIds.add(idStr);
        added++;
        totalNew++;
      }
      console.log(`  -> Added ${added} new listings.`);

      await sleep(1500);
    } catch (err) {
      console.log(`  Error querying "${q}":`, err.message);
      await sleep(2000);
    }
  }

  console.log(`\nDone! Total new listings scraped: ${totalNew}`);
  console.log(`New total listings in ouedkniss:all: ${all.length}`);

  fs.writeFileSync(fullPath, JSON.stringify(full, null, 2));
  console.log('Saved full.json successfully.');
}

scrapeCases().catch(err => {
  console.error('Fatal scrape error:', err);
  process.exit(1);
});
