drop policy if exists "Public can view upcoming events" on public.events;

create policy "Public can view upcoming events"
  on public.events for select
  using (
    (
      time_tbc = true
      and (starts_at at time zone 'Asia/Manila')::date
        >= (now() at time zone 'Asia/Manila')::date
    )
    or (time_tbc = false and starts_at >= now())
  );
