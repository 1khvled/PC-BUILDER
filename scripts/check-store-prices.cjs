const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36";

async function checkStore(name, base) {
  try {
    const res = await fetch(`${base}/wp-json/wc/store/v1/products?per_page=3`, {
      headers: { "User-Agent": UA },
      signal: AbortSignal.timeout(8000)
    });
    const items = await res.json();
    console.log(`\n=== ${name} (${base}) ===`);
    for (const it of items) {
      console.log(`  Name: ${it.name}`);
      console.log(`  Price raw: ${it.prices?.price}, minor_unit: ${it.prices?.currency_minor_unit}`);
    }
  } catch (err) {
    console.log(`Error checking ${name}: ${err.message}`);
  }
}

async function main() {
  await checkStore("Promotech IT", "https://promotech-it.com");
  await checkStore("AMI Informatique", "https://ami-dz.com");
  await checkStore("Ozinformatique", "https://ozinformatique.com");
  await checkStore("Click-DZ", "https://click-dz.com");
  await checkStore("Campus Informatique", "https://campusinformatique.com");
  await checkStore("Informatics", "https://informatics-dz.com");
  await checkStore("KhabirTech", "https://khabirtech.com");
  await checkStore("DeskCom", "https://deskcom-dz.com");
  await checkStore("GigaStore", "https://gigastore-dz.com");
}

main();
