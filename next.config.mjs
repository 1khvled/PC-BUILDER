/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    // English used to live under /en/... before it became the site default.
    // Those URLs are now permanently redirected to their unprefixed equivalents
    // so that: existing links keep working, the two versions never compete in
    // the index, and all link equity lands on the canonical English URL.
    //
    // 308 (permanent) is deliberate over 301: it preserves the method and, more
    // importantly, tells crawlers the move is final and caches it aggressively.
    return [
      // The console moved to an unguessable path. Both /admin and /admin-kh7 were
  // real routes, and /admin-kh7 is in this repo's git history, so they are now
  // permanent redirects to the new location rather than live entry points.
  // Permanent because the old routes are gone for good and a 308 caches.
  { source: "/admin", destination: "/ops-4fkq", permanent: true },
  { source: "/fr/admin", destination: "/ops-4fkq/login", permanent: true },
  { source: "/admin-kh7", destination: "/ops-4fkq", permanent: true },
  { source: "/admin-kh7/login", destination: "/ops-4fkq/login", permanent: true },
      // The slug used to promise a 300k build while the parts totalled over 400k. A
      // numeric claim in the URL is a factual claim to a search engine, so the slug
      // was renamed and the old address permanently redirected.
      { source: "/guides/gaming-1440p-300k", destination: "/guides/gaming-1440p-165hz", permanent: true },
      { source: "/fr/guides/gaming-1440p-300k", destination: "/fr/guides/gaming-1440p-165hz", permanent: true },
      // Same story: the slug promised a 170k build while live prices total 231k.
      { source: "/guides/config-pc-170k-da", destination: "/guides/config-pc-230k-da", permanent: true },
      { source: "/fr/guides/config-pc-170k-da", destination: "/fr/guides/config-pc-230k-da", permanent: true },
      { source: "/en", destination: "/", permanent: true },
      { source: "/en/builder", destination: "/builder", permanent: true },
      { source: "/en/category/:slug", destination: "/category/:slug", permanent: true },
      { source: "/en/deals", destination: "/deals", permanent: true },
      { source: "/en/guides", destination: "/guides", permanent: true },
      { source: "/en/guides/:slug", destination: "/guides/:slug", permanent: true },
      { source: "/en/prebuilds", destination: "/prebuilds", permanent: true },
      { source: "/en/product/:id", destination: "/product/:id", permanent: true },
      { source: "/en/llms.txt", destination: "/llms.txt", permanent: true },
      { source: "/en/llms-full.txt", destination: "/llms-full.txt", permanent: true },
      { source: "/en/sitemap.xml", destination: "/sitemap.xml", permanent: true },
      // Anything else that used to resolve under /en (and has no English twin)
      // goes to the English home rather than a 404.
      { source: "/en/:path*", destination: "/", permanent: true },
    ];
  },
};
export default nextConfig;