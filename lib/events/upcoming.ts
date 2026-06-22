import { dateKeyInManila } from '@/lib/format'

export function isUpcomingEvent(
  event: { starts_at: string; time_tbc: boolean },
  now = new Date()
): boolean {
  if (event.time_tbc) {
    return dateKeyInManila(new Date(event.starts_at)) >= dateKeyInManila(now)
  }

  return new Date(event.starts_at) >= now
}

export function startOfTodayManilaIso(now = new Date()): string {
  return `${dateKeyInManila(now)}T00:00:00+08:00`
}
