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

const WEIRD_QUERIES = [
  // --- WEIRD & RANDOM MONITORS ---
  "ecran dahua",
  "moniteur dahua",
  "ecran matos",
  "moniteur matos",
  "matos msg",
  "matos katana",
  "ecran titan army",
  "moniteur titan army",
  "ecran koorui",
  "moniteur koorui",
  "ecran skyworth",
  "ecran hikvision",
  "ecran game revolution",
  "ecran vulpes",
  "ecran spirit of gamer",
  "moniteur spirit of gamer",
  "ecran esonic",
  "ecran maxipower",
  "ecran datazone",
  "ecran twist",
  "ecran asgard",
  "ecran zeaginal",
  "ecran delux",
  "ecran mikuso",
  "ecran advance",

  // --- WEIRD & RANDOM PSUs ---
  "alimentation hybrok",
  "psu hybrok",
  "alimentation acer",
  "psu acer",
  "alimentation gamdias",
  "psu gamdias",
  "alimentation capsys",
  "psu capsys",
  "alimentation ares",
  "psu ares",
  "alimentation magma",
  "psu magma",
  "alimentation raidmax",
  "psu raidmax",
  "alimentation spirit of gamer",
  "psu spirit of gamer",
  "alimentation mars gaming",
  "psu mars gaming",
  "alimentation segotep",
  "psu segotep",
  "alimentation 1stplayer",
  "psu 1stplayer",
  "alimentation xigmatek",
  "psu xigmatek",
  "alimentation cougar",
  "psu cougar",
  "alimentation aerocool",
  "psu aerocool",
  "alimentation redragon",
  "psu redragon",
  "alimentation fsp",
  "psu fsp",
  "alimentation mikuso",
  "alimentation delux"
];

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const LAPTOP_EXCLUDES = [
  'laptop', 'pc portable', 'vivobook', 'thinkpad', 'latitude', 'zenbook',
  'macbook', 'yoga', 'ideapad', 'elitebook', 'probook', 'victus', 'tuf dash',
  'nitro 5', 'predator', 'loq', 'legion', 'zephyrus', 'strix g15', 'strix g16',
  'strix g17', 'strix g18', 'katana 15', 'katana 17', 'sword', 'thin 15', 'cyborg'
];

function isLaptop(title) {
  const t = title.toLowerCase();
  return LAPTOP_EXCLUDES.some(w => t.includes(w));
}

async function scrapeWeird() {
  const fullPath = path.join(__dirname, '..', 'full.json');
  const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (!full.report['ouedkniss:all']) {
    full.report['ouedkniss:all'] = [];
  }
  const all = full.report['ouedkniss:all'];

  const existingIds = new Set(all.map(a => String(a.id)));
  console.log(`Initial full.json listings in ouedkniss:all: ${all.length}`);

  let totalNew = 0;

  for (let i = 0; i < WEIRD_QUERIES.length; i++) {
    const q = WEIRD_QUERIES[i];
    console.log(`[${i + 1}/${WEIRD_QUERIES.length}] Querying Ouedkniss for: "${q}"...`);
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
        await sleep(1200);
        continue;
      }

      const json = await res.json();
      const items = json.data?.search?.announcements?.data || [];
      console.log(`  Fetched ${items.length} raw results`);

      let added = 0;
      for (const item of items) {
        if (!item || !item.id) continue;
        const idStr = String(item.id);
        if (existingIds.has(idStr)) continue;

        const title = item.title || '';
        // Skip obvious laptops from monitor queries
        if (q.includes('ecran') && isLaptop(title)) continue;

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

        const entry = {
          id: item.id,
          title: item.title,
          priceDa: priceNum,
          price: priceNum,
          pricePreview: item.pricePreview || `${priceNum} DA`,
          url: item.slug ? `https://www.ouedkniss.com/${item.slug}` : `https://www.ouedkniss.com/annonce/${item.id}`,
          store: storeName,
          seller: storeName,
          isFromStore: item.isStore ?? true,
          wilaya: wilaya,
          image: media,
          scrapedAt: new Date().toISOString()
        };

        all.push(entry);
        existingIds.add(idStr);
        added++;
        totalNew++;
      }

      console.log(`  Added ${added} new listings (Running new total: ${totalNew})`);
      await sleep(1000);
    } catch (err) {
      console.error(`  Error querying "${q}":`, err.message);
      await sleep(1200);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total newly scraped listings added: ${totalNew}`);
  console.log(`Final ouedkniss:all total: ${all.length}`);
  console.log(`========================================`);

  fs.writeFileSync(fullPath, JSON.stringify(full, null, 2), 'utf8');
  console.log('Saved updated full.json successfully!');
}

scrapeWeird();
