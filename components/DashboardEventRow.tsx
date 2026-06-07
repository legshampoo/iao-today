import Link from 'next/link'
import { formatEventDate, formatEventPrice } from '@/lib/format'
import type { Event } from '@/lib/types/event'

type DashboardEventRowProps = {
  event: Event
}

export function DashboardEventRow({ event }: DashboardEventRowProps) {
  const isPast = new Date(event.starts_at) < new Date()

  return (
    <div className="flex items-start justify-between gap-4 rounded-xl border border-zinc-200 bg-white p-4">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h2 className="font-semibold text-zinc-900">{event.title}</h2>
          {isPast && (
            <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-500">
              Past
            </span>
          )}
        </div>
        <p className="mt-1 text-sm text-zinc-600">{formatEventDate(event.starts_at)}</p>
        <p className="mt-0.5 text-sm text-zinc-500">{event.location}</p>
        <p className="mt-1 text-sm text-zinc-600">
          {formatEventPrice(event.is_free, event.price_php)}
        </p>
      </div>
      <Link
        href={`/dashboard/events/${event.id}/edit`}
        className="shrink-0 text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
      >
        Edit
      </Link>
    </div>
  )
}
