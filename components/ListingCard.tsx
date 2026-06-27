import Image from 'next/image'
import Link from 'next/link'
import {
  formatListingMeta,
  listingBadgeLabel,
  listingHref,
  listingLocationLabel,
  listingTypeLabel,
} from '@/lib/listings/format'
import { displayListingPrice } from '@/lib/listings/price'
import type { ListingStatus, ListingWithDetails } from '@/lib/types/listing'

type ListingCardProps = {
  listing: ListingWithDetails
  variant?: 'standard' | 'featured' | 'compact'
  href?: string
  status?: ListingStatus
}

function BookmarkIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4"
    >
      <path d="M6 4.75A2.25 2.25 0 0 1 8.25 2.5h7.5A2.25 2.25 0 0 1 18 4.75v16l-6-3.5-6 3.5v-16Z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-3.5 w-3.5 shrink-0"
    >
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5l3 2" />
    </svg>
  )
}

export function ListingCard({
  listing,
  variant = 'standard',
  href: hrefOverride,
  status,
}: ListingCardProps) {
  const isFeatured = variant === 'featured'
  const isCompact = variant === 'compact'
  const href = hrefOverride ?? listingHref(listing)
  const badgeLabel = listingBadgeLabel(listing, listing.discount_details)
  const metaLabel = formatListingMeta(listing, {
    event_details: listing.event_details,
    discount_details: listing.discount_details,
  })
  const locationLabel = listingLocationLabel(listing)
  const priceLabel = displayListingPrice(listing)
  const imageClassName = isFeatured ? 'aspect-[4/3]' : isCompact ? 'aspect-[5/3]' : 'aspect-[16/10]'

  return (
    <article className="group h-full overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md">
      <Link href={href} className="flex h-full flex-col">
        <div className={`relative w-full overflow-hidden bg-zinc-100 ${imageClassName}`}>
          {listing.image_url ? (
            <Image
              src={listing.image_url}
              alt={listing.title}
              fill
              sizes={
                isFeatured
                  ? '(max-width: 768px) 80vw, 320px'
                  : '(max-width: 768px) 70vw, 260px'
              }
              className="object-cover transition duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center bg-gradient-to-br from-zinc-100 to-zinc-200 px-4 text-center text-xs font-medium uppercase tracking-wide text-zinc-400">
              {listingTypeLabel(listing.type)}
            </div>
          )}

          <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/95 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-800 shadow-sm">
                {badgeLabel}
              </span>
              {status && status !== 'published' && (
                <span className="rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-800 shadow-sm">
                  {status}
                </span>
              )}
            </div>
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 text-zinc-700 shadow-sm">
              <BookmarkIcon />
            </span>
          </div>

          {isFeatured && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/70 to-transparent" />
          )}
        </div>

        <div className={isFeatured ? 'flex flex-1 flex-col p-4' : 'flex flex-1 flex-col p-3'}>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
                {listingTypeLabel(listing.type)}
              </p>
              <h3
                className={
                  isFeatured
                    ? 'mt-1 line-clamp-2 text-base font-bold tracking-tight text-zinc-950'
                    : 'mt-1 line-clamp-2 text-sm font-semibold tracking-tight text-zinc-950'
                }
              >
                {listing.title}
              </h3>
            </div>
            {priceLabel && (
              <span className="shrink-0 rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                {priceLabel}
              </span>
            )}
          </div>

          <div className="mt-3 space-y-1.5 text-xs text-zinc-500">
            {metaLabel && (
              <p className="flex items-center gap-1.5">
                <ClockIcon />
                <span className="truncate">{metaLabel}</span>
              </p>
            )}
            {locationLabel && (
              <p className="flex items-center gap-1.5">
                <PinIcon />
                <span className="truncate">{locationLabel}</span>
              </p>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
