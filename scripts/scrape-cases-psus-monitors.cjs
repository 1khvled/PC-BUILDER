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

const QUERIES = [
  // --- CASES ---
  "boitier gamer",
  "boitier darkflash",
  "boitier lian li",
  "boitier nzxt",
  "boitier montech",
  "boitier redragon",
  "boitier cougar",
  "boitier segotep",
  "boitier deepcool matrexx",
  "boitier deepcool cc560",
  "boitier msi mag forge",
  "boitier spirit of gamer deathmatch",
  "boitier spirit of gamer rogue",
  "boitier aquarium gaming",

  // --- PSUs ---
  "alimentation pc",
  "alimentation gamer",
  "alimentation 650w",
  "alimentation 750w",
  "alimentation 850w",
  "alimentation 550w",
  "alimentation msi mag",
  "alimentation corsair cv",
  "alimentation corsair cx",
  "alimentation corsair rm",
  "alimentation deepcool pn",
  "alimentation deepcool pl",
  "alimentation deepcool pk",
  "alimentation deepcool pf",
  "alimentation acer 650w",
  "alimentation hybrok bronze",
  "alimentation gigabyte p650",
  "alimentation cooler master mwe",
  "alimentation gamdias aura",
  "alimentation xigmatek hydra",
  "alimentation 80 plus bronze",
  "alimentation 80 plus gold",

  // --- MONITORS ---
  "ecran gamer 144hz",
  "ecran gamer 165hz",
  "ecran gamer 180hz",
  "ecran gamer 240hz",
  "ecran 2k 165hz",
  "ecran 24 pouces gamer",
  "ecran 27 pouces gamer",
  "ecran aoc gaming",
  "ecran msi gaming",
  "ecran asus tuf gaming",
  "ecran samsung odyssey",
  "ecran lg ultragear",
  "ecran xiaomi g24",
  "ecran xiaomi g27",
  "ecran dahua gaming",
  "ecran koorui gaming",
  "ecran viewsonic gaming",
  "ecran titan army",
  "ecran benq zowie",
  "ecran matos katana",
  "ecran philips evnia"
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

async function scrapeCasesPsusMonitors() {
  const fullPath = path.join(__dirname, '..', 'full.json');
  const full = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
  if (!full.report['ouedkniss:all']) {
    full.report['ouedkniss:all'] = [];
  }
  const all = full.report['ouedkniss:all'];

  const existingIds = new Set(all.map(a => String(a.id)));
  console.log(`Initial full.json listings in ouedkniss:all: ${all.length}`);

  let totalNew = 0;

  for (let i = 0; i < QUERIES.length; i++) {
    const q = QUERIES[i];
    console.log(`[${i + 1}/${QUERIES.length}] Querying Ouedkniss for: "${q}"...`);
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
        await sleep(1500);
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
          price: priceNum,
          pricePreview: item.pricePreview || `${priceNum} DA`,
          url: item.slug ? `https://www.ouedkniss.com/${item.slug}` : `https://www.ouedkniss.com/annonce/${item.id}`,
          store: storeName,
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
      await sleep(1500);
    }
  }

  console.log(`\n========================================`);
  console.log(`Total newly scraped listings added: ${totalNew}`);
  console.log(`Final ouedkniss:all total: ${all.length}`);
  console.log(`========================================`);

  fs.writeFileSync(fullPath, JSON.stringify(full, null, 2), 'utf8');
  console.log('Saved updated full.json successfully!');
}

scrapeCasesPsusMonitors();
