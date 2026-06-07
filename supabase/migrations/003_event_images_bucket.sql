-- Public bucket for event cover images (must be named exactly event-images)
insert into storage.buckets (id, name, public)
values ('event-images', 'event-images', true)
on conflict (id) do update set public = true;

drop policy if exists "Public can view event images" on storage.objects;
drop policy if exists "Authenticated users can upload event images" on storage.objects;
drop policy if exists "Authenticated users can update event images" on storage.objects;
drop policy if exists "Authenticated users can delete event images" on storage.objects;

create policy "Public can view event images"
  on storage.objects for select
  using (bucket_id = 'event-images');

create policy "Authenticated users can upload event images"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'event-images');

create policy "Authenticated users can update event images"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'event-images');

create policy "Authenticated users can delete event images"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'event-images');
