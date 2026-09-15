# Intelligent matcher — design spec (2026-09-15)

Goal: le scraper comprend chaque prix (contexte, dispo, variante) au lieu de
collecter du texte. Aucun prix combo/variante/rupture/absurde dans min/moyenne/deals.

## Locked decisions (user)

- Bundle (ex B550+3060 180kDA): parser la description → prix unitaires
  extraits et re-matchés seuls ; sinon ditch total (ni canonical ni extras public).
- Prix absurde: ditch total.
- Rupture: exclue du matching/min/moyenne/deals ; visible sur toggle explicite
  (`hideRuptured=true` existant, inchangé).
- Variantes (ex SSD 256Go→2To): 1 offre par variante avec son prix propre.

## State of the art (verified 2026-09-15)

- `bake.cjs` (~999 lines): `norm` L18-39, `RULES` L43-583 (intra-cat,
  first-match-wins), `OK_CAT` L587-601 (défaut gpu), `EXTRA_JUNK` L604
  (else-only), `BUNDLE_VETO` L612 (4 mots), `FULLPC_VETO` L617 (gpu/cpu only),
  `LAPTOP_VETO` L622, `TOOL_VETO` L627 (global), `MOBOPSU_VETO` L630,
  `isVetoed` L633-639, `variantRedirect` SSD/RAM L641-786,
  `hasDigitTokOn` L829+, store loop L883-902 (extras cap 12/cat, veto bypass),
  OK loop L907-924 (cap 150, `seenOkUrl` keep-first), cap-6 rupture-aware L926-939.
- `lib/scrapers/validate.ts`: `CATEGORY_BANDS` + `quickCheck` (scrape-level
  only — bake.cjs ne filtre aucun prix).
- `lib/scrapers/ouedkniss-api.ts:285`: description lue pour la condition puis
  JETÉE (pas de champ dans l'offre `:290-304`).
- `lib/scrapers/stores.ts`: Shopify `variants[0].price` seul (prix parent).
- `app/deals/page.tsx:20-39`: moyenne naïve, n>=2 — sensible aux absurdes.
- Pending indépendants: §7.1 ADATA norm-split + §7.2 règle `27g42e`
  (MATCHER-CONTEXT.md) — à appliquer avant, re-probe baseline.

## Architecture

```
[stores/OK scrape] → offre structurée {title, priceDa, description?,
  variants[]?, stock: in|out|unknown|order}
→ [bake gates, ordre strict] stock-out? exclu → bundle? split/ditch →
  variant-match → matchRule → bande prix → ditch hors-bande
→ [cap-6 + tri rupture-aware] → live.ts → seed → Supabase → UI
```

Principe: le scraper structure (comprend), le matcher décide (ditch strict,
jamais de devinette).

## Components

1. **Offer shape**: `+description?`, `+variants?: {label,capacityGB?,priceDa,sku?}[]`,
   stock enum `in|out|unknown|order` (`sur commande`→order). Plomber description
   OK: `ouedkniss-api.ts` → `ouedkniss.ts` → `route.ts` → `refresh-full.mjs` →
   `full.json` → bake.
2. **Bundle detector** (toutes catégories, avant matchRule): compte familles
   produit (tokens RULES) dans titre+description ; ≥2 → extrait prix unitaires
   (`/nom + (\d[\d\s]*) da/` par ligne) → sous-offres re-matchées ; sinon ditch.
3. **Price gates** (bake, avant slice cap-6): `CATEGORY_BANDS` + bande produit
   `médiane des prix seed du produit × [0.4, 2.5]` → ditch. Seuils ajustables après re-probe.
4. **Stock**: `isOut` étendu (épuisé/rupture/sold out/0 en stock/qté 0) ; out
   exclu matching/min/moyenne/deals ; front toggle inchangé.
5. **Variants**: page à options → 1 offre/variante ; prix parent sans capacité
   → plus petite capacité du titre uniquement (étendre `variantRedirect` à
   gpu VRAM, psu wattage, moniteur Hz) ; sinon ditch.
6. **Stats**: deals + ProductOffersTable moyenne→médiane, deals n>=3.

## Error handling

Aucune inférence silencieuse: tout ce qui n'est pas rattachable avec certitude
est ditché (pas d'extras public pour bundles/absurdes — quarantaine admin
optionnelle plus tard). Description/variantes absentes → comportement actuel
conservé (pas de régression si API OK change).

## Testing

- Re-probe `probe-ab3.cjs` vert (après §7.1/§7.2).
- Cas ciblés: `B550+3060 180k` → split ou ditch, jamais prix 3060 ;
  `SSD 2To à 9500` (prix 256Go) → match 256Go seul ; `épuisé` exclu du min ;
  produit piégé → médiane deals saine.
- `npm run typecheck` + `npm run build` avant push Supabase.

## Non-goals

Pas de fiche /combos publique, pas de seuils auto-apprenants,
`lib/match/advanced.ts` reste mort, pas de refonte scrapers hors
description/variantes/stock.
