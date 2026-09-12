import { REAL_UA, delay, type RawOffer } from "./base";

/**
 * ============================================================================
 * OUEDKNISS INTERNAL DATA ENDPOINT DISCOVERY & REVERSE ENGINEERING NOTES
 * ============================================================================
 *
 * 1. Architecture:
 *    - Ouedkniss (ouedkniss.com) runs a Vue 3 / Nuxt / Vuetify frontend.
 *    - To bot user-agents (e.g., DZPartPicker-bot), the web server serves
 *      a heavy server-rendered (SSR) HTML response (~1 MB) with `data-v-a81b776d`
 *      attributes, but omitting client hydration scripts.
 *    - To real browser user-agents, it serves an SPA shell referencing Webpack
 *      chunks on `https://cdn.ouedkniss.com/app/static/js/`.
 *    - The HTML `<head>` contains `<link rel="preconnect" href="https://api.ouedkniss.com/graphql">`.
 *
 * 2. Pagination on Web Search URL:
 *    - SSR search URL `https://www.ouedkniss.com/s?keywords=X` ignores query
 *      parameters like `&page=2`, `&p=2`, etc. (it repeatedly outputs page 1).
 *    - Subpath URLs like `/s/2?keywords=X` return HTTP 503.
 *
 * 3. Client JS Bundle Inspection:
 *    - Inspection of `index~2.bfac09cde1bb7e0c.3.6.20.m.js` and `index~0.31ae12dd11385a49.3.6.20.m.js`
 *      revealed the core queries: `SearchQuery`, `SearchAnnouncementsQuery`,
 *      and fragments `SearchAnnouncementsContent` on `AnnouncementPagination`,
 *      and `AnnouncementContentNoUserReaction` on `Announcement`.
 *    - Store action `search/FetchSearchQuery` builds variables `{ q: keywords, filter: filtersVariables }`.
 *    - `filtersVariables` accepts `{ page: Int, count: 48, ... }`.
 *
 * 4. Internal API Endpoint:
 *    - URL: `https://api.ouedkniss.com/graphql`
 *    - Method: `POST`
 *    - Headers required:
 *        - `Content-Type: application/json`
 *        - `User-Agent`: Real browser UA (bot UAs containing "bot" receive HTTP 403 Forbidden).
 *        - `Origin: https://www.ouedkniss.com`
 *        - `Referer: https://www.ouedkniss.com/`
 *        - `Accept-Language: fr-DZ,fr;q=0.9`
 *    - Introspection is disabled (`INTROSPECTION_DISABLED`), but direct GraphQL
 *      operations are fully functional.
 *
 * 5. Pagination & Extracted Metadata:
 *    - Paginator: `paginatorInfo { currentPage, lastPage, hasMorePages, total, count }`
 *    - Page size: up to 48 (or 60) items per page.
 *    - Fields retrieved:
 *        - `id`: Announcement ID
 *        - `title`: Announcement title
 *        - `price` / `pricePreview`: Price in Algerian Dinars (DZD)
 *        - `slug`: URL slug -> `https://www.ouedkniss.com/${slug}-d${id}`
 *        - `cities.region.name`: Wilaya (province in Algeria)
 *        - `cities.name`: City / commune
 *        - `store.name` / `user.username`: Store / seller name
 *        - `refreshedAt`: ISO 8601 publication / refresh timestamp
 *        - `description`: Listing description (used to extract condition e.g. "10/10", "Neuf", etc.)
 *        - `defaultMedia.mediaUrl`: Image URL
 * ============================================================================
 */

export type OuedknissOffer = RawOffer & {
  id?: string;
  wilaya?: string;
  seller?: string;
  postedAt?: string;
  condition?: string;
};

const GRAPHQL_ENDPOINT = "https://api.ouedkniss.com/graphql";

const SEARCH_QUERY = `
  query SearchQuery($q: String, $filter: SearchFilterInput) {
    search(q: $q, filter: $filter) {
      announcements {
        paginatorInfo {
          lastPage
          hasMorePages
          total
          count
          currentPage
        }
        data {
          id
          title
          slug
          refreshedAt: createdAt
          isFromStore
          price
          pricePreview
          description
          status
          cities {
            id
            name
            slug
            region {
              id
              name
              slug
            }
          }
          store {
            id
            name
            slug
            imageUrl
          }
          user {
            id
            username
          }
          defaultMedia(size: MEDIUM) {
            mediaUrl
            thumbnail
          }
        }
      }
    }
  }
`;

