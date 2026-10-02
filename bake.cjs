// Bakes full.json (live scrape) into lib/data/live.ts
// Usage: node bake.mjs  (reads full.json, writes lib/data/live.ts)
const fs = require("fs");

const full = JSON.parse(fs.readFileSync("full.json", "utf8"));
const report = full.report;

const WILAYA = {
  "LICB+": "Alger", "Click-DZ": "Alger", Digitec: "Alger", WifiDjelfa: "Djelfa", KOTEK: "Alger", GamingDZ: "Sétif",
  GigaStore: "Oran", Informatics: "Boumerdes", Lahlou: "Alger", HardSoft: "Oran", Campus: "Alger", KhabirTech: "M'sila",
  DeskCom: "Oran", NextGen: "Sétif", Matos: "Alger", BlidaComputer: "Blida", "TECHMATE DZ": "Jijel", "MBA INFO": "Batna",
  "E K Service Informatique": "Blida", "mark computer": "Blida", "GAMING ONE": "Oran", "CLICK INFORMATIQUE ORAN": "Oran",
  "FAIZ TECH": "Djelfa", "INI VOLT": "Sidi Bel Abbès", SolutionMaxi: "Oran", "Zmika Store": "Alger", "TKI TEC": "Alger",
  "FUTURE CITY INFORMATIQUE": "Alger", "IT DEVICE": "Alger", "ADMIN Informatique": "Alger", "IFTA COMPUTER": "Alger",
  "PROMOTECH IT": "Alger", "DKTIQUE COMPUTER": "Alger", "Technal Computer": "Alger", BUYMORE: "Alger", HWstore: "Alger",
  "MDI informatique": "Alger", "AN-TECH": "Alger", "AGYN TECH DZ": "Tizi Ouzou", "KPC SOLUTIONS": "Alger",
  "EL ASSLI HI TECH": "Alger", TRETEC: "Alger", "INFO TECH": "Alger"
};
const NOW = new Date().toISOString();

// seed pairs win over live dupes (read from products.ts)
const src = fs.readFileSync("lib/data/products.ts", "utf8");
const seedPairs = new Set();
for (const m of src.matchAll(/productId:\s*"([^"]+)",\s*store:\s*"([^"]+)"/g)) {
  seedPairs.add(m[1] + "|" + m[2]);
}

