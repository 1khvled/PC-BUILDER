-- DZ-PartPicker LEAN schema v2 for Supabase free tier (500MB).
-- Design rules: integer/smallint everywhere, short bounded varchars, NO blobs,
-- NO raw HTML, specs live in code (versioned with deploys), history canonical-only,
-- market extras are re-scraped and NEVER stored. Run once in SQL editor.
--
-- Size math (worst case): offers ~200 rows x ~150B = 30KB.
-- price_history: 22 products x ~12 stores x 400 days = ~106k rows x ~90B ~= 10MB.
-- Total under 15MB: 30x headroom inside 500MB for a decade.

create table if not exists stores (
  id smallserial primary key,
  name text unique not null,
  wilaya text not null default 'Alger'
);

create table if not exists canonical_products (
  id text primary key,
  category text not null,
  brand text not null,
  model text not null
);

-- current snapshot: one row per (product, store, condition). Re-upserted daily.
create table if not exists offers (
  product_id text not null references canonical_products(id) on delete cascade,
  store_id smallint not null references stores(id) on delete cascade,
  price_da integer not null check (price_da > 0),
  cond smallint not null default 1, -- 1 = new, 0 = used
  url varchar(160) not null default '',
  title varchar(90) not null default '',
  day date not null default current_date,
  primary key (product_id, store_id, cond)
);

-- append-only daily snapshot for charts. Pruned to 400 days (see bottom).
create table if not exists price_history (
  product_id text not null,
  store_id smallint not null,
  price_da integer not null,
  day date not null default current_date,
  primary key (product_id, store_id, day)
);
create index if not exists price_history_day_idx on price_history (day);
create index if not exists price_history_product_idx on price_history (product_id);

-- public read, service-role write only
alter table stores enable row level security;
alter table canonical_products enable row level security;
alter table offers enable row level security;
alter table price_history enable row level security;

drop policy if exists "public read" on stores;
drop policy if exists "public read" on canonical_products;
drop policy if exists "public read" on offers;
drop policy if exists "public read" on price_history;
create policy "public read" on stores for select using (true);
create policy "public read" on canonical_products for select using (true);
create policy "public read" on offers for select using (true);
create policy "public read" on price_history for select using (true);

-- RETENTION (run daily after push, or as pg_cron):
-- delete from price_history where day < current_date - 400;
