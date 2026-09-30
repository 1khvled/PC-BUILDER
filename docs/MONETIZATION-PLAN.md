# Monetization Plan — DZ PartPicker

**Status: PLANNING ONLY — nothing in this document is implemented.**

This exists so the commercial model is decided deliberately rather than
reactively, and so future work has a written target. No code, billing,
tracking or contractual change has been made. Every number below is a
hypothesis to validate, not a forecast.

---

## 1. Where we actually stand

The site is already 100% independent and zero-commission. That is a real
asset, not just a slogan: the trust that earns clicks ("prix les plus bas,
zéro commission") is incompatible with quietly taking money on the offers a
user clicks. Any model below has to keep that promise intact or the brand
collapses.

Assets we have today:

- 4316 indexed offers, refreshed daily, across 180+ Algerian stores
- 58-wilaya delivery coverage, most stores cash-on-delivery
- ~4.3k products across 9 categories
- Organic + AI-engine presence (`llms.txt`, `llms-full.txt`, hreflang FR/EN)
- One direct sponsor: **bytekstore.shop** (own store), already instrumented
  with per-placement `utm_content`

Constraints that shape every option:

- Algerian purchasing power. Absolute prices are small (a GPU is a few hundred
  thousand DA), so any fee must be a rounding error per order or the merchant
  simply refuses.
- Merchant concentration: many offers come from a handful of shops plus
  Ouedkniss listings. A merchant-funded model needs enough paying merchants to
  matter.
- Cash-on-delivery is the norm. Refunds and chargebacks are not a normal card
  mechanism; disputes are resolved by hand. That raises the real cost of any
  "pay to boost" scheme.

---

## 2. Options considered

### Option A — Sponsorship packages (recommended)

Fixed-fee placements, sold like advertising, not like pay-per-click.

| Placement | Shape | Why it works here |
|---|---|---|
| Homepage banner | Currently Bytek Store | Highest reach, already instrumented |
| Product-page strip | Added next to offers | Purchase intent already expressed |
| Category sponsorship | "Featured in GPU" | Category pages get steady high-intent traffic |
| Newsletter / digest | Weekly "best drops" | Own audience, zero merchant dependency |
| Guide sponsorship | A guide "sponsored by" note | High trust transfer, low clutter |

Pricing: flat monthly by placement, tiered by exclusivity, priced per thousand
impressions rather than per click. Sponsors are the store itself first, then
the larger merchants.

**Why this first:** it is the only model that does not touch the price the user
sees or the ranking they click. It also already works — we can invoice the
first sponsor today with the utm data we just added.

### Option B — Merchant subscription (ranked listing)

Merchants pay a monthly fee to appear above the organic list within their own
category.

- **Must be visually unmistakable.** Label it clearly as a paid placement and
  keep it in a separate block. An unmarked "sponsored" slot above organic
  results would be the single most damaging thing this site could do.
- **Never sell the organic order.** The product ranking is the product.
  If a merchant pays for position, they buy a labelled slot, not a better rank
  in the comparison table.
- Cap the number of paid slots per category, or the page stops being a
  comparison tool.

### Option C — Affiliate / performance fee

A percentage per confirmed sale.

Rejected **for now**, not on principle:

- Cash-on-delivery means attribution and confirmation are manual and slow.
- Ouedkniss listings have no affiliate program.
- A percentage on a low-margin hardware order is often smaller than the
  merchant's operating cost, so it would be declined even when offered.

Revisit only if Bytek Store (direct, so we control attribution) plus a handful
of merchants with tracked programs make it workable. It could then be tested on
Bytek's own SKUs first.

### Option D — Display ads (Google AdSense or equivalent)

Rejected. The audience is price-sensitive and the intent is transactional;
banner ads would cost us page speed and trust for very little revenue at this
traffic level.

---

## 3. Sequencing

1. **Instrument first (done).** `utm_content` per placement, so any future
   pricing conversation is based on real traffic, not estimates.
2. **Measure.** Add first-party analytics (privacy-respecting, no cross-site
   tracking) and record impressions + outbound clicks per placement. Without
   this, no price below can be justified.
3. **Sell the first sponsorship properly.** Formalise the homepage and
   product-page slots, with a written rate card and an exclusivity rule.
4. **Introduce the newsletter** as a direct channel that does not depend on
   merchants bidding against each other.
5. **Only then** evaluate a labelled merchant subscription, piloted in one
   category.

---

## 4. Guardrails (non-negotiable)

These are the lines that keep the project worth using:

1. **Organic ranking is never sold.** No amount of money changes where a real
   offer sits in the price table.
2. **Every paid placement is labelled**, visibly, to users and to crawlers
   (`rel="sponsored"` on outbound links).
3. **Out-of-stock and expired offers are never promoted** for money — the
   other agent's scraper logic purges those, and a paid slot must not be a way
   to resurrect them.
4. **No paywall on price data.** Prices stay public; that is the whole value.
5. **Editorial independence is stated on the page** whenever a sponsor is
   present.

---

## 5. Open questions to resolve before selling anything

- Traffic baseline: what are real monthly sessions per placement? *(unknown —
  needs analytics)*
- Does the audience convert on the product-page strip, or only on the
  homepage? *(the utm tags will answer this within a month)*
- Can the other merchants afford sponsorship, or is the sponsorship market
  effectively just Bytek Store? *(determines whether this is a business or a
  side income)*
- Is a newsletter viable at this traffic level, and who writes it? *(likely the
  largest single lever and the cheapest to build)*
- Do we want an ad-sales contact, and is that a person or the site owner?
  *(sales overhead decides whether sponsorship is worth the time)*

---

## 6. Explicitly not doing now

- No payment integration, no ad server, no merchant dashboard, no invoicing.
- No change to ranking, no paid slots in code, no pricing changes.
- No contracts or outreach. This document is a decision aid, not a commitment.
