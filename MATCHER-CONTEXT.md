# MATCHER-CONTEXT.md — bake.cjs algo handoff (A→Z)

> Purpose: let ANY agent pick up the matcher/A-B harness work with zero prior
> context. Read this file top-to-bottom, then check `git log --oneline -5`.
> Last updated: 2026-09-15. Status: §7.1 (ADATA split) + §7.2 (27g42e rule)
> APPLIED + re-probed green (probe-out4/5). Intelligent-matcher gates SHIPPED
> locally (commits 9ceec8a..4e87ad5): price-sanity ditch, bundle split/ditch
> (syntax-gated), rupture extension, VRAM/wattage-Hz guards, median stats,
> PREBUILT_VETO + slash-density/tight-plus triggers. Rebake 7529/1750/1018,
> 352/352 products, reseed 358×1142, build green. probe-out5/6/7 = fresh
> evidence (11→16 flags, all ACCEPTED classes). Supabase push NOT done
> (local-first, user decision). Temp .ts outputs ab-live-new*.ts +
> ab-backup/live.baseline.ts deleted (broke build); rest of §8 temps kept.

---

## 1. Pipeline (the whole system in 6 steps)

```
scripts/refresh-full.mjs  →  full.json (7.4 MB scrape report)
                          →  bake.cjs (THE matcher; root, ~900 lines)
                          →  lib/data/live.ts (LIVE_OFFERS + LIVE_EXTRA)
                          →  scripts/seed-from-live.cjs → supabase-seed.json
                          →  scripts/push-supabase.mjs (1098 offers live)
```

- `full.json` report keys: `"Store/category"` (e.g. `"Click-DZ/ram"`),
  `"ouedkniss:<query>"`, and `"ouedkniss:all"` (flat array, each row has `.query`).
- `bake.cjs` reads `full.json`, writes `lib/data/live.ts`. Run: `node bake.cjs`.
- `lib/match/advanced.ts` is **DEAD code** — ignore it. All matching lives in bake.cjs.
- `lib/data/products.ts` is the catalog (ids + specs). Untouched by A/B.

## 2. Matcher semantics (audit-verified, do NOT re-derive)

1. **Scrape job stamps the category, never the title.** `matchRule(category, title)`
   only tests rules with `r.cat === job category`. A title can never "choose" its category.
2. **RULES is first-match-wins** within the job's category.
3. **Veto gate runs before matching**: `isVetoed(cat, t)` → row goes to extras
   (cap bypass). Vetoes: BUNDLE_VETO + FULLPC/LAPTOP/TOOL/MOBOPSU keyword sets.
4. **EXTRA_JUNK filter applies ONLY in the else branch** (non-OK stores).
5. **6-cheapest cap is GLOBAL per productId** over matched rows. Overflow rows
   VANISH (never fall through to extras).
6. **Stable sort is rupture-aware**: in-stock first, then price.
7. **Extras caps**: 12 per (store,category) block, 150 total for Ouedkniss.
8. **`seenOkUrl` OK dedup is keep-first** by job order: the FIRST job claiming an
   OK URL wins; later jobs see it as seen. Job order = order in refresh script.
9. **`seedPairs` skip** (productId|store in products.ts, non-Ouedkniss) is A/B-neutral.
10. **OK rows**: category stamped via `OK_CAT[o.query] || "gpu"` default.

## 3. The space-flex fix (ALREADY APPLIED in bake.cjs)

- **Baseline bug**: `has()` was guardless — `t.includes(tok) || flat.includes(tok)` —
  so it matched substrings inside longer tokens (`"9600"`⊂`"9600kf"`,
  `"32gb"`⊂`"C3032GB"`, `"27g4"`⊂`"27g42e"`).
- **Fix** (`bake.cjs` lines ~819-870): `hasDigitTokOn()` — digit-start tokens
  (len>3) use a space-flexible regex on the normed title ONLY (no flat pass),
  with a left-digit guard (char before match must not be a digit) and a
  right-boundary rule (rest must be end/space, or a known suffix class:
  `ti|super|xt|xtx|gre|f|s`, `NNgb/tb/g/hz`, `m…`, `v…`, `f|w|pro`).
