import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/data/guides";
import { CATEGORIES } from "@/lib/data/products";
import { getProducts } from "@/lib/data/catalog";
import { absoluteUrl, localizedPath } from "@/lib/i18n/config";

/**
 * Every French URL now ships the full hreflang set, so each page is
 * reciprocally paired with its English mirror:
 *   fr-DZ     -> /fr/... URL (this one)
 *   en-DZ     -> unprefixed English URL
 *   x-default -> the unprefixed English URL (the site default)
 *
 * The English URLs are listed in app/sitemap.ts (/sitemap.xml).
 */
function entry(frPath: string, priority: number, changeFrequency: "daily" | "weekly" = "daily") {
  const fr = absoluteUrl(localizedPath(frPath, "fr"));
  const en = absoluteUrl(localizedPath(frPath, "en"));
  return {
    url: fr,
    lastModified: new Date(),
    changeFrequency,
    priority,
    alternates: {
      languages: {
        "fr-DZ": fr,
        "en-DZ": en,
        "x-default": fr,
      },
    },
  };
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const prods = await getProducts();
  const staticRoutes = ["", "/builder", "/prebuilds", "/guides", "/deals"].map((r) =>
    entry(r, r === "" ? 1 : r === "/prebuilds" ? 0.9 : 0.8),
  );
  const cats = CATEGORIES.map((c) => entry(`/category/${c.slug}`, 0.9));
  const products = prods.map((p) => entry(`/product/${p.id}`, 0.9));
  const guides = GUIDES.map((g) => entry(`/guides/${g.slug}`, 0.7, "weekly"));
  return [...staticRoutes, ...cats, ...products, ...guides];
}
