import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventDetailInfoRow, eventDetailIcons } from '@/components/EventDetailInfoRow'
import { EventImage } from '@/components/EventImage'
import { Header } from '@/components/Header'
import { ListingCard } from '@/components/ListingCard'
import { PageShell } from '@/components/PageShell'
import {
  formatDiscountValidity,
  formatListingEventTime,
  listingBadgeLabel,
  listingLocationLabel,
  listingTypeLabel,
  listingTypeRoute,
} from '@/lib/listings/format'
import { displayListingPrice } from '@/lib/listings/price'
import { getPublishedListingBySlug, getSuggestedListings } from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'
import type { ListingWithDetails } from '@/lib/types/listing'
import { buttonClasses } from '@/lib/ui/button'

type ListingPageProps = {
  params: Promise<{ slug: string }>
}

function TagIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <path d="M20.5 13.5 13.5 20.5a2 2 0 0 1-2.83 0L3 12.83V3h9.83l7.67 7.67a2 2 0 0 1 0 2.83Z" />
      <circle cx="8" cy="8" r="1.5" />
    </svg>
  )
}

function formatRecurrenceLabel(rule: string | null | undefined): string {
  switch (rule) {
    case 'daily':
      return 'Daily'
    case 'weekly':
      return 'Weekly'
    case 'monthly':
      return 'Monthly'
    default:
      return 'Recurring event'
  }
}

function formatLinkLabel(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return url
  }
}

function detailRows(listing: ListingWithDetails) {
  const rows: Array<{
    icon: React.ReactNode
    primary: string
    secondary?: string
    href?: string
  }> = []
  const eventTime = formatListingEventTime(listing.event_details ?? null)
  const location = listingLocationLabel(listing)

  if (eventTime) {
    rows.push({
      icon: eventDetailIcons.calendar,
      primary: eventTime,
      secondary: listing.event_details?.is_recurring
        ? formatRecurrenceLabel(listing.event_details.recurrence_rule)
        : undefined,
    })
  }

  if (listing.external_url) {
    rows.push({
      icon: eventDetailIcons.globe,
      primary: 'Website',
      secondary: formatLinkLabel(listing.external_url),
      href: listing.external_url,
    })
  }

  if (listing.instagram_url) {
    rows.push({
      icon: eventDetailIcons.instagram,
      primary: 'Instagram',
      secondary: formatLinkLabel(listing.instagram_url),
      href: listing.instagram_url,
    })
  }

  if (listing.maps_url) {
    rows.push({
      icon: eventDetailIcons.pin,
      primary: 'View on map',
      href: listing.maps_url,
    })
  } else if (location) {
    rows.push({
      icon: eventDetailIcons.pin,
      primary: location,
    })
  }

  const priceLabel = displayListingPrice(listing)

  if (listing.type === 'discount') {
    const validity = formatDiscountValidity(listing.discount_details ?? null)
    rows.push({
      icon: <TagIcon />,
      primary: listing.discount_details?.discount_label ?? 'Discount',
      secondary: validity ?? undefined,
    })
  } else if (priceLabel) {
    rows.push({
      icon: eventDetailIcons.ticket,
      primary: priceLabel,
    })
  }

  return rows
}

export default async function ListingPage({ params }: ListingPageProps) {
  const { slug } = await params
  const supabase = await createClient()
  const listing = await getPublishedListingBySlug(supabase, slug)

  if (!listing) {
    notFound()
  }

  let suggestedListings: ListingWithDetails[] = []

  try {
    suggestedListings = await getSuggestedListings(supabase, listing.id)
  } catch {
    suggestedListings = []
  }

  const rows = detailRows(listing)
  const badge = listingBadgeLabel(listing, listing.discount_details)

  return (
    <>
      <Header />
      <PageShell>
        <article className="mx-auto max-w-[725px] space-y-4">
          {listing.image_url && (
            <div className="relative w-full overflow-hidden rounded-2xl bg-zinc-100 shadow-sm">
              <EventImage
                src={listing.image_url}
                alt={listing.title}
                sizes="(max-width: 1024px) 100vw, 725px"
                priority
                fit="native"
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <Link
                  href={listingTypeRoute(listing.type)}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-white"
                  aria-label={`Back to ${listingTypeLabel(listing.type)} listings`}
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </Link>
                <span className="rounded-full bg-white/95 px-4 py-2 text-sm font-semibold text-zinc-700 shadow-sm">
                  {badge}
                </span>
              </div>
            </div>
          )}

          <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-6 shadow-sm sm:px-8">
            {!listing.image_url && (
              <div className="mb-5 flex items-center justify-between gap-3">
                <Link
                  href={listingTypeRoute(listing.type)}
                  className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  Back to {listingTypeLabel(listing.type)}
                </Link>
                <span className="rounded-full bg-zinc-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-zinc-600">
                  {badge}
                </span>
              </div>
            )}

            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              {listingTypeLabel(listing.type)}
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-zinc-950 sm:text-3xl">
              {listing.title}
            </h1>

            {listing.categories && listing.categories.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {listing.categories.map((category) => (
                  <span
                    key={category.id}
                    className="rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-600"
                  >
                    {category.name}
                  </span>
                ))}
              </div>
            )}

            {rows.length > 0 && (
              <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
                {rows.map((row) => (
                  <EventDetailInfoRow
                    key={`${row.primary}-${row.secondary ?? ''}`}
                    icon={row.icon}
                    primary={row.primary}
                    secondary={row.secondary}
                    href={row.href}
                  />
                ))}
              </div>
            )}

            {listing.description && (
              <div className="mt-8">
                <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700">
                  {listing.description}
                </p>
              </div>
            )}

            {listing.type === 'discount' && listing.discount_details?.terms && (
              <div className="mt-8 rounded-2xl bg-zinc-50 p-4">
                <h2 className="text-sm font-semibold text-zinc-950">Terms</h2>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-zinc-600">
                  {listing.discount_details.terms}
                </p>
              </div>
            )}

            {(listing.external_url || listing.instagram_url || listing.maps_url) && (
              <div className="mt-8 flex flex-wrap gap-3">
                {listing.external_url && (
                  <a
                    href={listing.external_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses({ variant: 'secondary' })}
                  >
                    Visit Website
                  </a>
                )}
                {listing.instagram_url && (
                  <a
                    href={listing.instagram_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses({ variant: 'secondary' })}
                  >
                    Instagram
                  </a>
                )}
                {listing.maps_url && (
                  <a
                    href={listing.maps_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={buttonClasses()}
                  >
                    View on Map
                  </a>
                )}
              </div>
            )}
          </div>

          {suggestedListings.length > 0 && (
            <section className="pt-2">
              <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
                You also may like
              </h2>
              <div className="mt-4 flex flex-col gap-3">
                {suggestedListings.map((suggested) => (
                  <ListingCard key={suggested.id} listing={suggested} variant="horizontal" />
                ))}
              </div>
            </section>
          )}
        </article>
      </PageShell>
    </>
  )
}