- Letter-start tokens (`b550`, `sn850`) and len≤3 tokens: UNCHANGED behavior.
- **Proven property: NEW-subset-OLD.** New `has()` is a strict subset of old per
  (title,tok) — every ADDED canonical row matched baseline too. So ADDED rows =
  6-cap churn + new VRAM-tier rows, NEVER new recall. Only REMOVED needs explaining.

## 4. A/B methodology + harness inventory (all TEMP files, root unless noted)

| File | Role |
|---|---|
| `ab-backup/bake.baseline.cjs` | Pristine pre-fix bake (reproduces 10142/1779/579/347) |
| `ab-backup/live.baseline.ts`, `ab-backup/seed.baseline.json` | Baseline outputs |
| `bake-ab.cjs` | Patched-bake COPY (writes `ab-live-new2.ts`, never touches live.ts) |
| `ab-live-new2.ts` | Patched output: `matched 8736 capped 1765 extras 1333 products 352` |
| `ab-diff.cjs` | URL-keyed canonical diff → `ab-diff-out2.txt` |
| `trace-ab.cjs` | Replays every base-canonical URL thru NEW matcher w/ true source → `trace-out2.txt` |
| `probe-ab3.cjs` | Per-source base-vs-new verdicts + NEW pool dumps + norm checks → `probe-out3.txt` |

- Baseline canonical: **1779**. New canonical: **1765**. Same: 1611.
- **Removed 55, Added 133, Remapped 21.** Extras 579 → 1333 (explained §6).
- **CRITICAL gotcha**: `ab-backup/bake.baseline.cjs` has NO `isVetoed` — only inline
  `BUNDLE_VETO`. FULLPC/LAPTOP/TOOL/MOBOPSU vetoes were added AFTER the backup.
  → Many REMOVED rows are *intended veto additions*, not regressions.
  probe-ab3.cjs handles this via per-version veto fns (BASE: `BUNDLE_VETO.test`,
  NEW: `isVetoed` via second vm eval). Don't "fix" this — it's by design.
- `isVetoed` ReferenceError / OK_CAT eval SyntaxError / extras `title` vs `titleRaw`
  (`r.title || r.titleRaw`) — all already fixed in the harnesses. Don't regress.

## 5. Adjudication: all 55 REMOVED rows classified (from trace-out2.txt)

Tally: `NOMATCH inExtras 8, VETO inExtras 34, REMAP>psu-650-b GONE 3,
REMAP>psu-750-b GONE 1, NOMATCH GONE 2, MATCH GONE 6, VETO GONE 1.`

- **34 VETO inExtras — ACCEPT** (intended post-baseline vetoes: full-PC configs,
  laptops, kitchen/tool appliances like 650W grinders/trimmers, multiprise).
- **1 VETO GONE — ACCEPT** (bare `PC GAMER RYZEN 5 5600G` = FULLPC-veto + EXTRA_JUNK, correct).
- **7 poison rejections — ACCEPT**: 7950X3D ×2 + X3D config (no X3D catalog product),
  fake 7700X3D ×2, 5600XT, **9600KF ×3** (Intel 9th-gen; baseline matched `9600`
  inside `9600kf` guardless; `cpu-r5-9600` is Ryzen — correct rejection).
- **6 MATCH GONE — ACCEPT, all 6-cap displacement** (verified vs NEW pools):
  HYBROK HG27CUQ300 ×3 @53900 (6 cheaper 280/300Hz rows exist), PA278CV
  NextGen 67900 + Click-DZ 68900 (Lahlou PA278CV 65000 + 5 cheaper), Samsung 990
  EVO Plus 4TB Campus 145500 (WifiDjelfa SAME drive 119000).
- **4 REMAP>psu GONE — ACCEPT, designed cap churn**: per-source verdicts AGREE
  across versions (OK psu-source→psu-650-b/750-b, OK case-source→case-budget/
  meshian/hurrikan in BOTH). `seenOkUrl` keep-first lets the case job claim the
  URL; case-budget pool is full in NEW (9900-rupture/11900/13200/14900…), so the
  ARES bundles (13500/14500) + RAIDMAX kits (28900/35900) cap out of psu pools
  (≤6990 / ≤9500). Bundles belong to case-budget anyway.
- **2 REAL regressions — FIX DESIGNED, see §7**: ADATA 32GB (§7.1) + AOC bare title (§7.2).

