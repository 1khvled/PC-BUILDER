import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/data/guides";
import { CATEGORIES } from "@/lib/data/products";
import { getProducts } from "@/lib/data/catalog";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://dzpartpicker.dz";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const prods = await getProducts();
  const staticRoutes = ["", "/builder", "/guides", "/deals"].map((r) => ({
    url: `${BASE}${r || "/"}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: r === "" ? 1 : 0.8,
  }));
  const cats = CATEGORIES.map((c) => ({
    url: `${BASE}/category/${c.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));
  const products = prods.map((p) => ({
    url: `${BASE}/product/${p.id}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.9,
  }));
  const guides = GUIDES.map((g) => ({
    url: `${BASE}/guides/${g.slug}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));
  return [...staticRoutes, ...cats, ...products, ...guides];
}
