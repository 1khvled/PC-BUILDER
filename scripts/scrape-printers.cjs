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

const PRINTER_QUERIES = [
  "imprimante canon",
  "imprimante epson",
  "epson ecotank",
  "epson l3250",
  "epson l3210",
  "epson l8050",
  "canon pixma",
  "canon g3411",
  "canon g3410",
  "canon g2411",
  "canon mf3010",
  "canon lbp6030",
  "hp laser 107w",
  "hp smart tank",
  "pantum laser"
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function scrapePrinters() {
  const fullPath = path.join(__dirname, '..', 'full.json');
  const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  const all = full.report['ouedkniss:all'] || [];

  const existingIds = new Set(all.map(a => String(a.id)));
  console.log(`Initial full.json listings: ${all.length}`);

  let totalNew = 0;

  for (const q of PRINTER_QUERIES) {
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

        // Parse price in DA
        let priceDa = item.price;
        if (!priceDa && item.pricePreview) {
          const match = item.pricePreview.replace(/\s+/g, '').match(/(\d+)/);
          if (match) priceDa = parseInt(match[1], 10);
        }
        if (!priceDa || priceDa < 5000 || priceDa > 500000) continue;

        const storeName = item.store?.name || (item.user?.username ? `Particulier (${item.user.username})` : 'Ouedkniss');
        const wilaya = item.cities?.[0]?.region?.name || item.cities?.[0]?.name || 'Alger';
        const url = `https://www.ouedkniss.com/${item.slug}-d${item.id}`;

        const entry = {
          id: item.id,
          title: item.title,
          priceDa,
          url,
          stock: 'Ouedkniss',
          image: item.defaultMedia?.mediaUrl || '',
          wilaya,
          seller: item.store?.name || item.user?.username || 'Ouedkniss',
          postedAt: item.refreshedAt || item.createdAt || new Date().toISOString(),
          isFromStore: !!item.isFromStore,
          storeSlug: item.store?.slug || '',
          storeId: item.store?.id || '',
          query: `ouedkniss:${q}`,
          store: item.store?.name || ''
        };

        all.push(entry);
        existingIds.add(idStr);
        added++;
        totalNew++;
      }
      console.log(`  -> Added ${added} new listings (total new: ${totalNew})`);
      await sleep(1000);
    } catch (err) {
      console.log(`  Error querying "${q}":`, err.message);
    }
  }

  console.log(`\nFinished! Total new printer listings added: ${totalNew}`);
  console.log(`Total listings in full.json now: ${all.length}`);

  full.report['ouedkniss:all'] = all;
  fs.writeFileSync(fullPath, JSON.stringify(full), 'utf8');
  console.log(`Saved updated full.json!`);
}

scrapePrinters();
