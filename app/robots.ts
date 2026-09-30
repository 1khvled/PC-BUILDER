import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
          // The French half of the site (/fr/...) is fully public and indexable.
        disallow: ["/admin-kh7", "/api/"],
      },
      // AI engines explicitly welcome (GEO)
      { userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended"], allow: ["/", "/fr", "/llms.txt", "/llms-full.txt", "/fr/llms.txt", "/fr/llms-full.txt"] },
    ],
    // Both locales are advertised so crawlers discover the whole bilingual set.
      sitemap: [`${BASE}/sitemap.xml`, `${BASE}/fr/sitemap.xml`],
  };
}
