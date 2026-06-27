import type {
  DiscountDetails,
  EventDetails,
  Listing,
  ListingType,
} from '@/lib/types/listing'

const PHT_TIMEZONE = 'Asia/Manila'

export const LISTING_TYPE_LABELS: Record<ListingType, string> = {
  event: 'Event',
  discount: 'Discount',
  tour: 'Tour',
  restaurant: 'Restaurant',
  wellness: 'Wellness',
  accommodation: 'Accommodation',
}

export const LISTING_TYPE_ROUTES: Record<ListingType, string> = {
  event: '/events',
  discount: '/discounts',
  tour: '/tours',
  restaurant: '/restaurants',
  wellness: '/wellness',
  accommodation: '/stay',
}

export function listingHref(listing: Pick<Listing, 'slug'>): string {
  return `/listing/${listing.slug}`
}

export function listingTypeRoute(type: ListingType): string {
  return LISTING_TYPE_ROUTES[type]
}

export function listingTypeLabel(type: ListingType): string {
  return LISTING_TYPE_LABELS[type]
}

export function listingBadgeLabel(
  listing: Pick<Listing, 'type' | 'is_top_pick' | 'is_featured'>,
  discountDetails?: Pick<DiscountDetails, 'discount_label'> | null
): string {
  if (discountDetails?.discount_label) {
    return discountDetails.discount_label
  }

  if (listing.is_top_pick) {
    return 'Top Pick'
  }

  if (listing.is_featured) {
    return 'Featured'
  }

  return listingTypeLabel(listing.type)
}

export function listingLocationLabel(
  listing: Pick<Listing, 'maps_url' | 'location_name' | 'area'>
): string | null {
  if (listing.location_name) {
    return listing.location_name
  }

  if (listing.maps_url) {
    return 'View on map'
  }

  return listing.area ?? null
}

export function formatListingEventTime(
  eventDetails: Pick<EventDetails, 'starts_at' | 'ends_at' | 'date_label' | 'time_label'> | null
): string | null {
  if (!eventDetails) {
    return null
  }

  if (eventDetails.date_label && eventDetails.time_label) {
    return `${eventDetails.date_label} · ${eventDetails.time_label}`
  }

  if (eventDetails.date_label) {
    return eventDetails.date_label
  }

  if (eventDetails.time_label) {
    return eventDetails.time_label
  }

  if (!eventDetails.starts_at) {
    return null
  }

  const dateLabel = new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(new Date(eventDetails.starts_at))

  const startTime = formatTime(eventDetails.starts_at)
  const timeLabel = eventDetails.ends_at
    ? `${startTime} - ${formatTime(eventDetails.ends_at)}`
    : startTime

  return `${dateLabel} · ${timeLabel}`
}

export function formatDiscountValidity(
  discountDetails: Pick<DiscountDetails, 'valid_until'> | null,
  now = new Date()
): string | null {
  if (!discountDetails?.valid_until) {
    return null
  }

  const validUntil = new Date(discountDetails.valid_until)

  if (Number.isNaN(validUntil.getTime())) {
    return null
  }

  const todayKey = dateKeyInManila(now)
  const validUntilKey = dateKeyInManila(validUntil)

  if (validUntilKey < todayKey) {
    return 'Expired'
  }

  if (validUntilKey === todayKey) {
    return 'Ends today'
  }

  return `Valid until ${new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    month: 'short',
    day: 'numeric',
  }).format(validUntil)}`
}

export function formatListingMeta(
  listing: Listing,
  details?: {
    event_details?: EventDetails | null
    discount_details?: DiscountDetails | null
  }
): string | null {
  if (listing.type === 'event') {
    return formatListingEventTime(details?.event_details ?? null)
  }

  if (listing.type === 'discount') {
    return formatDiscountValidity(details?.discount_details ?? null)
  }

  return null
}

export function slugifyListingTitle(title: string): string {
  return title
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function formatTime(isoDate: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

function dateKeyInManila(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PHT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}
