# DZ PartPicker v0.1

Comparateur de prix de composants PC pour l'Algérie. Prix le plus bas + lien marchand.

## Run

```
npm install
npm run dev      # http://localhost:3000
npm run typecheck
npm run build
```

## Pages

- `/` categories + dès-prix
- `/category/[slug]` produits
- `/product/[id]` offres triées prix + FB paste-link
- `/builder` compat auto (8 règles) + total DA + wattage
- `/deals` bons plans (≥8% sous la moyenne, ≥2000 DA d'économie)

## Supabase (source de vérité des prix)

Les prix/offres/historique sont lus depuis Supabase (`lib/data/catalog.ts`,
client `lib/supabase.ts`). Sans les variables d'environnement, le site
bascule automatiquement sur le bake statique (`lib/data/live.ts`).

Tables : `stores` (15), `canonical_products` (355), `offers` (1153, une ligne
par produit × boutique × état), `price_history` (1094, prix min du jour par
produit × boutique). Lecture publique via RLS. Les specs produit restent
versionnées dans le code (`lib/data/products.ts`, pas de blobs en DB).

```bash
cp .env.example .env.local   # puis renseigne les valeurs
```

| Variable | Usage |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | clé anon (lecture publique RLS) |
| `NEXT_PUBLIC_SITE_URL` | URL canonique (sitemap, llms.txt) |
| `ADMIN_KEY` | console `/admin-kh7?key=...` |
| `CRON_SECRET` | `Authorization: Bearer ...` pour `/api/cron/refresh` |

Déploiement Vercel : renseigner les mêmes variables dans Project → Settings →
Environment Variables, puis redeploy. Schema : `supabase/schema.sql`.
Seed local : `node scripts/seed-from-live.cjs` puis `node scripts/push-supabase.mjs`
(voir `scripts/`, nécessite `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY`).
Cron : `GET /api/cron/refresh` 1x/jour 03:00 Alger.

## Règles de confiance

Organique toujours trié prix ASC. Hero/buy-box jamais une annonce occasion ou
en rupture tant qu'une offre neuve confirmée existe. Aucun stock affirmé sans
preuve : les offres DB s'affichent en « Prix constaté ».
