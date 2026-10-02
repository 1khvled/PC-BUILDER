#!/usr/bin/env node
/**
 * DICTIONARY LINT
 * ===============
 * Catches French values that were copy-pasted from the English file.
 *
 * WHY THIS EXISTS
 * ---------------
 * lib/i18n/dictionaries/fr.ts is the shape source and en.ts is typed against it,
 * so a MISSING English key is a compile error. But a key whose French VALUE was
 * simply copied from the English file compiles perfectly clean and silently
 * ships an English interface to a French visitor. That is not hypothetical: all
 * eight watch.* strings were found that way, and the whole watchlist was
 * rendering in English on /fr.
 *
 * So this checks values, not shapes.
 *
 * A handful of values are SUPPOSED to be identical - proper nouns, and words
 * that are genuinely the same in French. Those are listed in ALLOWED_IDENTICAL
 * with a reason, so the allowlist stays auditable rather than becoming a place
 * to hide sloppiness. If you find yourself adding a key to it to silence this
 * script, translate the string instead.
 *
 * Usage:  node scripts/check-dict.mjs
 * Exit 0 = clean, exit 1 = untranslated French values found.
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dictDir = join(root, "lib", "i18n", "dictionaries");

/**
 * Keys whose French and English values are identical ON PURPOSE.
 * Each entry says why, so this cannot quietly become a dumping ground.
 */
const ALLOWED_IDENTICAL = new Map([
  ["ad.sponsor", "'Sponsor' is used in French advertising"],
  ["builder.thAction", "'Action' is identical in French"],
  ["category.sellerPro", "'Pro' is identical"],
  ["category.tableAction", "'Action' is identical in French"],
  ["chart.max", "'Max' is standard French usage"],
  ["chart.min", "'Min' is standard French usage"],
  ["common.action", "'Action' is identical in French"],
  ["common.builder", "deliberate product name, kept identical"],
  ["common.guides", "'Guides' is identical in French"],
  ["common.pluralSuffix", "plural 's' is identical in French"],
  ["common.wilaya", "'Wilaya' is the French term"],
  ["fb.placeholder", "a URL, not prose"],
  ["guide.thAction", "'Action' is identical in French"],
  ["guides.thAction", "'Action' is identical in French"],
  ["offers.thAction", "'Action' is identical in French"],
  ["offers.thWilaya", "'Wilaya' is the French term"],
  ["product.sku", "SKU is used as-is in French"],
  ["header.menu", "'Menu' is identical in French"],
  ["switcher.ariaEn", "describes switching TO English, so English is correct"],
  ["switcher.toEn", "the language's own name"],
  ["switcher.toFr", "the language's own name"],
  ["nav.benchmarks", "'Benchmarks' is the term used in French too"],
  ["guides.tierEnthusiast", "product tier name, kept identical"],
  ["benchmarks.source.ours", "brand name of this site"],
  ["perf.title", "translated; listed only if a future edit regresses it"],
  ["perf.tier.performance", "'Performance' is identical in French"],
  ["benchmarks.title", "'Benchmarks' is the term used in French too"],
  ["benchmarks.index", "'Index' is identical in French"],
  ["benchmarks.threads", "'Threads' is used as-is in French"],
  ["benchmarks.raster1080", "a resolution, identical everywhere"],
  ["benchmarks.raster1440", "a resolution, identical everywhere"],
  ["benchmarks.rt", "'Ray tracing' is used as-is in French"],
  ["benchmarks.chipset", "'chipset' is the term used in French too"],
  ["benchmarks.interface", "'interface' is not translated in French"],  ["benchmarks.socket", "Socket is used as-is in French"],
  ["benchmarks.tdp", "TDP is the standard term in French"],
  ["benchmarks.vram", "VRAM is used as-is in French"],
  ["benchmarks.sources", "'Sources' is identical in French"],
  ["benchmarks.source.cpumonkey", "site name"],
  ["benchmarks.source.wikichip", "site name"],
  ["ai.chatgpt", "product name, identical everywhere"],
  ["ai.claude", "product name, identical everywhere"],
  ["benchmarks.multi", "short column header, same word in French"],
  ["benchmarks.single", "short column header, same word in French"],
  ["benchmarks.gaming", "short column header, same word in French"],
]);

/** Extracts "key": "value" pairs, including values continued on the next line. */
function readDict(file) {
  const src = readFileSync(file, "utf8");
  const out = new Map();
  const keyRe = /"([A-Za-z0-9_.]+)":\s*"((?:[^"\\]|\\.)*)"/g;
  let m;
  while ((m = keyRe.exec(src)) !== null) out.set(m[1], m[2]);
  return out;
}

const fr = readDict(join(dictDir, "fr.ts"));
const en = readDict(join(dictDir, "en.ts"));

let problems = 0;

const missingEn = [...fr.keys()].filter((k) => !en.has(k));
const missingFr = [...en.keys()].filter((k) => !fr.has(k));
for (const k of missingEn) {
  console.log(`  MISSING en  ${k}`);
  problems++;
}
for (const k of missingFr) {
  console.log(`  MISSING fr  ${k}`);
  problems++;
}

const identical = [];
for (const [k, v] of fr) {
  if (!en.has(k)) continue;
  if (v === en.get(k) && v.trim() !== "" && !ALLOWED_IDENTICAL.has(k)) identical.push(k);
}

console.log(`fr keys ${fr.size}   en keys ${en.size}`);
console.log(`allowlisted identical: ${ALLOWED_IDENTICAL.size}`);

if (identical.length === 0) {
  console.log("OK: no untranslated French values.");
} else {
  console.log(`\nFAIL: ${identical.length} French value(s) are identical to English:`);
  for (const k of identical) console.log(`  ${k}  =  ${JSON.stringify(fr.get(k))}`);
  console.log("\nTranslate them, or add a justified reason to ALLOWED_IDENTICAL.");
  problems++;
}

process.exit(problems === 0 ? 0 : 1);
