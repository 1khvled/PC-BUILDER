// Bakes full.json (live scrape) into lib/data/live.ts
// Usage: node bake.mjs  (reads full.json, writes lib/data/live.ts)
const fs = require("fs");

const full = JSON.parse(fs.readFileSync("full.json", "utf8"));
const report = full.report;

const WILAYA = { "LICB+": "Alger", "Click-DZ": "Alger", Digitec: "Alger", WifiDjelfa: "Djelfa", KOTEK: "Alger", GamingDZ: "Sétif", GigaStore: "Oran", Informatics: "Boumerdes", Lahlou: "Alger", HardSoft: "Oran", Campus: "Alger", KhabirTech: "M'sila", DeskCom: "Oran", NextGen: "Sétif" };
const NOW = new Date().toISOString();

// seed pairs win over live dupes (read from products.ts)
const src = fs.readFileSync("lib/data/products.ts", "utf8");
const seedPairs = new Set();
for (const m of src.matchAll(/productId:\s*"([^"]+)",\s*store:\s*"([^"]+)"/g)) {
  seedPairs.add(m[1] + "|" + m[2]);
}

function norm(s) {
  return (s || "")
    .toLowerCase()
    .replace(/((?:[248]|0[48]|1[26]|2[24]|3[26]|4[28]|6[24]))g\b/g, "$1gb") // 8g/08g/16g/32g -> gb (not 5600g!)
    .replace(/(\d+)\s?go\b/g, "$1gb") // 08go/240go/500go -> gb
    .replace(/(\d)\s?to\b/g, "$1tb")
    .replace(/\b(\d{1,2})t\b/g, "$1tb") // 1T/2T/4T (FR shorthand) -> tb (1-2 digits only: 7200T/MIN RPM specs must not become 7200tb)
    .replace(/m\.2/g, "m2") // m.2 -> m2 (word-matchable)
    .replace(/(^|[^a-z0-9])([a-z]{0,3})(400|450|500|550|600|650|700|750|800|850|1000|1200|1250|1300)(p|m|b|d|n|x|s|bn|gs|gl|gm|plus)?\b/g, "$1$2$3w") // CX750/PN1000M/PL800/A750BN/GP650 -> 750w (digit-prefixed 1650/5600x safe)
    .replace(/\b0+(\d)/g, "$1") // 08gb/0240go -> 8gb/240go
    .replace(/\bdr4\b/g, "ddr4").replace(/\bd4\b/g, "ddr4").replace(/\bd5\b/g, "ddr5")
    .normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, " ").trim();
}
function clean(s) {
  return (s || "")
    .replace(/�/g, "")
    .replace(/^\d(?=[A-HJ-Z][A-Z])/, "")
    .replace(/\s+/g, " ").trim();
}

