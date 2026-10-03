const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

const STORES = [
  { name: "Promotech IT", base: "https://promotech-it.com", wilaya: "Alger" },
  { name: "Ozinformatique", base: "https://ozinformatique.com", wilaya: "Alger" },
  { name: "AMI Informatique", base: "https://ami-dz.com", wilaya: "Alger" },
  { name: "KOTEK", base: "https://kotekdz.com", wilaya: "Alger" },
  { name: "Click DZ", base: "https://click-dz.com", wilaya: "Alger" },
  { name: "Campus Informatique", base: "https://campusinformatique.com", wilaya: "Alger" },
  { name: "KhabirTech", base: "https://khabirtech.com", wilaya: "M'sila" },
  { name: "Informatics", base: "https://informatics-dz.com", wilaya: "Boumerdes" },
  { name: "DeskCom", base: "https://deskcom-dz.com", wilaya: "Oran" },
];

async function probeStore(s) {
  console.log(`\n=== Testing ${s.name} (${s.base}) ===`);
  try {
    // 1. Fetch categories
    const catRes = await fetch(`${s.base}/wp-json/wc/store/v1/products/categories?per_page=100`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(10000)
    });
    if (catRes.ok) {
      const cats = await catRes.json();
      if (Array.isArray(cats)) {
        console.log(`  Found ${cats.length} categories.`);
        const relevant = cats.filter(c => /cpu|processeur|graphique|gpu|carte.?m|ram|m[eé]moire|ssd|stockage|aliment|psu|boitier|case|refroid|cooler|ventirad|water|ecran|moniteur/i.test(c.name));
        console.log(`  Relevant hardware categories (${relevant.length}):`);
        for (const r of relevant) {
          console.log(`    - [${r.id}] ${r.name} (${r.count} items, slug: ${r.slug})`);
        }
      }
    } else {
      console.log(`  Categories endpoint failed with status: ${catRes.status}`);
    }

    // 2. Fetch page 1 of products
    const prodRes = await fetch(`${s.base}/wp-json/wc/store/v1/products?per_page=10`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(10000)
    });
    if (prodRes.ok) {
      const totalHeader = prodRes.headers.get("x-wp-total");
      const totalPagesHeader = prodRes.headers.get("x-wp-totalpages");
      console.log(`  Products total: ${totalHeader || "N/A"}, total pages: ${totalPagesHeader || "N/A"}`);
    }
  } catch (err) {
    console.error(`  Error probing ${s.name}:`, err.message);
  }
}

async function main() {
  for (const s of STORES) {
    await probeStore(s);
  }
}

main();
