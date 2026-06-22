alter table public.events
  add column if not exists time_tbc boolean not null default false;
