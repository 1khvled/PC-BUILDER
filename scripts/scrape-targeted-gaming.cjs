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

const TARGET_QUERIES = [
  // Budget & Mid-Range AMD GPUs
  "rx 590", "rx 590 8gb", "rx 590 sapphire",
  "rx 570", "rx 570 8gb", "rx 570 4gb", "rx 570 sapphire",
  "rx 5500 xt", "rx 5500 xt 8gb", "rx 5500 xt 4gb", "rx 5500", "5500 xt", "5500 xt 8gb", "carte graphique rx 5500",
  "rx 5600 xt", "rx 5700 xt", "rx 580", "rx 580 8gb",

  // Budget & Mid-Range Nvidia GPUs
  "gtx 1660 6gb", "gtx 1660", "gtx 1660 super", "gtx 1660 ti", "carte graphique gtx 1660",
  "gtx 1650 super", "1650 super", "gtx 1650s", "gtx 1650", "gtx 1650 4gb", "gtx 1060 6gb", "gtx 1050 ti",

  // Intel Arc GPUs
  "arc b580", "intel arc b580", "b580 12gb", "arc a750", "intel arc a750", "arc a580", "arc a380",

  // High-Demand & Underrated CPUs
  "ryzen 5 3600", "r5 3600", "amd ryzen 5 3600",
  "ryzen 5 4500", "r5 4500", "amd ryzen 5 4500",
  "ryzen 7 5700x3d", "5700x3d", "r7 5700x3d",
  "i5 12600kf", "12600kf", "i5 12600k", "i3 12100f",
  "ryzen 5 5500", "r5 5500", "amd ryzen 5 5500",

  // High-Demand NVMe SSDs
  "kingston nv3", "nv3 1tb", "nv3 500gb", "kingston nv2", "nv2 1tb",
  "lexar nm620", "lexar nm710", "nm620 1tb", "nm710 1tb",

  // Popular Algerian Monitors (Matos Katana & MSG, AOC, Xiaomi, Dahua)
  "katana 24", "katana 27", "matos katana", "matos msg", "msg 24", "msg 27", "ecran matos",
  "aoc 24g4", "aoc 27g4", "xiaomi g24i", "xiaomi g27i", "dahua lm24", "dahua lm27",
  "redragon ruby", "redragon emerald", "odyssey g3", "odyssey g5", "koorui 24e4", "msi mag 255f",

  // Popular Algerian Market PSUs
  "deepcool pk550d", "deepcool pk650d", "deepcool pk750d", "deepcool pn750m", "deepcool pn850m",
  "antec atom 550", "antec atom 650", "antec b550", "antec b650",
  "mars gaming mpb", "mars gaming 650w", "mars gaming 750w",
  "redragon rgps", "cougar vte", "cougar xtc", "1stplayer ngdp",
  "msi mag a650bn", "msi mag a750bn"
];

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function scrapeOuedknissQuery(q, maxPages = 3) {
  const offers = [];

  for (let page = 1; page <= maxPages; page++) {
    try {
      const res = await fetch(GRAPHQL_ENDPOINT, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify({
          query: QUERY,
          variables: {
            q,
            filter: { page, count: 48 },
          },
        }),
      });

      if (!res.ok) break;
      const json = await res.json();
      const items = json?.data?.search?.announcements?.data || [];
      if (!items.length) break;

      for (const item of items) {
        if (!item || !item.id) continue;
        const isStore = Boolean(item.isFromStore || item.store);
        const st = String(item.status || "").toUpperCase();
        if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") continue;

        const postDate = item.refreshedAt || item.createdAt;
        if (postDate) {
          const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
          if (!isNaN(ageDays) && ageDays > 45) continue;
        }

        let price = item.price;
        if (!price && item.pricePreview) {
          const cleaned = String(item.pricePreview).replace(/\s/g, "");
          const m = cleaned.match(/^(\d{4,8})(?:DA|DZD)?$/i);
          if (m) price = parseInt(m[1], 10);
        }
        if (!price || price < 1500 || price > 5_000_000) continue;
        if (/^(?:1000|1111|1234|12345|123456|9999|99999|1000000)$/.test(String(price))) continue;

        const title = (item.title || "").replace(/\s+/g, " ").trim();
        if (!title || title.length < 8) continue;

        const slug = item.slug || "annonce";
        const url = `https://www.ouedkniss.com/${slug}-d${item.id}`;
        const primaryCity = item.cities?.[0];
        const wilaya = primaryCity?.region?.name || primaryCity?.name || "Alger";
        const seller = item.store?.name?.trim() || item.user?.username?.trim() || "Ouedkniss";

        offers.push({
          id: item.id,
          title,
          priceDa: price,
          url,
          stock: "Ouedkniss",
          image: item.defaultMedia?.mediaUrl || "",
          wilaya,
          seller,
          postedAt: item.refreshedAt || item.createdAt || "",
          isFromStore: isStore,
          storeSlug: item.store?.slug || undefined,
          storeId: item.store?.id || undefined,
          query: q,
          description: item.description || ""
        });
      }

      const paginator = json?.data?.search?.announcements?.paginatorInfo;
      if (paginator && paginator.hasMorePages === false) break;
    } catch (e) {
      console.error(`Error querying "${q}" p${page}:`, e.message);
      break;
    }
  }

  return offers;
}

