import type { Listing } from '@/lib/types/listing'

export const priceTypes = [
  'free',
  'paid',
  'donation',
  'contact',
  'varies',
  'not_listed',
] as const

export type PriceType = (typeof priceTypes)[number]

export const priceUnits = [
  'person',
  'night',
  'room',
  'group',
  'class',
  'session',
  'hour',
  'day',
  'fixed',
  'starting',
] as const

export type PriceUnit = (typeof priceUnits)[number]

export const priceTypeLabels: Record<PriceType, string> = {
  free: 'Free',
  paid: 'Paid',
  donation: 'Donation',
  contact: 'Contact for Price',
  varies: 'Price Varies',
  not_listed: 'Not Listed',
}

export const priceUnitLabels: Record<PriceUnit, string> = {
  person: 'Per Person',
  night: 'Per Night',
  room: 'Per Room',
  group: 'Per Group',
  class: 'Per Class',
  session: 'Per Session',
  hour: 'Per Hour',
  day: 'Per Day',
  fixed: 'Fixed Price',
  starting: 'Starting From',
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  PHP: '₱',
}

export type ListingPriceFields = Pick<
  Listing,
  'price_type' | 'currency' | 'price_amount' | 'price_amount_max' | 'price_unit' | 'price_label'
>

export function displayListingPrice(listing: ListingPriceFields): string | null {
  if (listing.price_label?.trim()) {
    return listing.price_label.trim()
  }

  switch (listing.price_type) {
    case 'free':
      return 'Free'
    case 'donation':
      return 'Donation'
    case 'contact':
      return 'Contact for Price'
    case 'varies':
      return 'Price Varies'
    case 'not_listed':
      return null
    case 'paid':
      return formatGeneratedPaidPrice(listing)
    default:
      return null
  }
}

export function formatGeneratedPaidPrice(
  listing: Pick<Listing, 'currency' | 'price_amount' | 'price_amount_max' | 'price_unit'>
): string | null {
  if (listing.price_amount == null) {
    return null
  }

  const symbol = CURRENCY_SYMBOLS[listing.currency] ?? listing.currency
  const formattedAmount = formatAmount(listing.price_amount, symbol)
  const formattedMax =
    listing.price_amount_max != null ? formatAmount(listing.price_amount_max, symbol) : null

  if (listing.price_unit === 'starting') {
    return `From ${formattedAmount}`
  }

  const unitSuffix = unitToSuffix(listing.price_unit)

  if (formattedMax != null) {
    return `${formattedAmount}–${formattedMax}${unitSuffix}`
  }

  return `${formattedAmount}${unitSuffix}`
}

function formatAmount(amount: number, symbol: string): string {
  const hasDecimals = !Number.isInteger(amount)
  const formatted = new Intl.NumberFormat('en-PH', {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  }).format(amount)

  return `${symbol}${formatted}`
}

function unitToSuffix(unit: PriceUnit | null): string {
  switch (unit) {
    case 'person':
      return '/person'
    case 'night':
      return '/night'
    case 'room':
      return '/room'
    case 'group':
      return '/group'
    case 'class':
      return '/class'
    case 'session':
      return '/session'
    case 'hour':
      return '/hour'
    case 'day':
      return '/day'
    case 'fixed':
    case 'starting':
    default:
      return ''
  }
}
