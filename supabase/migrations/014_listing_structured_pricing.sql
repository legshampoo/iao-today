alter table public.listings
  add column if not exists price_type text not null default 'not_listed',
  add column if not exists currency text not null default 'PHP',
  add column if not exists price_amount numeric null,
  add column if not exists price_amount_max numeric null,
  add column if not exists price_unit text null;

alter table public.listings
  drop constraint if exists listings_price_type_check;

alter table public.listings
  add constraint listings_price_type_check check (
    price_type in ('free', 'paid', 'donation', 'contact', 'varies', 'not_listed')
  );

alter table public.listings
  drop constraint if exists listings_price_unit_check;

alter table public.listings
  add constraint listings_price_unit_check check (
    price_unit is null
    or price_unit in (
      'person',
      'night',
      'room',
      'group',
      'class',
      'session',
      'hour',
      'day',
      'fixed',
      'starting'
    )
  );
