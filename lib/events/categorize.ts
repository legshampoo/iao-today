import { dateKeyInManila } from '@/lib/format'
import type { Event } from '@/lib/types/event'

export type CategorizedEvents = {
  today: Event[]
  upcoming: Event[]
  past: Event[]
}

export function categorizeEvents(events: Event[], now = new Date()): CategorizedEvents {
  const todayKey = dateKeyInManila(now)
  const nowMs = now.getTime()

  const today: Event[] = []
  const upcoming: Event[] = []
  const past: Event[] = []

  for (const event of events) {
    const start = new Date(event.starts_at)
    const startKey = dateKeyInManila(start)

    if (event.time_tbc) {
      if (startKey < todayKey) {
        past.push(event)
      } else if (startKey === todayKey) {
        today.push(event)
      } else {
        upcoming.push(event)
      }
      continue
    }

    if (start.getTime() < nowMs) {
      past.push(event)
    } else if (startKey === todayKey) {
      today.push(event)
    } else {
      upcoming.push(event)
    }
  }

  past.sort((a, b) => new Date(b.starts_at).getTime() - new Date(a.starts_at).getTime())

  return { today, upcoming, past }
}
