import type { SupabaseClient } from '@supabase/supabase-js'
import { parseManilaDateTime } from '@/lib/datetime/manila'
import { slugifyListingTitle } from '@/lib/listings/format'
import type { ExtractedEventOutput } from '@/lib/instagram/processing/schemas'
import type { ListingPriceType } from '@/lib/types/listing'

type UpsertInstagramListingParams = {
  extracted: ExtractedEventOutput
  sourceKey: string
  sourceUrl: string | null
  imageUrl: string | null
}

export async function upsertInstagramEventListing(
  supabase: SupabaseClient,
  params: UpsertInstagramListingParams
): Promise<string> {
  const { extracted, sourceKey, sourceUrl, imageUrl } = params

  const { data: existing, error: existingError } = await supabase
    .from('listings')
    .select('id')
    .eq('source', 'instagram')
    .eq('source_key', sourceKey)
    .maybeSingle()

  if (existingError) {
    throw new Error(`Failed to check existing listing: ${existingError.message}`)
  }

  if (existing) {
    return existing.id
  }

  const slug = await buildUniqueSlug(supabase, extracted.title, sourceKey)
  const startsAt = parseManilaDateTime(extracted.starts_at, extracted.time_tbc)
  const endsAt = extracted.ends_at
    ? parseManilaDateTime(extracted.ends_at, false)
    : null

  const { data: listing, error: listingError } = await supabase
    .from('listings')
    .insert({
      user_id: null,
      title: extracted.title.trim(),
      slug,
      type: 'event',
      status: 'published',
      description: extracted.description.trim(),
      image_url: imageUrl,
      location_name: extracted.location.trim(),
      price_type: toPriceType(extracted),
      currency: 'PHP',
      price_amount: extracted.is_free ? null : extracted.price_php,
      price_amount_max: null,
      price_unit: extracted.price_php != null ? 'person' : null,
      price_label: null,
      source: 'instagram',
      source_key: sourceKey,
      source_url: sourceUrl,
      published_at: new Date().toISOString(),
    })
    .select('id')
    .single()

  if (listingError) {
    throw new Error(`Failed to create listing: ${listingError.message}`)
  }

  const { error: detailsError } = await supabase.from('event_details').insert({
    listing_id: listing.id,
    starts_at: startsAt.toISOString(),
    ends_at: endsAt ? endsAt.toISOString() : null,
    date_label: null,
    time_label: extracted.time_tbc ? 'Time TBC' : null,
    is_recurring: false,
    recurrence_rule: null,
  })

  if (detailsError) {
    throw new Error(`Failed to create event details: ${detailsError.message}`)
  }

  return listing.id
}

function toPriceType(extracted: ExtractedEventOutput): ListingPriceType {
  if (extracted.is_free) {
    return 'free'
  }

  if (extracted.price_php != null) {
    return 'paid'
  }

  return 'not_listed'
}

async function buildUniqueSlug(
  supabase: SupabaseClient,
  title: string,
  sourceKey: string
): Promise<string> {
  const base = slugifyListingTitle(title) || 'event'
  const suffix = sourceKey
    .split('#')
    .slice(1)
    .join('-')
    .replace(/[^a-z0-9-]+/g, '-')
    .replace(/^-+|-+$/g, '')
  const primary = `${base}-${suffix}`.replace(/-+/g, '-').slice(0, 80)

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const candidate =
      attempt === 0 ? primary : `${base}-${attempt}`.replace(/-+/g, '-').slice(0, 80)
    const { data, error } = await supabase
      .from('listings')
      .select('id')
      .eq('slug', candidate)
      .maybeSingle()

    if (error) {
      throw new Error(`Failed to check slug availability: ${error.message}`)
    }

    if (!data) {
      return candidate
    }
  }

  return `${base}-${Date.now()}`
}
