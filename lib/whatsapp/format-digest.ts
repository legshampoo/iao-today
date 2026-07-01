import { WHATSAPP_CHANNEL_URL } from '@/lib/constants'
import { formatTodayInManila } from '@/lib/format'
import {
  formatListingEventTime,
  listingHref,
  listingLocationLabel,
} from '@/lib/listings/format'
import { displayListingPrice } from '@/lib/listings/price'
import type { ListingWithDetails } from '@/lib/types/listing'
import { getSiteUrl } from '@/lib/whatsapp/config'

const WHATSAPP_TEXT_LIMIT = 4096

function truncateForWhatsApp(text: string): string {
  if (text.length <= WHATSAPP_TEXT_LIMIT) {
    return text
  }

  return `${text.slice(0, WHATSAPP_TEXT_LIMIT - 1)}…`
}

function formatListingLine(
  listing: ListingWithDetails,
  index: number,
  siteUrl: string
): string {
  const priceLabel = displayListingPrice(listing)
  const timeLabel =
    listing.event_details?.time_label === 'Time TBC'
      ? 'Time TBC'
      : formatListingEventTime(listing.event_details ?? null)
  const locationLabel = listingLocationLabel(listing)
  const listingUrl = `${siteUrl}${listingHref(listing)}`
  const details = [timeLabel, locationLabel, priceLabel].filter(Boolean)

  return [
    `${index}. ${listing.title}`,
    `   ${details.join(' · ')}`,
    `   ${listingUrl}`,
  ].join('\n')
}

export function formatDigestMessage(
  listings: ListingWithDetails[],
  siteUrl = getSiteUrl()
): string {
  const dateLabel = formatTodayInManila()

  if (listings.length === 0) {
    return truncateForWhatsApp(
      [
        `🌴 Siargao Now — ${dateLabel}`,
        '',
        'No events listed for today yet.',
        '',
        "Be the first — add yours and help the community discover what's on:",
        `${siteUrl}/dashboard/listings/new`,
        '',
        `More events: ${siteUrl}`,
        `Follow the channel: ${WHATSAPP_CHANNEL_URL}`,
      ].join('\n')
    )
  }

  const lines = listings.map((listing, index) =>
    formatListingLine(listing, index + 1, siteUrl)
  )

  return truncateForWhatsApp(
    [
      `🌴 Siargao Now — ${dateLabel}`,
      '',
      ...lines,
      '',
      `More events: ${siteUrl}`,
    ].join('\n')
  )
}
