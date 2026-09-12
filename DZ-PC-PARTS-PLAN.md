# DZ PartPicker — Full Build Plan (v1 MVP)
Date: 2026-09-12 | Goal: pcpartpicker.com/list/ replica for Algeria, lowest price + link

## 1. MVP Definition (what ships first)
**In scope:**
- ~300 canonical parts covering 80% of DZ sales: CPU 40, GPU 40, Mobo 40, RAM 30, SSD 30, PSU 30, Case 30, Cooler 30, Monitor 30
- Price comparison per product: list of offers sorted by price ASC, each with store, price DA, stock, link, updated_at
- Sources: 10 DZ stores (daily scrape) + Ouedkniss NEW only (daily) . FB = paste-link only, no background scrape (MCP proven dead 2026-09-12: 0 results even NYC/Paris)
- Builder v1: pick 1 part per category, compatibility warnings, total DA, shareable link
- Price history chart (30d) + wilaya filter (Alger/Setif/Oran default)

**Out of scope v1:** FB auto-feed, used marketplace, accounts/checkout, SaaS dashboard, sponsored rank (schema ready, UI off), mobile app.

**Success criteria:** 300 products each with >=2 offers, daily refresh <6h, builder blocks incompatible socket/RAM/PSU.

## 2. Tech Stack ($0 free tier)
- Frontend: Next.js 14 App Router + Tailwind, deployed Vercel Hobby
- DB: Supabase Postgres free (500MB) + Supabase Auth (later)
- Scrapers: TypeScript + Cheerio (WooCommerce/WordPress stores) + Playwright fallback (JS-heavy only), run on Vercel Cron 1x/day 03:00 Algiers
- Ouedkniss: direct GraphQL replay (no browser), Python ref exists, port to TS fetch
- Hosting images: Supabase Storage, product images hotlinked + cached
- No paid APIs. No proxies v1 (polite 1 req/2s per store).

## 3. Architecture
```
[Stores HTML/GraphQL] -> [scrapers/adapters] -> [raw_offers] -> [normalizer/matcher] -> [offers -> canonical_products]
[Ouedkniss GraphQL] ---^
[FB paste link] -> [get_listing on-demand] -> [offers] (no cron)
[canonical_products + offers] -> [Next.js: /category /product/:id /builder] + [compat engine] + [price_history]
                                          -> [cron refresh + dedup + alerts]
```
Repo layout:
```
/app/(site)/page.tsx /category/[slug] /product/[id] /builder
/lib/scrapers/{licb.ts,digitec.ts,clickdz.ts,wifidjelfa.ts,ouedkniss.ts,base.ts}
/lib/match/normalize.ts aliases.json
/lib/compat/check.ts watt.ts
/supabase/{schema.sql,seed_canonical.sql}
```

## 4. DB Schema (Supabase)
```sql
-- canonical catalog (manual, ~300 rows)
canonical_products(id uuid pk, category text, brand text, model text, specs jsonb, image_url text);
-- aliases for matcher
aliases(id uuid pk, product_id fk, alias text unique, source text);
-- stores
stores(id uuid pk, name text, base_url text, wilaya text, adapter text, active bool);
-- raw + clean offers
offers(id uuid pk, product_id fk, store text, title_raw text, price_da int, url text, stock text, condition text default 'new', wilaya text, scraped_at timestamptz);
-- history (1 row/day/product/store)
price_history(product_id fk, store text, price_da int, day date, pk(product_id,store,day));
-- sponsored hooks (OFF v1, schema only)
sponsored_slots(id uuid pk, product_id fk, store text, starts_at date, ends_at date, active bool default false);
-- builder lists
builds(id uuid pk, items jsonb, total_da int, created_at timestamptz);
```
Indexes: offers(product_id, price_da), price_history(product_id, day). Size est: 300 products + ~3000 offers + 90d history ~270k rows <80MB. Fits free.

Seed specs per category (minimal for compat):
- cpu: {socket, tdp, igpu:bool, ram_type:[DDR4|DDR5]}
- mobo: {socket, chipset, ram_type, form_factor:ATX|mATX|ITX, m2:int}
- ram: {type, capacity_gb, speed}
- gpu: {length_mm, tdp_w, pins}
- psu: {wattage, rating}
- case: {max_gpu_mm, max_cooler_mm, supports:[ATX,mATX,ITX]}
- cooler: {height_mm, sockets:[]}
- ssd: {interface:NVME|SATA}
- monitor: {size, hz} (no compat check)

