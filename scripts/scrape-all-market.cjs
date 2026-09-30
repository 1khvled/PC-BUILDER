const fs = require('fs');

const GRAPHQL_ENDPOINT = "https://api.ouedkniss.com/graphql";
const BROWSER_UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36";

const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": BROWSER_UA,
  "Origin": "https://www.ouedkniss.com",
  "Referer": "https://www.ouedkniss.com/",
  "Accept-Language": "fr-DZ,fr;q=0.9",
};

const QUERY = `query SearchQuery($q: String, $filter: SearchFilterInput) {
  search(q: $q, filter: $filter) {
    announcements {
      paginatorInfo {
        total
        count
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

const MARKET_QUERIES = [
  // GPU — Especially RX 580 and popular budget/mid-range & high-end GPUs in Algeria
  "rx 580", "rx 580 8gb", "rx 580 4gb", "rx 580 xfx", "rx 580 sapphire", "rx 580 nitro", "rx 590", "rx 570",
  "gtx 1660 super", "gtx 1660 ti", "gtx 1650", "gtx 1060",
  "rtx 2060", "rtx 2060 super", "rtx 2070", "rtx 2080",
  "rtx 3050", "rtx 3060", "rtx 3060 ti", "rtx 3070", "rtx 3070 ti", "rtx 3080", "rtx 3090",
  "rtx 4060", "rtx 4060 ti", "rtx 4070", "rtx 4070 super", "rtx 4070 ti", "rtx 4080", "rtx 4090",
  "rx 6600", "rx 6600 xt", "rx 6650 xt", "rx 6700 xt", "rx 6800", "rx 6800 xt",
  "rx 7600", "rx 7700 xt", "rx 7800 xt", "rx 7900 xt", "rx 7900 xtx", "arc b580",
  
  // CPU
  "ryzen 5 3600", "ryzen 5 5500", "ryzen 5 5600", "ryzen 5 5600x", "ryzen 5 5600g", "ryzen 7 5700x", "ryzen 7 5700x3d", "ryzen 7 5800x3d",
  "ryzen 5 7500f", "ryzen 5 7600", "ryzen 7 7700", "ryzen 7 7800x3d", "ryzen 7 9800x3d",
  "i3 12100", "i3 12100f", "i5 12400", "i5 12400f", "i5 12600k", "i5 13400", "i5 13400f", "i5 13600k", "i5 14400", "i5 14400f", "i5 14600k",
  "i7 12700", "i7 13700", "i7 14700", "i7 14700k", "i9 13900k", "i9 14900k",
  
  // Motherboards
  "b450", "b550", "a520", "b650", "b650m", "a620", "h610", "b660", "b760", "b760m", "z790",
  
  // RAM
  "16gb ddr4", "32gb ddr4", "8gb ddr4", "ddr4 3200", "ddr4 3600",
  "ddr5 16gb", "ddr5 32gb", "ddr5 6000", "32gb ddr5", "16gb ddr5",
  "corsair ddr4", "xpg ddr4", "fury ddr4", "lexar ddr4",
  
  // SSD
  "1tb nvme", "512gb nvme", "2tb nvme", "256gb nvme", "ssd sata",
  "sn580", "sn770", "sn850x", "980 pro", "990 pro", "kc3000", "legend 710", "nv3 1tb",
  
  // PSU
  "alimentation 550w", "alimentation 600w", "alimentation 650w", "alimentation 750w", "alimentation 850w", "alimentation 1000w",
  "deepcool pk", "cooler master mwe", "msi mag a650bn",
  
  // Cases
  "boitier gamer", "boitier aquarium", "boitier atx",
  
  // Coolers
  "ak400", "ak620", "ag400", "ag620", "peerless assassin", "phantom spirit", "watercooling 240", "watercooling 360"
];

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

async function scrapeOuedknissQuery(q, maxPages = 2) {
  const offers = [];
  const seenIds = new Set();

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) await sleep(600);

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

      if (!res.ok) break;
      const json = await res.json();
      const items = json?.data?.search?.announcements?.data || [];
      if (items.length === 0) break;

      for (const item of items) {
        if (!item || !item.id || seenIds.has(item.id)) continue;
        seenIds.add(item.id);

        const isStore = Boolean(item.isFromStore || item.store);
        if (!isStore) continue; // Verified Store only

        const st = String(item.status || "").toUpperCase();
        if (st && st !== "PUBLISHED" && st !== "ACTIVE" && st !== "EDITED") continue;

        // Freshness: reject listings older than 45 days
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
          isFromStore: true,
          storeSlug: item.store?.slug || undefined,
          storeId: item.store?.id || undefined,
          query: q
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
  console.log("DZ-PartPicker: Full Algerian Market Scraper & RX 580 Sweep");
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

  for (let i = 0; i < MARKET_QUERIES.length; i++) {
    const q = MARKET_QUERIES[i];
    process.stdout.write(`[${i + 1}/${MARKET_QUERIES.length}] Query "${q}"... `);

    const offers = await scrapeOuedknissQuery(q, 3);
    let added = 0;

    for (const o of offers) {
      if (!existingUrlMap.has(o.url)) {
        existingUrlMap.set(o.url, o);
        existingOffers.push(o);
        added++;
        totalNew++;
      } else {
        // Update price & date if newer
        const old = existingUrlMap.get(o.url);
        if (o.priceDa && o.priceDa !== old.priceDa) {
          old.priceDa = o.priceDa;
        }
      }
    }

    console.log(`got ${offers.length} (+${added} new)`);
    await sleep(400);
  }

  console.log("==========================================================");
  console.log(`Sweep Complete! Total NEW unique offers added: ${totalNew}`);
  console.log(`Total listings in full.json ouedkniss:all: ${existingOffers.length}`);
  console.log("==========================================================");

  fs.writeFileSync("full.json", JSON.stringify(full), "utf8");
  console.log("Saved updated full.json!");
}

main().catch(console.error);
