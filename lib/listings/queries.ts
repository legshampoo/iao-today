import type { SupabaseClient } from '@supabase/supabase-js'
import type {
  DiscountDetails,
  EventDetails,
  Listing,
  ListingCategory,
  ListingType,
  ListingWithDetails,
} from '@/lib/types/listing'

const LISTING_SELECT = `
  *,
  event_details (*),
  discount_details (*),
  listing_category_links (
    listing_categories (*)
  )
`

const DEFAULT_SECTION_LIMIT = 6
const DEFAULT_LOOKAHEAD_LIMIT = 50

export type ListingSectionKey =
  | 'top-picks'
  | 'events'
  | 'discounts'
  | 'tours'
  | 'restaurants'
  | 'wellness'
  | 'accommodation'
  | 'all'

export type ListingSection = {
  key: ListingSectionKey
  title: string
  subtitle: string
  href: string
  listings: ListingWithDetails[]
}

type ListingQueryOptions = {
  limit?: number
}

type ListingRow = Listing & {
  event_details?: EventDetails | EventDetails[] | null
  discount_details?: DiscountDetails | DiscountDetails[] | null
  listing_category_links?: CategoryLinkRow[] | null
}

type CategoryLinkRow = {
  listing_categories?: ListingCategory | ListingCategory[] | null
}

export async function getListingCategories(supabase: SupabaseClient) {
  const { data, error } = await supabase
    .from('listing_categories')
    .select('*')
    .order('name', { ascending: true })

  if (error) {
    throw new Error(`Failed to load listing categories: ${error.message}`)
  }

  return (data ?? []) as ListingCategory[]
}

export async function getUserListings(supabase: SupabaseClient, userId: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw new Error(`Failed to load your listings: ${error.message}`)
  }

  return normalizeListingRows(data)
}

