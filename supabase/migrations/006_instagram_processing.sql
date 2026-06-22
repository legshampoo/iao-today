-- Instagram-sourced events do not require a user account
alter table public.events
  alter column user_id drop not null;

alter table public.events
  add column if not exists source text not null default 'manual';

alter table public.events
  drop constraint if exists events_source_check;

alter table public.events
  add constraint events_source_check
  check (source in ('manual', 'instagram'));

alter table public.events
  add column if not exists instagram_post_id text;

create unique index if not exists events_instagram_post_id_key
  on public.events (instagram_post_id)
  where instagram_post_id is not null;

alter table public.events
  drop constraint if exists events_source_user_check;

alter table public.events
  add constraint events_source_user_check check (
    (source = 'manual' and user_id is not null)
    or (source = 'instagram' and user_id is null)
  );

create table public.instagram_posts (
  post_id            text primary key,
  account_username   text not null references public.instagram_accounts (username),
  caption            text,
  post_url           text,
  media_type         text,
  image_url          text,
  post_timestamp     timestamptz,
  scraped_at         timestamptz not null default now(),
  processing_status  text not null default 'pending'
    check (processing_status in ('pending', 'processing', 'processed', 'skipped', 'failed')),
  event_id           uuid references public.events (id) on delete set null,
  llm_result         jsonb,
  error_message      text,
  processed_at       timestamptz
);

alter table public.instagram_posts enable row level security;

create index instagram_posts_processing_status_idx
  on public.instagram_posts (processing_status);
