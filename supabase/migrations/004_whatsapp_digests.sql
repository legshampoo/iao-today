create table public.whatsapp_digests (
  digest_date   date primary key,
  status        text not null check (status in ('sent', 'failed', 'skipped')),
  message_body  text,
  error_message text,
  sent_at       timestamptz,
  created_at    timestamptz not null default now()
);

alter table public.whatsapp_digests enable row level security;
