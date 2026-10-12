const fs = require('fs');

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

const PREBUILT_QUERIES = [
  "pc gamer",
  "pc gaming",
  "unite centrale gamer",
  "unite gamer",
  "setup pc gamer",
  "config pc gamer",
  "tour pc gamer",
  "desktop gamer",
  "pc gamer rtx",
  "pc gamer gtx",
  "pc gamer rx",
  "pc gamer ryzen 5",
  "pc gamer ryzen 7",
  "pc gamer i5",
  "pc gamer i7",
  "pc gamer i3",
  "pc gamer 4060",
  "pc gamer 3060",
  "pc gamer 1660",
  "pc gamer 580",
  "pc gamer ddr5",
  "pc gamer ddr4",
  "unite centrale i5",
  "unite centrale ryzen",
  "ordinateur gamer"
];

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function queryOuedkniss(q, page = 1) {
  try {
    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({
        query: QUERY,
        variables: {
          q,
          filter: {
            page,
            count: 48,
          }
        }
      })
    });
    if (!res.ok) return { offers: [], hasMore: false };
    const json = await res.json();
    const items = json?.data?.search?.announcements?.data || [];
    const paginator = json?.data?.search?.announcements?.paginatorInfo;

    const offers = items.map((item) => {
      if (!item || !item.id) return null;
      const st = String(item.status || "").toUpperCase();
      if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") return null;

      // Price
      let price = item.price;
      if (!price && item.pricePreview) {
        const cleaned = String(item.pricePreview).replace(/\s/g, "");
        const m = cleaned.match(/^(\d{4,8})(?:DA|DZD)?$/i);
        if (m) price = parseInt(m[1], 10);
      }
      if (!price || price < 25000 || price > 1200000) return null;

      const title = (item.title || "").replace(/\s+/g, " ").trim();
      if (!title || title.length < 8) return null;

      const desc = (item.description || "").replace(/\s+/g, " ").trim();
      const slug = item.slug || "annonce";
      const url = `https://www.ouedkniss.com/${slug}-d${item.id}`;
      const primaryCity = item.cities?.[0];
      const wilaya = primaryCity?.region?.name || primaryCity?.name || "Alger";
      const seller = item.store?.name?.trim() || item.user?.username?.trim() || "Ouedkniss";

      return {
        id: item.id,
        title,
        description: desc,
        priceDa: price,
        url,
        stock: "En stock",
        image: item.defaultMedia?.mediaUrl || "",
        wilaya,
        seller,
        store: seller,
        postedAt: item.refreshedAt || item.createdAt || new Date().toISOString(),
        isFromStore: Boolean(item.isFromStore || item.store),
        isStore: Boolean(item.isFromStore || item.store),
        storeSlug: item.store?.slug || undefined,
        storeId: item.store?.id || undefined,
        query: `prebuilt:${q}`
      };
    }).filter(Boolean);

    return { offers, hasMore: Boolean(paginator?.hasMorePages) };
  } catch (e) {
    return { offers: [], hasMore: false };
  }
}

async function main() {
  console.log("==========================================================");
  console.log("DZ-PartPicker: Prebuilt PCs & Unités Centrales Market Sweep");
  console.log("Targeting complete gaming desktop rigs across Algeria");
  console.log("==========================================================");

  let full = { done: {}, report: {} };
  try {
    full = JSON.parse(fs.readFileSync("full.json", "utf8"));
  } catch (e) {
    full = { ok: true, report: {} };
  }
  full.report = full.report || {};
  full.report["ouedkniss:all"] = full.report["ouedkniss:all"] || [];

  const existingOffers = full.report["ouedkniss:all"];
  console.log(`Starting listings in full.json: ${existingOffers.length}`);

  const existingUrlMap = new Map();
  for (const o of existingOffers) {
    if (o.url) existingUrlMap.set(o.url, o);
  }

  let totalNew = 0;
  let totalRefreshed = 0;

  for (let i = 0; i < PREBUILT_QUERIES.length; i++) {
    const q = PREBUILT_QUERIES[i];
    process.stdout.write(`[${i + 1}/${PREBUILT_QUERIES.length}] Sweeping prebuilts "${q}"... `);

    let queryNew = 0;
    for (let page = 1; page <= 3; page++) {
      const { offers, hasMore } = await queryOuedkniss(q, page);
      for (const o of offers) {
        if (!existingUrlMap.has(o.url)) {
          existingUrlMap.set(o.url, o);
          existingOffers.push(o);
          queryNew++;
          totalNew++;
        } else {
          const old = existingUrlMap.get(o.url);
          if (o.priceDa && o.priceDa !== old.priceDa) {
            old.priceDa = o.priceDa;
            totalRefreshed++;
          }
          if (o.description && !old.description) {
            old.description = o.description;
          }
        }
      }
      if (!hasMore) break;
      await sleep(400);
    }

    console.log(`+${queryNew} new systems found`);
    await sleep(500);
  }

  console.log("\n==========================================================");
  console.log(`Prebuilt Sweep Complete!`);
  console.log(`Total NEW unique prebuilt listings added: ${totalNew}`);
  console.log(`Total listings refreshed: ${totalRefreshed}`);
  console.log(`Total announcements in full.json: ${existingOffers.length}`);
  console.log("==========================================================");

  fs.writeFileSync("full.json", JSON.stringify(full), "utf8");
  console.log("Saved updated full.json!");
}

main().catch(console.error);
