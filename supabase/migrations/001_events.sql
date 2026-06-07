-- Events table
create table public.events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  title       text not null,
  description text not null,
  location    text not null,
  starts_at   timestamptz not null,
  ends_at     timestamptz,
  is_free     boolean not null default false,
  price_php   numeric(10,2),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now(),
  constraint events_price_check check (
    (is_free = true and price_php is null)
    or (is_free = false and price_php is not null and price_php >= 0)
  )
);

-- Auto-update updated_at
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger events_updated_at
  before update on public.events
  for each row execute function public.handle_updated_at();

-- Row Level Security
alter table public.events enable row level security;

-- Anyone can read upcoming events (public homepage)
create policy "Public can view upcoming events"
  on public.events for select
  using (starts_at >= now());

-- Users can read all their own events (dashboard, including past)
create policy "Users can view own events"
  on public.events for select
  using (auth.uid() = user_id);

create policy "Users can insert own events"
  on public.events for insert
  with check (auth.uid() = user_id);

create policy "Users can update own events"
  on public.events for update
  using (auth.uid() = user_id);

create policy "Users can delete own events"
  on public.events for delete
  using (auth.uid() = user_id);