interface GraphQLAnnouncementItem {
  id: string;
  title: string;
  slug?: string;
  refreshedAt?: string;
  isFromStore?: boolean;
  price?: number | null;
  pricePreview?: number | null;
  description?: string | null;
  status?: string;
  cities?: Array<{
    id?: string;
    name?: string;
    slug?: string;
    region?: {
      id?: string;
      name?: string;
      slug?: string;
    };
  }>;
  store?: {
    id?: string;
    name?: string;
    slug?: string;
    imageUrl?: string;
  } | null;
  user?: {
    id?: string;
    username?: string;
  } | null;
  defaultMedia?: {
    mediaUrl?: string;
    thumbnail?: string | null;
  } | null;
}

interface GraphQLSearchResponse {
  data?: {
    search?: {
      announcements?: {
        paginatorInfo?: {
          lastPage?: number;
          hasMorePages?: boolean;
          total?: number;
          count?: number;
          currentPage?: number;
        };
        data?: GraphQLAnnouncementItem[];
      };
    };
  };
  errors?: Array<{ message: string }>;
}

/**
 * Extract condition from item description or title.
 */
function extractCondition(desc?: string | null, title?: string): string | undefined {
  const text = `${desc || ""} ${title || ""}`;
  if (!text.trim()) return undefined;

  // Match common Algerian French/Arabic condition patterns
  const m = text.match(/(?:[eé]tat|condition|حالة)\s*[:：\-]?\s*([^\n\r,.<]{2,25})/i);
  if (m && m[1]) {
    const cond = m[1].trim();
    if (cond.length >= 2 && cond.length <= 25) return cond;
  }

  if (/\b(?:neuf\s+sous\s+emballage|neuf\s+jamais\s+utilis[eé]|sous\s+blister)\b/i.test(text)) {
    return "Neuf sous emballage";
  }
  if (/\b(?:comme\s+neuf|tr[eè]s\s+bon\s+[eé]tat|10\/10)\b/i.test(text)) {
    return "Très bon état (10/10)";
  }
  if (/\b(?:neuf|جديد)\b/i.test(text)) {
    return "Neuf";
  }
  if (/\b(?:occasion|مستعمل)\b/i.test(text)) {
    return "Occasion";
  }

  return undefined;
}

/**
 * Deep search on Ouedkniss via internal GraphQL endpoint across multiple pages.
 * Keep polite (1200ms+ between page requests, browser UA from base.ts).
 */
export async function searchOuedknissFull(
  keywords: string,
  maxPages: number = 3
): Promise<OuedknissOffer[]> {
  const out: OuedknissOffer[] = [];
  const seenIds = new Set<string>();

  for (let page = 1; page <= maxPages; page++) {
    if (page > 1) {
      await delay(1300);
    }

    const res = await fetch(GRAPHQL_ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "User-Agent": REAL_UA,
        "Origin": "https://www.ouedkniss.com",
        "Referer": "https://www.ouedkniss.com/",
        "Accept-Language": "fr-DZ,fr;q=0.9",
      },
      body: JSON.stringify({
        query: SEARCH_QUERY,
        variables: {
          q: keywords,
          filter: {
            page,
            count: 48,
          },
        },
      }),
    });

    if (!res.ok) {
      throw new Error(`Ouedkniss GraphQL HTTP ${res.status}`);
    }

    const json = (await res.json()) as GraphQLSearchResponse;
    if (json.errors && json.errors.length > 0) {
      throw new Error(`Ouedkniss GraphQL Error: ${json.errors[0].message}`);
    }

    const announcements = json.data?.search?.announcements;
    const items = announcements?.data || [];
    if (items.length === 0) break;

    for (const item of items) {
      if (!item || !item.id || seenIds.has(item.id)) continue;
      seenIds.add(item.id);

      const price = item.price ?? item.pricePreview ?? null;
      if (price === null || price < 500 || price > 5_000_000) continue;

      const title = (item.title || "").replace(/\s+/g, " ").trim();
      if (!title) continue;

      const slug = item.slug || "annonce";
      const url = `https://www.ouedkniss.com/${slug}-d${item.id}`;

      // Wilaya from region name or city name
      const primaryCity = item.cities?.[0];
      const wilaya = primaryCity?.region?.name || primaryCity?.name || undefined;

      // Seller / store name
      const seller = item.store?.name?.trim() || item.user?.username?.trim() || undefined;

      // Relative or ISO date
      const postedAt = item.refreshedAt || undefined;

      // Condition
      const condition = extractCondition(item.description, item.title);

      // Image
      const image = item.defaultMedia?.mediaUrl || "";

      out.push({
        id: item.id,
        title,
        priceDa: price,
        url,
        stock: "Ouedkniss",
        image,
        wilaya,
        seller,
        postedAt,
        condition,
      });
    }

    const paginator = announcements?.paginatorInfo;
    if (paginator) {
      if (paginator.hasMorePages === false) break;
      if (paginator.lastPage && page >= paginator.lastPage) break;
    }
  }

  return out;
}
