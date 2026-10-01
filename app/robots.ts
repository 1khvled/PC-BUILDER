import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
          // The French half of the site (/fr/...) is fully public and indexable.
        // The console. It is already unguessable, unauthenticated requests
        // redirect to its login, and every page carries noindex. The disallow is
        // belt and braces against the path ever surfacing in a search result.
        disallow: ["/ops-4fkq", "/admin-kh7", "/admin", "/api/"],
      },
      // AI engines explicitly welcome (GEO)
      { userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended"], allow: ["/", "/fr", "/llms.txt", "/llms-full.txt", "/fr/llms.txt", "/fr/llms-full.txt"] },
    ],
    // Both locales are advertised so crawlers discover the whole bilingual set.
      sitemap: [`${BASE}/sitemap.xml`, `${BASE}/fr/sitemap.xml`],
  };
}
