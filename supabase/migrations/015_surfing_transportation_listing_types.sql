-- Add surfing and transportation listing types

alter table public.listings
  drop constraint listings_type_check;

alter table public.listings
  add constraint listings_type_check check (
    type in (
      'event',
      'discount',
      'tour',
      'restaurant',
      'wellness',
      'accommodation',
      'surfing',
      'transportation'
    )
  );

insert into public.listing_categories (name, slug, icon)
values
  ('Surfing', 'surfing', 'wave'),
  ('Transportation', 'transportation', 'car')
on conflict (slug) do nothing;
