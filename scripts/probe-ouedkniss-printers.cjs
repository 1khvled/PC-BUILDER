const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

async function probe() {
  const query = `query SearchAnnouncements($keywords: String, $page: Int) {
    searchAnnouncements(keywords: $keywords, page: $page) {
      data {
        id
        title
        price
        priceUnit
        description
        slug
        status
        createdAt
        hasStore
        store { name slug wilaya { name } }
        user { username wilaya { name } }
        defaultMedia { mediaUrl }
      }
    }
  }`;

  try {
    const res = await fetch("https://api.ouedkniss.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": UA,
        "Accept": "*/*"
      },
      body: JSON.stringify({
        query,
        variables: { keywords: "imprimante epson canon", page: 1 }
      }),
      signal: AbortSignal.timeout(10000)
    });
    console.log("Status:", res.status);
    const json = await res.json();
    const list = json.data?.searchAnnouncements?.data || [];
    console.log("Found listings:", list.length);
    if (list.length > 0) {
      console.log("Sample 1:", list[0].title, list[0].price, list[0].store?.name);
    }
  } catch (e) {
    console.log("Error:", e.message);
  }
}

probe();
