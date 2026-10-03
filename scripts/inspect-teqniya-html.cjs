const cheerio = require('cheerio');

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

async function inspect(url) {
  console.log(`\n=== Inspecting ${url} ===`);
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  const html = await res.text();
  const $ = cheerio.load(html);
  
  // Find all links to products or categories
  const links = new Set();
  $('a[href]').each((_, a) => {
    const h = $(a).attr('href');
    if (h) links.add(h);
  });
  console.log(`Total links on homepage: ${links.size}`);
  const prodLinks = Array.from(links).filter(h => /produit|product|item|collections|category|categorie|cpu|processeur/i.test(h));
  console.log(`Product/Category links (${prodLinks.length}):`);
  for (const l of prodLinks.slice(0, 20)) {
    console.log(`  - ${l}`);
  }

  // Check sitemap
  try {
    const smRes = await fetch(`${url}/sitemap.xml`, { headers: { "User-Agent": UA } });
    if (smRes.ok) {
      const smText = await smRes.text();
      const $sm = cheerio.load(smText, { xmlMode: true });
      const locs = [];
      $sm('loc').each((_, el) => locs.push($sm(el).text()));
      console.log(`Sitemap loc count: ${locs.length}`);
      for (const loc of locs.slice(0, 15)) {
        console.log(`  sm loc: ${loc}`);
      }
    } else {
      console.log(`Sitemap HTTP: ${smRes.status}`);
    }
  } catch (e) {
    console.log(`Sitemap error: ${e.message}`);
  }
}

async function main() {
  await inspect("https://www.teqniyastore.shop");
  await inspect("https://bytekstore.shop");
}

main();
