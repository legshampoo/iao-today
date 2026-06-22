import Link from 'next/link'
import { EventThumbCard } from '@/components/EventThumbCard'
import type { Event } from '@/lib/types/event'

type EventCardProps = {
  event: Event
  isOwner?: boolean
  groupedByDay?: boolean
}

export function EventCard({ event, isOwner = false, groupedByDay = false }: EventCardProps) {
  return (
    <EventThumbCard
      event={event}
      href={`/events/${event.id}`}
      groupedByDay={groupedByDay}
      footer={
        isOwner ? (
          <div className="border-t border-zinc-200 px-4 py-2.5">
            <Link
              href={`/dashboard/events/${event.id}/edit`}
              className="text-sm font-medium text-zinc-700 underline transition-colors hover:text-zinc-900"
            >
              Edit
            </Link>
          </div>
        ) : undefined
      }
    />
  )
}
