-- SEMU POS · cloud sync schema for Supabase
-- Paste this whole file into Supabase → SQL Editor → Run. Safe to run more than once.

create table if not exists public.pos_products (
  booth      text        not null,
  id         text        not null,
  data       jsonb       not null,
  updated_at timestamptz not null default now(),
  primary key (booth, id)
);

create table if not exists public.pos_sales (
  booth      text        not null,
  id         text        not null,
  data       jsonb       not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (booth, id)
);

create index if not exists pos_products_booth_idx on public.pos_products (booth);
create index if not exists pos_sales_booth_idx    on public.pos_sales (booth, created_at desc);

alter table public.pos_products enable row level security;
alter table public.pos_sales    enable row level security;

-- Access is allowed only when the request carries the same secret booth code
-- in the x-sync-key header that the row stores in the booth column.
drop policy if exists pos_products_select on public.pos_products;
drop policy if exists pos_products_insert on public.pos_products;
drop policy if exists pos_products_update on public.pos_products;
drop policy if exists pos_products_delete on public.pos_products;
drop policy if exists pos_sales_select    on public.pos_sales;
drop policy if exists pos_sales_insert    on public.pos_sales;
drop policy if exists pos_sales_update    on public.pos_sales;
drop policy if exists pos_sales_delete    on public.pos_sales;

create policy pos_products_select on public.pos_products
  for select to anon
  using (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

create policy pos_products_insert on public.pos_products
  for insert to anon
  with check (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

create policy pos_products_update on public.pos_products
  for update to anon
  using (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'))
  with check (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

create policy pos_products_delete on public.pos_products
  for delete to anon
  using (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

create policy pos_sales_select on public.pos_sales
  for select to anon
  using (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

create policy pos_sales_insert on public.pos_sales
  for insert to anon
  with check (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

create policy pos_sales_update on public.pos_sales
  for update to anon
  using (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'))
  with check (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

create policy pos_sales_delete on public.pos_sales
  for delete to anon
  using (booth = (current_setting('request.headers', true)::json ->> 'x-sync-key'));

-- Optional: quick sanity check after connecting a phone
-- select count(*) as products from public.pos_products;
-- select count(*) as sales from public.pos_sales;
