create table public.instagram_scrape_batches (
  id                  uuid primary key default gen_random_uuid(),
  started_at          timestamptz not null default now(),
  finished_at         timestamptz,
  account_usernames   text[] not null,
  account_results     jsonb not null default '{}'::jsonb
);

alter table public.instagram_scrape_batches enable row level security;