## 6. Extras 579 → 1333 — ACCEPT, explained

+754 = (a) vetoed movers now land in extras WITH cap bypass — every full-PC/
laptop/appliance ad site-wide that baseline let poison canonical (or nomatch) now
correctly parks in extras; (b) poison rejections (X3D, KF, XT…). Sample of 30
new extras titles (ab-diff-out2.txt:215-245) is 100% legit veto/poison movers
(X3D chips, 9600KF, ADATA 32GB, 7700X3D/5700X3D/7600X3D, 5600XT, watercoolings,
PG259QN/QNR 360Hz — no 24"-360Hz product exists — RTX 3060 Ti founder-config,
multiprise, FSP 1650W). Overflow NEVER goes to extras (vanishes), so extras
growth cannot hide recall loss. Per-block 12-cap limits UI exposure.

## 7. PENDING WORK (in order — §7.1+§7.2 first, then re-probe BEFORE the rest)

### 7.1 FIX 1 — ADATA capacity-in-model (norm split). Safety survey DONE (8/8 ADATA).

- Row: Click-DZ ram `UDIMM DDR5 ADATA XPG LANCER 6000MHZ CL30 WHITE RGB
  AX5U6000C3032G-DCLARWH` (109900, NOMATCH inExtras). Genuine 32GB DDR5-6000
  kit (AX5U6000C3032G = Lancer 6000/C30/32G). NOTE: line 21 (`32g\b`→`32gb`)
  turns it into `…c3032gb…` — `32gb` buried mid-token, no boundary — which is
  exactly why the new left-digit-guard rejects it. Confirmed by probe norm-check:
  `norm = "udimm ddr5 adata xpg lancer 6000mhz cl30 white rgb ax5u6000c3032gb dclarwh"`.
- Survey: 8 distinct feed titles match `/c\d{2}(8|16|24|32|48|64)g\b/i`, ALL are
  ADATA XPG LANCER (C30/C32/C34 rows; 7 have explicit `16GO/24GO/32GO` words
  already, the broken row is the only one without). DDR4 `AD4U320038G17-S`-style
  strings do NOT match (no literal `c` before digits). No rule references `c30…`.
- Edit: insert as the FIRST replace in `norm()` (BEFORE the line-21
  `8g/16g…→gb` rule, which would otherwise fuse the token first):
  `.replace(/c(\d{2})(8|16|24|32|48|64)g\b/g, "c$1 $2gb")`
  → `ax5u6000c3032g dclarwh` becomes `ax5u6000c30 32gb dclarwh`; rule 233
  (`ram-32gb-d5-6000`, all `32gb,ddr5,6000`) then matches (`32gb` word ✓,
  `ddr5` ✓, `6000` via mhz-rest ✓, none `6400` absent ✓).

### 7.2 FIX 2 — AOC bare-model rule. Collision check DONE (Q27G42ZE safe).

- Row: OK ad d55050307 `ECRAN AOC 27G42E HDR` (31900, NOMATCH GONE). Genuine
  180Hz monitor — proven by sibling Click-DZ title `AOC 27G42E 27" 180HZ…`
  (matches rule 529 in both versions). Baseline matched `27g4` guardless; new
  rejects (rest `2e`). NEW pool `mon-27-180` already holds `31900 AOC 27G42E
  with 180HZ ×2 (OK)` — after fix this row joins that pool at 31900 (correct
  cap churn vs 32900 rows).
- Edit: insert AFTER rule 564 (`all:["27g4"]`):
  `{ id: "mon-27-180", cat: "monitor", all: ["27g42e"], none: ["laptop", "tv", "televiseur"] }`