// { id, cat, all[], any[], none[] } — match only within same category
const RULES = [
  { id: "cpu-r5-5600", cat: "cpu", all: ["ryzen", "5600"], none: ["5600g", "5600gt", "5600x", "5600f", "5600h", "5600u", "laptop", "notebook"] },
  { id: "cpu-i5-12400f", cat: "cpu", all: ["12400"], none: ["laptop", "notebook", "12400h", "12400u"] },
  { id: "cpu-r5-7600x", cat: "cpu", all: ["7600x"] },
  { id: "cpu-r5-9600x", cat: "cpu", all: ["9600x"] },
  { id: "cpu-r7-9800x3d", cat: "cpu", all: ["9800x3d"] },
  { id: "cpu-r7-7800x3d", cat: "cpu", all: ["7800x3d"] },
  { id: "cpu-i5-14400f", cat: "cpu", all: ["14400"], none: ["laptop", "notebook", "14400h", "14400u"] },
  { id: "cpu-r5-5600x", cat: "cpu", all: ["5600x"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-5700x", cat: "cpu", all: ["5700x"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-5800x", cat: "cpu", all: ["5800x"], none: ["5800x3d", "laptop", "notebook"] },
  { id: "cpu-r9-5900x", cat: "cpu", all: ["5900x"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-7600", cat: "cpu", all: ["7600"], none: ["7600x", "laptop", "notebook"] },
  { id: "cpu-r7-7700x", cat: "cpu", all: ["7700x"], none: ["laptop", "notebook"] },
  { id: "cpu-r9-7900x", cat: "cpu", all: ["7900x"], none: ["laptop", "notebook"] },
  { id: "cpu-r9-7950x", cat: "cpu", all: ["7950x"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-8600g", cat: "cpu", all: ["8600g"], none: ["laptop", "notebook"] },
  { id: "cpu-i3-12100f", cat: "cpu", all: ["12100"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-10400f", cat: "cpu", all: ["10400"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-13400f", cat: "cpu", all: ["13400"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-13600kf", cat: "cpu", all: ["13600k"], none: ["laptop", "notebook"] },
  { id: "cpu-i7-13700k", cat: "cpu", all: ["13700k"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-14600kf", cat: "cpu", all: ["14600k"], none: ["laptop", "notebook"] },
  { id: "cpu-i7-14700kf", cat: "cpu", all: ["14700k"], none: ["laptop", "notebook"] },
  { id: "cpu-i9-14900k", cat: "cpu", all: ["14900k"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-5600gt", cat: "cpu", all: ["5600gt"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-5700g", cat: "cpu", all: ["5700g"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-5700", cat: "cpu", all: ["5700"], none: ["5700x", "5700g", "laptop", "notebook"] },
  { id: "cpu-r7-7700", cat: "cpu", all: ["7700"], none: ["7700x", "laptop", "notebook"] },
  { id: "cpu-r5-9600", cat: "cpu", all: ["9600"], none: ["9600x", "laptop", "notebook"] },
  { id: "cpu-r5-8500g", cat: "cpu", all: ["8500g"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-8400f", cat: "cpu", all: ["8400"], none: ["laptop", "notebook"] },
  { id: "cpu-r9-9900x", cat: "cpu", all: ["9900x"], none: ["9900x3d", "laptop", "notebook"] },
  { id: "cpu-r5-7500f", cat: "cpu", all: ["7500f"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-9700x", cat: "cpu", all: ["9700x"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-8700g", cat: "cpu", all: ["8700g"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-8700f", cat: "cpu", all: ["8700f"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-5600g", cat: "cpu", all: ["5600g"], none: ["5600gt", "laptop", "notebook"] },
  { id: "cpu-r9-9950x3d", cat: "cpu", all: ["9950x3d"], none: ["laptop", "notebook"] },
  { id: "cpu-r9-9950x", cat: "cpu", all: ["9950x"], none: ["9950x3d", "laptop", "notebook"] },
  { id: "cpu-r7-9850x3d", cat: "cpu", all: ["9850x3d"], none: ["laptop", "notebook"] },
  { id: "cpu-r9-9900x3d", cat: "cpu", all: ["9900x3d"], none: ["laptop", "notebook"] },
  { id: "cpu-r3-3200g", cat: "cpu", all: ["3200g"], none: ["laptop", "notebook"] },
  { id: "cpu-r3-4100", cat: "cpu", all: ["4100"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-3400g", cat: "cpu", all: ["3400g"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-3500x", cat: "cpu", all: ["3500x"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-3700x", cat: "cpu", all: ["3700x"], none: ["laptop", "notebook"] },
  { id: "cpu-r9-5950x", cat: "cpu", all: ["5950x"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-12600k", cat: "cpu", all: ["12600k"], none: ["laptop", "notebook"] },
  { id: "cpu-i7-13700f", cat: "cpu", all: ["13700f"], none: ["laptop", "notebook"] },
  { id: "cpu-i7-10700f", cat: "cpu", all: ["10700f"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-10600kf", cat: "cpu", all: ["10600k"], none: ["laptop", "notebook"] },
  { id: "cpu-u5-225f", cat: "cpu", all: ["225f"], none: ["laptop", "notebook"] },
  { id: "cpu-u9-285k", cat: "cpu", all: ["285k"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-5650g", cat: "cpu", all: ["5650g"] },
  { id: "cpu-r5-5650g", cat: "cpu", all: ["5655g"] },
  { id: "cpu-r5-7500x3d", cat: "cpu", all: ["7500x3d"], none: ["laptop", "notebook"] },
  { id: "cpu-r9-7900", cat: "cpu", all: ["7900"], none: ["7900x", "laptop", "notebook"] },
  { id: "cpu-i9-13900k", cat: "cpu", all: ["13900k"], none: ["laptop", "notebook"] },
  { id: "cpu-i9-12900k", cat: "cpu", all: ["12900k"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-11400f", cat: "cpu", all: ["11400"], none: ["laptop", "notebook"] },
  { id: "cpu-i3-10100f", cat: "cpu", all: ["10100"], none: ["laptop", "notebook"] },
  { id: "cpu-r3-3100", cat: "cpu", all: ["3100"], none: ["laptop", "notebook"] },
  { id: "cpu-r3-4300g", cat: "cpu", all: ["4300g"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-5500gt", cat: "cpu", all: ["5500gt"], none: ["laptop", "notebook"] },
  { id: "cpu-r3-2200g", cat: "cpu", all: ["2200g"], none: ["laptop", "notebook"] },
  { id: "cpu-u7-270k", cat: "cpu", all: ["270k"], none: ["laptop", "notebook"] },
  { id: "cpu-i7-12700k", cat: "cpu", all: ["12700k"], none: ["laptop", "notebook"] },
  { id: "cpu-i9-11900k", cat: "cpu", all: ["11900k"], none: ["laptop", "notebook"] },
  { id: "cpu-i9-10900k", cat: "cpu", all: ["10900k"], none: ["laptop", "notebook"] },
  { id: "cpu-r3-4300g", cat: "cpu", all: ["4350g"], none: ["laptop", "notebook"] },
  { id: "cpu-r5-5650g", cat: "cpu", all: ["4650g"], none: ["laptop", "notebook"] },
  { id: "cpu-i3-13100f", cat: "cpu", all: ["13100"], none: ["laptop", "notebook"] },
  { id: "cpu-i3-14100f", cat: "cpu", all: ["14100"], none: ["laptop", "notebook"] },
  { id: "cpu-u5-245k", cat: "cpu", all: ["245k"], none: ["laptop", "notebook"] },
  { id: "cpu-u5-245k", cat: "cpu", all: ["245f"], none: ["laptop", "notebook"] },
  { id: "cpu-u7-265k", cat: "cpu", all: ["265k"], none: ["laptop", "notebook"] },
  { id: "cpu-u7-265k", cat: "cpu", all: ["265f"], none: ["laptop", "notebook"] },
  { id: "cooler-h212-v3", cat: "cooler", all: ["212"], any: ["hyper", "spectrum"] },
  { id: "cooler-ak400", cat: "cooler", all: ["ak400"] },
  { id: "cooler-ak620", cat: "cooler", all: ["ak620"] },
  { id: "cooler-ma621c", cat: "cooler", all: ["ma621c"] },
  { id: "cooler-ma421a", cat: "cooler", all: ["ma421a"] },
  { id: "cooler-ak700", cat: "cooler", all: ["ak700"] },
  { id: "cooler-ak500-g2", cat: "cooler", all: ["ak500g2"] },
  { id: "cooler-ak500-g2", cat: "cooler", all: ["ak500", "g2"] },
  { id: "cooler-ag400", cat: "cooler", all: ["ag400"] },
  { id: "cooler-le520", cat: "cooler", all: ["le520"] },
  { id: "cooler-le520", cat: "cooler", all: ["le500"] },
  { id: "cooler-lt520", cat: "cooler", all: ["lt520"] },
  { id: "cooler-assassin4", cat: "cooler", all: ["assassin"] },
  { id: "cooler-ml240-core", cat: "cooler", all: ["masterliquid", "240"] },
  { id: "cooler-ml240-core", cat: "cooler", all: ["240l", "core"] },
  { id: "cooler-hyper622", cat: "cooler", all: ["622", "halo"] },
  { id: "cooler-hyper622", cat: "cooler", all: ["hyper", "622"] },
  { id: "cooler-aura-gl240", cat: "cooler", all: ["aura", "gl240"] },
  { id: "cooler-aura-gl240", cat: "cooler", all: ["gl240"] },
  { id: "cooler-boreas-m2", cat: "cooler", all: ["boreas"] },
  { id: "cooler-prime-lc240", cat: "cooler", all: ["prime", "lc240"] },
  { id: "cooler-prime-lc240", cat: "cooler", all: ["lc240"] },
  { id: "cooler-corefrozr", cat: "cooler", all: ["corefrozr"] },
  { id: "cooler-corefrozr", cat: "cooler", all: ["aa13"] },
  { id: "cooler-mag240", cat: "cooler", all: ["mag", "240"] },
  { id: "cooler-wl240ft", cat: "cooler", all: ["wl240ft"] },
  { id: "cooler-hl240", cat: "cooler", all: ["hl240"] },
  { id: "cooler-lt240", cat: "cooler", all: ["lt240"], none: ["360"] },
  { id: "cooler-lt240", cat: "cooler", all: ["ld240"] },
  { id: "cooler-lt240", cat: "cooler", all: ["ls520"] },
  { id: "cooler-lt240", cat: "cooler", all: ["ml240"] },
  { id: "cooler-lt240", cat: "cooler", all: ["coreliquid"] },
  { id: "cooler-lt240", cat: "cooler", all: ["lcii"] },
  { id: "cooler-lt240", cat: "cooler", all: ["f2001"] },
  { id: "cooler-lt240", cat: "cooler", all: ["lm240"] },
  { id: "cooler-lt240", cat: "cooler", all: ["lq240"] },
  { id: "cooler-lt240", cat: "cooler", all: ["mystique"] },
  { id: "cooler-lt240", cat: "cooler", all: ["240mm"] },
  { id: "cooler-lt720", cat: "cooler", all: ["lt720"] },
  { id: "cooler-wl360ft", cat: "cooler", all: ["wl360ft"] },
  { id: "cooler-wl360ft", cat: "cooler", all: ["wl360"] },
  { id: "cooler-f2002-360", cat: "cooler", all: ["f2002"] },
  { id: "cooler-am1204", cat: "cooler", all: ["am1204"] },
  { id: "cooler-lq360", cat: "cooler", all: ["lq360"] },
  { id: "cooler-gl120", cat: "cooler", all: ["gl120"] },
  { id: "cooler-tt120", cat: "cooler", all: ["thermaltake"] },
  { id: "cooler-mars", cat: "cooler", all: ["mars"] },
  { id: "cooler-f2005", cat: "cooler", all: ["f2005"] },
  { id: "cooler-a30", cat: "cooler", all: ["a30"] },
  { id: "cooler-proart360", cat: "cooler", all: ["proart"] },
  { id: "cooler-lt240", cat: "cooler", all: ["ls240"] },
  { id: "cooler-lt240", cat: "cooler", all: ["neptune"] },
  { id: "cooler-lt240", cat: "cooler", all: ["xigmatek", "240"] },
  { id: "cooler-lt240", cat: "cooler", all: ["gigabyte", "gaming", "240"] },
  { id: "cooler-lt360", cat: "cooler", all: ["arctic"] },
  { id: "cooler-lt360", cat: "cooler", all: ["ld360"] },
  { id: "cooler-lt360", cat: "cooler", all: ["waterforce"] },
  { id: "cooler-lt360", cat: "cooler", all: ["xigmatek", "360"] },
  { id: "cooler-lt360", cat: "cooler", all: ["gigabyte", "gaming", "360"] },
  { id: "cooler-mag240", cat: "cooler", all: ["a13", "240"] },
  { id: "cooler-ml360", cat: "cooler", all: ["masterliquid", "360"] },
  { id: "cooler-ml360", cat: "cooler", all: ["360l"] },
  { id: "cooler-ml360", cat: "cooler", all: ["elite", "liquid"] },
  { id: "cooler-kraken", cat: "cooler", all: ["kraken"] },
  { id: "cooler-ocypus", cat: "cooler", all: ["ocypus"] },
  { id: "cooler-lt360", cat: "cooler", all: ["trinity"] },
  { id: "cooler-a30", cat: "cooler", all: ["i70c"] },
  { id: "cooler-a30", cat: "cooler", all: ["air", "killer"] },
  { id: "cooler-lt360", cat: "cooler", all: ["lt360"] },
  { id: "cooler-lt360", cat: "cooler", all: ["ml360"] },
  { id: "cooler-lt360", cat: "cooler", all: ["360mm"] },
  { id: "cooler-ag620", cat: "cooler", all: ["ag620"] },
  { id: "cooler-ak500", cat: "cooler", all: ["ak500"] },
  { id: "cooler-ag200", cat: "cooler", all: ["ag200"] },
  { id: "mobo-b550m-a-pro", cat: "motherboard", all: ["b550"], none: ["laptop", "notebook"] },
  { id: "mobo-b660m-e", cat: "motherboard", all: ["b660"] },
  { id: "mobo-b650m", cat: "motherboard", all: ["b650"], none: ["b650e", "laptop", "notebook"] },
  { id: "mobo-h610m", cat: "motherboard", all: ["h610"], none: ["laptop", "notebook"] },
  { id: "mobo-b760m", cat: "motherboard", all: ["b760"], none: ["laptop", "notebook"] },
  { id: "mobo-z790", cat: "motherboard", all: ["z790"], none: ["laptop", "notebook"] },
  { id: "mobo-b450m", cat: "motherboard", all: ["b450"], none: ["laptop", "notebook"] },
  { id: "mobo-a520m", cat: "motherboard", all: ["a520"], none: ["laptop", "notebook"] },
  { id: "mobo-a620m", cat: "motherboard", all: ["a620"], none: ["laptop", "notebook"] },
  { id: "mobo-b860m", cat: "motherboard", all: ["b860"], none: ["laptop", "notebook"] },
  { id: "mobo-b850m", cat: "motherboard", all: ["b850"], none: ["laptop", "notebook"] },
  { id: "mobo-z890", cat: "motherboard", all: ["z890"], none: ["laptop", "notebook"] },
  { id: "mobo-x870e", cat: "motherboard", all: ["x870e"], none: ["laptop", "notebook"] },
  { id: "mobo-x870", cat: "motherboard", all: ["x870"], none: ["x870e", "laptop", "notebook"] },
  { id: "mobo-x670e", cat: "motherboard", all: ["x670e"], none: ["laptop", "notebook"] },
  { id: "mobo-b840m", cat: "motherboard", all: ["b840"], none: ["laptop", "notebook"] },
  { id: "mobo-b650e", cat: "motherboard", all: ["b650e"], none: ["laptop", "notebook"] },
  { id: "mobo-b460m", cat: "motherboard", all: ["b460"], none: ["laptop", "notebook"] },
  { id: "mobo-z690", cat: "motherboard", all: ["z690"], none: ["laptop", "notebook"] },
  { id: "mobo-x570", cat: "motherboard", all: ["x570"], none: ["laptop", "notebook"] },
  { id: "mobo-z490", cat: "motherboard", all: ["z490"], none: ["laptop", "notebook"] },
  { id: "mobo-h510m", cat: "motherboard", all: ["h510"], none: ["laptop", "notebook"] },
  { id: "mobo-h810m", cat: "motherboard", all: ["h810"], none: ["laptop", "notebook"] },
  { id: "mobo-z590", cat: "motherboard", all: ["z590"], none: ["laptop", "notebook"] },
  { id: "mobo-x670", cat: "motherboard", all: ["x670"], none: ["x670e", "laptop", "notebook"] },
  { id: "mobo-b560m", cat: "motherboard", all: ["b560"], none: ["laptop", "notebook"] },
  { id: "mobo-h410m", cat: "motherboard", all: ["h410"], none: ["laptop", "notebook"] },
  { id: "mobo-h310m", cat: "motherboard", all: ["h310"], none: ["laptop", "notebook"] },
  { id: "mobo-h110m", cat: "motherboard", all: ["h110"], none: ["laptop", "notebook"] },
  { id: "mobo-a320m", cat: "motherboard", all: ["a320"], none: ["laptop", "notebook"] },
  { id: "mobo-z390", cat: "motherboard", all: ["z390"], none: ["laptop", "notebook"] },
  { id: "mobo-z370", cat: "motherboard", all: ["z370"], none: ["laptop", "notebook"] },
  { id: "mobo-h81", cat: "motherboard", any: ["h81da", "h81m", "h81j", "h81 "], none: ["laptop", "notebook"] },
  { id: "mobo-h61", cat: "motherboard", any: ["h61", "h61n", "ih61"], none: ["laptop", "notebook"] },
  { id: "ram-64gb-d5-6000", cat: "ram", all: ["64gb", "ddr5"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-48gb-d5-6000", cat: "ram", all: ["48gb", "ddr5"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-24gb-d5", cat: "ram", all: ["24gb", "ddr5"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-32gb-d5-6400", cat: "ram", all: ["32gb", "ddr5", "6400"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-32gb-d5-6000", cat: "ram", all: ["32gb", "ddr5", "6000"], none: ["6400", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-32gb-d5-5600", cat: "ram", all: ["32gb", "ddr5", "5600"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-delta-32-d5", cat: "ram", all: ["32gb", "ddr5"], none: ["5600", "6000", "6400", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-16gb-d5-6400", cat: "ram", all: ["16gb", "ddr5", "6400"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-16gb-d5-6000", cat: "ram", all: ["16gb", "ddr5", "6000"], none: ["6400", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-16gb-d5-5600", cat: "ram", all: ["16gb", "ddr5", "5600"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-16-d5", cat: "ram", all: ["16gb", "ddr5"], none: ["32gb", "5600", "6000", "6400", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-8gb-d5-5600", cat: "ram", all: ["8gb", "ddr5"], none: ["16gb", "32gb", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-32gb-d4-3600", cat: "ram", all: ["32gb", "ddr4", "3600"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-32-d4", cat: "ram", all: ["32gb", "ddr4"], none: ["3600", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-value-8-d4", cat: "ram", all: ["8gb"], any: ["3200", "2666", "2400"], none: ["16gb", "32gb", "3600", "4800", "5600", "6000", "ddr5", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-16-d5", cat: "ram", all: ["16gb"], any: ["4800", "5600"], none: ["32gb", "6000", "6400", "ddr4", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-16gb-d4-3600", cat: "ram", all: ["16gb", "ddr4", "3600"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-16-d4", cat: "ram", all: ["16gb", "ddr4"], none: ["32gb", "3600", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-8gb-d4-3600", cat: "ram", all: ["8gb", "ddr4", "3600"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-value-8-d4", cat: "ram", all: ["8gb", "ddr4"], none: ["16gb", "32gb", "3600", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-4gb-d4-2666", cat: "ram", all: ["4gb", "ddr4"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-8gb-d3-1600", cat: "ram", all: ["ddr3"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ssd-970evo-1tb", cat: "ssd", all: ["970", "1tb"] },
  { id: "ssd-sn580-1tb", cat: "ssd", all: ["sn580"] },
  { id: "ssd-980pro-1tb", cat: "ssd", all: ["980pro"], none: ["laptop", "notebook"] },
  { id: "ssd-990pro-2tb", cat: "ssd", all: ["990pro", "2tb"], none: ["laptop", "notebook"] },
  { id: "ssd-990pro-2tb", cat: "ssd", all: ["990pro"], any: ["2tb"], none: ["laptop", "notebook"] },
  { id: "ssd-sn850x-1tb", cat: "ssd", all: ["sn850"], none: ["laptop", "notebook"] },
  { id: "ssd-gen5-1tb", cat: "ssd", all: ["gen5", "1tb"], none: ["laptop", "notebook"] },
  { id: "ssd-gen5-1tb", cat: "ssd", all: ["gen5"], any: ["1tb"], none: ["2tb", "laptop", "notebook"] },
  { id: "ssd-nvme-256gb", cat: "ssd", all: ["256gb"], any: ["nvme", "gen3", "gen4", "m2"], none: ["sata", "1tb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nvme-2tb", cat: "ssd", all: ["2tb"], any: ["nvme", "gen4", "gen5", "m2"], none: ["sata", "hdd", "surveillance", "laptop", "notebook"] },
  { id: "ssd-nvme-4tb", cat: "ssd", all: ["4tb"], any: ["nvme", "ssd", "ud90"], none: ["hdd", "surveillance", "laptop", "notebook"] },
  { id: "ssd-portable-1tb", cat: "ssd", all: ["portable"], any: ["1tb", "ssd"], none: ["laptop", "notebook"] },
  { id: "ssd-sata-2tb", cat: "ssd", all: ["sata", "2tb"], none: ["nvme", "m2", "hdd", "laptop", "notebook"] },
  { id: "ssd-sata-1tb", cat: "ssd", all: ["sata", "1tb"], none: ["nvme", "m2", "hdd", "laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["sata"], any: ["480gb", "500gb", "512gb"], none: ["nvme", "m2", "hdd", "laptop", "notebook"] },
  { id: "ssd-sata-256gb", cat: "ssd", all: ["sata"], any: ["240gb", "250gb", "256gb"], none: ["nvme", "m2", "hdd", "laptop", "notebook"] },
  { id: "hdd-6tb", cat: "ssd", all: ["6tb"], none: ["laptop", "notebook"] },
  { id: "hdd-4tb", cat: "ssd", all: ["4tb"], any: ["hdd", "skyhawk", "surveillance", "purple"], none: ["ssd", "nvme", "laptop", "notebook"] },
  { id: "hdd-2tb", cat: "ssd", all: ["2tb"], any: ["hdd", "barracuda", "skyhawk", "purple", "surveillance", "7200rpm", "5400rpm"], none: ["ssd", "nvme", "laptop", "notebook"] },
  { id: "ssd-external", cat: "ssd", any: ["external", "externe", "my book", "rugged", "backup plus", "boitier ssd", "arion", "travelair", "rack extern"], none: ["laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["1tb", "nvme"], none: ["sata", "laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["1tb"], any: ["m2"], none: ["sata", "hdd", "surveillance", "laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["sn5100"], none: ["laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["m450"], none: ["laptop", "notebook"] },
  { id: "ssd-gen5-1tb", cat: "ssd", all: ["m560"], none: ["laptop", "notebook"] },
  { id: "ssd-sata-1tb", cat: "ssd", all: ["su680", "1tb"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["su680"], none: ["1tb", "nvme", "laptop", "notebook"] },
  { id: "ssd-sata-1tb", cat: "ssd", all: ["c800a", "1tb"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["c800a"], none: ["1tb", "nvme", "laptop", "notebook"] },
  { id: "ssd-sata-1tb", cat: "ssd", all: ["a55", "1tb"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["a55"], none: ["1tb", "nvme", "laptop", "notebook"] },
  { id: "ssd-nvme-500gb", cat: "ssd", all: ["firecuda", "500gb"], none: ["laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["firecuda"], none: ["5tb", "8tb", "500gb", "laptop", "notebook"] },
  { id: "ssd-nvme-512gb", cat: "ssd", all: ["512gb"], any: ["nvme", "gen3", "gen4", "m2"], none: ["sata", "1tb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["nv3"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["gen4"], any: ["1tb"], none: ["512gb", "256gb", "2tb", "sata", "laptop", "notebook"] },
  { id: "ssd-sata-25", cat: "ssd", all: ["sata"], any: ["ssd", "2.5"], none: ["nvme", "m2", "hdd", "rpm", "laptop", "notebook"] },
  { id: "ssd-nvme-500gb", cat: "ssd", all: ["500gb"], any: ["nvme", "gen4", "gen3", "m2"], none: ["sata", "laptop", "notebook"] },
  { id: "ssd-nvme-256gb", cat: "ssd", all: ["250gb"], any: ["nvme", "gen3", "gen4", "m2"], none: ["sata", "laptop", "notebook"] },
  { id: "ssd-nvme-256gb", cat: "ssd", all: ["ctnvme"], none: ["laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["870", "evo"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-990evo-plus", cat: "ssd", all: ["990", "evo"], none: ["laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["gen5", "2tb"], none: ["laptop", "notebook"] },
  { id: "hdd-5tb", cat: "ssd", all: ["5tb"], none: ["laptop", "notebook"] },
  { id: "gpu-gtx1660s-6gb", cat: "gpu", all: ["1660super"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx2060-6gb", cat: "gpu", all: ["2060"], none: ["2060super", "laptop", "notebook", "portable"] },
  { id: "gpu-rtx2060s-8gb", cat: "gpu", all: ["2060super"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx3060ti-8gb", cat: "gpu", all: ["3060ti"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx3060-12gb", cat: "gpu", all: ["3060"], any: ["12gb", "12g", "o12g"], none: ["laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx4060-8gb", cat: "gpu", all: ["4060"], none: ["4060ti", "laptop", "notebook", "portable", "ti", "super"] },
  { id: "gpu-rtx4070-12gb", cat: "gpu", all: ["4070"], none: ["4070ti", "laptop", "notebook", "portable", "ti", "super"] },
  { id: "gpu-rtx5070-12gb", cat: "gpu", all: ["5070"], none: ["laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rx580-8gb", cat: "gpu", all: ["rx 580"] },
  { id: "gpu-rx7900xtx-24gb", cat: "gpu", all: ["7900xtx"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx7900xt-20gb", cat: "gpu", all: ["7900xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx7800xt-16gb", cat: "gpu", all: ["7800xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx7700xt-12gb", cat: "gpu", all: ["7700xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx7600xt-16gb", cat: "gpu", all: ["7600xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx7600-8gb", cat: "gpu", all: ["7600"], none: ["7600xt", "laptop", "notebook", "portable"] },
  { id: "gpu-rx6900xt-16gb", cat: "gpu", all: ["6900xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx6800xt-16gb", cat: "gpu", all: ["6800xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx6800-16gb", cat: "gpu", all: ["6800"], none: ["6800xt", "laptop", "notebook", "portable"] },
  { id: "gpu-rx6750xt-12gb", cat: "gpu", all: ["6750xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx6700xt-12gb", cat: "gpu", all: ["6700xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx6700-10gb", cat: "gpu", all: ["6700"], none: ["6700xt", "6750xt", "laptop", "notebook", "portable"] },
  { id: "gpu-rx6650xt-8gb", cat: "gpu", all: ["6650xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx6600xt-8gb", cat: "gpu", all: ["6600xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx6600-8gb", cat: "gpu", all: ["6600"], none: ["6600xt", "6650xt", "laptop", "notebook", "portable"] },
  { id: "gpu-rx9070-16gb", cat: "gpu", all: ["9070"], none: ["9070xt", "laptop", "notebook", "portable"] },
  { id: "gpu-rtx5060-8gb", cat: "gpu", all: ["5060"], none: ["5060ti", "laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx4070ti-12gb", cat: "gpu", all: ["4070ti"], none: ["super", "laptop", "notebook", "portable"] },
  { id: "gpu-rtx5080-16gb", cat: "gpu", all: ["5080"] },
  { id: "gpu-rtx5070ti-16gb", cat: "gpu", all: ["5070ti"], none: ["laptop", "notebook"] },
  { id: "gpu-rtx5060ti-16gb", cat: "gpu", all: ["5060ti"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx4070s-12gb", cat: "gpu", all: ["4070super"], none: ["laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx4070tis-16gb", cat: "gpu", all: ["4070tisuper"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-gt1030-4gb", cat: "gpu", all: ["1030"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-b580-12gb", cat: "gpu", all: ["b580"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx4060ti-16gb", cat: "gpu", all: ["4060ti", "16gb"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx4060ti-8gb", cat: "gpu", all: ["4060ti"], none: ["16gb", "laptop", "notebook", "portable"] },
  { id: "gpu-rtx3060-8gb", cat: "gpu", all: ["3060"], any: ["8gb", "08g", "8g"], none: ["12gb", "12g", "o12g", "ti", "laptop", "notebook", "portable"] },
  { id: "gpu-rtx3090-24gb", cat: "gpu", all: ["3090"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx5700xt-8gb", cat: "gpu", all: ["5700xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx5700-8gb", cat: "gpu", all: ["5700"], none: ["5700xt", "laptop", "notebook", "portable"] },
  { id: "gpu-rx6500xt-4gb", cat: "gpu", all: ["6500xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-gtx950-2gb", cat: "gpu", all: ["950"], none: ["pro", "laptop", "notebook", "portable"] },
  { id: "gpu-quadro", cat: "gpu", all: ["quadro"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-quadro", cat: "gpu", all: ["nvs"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-gtx1060-6gb", cat: "gpu", all: ["1060"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx5600xt-6gb", cat: "gpu", all: ["5600xt"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx480-8gb", cat: "gpu", all: ["480"], none: ["pro", "laptop", "notebook", "portable"] },
  { id: "gpu-rtx3060-12gb", cat: "gpu", all: ["3060"], none: ["8gb", "08g", "8g", "ti", "laptop", "notebook", "portable"] },
  { id: "gpu-gtx1660ti-6gb", cat: "gpu", all: ["1660ti"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-gtx1650-4gb", cat: "gpu", all: ["1650"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-gtx1050ti-4gb", cat: "gpu", all: ["1050ti"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-gtx1070-8gb", cat: "gpu", all: ["1070"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx2070s-8gb", cat: "gpu", all: ["2070super"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx2080s-8gb", cat: "gpu", all: ["2080super"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx3070ti-8gb", cat: "gpu", all: ["3070ti"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx4080-16gb", cat: "gpu", all: ["4080"], none: ["super", "laptop", "notebook", "portable"] },
  { id: "gpu-gt730-4gb", cat: "gpu", all: ["gt730"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx3080-10gb", cat: "gpu", all: ["3080"], none: ["3080ti", "laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx3070-8gb", cat: "gpu", all: ["3070"], none: ["3070ti", "laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx3080ti-12gb", cat: "gpu", all: ["3080ti"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx9070xt-16gb", cat: "gpu", all: ["9070xt"], none: ["laptop", "notebook"] },
  { id: "gpu-rtx5050-8gb", cat: "gpu", all: ["5050"], none: ["laptop", "notebook"] },
  { id: "gpu-rtx3050-6gb", cat: "gpu", all: ["3050"], none: ["laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx4080s-16gb", cat: "gpu", all: ["4080super"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx4090-24gb", cat: "gpu", all: ["4090"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx5090-32gb", cat: "gpu", all: ["5090"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx9060xt-16gb", cat: "gpu", all: ["9060xt"], none: ["laptop", "notebook", "portable"] },
  { id: "case-v217", cat: "case", all: ["v217"] },
  { id: "case-vector", cat: "case", all: ["vector"], none: ["v217"] },
  { id: "case-nx400", cat: "case", all: ["nx400"] },
  { id: "case-vx310", cat: "case", all: ["vx310"] },
  { id: "case-cx300", cat: "case", all: ["cx300"] },
  { id: "case-cg580", cat: "case", all: ["cg580"] },
  { id: "case-ap201", cat: "case", all: ["ap201"] },
  { id: "case-rev06", cat: "case", all: ["revolution"] },
  { id: "case-archon2", cat: "case", all: ["archon"] },
  { id: "case-atlas-p2", cat: "case", all: ["atlas"] },
  { id: "case-shield-m100", cat: "case", all: ["shield"] },
  { id: "case-shield-m100", cat: "case", all: ["m100r"] },
  { id: "case-shield-m100", cat: "case", all: ["m301"] },
  { id: "case-forge-320r", cat: "case", all: ["forge"] },
  { id: "case-pano-110r", cat: "case", all: ["pano"] },
  { id: "case-infinita-i802", cat: "case", all: ["infinita"] },
  { id: "case-meshian-x605", cat: "case", all: ["meshian"] },
  { id: "case-hurrikan-h200", cat: "case", all: ["hurrikan"] },
  { id: "case-ghost5", cat: "case", all: ["ghost"] },
  { id: "case-infinity-dark", cat: "case", all: ["infinity"] },
  { id: "case-gamma-c60", cat: "case", all: ["gamma"] },
  { id: "case-magma-v02", cat: "case", all: ["magma"], any: ["v02", "8202", "v8202", "mi1", "mi 1"] },
  { id: "case-magma-t9", cat: "case", all: ["magma", "t9"] },
  { id: "case-hybrok-ares", cat: "case", all: ["hybrok"], any: ["ares", "titan"] },
  { id: "case-nox-hummer", cat: "case", all: ["nox"] },
  { id: "case-xigmatek-aura", cat: "case", all: ["xigmatek"] },
  { id: "case-mars", cat: "case", all: ["mars"] },
  { id: "case-gamemax", cat: "case", all: ["gamemax"] },
  { id: "case-masterbox", cat: "case", all: ["masterbox"] },
  { id: "case-masterbox", cat: "case", all: ["mastercase"] },
  { id: "case-gungnir", cat: "case", all: ["gungnir"] },
  { id: "case-gungnir", cat: "case", all: ["prospect"] },
  { id: "case-ch560", cat: "case", all: ["ch560"] },
  { id: "case-gc7", cat: "case", all: ["gc7"] },
  { id: "case-gc7", cat: "case", all: ["athena"] },
  { id: "case-a21", cat: "case", all: ["a21"] },
  { id: "case-xpg", cat: "case", all: ["lander"] },
  { id: "case-gigabyte", cat: "case", all: ["c301g"] },
  { id: "case-gt502", cat: "case", all: ["gt502"] },
  { id: "case-phanteks", cat: "case", all: ["phanteks"] },
  { id: "case-gearmaster", cat: "case", all: ["gearmaster"] },
  { id: "case-asus-pro", cat: "case", all: ["proart"] },
  { id: "case-hybrok-ares", cat: "case", all: ["hybrok"], any: ["ares", "titan", "race", "hacker"] },
  { id: "case-ghost5", cat: "case", all: ["clone"] },
  { id: "case-masterbox", cat: "case", all: ["cmp"] },
  { id: "case-masterbox", cat: "case", all: ["qube"] },
  { id: "case-masterbox", cat: "case", all: ["haf"] },
  { id: "case-masterbox", cat: "case", all: ["cosmos"] },
  { id: "case-4000d", cat: "case", all: ["4000x"] },
  { id: "case-cg580", cat: "case", all: ["cg380"] },
  { id: "case-gamma-c60", cat: "case", all: ["c70"] },
  { id: "case-antec", cat: "case", all: ["antec"] },
  { id: "case-gc7", cat: "case", all: ["talos"] },
  { id: "case-ch560", cat: "case", all: ["ch690"] },
  { id: "case-ch560", cat: "case", all: ["ch270"] },
  { id: "case-cg580", cat: "case", all: ["cg530"] },
  { id: "case-gc7", cat: "case", all: ["gcm10"] },
  { id: "case-havit", cat: "case", all: ["havit"] },
  { id: "case-infinita-i802", cat: "case", all: ["x606"] },
  { id: "case-budget", cat: "case", all: ["cmt192"] },
  { id: "case-budget", cat: "case", all: ["ares"] },
  { id: "case-gungnir", cat: "case", all: ["prospect"] },
  { id: "case-masterbox", cat: "case", all: ["haf500"] },
  { id: "case-masterbox", cat: "case", all: ["haf700"] },
  { id: "cooler-ml360", cat: "cooler", all: ["pl360"] },
  { id: "cooler-ag400", cat: "cooler", all: ["ag500"] },
  { id: "cooler-lt360", cat: "cooler", all: ["le360"] },
  { id: "cooler-le520", cat: "cooler", all: ["le240"] },
  { id: "cooler-lt360", cat: "cooler", all: ["ls720"] },
  { id: "cooler-lt360", cat: "cooler", all: ["a13", "360"] },
  { id: "cooler-boreas-m2", cat: "cooler", all: ["51d"] },
  { id: "cooler-f2005", cat: "cooler", all: ["f2003"] },
  { id: "cooler-phantom", cat: "cooler", all: ["phantom"] },
  { id: "cooler-lt360", cat: "cooler", all: ["core", "vision"] },
  { id: "cooler-am1204", cat: "cooler", all: ["ac902k"] },
  { id: "mobo-z270", cat: "motherboard", all: ["z270"], none: ["laptop", "notebook"] },
  { id: "mobo-g41", cat: "motherboard", all: ["g41"], none: ["laptop", "notebook"] },
  { id: "mobo-nzxt", cat: "motherboard", all: ["nzxt"], none: ["laptop", "notebook"] },
  { id: "mobo-b150m", cat: "motherboard", all: ["b150"], none: ["laptop", "notebook"] },
  { id: "mobo-x570", cat: "motherboard", all: ["crosshair"], none: ["laptop", "notebook"] },
  { id: "ssd-128gb", cat: "ssd", all: ["128gb"], none: ["laptop", "notebook"] },
  { id: "ssd-budget", cat: "ssd", any: ["goldenfir", "kodak", "acos", "soccer", "hikvision", "e100"], none: ["laptop", "notebook"] },
  { id: "ssd-sata-1tb", cat: "ssd", all: ["as350x", "1tb"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["as350x"], none: ["1tb", "nvme", "laptop", "notebook"] },
  { id: "ssd-sata-1tb", cat: "ssd", all: ["s750", "1tb"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["s750"], none: ["1tb", "nvme", "laptop", "notebook"] },
  { id: "ssd-sata-1tb", cat: "ssd", all: ["c300", "960gb"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-sata-256gb", cat: "ssd", all: ["c300"], none: ["960gb", "512gb", "1tb", "nvme", "laptop", "notebook"] },
  { id: "ssd-sata-256gb", cat: "ssd", all: ["mx2"], none: ["512gb", "1tb", "nvme", "laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["mx2", "512gb"], none: ["nvme", "laptop", "notebook"] },
  { id: "ssd-nvme-2tb", cat: "ssd", all: ["mp44l"], none: ["laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["p310"], none: ["laptop", "notebook"] },
  { id: "ssd-nvme-2tb", cat: "ssd", all: ["ares", "pro"], none: ["laptop", "notebook"] },
  { id: "hdd-1tb", cat: "ssd", all: ["hdd", "1tb"], none: ["laptop", "notebook"] },
  { id: "ssd-sata-512gb", cat: "ssd", all: ["512gb"], any: ["ssd"], none: ["nvme", "gen3", "gen4", "gen5", "m2", "laptop", "notebook"] },
  { id: "ssd-nvme-256gb", cat: "ssd", all: ["256"], any: ["nvme", "m2", "ssd"], none: ["sata", "1tb", "2tb", "laptop", "notebook"] },
  { id: "ram-32gb-d5-6000", cat: "ram", all: ["32gb"], any: ["6000", "6400"], none: ["ddr4", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-16gb-d5-6000", cat: "ram", all: ["16gb"], any: ["6000", "6400"], none: ["ddr4", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-16gb-d4-3600", cat: "ram", all: ["16gb", "3600"], none: ["ddr5", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-32-d4", cat: "ram", all: ["32gb", "3200"], none: ["ddr5", "3600", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-16-d4", cat: "ram", all: ["16gb", "3200"], none: ["ddr5", "3600", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-16-d4", cat: "ram", all: ["spectrix"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-16-d4", cat: "ram", all: ["d60g"], none: ["8gb", "laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-value-8-d4", cat: "ram", all: ["d60g", "8gb"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "ram-vengeance-16-d4", cat: "ram", all: ["d50"], none: ["laptop", "sodimm", "notebook", "portable"] },
  { id: "mon-27-100", cat: "monitor", all: ["mp271a"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-25-120", cat: "monitor", all: ["ga25fc"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-100", cat: "monitor", all: ["mp242a"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-200", cat: "monitor", all: ["g242f"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-180", cat: "monitor", all: ["242f"], none: ["g242f", "laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["fo32u2p"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["mo32u"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-165", cat: "monitor", all: ["gs27fa"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-200", cat: "monitor", all: ["g25f2"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-200", cat: "monitor", all: ["gs25f2"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", all: ["vg27aqml1a"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-4k", cat: "monitor", all: ["xg27ucg"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-100", cat: "monitor", all: ["vy279hgr"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", all: ["vg27aql3a"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-180", cat: "monitor", all: ["vg259"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-144", cat: "monitor", all: ["242e1gaj"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-25-300", cat: "monitor", all: ["255xf"], none: ["laptop", "tv", "televiseur"] },
  { id: "case-4000d", cat: "case", all: ["4000d"] },
  { id: "case-h5flow", cat: "case", all: ["h5"], any: ["h5", "flow"] },
  { id: "case-velox", cat: "case", all: ["velox"] },
  { id: "case-mcv3", cat: "case", all: ["mcv3"] },
  { id: "psu-mwe650-b", cat: "psu", all: ["mwe", "650"] },
  { id: "psu-450-b", cat: "psu", all: ["450w"] },
  { id: "psu-400-b", cat: "psu", all: ["400w"] },
  { id: "psu-500-b", cat: "psu", all: ["500w"] },
  { id: "psu-550-b", cat: "psu", all: ["550w"] },
  { id: "psu-550-b", cat: "psu", all: ["535w"] },
  { id: "psu-550-b", cat: "psu", all: ["p550b"] },
  { id: "psu-750-gold", cat: "psu", all: ["p750gm"] },
  { id: "psu-850-gold", cat: "psu", all: ["p850gm"] },
  { id: "psu-1000-gold", cat: "psu", all: ["a1000gl"] },
  { id: "psu-850-gold", cat: "psu", all: ["a850gs"] },
  { id: "psu-500-b", cat: "psu", all: ["a500n"] },
  { id: "psu-750-b", cat: "psu", all: ["750w"], any: ["bronze", "m1 750", "a750"] },
  { id: "psu-600-b", cat: "psu", all: ["600w"] },
  { id: "psu-650-b", cat: "psu", all: ["650w"], any: ["bronze"] },
  { id: "psu-650-gold", cat: "psu", all: ["650w"], any: ["gold"] },
  { id: "psu-650-b", cat: "psu", all: ["650w"], none: ["gold"] },
  { id: "psu-700-b", cat: "psu", all: ["700w"] },
  { id: "psu-750-b", cat: "psu", all: ["750w"], any: ["bronze"] },
  { id: "psu-750-gold", cat: "psu", all: ["750w"] },
  { id: "psu-800-gold", cat: "psu", all: ["800w"] },
  { id: "psu-850-b", cat: "psu", all: ["850w"], any: ["bronze"] },
  { id: "psu-850-gold", cat: "psu", all: ["850w"] },
  { id: "psu-850-gold", cat: "psu", all: ["850g"] },
  { id: "psu-1000-gold", cat: "psu", all: ["1000w"] },
  { id: "psu-1050-gold", cat: "psu", any: ["1050w", "1050"] },
  { id: "psu-1200-gold", cat: "psu", all: ["1200w"] },
  { id: "psu-1250-gold", cat: "psu", all: ["1250w"] },
  { id: "psu-1300-plat", cat: "psu", all: ["1300w"] },
  { id: "mon-mag255f", cat: "monitor", all: ["255f"] },
  { id: "mon-24-200", cat: "monitor", all: ["200hz"], any: ["24", "g242f", "23 8", "24 5"], none: ["27", "32", "34", "49", "55", "65", "laptop", "tv", "televiseur"] },
  { id: "mon-22-100", cat: "monitor", all: ["22", "100hz"], none: ["24", "27", "32", "laptop", "tv", "televiseur"] },
  { id: "mon-24-100", cat: "monitor", all: ["24", "100hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-120", cat: "monitor", all: ["24", "120hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-144", cat: "monitor", all: ["24", "144hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-165", cat: "monitor", all: ["24", "165hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-25-300", cat: "monitor", all: ["300hz"], any: ["25", "255pxf", "mg25gmg", "24 5"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-100", cat: "monitor", all: ["27", "100hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", all: ["27"], any: ["180hz", "180mhz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-120", cat: "monitor", all: ["27", "120hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-25-120", cat: "monitor", all: ["120hz"], any: ["25", "24 5", "va249hg"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-165", cat: "monitor", all: ["27", "165hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-280", cat: "monitor", all: ["24"], any: ["240hz", "280hz", "310hz", "540hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-315", cat: "monitor", any: ["31 5", "xv320qu", "ag326ud"], none: ["24", "27", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-240", cat: "monitor", all: ["272f"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", all: ["275qf"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-165", cat: "monitor", all: ["ex240n"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-240", cat: "monitor", all: ["27"], any: ["oled"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-office-24", cat: "monitor", all: ["24"], any: ["75hz", "60hz"], none: ["27", "32", "34", "49", "120hz", "144hz", "165hz", "180hz", "laptop", "tv", "televiseur"] },
  { id: "mon-office-22", cat: "monitor", all: ["22"], any: ["75hz", "60hz", "100hz"], none: ["24", "27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-office-s", cat: "monitor", any: ["18", "19", "20", "21"], none: ["22", "24", "25", "27", "32", "34", "40", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-120", cat: "monitor", all: ["24b31h"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-144", cat: "monitor", all: ["24b36x"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-165", cat: "monitor", all: ["kg241"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-24", cat: "monitor", all: ["mp24hv"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-22", cat: "monitor", all: ["mp22hv"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-24", cat: "monitor", all: ["gl2460"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-24", cat: "monitor", all: ["24m38"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-22", cat: "monitor", all: ["e2270"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-25-120", cat: "monitor", all: ["va249hg"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", all: ["xg279cns"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", all: ["vg27aql5a"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-qhd180", cat: "monitor", all: ["vg32vqm5b"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-4k", cat: "monitor", all: ["pg27ucdm"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", all: ["xg27acdng"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["xg32ucwg"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-49-superwide", cat: "monitor", all: ["491cqp"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["321upx"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", all: ["273qp"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-4k", cat: "monitor", all: ["274urdfw"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", all: ["g275l"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-280", cat: "monitor", all: ["vg249qm5a"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-34-uw", cat: "monitor", all: ["341cqpx"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", all: ["27g4"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-100", cat: "monitor", all: ["p27v"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-24", cat: "monitor", all: ["p24v"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-24", cat: "monitor", all: ["v24v"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-office-24", cat: "monitor", all: ["adr", "24"], none: ["27", "32", "laptop", "tv", "televiseur"] },
  { id: "mon-27-200", cat: "monitor", all: ["27", "200hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-240", cat: "monitor", all: ["27", "240hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", all: ["27"], any: ["280hz", "300hz", "310hz", "380hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["32"], any: ["4k", "uhd", "2160"], none: ["24", "27", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-32-qhd180", cat: "monitor", all: ["32"], any: ["180hz", "280hz", "165hz", "240hz", "qhd", "2k"], none: ["24", "27", "34", "49", "4k", "uhd", "2160", "laptop", "tv", "televiseur"] },
  { id: "mon-34-oled", cat: "monitor", all: ["34"], any: ["oled", "175hz", "165hz", "144hz"], none: ["24", "27", "32", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-49-superwide", cat: "monitor", all: ["49"], none: ["24", "27", "32", "34", "laptop", "tv", "televiseur"] },
  { id: "mon-20-75", cat: "monitor", all: ["20"], any: ["75hz", "60hz"], none: ["24", "27", "32", "34", "22", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-4k", cat: "monitor", all: ["27"], any: ["4k", "uhd", "2160"], none: ["laptop", "tv", "televiseur", "32", "34", "49"] },
  { id: "mon-34-uw", cat: "monitor", any: ["ultrawide", "uwqhd", "21 9", "3440"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["32"], any: ["oled"], none: ["24", "27", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-34-uw", cat: "monitor", all: ["21", "9"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-34-uw", cat: "monitor", all: ["3440"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-180", cat: "monitor", any: ["180hz", "180mhz"], all: ["24"], none: ["27", "32", "34", "49", "55", "65", "laptop", "tv", "televiseur"] },
  { id: "mon-24-180", cat: "monitor", all: ["180hz"], any: ["24", "23 8", "24 5", "23 6", "25"], none: ["27", "32", "34", "49", "55", "65", "laptop", "tv", "televiseur"] },
  { id: "mon-27-qhd165", cat: "monitor", all: ["27"], any: ["qhd", "2k", "1440p", "1440"], none: ["laptop", "tv", "televiseur", "32", "34", "49"] },
];

const OK_CAT = {
  "ryzen 5 5600": "cpu", "ryzen 5 5600x": "cpu", "ryzen 7 5700x": "cpu", "ryzen 5 7500f": "cpu", "ryzen 5 7600": "cpu",
  "ryzen 7 7700": "cpu", "ryzen 7 7800x3d": "cpu", "ryzen 7 9800x3d": "cpu", "ryzen 9 7900x": "cpu", "ryzen 9 7950x": "cpu",
  "i5 12400": "cpu", "i5 13400": "cpu", "i5 14400": "cpu", "i7 13700": "cpu", "i7 14700": "cpu", "i9 14900": "cpu", "i3 12100": "cpu",
  "rtx 3060": "gpu", "rtx 4060": "gpu", "rtx 4060 ti": "gpu", "rtx 4070": "gpu", "rtx 4070 super": "gpu", "rtx 3070": "gpu",
  "rtx 3080": "gpu", "rtx 5060": "gpu", "rtx 5060 ti": "gpu", "rtx 5070": "gpu", "rx 580": "gpu", "rx 6600": "gpu",
  "rx 6700 xt": "gpu", "rx 6800": "gpu", "rx 7600": "gpu", "rx 7700 xt": "gpu", "rx 7800 xt": "gpu", "rx 7900 xt": "gpu",
  "rx 9070": "gpu", "rx 9060": "gpu", "gtx 1660 super": "gpu",
  b550: "motherboard", b650: "motherboard", b660: "motherboard", b760: "motherboard", h610: "motherboard", z790: "motherboard", a620: "motherboard",
  "ak400": "cooler", "ak620": "cooler", "watercooling 240": "cooler", "watercooling 360": "cooler",
  "16gb ddr4": "ram", "32gb ddr4": "ram", "ddr5 16gb": "ram", "ddr5 32gb": "ram",
  "980 pro": "ssd", "nvme 1tb": "ssd", "nvme 512gb": "ssd", "nvme 2tb": "ssd",
  "650w": "psu", "750w": "psu", "850w": "psu",
  "boitier atx": "case", "boitier gaming": "case",
  "ecran 144hz": "monitor", "ecran 165hz": "monitor", "ecran 27": "monitor", "moniteur gaming": "monitor",
};
// non-parts never stored as extras (keeps DB + bundle lean)
const EXTRA_JUNK = /laptop|notebook|macbook|printer|imprimante|scanner|projecteur|datashow|webcam|tablet|smartphone|console|manette|pate thermique|pad thermique|thermal pad|thermal paste|thermal grizzly|mastergel|tube (magma|watercooling)|ventilateur boitier|case fan|masterfan|sickleflow|mf120|fd12|pack (ventilo|fans)|support (carte|ecran)|monitor stand|vortex|graphics card support|gpu holder|support gpu|herculx|back plate|waterblock|cold series|radiator with thermal|kit .\volution|en configuration|sleeve|power extension|cable (mars|first)|8-pin male|4-pin female|zenscreen|monitor arm|ergo aas|carte pci|ddr2|controleur|controller|fan hub|riser|snowman h9|tf120|chroma|at120|wraith spire|cooling amd|ventill?ateur.*original|original.*fan|ventil+o original|ubisoft|steam key|jeu pc|elgato|capture|12pci|btc|mining|kit .\volution|en configuration|accessoire boitier|pixel|24pin|smart plug|transfo|ddr2|televiseur|television|smart tv|souris|mouse|clavier|keyboard|casque|headset|chaise|chair|gaming desk|bureau gamer|portal|facebook/i;
// ---- multi-item veto (bundle/pack/combo): tested BEFORE matchRule ----
// A price framed as several parts together ("CPU AMD RYZEN 5 3400G BOX ...
// BUNDLE ... B550", "Pack Ryzen 5 5600 + B450M") is never a standalone offer
// for any single part: matching it books a combo price onto one product's
// page (a CPU ad priced the B550 board). Vetoed rows skip matchRule and fall
// through to the existing extras path, never canonical. Genuine standalone
// store titles never contain these words (verified against live bake output).
const BUNDLE_VETO = /\bbundle\b|\bpack\b|\bcombo\b|\blot de\b/i;

// ---- variant-capacity guard (SSD/RAM) ----
// Merchants list one parent product for every capacity ("LEGEND 710
// 256GB/512GB/1TB/2TB") carrying a single (cheapest-variant) price.
// First-match-wins would attach that small-capacity price to the largest
// capacity product. Multi-capacity titles redirect to the SMALLEST capacity
// product; single-capacity titles redirect when the matched rule disagrees
// (e.g. model-name rule "m450" matching a 500GB drive onto a 1TB product).
function capTokenGB(tok) {
  const m = /^(\d+)(gb|tb)$/.exec(tok);
  return m ? (+m[1] * (m[2] === "tb" ? 1024 : 1)) : null;
}
function titleCapacities(title) {
  // Kit multipliers must be read from the RAW title: norm() destroys x/×/*
  // separators ("2×16 Go" -> "2 16go"), losing which number is per-stick.
  // Decimal "capacities" are speeds, never drives ("7.3GB par Sec" -> phantom
  // 3GB): strip them. Counts above 8 sticks are model numbers, not kits
  // ("SN850X 2TB" reads as 850 x 2TB without the guard).
  const decRe = /\d+\s*[.,]\s*\d+\s*(tb|gb|go|to)/gi;
  const raw = " " + String(title || "").toLowerCase().replace(decRe, " ") + " ";
  const kre = /(\d+)\s*[x×*]\s*(\d+)\s*(tb|gb|go|to)|(\d+)\s*(tb|gb|go|to)\s*[x×*]\s*(\d+)/gi;
  const drop = new Set(); // per-stick sizes, never standalone capacities
  const totals = new Set(); // kit totals, always kept
  let km;
  const frUnit = (u) => (u === "tb" || u === "to" ? 1024 : 1);
  const kitOk = (n, size) => n >= 1 && n <= 8 && size > 0 && size <= 8192;
  while ((km = kre.exec(raw))) {
    if (km[1]) {
      const size = +km[2] * frUnit(km[3]);
      if (kitOk(+km[1], size)) {
        drop.add(size);
        totals.add(+km[1] * size);
      }
    } else {
      const size = +km[4] * frUnit(km[5]);
      if (kitOk(+km[6], size)) {
        drop.add(size);
        totals.add(size * +km[6]);
      }
    }
  }
  let t = " " + norm(title).replace(decRe, " ") + " ";
  t = t.replace(/(\d+)\s*gb\s+s(?=\s|$)/g, " "); // "6gb/s" SATA speed spec, not a 6GB capacity
  const out = [];
  const gb = (n, u) => +n * (u === "tb" ? 1024 : 1);
  const re = /(\d+)\s*x\s*(\d+)\s*(tb|gb)|(\d+)\s*(tb|gb)\s*x\s*(\d+)|(\d+)\s*(tb|gb)/g;
  let m;
  while ((m = re.exec(t))) {
    if (m[1]) {
      if (kitOk(+m[1], gb(m[2], m[3]))) out.push(+m[1] * gb(m[2], m[3]));
    } else if (m[4]) {
      if (kitOk(+m[6], gb(m[4], m[5]))) out.push(gb(m[4], m[5]) * +m[6]);
    } else out.push(gb(m[7], m[8]));
  }
  const sane = (v) => v > 0 && v <= 32768; // absurd values (7200tb RPM fallout) are never capacities
  return [...new Set([...out.filter((v) => sane(v) && !drop.has(v)), ...[...totals].filter(sane)])];
}
// Product-line tokens: shared title<->rule ownership means the match was earned.
const FAMILY_TOK = new Set(["externe", "external", "portable", "hdd", "disque", "dur", "udimm", "sodimm", "rgb"]);
// Tokens too generic to prove anything about who matched what.
const GENERIC_TOK = new Set(["ssd", "sata", "nvme", "pcie", "m2", "gen3", "gen4", "gen5", "ddr4", "ddr5"]);
function isSignalTok(x) {
  return capTokenGB(x) === null && !/^\d+$/.test(x) && !GENERIC_TOK.has(x);
}
function variantRedirect(category, title, matched, has) {
  if (category !== "ssd" && category !== "ram") return matched;
  const caps = titleCapacities(title);
  if (caps.length === 0) return matched;
  if (caps.length === 1) {
    const idm = /(\d+)(tb|gb)/.exec(matched);
    const matchedCap = idm ? +idm[1] * (idm[2] === "tb" ? 1024 : 1) : null;
    if (matchedCap === caps[0]) return matched;
    const mr = RULES.find((r) => r.id === matched && r.cat === category);
    if (mr) {
      const s = new Set(
        [...(mr.all || []), ...(mr.any || [])].map(capTokenGB).filter((v) => v !== null)
      );
      if (s.has(caps[0])) return matched;
      const bare = String(caps[0]);
      if ([...(mr.all || []), ...(mr.any || [])].includes(bare)) return matched;
      // Family/brand keep: the matched rule shares a distinctive non-capacity
      // token with the title, so the match was earned, not an ordering accident.
      // Family tokens (external/portable/hdd/...) keep unconditionally — they
      // define the product line, and capacity text there is often descriptive
      // ("portable 1TB" line vs the actual size). Junk-drawer rules like
      // ssd-sata-25 own no distinctive token, so they always redirect.
      const own = [...(mr.all || []), ...(mr.any || [])];
      if (own.some((x) => FAMILY_TOK.has(x) && has(x))) return matched;
      // Brand/model signals (hikvision, m450, c300...) keep only when nothing
      // contradicts the title capacity: a contradicting product id (m450 rule
      // claims 1tb for a 500GB drive) or contradicting rule capacity tokens
      // means the model token matched but the row is wrong -> redirect.
      const mrCaps = own.map(capTokenGB).filter((v) => v !== null);
      const agree = mrCaps.length > 0 ? mrCaps.includes(caps[0]) : matchedCap === null;
      if (agree && own.some((x) => !FAMILY_TOK.has(x) && isSignalTok(x) && has(x))) return matched;
    } else if (matchedCap === null) {
      return matched; // nothing to compare against — keep
    }
  }
  // Smallest-first over every listed capacity: a phantom small cap from a
  // decimal speed ("7.3GB" -> 3GB) has no capacity-correct row, so its pass
  // finds nothing and the loop falls through to the real capacity. (Min-only
  // took the phantom, found no row, and wrongly kept the matched rule.)
  const ordered = caps.length === 1 ? caps : [...new Set(caps)].sort((a, b) => a - b);
  for (const want of ordered) {
    const toks = new Set(want % 1024 === 0 ? [want / 1024 + "tb", want + "gb"] : [want + "gb"]);
    const bare = String(want);
    const cands = [];
    for (const r of RULES) {
      if (r.cat !== category) continue;
      const rt = [...(r.all || []), ...(r.any || [])];
      // Rule capacity: explicit capacity tokens first, else the capacity
      // embedded in the product id ("sn850x-1tb" -> 1024). Model rows often
      // carry no size token but their id names the size they hold; without
      // this they can never receive a redirect despite being the best home.
      let rcap = null;
      for (const x of rt) { const v = capTokenGB(x); if (v !== null) { rcap = v; break; } }
      if (rcap === null) {
        const idm = /(\d+)(tb|gb)/.exec(r.id);
        if (idm) rcap = +idm[1] * (idm[2] === "tb" ? 1024 : 1);
      }
      if (rcap !== want && !rt.some((x) => toks.has(x) || x === bare)) continue;
      // every non-capacity `all` token must still match (keeps SATA/NVMe/brand apart)
      const rest = (r.all || []).filter((x) => capTokenGB(x) === null && x !== bare);
      if (!rest.every(has)) continue;
      if (r.any && !r.any.some((x) => has(x) || toks.has(x) || x === bare)) continue;
      // mirror matchRule's none-exclusions, except capacity tokens on range
      // titles: "256GB|512GB|1TB|2TB" lists every capacity, so none:[1tb,2tb]
      // must not reject the redirect target (interface/family nones still apply)
      if ((r.none || []).some((x) => {
        if (caps.length > 1 && (capTokenGB(x) !== null || /^\d+$/.test(x))) return false;
        return has(x);
      })) continue;
      cands.push(r);
    }
    // Every candidate is capacity-correct; prefer the one sharing the most
    // distinctive title signals (model/brand tokens): a "2TB/1TB SN850X" range
    // belongs on the SN850X 1TB row, not the generic Gen4 1TB row. Score 0 ties
    // keep RULES order, so behavior only changes where a model token earns it.
    let best = null, bestScore = -1;
    for (const r of cands) {
      let s = 0;
      for (const x of [...(r.all || []), ...(r.any || [])]) if (isSignalTok(x) && has(x)) s++;
      if (s > bestScore) { bestScore = s; best = r; }
    }
    if (best) return best.id;
  }
  return matched;
}

function matchRule(category, title) {
  const t = " " + norm(title) + " ";
  const words = t.split(" ").filter(Boolean);
  const flat = words.join("");
  const has = (tok) => {
    if (tok.includes(" ")) return t.includes(tok) || flat.includes(tok.replace(/ /g, ""));
    if (tok.length <= 3) return words.includes(tok); // no "ti"-in-"garantie" false hits
    return t.includes(tok) || flat.includes(tok);
  };
  for (const r of RULES) {
    if (r.cat !== category) continue;
    if (!(r.all || []).every(has)) continue;
    if (r.any && !r.any.some(has)) continue;
    if ((r.none || []).some(has)) continue;
    return variantRedirect(category, title, r.id, has);
  }
  return null;
}

const matched = []; // Offer-shaped
const extras = [];
const seenExtra = new Set();

function pushExtra(category, e) {
  const key = category + "|" + e.store + "|" + e.title;
  if (seenExtra.has(key)) return;
  seenExtra.add(key);
  extras.push(e);
}

for (const [key, val] of Object.entries(report)) {
  if (key === "ouedkniss:all" || !val.offers || !Array.isArray(val.offers)) continue;
  const [store, category] = key.split("/");
  if (!store || !category || !WILAYA[store]) continue;
  let extraCount = 0;
  for (const o of val.offers) {
    const title = clean(o.title);
    if (!title || !o.priceDa) continue;
    const cond = /\bused\b|occasion|r[eé]cup[eé]ration/i.test(title) ? "used" : "new";
    const isBundle = BUNDLE_VETO.test(title);
    const pid = isBundle ? null : matchRule(category, title);
    if (pid) {
      if (seedPairs.has(pid + "|" + store)) continue; // seed wins
      matched.push({ productId: pid, store, wilaya: WILAYA[store], titleRaw: title.slice(0, 120), priceDa: o.priceDa, url: o.url, stock: o.stock || "En stock", condition: cond, image: o.image || "", scrapedAt: NOW });
    } else if (!EXTRA_JUNK.test(title) && (isBundle || extraCount < 12)) {
      if (!isBundle) extraCount++;
      pushExtra(category, { category, title: title.slice(0, 120), priceDa: o.priceDa, store, wilaya: WILAYA[store], url: o.url, image: o.image || "", condition: cond });
    }
  }
}

// ouedkniss
let okExtra = 0;
for (const o of report["ouedkniss:all"] || []) {
  const category = OK_CAT[o.query] || "gpu";
  const title = clean(o.title);
  if (!title || !o.priceDa) continue;
  const isNew = /neuf|new|blister|jamais|scell/i.test(title);
  // canonical match only — bundles/laptops/unknown VRAM go to extras, never canonical
  // vetoed bundle rows bypass the 150-cap so combo ads stay visible as raw extras
  const isBundle = BUNDLE_VETO.test(title);
  const pid = isBundle ? null : matchRule(category, title);
  if (pid) {
    matched.push({ productId: pid, store: "Ouedkniss", wilaya: o.wilaya || "DZ", titleRaw: title.slice(0, 120), priceDa: o.priceDa, url: o.url, stock: "Ouedkniss", condition: isNew ? "new" : "used", image: o.image || "", scrapedAt: NOW });
  } else if (!EXTRA_JUNK.test(title) && (isBundle || okExtra < 150)) {
    if (!isBundle) okExtra++;
    pushExtra(category, { category, title: title.slice(0, 120), priceDa: o.priceDa, store: "Ouedkniss", wilaya: o.wilaya || "DZ", url: o.url, image: o.image || "", condition: isNew ? "new" : "used", postedAt: o.postedAt || "", seller: (o.seller || "").slice(0, 40), isStore: o.isFromStore ? 1 : 0 });
  }
}

// cap 6 cheapest per canonical product (bundle size)
const byPid = new Map();
for (const m of matched) {
  if (!byPid.has(m.productId)) byPid.set(m.productId, []);
  byPid.get(m.productId).push(m);
}
const capped = [];
const isOut = (m) => /rupture|out of stock|sold out|épuisé|indisponible/i.test(m.stock || "");
for (const arr of byPid.values()) {
  // Available offers first: a rupture price must never push a live price
  // out of the 6-offer cap, nor become the row's displayed minimum.
  arr.sort((a, b) => (isOut(a) - isOut(b)) || (a.priceDa - b.priceDa));
  capped.push(...arr.slice(0, 6));
}

const esc = (s) => JSON.stringify(s);
function offerSrc(o) {
  return `  { productId: ${esc(o.productId)}, store: ${esc(o.store)}, wilaya: ${esc(o.wilaya)}, titleRaw: ${esc(o.titleRaw)}, priceDa: ${o.priceDa}, url: ${esc(o.url)}, stock: ${esc(o.stock)}, condition: ${esc(o.condition)}, image: ${esc(o.image)}, scrapedAt: ${esc(o.scrapedAt)} },`;
}
function extraSrc(o) {
  return `  { category: ${esc(o.category)}, title: ${esc(o.title)}, priceDa: ${o.priceDa}, store: ${esc(o.store)}, wilaya: ${esc(o.wilaya)}, url: ${esc(o.url)}, image: ${esc(o.image)}, condition: ${esc(o.condition)}, postedAt: ${esc(o.postedAt || "")}, seller: ${esc(o.seller || "")}, isStore: ${o.isStore ? 1 : 0} },`;
}

const out = `// AUTO-GENERATED by bake.mjs from live scrape (${NOW.slice(0, 10)}). Do not hand-edit.
import type { Offer } from "./products";

export interface LiveExtra {
  category: string;
  title: string;
  priceDa: number;
  store: string;
  wilaya: string;
  url: string;
  image: string;
  condition: "new" | "used";
  postedAt?: string;
  seller?: string;
  isStore?: number;
}

export const SCRAPED_AT = ${esc(NOW)};
export const LIVE_PRODUCTS: Offer["productId"][] = [];
export const LIVE_OFFERS: Offer[] = [
${capped.map(offerSrc).join("\n")}
];
export const LIVE_EXTRA: LiveExtra[] = [
${extras.map(extraSrc).join("\n")}
];
`;
fs.writeFileSync("lib/data/live.ts", out);
// one photo per product: first matched STORE image (Ouedkniss last, often lazy/broken)
const imgSrc = {};
const ordered = [...matched.filter((m) => m.store !== "Ouedkniss"), ...matched.filter((m) => m.store === "Ouedkniss")];
for (const m of ordered) {
  if (m.image && !imgSrc[m.productId]) imgSrc[m.productId] = m.image;
}
fs.writeFileSync("lib/data/live-images-src.json", JSON.stringify(imgSrc, null, 1));
// compact Supabase seed (offers + one history snapshot; extras are re-scraped, never stored)
const prodSrc = fs.readFileSync("lib/data/products.ts", "utf8");
const seedProducts = [...prodSrc.matchAll(/\{ id: "([^"]+)", category: "([^"]+)", brand: "([^"]+)", model: "([^"]+)" }/g)]
  .map((m) => ({ id: m[1], category: m[2], brand: m[3], model: m[4] }));
const seed = {
  scraped_at: NOW,
  day: NOW.slice(0, 10),
  products: seedProducts,
  stores: [...new Set(capped.map((o) => o.store))].map((s) => ({ name: s, wilaya: WILAYA[s] || "Alger" })),
  offers: capped.map((o) => ({
    p: o.productId, s: o.store, d: o.priceDa, c: o.condition === "used" ? 0 : 1,
    u: o.url.slice(0, 160), t: o.titleRaw.slice(0, 90),
  })),
};
fs.writeFileSync("supabase-seed.json", JSON.stringify(seed));
const seedKB = Math.round(Buffer.byteLength(JSON.stringify(seed)) / 1024);
console.log("matched offers:", matched.length, "capped:", capped.length, "extras:", extras.length, "products hit:", byPid.size, "with photo:", Object.keys(imgSrc).length, "seed:", seedKB + "KB");
