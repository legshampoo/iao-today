import Link from 'next/link'
import { EventThumbCard } from '@/components/EventThumbCard'
import type { Event } from '@/lib/types/event'

type DashboardEventRowProps = {
  event: Event
}

export function DashboardEventRow({ event }: DashboardEventRowProps) {
  const isPast = new Date(event.starts_at) < new Date()

  return (
    <EventThumbCard
      event={event}
      href={`/events/${event.id}`}
      badges={
        isPast ? (
          <span className="rounded-full border border-zinc-200 bg-white px-2.5 py-0.5 text-xs font-medium text-zinc-500">
            Past
          </span>
        ) : undefined
      }
      trailing={
        <div className="flex flex-col items-end gap-2">
          <Link
            href={`/events/${event.id}`}
            className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
          >
            View
          </Link>
          <Link
            href={`/dashboard/events/${event.id}/edit`}
            className="text-sm font-medium text-zinc-700 underline transition-colors hover:text-zinc-900"
          >
            Edit
          </Link>
        </div>
      }
    />
  )
}