async function main() {
  console.log("==========================================================");
  console.log("DZ-PartPicker: Targeted Gaming & Low-Budget Market Sweep");
  console.log("==========================================================");

  let full = { done: {}, report: {} };
  try {
    full = JSON.parse(fs.readFileSync("full.json", "utf8"));
  } catch (e) {
    console.log("Creating new full.json structure");
  }
  full.report = full.report || {};
  full.report["ouedkniss:all"] = full.report["ouedkniss:all"] || [];

  const existingOffers = full.report["ouedkniss:all"];
  console.log(`Current listings in full.json ouedkniss:all: ${existingOffers.length}`);

  const existingUrlMap = new Map();
  for (const o of existingOffers) {
    if (o.url) existingUrlMap.set(o.url, o);
  }

  let totalNew = 0;
  let totalUpdated = 0;

  for (let i = 0; i < TARGET_QUERIES.length; i++) {
    const q = TARGET_QUERIES[i];
    process.stdout.write(`[${i + 1}/${TARGET_QUERIES.length}] Query "${q}"... `);

    const offers = await scrapeOuedknissQuery(q, 3);
    let added = 0;
    let updated = 0;

    for (const o of offers) {
      if (!existingUrlMap.has(o.url)) {
        existingUrlMap.set(o.url, o);
        existingOffers.push(o);
        added++;
        totalNew++;
      } else {
        const old = existingUrlMap.get(o.url);
        let changed = false;
        if (o.priceDa && o.priceDa !== old.priceDa) {
          old.priceDa = o.priceDa;
          changed = true;
        }
        if (o.postedAt && o.postedAt > (old.postedAt || "")) {
          old.postedAt = o.postedAt;
          changed = true;
        }
        if (o.query && o.query !== old.query) {
          old.query = o.query;
          changed = true;
        }
        if (o.title && o.title !== old.title) {
          old.title = o.title;
          changed = true;
        }
        if (o.seller && (!old.seller || old.seller === "Ouedkniss")) {
          old.seller = o.seller;
          changed = true;
        }
        if (typeof o.isFromStore === "boolean" && o.isFromStore !== old.isFromStore) {
          old.isFromStore = o.isFromStore;
          changed = true;
        }
        if (changed) {
          updated++;
          totalUpdated++;
        }
      }
    }

    console.log(`got ${offers.length} (+${added} new, ~${updated} refreshed)`);
    await sleep(400);
  }

  console.log("==========================================================");
  console.log(`Sweep Complete! Total NEW unique offers added: ${totalNew}`);
  console.log(`Total listings refreshed with new timestamps/queries: ${totalUpdated}`);
  console.log(`Total listings in full.json ouedkniss:all: ${existingOffers.length}`);
  console.log("==========================================================");

  fs.writeFileSync("full.json", JSON.stringify(full), "utf8");
  console.log("Saved updated full.json!");
}

main().catch(console.error);
