import type { MetadataRoute } from "next";
import { listGuides } from "@/lib/data/guides-en";
import { CATEGORIES } from "@/lib/data/products";
import { getProducts } from "@/lib/data/catalog";
import { absoluteUrl, localizedPath } from "@/lib/i18n/config";

/**
 * English sitemap, served at /sitemap.xml.
 *
 * Lists only English URLs, each one carrying the full hreflang set
 * (en-DZ unprefixed, fr-DZ prefixed under /fr, x-default -> English) so crawlers can pair
 * the two versions of every page. The French sitemap (/fr/sitemap.xml) carries the
 * same alternates on the French URLs.
 */
const STATIC_ROUTES = ["", "/builder", "/prebuilds", "/guides", "/deals", "/drops"];

function withAlternates(path: string, priority: number, changeFrequency: "daily" | "weekly" = "daily") {
  const fr = absoluteUrl(localizedPath(path, "fr"));
  const en = absoluteUrl(localizedPath(path, "en"));
  return {
    url: en,
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

export default async function englishSitemap(): Promise<MetadataRoute.Sitemap> {
  const prods = await getProducts();

  const staticRoutes = STATIC_ROUTES.map((r) =>
    withAlternates(r, r === "" ? 1 : r === "/prebuilds" ? 0.9 : 0.8),
  );
  const cats = CATEGORIES.map((c) => withAlternates(`/category/${c.slug}`, 0.9));
  const products = prods.map((p) => withAlternates(`/product/${p.id}`, 0.9));
  const guides = listGuides("en").map((g) => withAlternates(`/guides/${g.slug}`, 0.7, "weekly"));

  return [...staticRoutes, ...cats, ...products, ...guides];
}
