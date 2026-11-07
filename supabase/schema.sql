-- LOKALENS Perak: database schema
-- Run once in Supabase Dashboard > SQL Editor. Then run seed.sql.
-- Also enable: Authentication > Sign In / Providers > Anonymous sign-ins.

create extension if not exists pgcrypto;

-- ---------- merchants ----------
create table if not exists public.merchants (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid references auth.users on delete set null,
  name          text not null check (char_length(name) between 2 and 80),
  district      text not null check (district in ('Kinta', 'Kuala Kangsar')),
  town          text,
  category      text not null check (category in
                  ('Makanan','Minuman & Kopi','Kuih & Pastri','Kraftangan','Produk Tani','Pengalaman')),
  description   text check (char_length(description) <= 600),
  products      text[] not null default '{}',
  tags          text[] not null default '{}',
  open_time     text check (open_time ~ '^\d{2}:\d{2}$'),
  close_time    text check (close_time ~ '^\d{2}:\d{2}$'),
  open_days     text,
  lat           double precision,
  lng           double precision,
  phone         text check (phone ~ '^60\d{8,11}$'),
  emoji         text,
  photos        text[] not null default '{}',
  is_sample     boolean not null default false,
  is_published  boolean not null default true,
  created_at    timestamptz not null default now()
);
alter table public.merchants add column if not exists address text;
alter table public.merchants add column if not exists tiktok_url text;
alter table public.merchants add column if not exists avg_rating numeric(3,2) not null default 0;
alter table public.merchants add column if not exists review_count integer not null default 0;
-- One shop per merchant account in the prototype
create unique index if not exists merchants_one_per_owner on public.merchants (owner_id) where owner_id is not null;
create index if not exists merchants_district on public.merchants (district) where is_published;

-- ---------- visitor events (analytics) ----------
create table if not exists public.events (
  id           bigserial primary key,
  merchant_id  uuid not null references public.merchants on delete cascade,
  type         text not null check (type in ('view', 'whatsapp', 'navigate')),
  created_at   timestamptz not null default now()
);
create index if not exists events_merchant_time on public.events (merchant_id, created_at desc);

-- ---------- district highlights ----------
create table if not exists public.highlights (
  id          uuid primary key default gen_random_uuid(),
  district    text not null check (district in ('Kinta', 'Kuala Kangsar')),
  title       text not null,
  summary     text not null,
  is_sample   boolean not null default false,
  created_at  timestamptz not null default now()
);

-- ---------- visitor reviews ----------
create table if not exists public.reviews (
  id            uuid primary key default gen_random_uuid(),
  merchant_id   uuid not null references public.merchants on delete cascade,
  visitor_name  text not null check (char_length(btrim(visitor_name)) between 1 and 60),
  rating        integer not null check (rating between 1 and 5),
  comment       text check (char_length(comment) <= 1000),
  created_at    timestamptz not null default now()
);
create index if not exists reviews_merchant_time on public.reviews (merchant_id, created_at desc);

-- ---------- row level security ----------
alter table public.merchants  enable row level security;
alter table public.events     enable row level security;
alter table public.highlights enable row level security;
alter table public.reviews    enable row level security;

drop policy if exists "read published or own" on public.merchants;
create policy "read published or own" on public.merchants
  for select using (is_published or owner_id = auth.uid());

drop policy if exists "owner inserts own shop" on public.merchants;
create policy "owner inserts own shop" on public.merchants
  for insert to authenticated
  with check (owner_id = auth.uid() and is_sample = false);

drop policy if exists "owner updates own shop" on public.merchants;
create policy "owner updates own shop" on public.merchants
  for update to authenticated
  using (owner_id = auth.uid()) with check (owner_id = auth.uid() and is_sample = false);

-- Anyone logs events. Nobody reads raw events; stats come from the function below.
drop policy if exists "anyone logs events" on public.events;
create policy "anyone logs events" on public.events
  for insert to anon, authenticated with check (true);

drop policy if exists "anyone reads highlights" on public.highlights;
create policy "anyone reads highlights" on public.highlights
  for select using (true);
