const GRAPHQL_ENDPOINT = "https://api.ouedkniss.com/graphql";
const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Origin": "https://www.ouedkniss.com",
};

const QUERY = `query SearchQuery($q: String) {
  search(q: $q) {
    announcements {
      data {
        id
        title
        price
        slug
        store {
          id
          name
          slug
        }
        user {
          username
        }
      }
    }
  }
}`;

async function search(q) {
  console.log(`\nSearching Ouedkniss for: "${q}"...`);
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query: QUERY, variables: { q } })
  });
  const json = await res.json();
  const list = json?.data?.search?.announcements?.data || [];
  console.log(`Found ${list.length} results:`);
  for (const item of list.slice(0, 10)) {
    console.log(`  - [${item.id}] ${item.title} (${item.price} DA) | Seller: ${item.store?.name || item.user?.username} (storeId: ${item.store?.id})`);
  }
}

async function main() {
  await search("bytek");
  await search("bytekstore");
  await search("teqniya");
}

main();
