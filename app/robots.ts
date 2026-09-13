import type { MetadataRoute } from "next";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/admin-kh7", "/api/"] },
      // AI engines explicitly welcome (GEO)
      { userAgent: ["GPTBot", "ChatGPT-User", "ClaudeBot", "anthropic-ai", "PerplexityBot", "Google-Extended"], allow: ["/", "/llms.txt", "/llms-full.txt"] },
    ],
    sitemap: `${BASE}/sitemap.xml`,
  };
}
