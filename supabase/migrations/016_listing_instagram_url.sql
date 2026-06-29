alter table public.listings
  add column if not exists instagram_url text;

comment on column public.listings.external_url is 'Website URL for the listing';
comment on column public.listings.instagram_url is 'Instagram profile or post URL';
