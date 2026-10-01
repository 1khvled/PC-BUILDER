# DZ PartPicker — Agent Context

**Read this before touching the repo.** It records the decisions that are not
obvious from the code, the boundaries between agents, and the environment
gotchas that have already cost hours on this project.

- **Repo:** `C:\Users\Abdelli\Desktop\Projects\DZ-PartPicker`
- **Remote:** `https://github.com/1khvled/PC-BUILDER.git` (branch `main`)
- **Stack:** Next.js (App Router) + TypeScript + Tailwind. No component library.
- **Live:** deployed on Vercel as `pcbuilder-psi.vercel.app`.

---

## 1. What the site is

A price comparison engine for PC components in **Algeria**. It scrapes offers
from 180+ Algerian shops, normalises them, and shows the cheapest price per
product in **Algerian Dinars (DA)**, with delivery across 58 wilayas. Most
Algerian shops sell cash-on-delivery, which shapes almost every design
decision (see §6).

The commercial proposition is **zero commission** and **100% organic ranking**.
That is a real constraint, not marketing copy — see `docs/MONETIZATION-PLAN.md`
for why any future revenue model must not touch the price or the rank.

---

## 2. Ownership boundaries — read this first

Two agents have been working on this repo. **Do not silently revert or rewrite
the other one's commits.** If you need a file they own, coordinate first.

| Area | Files | Notes |
|---|---|---|
| **UI / SEO / marketing / security** | `components/*`, `app/globals.css`, `app/layout.tsx`, `lib/i18n/*`, `next.config.mjs`, `docs/*` | Design system, bilingual routing, dark mode, metadata, Bytek ads |
| **Algo / scraping / catalogue** | `bake.cjs`, `lib/data/live.ts`, `lib/data/products.ts`, `lib/data/live-images-src.json`, `supabase-seed.json`, `scripts/scrape-*.cjs`, `scripts/test-*.cjs` | Offer ingestion, normalisation, product matching |
| **Shared / careful** | `app/category/[slug]/page.tsx`, `app/product/[id]/page.tsx`, `app/deals/page.tsx`, `app/guides/**`, `app/prebuilds/page.tsx` | Both agents have edited these. Read before writing. |

`middleware.ts` belongs to the scraping side (CSP, HSTS, rate limiting). It is
load-bearing for security — do not weaken its headers.

---

## 3. Bilingual routing (changed recently — easy to get wrong)

**English is the site default. French lives under `/fr`.**

```
English (default)   /        /category/cpu  /product/xyz  /builder
                    /deals  /guides  /prebuilds  /llms.txt  /sitemap.xml
French              /fr      /fr/category/cpu  /fr/product/xyz  /fr/builder
                    /fr/deals  /fr/guides  /fr/prebuilds  /fr/llms.txt
```

`/en/*` used to be the English prefix. It is now **308-redirected** to the
unprefixed equivalent (`next.config.mjs`), so old links keep working and no
page is ever served at two URLs.

### The rules that matter

1. **`lib/i18n/config.ts` is the single source of truth.** Never hardcode `/en`
   or `/fr` in a link. Use `localizedPath(path, locale)`.

2. **`languageAlternates(path, self)` takes a LOCALE-AGNOSTIC path.** Pass
   `/category/cpu`, never `/fr/category/cpu`. Prefixing it yields `/fr/fr/...`
   and canonicalises the page to itself.

3. **`languageAlternates`' `self` defaults to the literal `"fr"`, not
   `DEFAULT_LOCALE`.** This looks like a bug and is not. The French pages are
   the ones that call it *without* an argument. Had it followed
   `DEFAULT_LOCALE`, flipping the default locale would have canonicalised every
   French page to its English twin. If you add a page, pass `self` explicitly
   anyway.

4. **Components that default a `locale` prop to `DEFAULT_LOCALE` are a trap.**
   `BytekAd`, `ProductOffersTable`, `CategoryCatalogClient`, `PrebuildsClient`
   all do. Any page that renders them **must pass `locale` explicitly**,
   otherwise it renders the default language. This already caused a real bug:
   when the default flipped, six French call sites silently rendered English
   ads and tables.

5. **Shared chrome resolves its locale from the DOM, not from context.**
   `Header`/`Footer` live in the root layout, i.e. *outside* the `/fr`
   `I18nProvider`. `useLocale()` prefers context, so **the root layout must not
   mount a provider** — doing so pins the whole chrome to one language. The
   `/fr` layout emits a pre-paint inline script that sets
   `<html data-locale="fr">` before first paint; that is what the chrome reads.