## 5. Store Adapters v1 (10)
LICB+, Digitec, Click-DZ, WifiDjelfa + 6 more WooCommerce (add as found). One adapter per store: `list(categoryUrl) -> [{title, price, url, stock}]`. All extend base with retry + UA + 2s delay. Selector config in `stores/{name}.json` so non-dev can fix when markup changes. Ouedkniss adapter: GraphQL search `keywords + condition=new`, map to same shape, wilaya parsed, skip bundles containing `config|pack+cpu+gpu` (no canonical match -> quarantine table for manual alias).

## 6. Matcher (simple, 80% rule)
`normalize(title)`: lowercase, unaccent, `12go->12gb`, `ti` spacing, strip `neuf|original|garantie`.
Match: exact alias hit -> assign product_id, else token score (brand+model+size must all match) >=0.85 assign, else quarantine. Alias map example: `rtx 3060 12g|3060 12gb|rtx3060 12go -> gpu_rtx3060_12gb`. Maintain `aliases.json` manually, ~600 entries for 300 products. Review quarantine 10min/day first month.

## 7. Compatibility Engine (code, not data)
Function `check(build): warnings[]` — 8 rules:
1. cpu.socket == mobo.socket else BLOCK
2. cpu.ram_type == mobo.ram_type == ram.type else BLOCK
3. gpu.length_mm <= case.max_gpu_mm else BLOCK
4. cooler.height_mm <= case.max_cooler_mm + socket in cooler.sockets else WARN
5. mobo.form_factor in case.supports else BLOCK
6. psu.wattage >= (cpu.tdp + gpu.tdp + 150) * 1.3 else WARN (formula in watt.ts)
7. ssd.interface NVME requires mobo.m2 >=1 else WARN
8. old chipset + new CPU (B450+Ryzen5000 etc.) -> BIOS WARN
No DB for rules. Unit-test with 20 builds (compatible + each failure).

## 8. Frontend + API
Pages: `/` (search + categories + cheapest builds), `/category/[slug]` (filters: brand, price, wilaya, in-stock), `/product/[id]` (lowest first table + history chart + Ouedkniss section + FB paste box), `/builder` (7 slots, live total, warnings, copy link).
API: `GET /api/products?q=&cat=` `GET /api/product/:id/offers` `POST /api/builds` `POST /api/fb-resolve {url}`. All cached 1h (ISR). Trust rule: organic sort price ASC always; sponsored component exists but `active=false` hides it.

## 9. Cron + Ops
- 03:00 daily: stores sequential (not parallel, avoid ban), Ouedkniss after, matcher, history snapshot, Vercel build hook only if prices changed >1%
- Per-run logs: offers count per store, quarantine count, duration. Alert if store 0 offers 2 days (selector broken)
- robots.txt respect + attribution + outbound link (stores want traffic). UA: `DZPartPicker-bot +contact`
- Backups: Supabase daily (free PITR 7d)

## 10. Roadmap (6 weeks, solo)
- W1: schema.sql + seed 300 canonical + aliases.json + `/category` + `/product` static with mock offers
- W2: 4 store adapters + normalizer + offers table wired, history chart
- W3: +6 stores + Ouedkniss adapter + quarantine review UI + cron
- W4: builder + compat engine + 20 tests + share link
- W5: search (Algerian French/Arabic tokens), wilaya filter, SEO (sitemap, Arabic slugs), perf
- W6: beta with 5 stores (get whitelist permission), fix selectors, launch Algiers/Setif/Oran only
- Later: FB on-demand resolve, boutique subs, SaaS price-intel dashboard, sponsored slots ON.

## 11. Costs / Risks
Cost $0 until ~50k users (then Supabase Pro $25 + proxies $30). Risks: selector breakage (mitigate: config JSON + alerts), Ouedkniss GraphQL doc change (pin + fallback HTML), FB ToS (no auto-scrape, paste-only), trust (never sell organic rank — sponsored labeled, max 3).

## 12. Next actions
1. Approve stack + 10-store list
2. Create Supabase project + run schema.sql
3. Seed 40 GPUs + 40 CPUs first (highest traffic), then rest
4. Build 1 adapter (LICB+) as template, clone for others
