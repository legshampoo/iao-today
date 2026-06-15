import Link from 'next/link'
import { EventThumbCard } from '@/components/EventThumbCard'
import type { Event } from '@/lib/types/event'

type DashboardEventRowProps = {
  event: Event
  expired?: boolean
}

export function DashboardEventRow({ event, expired = false }: DashboardEventRowProps) {
  return (
    <EventThumbCard
      event={event}
      href={`/events/${event.id}`}
      expired={expired}
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
