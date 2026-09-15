# Intelligent matcher (local-first) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Matcher contextuel local : ditch bundles/absurdes, stock exclu, variantes матchées, stats médiane — vérifié par rebake + build, sans toucher Supabase.

**Architecture:** Le scraper structure (description, variantes, stock), `bake.cjs` décide (ditch strict avant le cap-6), le front robustifie ses stats. Ordre des gates : veto → stock-out → bundle → variant → matchRule → bande prix → cap-6.

**Tech Stack:** Next.js 14, `bake.cjs` (Node batch, ~1000 lignes), TypeScript scrapers, `full.json` local comme fixture.

## Global Constraints

- Local-first : AUCUN push Supabase, AUCUNE suppression de fichiers temp A/B dans ce plan.
- Ditch = la ligne disparaît (ni canonical ni extras public), sauf veto classique qui va en extras.
- `matchRule(category, title)` reste intra-catégorie first-match-wins ; ne jamais changer sa signature.
- `full.json` est une fixture statique : les champs description absent aujourd'hui → code défensif (`o.description || ""`).
- Commits fréquents, un par tâche.

---

### Task 1: 3 ids GPU manquants dans products.ts

**Files:**
- Modify: `lib/data/products.ts` (3 insertions, une ligne chacune)
- Test: `grep` + `npm run typecheck`

**Interfaces:**
- Consumes: specs MATCHER-CONTEXT §7.4 (verbatim) : `gpu-rtx5060ti-8gb` (240mm/145W/16-pin), `gpu-rx9060xt-8gb` (240mm/150W/1x8), `gpu-rx580-4gb` (240mm/185W/1x8).
- Produces: ids référençables par `bake.cjs` RULES (déjà présentes) et le builder.

- [ ] **Step 1: ajouter les 3 lignes**

Après la ligne `{ id: "gpu-rx580-8gb", ... }` (ligne 66) insérer :
```ts
  { id: "gpu-rx580-4gb", category: "gpu", brand: "AMD", model: "RX 580 4GB", specs: { length_mm: 240, tdp_w: 185, pins: "1x8" } },
```
Après la ligne `{ id: "gpu-rtx5060ti-16gb", ... }` (ligne 90) insérer :
```ts
  { id: "gpu-rtx5060ti-8gb", category: "gpu", brand: "NVIDIA", model: "RTX 5060 Ti 8GB", specs: { length_mm: 240, tdp_w: 145, pins: "16-pin" } },
```
Après la ligne `{ id: "gpu-rx9060xt-16gb", ... }` (ligne 127) insérer :
```ts
  { id: "gpu-rx9060xt-8gb", category: "gpu", brand: "AMD", model: "RX 9060 XT 8GB", specs: { length_mm: 240, tdp_w: 150, pins: "1x8" } },
```

- [ ] **Step 2: vérifier**

Run: `grep -c "gpu-rtx5060ti-8gb\|gpu-rx9060xt-8gb\|gpu-rx580-4gb" lib/data/products.ts`
Expected: `3`

- [ ] **Step 3: typecheck ciblé**

Run: `npm run typecheck 2>&1 | grep -v "ab-backup/\|ab-live-new"`
Expected: aucune erreur hors fichiers temp A/B (les 3 erreurs `./products` restantes sont connues, §8 les supprimera).

- [ ] **Step 4: Commit**

```bash
git add lib/data/products.ts
git commit -m "Add 3 missing GPU catalog ids (5060ti-8gb, 9060xt-8gb, rx580-4gb)"
```

---

### Task 2: bandes prix anti-absurdes dans bake.cjs

