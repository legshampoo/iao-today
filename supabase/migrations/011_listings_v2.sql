-- Listings V2 schema

create table public.listings (
  id            uuid primary key default gen_random_uuid(),
  title         text not null,
  slug          text unique not null,
  type          text not null,
  status        text not null default 'draft',
  description   text,
  image_url     text,
  price_label   text,
  external_url  text,
  location_name text,
  area          text,
  latitude      numeric,
  longitude     numeric,
  is_top_pick   boolean not null default false,
  is_featured   boolean not null default false,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now(),
  published_at  timestamptz,
  constraint listings_type_check check (
    type in ('event', 'discount', 'tour', 'restaurant', 'wellness', 'accommodation')
  ),
  constraint listings_status_check check (
    status in ('draft', 'published', 'archived')
  )
);

create trigger listings_updated_at
  before update on public.listings
  for each row execute function public.handle_updated_at();

create index listings_type_status_idx on public.listings (type, status);
create index listings_published_at_idx on public.listings (published_at desc);
create index listings_is_top_pick_idx on public.listings (is_top_pick)
  where is_top_pick = true;

create table public.event_details (
  id               uuid primary key default gen_random_uuid(),
  listing_id       uuid not null unique references public.listings (id) on delete cascade,
  starts_at        timestamptz,
  ends_at          timestamptz,
  date_label       text,
  time_label       text,
  is_recurring     boolean not null default false,
  recurrence_rule  text
);

create table public.discount_details (
  id              uuid primary key default gen_random_uuid(),
  listing_id      uuid not null unique references public.listings (id) on delete cascade,
  discount_label  text,
  valid_from      timestamptz,
  valid_until     timestamptz,
  terms           text
);

create table public.listing_categories (
  id         uuid primary key default gen_random_uuid(),
  name       text not null,
  slug       text unique not null,
  icon       text,
  created_at timestamptz not null default now()
);

create table public.listing_category_links (
  listing_id  uuid not null references public.listings (id) on delete cascade,
  category_id uuid not null references public.listing_categories (id) on delete cascade,
  primary key (listing_id, category_id)
);

insert into public.listing_categories (name, slug, icon)
values
  ('Events', 'events', 'calendar'),
  ('Discounts', 'discounts', 'tag'),
  ('Tours', 'tours', 'wave'),
  ('Restaurants', 'restaurants', 'utensils'),
  ('Wellness', 'wellness', 'lotus'),
  ('Accommodation', 'accommodation', 'home');

-- Row Level Security

alter table public.listings enable row level security;
alter table public.event_details enable row level security;
alter table public.discount_details enable row level security;
alter table public.listing_categories enable row level security;
alter table public.listing_category_links enable row level security;

create policy "Public can view published listings"
  on public.listings for select
  using (status = 'published');

create policy "Authenticated users can manage listings"
  on public.listings for all
  to authenticated
  using (true)
  with check (true);

create policy "Public can view published event details"
  on public.event_details for select
  using (
    exists (
      select 1
      from public.listings
      where listings.id = event_details.listing_id
        and listings.status = 'published'
    )
  );

create policy "Authenticated users can manage event details"
  on public.event_details for all
  to authenticated
  using (true)
  with check (true);

create policy "Public can view published discount details"
  on public.discount_details for select
  using (
    exists (
      select 1
      from public.listings
      where listings.id = discount_details.listing_id
        and listings.status = 'published'
    )
  );

create policy "Authenticated users can manage discount details"
  on public.discount_details for all
  to authenticated
  using (true)
  with check (true);

create policy "Public can view listing categories"
  on public.listing_categories for select
  using (true);

create policy "Authenticated users can manage listing categories"
  on public.listing_categories for all
  to authenticated
  using (true)
  with check (true);

create policy "Public can view published category links"
  on public.listing_category_links for select
  using (
    exists (
      select 1
      from public.listings
      where listings.id = listing_category_links.listing_id
        and listings.status = 'published'
    )
  );

create policy "Authenticated users can manage category links"
  on public.listing_category_links for all
  to authenticated
  using (true)
  with check (true);

-- Public bucket for listing cover images (must be named exactly listing-images)
insert into storage.buckets (id, name, public)
values ('listing-images', 'listing-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view listing images" on storage.objects;
drop policy if exists "Authenticated users can upload listing images" on storage.objects;
drop policy if exists "Authenticated users can update listing images" on storage.objects;
drop policy if exists "Authenticated users can delete listing images" on storage.objects;

create policy "Public can view listing images"
  on storage.objects for select
  using (bucket_id = 'listing-images');

create policy "Authenticated users can upload listing images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'listing-images');

create policy "Authenticated users can update listing images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'listing-images');

create policy "Authenticated users can delete listing images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'listing-images');
