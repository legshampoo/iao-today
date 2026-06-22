import { dateKeyInManila } from '@/lib/format'
import type { Event } from '@/lib/types/event'

const PHT_TIMEZONE = 'Asia/Manila'

export type EventDayGroup = {
  dateKey: string
  label: string
  events: Event[]
}

function formatMonthDay(dateKey: string): string {
  const [, month, day] = dateKey.split('-')
  return `${month}/${day}`
}

function weekdayName(dateKey: string): string {
  const [year, month, day] = dateKey.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 12))

  return new Intl.DateTimeFormat('en-US', {
    timeZone: PHT_TIMEZONE,
    weekday: 'long',
  }).format(date)
}

export function formatEventDaySectionLabel(
  dateKey: string,
  now = new Date()
): string {
  const monthDay = formatMonthDay(dateKey)
  const todayKey = dateKeyInManila(now)

  if (dateKey === todayKey) {
    return `Today ${monthDay}`
  }

  return `${weekdayName(dateKey)} ${monthDay}`
}

export function groupEventsByDay(
  events: Event[],
  now = new Date()
): EventDayGroup[] {
  const todayKey = dateKeyInManila(now)
  const groups = new Map<string, Event[]>()

  groups.set(todayKey, [])

  for (const event of events) {
    const dateKey = dateKeyInManila(new Date(event.starts_at))
    const existing = groups.get(dateKey) ?? []
    existing.push(event)
    groups.set(dateKey, existing)
  }

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([dateKey, dayEvents]) => ({
      dateKey,
      label: formatEventDaySectionLabel(dateKey, now),
      events: dayEvents.sort(
        (a, b) =>
          new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime()
      ),
    }))
}