-- Highlights are written only by the edge function (service role).

drop policy if exists "read reviews for published merchants" on public.reviews;
create policy "read reviews for published merchants" on public.reviews
  for select to anon, authenticated
  using (exists (
    select 1 from public.merchants m
    where m.id = merchant_id and m.is_published
  ));

drop policy if exists "visitors review published merchants" on public.reviews;
create policy "visitors review published merchants" on public.reviews
  for insert to anon, authenticated
  with check (
    char_length(btrim(visitor_name)) between 1 and 60
    and rating between 1 and 5
    and (comment is null or char_length(comment) <= 1000)
    and exists (
      select 1 from public.merchants m
      where m.id = merchant_id and m.is_published
    )
  );
grant select, insert on public.reviews to anon, authenticated;

create or replace function public.update_merchant_rating()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.merchants m
  set avg_rating = stats.avg_rating,
      review_count = stats.review_count
  from (
    select coalesce(avg(r.rating), 0)::numeric(3,2) as avg_rating,
           count(*)::integer as review_count
    from public.reviews r
    where r.merchant_id = new.merchant_id
  ) stats
  where m.id = new.merchant_id;
  return new;
end;
$$;
revoke all on function public.update_merchant_rating() from public, anon, authenticated;

drop trigger if exists update_merchant_rating_trigger on public.reviews;
create trigger update_merchant_rating_trigger
after insert on public.reviews
for each row execute function public.update_merchant_rating();

-- ---------- merchant stats ----------
-- Owner sees own stats. Sample shops are open for the demo.
create or replace function public.merchant_stats(mid uuid)
returns table (
  views_7d int, wa_7d int, nav_7d int,
  views_prev int, wa_prev int,
  views_total int, wa_total int
)
language sql
security definer
set search_path = public
as $$
  select
    count(*) filter (where e.type = 'view'     and e.created_at >= now() - interval '7 days')::int,
    count(*) filter (where e.type = 'whatsapp' and e.created_at >= now() - interval '7 days')::int,
    count(*) filter (where e.type = 'navigate' and e.created_at >= now() - interval '7 days')::int,
    count(*) filter (where e.type = 'view'     and e.created_at <  now() - interval '7 days'
                                               and e.created_at >= now() - interval '14 days')::int,
    count(*) filter (where e.type = 'whatsapp' and e.created_at <  now() - interval '7 days'
                                               and e.created_at >= now() - interval '14 days')::int,
    count(*) filter (where e.type = 'view')::int,
    count(*) filter (where e.type = 'whatsapp')::int
  from public.events e
  where e.merchant_id = mid
    and exists (
      select 1 from public.merchants m
      where m.id = mid and (m.owner_id = auth.uid() or m.is_sample)
    );
$$;
grant execute on function public.merchant_stats(uuid) to anon, authenticated;

-- Government dashboard exposes only town-level aggregates for published shops.
create or replace function public.gov_analytics()
returns table (
  district text, town text, profile_views bigint,
  whatsapp_clicks bigint, navigation_clicks bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    m.district,
    coalesce(nullif(btrim(m.town), ''), 'Unknown'),
    count(e.id) filter (where e.type = 'view')::bigint,
    count(e.id) filter (where e.type = 'whatsapp')::bigint,
    count(e.id) filter (where e.type = 'navigate')::bigint
  from public.merchants m
  left join public.events e
    on e.merchant_id = m.id
   and e.created_at >= now() - interval '30 days'
  where m.is_published
  group by m.district, coalesce(nullif(btrim(m.town), ''), 'Unknown')
  order by m.district, town;
$$;
revoke all on function public.gov_analytics() from public;
grant execute on function public.gov_analytics() to anon, authenticated;

-- ---------- photo storage ----------
insert into storage.buckets (id, name, public)
values ('photos', 'photos', true)
on conflict (id) do nothing;

drop policy if exists "merchants upload to own folder" on storage.objects;
create policy "merchants upload to own folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'photos' and (storage.foldername(name))[1] = auth.uid()::text);
