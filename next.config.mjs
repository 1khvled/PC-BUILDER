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