6. **Dictionaries:** `lib/i18n/dictionaries/fr.ts` is the shape source and
   `en.ts` is typed against it, so a missing English key is a **compile error**.
   Both are ~420 keys. When adding a key, add it to `fr.ts` first.

---

## 4. Dark mode

- `darkMode: "class"` in `tailwind.config.js`; the `.dark` class is toggled on
  `<html>`.
- **The theme is resolved pre-paint** by a blocking inline script in
  `app/layout.tsx` (`themeInit`). Do not move it to an effect — that causes a
  white flash before the dark palette settles.
- The dark palette is applied through **one unlayered `.dark` block in
  `app/globals.css`** that remaps ~500 light-mode utility usages at once.
  Unlayered CSS beats Tailwind's `utilities` layer; that is the whole trick.
  Editing 500 call sites instead is how this got done in one commit.

### The trap

`.dark .bg-white { background-color: #161922; }` is correct for cards and
**wrong behind a dark brand mark**. The Bytek Store wordmark is dark navy; put
it on `bg-white` and it disappears in dark mode. There is now a
`.dz-light-tile` class that is always white. **Use it behind any dark logo.**

---

## 5. Verification workflow

```powershell
cd C:\Users\Abdelli\Desktop\Projects\DZ-PartPicker

# 1. types + build (always both - see gotcha below)
npx tsc --noEmit -p tsconfig.json
$env:NODE_ENV="production"; npx next build

# 2. serve and check over HTTP
npx next start -p 4641
```

**Do not trust `tsc` alone.** Next.js has rules `tsc` cannot see — most
importantly, *you cannot export `metadata` from a `"use client"` module*. That
is why `app/builder/page.tsx` has no metadata and it lives in
`app/builder/layout.tsx` instead. Always run the real build.

**Verify over HTTP, not the browser, for correctness.** Browser probes after
`tabs.open()` race hydration and produce convincing false positives — during
this work a healthy `/en/deals` twice looked like an empty page, and a
correctly HTML-escaped `&amp;` looked like a double-escaping bug. Use
`Invoke-WebRequest` / `curl.exe` for "is this page correct" questions, and the
browser only for "does this look right".

`curl.exe -s -o NUL -w "%{http_code} %{redirect_url}" <url>` is the quick way
to check a redirect chain.

---

## 6. Domain constraints that shape decisions

- **Cash on delivery is the norm.** No card, no chargebacks. Attribution and
  refunds are manual. This is the main reason affiliate/performance models are
  rejected in the monetization plan.
- **Prices are small** (a GPU is a few hundred thousand DA), so any per-order
  fee has to be a rounding error or merchants refuse.
- **Merchant concentration:** many offers come from a handful of shops plus
  Ouedkniss listings, which has no affiliate programme.
- **Organic ranking is never sold.** If you add a paid placement, it must be
  visually labelled and carry `rel="sponsored"`.

---

## 7. Environment gotchas (each of these cost real time)

**PowerShell**
- `[System.IO.File]` does **not** use PowerShell's current directory. Always
  pass absolute paths.
- In a **double-quoted** string a backtick is an escape character, so
  `"href={\`/product"` silently becomes `href={/product` and any rule built
  from it never matches. Use **single-quoted** strings for patterns containing
  backticks.
- `Get-ChildItem -Recurse -Include` needs a wildcard path or `-Filter`;
  otherwise it can return nothing and a loop over it fails silently.
- Reading a script containing non-ASCII: `Get-Content -Raw -Encoding UTF8`
  then `Invoke-Expression`. Writing text with accents: build the string with
  `[char]0x00E8` etc. and `WriteAllText` with a UTF8 encoding, or verify the
  code points afterwards — the console renders them as `?` and hides the damage.
- Reserved-ish names that collide with built-in aliases: `R` (Invoke-History),
  `H` (Get-History). Use descriptive function names.

**The `edit` tool**
- Do **not** use `edit` on a file after patching it with PowerShell. `edit`
  writes from a stale copy and silently reverts the file to an older state.
  This destroyed work twice (both `Header.tsx` and `PriceChart.tsx` were
  reverted to HEAD). **Use `PowerShell [System.IO.File]::ReadAllText /
  WriteAllText` with absolute paths for edits.**

**Next.js**
- Stale `.next/types` breaks the build after a route is deleted or moved:
  `Remove-Item -Recurse -Force .next\types` then rebuild.
- `curl.exe` exists but `curl` is aliased; use the `.exe` explicitly.

