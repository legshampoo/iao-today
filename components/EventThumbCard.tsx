import Link from 'next/link'
import { EventImage } from '@/components/EventImage'
import {
  formatEventPrice,
  formatEventSchedule,
  formatEventTimeLabel,
} from '@/lib/format'
import type { Event } from '@/lib/types/event'

type EventThumbCardProps = {
  event: Event
  href: string
  trailing?: React.ReactNode
  footer?: React.ReactNode
  badges?: React.ReactNode
  expired?: boolean
  groupedByDay?: boolean
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-4 w-4 shrink-0"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
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
      className="h-4 w-4 shrink-0"
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function ChevronIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5 shrink-0 text-zinc-300"
    >
      <path d="m9 6 6 6-6 6" />
    </svg>
  )
}

export function EventThumbCard({
  event,
  href,
  trailing,
  footer,
  badges,
  expired = false,
  groupedByDay = false,
}: EventThumbCardProps) {
  const priceLabel = formatEventPrice(event.is_free, event.price_php)

  return (
    <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-zinc-50 transition-colors hover:border-zinc-300">
      <div className="flex items-center">
        <Link href={href} className="flex min-w-0 flex-1 items-center gap-4 p-3">
          {event.image_url && (
            <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-zinc-200">
              <EventImage
                src={event.image_url}
                alt={event.title}
                sizes="96px"
              />
              {expired && (
                <div className="absolute inset-0 flex items-center justify-center bg-red-950/25">
                  <span className="rounded-full bg-red-100/95 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-red-400">
                    Expired
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {priceLabel && (
                <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-700">
                  {priceLabel}
                </span>
              )}
              {badges}
            </div>

            <h2 className="mt-2 text-lg font-semibold tracking-tight text-zinc-900">
              {event.title}
            </h2>

            <p className="mt-2 flex items-center gap-2 text-sm text-zinc-500">
              <CalendarIcon />
              <span className="truncate">
                {groupedByDay
                  ? formatEventTimeLabel(
                      event.starts_at,
                      event.ends_at,
                      event.time_tbc
                    )
                  : formatEventSchedule(
                      event.starts_at,
                      event.ends_at,
                      event.time_tbc
                    )}
              </span>
            </p>

            <p className="mt-1 flex items-center gap-2 text-sm text-zinc-500">
              <PinIcon />
              <span className="truncate">{event.location}</span>
            </p>
          </div>

          {!trailing && <ChevronIcon />}
        </Link>

        {trailing && <div className="shrink-0 pr-3">{trailing}</div>}
      </div>

      {footer}
    </div>
  )
}
