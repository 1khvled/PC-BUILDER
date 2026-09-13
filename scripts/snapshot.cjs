// Appends today's offer snapshot to data/price-history.json (price charts).
// Usage: node scripts/snapshot.cjs  (reads lib/data/live.ts + products.ts seed offers)
const fs = require("fs");

function parseObjLine(line) {
  const json = line.trim().replace(/,$/, "").replace(/([{,]\s*)([A-Za-z_][A-Za-z0-9_]*)\s*:/g, '$1"$2":');
  return JSON.parse(json);
}

function main() {
  const day = new Date().toISOString().slice(0, 10);
  const live = fs.readFileSync("lib/data/live.ts", "utf8");
  const liveBlock = live.split("LIVE_OFFERS: Offer[] = [")[1].split("];")[0];
  const rows = liveBlock.split("\n").map((l) => l.trim()).filter((l) => l.startsWith("{")).map(parseObjLine);

  let hist = [];
  try {
    hist = JSON.parse(fs.readFileSync("data/price-history.json", "utf8"));
  } catch {
    hist = [];
  }
  const have = new Set(hist.map((h) => h.p + "|" + h.s + "|" + h.d));
  let added = 0;
  for (const o of rows) {
    const k = o.productId + "|" + o.store + "|" + day;
    if (have.has(k)) continue;
    have.add(k);
    hist.push({ d: day, p: o.productId, s: o.store, pr: o.priceDa });
    added++;
  }
  // 400-day retention (Supabase rule mirrored locally)
  const cutoff = new Date(Date.now() - 400 * 864e5).toISOString().slice(0, 10);
  hist = hist.filter((h) => h.d >= cutoff);
  fs.mkdirSync("lib/data", { recursive: true });
  fs.writeFileSync("lib/data/price-history.json", JSON.stringify(hist));
  console.log(`snapshot ${day}: +${added} points, total ${hist.length}, file ${Math.round(Buffer.byteLength(JSON.stringify(hist)) / 1024)}KB`);
}
main();