**Git**
- Other agents use `git add -A`, which sweeps your in-progress work into their
  commit. Commit your own paths explicitly rather than `-A`.
- Never revert or amend a commit you did not author.

---

## 8. The ops console (INTERNAL — do not link publicly)

**Path: `/ops-4fkq`** (login at `/ops-4fkq/login`).

This path is deliberately unguessable and is not linked from anywhere on the
public site. It replaced `/admin-kh7`, which was a guessable placeholder and is
still in git history — both old paths now 308 to the new one.

| Path | Purpose |
|---|---|
| `app/ops-4fkq/page.tsx` | Console shell. `force-dynamic` + `runtime = "nodejs"` are both load-bearing. |
| `app/ops-4fkq/login/page.tsx` | Login. Server action, generic error, no field-level feedback. |
| `lib/admin/auth.ts` | Session cookies, timing-safe compare, fail-closed `isAuthenticated()`. |
| `lib/admin/data.ts` | `buildAdminData()` — the single fetch + compute pass. |
| `components/admin/` | `AdminShell` (tabs) + one panel per tab + `ui.tsx` primitives. |

**Credentials:** `ADMIN_USERNAME` + `ADMIN_PASSWORD` (not `ADMIN_KEY`, which is
burned and in git history). Setting them requires a **redeploy** — env changes
only apply to fresh deployments.

**Why `force-dynamic`:** without it the route is prerendered at build time and
the auth result is frozen into a static file. Measured before it existed: correct
password, wrong password and no password all returned a byte-identical 47KB
page. Never remove it.

**Why `runtime = "nodejs"`:** `lib/admin/auth` uses `node:crypto`. Edge cannot
resolve it at module load and throws on every request.

**Do not** add the console path to the sitemap, `llms.txt`, the header, the
footer, or any public component. It is disallow-listed in `app/robots.ts` and
carries `noindex`.

---

## 9. Known outstanding issues

1. **`ADMIN_PASSWORD` must be rotated.** The first generated value is in this
   conversation and in shell history. The gate fails closed (no hardcoded
   fallback, length-independent compare, generic login errors) but the
   credential itself must be replaced. Set it in Vercel, then redeploy.

2. **`NEXT_PUBLIC_SITE_URL` is wrong locally.** `.env.local` has
   `localhost:3000` and takes precedence over `.env.production`, so canonical
   and hreflang URLs resolve to localhost in local builds. Verify the Vercel
   env var is `https://pcbuilder-psi.vercel.app`.

3. **Duplicate JSON-LD on `/fr`.** The root layout always emits the English
   graph, so French pages carry both (two `Organization` nodes, differing
   `inLanguage`). Proper fix is two root layouts via route groups, which means
   moving page files again. It also currently costs the home page its static
   rendering, so it was deliberately left alone.

4. **The builder is duplicated.** `app/builder/page.tsx` and
   `app/fr/builder/page.tsx` are ~900-line near-copies. Any builder change must
   be applied **twice**. This is the main argument for eventually merging them.

5. **The live site may still be on an older build** — check after deploying.

---

## 9. Where things live

| Path | What |
|---|---|
| `app/layout.tsx` | Root layout: English metadata, theme bootstrap, shared chrome |
| `app/fr/layout.tsx` | French layout: pre-paint locale script, fr metadata/JSON-LD |
| `lib/i18n/config.ts` | Routing, hreflang, number/price formatting |
| `lib/i18n/dictionaries/` | `fr.ts` (shape source) + `en.ts` (compile-checked) |
| `lib/i18n/client.tsx` | `I18nProvider`, `useLocale`, `useI18n` |
| `app/globals.css` | Design tokens + the unlayered `.dark` remap block |
| `components/BytekAd.tsx` | Sponsor placements (own store: bytekstore.shop) |
| `lib/admin/data.ts` | One fetch + compute pass for the whole ops console |
| `components/admin/` | Ops console: `AdminShell` + one panel per tab + `ui.tsx` |
| `docs/MONETIZATION-PLAN.md` | Revenue plan — **planning only, nothing implemented** |
| `middleware.ts` | CSP, HSTS, rate limiting (scraping side) |

---

## 10. Ground rules

- Small, verifiable commits with a message that explains **why**, not what.
- Run `npx tsc --noEmit` **and** `npx next build` before claiming done.
- Never weaken `middleware.ts` security headers.
- Never sell or alter organic ranking.
- If a change touches a file listed as "shared" in §2, read it fully first.
