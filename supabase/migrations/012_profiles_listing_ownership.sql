-- Profiles, listing ownership, and owner/admin authorization.

create table if not exists public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  email      text,
  admin      boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

drop trigger if exists profiles_updated_at on public.profiles;
create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

insert into public.profiles (id, email)
select id, email
from auth.users
on conflict (id) do update
set email = excluded.email;

create or replace function public.handle_new_user_profile()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email)
  on conflict (id) do update
  set email = excluded.email;

  return new;
end;
$$;

drop trigger if exists on_auth_user_created_profile on auth.users;
create trigger on_auth_user_created_profile
  after insert on auth.users
  for each row execute function public.handle_new_user_profile();

create or replace function public.is_admin()
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select coalesce(
    (
      select profiles.admin
      from public.profiles
      where profiles.id = auth.uid()
      limit 1
    ),
    false
  );
$$;

alter table public.listings
  add column if not exists user_id uuid references auth.users (id) on delete cascade;

create index if not exists listings_user_id_idx on public.listings (user_id);

alter table public.profiles enable row level security;

drop policy if exists "Users can view own profile" on public.profiles;
drop policy if exists "Admins can view profiles" on public.profiles;

create policy "Users can view own profile"
  on public.profiles for select
  to authenticated
  using (id = auth.uid());

create policy "Admins can view profiles"
  on public.profiles for select
  to authenticated
  using (public.is_admin());

-- Replace V2's broad authenticated policies with owner/admin-aware policies.

drop policy if exists "Authenticated users can manage listings" on public.listings;
drop policy if exists "Users and admins can view listings" on public.listings;
drop policy if exists "Users and admins can insert listings" on public.listings;
drop policy if exists "Users and admins can update listings" on public.listings;
drop policy if exists "Users and admins can delete listings" on public.listings;

create policy "Users and admins can view listings"
  on public.listings for select
  to authenticated
  using (status = 'published' or user_id = auth.uid() or public.is_admin());

create policy "Users and admins can insert listings"
  on public.listings for insert
  to authenticated
  with check (user_id = auth.uid() or public.is_admin());

create policy "Users and admins can update listings"
  on public.listings for update
  to authenticated
  using (user_id = auth.uid() or public.is_admin())
  with check (user_id = auth.uid() or public.is_admin());

create policy "Users and admins can delete listings"
  on public.listings for delete
  to authenticated
  using (user_id = auth.uid() or public.is_admin());

drop policy if exists "Authenticated users can manage event details" on public.event_details;
drop policy if exists "Users and admins can view event details" on public.event_details;
drop policy if exists "Users and admins can insert event details" on public.event_details;
drop policy if exists "Users and admins can update event details" on public.event_details;
drop policy if exists "Users and admins can delete event details" on public.event_details;

create policy "Users and admins can view event details"
  on public.event_details for select
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = event_details.listing_id
        and (
          listings.status = 'published'
          or listings.user_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Users and admins can insert event details"
  on public.event_details for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.listings
      where listings.id = event_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users and admins can update event details"
  on public.event_details for update
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = event_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.listings
      where listings.id = event_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users and admins can delete event details"
  on public.event_details for delete
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = event_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Authenticated users can manage discount details" on public.discount_details;
drop policy if exists "Users and admins can view discount details" on public.discount_details;
drop policy if exists "Users and admins can insert discount details" on public.discount_details;
drop policy if exists "Users and admins can update discount details" on public.discount_details;
drop policy if exists "Users and admins can delete discount details" on public.discount_details;

create policy "Users and admins can view discount details"
  on public.discount_details for select
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = discount_details.listing_id
        and (
          listings.status = 'published'
          or listings.user_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Users and admins can insert discount details"
  on public.discount_details for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.listings
      where listings.id = discount_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users and admins can update discount details"
  on public.discount_details for update
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = discount_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  )
  with check (
    exists (
      select 1
      from public.listings
      where listings.id = discount_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users and admins can delete discount details"
  on public.discount_details for delete
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = discount_details.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Authenticated users can manage category links" on public.listing_category_links;
drop policy if exists "Users and admins can view category links" on public.listing_category_links;
drop policy if exists "Users and admins can insert category links" on public.listing_category_links;
drop policy if exists "Users and admins can delete category links" on public.listing_category_links;

create policy "Users and admins can view category links"
  on public.listing_category_links for select
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = listing_category_links.listing_id
        and (
          listings.status = 'published'
          or listings.user_id = auth.uid()
          or public.is_admin()
        )
    )
  );

create policy "Users and admins can insert category links"
  on public.listing_category_links for insert
  to authenticated
  with check (
    exists (
      select 1
      from public.listings
      where listings.id = listing_category_links.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

create policy "Users and admins can delete category links"
  on public.listing_category_links for delete
  to authenticated
  using (
    exists (
      select 1
      from public.listings
      where listings.id = listing_category_links.listing_id
        and (listings.user_id = auth.uid() or public.is_admin())
    )
  );

drop policy if exists "Authenticated users can manage listing categories" on public.listing_categories;
drop policy if exists "Admins can insert listing categories" on public.listing_categories;
drop policy if exists "Admins can update listing categories" on public.listing_categories;
drop policy if exists "Admins can delete listing categories" on public.listing_categories;

create policy "Admins can insert listing categories"
  on public.listing_categories for insert
  to authenticated
  with check (public.is_admin());

create policy "Admins can update listing categories"
  on public.listing_categories for update
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Admins can delete listing categories"
  on public.listing_categories for delete
  to authenticated
  using (public.is_admin());
