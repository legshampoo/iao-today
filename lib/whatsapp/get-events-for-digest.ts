import { createAdminClient } from '@/lib/supabase/admin'
import type { Event } from '@/lib/types/event'
import { manilaDayBounds } from '@/lib/whatsapp/manila-day-bounds'

export async function getEventsForDigest(date: Date = new Date()) {
  const { dateKey, startIso, endIso } = manilaDayBounds(date)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('events')
    .select('*')
    .gte('starts_at', startIso)
    .lt('starts_at', endIso)
    .order('starts_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load events for digest: ${error.message}`)
  }

  return {
    dateKey,
    events: (data ?? []) as Event[],
  }
}