**Files:**
- Modify: `bake.cjs` (1 bloc utilitaire avant `const matched = []`, 2 gardes d'une ligne dans les boucles stores + Ouedkniss)
- Test: script node inline via `vm` (même technique que `probe-ab3.cjs`)

**Interfaces:**
- Consumes: `CAT_BANDS` = valeurs verbatim de `lib/scrapers/validate.ts` (`CATEGORY_BANDS`) ; `supabase-seed.json` (`offers[].p` = productId, `offers[].d` = prix).
- Produces: `isAbsurd(category, pid, priceDa): boolean` utilisé par les boucles ; les lignes absurdes `continue` AVANT tout push (ni matched ni extras).

- [ ] **Step 1: insérer le bloc utilitaire juste avant `const matched = []`**

```js
// ---- price-sanity gates (ditch total, never extras) ----
// Bands mirror lib/scrapers/validate.ts CATEGORY_BANDS so scrape-time and
// bake-time agree. Per-product band = seed median x[0.4, 2.5].
const CAT_BANDS = { cpu: [1000, 250000], cooler: [500, 90000], motherboard: [4000, 200000], ram: [1000, 300000], ssd: [800, 160000], gpu: [2000, 1500000], case: [1000, 130000], psu: [800, 150000], monitor: [3000, 400000] };
const SEED_MEDS = (() => {
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
  const b = CAT_BANDS[category];
  if (!b) return false;
  if (price < b[0] || price > b[1]) return true;
  const m = SEED_MEDS.get(pid);
  if (!m) return false;
  return price < m * 0.4 || price > m * 2.5;
}
```

- [ ] **Step 2: garde boucle stores**

Ancre : la ligne `const pid = isVeto ? null : matchRule(category, title);` de la boucle stores (re-lire la zone, ~L885). Insérer après :
```js
    if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total
```

- [ ] **Step 3: garde boucle Ouedkniss**

Ancre : la ligne `const pid = isVeto ? null : matchRule(category, title);` de la boucle ouedkniss (re-lire la zone, ~L917). Insérer après :
```js
  if (pid && isAbsurd(category, pid, o.priceDa)) continue; // absurd price: ditch total
```

- [ ] **Step 4: vérifier par smoke (180 000 DA ne passe plus, prix sain conservé)**

Run :
```bash
node -e 'const fs=require("fs"),vm=require("vm");const src=fs.readFileSync("bake.cjs","utf8");const code=src.slice(src.indexOf("function norm("),src.indexOf("const matched = []"));const ctx={fs,console};vm.createContext(ctx);vm.runInContext(code,ctx);const isAbsurd=vm.runInContext("isAbsurd",ctx);console.log("3060@180000:",isAbsurd("gpu","gpu-rtx3060-12gb",180000));console.log("3060@65000:",isAbsurd("gpu","gpu-rtx3060-12gb",65000));'
```
Expected: `3060@180000: false` (médiane 77000 × 2.5 = 192500 : le cas PC-complet à 180k est tué par le détecteur bundle Task 4a, pas par la bande — choix spec), `3060@65000: false`. Leurres bas type `3060@5000: true` (sous 0.4×médiane).

- [ ] **Step 5: Commit**

```bash
git add bake.cjs
git commit -m "Bake price-sanity gates: category bands + seed-median ditch"
```

---

### Task 3: stock enum + isOut étendu

**Files:**
- Modify: `bake.cjs` (`isOut`, 1 ligne) ; `lib/data/products.ts` (`isRuptured`, re-lire lignes ~420-443)
- Test: script node inline

**Interfaces:**
- Consumes: rien (regex uniquement).
- Produces: `out` = rupture (exclu min/moyenne/deals) ; `order` (`sur commande`) et `unknown` (`Ouedkniss`, `À vérifier`) restent affichables.

- [ ] **Step 1: étendre isOut dans bake.cjs**

Ancien (re-vérifier à la re-lecture) :
```js
const isOut = (m) => /rupture|out of stock|sold out|épuisé|indisponible/i.test(m.stock || "");
```
Nouveau :
```js
const isOut = (m) => /rupture|out of stock|sold out|épuisé|epuisé|indisponible|0\s*en\s*stock|stock\s*[=:]\s*0/i.test(m.stock || "");
```
`sur commande` reste volontairement ABSENT (order ≠ out).

- [ ] **Step 2: étendre isRuptured dans lib/data/products.ts**

Même extension sur sa regex (re-lire la fonction, appliquer les 3 ajouts : `epuisé`, `0\s*en\s*stock`, `stock\s*[=:]\s*0`).

- [ ] **Step 3: vérifier**

Run :
```bash
node -e 'const r=/rupture|out of stock|sold out|épuisé|epuisé|indisponible|0\s*en\s*stock|stock\s*[=:]\s*0/i;for(const s of ["Rupture","Epuisé","0 en stock","Sur commande","Ouedkniss","En stock"])console.log(s,"=>",r.test(s));'
```
Expected: `true true true false false false`.

- [ ] **Step 4: Commit**

```bash
git add bake.cjs lib/data/products.ts
git commit -m "Extended rupture detection (unaccented, zero-stock), order stays listed"
```

---

### Task 4a: détecteur bundle multi-familles + split description (bake.cjs)

**Files:**
- Modify: `bake.cjs` (2 fonctions + 2 points d'appel dans les boucles)
- Test: script node inline avec lignes synthétiques

**Interfaces:**
- Consumes: `matchRule`, `clean`, `isAbsurd` (Task 2).
- Produces: lignes bundle soit éclatées en sous-offres re-matchées, soit ditchées (`continue`).

- [ ] **Step 1: insérer avant `const matched = []`**

```js
const BUNDLE_CATS = ["cpu", "gpu", "motherboard", "ram", "ssd"];
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
    const m = line.match(/(.{4,60}?)\s*[:\-–]\s*(\d[\d\s.]{3,})\s*(da|dzd|dinars?)/i);
    if (!m) continue;
    const price = parseInt(m[2].replace(/[^0-9]/g, ""), 10);
    if (!price || price < 500 || price > 5000000) continue;
    out.push({ label: m[1].trim(), price });
  }
  return out;
}
```

- [ ] **Step 2: point d'appel boucle stores**

Ancre : après `const isVeto = isVetoed(category, title);`, avant `const pid = ...` (re-lire). Insérer :
```js
    const famHits = matchAnyCategory(title);
    if (famHits.length >= 2) {
      let split = false;
      for (const part of splitDescriptionPrices(o.description)) {
        const sub = matchAnyCategory(clean(part.label));
        if (sub.length === 1 && !isAbsurd(sub[0].cat, sub[0].pid, part.price)) {
          if (seedPairs.has(sub[0].pid + "|" + store)) continue;
          matched.push({ productId: sub[0].pid, store, wilaya: WILAYA[store], titleRaw: (title + " | " + part.label).slice(0, 120), priceDa: part.price, url: o.url, stock: o.stock || "En stock", condition: cond, image: o.image || "", scrapedAt: NOW });
          split = true;
        }
      }
      if (!split) continue; // bundle sans prix unitaires : ditch total
      continue;
    }
```

- [ ] **Step 3: point d'appel boucle Ouedkniss**

Même logique adaptée (re-lire la boucle) : `store: "Ouedkniss"`, `wilaya: o.wilaya || "DZ"`, `stock: "Ouedkniss"`, `condition: isNew ? "new" : "used"`, champs extras `postedAt/seller/isStore` conservés sur les sous-offres.

- [ ] **Step 4: vérifier synthétique**

Run (via `vm`, fonctions chargées comme Task 2) : titre `RTX 3060 + i5 12400F + B660 180000` sans description → aucune entrée matched (ditch) ; même titre avec description `RTX 3060 : 85000 DA\nI5 12400F : 28000 DA` → 2 sous-offres aux bons pids. Écrire l'assertion inline et constater PASS/FAIL.
Expected: ditch puis 2 sous-offres.

- [ ] **Step 5: Commit**

```bash
git add bake.cjs
git commit -m "Bundle detector: multi-family split on description, else ditch"
```

---

### Task 4b: plomber description Ouedkniss jusqu'à full.json

**Files:**
- Modify: `lib/scrapers/base.ts` (RawOffer += champ), `lib/scrapers/ouedkniss-api.ts` (push += description)
- Test: `npm run typecheck` (pas de scrape live requis)

**Interfaces:**
- Consumes: `item.description` déjà présent dans la réponse GraphQL (`ouedkniss-api.ts:92,132`).
- Produces: `RawOffer.description?` propagé par spread `...o` existant dans `route.ts:92,104` (aucune modif route nécessaire — le vérifier à la re-lecture).

- [ ] **Step 1: base.ts**

```ts
export interface RawOffer {
  title: string;
  priceDa: number;
  url: string;
  stock: string;
  image: string;
  description?: string;
}
```

- [ ] **Step 2: ouedkniss-api.ts (bloc push ~lignes 290-304)**

Ajouter dans l'objet poussé :
```ts
        description: (item.description || "").slice(0, 2000),
```

- [ ] **Step 3: vérifier propagation route**

Re-lire `route.ts:84-116` : confirmer que `offers: ok` et `{ ...o, query }` transportent le champ sans modif. Si un `.map()` sélectif existe, l'étendre (montrer le diff exact dans le commit).

- [ ] **Step 4: typecheck + commit**

Run: `npm run typecheck 2>&1 | grep -v "ab-backup/\|ab-live-new"`
Expected: zéro erreur hors temp.
```bash
git add lib/scrapers/base.ts lib/scrapers/ouedkniss-api.ts
git commit -m "Plumb Ouedkniss description to offers for bundle split"
```

---

### Task 5a: variantRedirect pour la VRAM GPU

**Files:**
- Modify: `bake.cjs` (1 ligne : garde d'entrée `variantRedirect`)
- Test: script node inline synthétique

**Interfaces:**
- Consumes: `titleCapacities`, `capTokenGB` existants (capacités GB/TB).
- Produces: `RTX 3060 8GB` ne tombe plus sur `gpu-rtx3060-12gb` par accident d'ordre.

- [ ] **Step 1: garde d'entrée (ligne ~707)**

Ancien : `if (category !== "ssd" && category !== "ram") return matched;`
Nouveau : `if (category !== "ssd" && category !== "ram" && category !== "gpu") return matched;`

- [ ] **Step 2: vérifier**

Run (vm) : `matchRule("gpu", clean("RTX 3060 8GB ..."))` → id 8gb, et une 12GB → id 12gb. Re-lire au préalable les ids exacts des règles 3060 dans RULES.
Expected: chaque VRAM sur son id.

- [ ] **Step 3: Commit**

```bash
git add bake.cjs
git commit -m "variantRedirect covers GPU VRAM"
```

---

### Task 5b: gardes wattage PSU + Hz moniteur

**Files:**
- Modify: `bake.cjs` (1 fonction + 1 appel dans `matchRule`)
- Test: script node inline synthétique

**Interfaces:**
- Consumes: `norm`, `RULES`, `has` (fermeture locale de `matchRule`).
- Produces: un titre `750W` ne reste jamais sur un id `psu-650` quand une règle 750W capacity-correcte existe ; sinon keep (pas de ditch : la tension rappelle le garde-fou, pas la sanction).

- [ ] **Step 1: insérer avant `function matchRule`**

```js
// PSU wattage / monitor Hz agreement: same shape as variantRedirect's
// single-capacity check, but for W and Hz units. Redirects to a
// unit-correct rule when one exists, keeps the match otherwise.
function unitRedirect(category, title, matched, has) {
  const unit = category === "psu" ? "w" : category === "monitor" ? "hz" : null;
  if (!unit) return matched;
  const t = " " + norm(title) + " ";
  const re = unit === "w" ? /(\d{3,4})\s*w\b/g : /(\d{2,3})\s*hz\b/g;
  const units = [...new Set([...t.matchAll(re)].map((m) => +m[1]))];
  if (units.length !== 1) return matched; // 0 ou ambigu : keep
  const idm = matched.match(/(\d{3,4})/);
  if (idm && +idm[1] === units[0]) return matched; // accord : keep
  for (const r of RULES) {
    if (r.cat !== category) continue;
    const rid = (r.id.match(/(\d{3,4})/) || [])[1];
    if (!rid || +rid !== units[0]) continue;
    const rest = (r.all || []).filter((x) => !new RegExp(`^${units[0]}`).test(x));
    if (!rest.every(has)) continue;
    if ((r.none || []).some(has)) continue;
    return r.id;
  }
  return matched;
}
```

- [ ] **Step 2: appel dans `matchRule`**

Ancien : `return variantRedirect(category, title, r.id, has);`
Nouveau :
```js
    const v = variantRedirect(category, title, r.id, has);
    return unitRedirect(category, title, v === r.id ? r.id : v, has);
```
(Si `variantRedirect` a déjà redirigé — cas ssd/ram/gpu — on garde sa réponse telle quelle : passer `v` quand il diffère évite un double redirect contradictoire.)

- [ ] **Step 3: vérifier**

Run (vm) : `matchRule("psu", clean("HYBROK 750W 80 PLUS BRONZE"))` → id contenant `750` (pas `650`) ; `matchRule("monitor", clean("MSI 27 180HZ IPS"))` → id contenant `180`.
Expected: wattage/Hz corrects dans les deux cas.

- [ ] **Step 4: Commit**

```bash
git add bake.cjs
git commit -m "Unit agreement guards: PSU wattage + monitor Hz redirect"
```

### Task 6: stats médiane (deals + tableau offres)

**Files:**
- Modify: `app/deals/page.tsx` (lignes 20-39), `components/ProductOffersTable.tsx` (lignes 82-94, 152-156)

**Interfaces:**
- Consumes: `isRuptured` inchangé.
- Produces: médiane au lieu de moyenne ; deals `n>=3`.

- [ ] **Step 1: deals/page.tsx**

Ancien :
```ts
    const prices = fresh.map((o) => o.priceDa).sort((a, b) => a - b);
    const best = prices[0];
    const avg = Math.round(prices.reduce((s, v) => s + v, 0) / prices.length);
```
Nouveau :
```ts
    const prices = fresh.map((o) => o.priceDa).sort((a, b) => a - b);
    const best = prices[0];
    const avg = prices[Math.floor(prices.length / 2)]; // médiane : insensible aux prix absurdes
```
Et `if (fresh.length < 2) continue;` → `if (fresh.length < 3) continue;`
Et le sous-titre (ligne 49) : `≥8% sous la moyenne` → `≥8% sous la médiane`.

- [ ] **Step 2: ProductOffersTable.tsx**

Ancien (lignes 90-93) :
```ts
    const min = Math.min(...prices);
    const avg = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);
    const max = Math.max(...prices);
    return { min, avg, max };
```
Nouveau :
```ts
    const min = Math.min(...prices);
    const sorted = [...prices].sort((a, b) => a - b);
    const avg = sorted[Math.floor(sorted.length / 2)]; // médiane
    const max = Math.max(...prices);
    return { min, avg, max };
```
Et ligne 153 : `Moyenne :` → `Médiane :`.

- [ ] **Step 3: typecheck + commit**

Run: `npm run typecheck 2>&1 | grep -v "ab-backup/\|ab-live-new"`
Expected: zéro erreur hors temp.
```bash
git add app/deals/page.tsx components/ProductOffersTable.tsx
git commit -m "Median stats for deals and offer tables, deals n>=3"
```

---

### Task 7: rebake + reseed + build locaux (PAS de push)

**Files:**
- Regenerate: `lib/data/live.ts`, `lib/data/live-images-src.json`, `supabase-seed.json`
- Test: `node probe-ab3.cjs`, `npm run build`

**Interfaces:**
- Consumes: Tasks 1-6 commitées.
- Produces: données locales régénérées + commit data. AUCUN push Supabase (local-first).

- [ ] **Step 1: rebake**

Run: `node bake.cjs`
Expected: `matched offers: ... capped: ... extras: ... products hit: ...` — comparer `extras` et `products hit` aux valeurs précédentes (10142/1779/579 baseline, 8736/1765/1333 post-space-flex) : écart attendu = ditchs absurdes/bundles + 3 nouveaux ids GPU.

- [ ] **Step 2: diff live.ts vs ab-live-new2.ts**

Run: `node -e '...comparer productIds...'` ou `diff <(grep productId lib/data/live.ts) <(grep productId ab-live-new2.ts) | head`
Expected: différences limitées aux §7.1/§7.2 + nouveaux gates (± timestamp).

- [ ] **Step 3: reseed local**

Run: `node scripts/seed-from-live.cjs`
Expected: sortie sans erreur, `supabase-seed.json` régénéré (reste local, pas de push).

- [ ] **Step 4: probe + typecheck + build**

Run: `node probe-ab3.cjs > probe-out5.txt 2>&1` puis `grep -c "new=NOMATCH" probe-out5.txt` (attendu : que des classes ACCEPTED), `npm run typecheck`, `npm run build`.
Expected: probe sans nouvelle régression, typecheck 0 erreur hors temp, build OK.

- [ ] **Step 5: Commit data**

```bash
git add lib/data/live.ts lib/data/live-images-src.json supabase-seed.json
git commit -m "Local rebake: intelligent-matcher gates + 3 GPU ids"
```

---

## Hors scope (plan B ultérieur)

Variantes par option côté stores (1 offre/variante), sweep sellers OKSTORE, push Supabase + Vercel, suppression temp §8.
