# DZ PartPicker v0.1

Replica pcpartpicker `/list` pour l'Algérie. Prix le plus bas + lien.

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

## Supabase
Run `supabase/schema.sql` once, then seed `canonical_products` (300 visés, 14 en sample).
Cron: `GET /api/cron/refresh` 1x/jour 03:00 Alger (header `Authorization: Bearer $CRON_SECRET`).

## Règles de confiance
Organique toujours trié prix ASC. Sponsorisé (table prête, UI off) badge max 3, jamais dans le tri.
