import { createAdminClient } from '@/lib/supabase/admin'

export type DigestLogStatus = 'sent' | 'failed' | 'skipped'

export async function getDigestLog(digestDate: string) {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('whatsapp_digests')
    .select('*')
    .eq('digest_date', digestDate)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to read digest log: ${error.message}`)
  }

  return data
}

export async function recordDigestLog(input: {
  digestDate: string
  status: DigestLogStatus
  messageBody?: string
  errorMessage?: string
}) {
  const supabase = createAdminClient()

  const { error } = await supabase.from('whatsapp_digests').upsert(
    {
      digest_date: input.digestDate,
      status: input.status,
      message_body: input.messageBody ?? null,
      error_message: input.errorMessage ?? null,
      sent_at: input.status === 'sent' ? new Date().toISOString() : null,
    },
    { onConflict: 'digest_date' }
  )

  if (error) {
    throw new Error(`Failed to write digest log: ${error.message}`)
  }
}