function norm(s) {
  let t = (s || "")
    .toLowerCase()
    .replace(/c(\d{2})(8|16|24|32|48|64)g\b/g, "c$1 $2gb") // ADATA LANCER AX5U6000C3032G: capacity fused in model -> split before g→gb rule
    .replace(/((?:[248]|0[48]|1[26]|2[24]|3[26]|4[28]|6[24]))g\b/g, "$1gb") // 8g/08g/16g/32g -> gb (not 5600g!)
    .replace(/(\d+)\s?go\b/g, "$1gb") // 08go/240go/500go -> gb
    .replace(/(\d)\s?to\b/g, "$1tb")
    .replace(/(\d+)\s?zh\b/gi, "$1hz") // 120ZH/144ZH (FR marketplace Hz spelling) -> hz
    .replace(/(\d+)\s*hz\b/gi, "$1hz") // 144 Hz / 165 Hz / 240 Hz -> 144hz / 165hz
    .replace(/(\d{1,2}(?:\.\d)?)\s*["”]\b/g, "$1 pouce") // 24" / 27" -> 24 pouce
    .replace(/(\d{3,4})\s*(?:watts?|w)\b/gi, "$1w") // 650 W / 750 watt / 750watts -> 650w / 750w
    .replace(/(\d+)\s*pouces?\b/g, "$1 pouce") // 24POUCES (glued size) -> 24 pouce (word-matchable for Hz/size rules)
    .replace(/\b(\d{1,2})t\b/g, "$1tb") // 1T/2T/4T (FR shorthand) -> tb (1-2 digits only: 7200T/MIN RPM specs must not become 7200tb)
    .replace(/((?:[248]|0[48]|1[26]|2[24]|3[26]|4[28]|6[24]))\s+g\b/g, "$1gb") // 8 G/16 G (spaced lone-g) -> gb; allowlist: 5600 g untouched
    .replace(/(\d+)\s*watts?\b/g, "$1w") // 750 watt/750watts -> 750w (before PSU-model map so "750 watt" stays clean)
    .replace(/(\d+)\s+(gb|tb)\b/g, "$1$2") // 16 GB / 1 TB -> 16gb/1tb (spaced-unit recall win)
    .replace(/m\.2/g, "m2"); // m.2 -> m2 (word-matchable)
  // PSU-model map (CX750->750w) ONLY on PSU-smelling titles: the same pattern
  // eats storage models (SN850X->sn850w, MX500->mx500w, 980 PRO->980pw),
  // destroying the tokens their own rules need. Bare "CX750" with no PSU
  // context keeps its identity (psu rules also carry model tokens).
  if (/watt|80\s*plus|bronze|gold|platinium|platinum|modulaire|modular|alimentation|\bpsu\b|\batx\b|\bsfx\b/i.test(t)) {
    t = t.replace(/(^|[^a-z0-9])([a-z]{0,3})(400|450|500|550|600|650|700|750|800|850|1000|1200|1250|1300)(p|m|b|d|n|x|s|bn|gs|gl|gm|plus)?\b/g, "$1$2$3w"); // CX750/PN1000M/PL800/A750BN/GP650 -> 750w (digit-prefixed 1650/5600x safe)
  }
  return t
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
  { id: "cpu-i5-12600k", cat: "cpu", all: ["12600k"], none: ["12600kf", "laptop", "notebook"] },
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
  { id: "cpu-r5-5500", cat: "cpu", all: ["5500"], any: ["ryzen", "r5", "amd", "cpu", "processor", "core"], none: ["5500gt", "5500x3d", "5500u", "5500m", "rx", "xt", "laptop", "notebook"] },
  { id: "cpu-r5-3600", cat: "cpu", all: ["3600"], none: ["3600x", "3600xt", "laptop", "notebook"] },
  { id: "cpu-r5-4500", cat: "cpu", all: ["4500"], any: ["ryzen", "r5", "amd", "cpu", "processor"], none: ["laptop", "notebook"] },
  { id: "cpu-r7-5700x3d", cat: "cpu", all: ["5700x3d"], none: ["laptop", "notebook"] },
  { id: "cpu-i5-12600kf", cat: "cpu", all: ["12600kf"], none: ["laptop", "notebook"] },
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
  { id: "cooler-ml240-core", cat: "cooler", all: ["masterliquid", "240"], none: ["atmos"] },
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
  { id: "cooler-tt120", cat: "cooler", all: ["thermaltake"], none: ["connecteur", "connector", "fitting", "fill", "raccord", "embout", "extension", "adaptateur", "adapter", "barbs", "compression", "petg", "controller", "tube", "reservoir", "pompe", "pump", "radiator", "frio", "ux100", "thoughair", "pour cpu", "w2"] },
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
  { id: "cooler-deepcool-le720", cat: "cooler", all: ["le720"], none: ["le520", "le500", "laptop", "notebook"] },
  { id: "cooler-peerless-120", cat: "cooler", all: ["peerless"], none: ["laptop", "notebook"] },
  { id: "cooler-assassin-x120", cat: "cooler", all: ["assassin"], any: ["x120", "ax120", "120 se", "refined"], none: ["peerless", "phantom", "iv", "laptop", "notebook"] },
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
  { id: "mobo-x570", cat: "motherboard", all: ["x570"], none: ["rx", "radeon", "gpu", "laptop", "notebook"] },
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
  { id: "ram-64gb-d5-6000", cat: "ram", all: ["64gb", "ddr5"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-48gb-d5-6000", cat: "ram", all: ["48gb", "ddr5"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-24gb-d5", cat: "ram", all: ["24gb", "ddr5"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-32gb-d5-6400", cat: "ram", all: ["32gb", "ddr5", "6400"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-32gb-d5-6000", cat: "ram", all: ["32gb", "ddr5", "6000"], none: ["6400", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-32gb-d5-5600", cat: "ram", all: ["32gb", "ddr5", "5600"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-delta-32-d5", cat: "ram", all: ["32gb", "ddr5"], none: ["5600", "6000", "6400", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-16gb-d5-6400", cat: "ram", all: ["16gb", "ddr5", "6400"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-16gb-d5-6000", cat: "ram", all: ["16gb", "ddr5", "6000"], none: ["6400", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-96gb-d5", cat: "ram", all: ["48gb", "ddr5"], any: ["96gb"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-lexar-thor-16gb-3200", cat: "ram", all: ["lexar", "thor"], any: ["16gb", "16g", "2x8gb", "2x8g"], none: ["32gb", "32g", "64gb", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-lexar-thor-32gb-3200", cat: "ram", all: ["lexar", "thor"], any: ["32gb", "32g", "2x16gb", "2x16g"], none: ["16gb", "16g", "64gb", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-lexar-ares-32gb-6000", cat: "ram", all: ["lexar", "ares"], any: ["32gb", "32g", "6000", "ddr5"], none: ["16gb", "16g", "64gb", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-16gb-d5-5600", cat: "ram", all: ["16gb", "ddr5", "5600"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-vengeance-16-d5", cat: "ram", all: ["16gb", "ddr5"], none: ["32gb", "5600", "6000", "6400", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-8gb-d5-5600", cat: "ram", all: ["8gb", "ddr5"], none: ["16gb", "32gb", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-32gb-d4-3600", cat: "ram", all: ["32gb", "ddr4", "3600"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-vengeance-32-d4", cat: "ram", all: ["32gb", "ddr4"], none: ["3600", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-value-8-d4", cat: "ram", all: ["8gb"], any: ["3200", "2666", "2400"], none: ["16gb", "32gb", "3600", "4800", "5600", "6000", "ddr5", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-vengeance-16-d5", cat: "ram", all: ["16gb"], any: ["4800", "5600"], none: ["32gb", "6000", "6400", "ddr4", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-16gb-d4-3600", cat: "ram", all: ["16gb", "ddr4", "3600"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-vengeance-16-d4", cat: "ram", all: ["16gb", "ddr4"], none: ["32gb", "3600", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-8gb-d4-3600", cat: "ram", all: ["8gb", "ddr4", "3600"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-value-8-d4", cat: "ram", all: ["8gb", "ddr4"], none: ["16gb", "32gb", "3600", "laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-4gb-d4-2666", cat: "ram", all: ["4gb", "ddr4"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ram-8gb-d3-1600", cat: "ram", all: ["ddr3"], none: ["laptop", "lap", "sodimm", "notebook", "portable", "portatif"] },
  { id: "ssd-970evo-1tb", cat: "ssd", all: ["970", "1tb"] },
  { id: "ssd-sn580-1tb", cat: "ssd", all: ["sn580"] },
  { id: "ssd-980pro-1tb", cat: "ssd", all: ["980pro"], none: ["laptop", "notebook"] },
  { id: "ssd-990pro-2tb", cat: "ssd", all: ["990pro", "2tb"], none: ["laptop", "notebook"] },
  { id: "ssd-990pro-2tb", cat: "ssd", all: ["990pro"], any: ["2tb"], none: ["laptop", "notebook"] },
  { id: "ssd-sn850-1tb", cat: "ssd", all: ["sn850"], none: ["sn850w", "sn850x", "laptop", "notebook"] },
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
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["1tb", "nvme"], none: ["nv3", "nv2", "nm620", "nm710", "nm790", "sn850", "sn770", "sn580", "980", "990", "kc3000", "legend", "sata", "laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["1tb"], any: ["m2"], none: ["nv3", "nv2", "nm620", "nm710", "nm790", "sn850", "sn770", "sn580", "980", "990", "kc3000", "legend", "sata", "hdd", "surveillance", "laptop", "notebook"] },
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
  { id: "ssd-nv3-500gb", cat: "ssd", all: ["nv3"], any: ["500gb", "512gb", "500g", "512g"], none: ["1tb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nv3-1tb", cat: "ssd", all: ["nv3"], any: ["1tb", "1000gb", "1024gb"], none: ["500gb", "512gb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nv3-1tb", cat: "ssd", all: ["nv3"], none: ["500gb", "512gb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nv2-1tb", cat: "ssd", all: ["nv2"], any: ["1tb", "1000gb", "1024gb"], none: ["500gb", "512gb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nm620-512gb", cat: "ssd", all: ["nm620"], any: ["500gb", "512gb", "500g", "512g"], none: ["1tb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nm790-1tb", cat: "ssd", all: ["nm790"], any: ["1tb", "1000gb", "1024gb"], none: ["2tb", "4tb", "laptop", "notebook"] },
  { id: "ssd-nm790-2tb", cat: "ssd", all: ["nm790"], any: ["2tb", "2000gb", "2048gb"], none: ["1tb", "4tb", "laptop", "notebook"] },
  { id: "ssd-nv3-2tb", cat: "ssd", all: ["nv3"], any: ["2tb", "2000gb", "2048gb"], none: ["500gb", "512gb", "1tb", "laptop", "notebook"] },
  { id: "ssd-netac-nv3000-1tb", cat: "ssd", all: ["netac"], any: ["nv3000", "3000"], none: ["nv5000", "nv7000", "250gb", "500gb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nm620-1tb", cat: "ssd", all: ["nm620"], none: ["256gb", "512gb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nm710-1tb", cat: "ssd", all: ["nm710"], none: ["256gb", "512gb", "2tb", "laptop", "notebook"] },
  { id: "ssd-nvme-1tb-g4", cat: "ssd", all: ["gen4"], any: ["1tb"], none: ["512gb", "256gb", "2tb", "sata", "laptop", "notebook"] },
  { id: "ssd-sata-120gb", cat: "ssd", all: ["sata", "120gb"], none: ["nvme", "m2", "hdd", "laptop", "notebook"] },
  { id: "ssd-sata-360gb", cat: "ssd", all: ["sata", "360gb"], none: ["nvme", "m2", "hdd", "laptop", "notebook"] },
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
    { id: "gpu-rx5500xt-4gb", cat: "gpu", all: ["5500xt"], any: ["4gb", "4g", "4go"], none: ["8gb", "8g", "8go", "laptop", "notebook", "portable"] },
  { id: "gpu-rx5500xt-8gb", cat: "gpu", all: ["5500xt"], none: ["4gb", "4g", "4go", "laptop", "notebook", "portable"] },
  { id: "gpu-rx5500-4gb", cat: "gpu", all: ["5500"], none: ["5500xt", "ryzen", "r5", "cpu", "5500u", "5500m", "laptop", "notebook", "portable"] },
  { id: "gpu-rx590-8gb", cat: "gpu", all: ["590"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx570-4gb", cat: "gpu", all: ["570"], any: ["4gb", "4g", "4go"], none: ["8gb", "8g", "8go", "5700", "laptop", "notebook", "portable"] },
  { id: "gpu-rx570-8gb", cat: "gpu", all: ["570"], none: ["4gb", "4g", "4go", "5700", "laptop", "notebook", "portable"] },
  { id: "gpu-gtx1650s-4gb", cat: "gpu", any: ["1650 super", "1650super", "1650s"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx580-4gb", cat: "gpu", all: ["580"], any: ["4gb", "4g", "4go"], none: ["8gb", "8g", "8go", "laptop", "notebook", "portable"] },
  { id: "gpu-rx580-8gb", cat: "gpu", any: ["rx 580", "rx580", "580 8gb", "580 8g", "580 8go", "2048sp"], none: ["laptop", "notebook", "portable"] },
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
  { id: "gpu-rtx5060ti-16gb", cat: "gpu", all: ["5060ti", "16gb"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx5060ti-8gb", cat: "gpu", all: ["5060ti"], none: ["16gb", "laptop", "notebook", "portable"] },
  { id: "gpu-rtx4070s-12gb", cat: "gpu", all: ["4070super"], none: ["laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx4070tis-16gb", cat: "gpu", all: ["4070tisuper"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-gt1030-4gb", cat: "gpu", all: ["1030"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-arc-b580-12gb", cat: "gpu", all: ["b580"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-arc-a750-8gb", cat: "gpu", all: ["a750"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-arc-a580-8gb", cat: "gpu", all: ["a580"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-arc-a380-6gb", cat: "gpu", all: ["a380"], none: ["laptop", "notebook", "portable"] },
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
  { id: "gpu-gtx1660-6gb", cat: "gpu", all: ["1660"], none: ["super", "ti", "1660s", "laptop", "notebook", "portable"] },
  { id: "gpu-gtx1650-4gb", cat: "gpu", all: ["1650"], none: ["super", "ti", "1650s", "laptop", "notebook", "portable"] },
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
    { id: "gpu-rtx3050-6gb", cat: "gpu", all: ["3050"], any: ["6gb", "6g", "6go"], none: ["8gb", "8g", "8go", "laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx3050-8gb", cat: "gpu", all: ["3050"], any: ["8gb", "8g", "8go"], none: ["6gb", "6g", "6go", "laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx3050-8gb", cat: "gpu", all: ["3050"], none: ["6gb", "6g", "6go", "laptop", "notebook", "portable", "ti"] },
  { id: "gpu-rtx4080s-16gb", cat: "gpu", all: ["4080super"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx4090-24gb", cat: "gpu", all: ["4090"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rtx5090-32gb", cat: "gpu", all: ["5090"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx9060xt-16gb", cat: "gpu", all: ["9060xt", "16gb"], none: ["laptop", "notebook", "portable"] },
  { id: "gpu-rx9060xt-8gb", cat: "gpu", all: ["9060xt"], none: ["16gb", "laptop", "notebook", "portable"] },
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
  { id: "case-xigmatek-aura", cat: "case", all: ["xigmatek"], any: ["aura", "gaming", "aquarius", "omero", "endorphin", "anubis", "master", "case", "boitier", "chassis", "tour"], none: ["psu", "alimentation", "cooler", "fan", "laptop", "notebook"] },
  { id: "case-mars", cat: "case", all: ["mars"], any: ["case", "boitier", "chassis", "tour", "mc", "mcv", "mcp", "gaming"], none: ["mpb", "mpiii", "mpvu", "psu", "alimentation", "power", "clavier", "souris", "mouse", "keyboard", "cooler", "laptop", "notebook"] },
  { id: "case-gamemax", cat: "case", all: ["gamemax"], any: ["case", "boitier", "chassis", "tour", "ninja", "optical", "brufen", "abyss", "nova", "expedition", "diamond", "vista", "moonlight"], none: ["psu", "alimentation", "power", "vp", "gmx", "ecran", "monitor", "ventilateur", "fan", "laptop", "notebook"] },
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
  { id: "case-phanteks", cat: "case", all: ["phanteks"], any: ["case", "boitier", "chassis", "tour", "eclipse", "evolv", "nv5", "nv7", "nv9", "xt", "g360a", "p300", "p400", "p500"], none: ["fan", "cable", "psu", "cooler", "laptop", "notebook"] },
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
  { id: "case-antec", cat: "case", all: ["antec"], any: ["case", "boitier", "chassis", "tour", "nx", "ax", "cx", "p20", "c8", "flux", "performance", "torque"], none: ["atom", "csk", "vp", "hcg", "ne", "psu", "alimentation", "power", "cooler", "fan", "symphony", "laptop", "notebook"] },
  { id: "case-gc7", cat: "case", all: ["talos"] },
  { id: "case-ch560", cat: "case", all: ["ch690"] },
  { id: "case-ch560", cat: "case", all: ["ch270"] },
  { id: "case-cg580", cat: "case", all: ["cg530"] },
  { id: "case-gc7", cat: "case", all: ["gcm10"] },
  { id: "case-havit", cat: "case", all: ["havit"], any: ["case", "boitier", "chassis", "tour"], none: ["watercooling", "cooler", "f2002", "f2003", "f2005", "clavier", "souris", "keyboard", "mouse", "casque", "headset", "laptop", "notebook"] },
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
  
  // Popular Algerian Market PSUs
  { id: "psu-mwe650-b", cat: "psu", all: ["mwe"], any: ["650w", "650", "mwe650", "v2", "v3", "bronze"] },
  { id: "psu-antec-atom550", cat: "psu", all: ["550w"], any: ["antec", "atom", "b550", "vp550"], none: ["motherboard", "carte mere", "b450", "b650"] },
  { id: "psu-antec-atom650", cat: "psu", all: ["650w"], any: ["antec", "atom", "b650", "csk650"], none: ["motherboard", "carte mere", "b450", "b550"] },
  { id: "psu-redragon-rgps500", cat: "psu", all: ["redragon", "500w"], any: ["rgps", "bronze", "80+"] },
  { id: "psu-redragon-rgps600", cat: "psu", all: ["redragon", "600w"], any: ["rgps", "bronze", "80+"] },
  { id: "psu-redragon-rgps750", cat: "psu", all: ["redragon", "750w"], any: ["rgps", "gold", "bronze"] },
  { id: "psu-redragon-rgps850", cat: "psu", all: ["redragon", "850w"], any: ["rgps", "gold"] },
  { id: "psu-mars-mpb550", cat: "psu", all: ["mars", "550w"], any: ["mpb", "gaming", "bronze"] },
  { id: "psu-mars-mpb650", cat: "psu", all: ["mars", "650w"], any: ["mpb", "gaming", "bronze"] },
  { id: "psu-mars-mpb750", cat: "psu", all: ["mars", "750w"], any: ["mpb", "gaming", "bronze"] },
  { id: "psu-mars-mpb850", cat: "psu", all: ["mars", "850w"], any: ["mpb", "gaming", "bronze"] },
  { id: "psu-1stplayer-ngdp750", cat: "psu", all: ["750w"], any: ["1stplayer", "first player", "ngdp", "steampunk", "ha750"] },
  { id: "psu-1stplayer-ngdp850", cat: "psu", all: ["850w"], any: ["1stplayer", "first player", "ngdp", "steampunk", "ha850"] },
  { id: "psu-cougar-vte600", cat: "psu", all: ["cougar", "600w"], any: ["vte", "stc", "bronze", "600"] },
  { id: "psu-cougar-xtc650", cat: "psu", all: ["cougar", "650w"], any: ["xtc", "vte", "650"] },
  { id: "psu-aerocool-lux550", cat: "psu", all: ["aerocool", "550w"], any: ["lux", "vx", "cylon", "bronze"] },
  { id: "psu-aerocool-lux650", cat: "psu", all: ["aerocool", "650w"], any: ["lux", "vx", "cylon", "bronze"] },
  { id: "psu-aerocool-lux750", cat: "psu", all: ["aerocool", "750w"], any: ["lux", "vx", "cylon", "bronze"] },
  { id: "psu-seasonic-b12-650", cat: "psu", all: ["seasonic", "650w"], any: ["b12", "s12", "g12", "bronze"] },
  { id: "psu-seasonic-focus750", cat: "psu", all: ["seasonic", "750w"], any: ["focus", "gx750", "gold", "plus gold"] },
  { id: "psu-deepcool-pf550", cat: "psu", all: ["deepcool", "550w"], any: ["pf550", "pf550d"] },
  { id: "psu-deepcool-pf650", cat: "psu", all: ["deepcool", "650w"], any: ["pf650", "pf650d"] },
  { id: "psu-deepcool-pf750", cat: "psu", all: ["deepcool", "750w"], any: ["pf750", "pf750d"] },
  { id: "psu-deepcool-pl650d", cat: "psu", all: ["deepcool", "650w"], any: ["pl650", "pl650d"] },
  { id: "psu-deepcool-pl750d", cat: "psu", all: ["deepcool", "750w"], any: ["pl750", "pl750d"] },
  { id: "psu-1stplayer-black-sir-500w", cat: "psu", all: ["500w"], any: ["black sir", "ps 500", "ps500"] },
  { id: "psu-1stplayer-black-sir-600w", cat: "psu", all: ["600w"], any: ["black sir", "ps 600", "ps600"] },
  { id: "psu-gamemax-gp650", cat: "psu", all: ["gamemax", "650w"], any: ["gp650", "gp 650", "gp"] },
  { id: "psu-deepcool-pk550d", cat: "psu", all: ["deepcool", "550w"], any: ["pk550", "pk550d", "pl550", "bronze"] },
  { id: "psu-deepcool-pk650d", cat: "psu", all: ["deepcool", "650w"], any: ["pk650", "pk650d", "pl650", "bronze"] },
  { id: "psu-deepcool-pk750d", cat: "psu", all: ["deepcool", "750w"], any: ["pk750", "pk750d", "pl750", "bronze"] },
  { id: "psu-deepcool-pn750m", cat: "psu", all: ["deepcool", "750w"], any: ["pn750", "pn750m", "gold", "pcie 5", "pcie5"] },
  { id: "psu-deepcool-pn850m", cat: "psu", all: ["deepcool", "850w"], any: ["pn850", "pn850m", "gold", "pcie 5", "pcie5"] },
  { id: "psu-fsp-hyper650", cat: "psu", all: ["fsp"], any: ["hyper", "hydro", "650w", "700w"] },
  { id: "psu-thermaltake-smart600", cat: "psu", all: ["thermaltake", "600w"], any: ["smart", "rgb", "tr2"] },

  // Generic PSU Fallbacks
  { id: "psu-450-b", cat: "psu", all: ["450w"] },
  { id: "psu-400-b", cat: "psu", all: ["400w"] },
  { id: "psu-500-b", cat: "psu", all: ["500w"] },
  { id: "psu-550-b", cat: "psu", all: ["550w"] },
  { id: "psu-600-b", cat: "psu", all: ["600w"] },
  { id: "psu-650-gold", cat: "psu", all: ["650w"], any: ["gold", "rm650", "gx650", "ud650", "focus 650", "80 plus gold", "80plus gold", "80+ gold"], none: ["bronze", "white"] },
  { id: "psu-650-b", cat: "psu", all: ["650w"], none: ["gold"] },
  { id: "psu-700-b", cat: "psu", all: ["700w"] },
  { id: "psu-750-gold", cat: "psu", all: ["750w"], any: ["gold", "rm750", "rm750e", "rm750x", "gx750", "ud750", "pq750", "a750gl", "focus 750", "80 plus gold", "80plus gold", "80+ gold"], none: ["bronze", "white"] },
  { id: "psu-750-b", cat: "psu", all: ["750w"], any: ["bronze", "m1 750", "a750", "80+", "80 plus", "80plus"], none: ["gold"] },
  { id: "psu-750-b", cat: "psu", all: ["750w"], none: ["gold"] },
  { id: "psu-800-gold", cat: "psu", all: ["800w"], any: ["gold", "vortex", "rx 800", "rx-800", "80 plus gold", "80plus gold", "80+ gold"] },
  { id: "psu-850-gold", cat: "psu", all: ["850w"], any: ["gold", "rm850", "rm850e", "rm850x", "gx850", "ud850", "pq850", "a850gl", "focus 850", "80 plus gold", "80plus gold", "80+ gold"], none: ["bronze", "white"] },
  { id: "psu-850-b", cat: "psu", all: ["850w"], any: ["bronze", "80+", "80 plus", "80plus"], none: ["gold"] },
  { id: "psu-850-b", cat: "psu", all: ["850w"], none: ["gold"] },
  { id: "psu-1000-gold", cat: "psu", all: ["1000w"], any: ["gold", "rm1000", "gx1000", "ud1000", "a1000", "focus 1000", "80 plus gold", "80plus gold", "80+ gold"], none: ["bronze", "white"] },
  { id: "psu-1050-gold", cat: "psu", any: ["1050w", "1050"] },
  { id: "psu-1200-gold", cat: "psu", all: ["1200w"] },
  { id: "psu-1250-gold", cat: "psu", all: ["1250w"] },
  { id: "psu-1300-plat", cat: "psu", all: ["1300w"] },
  // ---- Brand / Model Specific Monitor Rules (EVALUATED FIRST) ----
  // MATOS Katana & MSG
  { id: "mon-matos-katana", cat: "monitor", all: ["matos", "katana"], any: ["24", "165", "180", "ips"], none: ["27", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-matos-katana27", cat: "monitor", all: ["matos", "katana"], any: ["27", "240"], none: ["49", "laptop", "tv", "televiseur"] },
  { id: "mon-matos-katana", cat: "monitor", all: ["katana"], any: ["matos", "ecran"], none: ["27", "240", "49", "gf66", "gf76", "laptop", "tv", "televiseur"] },
  { id: "mon-matos-msg24", cat: "monitor", all: ["matos"], any: ["msg24", "msg 24", "msg-24", "shooter"], none: ["msg27", "katana", "27", "32", "laptop", "tv", "televiseur"] },
  { id: "mon-matos-msg27", cat: "monitor", all: ["matos"], any: ["msg27", "msg 27", "msg-27", "delta", "scorpio", "storm", "msg2712", "msg 273"], none: ["msg24", "katana", "24", "laptop", "tv", "televiseur"] },
  { id: "mon-matos-msg24", cat: "monitor", any: ["msg24", "msg 24", "msg-24"], none: ["msg27", "katana", "27", "32", "laptop", "tv", "televiseur"] },
  { id: "mon-matos-msg27", cat: "monitor", any: ["msg27", "msg 27", "msg-27", "msg2712", "msg 273"], none: ["msg24", "katana", "24", "laptop", "tv", "televiseur"] },

  // Xiaomi & Redmi
  { id: "mon-xiaomi-g24", cat: "monitor", any: ["g24i", "g24", "g 24"], all: ["xiaomi"], none: ["redmi", "27", "pad", "tablet", "laptop", "tv", "televiseur"] },
  { id: "mon-xiaomi-g24", cat: "monitor", all: ["g24i"], none: ["redmi", "27", "pad", "tablet", "laptop", "tv", "televiseur"] },
  { id: "mon-xiaomi-g27", cat: "monitor", any: ["g27i", "g27", "g 27"], all: ["xiaomi"], none: ["curve", "incurv", "pad", "tablet", "laptop", "tv", "televiseur"] },
  { id: "mon-xiaomi-g27", cat: "monitor", all: ["g27i"], none: ["curve", "incurv", "pad", "tablet", "laptop", "tv", "televiseur"] },
  { id: "mon-xiaomi-curve30", cat: "monitor", any: ["xiaomi", "mi"], any: ["curve 30", "curved 30", "wfhd"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-redmi-g24", cat: "monitor", all: ["redmi"], any: ["g24", "g 24", "165hz", "180hz"], none: ["laptop", "tv", "televiseur"] },

  // Dahua
  { id: "mon-dahua-lm24", cat: "monitor", all: ["dahua"], any: ["lm24", "lm24-e231", "e231", "24"], none: ["27", "laptop", "tv", "televiseur"] },
  { id: "mon-dahua-lm27", cat: "monitor", all: ["dahua"], any: ["lm27", "lm27-e231", "e231", "e240a", "27"], none: ["24", "laptop", "tv", "televiseur"] },

  // Redragon
  { id: "mon-redragon-ruby", cat: "monitor", all: ["redragon"], any: ["ruby", "gm24", "gm-24"], none: ["emerald", "27", "laptop", "tv", "televiseur"] },
  { id: "mon-redragon-emerald", cat: "monitor", all: ["redragon"], any: ["emerald", "gm27", "gm-27"], none: ["ruby", "24", "laptop", "tv", "televiseur"] },

  // Samsung Odyssey
  { id: "mon-samsung-g3", cat: "monitor", all: ["odyssey"], any: ["g3", "g30", "g32", "lf24g3", "ls24ag3", "24"], none: ["g4", "g5", "g7", "g8", "g9", "27", "32", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-samsung-g5", cat: "monitor", all: ["odyssey"], any: ["g5", "g50", "g55", "lc27g5", "ls27cg5", "27"], none: ["g3", "g4", "g7", "g8", "g9", "32", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-samsung-g3", cat: "monitor", any: ["lf24g3", "ls24ag3"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-samsung-g5", cat: "monitor", any: ["lc27g5", "ls27cg5"], none: ["laptop", "tv", "televiseur"] },

  // LG UltraGear
  { id: "mon-lg-ultragear24", cat: "monitor", all: ["ultragear"], any: ["24", "24gn", "24gs", "24gq", "24mr"], none: ["27", "32", "laptop", "tv", "televiseur"] },
  { id: "mon-lg-ultragear27", cat: "monitor", all: ["ultragear"], any: ["27", "27gn", "27gp", "27gr", "27gs"], none: ["24", "32", "laptop", "tv", "televiseur"] },

  // AOC Gaming
  { id: "mon-aoc-24g4", cat: "monitor", any: ["24g4", "24g4e", "24g4x", "24g4hre", "24g2", "24g2sp", "24g2se"], none: ["27", "laptop", "tv", "televiseur"] },
  { id: "mon-aoc-27g4", cat: "monitor", any: ["27g4", "27g42e", "27g4x", "27g2", "27g2sp"], none: ["24", "c27g4", "c27g4zxe", "laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", any: ["c27g4zxe", "c27g4", "ag276qkd"], none: ["24", "laptop", "tv", "televiseur"] },
  { id: "mon-24-120", cat: "monitor", all: ["24b31h"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-144", cat: "monitor", all: ["24b36x"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-24-280", cat: "monitor", any: ["cs25g", "25g3", "25g4"], none: ["27", "laptop", "tv", "televiseur"] },
  { id: "mon-49-superwide", cat: "monitor", all: ["pd49"], none: ["laptop", "tv", "televiseur"] },

  // ASUS TUF Gaming
  { id: "mon-asus-vg249", cat: "monitor", any: ["vg249", "vg249q", "vg249q1a", "vg249q3a", "vg249qm5a"], none: ["27", "laptop", "tv", "televiseur"] },
  { id: "mon-asus-vg279", cat: "monitor", any: ["vg279", "vg279q", "vg279q1a", "vg279q3a", "vg279q5r"], none: ["24", "laptop", "tv", "televiseur"] },
  { id: "mon-25-120", cat: "monitor", all: ["va249hg"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-qhd180", cat: "monitor", any: ["xg32wcms", "vg32vqm5b"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-4k", cat: "monitor", any: ["vg27uq1a", "pg27ucdm", "xg27ucg"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", any: ["xg279cns", "xg27acdng", "vg27aqml1a"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", any: ["vg27aql5a", "vg27aql3a"], none: ["laptop", "tv", "televiseur"] },

  // BenQ ZOWIE
  { id: "mon-benq-xl2411k", cat: "monitor", any: ["xl2411", "xl2411k", "xl2411p"], none: ["xl2546", "xl2566", "laptop", "tv", "televiseur"] },
  { id: "mon-benq-xl2546k", cat: "monitor", any: ["xl2546", "xl2546k", "xl2546x", "xl2566", "xl2566k", "xl2540"], none: ["xl2411", "laptop", "tv", "televiseur"] },
  { id: "mon-27-100", cat: "monitor", all: ["gw2790"], none: ["laptop", "tv", "televiseur"] },

  // ViewSonic, Koorui, Titan Army, GameMax, Philips
  { id: "mon-viewsonic-vx24", cat: "monitor", all: ["viewsonic"], any: ["vx24", "vx2479", "omni", "vx2418", "vx2428", "24"], none: ["27", "32", "laptop", "tv", "televiseur"] },
  { id: "mon-koorui-24e4", cat: "monitor", all: ["koorui"], any: ["24e4", "24e3", "24", "165hz", "180hz"] },
  { id: "mon-titan-27qhd", cat: "monitor", all: ["titan"], any: ["army", "p27", "27", "p27a2r"] },
  { id: "mon-gamemax-24", cat: "monitor", all: ["gamemax"], any: ["gmx24", "24", "144hz", "165hz", "180hz"] },
  { id: "mon-philips-evnia24", cat: "monitor", all: ["philips"], any: ["evnia", "24", "165hz", "180hz"] },

  // MSI Models
  { id: "mon-mag255f", cat: "monitor", any: ["255f", "mag 255f", "mag255f"] },
  { id: "mon-25-300", cat: "monitor", any: ["255pxf", "255xf"] },
  { id: "mon-27-240", cat: "monitor", all: ["272f"] },
  { id: "mon-22-100", cat: "monitor", any: ["mp223", "mp223 e2"] },
  { id: "mon-24-100", cat: "monitor", any: ["mp241", "mp241 e2", "mp242a"] },
  { id: "mon-27-120", cat: "monitor", any: ["mp275", "mp275 e2", "mp271a"] },
  { id: "mon-24-180", cat: "monitor", any: ["g244f", "g244", "g2412", "g241", "g242"], none: ["g242f", "27", "laptop", "tv", "televiseur"] },
  { id: "mon-24-200", cat: "monitor", any: ["g242f", "g25f2", "gs25f2"] },
  { id: "mon-27-qhd165", cat: "monitor", any: ["g274qpf", "g274", "g272qpf"] },
  { id: "mon-34-uw", cat: "monitor", any: ["401qr", "341cqpx", "mag 401qr"] },

  // Gigabyte & Acer Models
  { id: "mon-32-4k240", cat: "monitor", any: ["fo32u2", "fo32u2p", "mo32u", "321upx", "xg32ucwg"] },
  { id: "mon-34-oled", cat: "monitor", any: ["mo34wqc"] },
  { id: "mon-24-165", cat: "monitor", all: ["kg241"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-315", cat: "monitor", any: ["31 5", "xv320qu", "ag326ud"] },
  { id: "mon-27-165", cat: "monitor", any: ["gm27", "gs27fa"] },
  { id: "mon-20-75", cat: "monitor", any: ["mp20v", "maxipower 20"] },

  // Matos named special flagships
  { id: "mon-27-4k", cat: "monitor", any: ["sa01", "sa02", "sa03", "studioart"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["matos"], any: ["neon", "msg324k"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-32-qhd180", cat: "monitor", all: ["matos"], any: ["titan", "titan 2", "cyborg", "msgv32", "msg32"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-49-superwide", cat: "monitor", all: ["matos"], any: ["space", "space 49"], none: ["laptop", "tv", "televiseur"] },

  // ---- Generic Fallback Rules by Size & Hz (EVALUATED LAST) ----
  { id: "mon-24-100", cat: "monitor", all: ["24", "100hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-120", cat: "monitor", all: ["24", "120hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-144", cat: "monitor", all: ["24", "144hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-165", cat: "monitor", all: ["24", "165hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-24-180", cat: "monitor", any: ["180hz", "180mhz"], all: ["24"], none: ["27", "32", "34", "49", "55", "65", "laptop", "tv", "televiseur"] },
  { id: "mon-24-180", cat: "monitor", all: ["180hz"], any: ["24", "23 8", "24 5", "23 6", "25"], none: ["27", "32", "34", "49", "55", "65", "laptop", "tv", "televiseur"] },
  { id: "mon-24-200", cat: "monitor", all: ["200hz"], any: ["24", "23 8", "24 5"], none: ["27", "32", "34", "49", "55", "65", "laptop", "tv", "televiseur"] },
  { id: "mon-24-280", cat: "monitor", all: ["24"], any: ["240hz", "280hz", "300hz", "310hz", "540hz"], none: ["27", "32", "34", "49", "laptop", "tv", "televiseur"] },

  { id: "mon-27-100", cat: "monitor", all: ["27", "100hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-120", cat: "monitor", all: ["27", "120hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-165", cat: "monitor", all: ["27", "165hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-180", cat: "monitor", all: ["27"], any: ["180hz", "180mhz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-200", cat: "monitor", all: ["27", "200hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-240", cat: "monitor", all: ["27", "240hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-280", cat: "monitor", all: ["27"], any: ["280hz", "300hz", "310hz", "380hz"], none: ["24", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-27-qhd165", cat: "monitor", all: ["27"], any: ["qhd", "2k", "1440p", "1440"], none: ["laptop", "tv", "televiseur", "32", "34", "49"] },
  { id: "mon-27-4k", cat: "monitor", all: ["27"], any: ["4k", "uhd", "2160"], none: ["laptop", "tv", "televiseur", "32", "34", "49"] },

  { id: "mon-office-24", cat: "monitor", all: ["24"], any: ["75hz", "60hz"], none: ["27", "32", "34", "49", "120hz", "144hz", "165hz", "180hz", "laptop", "tv", "televiseur"] },
  { id: "mon-office-22", cat: "monitor", all: ["22"], any: ["75hz", "60hz", "100hz"], none: ["24", "27", "32", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-office-s", cat: "monitor", any: ["18", "19", "20", "21"], none: ["22", "24", "25", "27", "32", "34", "40", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-22-100", cat: "monitor", all: ["22", "100hz"], none: ["24", "27", "32", "laptop", "tv", "televiseur"] },

  { id: "mon-32-qhd180", cat: "monitor", all: ["32"], any: ["180hz", "280hz", "165hz", "240hz", "qhd", "2k"], none: ["24", "27", "34", "49", "4k", "uhd", "2160", "laptop", "tv", "televiseur"] },
  { id: "mon-32-4k240", cat: "monitor", all: ["32"], any: ["4k", "uhd", "2160", "oled"], none: ["24", "27", "34", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-34-oled", cat: "monitor", all: ["34", "oled"], none: ["24", "27", "32", "49", "laptop", "tv", "televiseur"] },
  { id: "mon-34-uw", cat: "monitor", any: ["34", "40", "ultrawide", "uwqhd", "21 9", "3440"], none: ["laptop", "tv", "televiseur"] },
  { id: "mon-49-superwide", cat: "monitor", any: ["49", "32 9", "5120x1440", "dqhd"], none: ["laptop", "tv", "televiseur"] }
];



function detectTitleCategory(title) {
  if (!title) return null;
  const t = " " + norm(title) + " ";
  if (/\b(ecran|moniteur|monitor|dalle|curved|incurv[eé]|ips\s*gaming|fast\s*ips|ultragear|odyssey|zowie|katana|msg24|msg27|msg32|24g4|27g4|24g2|27g2|g24i|g27i|vg249|vg279|g242f|g25f|gs27fa|mag\s*255f|255f|272f|mp242|mp271|mp275)\b|\b\d{2,3}hz\b/i.test(t)) return "monitor";
  if (/\b(alimentation|allimentation|alim|psu|power\s*supply|bloc\s*d|boite\s*d|80\s*plus|80plus|modulaire|semi\s*modulaire|full\s*modulaire|pk550|pk650|pk750|pl550|pl650|pl750|pn650|pn750|pn850|pn1200|a650bn|a750bn|a850gl|a1000g|mpb550|mpb650|mpb750|mpb850|rgps|vte|xtc|ngdp)\b|\b(400|450|500|550|600|650|700|750|800|850|1000|1050|1200|1250|1300)w\b/i.test(t)) return "psu";
  if (/\b(boitier|boîtier|chassis|case|aquarium|tour\s*atx|m-atx\s*case|mid\s*tower|4000d|5000d|h5\s*flow|h7\s*flow|h9\s*flow|ch560|cg580|cg530|cg380|ap201|magma|infinita|meshian|hurrikan|shield\s*m100|forge\s*320|pano\s*110)\b/i.test(t)) return "case";
  if (/\b(watercooling|water\s*cooling|ventirad|cooler|refroidisseur|dissipateur|aio|ak400|ak500|ak620|ak700|ag400|ag500|ag620|le500|le520|le720|ls720|lt520|lt720|peerless|phantom\s*spirit|liquid\s*freezer|hyper\s*212)\b/i.test(t)) return "cooler";
  if (/\b(carte\s*m[eè]re|motherboard|mobo|b450|b550|b650|a520|a620|b760|h610|z790|z890|b850|x670|x870|h510|h410|h310|h110|a320|z390|z490|z590|z690)\b/i.test(t)) return "motherboard";
  if (/\b(ddr[45]|ram|m[eé]moire|spectrix|vengeance|fury\s*beast|t-force|trident)\b/i.test(t)) return "ram";
  if (/\b(ssd|nvme|m2|disque\s*dur|hdd|sn850|sn770|sn580|980\s*pro|990\s*pro|kc3000|legend|nv2|nv3|nm620|nm710|nm790)\b/i.test(t)) return "ssd";
  if (/\b(ryzen|intel\s*core|cpu|processeur|threadripper)\b|\bi[3579]-?\d{4,5}[a-z]*\b|\bultra\s*[579]\b/i.test(t)) return "cpu";
  if (/\b(rtx|gtx|radeon|geforce|gpu|carte\s*graphique)\b|\brx\s*\d{3,4}\b|\b\d{4}\s*xt\b|\barc\s*[ab]?\d{3}\b/i.test(t)) return "gpu";
  return null;
}

function detectQueryCategory(q) {
  if (!q) return "gpu";
  const low = q.toLowerCase().trim();
  if (OK_CAT[low]) return OK_CAT[low];
  if (/ecran|monit|odyssey|ultragear|zowie|matos/i.test(low)) return "monitor";
  if (/ryzen|intel|core\s*i[3579]|ultra\s*[579]|cpu\b/i.test(low)) return "cpu";
  if (/rtx|gtx|radeon|\brx\s*\d|\barc\b|gpu\b|geforce/i.test(low)) return "gpu";
  if (/b450|b550|b650|a520|a620|b760|h610|z790|z890|b850|x670|x870|carte\s*m[eè]re|motherboard/i.test(low)) return "motherboard";
  if (/ddr4|ddr5|ram\b|spectrix|vengeance|fury/i.test(low)) return "ram";
  if (/nvme|ssd\b|sn850|sn770|sn580|980\s*pro|990\s*pro|kc3000|legend|nv2|nv3/i.test(low)) return "ssd";
  if (/alim|\bpsu\b|\d{3,4}w/i.test(low)) return "psu";
  if (/boitier|case\b|chassis/i.test(low)) return "case";
  if (/cooler|watercooling|ventirad|ak400|ak620|ag400|ag620|assassin|spirit/i.test(low)) return "cooler";
  return "gpu";
}

const OK_CAT = {
  // CPU
  "ryzen 5 3600": "cpu", "r5 3600": "cpu", "ryzen 5 4500": "cpu", "r5 4500": "cpu", "ryzen 5 5600": "cpu", "ryzen 5 5600x": "cpu", "ryzen 5 5600g": "cpu", "ryzen 7 5700x": "cpu",
  "ryzen 7 5700x3d": "cpu", "ryzen 7 5800x3d": "cpu", "ryzen 5 7500f": "cpu", "ryzen 5 7600": "cpu",
  "ryzen 7 7700": "cpu", "ryzen 7 7800x3d": "cpu", "ryzen 7 9800x3d": "cpu", "ryzen 9 7900x": "cpu", "ryzen 9 7950x": "cpu",
  "ryzen 5 8400f": "cpu", "ryzen 5 8500g": "cpu", "ryzen 5 9600x": "cpu", "ryzen 7 9700x": "cpu", "ryzen 9 9900x": "cpu", "ryzen 9 9950x": "cpu",
  "i3 12100": "cpu", "i5 12400": "cpu", "i5 12600k": "cpu", "i5 12600kf": "cpu", "12600kf": "cpu", "i5 13400": "cpu", "i5 13600k": "cpu", "i5 14400": "cpu", "i5 14600k": "cpu",
  "i7 12700": "cpu", "i7 13700": "cpu", "i7 14700": "cpu", "i7 14700k": "cpu", "i9 13900k": "cpu", "i9 14900": "cpu",
  "ultra 7 265k": "cpu", "ultra 9 285k": "cpu",
  // GPU
  "rtx 3050": "gpu", "rtx 3060": "gpu", "rtx 3060 ti": "gpu", "rtx 3070": "gpu", "rtx 3080": "gpu",
  "rtx 4060": "gpu", "rtx 4060 ti": "gpu", "rtx 4070": "gpu", "rtx 4070 super": "gpu", "rtx 4070 ti": "gpu", "rtx 4080": "gpu", "rtx 4090": "gpu",
  "rtx 5060": "gpu", "rtx 5060 ti": "gpu", "rtx 5070": "gpu", "gtx 1660 super": "gpu", "gtx 1660 ti": "gpu", "gtx 1660": "gpu", "gtx 1650 super": "gpu", "1650 super": "gpu", "gtx 1650s": "gpu", "gtx 1650": "gpu",
  "rx 5500": "gpu", "rx 5500 xt": "gpu", "rx 5500 xt 8gb": "gpu", "rx 5500 xt 4gb": "gpu", "5500 xt": "gpu", "5500 xt 8gb": "gpu",
  "rx 590": "gpu", "rx 590 8gb": "gpu", "rx 570": "gpu", "rx 570 8gb": "gpu", "rx 570 4gb": "gpu", "rx 5600 xt": "gpu", "rx 5700 xt": "gpu", "rx 5700": "gpu",
  "arc b580": "gpu", "b580": "gpu", "arc a750": "gpu", "arc a580": "gpu", "arc a380": "gpu", "ryzen 5 5500": "cpu",
  "rx 580": "gpu", "rx 6600": "gpu", "rx 6650 xt": "gpu", "rx 6700 xt": "gpu", "rx 6800": "gpu",
  "rx 7600": "gpu", "rx 7700 xt": "gpu", "rx 7800 xt": "gpu", "rx 7900 xt": "gpu", "rx 7900 xtx": "gpu", "rx 9070": "gpu", "rx 9060": "gpu",
  // Motherboard
  b450: "motherboard", a520: "motherboard", b550: "motherboard", b650: "motherboard", b650m: "motherboard",
  b660: "motherboard", b760: "motherboard", b760m: "motherboard", h610: "motherboard", z790: "motherboard",
  a620: "motherboard", x670: "motherboard", b850: "motherboard", x870: "motherboard", z890: "motherboard",
  // Coolers
  ak400: "cooler", ak620: "cooler", ak500: "cooler", ag400: "cooler", ag620: "cooler",
  "peerless assassin": "cooler", "phantom spirit": "cooler", "liquid freezer": "cooler",
  "watercooling 240": "cooler", "watercooling 360": "cooler",
  // RAM
  "16gb ddr4": "ram", "32gb ddr4": "ram", "ddr4 3200": "ram", "ddr5 16gb": "ram", "ddr5 32gb": "ram", "ddr5 6000": "ram",
  // SSD
  "980 pro": "ssd", "990 pro": "ssd", "sn850x": "ssd", "sn770": "ssd", "kc3000": "ssd",
  "legend 710": "ssd", "legend 850": "ssd", "nv3": "ssd", "nv3 1tb": "ssd", "nv3 500gb": "ssd", "nv2": "ssd", "nv2 1tb": "ssd", "nm620": "ssd", "nm710": "ssd", "nvme 1tb": "ssd", "nvme 512gb": "ssd", "nvme 2tb": "ssd",
  // PSU
  "550w": "psu", "600w": "psu", "650w": "psu", "750w": "psu", "850w": "psu", "1000w": "psu",
  "alimentation 550w": "psu", "alimentation 600w": "psu", "alimentation 650w": "psu", "alimentation 750w": "psu", "alimentation 850w": "psu", "alimentation 1000w": "psu",
  // Cases
  "boitier atx": "case", "boitier gaming": "case", "boitier aquarium": "case",
  // Monitors
  "ecran": "monitor", "moniteur": "monitor", "monitor": "monitor",
  "ecran 144hz": "monitor", "ecran 165hz": "monitor", "ecran 170hz": "monitor", "ecran 180hz": "monitor",
  "ecran 200hz": "monitor", "ecran 240hz": "monitor", "ecran 260hz": "monitor", "ecran 280hz": "monitor",
  "ecran 300hz": "monitor", "ecran 310hz": "monitor", "ecran 360hz": "monitor", "ecran 540hz": "monitor",
  "ecran 60hz": "monitor", "ecran 75hz": "monitor", "ecran 100hz": "monitor", "ecran 120hz": "monitor",
  "ecran 22": "monitor", "ecran 24": "monitor", "ecran 25": "monitor", "ecran 27": "monitor",
  "ecran 32": "monitor", "ecran 34": "monitor", "ecran 49": "monitor",
  "ecran gamer": "monitor", "moniteur gaming": "monitor", "ecran gaming": "monitor",
  "ecran 2k": "monitor", "ecran 4k": "monitor", "ecran qhd": "monitor", "ecran oled": "monitor",
  "ecran 27 144hz": "monitor", "ecran 27 165hz": "monitor", "ecran 27 180hz": "monitor", "ecran 27 240hz": "monitor",
  "ecran 24 144hz": "monitor", "ecran 24 165hz": "monitor", "ecran 24 180hz": "monitor", "ecran 24 200hz": "monitor",
  "odyssey": "monitor", "ultragear": "monitor",
  "aoc 24": "monitor", "aoc 27": "monitor", "msi 24": "monitor", "msi 27": "monitor",
  "asus tuf 27": "monitor", "tuf 24": "monitor", "tuf 27": "monitor", "asus tuf 24": "monitor",
  "matos ecran": "monitor", "ecran matos": "monitor", "matos": "monitor", "matos 24": "monitor", "matos 27": "monitor", "matos 32": "monitor",
  "benq zowie": "monitor", "benq 24": "monitor", "benq 27": "monitor",
  "gigabyte 24": "monitor", "gigabyte 27": "monitor", "redragon ecran": "monitor",
};
// non-parts never stored as extras (keeps DB + bundle lean)
const EXTRA_JUNK = /laptop|notebook|macbook|printer|imprimante|scanner|projecteur|datashow|webcam|tablet|smartphone|console|manette|pate thermique|pad thermique|thermal pad|thermal paste|thermal grizzly|mastergel|tube (magma|watercooling)|ventilateur boitier|case fan|masterfan|sickleflow|mf120|fd12|pack (ventilo|fans)|support (carte|ecran)|monitor stand|vortex|graphics card support|gpu holder|support gpu|herculx|back plate|waterblock|cold series|radiator with thermal|kit .\volution|en configuration|sleeve|power extension|cable (mars|first)|8-pin male|4-pin female|zenscreen|monitor arm|ergo aas|carte pci|ddr2|controleur|controller|fan hub|riser|snowman h9|tf120|chroma|at120|wraith spire|cooling amd|ventill?ateur.*original|original.*fan|ventil+o original|ubisoft|steam key|jeu pc|elgato|capture|12pci|btc|mining|kit .\volution|en configuration|accessoire boitier|pixel|24pin|smart plug|transfo|ddr2|televiseur|television|smart tv|souris|mouse|clavier|keyboard|casque|headset|chaise|chair|gaming desk|bureau gamer|portal|facebook|tron[cç][oe]n|troncen|meuleuse|disqueuse|\bscie\b|panineuse|gaufrier|plaque\s+de\s+cuisson|grille[\s-]pain|moulinex|multismart|brandmann|perceuse|visseuse|boulonneuse|perforateur|marteau\s*piqueur|ponceuse|soudeur|soudeuse|poste\s*[aà]\s*souder|aspirateur|tondeuse|\brabot\b|compresseur|[ée]lectrog[eè]ne|onduleur|multiprise|rallonge|cuisine|kitchen|cuisson|four\b|micro[\s-]ondes|hachoir|presse[\s-]agrumes|taille[\s-]haie|d[ée]broussailleuse|fer\s+[aà]\s+repasser|s[eè]che[\s-]cheveux|marmite|cocotte|115mm|125mm|makita|dewalt|ingco|crown\b|dwt\b|total\s*tools|sodimm|so-dimm|so\s*dimm|\blap\b|pc\s*portable|portatif|pc-portable|memoires-pc-portables/i;
// ---- multi-item veto (bundle/pack/combo): tested BEFORE matchRule ----
// A price framed as several parts together ("CPU AMD RYZEN 5 3400G BOX ...
// BUNDLE ... B550", "Pack Ryzen 5 5600 + B450M") is never a standalone offer
// for any single part: matching it books a combo price onto one product's
// page (a CPU ad priced the B550 board). Vetoed rows skip matchRule and fall
// through to the existing extras path, never canonical. Genuine standalone
// store titles never contain these words (verified against live bake output).
const BUNDLE_VETO = /\bbundle\b|\bpack\b|\bcombo\b|\blot de\b/i;
// ---- "en configuration seulement" / tray-in-config veto ----
// NOT purchasable standalone: store only sells inside a full build (config).
// Booking them as solo offers shows phantom cheap prices.
const CONFIG_ONLY_VETO = /en\s+config(uration)?\s+(seulement|uniquement|only)|\(en\s+config|en\s+vente\s+en\s+config|configuration\s+seul/i;
// ---- kit upgrade / kit evolution veto ----
// Multi-part bundles: CPU+mobo combos priced together. Never a single-part price.
const KIT_VETO = /\bkit\s+(upgrade|[eé]volution|evol|\w+\s*\+)|\+\s*(carte|cm|mobo|motherboard)\b/i;
// ---- query-title relevance gate (Ouedkniss only) ----
// Ouedkniss search is fuzzy: searching "rtx 4060" returns keyboards, mice,
// RX 580s etc. Checks that listing title actually contains core query keywords.
function isQueryRelevant(query, title) {
  if (!query || !title) return false;
  const qNorm = norm(query);
  const tNorm = norm(title);
  if (!qNorm || !tNorm) return false;

  // RX 5500 query relevance guard: do not match Ryzen 5 5500 PCs
  if (/^rx\s*5500|^5500\s*xt/i.test(qNorm)) {
    if (/\bryzen\s*5?\s*5500\b/i.test(tNorm) && !/\brx\s*5500|5500\s*xt/i.test(tNorm)) return false;
  }

  const isMon = /ecran|monit|odyssey|ultragear|zowie|matos|\d{2,3}hz/i.test(qNorm);
  if (isMon) {
    if (/laptop|\blap\b|notebook|macbook|pc\s*portable|portatif|\b\d{4,5}(?:hx|hs|h|u)\b/i.test(tNorm)) return false;
    if (/\bodyssey\b/i.test(qNorm) && !/\bodyssey\b/i.test(tNorm)) return false;
    if (/\bultragear\b/i.test(qNorm) && !/\bultragear\b/i.test(tNorm)) return false;
    if (/\bzowie\b/i.test(qNorm) && !/\bzowie\b/i.test(tNorm)) return false;
    if (/\bmatos\b/i.test(qNorm) && !/\bmatos\b/i.test(tNorm)) return false;
    if (/\baoc\b/i.test(qNorm) && !/\baoc\b/i.test(tNorm)) return false;
    if (/ecran|moniteur|monitor|dalle|\b\d{2,3}hz\b|\b(22|24|25|27|32|34|49)\s*(pouce|p\b|po\b)/i.test(tNorm)) return true;
  }

  const tokens = qNorm.split(/\s+/).filter(w => w.length > 1);
  if (tokens.length === 0) return true;
  const numericTokens = tokens.filter(t => /\d/.test(t));
  const alphaTokens = tokens.filter(t => !/\d/.test(t));
  for (const nt of numericTokens) {
    if (!tNorm.includes(nt)) return false;
  }
  if (alphaTokens.length > 0) {
    const alphaMatches = alphaTokens.filter(a => tNorm.includes(a)).length;
    if (alphaMatches === 0) return false;
  }
  return true;
}
// ---- multi-category cross-contamination detector ----
// Titles mentioning 3+ component categories are full builds, not single parts.
function isCrossCategoryTitle(title) {
  const t = (title || "").toLowerCase();
  const hasCPU = /ryzen|\bi[357]-?\d{4,5}|intel\s+core|\bi\d\s+\d{4,5}/i.test(t);
  const hasGPU = /rtx\s*\d{4}|gtx\s*\d{4}|\brx\s*\d{3,4}/i.test(t);
  const hasRAM = /\d+g[bo]?\s*(ddr[45]|ram)|(ddr[45])\s*\d+g/i.test(t);
  const hasSSD = /\bssd\b|\bnvme\b/i.test(t);
  const hasMobo = /\b[bzhax]\d{3}[me]?\b/i.test(t);
  const hasPSU = /\d{3,4}\s*w\b/i.test(t);
  return [hasCPU, hasGPU, hasRAM, hasSSD, hasMobo, hasPSU].filter(Boolean).length >= 3;
}
// ---- full-PC veto: a whole tower/config priced as one part ----
const FULLPC_VETO = /config\s+pc|pc\s+(gammer|gamers?|gaming)|pc\s+complet|unit[eé]s?\s+centrale?s?|setup\s+(gamer|complet|gaming)|config\s+i\d|config(\w*)\s+(gaming|intel|amd|ryzen|r\d|i\d|gamer)|unite\s+montage|\bconfig\b.{0,30}\/|avec.{0,40}(ram|nvme|ddr)|\bforssa\b|\bpc\s+gamer\b/i;
// ---- laptop/prebuilt veto (gpu/cpu/ram/ssd rows only) ----
// Bare "nitro"/"tuf gaming" are NOT vetoed (Sapphire Nitro GPUs, ASUS TUF
// boards survive); screen sizes need a separator ([,.\s]+ not *) so "136" in
// "i5-13600K" and "1733" RAM speeds don't friendly-fire.
const LAPTOP_VETO = /laptop|\blap\b|notebook|macbook|latitude|optiplex|thinkpad|ideapad|thinkcentre|ideacentre|vivobook|zenbook|elitebook|probook|thinkbook|yoga\b|surface\s*pro|pavilion|victus|omen|legion|zephyrus|tuf\s*[af]\d{2}|acer.{0,10}nitro|nitro.{0,10}acer|nitro\s*\d|inspiron|predator|helios|razer\s*blade|blade\s*\d|\bkatana\b|\bgf\s*\d{2}\b|pulse\s*\d|cyborg\s*\d|stealth\s*\d|sword\s*\d|loq\b|\b\d{4,5}(?:hx|hs|h|u)\b|pouce|1[34567][,.\s]+[0-9]|all\s*in\s*one|sodimm|so-dimm|so\s*dimm|portable|portatif/i;
// ---- power-tool/appliance veto (GLOBAL, all categories) ----
// Catches tronçonneuses (all spellings including tronceneuse), meuleuses, grills, toasters, etc.
const TOOL_VETO = /tron[cç][oe]n|troncen|meuleuse|disqueuse|\bscie\b|scie\s*sauteuse|scie\s*circulaire|mixeur|gaufre|gaufrier|panineuse|panini|plaque\s+de\s+cuisson|sandwich|\bcaf[eé]\b|cafeti[eè]re|bouilloire|grille[\s-]pain|moulinex|multismart|brandmann|perceuse|visseuse|boulonneuse|perforateur|marteau\s*piqueur|ponceuse|soudeur|soudeuse|poste\s*[aà]\s*souder|aspirateur|tondeuse|\brabot\b|compresseur|[ée]lectrog[eè]ne|onduleur|multiprise|rallonge|cuisine|kitchen|cuisson|four\b|micro[\s-]ondes|hachoir|presse[\s-]agrumes|taille[\s-]haie|d[ée]broussailleuse|fer\s+[aà]\s+repasser|s[eè]che[\s-]cheveux|marmite|cocotte|115mm|125mm|makita|dewalt|ingco|crown\b|dwt\b|total\s*tools/i;
// Non-PC category slugs from Ouedkniss announcement URLs
const NON_PC_SLUG_VETO = /materiel-electrique|grills-panineuses|electromenager|grille-pain|outillage|bricolage|art-table|cuisine|vaisselle|jardin|auto|moto|vetement|chaussures|bebe|sport|pc-portable|pc-portables|memoires-pc-portables|pieces-detachees-pc-portable|accessoires-pc-portable/i;
// Laptop RAM markers (strictly reject SODIMM / laptop RAM from desktop catalog)
const LAPTOP_RAM_MARKERS = /\blap\b|laptop|sodimm|so-dimm|so\s*dimm|portable|portatif|pc-portable|memoires-pc-portables/i;
// Server RAM markers: reject ECC Registered / RDIMM / server memory from consumer desktop RAM
const SERVER_RAM_VETO = /\becc\b|\brdimm\b|\blrdimm\b|ecc\s*reg|\bregistered\b|pour\s+serveur|\bserveur\b|\bserver\b|poweredge|proliant|\bxeon\b|hpe\s*smartmemory/i;
// Strict computer power supply identification
const PSU_KEYWORDS = /alimentation|allimentation|\balim\b|\bpsu\b|power\s*supply|bloc\s*d\s*alim|boite\s*d\s*alim|alimentations-boitiers|80\s*plus|80plus|80\+|\bmodulaire\b|\bmodular\b|bronze|gold|platinum|titanium|\batx\b|\bsfx\b/i;
const PSU_BRANDS = /corsair|seasonic|cooler\s*master|deepcool|thermaltake|be\s*quiet|msi|asus|gigabyte|antec|fsp|aerocool|kolink|mars\s*gaming|gamemax|redragon|silverstone|nzxt|enermax|huntkey|cougar|zalman|xigmatek|sama|1stplayer|darkflash|aigo|hybrok|raidmax|segotep|inwin|chieftec|super\s*flower|evga|gamdias/i;
function isLegitPsu(title, url = "") {
  const t = String(title || "");
  const u = String(url || "");
  return PSU_KEYWORDS.test(t) || PSU_KEYWORDS.test(u) || PSU_BRANDS.test(t);
}
// ---- PSU-into-motherboard veto (motherboard rows only) ----
// Moves exactly the ANTEC ATOM B650W rows (matched via "b650") to extras.
const MOBOPSU_VETO = /psu|\balimentation\b|80\s*plus|modulaire|bronze|gold|antec|seasonic|\bfsp\b|corsair/i;
// ---- tower-prebuilt veto (all component categories) ----
// Whole towers booked as one part ("UNITE ASUS G10DK 5600X … 1660TI",
// "KIT UPGRADE 7600+B840M", "PC DE BUREAU LENOVO i5-13400"). Anchored to
// prebuilt markers so "Desktop Processor" CPU singles and "configurable"
// RGB copy survive: desktop needs a brand, config needs the "u".
const PREBUILT_VETO = /unite\s+(gamer|asus|gaming)|kit\s+upgrade|forssa|\(.*configu|configu\w*\s+(uniquement|only)|desktop\s+(hp|lenovo|dell|asus|tower|sff|neo|think|pro\b)|pc\s+(high-tech|de\s+bureau)|tour\s+gamer/i;
// Single gate, run on the RAW cleaned title BEFORE matchRule. Vetoed rows
// bypass extras caps exactly like bundles (replaces BUNDLE_VETO at call-sites).
const MONITOR_LAPTOP_VETO = /laptop|\blap\b|notebook|macbook|latitude|thinkpad|ideapad|vivobook|zenbook|elitebook|probook|thinkbook|yoga\b|surface\s*pro|pavilion|zephyrus|tuf\s*[af]\d{2}|\b\d{4,5}(?:hx|hs|h|u)\b|1[3-7][,.]\d|sodimm|so-dimm|so\s*dimm|portable|portatif|pc-portable/i;
function isVetoed(category, title, url = "") {
  if (url && NON_PC_SLUG_VETO.test(url)) return true;
  if (BUNDLE_VETO.test(title) || TOOL_VETO.test(title)) return true;
  if (CONFIG_ONLY_VETO.test(title)) return true;
  if (KIT_VETO.test(title)) return true;
  if (FULLPC_VETO.test(title) || PREBUILT_VETO.test(title)) return true;
  if (isCrossCategoryTitle(title)) return true;
  if (category === "monitor") {
    if (MONITOR_LAPTOP_VETO.test(title) || MONITOR_LAPTOP_VETO.test(url)) return true;
  } else {
    if (LAPTOP_VETO.test(title) || LAPTOP_VETO.test(url)) return true;
  }
  if (category === "ram") {
    if (LAPTOP_RAM_MARKERS.test(title) || LAPTOP_RAM_MARKERS.test(url)) return true;
    if (SERVER_RAM_VETO.test(title) || SERVER_RAM_VETO.test(url)) return true;
  }
  if (category === "cpu" && /\bxeon\b|\bepyc\b|\bopteron\b|\bitanium\b|pour\s+serveur/i.test(title)) return true;
  if (category === "motherboard") {
    if (MOBOPSU_VETO.test(title)) return true;
    if (/\bxeon\b|\bepyc\b|\bdual\s*socket\b|\blga\s*3647\b|\blga\s*4189\b|pour\s+serveur|\bserveur\b|\bserver\b|poweredge|proliant/i.test(title)) return true;
  }
  if (category === "motherboard" && MOBOPSU_VETO.test(title)) return true;
  if (category === "psu" && !isLegitPsu(title, url)) return true;
  return false;
}
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
function titleCapacities(title, category) {
  // Kit multipliers must be read from the RAW title: norm() destroys x/×/*
  // separators ("2×16 Go" -> "2 16go"), losing which number is per-stick.
  // Decimal "capacities" are speeds, never drives ("7.3GB par Sec" -> phantom
  // 3GB): strip them. Counts above 8 sticks are model numbers, not kits
  // ("SN850X 2TB" reads as 850 x 2TB without the guard).
  // IMPORTANT: Kits only apply to RAM! For GPUs ("Ventus 2X 8GB"), 2X is fan count, not kit multiplication.
  const isRam = category === "ram" || (!category && /ddr|ram|dimm|kit\b/i.test(title));
  const decRe = /\d+\s*[.,]\s*\d+\s*(tb|gb|go|to)/gi;
  const raw = " " + String(title || "").toLowerCase().replace(decRe, " ") + " ";
  const kre = /(\d+)\s*[x×*]\s*(\d+)\s*(tb|gb|go|to)|(\d+)\s*(tb|gb|go|to)\s*[x×*]\s*(\d+)/gi;
  const drop = new Set(); // per-stick sizes, never standalone capacities
  const totals = new Set(); // kit totals, always kept
  let km;
  const frUnit = (u) => (u === "tb" || u === "to" ? 1024 : 1);
  const kitOk = (n, size) => n >= 1 && n <= 8 && size > 0 && size <= 8192;
  while (isRam && (km = kre.exec(raw))) {
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
      if (isRam && kitOk(+m[1], gb(m[2], m[3]))) out.push(+m[1] * gb(m[2], m[3]));
      else out.push(gb(m[2], m[3]));
    } else if (m[4]) {
      if (isRam && kitOk(+m[6], gb(m[4], m[5]))) out.push(gb(m[4], m[5]) * +m[6]);
      else out.push(gb(m[4], m[5]));
    } else out.push(gb(m[7], m[8]));
  }
  const sane = (v) => v > 0 && v <= 32768; // absurd values (7200tb RPM fallout) are never capacities
  // Kit totals lead: a "64 Go (2x 48 Go)" title really is 96GB — the stray 64
  // must not anchor the redirect. Ranges (no kits) keep ascending order.
  const tots = [...totals].filter(sane).sort((a, b) => a - b);
  const rest = [...new Set(out.filter((v) => sane(v) && !drop.has(v)))].sort((a, b) => a - b);
  return [...tots, ...rest.filter((v) => !tots.includes(v))];
}
// Product-line tokens: shared title<->rule ownership means the match was earned.
const FAMILY_TOK = new Set(["externe", "external", "portable", "hdd", "disque", "dur", "udimm", "sodimm", "rgb"]);
// Tokens too generic to prove anything about who matched what.
const GENERIC_TOK = new Set(["ssd", "sata", "nvme", "pcie", "m2", "gen3", "gen4", "gen5", "ddr4", "ddr5"]);
function isSignalTok(x) {
  return capTokenGB(x) === null && !/^\d+$/.test(x) && !GENERIC_TOK.has(x);
}
function variantRedirect(category, title, matched, has) {
  if (category !== "ssd" && category !== "ram" && category !== "gpu") return matched;
  const caps = titleCapacities(title, category);
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
  const ordered = [...new Set(caps)]; // semantic order from titleCapacities: kit totals, then ascending
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

// Digit-start tokens (len>3) scan the space-padded normed title with a
// space-flexible pattern: the token's chars joined by \s* (precompiled per
// token). Flat-concatenation is retired — any flat occurrence is just the
// token's chars in t separated only by spaces, which \s* already covers, and
// flat destroyed the boundaries the guards need: "7800X 3D" died (flat
// "...ryzen77800x3d" trips the LEFT guard on the "7" of "ryzen 7") and
// "4080 SUPER 16G" died (flat "16gwindforce" fails \b).
// LEFT guard: the char before the match must not be 0-9, so "2500W" is not
// "500w", "14100" is not "4100" and "164gb" is not "64gb". RIGHT depends on
// the token shape. Letter-ending ("5600x","12900k","5060ti","980pro","850g",
// "200hz"): end/space, a glued suffix (ti|super|xt|xtx|gre|f|s: "12900KF"->
// "12900k", "12900KS"->"12900k") or a capacity remainder ("5060ti"+"8g"
// routes VRAM rows). Pure-digit ("5600","12400","6000","650","1050","1030"):
// end/space, "f" ("12400F"), "w" ("MWE 650W"), "pro" (vestigial, harmless),
// literal "hz" ("280 HZ" monitors; NOT h[a-z]*, so "5600H"->"5600" stays
// blocked and "GTX 950M" stays safe), m+letters ("6000MHZ","6000MT"),
// v* ("1050VA") or a capacity remainder ("GT 1030 4GB" glued as "10304gb"
// still reaches "1030"). Single-letter suffixes that change the part stay
// blocked ("5600G"!="5600", "5700X"!="5700", "12400H"!="12400",
// "5600T"!="5600"); bare "g"-units are rejected (CAP needs \d+ before g) for
// the same reason. none-tokens use the same has(), so spaced-sibling killing
// is restored: plain-2060's none "2060super" blocks "2060 SUPER", and
// plain-9900x's none "9900x3d" blocks "9900X 3D" (which had been falling into
// the 9900x pool and displacing legit rows). Accepted edge: a none "16gb" no
// longer blocks "16gbps" (rest "ps" fails the CAP); network-speed strings in
// GPU titles are rare enough to take that trade.
// Glued forms like "8pin"/"24pin" keep working: \s* matches zero spaces too,
// so the regex covers spaced titles ("24 pin") with no flat pass.
const digitRxCache = new Map();
function digitTokRx(tok) {
  let rx = digitRxCache.get(tok);
  if (!rx) {
    const body = [...tok].map((c) => (/[a-z0-9]/.test(c) ? c : "\\" + c)).join("\\s*");
    rx = new RegExp(body, "g");
    digitRxCache.set(tok, rx);
  }
  rx.lastIndex = 0;
  return rx;
}
function hasDigitTokOn(s, tok) {
  const letterEnd = /[a-z]$/.test(tok);
  const rx = digitTokRx(tok);
  let m;
  while ((m = rx.exec(s))) {
    const i = m.index;
    if (i > 0 && s[i - 1] >= "0" && s[i - 1] <= "9") continue;
    const rest = s.slice(i + m[0].length);
    if (rest === "" || rest[0] === " ") return true;
    if (letterEnd) {
      if (/^(ti|super|xt|xtx|gre|f|s)\b/.test(rest)) return true;
      if (/^\d+\s*(gb|tb|g|hz)\b/.test(rest)) return true;
    } else {
      if (/^(f|w|pro)\b/.test(rest)) return true;
      if (/^hz\b/.test(rest)) return true;
      if (/^m[a-z]+\b/.test(rest)) return true;
      if (/^v[a-z]*\b/.test(rest)) return true;
      if (/^\d+\s*(gb|tb|g)\b/.test(rest)) return true;
    }
  }
  return false;
}

// PSU wattage / monitor Hz agreement: same shape as variantRedirect's
// single-capacity check, but for W and Hz units. Redirects to a
// unit-correct rule when one exists, keeps the match otherwise.
function unitRedirect(category, title, matched, has) {
  if (category === "gpu") {
    const idVramMatch = matched.match(/-(\d+)gb$/);
    if (idVramMatch) {
      const idVram = parseInt(idVramMatch[1], 10);
      const caps = titleCapacities(title, "gpu");
      if (caps.length === 1 && caps[0] !== idVram) {
        const wantVram = caps[0];
        for (const r of RULES) {
          if (r.cat !== "gpu" || !r.id.endsWith(`-${wantVram}gb`)) continue;
          if (!(r.all || []).every(has)) continue;
          if (r.any && !r.any.some(has)) continue;
          if ((r.none || []).some(has)) continue;
          return r.id;
        }
        return null;
      }
    }
    return matched;
  }
  if (category === "motherboard") {
    const chipsets = ["b450", "b550", "b650", "b660", "b760", "b840", "b850", "b860", "a520", "a620", "h510", "h610", "h810", "z490", "z590", "z690", "z790", "z890", "x570", "x670", "x870"];
    const foundChips = chipsets.filter((c) => has(c));
    if (foundChips.length === 1) {
      const wantChip = foundChips[0];
      if (matched.includes(wantChip)) return matched;
      for (const r of RULES) {
        if (r.cat !== "motherboard" || !r.id.includes(wantChip)) continue;
        if (!(r.all || []).every(has)) continue;
        if (r.any && !r.any.some(has)) continue;
        if ((r.none || []).some(has)) continue;
        return r.id;
      }
      return null;
    }
    return matched;
  }
  if (category === "monitor") {
    // Specific brand models are canonical and must not be mutated by unitRedirect
    if (/^mon-(matos|xiaomi|redmi|dahua|redragon|samsung|lg|aoc|asus|benq|viewsonic|koorui|titan|gamemax|philips|mag255f)\b/.test(matched)) {
      return matched;
    }
    // Monitor Hz validation: never drop valid monitors using naive id numbers (e.g. mon-mag255f or mon-315)
    const t = " " + norm(title) + " ";
    const hzMatches = [...t.matchAll(/(\d{2,3})\s*hz\b/g)].map(m => +m[1]);
    if (hzMatches.length === 0) return matched;
    const wantHz = hzMatches[0];

    const CANONICAL_MONITORS = {
      "mon-20-75": { size: 20, hz: [60, 75] },
      "mon-office-s": { size: 21, hz: [60, 75] },
      "mon-office-22": { size: 22, hz: [60, 75] },
      "mon-22-100": { size: 22, hz: [100, 120] },
      "mon-office-24": { size: 24, hz: [60, 75] },
      "mon-24-100": { size: 24, hz: [100] },
      "mon-24-120": { size: 24, hz: [120] },
      "mon-24-144": { size: 24, hz: [144] },
      "mon-24-165": { size: 24, hz: [165, 170] },
      "mon-24-180": { size: 24, hz: [180] },
      "mon-24-200": { size: 24, hz: [200] },
      "mon-24-280": { size: 24, hz: [240, 260, 270, 280, 300, 310, 360, 540] },
      "mon-25-120": { size: 25, hz: [120] },
      "mon-mag255f": { size: 25, hz: [180, 200] },
      "mon-25-300": { size: 25, hz: [240, 300, 360] },
      "mon-27-100": { size: 27, hz: [60, 75, 100] },
      "mon-27-120": { size: 27, hz: [120] },
      "mon-27-165": { size: 27, hz: [144, 165, 170] },
      "mon-27-180": { size: 27, hz: [180] },
      "mon-27-200": { size: 27, hz: [200] },
      "mon-27-240": { size: 27, hz: [240] },
      "mon-27-280": { size: 27, hz: [260, 280, 300, 360, 380, 500] },
      "mon-27-qhd165": { size: 27, hz: [144, 165, 170, 180, 240, 260, 280] },
      "mon-27-4k": { size: 27, hz: [60, 144, 160, 240] },
      "mon-315": { size: 32, hz: [144, 165, 170, 180] },
      "mon-32-qhd180": { size: 32, hz: [144, 165, 170, 180, 240, 280] },
      "mon-32-4k240": { size: 32, hz: [144, 160, 240] },
      "mon-34-oled": { size: 34, hz: [144, 165, 175, 240] },
      "mon-34-uw": { size: 34, hz: [100, 120, 144, 155, 165, 175, 180, 200] },
      "mon-49-superwide": { size: 49, hz: [120, 144, 240] },
    };

    const cur = CANONICAL_MONITORS[matched];
    if (cur && cur.hz.includes(wantHz)) return matched;

    if (cur) {
      for (const [candId, spec] of Object.entries(CANONICAL_MONITORS)) {
        if (spec.size === cur.size && spec.hz.includes(wantHz)) {
          if (matched.includes("4k") && !candId.includes("4k")) continue;
          if (matched.includes("qhd") && !candId.includes("qhd") && candId !== "mon-315") continue;
          return candId;
        }
      }
    }
    return matched;
  }

  const unit = category === "psu" ? "w" : category === "cooler" ? "rad" : null;
  if (!unit) return matched;
  const t = " " + norm(title) + " ";
  let re;
  if (unit === "w") re = /(\d{3,4})\s*w\b/g;
  else if (unit === "rad") re = /(\d{3})\s*mm\b|\b(120|240|280|360|420)\b/g;

  const matches = [...t.matchAll(re)];
  const units = [...new Set(matches.map((m) => +(m[1] || m[2])))].filter(u => {
    if (unit === "rad") return [120, 240, 280, 360, 420].includes(u);
    return true;
  });

  let want = units.length === 1 ? units[0] : null;
  if (want === null && unit === "w" && units.length > 1) {
    const raw = " " + String(title || "") + " ";
    const listed = new Set(
      [...raw.matchAll(/(\d{3,4})\s*w\s*[/|,]/gi)].map((m) => +m[1])
        .concat([...raw.matchAll(/[/|,]s*(\d{3,4})\s*w/gi)].map((m) => +m[1]))
    );
    const inList = units.filter((u) => listed.has(u));
    if (inList.length >= 2) want = Math.min(...inList);
    else if (/native\s*\d+w\s*pcie|pcie\s*5|12v/i.test(raw)) want = units[0];
  }
  const idm = matched.match(/(\d{3,4})/);
  if (want === null) return matched;
  if (idm && +idm[1] === want) return matched;
  for (const r of RULES) {
    if (r.cat !== category) continue;
    const rid = (r.id.match(/(\d{3,4})/) || [])[1];
    if (!rid || +rid !== want) continue;
    const rest = (r.all || []).filter((x) => !new RegExp(`^${want}`).test(x));
    if (!rest.every(has)) continue;
    if ((r.none || []).some(has)) continue;
    return r.id;
  }
  if (idm && +idm[1] !== want) return null;
  return matched;
}
function matchRule(category, title) {
  const t = " " + norm(title) + " ";
  const words = t.split(" ").filter(Boolean);
  const flat = words.join("");
  const has = (tok) => {
    if (tok.includes(" ")) return t.includes(tok) || flat.includes(tok.replace(/ /g, ""));
    if (tok.length <= 3) return words.includes(tok); // no "ti"-in-"garantie" false hits
    if (/^[a-z]/.test(tok)) return t.includes(tok) || flat.includes(tok); // b550/sn850/gt730: unchanged
    return hasDigitTokOn(t, tok); // digit-start len>3: space-flex regex on t only, no flat pass
  };
  for (const r of RULES) {
    if (r.cat !== category) continue;
    if (!(r.all || []).every(has)) continue;
    if (r.any && !r.any.some(has)) continue;
    if ((r.none || []).some(has)) continue;
    const v = variantRedirect(category, title, r.id, has);
    return v === r.id ? unitRedirect(category, title, v, has) : v;
  }
  return null;
}

// ---- price-sanity gates (ditch total, never extras) ----
// Bands mirror lib/scrapers/validate.ts CATEGORY_BANDS so scrape-time and
// bake-time agree. Per-product band = seed median x[0.4, 2.5].
const CAT_BANDS = { cpu: [1000, 250000], cooler: [500, 90000], motherboard: [4000, 200000], ram: [1000, 300000], ssd: [800, 160000], gpu: [2000, 1500000], case: [1000, 130000], psu: [3500, 150000], monitor: [3000, 400000] };
// Stable reference: lib/data/price-meds.json (frozen medians, versioned).
// Reading them from the regenerating seed made bake oscillate (medians lag
// one bake behind and borderline rows flip-flop forever). Refresh the file
// manually when the catalog genuinely shifts, never per-bake.
const SEED_MEDS = (() => {
  try {
    const med = new Map();
    const ref = JSON.parse(fs.readFileSync("lib/data/price-meds.json", "utf8"));
    for (const [k, v] of Object.entries(ref)) if (typeof v === "number") med.set(k, v);
    if (med.size > 0) return med;
  } catch { /* fall through to seed */ }
  try {
    const seed = JSON.parse(fs.readFileSync("supabase-seed.json", "utf8"));
    const by = new Map();
    for (const o of seed.offers || []) {
      if (!o || !o.p || typeof o.d !== "number") continue;
      if (!by.has(o.p)) by.set(o.p, []);
      by.get(o.p).push(o.d);
    }
    const med = new Map();
    for (const [k, v] of by) { v.sort((a, b) => a - b); med.set(k, v[Math.floor(v.length / 2)]); }
    return med;
  } catch { return new Map(); }
})();
function isAbsurd(category, pid, price) {
  if (!price || price < 1500) return true;
  if (/^(?:1000|1111|1234|12345|123456|9999|99999|1000000)$/.test(String(price))) return true;
  const b = CAT_BANDS[category];
  if (!b) return false;
  if (price < b[0] || price > b[1]) return true;
  const m = SEED_MEDS.get(pid);
  if (!m) return false;
  return price < m * 0.55 || price > m * 1.6;
}

const BUNDLE_CATS = ["cpu", "gpu", "motherboard", "ram", "ssd", "psu", "cooler", "case", "monitor"];
function matchAnyCategory(title) {
  const hits = [];
  for (const c of BUNDLE_CATS) {
    let pid = null;
    try { pid = matchRule(c, title); } catch { pid = null; }
    if (pid) hits.push({ cat: c, pid });
  }
  return hits;
}
function splitDescriptionPrices(desc) {
  const out = [];
  for (const line of String(desc || "").split(/\r?\n/)) {
    const m = line.match(/(.{4,60}?)\s*[:\-–+]\s*(\d[\d\s.]{3,})\s*(da|dzd|dinars?)/i);
    if (!m) continue;
    const price = parseInt(m[2].replace(/[^0-9]/g, ""), 10);
    if (!price || price < 500 || price > 5000000) continue;
    out.push({ label: m[1].trim(), price });
  }
  return out;
}
// Title-only multi-family hits are weak evidence: bare numbers collide
// across families ("7600" = Ryzen CPU and DDR5-7600 speed, "G41" board vs
// fragments). A combo needs explicit bundle SYNTAX (+, /, avec, config…)
const COMBO_SYNTAX = /\s[+&]\s|[^0-9.]\s\/\s[^0-9.]|\bavec\b|\bcombo\b|\bpack\b|\bbundle\b|\bconfig\b|\bpc\s+gamer|\bpc\s+complet/i;
function isBundle(title, desc) {
  if (matchAnyCategory(title).length < 2) return false;
  const text = title + " " + (desc || "");
  if (COMBO_SYNTAX.test(text)) return true;
  // config lists without spaced syntax ("5600X/CM…/PSU", "7600+B840M"):
  // ≥2 slashes outside capacity runs ("256GB/512GB/1TB" stripped first),
  // or a glued plus. Single-part titles never look like this.
  const noCaps = title.replace(/\d+\s*(gb|tb|go|to)\b/gi, " ");
  // Port lists are not config lists ("1HDMI/1DVI/1VGA"): slashes touching
  // connectivity tokens don't count as separators.
  const slashes = (noCaps.match(/\//g) || []).length;
  const portSlashes = (noCaps.match(/(hdmi|dvi|vga|display\s?port|usb|hdcp|gpu|cpu|ram|ssd)\s*\/|\/\s*(hdmi|dvi|vga|display\s?port|usb|hdcp|gpu|cpu|ram|ssd)/gi) || []).length;
  if (slashes - portSlashes >= 2) return true;
  if (/\S\+|\+\S/.test(title)) return true;
  return false;
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
  if (!store || !category) continue;
  const storeWilaya = WILAYA[store] || "Alger";
  let extraCount = 0;
  for (const o of val.offers) {
    const title = clean(o.title);
    if (!title || !o.priceDa) continue;
    const cond = /\bused\b|occasion|r[eé]cup[eé]ration/i.test(title) ? "used" : "new";
    const isVeto = isVetoed(category, title, o.url);
    if (isBundle(title, o.description)) {
      let split = false;
      for (const part of splitDescriptionPrices(o.description)) {
        const sub = matchAnyCategory(clean(part.label));
        if (sub.length === 1 && !isAbsurd(sub[0].cat, sub[0].pid, part.price)) {
          if (seedPairs.has(sub[0].pid + "|" + store)) continue;
          matched.push({ productId: sub[0].pid, store, wilaya: storeWilaya, titleRaw: (title + " | " + part.label).slice(0, 120), priceDa: part.price, url: o.url, stock: o.stock || "En stock", condition: cond, image: o.image || "", scrapedAt: NOW });
          split = true;
        }
      }
      if (!split) continue; // bundle sans prix unitaires : ditch total
      continue;
    }
    const pid = isVeto ? null : matchRule(category, title);
    if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total
    if (pid) {
      if (seedPairs.has(pid + "|" + store)) continue; // seed wins
      matched.push({ productId: pid, store, wilaya: storeWilaya, titleRaw: title.slice(0, 120), priceDa: o.priceDa, url: o.url, stock: o.stock || "En stock", condition: cond, image: o.image || "", scrapedAt: NOW });
    } else if (!isVeto && !EXTRA_JUNK.test(title) && extraCount < 12) {
      extraCount++;
      pushExtra(category, { category, title: title.slice(0, 120), priceDa: o.priceDa, store, wilaya: storeWilaya, url: o.url, image: o.image || "", condition: cond });
    }
  }
}

// ouedkniss
let okExtra = 0;
let okiExtra = 0; // tier-3 particuliers: own extras cap, never canonical
const seenOkUrl = new Set();
for (const o of report["ouedkniss:all"] || []) {
  const qKey = (o.query || "").toLowerCase().trim();
  const title = clean(o.title);
  if (!title || !o.priceDa) continue;
  const tCat = detectTitleCategory(title);
  const qCat = detectQueryCategory(qKey);
  // Title-detected category takes precedence when query defaulted to 'gpu' or differs
  let category = (qCat === "gpu" && tCat) ? tCat : (tCat || qCat);
  if (!title || !o.priceDa) continue;

    // Filter out dead/expired listings: reject deals older than 45 days or invalid URLs
  if (!o.url || (!/-d\d+/.test(o.url) && !o.url.startsWith("http"))) continue;
  const postDate = o.postedAt || o.day || "";
  if (postDate) {
    if (postDate < "2025-10-01") continue;
    const ageDays = (Date.now() - new Date(postDate).getTime()) / (24 * 60 * 60 * 1000);
    if (!isNaN(ageDays) && ageDays > 30) continue;
  }

  // Query-title relevance: reject if title has nothing to do with the search query
  // query relevance evaluated for extras below

  const realStore = (o.store && o.store !== "Ouedkniss" ? o.store : (o.seller || "Ouedkniss")).trim();
  const realWilaya = o.wilaya || WILAYA[realStore] || "Alger";

  // Tier 3 (particulier, isFromStore === false): visible in extras only,
  // never a price reference. Skip entirely if non-PC tool, non-PC slug or non-legit PSU.
  if (o.isFromStore === false) {
    if (!isVetoed(category, title, o.url) && !EXTRA_JUNK.test(title) && (!o.query || isQueryRelevant(o.query, title)) && okiExtra < 150) {
      okiExtra++;
      pushExtra(category, { category, title: title.slice(0, 120), priceDa: o.priceDa, store: realStore, wilaya: realWilaya, url: o.url, image: o.image || "", condition: /neuf|new|blister|jamais|scell/i.test(title) ? "new" : "used", postedAt: o.postedAt || "", seller: (o.seller || "").slice(0, 40), isStore: 0 });
    }
    continue;
  }
  const isNew = /neuf|new|blister|jamais|scell/i.test(title);
  // canonical match only — tools/laptops/appliances are completely vetoed
  const isVeto = isVetoed(category, title, o.url);
  if (isBundle(title, o.description)) {
    let split = false;
    for (const part of splitDescriptionPrices(o.description)) {
      const sub = matchAnyCategory(clean(part.label));
      if (sub.length === 1 && !isAbsurd(sub[0].cat, sub[0].pid, part.price)) {
        if (seenOkUrl.has(o.url + "#" + sub[0].pid)) continue;
        seenOkUrl.add(o.url + "#" + sub[0].pid);
        matched.push({ productId: sub[0].pid, store: realStore, wilaya: realWilaya, titleRaw: (title + " | " + part.label).slice(0, 120), priceDa: part.price, url: o.url, stock: o.stock || "En stock", condition: isNew ? "new" : "used", image: o.image || "", scrapedAt: NOW });
        split = true;
      }
    }
    if (!split) continue; // bundle sans prix unitaires : ditch total
    continue;
  }
  const pid = isVeto ? null : matchRule(category, title);
  if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total
  if (pid) {
    if (seenOkUrl.has(o.url)) continue; // same ad twice in feed: keep first assignment
    seenOkUrl.add(o.url);
    matched.push({ productId: pid, store: realStore, wilaya: realWilaya, titleRaw: title.slice(0, 120), priceDa: o.priceDa, url: o.url, stock: o.stock || "En stock", condition: isNew ? "new" : "used", image: o.image || "", scrapedAt: NOW });
  } else if (!isVeto && !EXTRA_JUNK.test(title) && (!o.query || isQueryRelevant(o.query, title)) && okExtra < 150) {
    okExtra++;
    pushExtra(category, { category, title: title.slice(0, 120), priceDa: o.priceDa, store: realStore, wilaya: realWilaya, url: o.url, image: o.image || "", condition: isNew ? "new" : "used", postedAt: o.postedAt || "", seller: (o.seller || "").slice(0, 40), isStore: o.isFromStore ? 1 : 0 });
  }
}

// cap 6 cheapest per canonical product (bundle size)
const byPid = new Map();
for (const m of matched) {
  if (!byPid.has(m.productId)) byPid.set(m.productId, []);
  byPid.get(m.productId).push(m);
}
const capped = [];
const isOut = (m) => /rupture|out of stock|sold out|épuisé|epuisé|indisponible|0\s*en\s*stock|stock\s*[=:]\s*0/i.test(m.stock || "");
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
const seedProducts = [...prodSrc.matchAll(/id:\s*"([^"]+)",\s*category:\s*"([^"]+)",\s*brand:\s*"([^"]+)",\s*model:\s*"([^"]+)"/g)]
  .map((m) => ({ id: m[1], category: m[2], brand: m[3], model: m[4] }));
const storeWilayaMap = new Map();
for (const o of matched) {
  if (!storeWilayaMap.has(o.store) || storeWilayaMap.get(o.store) === "Alger") {
    storeWilayaMap.set(o.store, o.wilaya || WILAYA[o.store] || "Alger");
  }
}
const seedStores = [...storeWilayaMap.entries()].map(([name, wilaya]) => ({ name, wilaya }));
const seed = {
  scraped_at: NOW,
  day: NOW.slice(0, 10),
  products: seedProducts,
  stores: seedStores,
  offers: matched.map((o) => ({
    p: o.productId, s: o.store, d: o.priceDa, c: o.condition === "used" ? 0 : 1,
    u: o.url, t: o.titleRaw.slice(0, 160),
    w: o.stock === "Rupture" ? "out" : o.stock === "En stock" ? "in" : o.stock === "Ouedkniss" ? "ouedkniss" : (o.stock || "in"),
  })),
};
fs.writeFileSync("supabase-seed.json", JSON.stringify(seed));
const seedKB = Math.round(Buffer.byteLength(JSON.stringify(seed)) / 1024);
console.log("matched offers:", matched.length, "capped:", capped.length, "extras:", extras.length, "products hit:", byPid.size, "with photo:", Object.keys(imgSrc).length, "seed:", seedKB + "KB");
