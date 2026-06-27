alter table public.listings
  add column if not exists maps_url text;

comment on column public.listings.maps_url is 'Google Maps link for the listing location';
