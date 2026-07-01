-- Internal migration bookkeeping table: not exposed via PostgREST.

alter table public.schema_migrations enable row level security;

revoke all on public.schema_migrations from anon, authenticated, public;
