import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
          // The French half of the site (/fr/...) is fully public and indexable.
        // The console path. Unguessable, login-gated, noindex throughout; the
        // disallow is belt and braces against it ever surfacing in search.
        // (Old /admin and /admin-kh7 paths are deleted, not redirected, so
        // they need no entry: nothing serves there at all.)
        disallow: ["/ops-4fkq", "/api/"],
      },
      // AI engines explicitly welcome (GEO)
      { userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended"], allow: ["/", "/fr", "/llms.txt", "/llms-full.txt", "/fr/llms.txt", "/fr/llms-full.txt"] },
    ],
    // Both locales are advertised so crawlers discover the whole bilingual set.
      sitemap: [`${BASE}/sitemap.xml`, `${BASE}/fr/sitemap.xml`],
  };
}
