const GRAPHQL_ENDPOINT = "https://api.ouedkniss.com/graphql";
const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36",
  "Origin": "https://www.ouedkniss.com",
};

const QUERY = `query SearchQuery($filter: SearchFilterInput) {
  search(filter: $filter) {
    announcements {
      paginatorInfo {
        total
        count
      }
      data {
        id
        title
        price
        slug
        refreshedAt
        createdAt
        cities {
          name
          region {
            name
          }
        }
        defaultMedia {
          mediaUrl
        }
      }
    }
  }
}`;

async function checkUser(username) {
  // Let's get user info from announcement 57782910 first
  const queryAnn = `query {
    GetAnnouncement(id: 57782910) {
      id
      title
      user {
        id
        username
      }
      store {
        id
        name
      }
    }
  }`;
  const res = await fetch(GRAPHQL_ENDPOINT, {
    method: "POST",
    headers: HEADERS,
    body: JSON.stringify({ query: queryAnn })
  });
  const json = await res.json();
  console.log("Announcement user:", json?.data?.GetAnnouncement);
  const userId = json?.data?.GetAnnouncement?.user?.id;
  if (userId) {
    console.log(`Searching all announcements for user ID: ${userId}...`);
    const uRes = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: HEADERS,
      body: JSON.stringify({ query: QUERY, variables: { filter: { userId: parseInt(userId, 10), count: 50 } } })
    });
    const uJson = await uRes.json();
    const items = uJson?.data?.search?.announcements?.data || [];
    console.log(`Found ${items.length} announcements from Bytek Store owner:`);
    for (const it of items) {
      console.log(`  - [${it.id}] ${it.title} (${it.price} DA) | https://www.ouedkniss.com/${it.slug}-d${it.id}`);
    }
  }
}

checkUser();
