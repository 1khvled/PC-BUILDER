// Hunts real store photos for products with missing/bad images.
// Usage: node photo-backfill.cjs  -> writes photo-backfill.json (review, then merge into live-images-src.json)
const cheerio = require("cheerio");
const UA = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) DZPartPicker-bot/0.1";
const delay = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, " ").trim();

const TARGETS = [
  { id: "gpu-rtx4070-12gb", q: ["RTX 4070"], need: ["4070"], ban: ["laptop", " notebook", " ti ", "super"] },
  { id: "psu-mwe650-b", q: ["MWE 650", "650W bronze"], need: ["650"], ban: ["750", "850", "1000", "550", "450", "cable"] },
  { id: "mobo-b660m-e", q: ["B660M"], need: ["b660"], ban: ["b660m-k", "laptop"] },
  { id: "cpu-r5-7600x", q: ["7600X"], need: ["7600x"], ban: [] },
  { id: "ssd-970evo-1tb", q: ["970 EVO"], need: ["970"], ban: ["980", "990", "870"] },
  { id: "gpu-rx580-8gb", q: ["RX 580"], need: ["rx 580"], ban: ["laptop", "550", "560", "570"] },
];

function match(t, need, ban) {
  const n = " " + norm(t) + " ";
  if (!need.every((k) => n.includes(k))) return false;
  if (ban.some((k) => n.includes(k.trim()))) return false;
  return true;
}
function imgOf($, el, base) {
  let src = "";
  $(el).find("img").each((_, img) => {
    if (src) return;
    const im = $(img);
    src = im.attr("data-src") || im.attr("data-lazy-src") || im.attr("src") || "";
    if (src.startsWith("data:")) src = "";
  });
  try { return src ? new URL(src, base).toString() : ""; } catch { return ""; }
}
async function nestSearch(base, q) {
  const out = [];
  const r = await fetch(`${base}/search?search_term=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA } });
  if (!r.ok) return out;
  const $ = cheerio.load(await r.text());
  $(".product-cart-wrap").each((_, el) => {
    const a = $(el).find("h2 a").first();
    out.push({ title: a.text().replace(/\s+/g, " ").trim(), url: a.attr("href") || "", image: imgOf($, el, base) });
  });
  return out;
}
async function wooSearch(base, q, itemSel) {
  const out = [];
  const r = await fetch(`${base}/?s=${encodeURIComponent(q)}`, { headers: { "User-Agent": UA } });
  if (!r.ok) return out;
  const $ = cheerio.load(await r.text());
  const items = $(itemSel);
  const use = items.length ? items : $(".product");
  use.each((_, el) => {
    const e = $(el);
    const title = e.find("h2, h3, .product-title").first().text().trim();
    let href = "";
    e.find("a[href]").each((_, a) => {
      const h = $(a).attr("href") || "";
      if (!href && h.startsWith(base) && h.length > base.length + 4) href = h;
    });
    out.push({ title, url: href, image: imgOf($, el, base) });
  });
  return out;
}
async function lahlouSuggest(q) {
  const out = [];
  const r = await fetch(`https://lahlou-industrie.com/search/suggest.json?q=${encodeURIComponent(q)}&resources[type]=product&resources[limit]=10`, { headers: { "User-Agent": UA } });
  if (!r.ok) return out;
  const j = await r.json();
  for (const p of j.resources?.results?.products || []) {
    out.push({ title: p.title || "", url: `https://lahlou-industrie.com${p.url || ""}`, image: p.image || "" });
  }
  return out;
}

async function main() {
  const found = {};
  for (const t of TARGETS) {
    console.log("HUNT", t.id);
    const cands = [];
    for (const q of t.q) {
      await delay(900);
      cands.push(...(await nestSearch("https://mail.licbplus.com", q)).map((c) => ({ ...c, src: "LICB+" })));
      await delay(900);
      cands.push(...(await nestSearch("https://gamingdz.com", q)).map((c) => ({ ...c, src: "GamingDZ" })));
      await delay(900);
      cands.push(...(await wooSearch("https://click-dz.com", q)).map((c) => ({ ...c, src: "ClickDZ" })));
      await delay(900);
      cands.push(...(await wooSearch("https://khabirtech.com", q, ".product-grid-item")).map((c) => ({ ...c, src: "KhabirTech" })));
      await delay(900);
      cands.push(...(await lahlouSuggest(q)).map((c) => ({ ...c, src: "Lahlou" })));
    }
    const hit = cands.find((c) => c.image && match(c.title, t.need, t.ban));
    if (hit) {
      console.log("  HIT", hit.src, "|", hit.title.slice(0, 60));
      found[t.id] = { title: hit.title.slice(0, 120), page: hit.url, image: hit.image };
    } else {
      console.log("  miss. samples:", cands.slice(0, 3).map((c) => c.title.slice(0, 45)).join(" // "));
    }
  }
  require("fs").writeFileSync("photo-backfill.json", JSON.stringify(found, null, 1));
  console.log("wrote photo-backfill.json:", Object.keys(found).length + "/" + TARGETS.length);
}
main();
