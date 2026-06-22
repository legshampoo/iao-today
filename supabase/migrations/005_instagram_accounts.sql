create table public.instagram_accounts (
  username        text primary key,
  is_active       boolean not null default true,
  last_scraped_at timestamptz,
  created_at      timestamptz not null default now()
);

alter table public.instagram_accounts enable row level security;

insert into public.instagram_accounts (username)
values
  ('harana_sabado_nights'),
  ('thesanctuarysiargao');
