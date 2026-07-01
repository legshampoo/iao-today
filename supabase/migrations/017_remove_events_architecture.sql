-- Listings as the single source of truth; remove legacy events table.

alter table public.listings
  add column if not exists source text not null default 'manual',
  add column if not exists source_key text,
  add column if not exists source_url text;

alter table public.listings
  drop constraint if exists listings_source_check;

alter table public.listings
  add constraint listings_source_check
  check (source in ('manual', 'instagram'));

create unique index if not exists listings_source_key_unique
  on public.listings (source, source_key)
  where source_key is not null;

-- Repoint instagram_posts from events to listings.
alter table public.instagram_posts
  drop constraint if exists instagram_posts_event_id_fkey;

update public.instagram_posts
set event_id = null
where event_id is not null;

alter table public.instagram_posts
  rename column event_id to listing_id;

alter table public.instagram_posts
  add constraint instagram_posts_listing_id_fkey
  foreign key (listing_id) references public.listings (id) on delete set null;

drop table if exists public.events cascade;
