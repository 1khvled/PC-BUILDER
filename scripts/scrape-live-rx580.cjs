const fs = require('fs');

async function scrapeRx580() {
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
        paginatorInfo { total count lastPage }
        data {
          id title price pricePreview description slug status createdAt refreshedAt isFromStore
          cities { name region { name } }
          store { id name slug }
          user { username }
          defaultMedia { mediaUrl }
        }
      }
    }
  }`;

  const queries = [
    'rx 580', 'rx 580 8gb', 'rx 580 4gb', 'rx 580 xfx', 'rx 580 sapphire',
    'rx 580 afox', 'rx 580 ninja', 'rx 580 2048sp', 'carte graphique rx 580',
    'rx 580 armor', 'rx 580 msi', 'rx 580 powercolor', 'rx 580 peladn',
    'rx 580 soyo', 'rx 580 mllse', 'rx580 8gb', 'rx580'
  ];

  const full = JSON.parse(fs.readFileSync('full.json', 'utf8'));
  const okAll = full.report['ouedkniss:all'] || [];
  const existingMap = new Map();
  for (const o of okAll) if (o.url) existingMap.set(o.url, o);

  let newCount = 0;
  let updatedCount = 0;

  for (const q of queries) {
    process.stdout.write(`Scraping Ouedkniss for: "${q}"... `);
    let qTotal = 0;
    for (let page = 1; page <= 4; page++) {
      try {
        const res = await fetch(GRAPHQL_ENDPOINT, {
          method: 'POST',
          headers: HEADERS,
          body: JSON.stringify({ query: QUERY, variables: { q, filter: { page, count: 48 } } })
        });
        if (!res.ok) break;
        const json = await res.json();
        const items = json.data?.search?.announcements?.data || [];
        if (!items.length) break;

        for (const item of items) {
          if (!item || !item.id) continue;
          const isStore = Boolean(item.isFromStore || item.store);
          if (!isStore) continue;

          const st = String(item.status || '').toUpperCase();
          if (st && st !== 'PUBLISHED' && st !== 'ACTIVE' && st !== 'EDITED') continue;

          const postDate = item.refreshedAt || item.createdAt;
          if (postDate) {
            const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
            if (!isNaN(ageDays) && ageDays > 45) continue;
          }

          let price = item.price;
          if (!price && item.pricePreview) {
            const cleaned = String(item.pricePreview).replace(/\s/g, '');
            const m = cleaned.match(/^(\d{4,8})(?:DA|DZD)?$/i);
            if (m) price = parseInt(m[1], 10);
          }
          if (!price || price < 1500 || price > 5000000) continue;
          if (/^(?:1000|1111|1234|12345|123456|9999|99999|1000000)$/.test(String(price))) continue;

          const title = (item.title || '').replace(/\s+/g, ' ').trim();
          if (!title || title.length < 8) continue;

          const slug = item.slug || 'annonce';
          const url = `https://www.ouedkniss.com/${slug}-d${item.id}`;
          const primaryCity = item.cities?.[0];
          const wilaya = primaryCity?.region?.name || primaryCity?.name || 'Alger';
          const seller = item.store?.name?.trim() || item.user?.username?.trim() || 'Ouedkniss';

          const offerObj = {
            id: item.id,
            title,
            priceDa: price,
            url,
            stock: 'Ouedkniss',
            image: item.defaultMedia?.mediaUrl || '',
            wilaya,
            seller,
            postedAt: item.refreshedAt || item.createdAt || '',
            isFromStore: true,
            storeSlug: item.store?.slug || undefined,
            storeId: item.store?.id || undefined,
            query: q
          };

          if (!existingMap.has(url)) {
            existingMap.set(url, offerObj);
            okAll.push(offerObj);
            newCount++;
            qTotal++;
          } else {
            const existing = existingMap.get(url);
            existing.priceDa = price;
            existing.postedAt = offerObj.postedAt;
            existing.title = title;
            existing.seller = seller;
            updatedCount++;
            qTotal++;
          }
        }

        const paginator = json.data?.search?.announcements?.paginatorInfo;
        if (paginator && paginator.hasMorePages === false) break;
      } catch (e) {
        console.error('Error on query', q, 'page', page, e.message);
        break;
      }
    }
    console.log(`got ${qTotal} offers`);
    await new Promise(r => setTimeout(r, 400));
  }

  console.log(`\nDone! Added ${newCount} new offers, updated ${updatedCount} existing offers.`);
  full.report['ouedkniss:all'] = okAll;
  fs.writeFileSync('full.json', JSON.stringify(full), 'utf8');
  console.log('Saved full.json successfully!');
}

scrapeRx580().catch(console.error);