- Safety: `Q27G42ZE` (260Hz QHD, pool mon-27-qhd165) canNOT match — the `z`
  breaks the token in BOTH old (`includes("27g42e")` — needs literal `2,e`
  adjacency) and new (regex `\s*` can't skip `z`) matchers. Also rescues
  `C27G42E` (Informatics curved 180Hz) — correct bucket.
- After applying §7.1+§7.2: re-run probe (`node probe-ab3.cjs`) and confirm the
  ADATA row + bare AOC row join canonical. THEN proceed below.

### 7.3 Single-M motherboard rules (NOT yet scoped — needs a feed audit first)

- Mobo rules live at bake.cjs:195-228 + :440-444 (chipset-token style:
  `all:["b650"]` etc.). Constraint: the pure-digit CAP must KEEP rejecting a
  bare single `m` so laptop chips (`GTX 950M`, `5600H`) stay rejected.
- Audit = grep full.json motherboard-category titles for M-suffix models that
  fail to match, then write rules that key on the full chipset token, never on `m`.

### 7.4 products.ts — 3 GPU ids STILL TO ADD

`gpu-rtx5060ti-8gb` (240mm/145W/16-pin), `gpu-rx9060xt-8gb` (240mm/150W/1x8),
`gpu-rx580-4gb` (240mm/185W/1x8).

### 7.5 Store expansion (OKSTORE seller-sweep plumbing — DESIGNED, not built)

`ouedkniss-api.ts` storeId param → `ouedkniss.ts` wrapper → `route.ts`
`oks=/okq=/okstores=` modes → `refresh-full.mjs` driver jobs; report key
`ouedkniss-store:<slug>:<q>`, raw `q` stamped so OK_CAT works with ZERO bake
changes. Plus: Lahlou Shopify `per_page` bump; HardSoft check.
(Task #22 "audit current stores and mismatch families" still pending.)

### 7.6 Ship sequence (after re-probe is green)

`node bake.cjs` (real rebake → live.ts) → diff live.ts vs ab-live-new2.ts
(expect match ± timestamp) → reseed → typecheck → build →
`scripts/push-supabase.mjs` → commit/push → delete temp files (§8) →
user-side: verify Vercel build, add `NEXT_PUBLIC_SUPABASE_URL` +
`NEXT_PUBLIC_SUPABASE_ANON_KEY`, redeploy.

## 8. Temp files to DELETE after ship (all untracked, root unless noted)

`ab-backup/`, `probe-ok-store.mjs`, `analyze-mismatch.cjs`, `analyze-v2.cjs`,
`ab-survey.cjs`, `ab-diff.cjs`, `trace-ab.cjs`, `bake-ab.cjs`, `probe-ab3.cjs`,
`ab-live-new.ts`, `ab-live-new2.ts`, `ab-diff-out.txt`, `ab-diff-out2.txt`,
`trace-out.txt`, `trace-out2.txt`, `probe-out3.txt`, `ab-seed2.json`,
`ab-live-images2.json`. (Never touched: `lib/data/live.ts`, `supabase-seed.json`,
`full.json` — live.ts + seed are PRESERVED, A/B never overwrote them.)

## 9. Reference data (already verified — don't re-derive, just use)

- NEW pools (probe-out3.txt:1093-1150): mon-27-280 ×6 (38900–49900: Dahua 300Hz
  ×2, AOC C27G4ZXE 280Hz ×3, ZIXOS 300Hz); mon-27-qhd165 ×6 (56900 Hybrok 320Hz,
  64900 AOC Q27G42ZE 260Hz ×2, 65000 Lahlou PA278CV, 65500 VG27AQ5A, 65900
  Q27U3CV); ssd-nvme-4tb ×6 (69900 SP A55 … 120000 T7); psu-650-b ×6 (5900–6990
  Ares/HYBROK/Gamdias); psu-750-b ×6 (8500–9500 all HYBROK); ram-32gb-d5-6000
  ×6 (94000 HIKSEMI … 125000 Corsair ×2); mon-27-180 ×6 (30900 MSI … 32900 HYBROK).
- Key rules: cpu-r5-9600 :72 (`all:["9600"]`, none lacks kf/k — INTENTIONAL per §5);
  ram-32gb-d5-6000 :233 + :461-469; ssd-nvme-4tb :261 (`all:["4tb"]`); mon-27-180
  :483/529/536/552/561/564; case :381-382 (meshian/hurrikan), :424-425 (cmt192/ares);
  psu :503-509. Case-budget pool (ab-live-new2.ts:1694-1699): 9900-rupture,
  11900, 13200, 14900… (rupture-aware sort verified).
- Committed baseline this session builds on: `eec78ce` (rupture-aware sorting,
  red rupture Commander buttons, variant scraping, rupture-free prices, no fake
  community builds, Inter-only fonts, buying-guide + stale-price fixes, Produits
  dropdown, BUNDLE_VETO 3400G→B550 fix, rebake 10142/1779/579 + reseed + push).