export async function getPublishedListingBySlug(
  supabase: SupabaseClient,
  slug: string
) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load listing: ${error.message}`)
  }

  return data ? normalizeListingRow(data as ListingRow) : null
}

export async function getSuggestedListings(
  supabase: SupabaseClient,
  excludeListingId: string,
  limit = 3
) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .neq('id', excludeListingId)
    .limit(30)

  if (error) {
    throw new Error(`Failed to load suggested listings: ${error.message}`)
  }

  const listings = normalizeListingRows(data)
  return shuffleListings(listings).slice(0, limit)
}

export async function getAdminListingById(supabase: SupabaseClient, id: string) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('id', id)
    .maybeSingle()

  if (error) {
    throw new Error(`Failed to load listing: ${error.message}`)
  }

  return data ? normalizeListingRow(data as ListingRow) : null
}

export async function getPublishedListingsByType(
  supabase: SupabaseClient,
  type: ListingType,
  options: ListingQueryOptions = {}
) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .eq('type', type)
    .order('is_featured', { ascending: false })
    .order('published_at', { ascending: false })
    .limit(options.limit ?? DEFAULT_SECTION_LIMIT)

  if (error) {
    throw new Error(`Failed to load ${type} listings: ${error.message}`)
  }

  return normalizeListingRows(data)
}

export async function getTopPickListings(
  supabase: SupabaseClient,
  options: ListingQueryOptions = {}
) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .eq('is_top_pick', true)
    .order('published_at', { ascending: false })
    .limit(options.limit ?? DEFAULT_SECTION_LIMIT)

  if (error) {
    throw new Error(`Failed to load top picks: ${error.message}`)
  }

  return normalizeListingRows(data)
}

export async function getRecentlyAddedListings(
  supabase: SupabaseClient,
  options: ListingQueryOptions = {}
) {
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })
    .limit(options.limit ?? DEFAULT_SECTION_LIMIT)

  if (error) {
    throw new Error(`Failed to load recent listings: ${error.message}`)
  }

  return normalizeListingRows(data)
}

export async function getTodayEventListings(
  supabase: SupabaseClient,
  options: ListingQueryOptions = {}
) {
  const limit = options.limit ?? DEFAULT_SECTION_LIMIT
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .eq('type', 'event')
    .limit(DEFAULT_LOOKAHEAD_LIMIT)

  if (error) {
    throw new Error(`Failed to load event listings: ${error.message}`)
  }

  return normalizeListingRows(data)
    .filter((listing) => isTodayOrFutureEvent(listing.event_details))
    .sort(compareEventStartsAt)
    .slice(0, limit)
}

export async function getActiveDiscountListings(
  supabase: SupabaseClient,
  options: ListingQueryOptions = {}
) {
  const limit = options.limit ?? DEFAULT_SECTION_LIMIT
  const { data, error } = await supabase
    .from('listings')
    .select(LISTING_SELECT)
    .eq('status', 'published')
    .eq('type', 'discount')
    .limit(DEFAULT_LOOKAHEAD_LIMIT)

  if (error) {
    throw new Error(`Failed to load discount listings: ${error.message}`)
  }

  return normalizeListingRows(data)
    .filter((listing) => isActiveDiscount(listing.discount_details))
    .sort(compareDiscountValidUntil)
    .slice(0, limit)
}

export async function getHomepageListingSections(
  supabase: SupabaseClient,
  options: ListingQueryOptions = {}
): Promise<ListingSection[]> {
  const limit = options.limit ?? DEFAULT_SECTION_LIMIT
  const [
    topPicks,
    events,
    discounts,
    tours,
    restaurants,
    wellness,
    accommodation,
    recentlyAdded,
  ] = await Promise.all([
    getTopPickListings(supabase, { limit }),
    getTodayEventListings(supabase, { limit }),
    getActiveDiscountListings(supabase, { limit }),
    getPublishedListingsByType(supabase, 'tour', { limit }),
    getPublishedListingsByType(supabase, 'restaurant', { limit }),
    getPublishedListingsByType(supabase, 'wellness', { limit }),
    getPublishedListingsByType(supabase, 'accommodation', { limit }),
    getRecentlyAddedListings(supabase, { limit }),
  ])

  const sections: ListingSection[] = [
    {
      key: 'top-picks',
      title: "Today's Top Picks",
      subtitle: "Handpicked highlights you shouldn't miss",
      href: '/',
      listings: topPicks,
    },
    {
      key: 'events',
      title: "Today's Events",
      subtitle: "What's happening in Siargao",
      href: '/events',
      listings: events,
    },
    {
      key: 'discounts',
      title: "Today's Deals",
      subtitle: 'Limited-time offers and discounts',
      href: '/discounts',
      listings: discounts,
    },
    {
      key: 'tours',
      title: 'Tours',
      subtitle: 'Surf, island hopping, and more',
      href: '/tours',
      listings: tours,
    },
    {
      key: 'restaurants',
      title: 'Restaurants',
      subtitle: 'Cafes, local eats, and beach bars',
      href: '/restaurants',
      listings: restaurants,
    },
    {
      key: 'wellness',
      title: 'Wellness',
      subtitle: 'Yoga, healing, and breathwork',
      href: '/wellness',
      listings: wellness,
    },
    {
      key: 'accommodation',
      title: 'Accommodation',
      subtitle: 'Hotels, villas, hostels, and more',
      href: '/stay',
      listings: accommodation,
    },
    {
      key: 'all',
      title: 'All',
      subtitle: 'Recently added across every category',
      href: '/',
      listings: recentlyAdded,
    },
  ]

  return sections.filter((section) => section.listings.length > 0)
}

function normalizeListingRows(data: unknown): ListingWithDetails[] {
  if (!Array.isArray(data)) {
    return []
  }

  return data.map((row) => normalizeListingRow(row as ListingRow))
}

function normalizeListingRow(row: ListingRow): ListingWithDetails {
  const { listing_category_links: categoryLinks, ...listing } = row

  return {
    ...listing,
    event_details: firstOrNull(row.event_details),
    discount_details: firstOrNull(row.discount_details),
    categories: normalizeCategories(categoryLinks),
  }
}

function normalizeCategories(
  categoryLinks: CategoryLinkRow[] | null | undefined
): ListingCategory[] {
  if (!categoryLinks) {
    return []
  }

  return categoryLinks
    .map((link) => firstOrNull(link.listing_categories))
    .filter((category): category is ListingCategory => Boolean(category))
}

function firstOrNull<T>(value: T | T[] | null | undefined): T | null {
  if (Array.isArray(value)) {
    return value[0] ?? null
  }

  return value ?? null
}

function isTodayOrFutureEvent(eventDetails: EventDetails | null | undefined) {
  if (!eventDetails?.starts_at) {
    return Boolean(eventDetails?.date_label)
  }

  return new Date(eventDetails.starts_at) >= startOfTodayManila()
}

function isActiveDiscount(discountDetails: DiscountDetails | null | undefined) {
  if (!discountDetails?.valid_until) {
    return true
  }

  return new Date(discountDetails.valid_until) >= startOfTodayManila()
}

function compareEventStartsAt(a: ListingWithDetails, b: ListingWithDetails) {
  return timestampOrMax(a.event_details?.starts_at) - timestampOrMax(b.event_details?.starts_at)
}

function compareDiscountValidUntil(a: ListingWithDetails, b: ListingWithDetails) {
  return (
    timestampOrMax(a.discount_details?.valid_until) -
    timestampOrMax(b.discount_details?.valid_until)
  )
}

function timestampOrMax(isoDate: string | null | undefined): number {
  return isoDate ? new Date(isoDate).getTime() : Number.MAX_SAFE_INTEGER
}

function startOfTodayManila(now = new Date()): Date {
  const dateKey = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Manila',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now)

  return new Date(`${dateKey}T00:00:00+08:00`)
}

function shuffleListings<T>(items: T[]): T[] {
  const shuffled = [...items]

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return shuffled
}
