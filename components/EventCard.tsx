import Link from 'next/link'
import { formatEventDate, formatEventPrice } from '@/lib/format'
import type { Event } from '@/lib/types/event'

type EventCardProps = {
  event: Event
}

export function EventCard({ event }: EventCardProps) {
  return (
    <Link
      href={`/events/${event.id}`}
      className="block rounded-xl border border-zinc-200 bg-white p-5 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
    >
      <div className="flex items-start justify-between gap-4">
        <h2 className="text-lg font-semibold text-zinc-900">{event.title}</h2>
        <span className="shrink-0 rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
          {formatEventPrice(event.is_free, event.price_php)}
        </span>
      </div>
      <p className="mt-2 text-sm text-zinc-600">{formatEventDate(event.starts_at)}</p>
      <p className="mt-1 text-sm text-zinc-500">{event.location}</p>
    </Link>
  )
}
