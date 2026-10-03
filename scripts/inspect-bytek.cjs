const cheerio = require('cheerio');

const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

async function main() {
  const url = 'https://www.bytekstore.shop/products';
  console.log(`Fetching ${url}...`);
  const res = await fetch(url, { headers: { 'User-Agent': UA } });
  const html = await res.text();
  console.log(`Status: ${res.status}, Length: ${html.length}`);
  const $ = cheerio.load(html);

  // Look for product cards, titles, prices, links
  console.log('Page Title:', $('title').text());

  const items = [];
  $('a[href*="/product/"], a[href*="/p/"], .product-card, [data-product-id]').each((_, el) => {
    const text = $(el).text().replace(/\s+/g, ' ').trim();
    const href = $(el).attr('href') || $(el).find('a').attr('href');
    if (text && href) items.push({ text: text.slice(0, 80), href });
  });

  console.log(`Found ${items.length} items on /products:`);
  for (const it of items.slice(0, 15)) {
    console.log(`  - [${it.href}] ${it.text}`);
  }

  // Check script tags for data
  $('script').each((_, s) => {
    const src = $(s).attr('src');
    const content = $(s).html() || '';
    if (src) console.log(`  script src: ${src}`);
    if (content.includes('products') || content.includes('price')) {
      console.log(`  script content snippet: ${content.slice(0, 200)}`);
    }
  });
}

main();
