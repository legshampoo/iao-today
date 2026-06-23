create or replace function public.merge_instagram_batch_account_result(
  p_batch_id uuid,
  p_username text,
  p_result jsonb
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  merged jsonb;
begin
  update public.instagram_scrape_batches
  set account_results = coalesce(account_results, '{}'::jsonb)
    || jsonb_build_object(p_username, p_result)
  where id = p_batch_id
    and finished_at is null
  returning account_results into merged;

  if merged is null then
    select account_results
    into merged
    from public.instagram_scrape_batches
    where id = p_batch_id;
  end if;

  return coalesce(merged, '{}'::jsonb);
end;
$$;
