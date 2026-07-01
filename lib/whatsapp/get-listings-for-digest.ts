import { createAdminClient } from '@/lib/supabase/admin'
import type { ListingWithDetails } from '@/lib/types/listing'
import { manilaDayBounds } from '@/lib/whatsapp/manila-day-bounds'

export async function getListingsForDigest(date: Date = new Date()) {
  const { dateKey, startIso, endIso } = manilaDayBounds(date)
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('event_details')
    .select(
      `
      *,
      listings!inner (*)
    `
    )
    .gte('starts_at', startIso)
    .lt('starts_at', endIso)
    .eq('listings.status', 'published')
    .eq('listings.type', 'event')
    .order('starts_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to load listings for digest: ${error.message}`)
  }

  const listings: ListingWithDetails[] = (data ?? []).map((row) => {
    const { listings: listing, ...eventDetails } = row as {
      listings: ListingWithDetails
      id: string
      listing_id: string
      starts_at: string | null
      ends_at: string | null
      date_label: string | null
      time_label: string | null
      is_recurring: boolean
      recurrence_rule: string | null
    }

    return {
      ...listing,
      event_details: {
        id: eventDetails.id,
        listing_id: eventDetails.listing_id,
        starts_at: eventDetails.starts_at,
        ends_at: eventDetails.ends_at,
        date_label: eventDetails.date_label,
        time_label: eventDetails.time_label,
        is_recurring: eventDetails.is_recurring,
        recurrence_rule: eventDetails.recurrence_rule,
      },
    }
  })

  return {
    dateKey,
    listings,
  }
}
