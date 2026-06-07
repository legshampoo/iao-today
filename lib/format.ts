const PHT_TIMEZONE = 'Asia/Manila'

function dateKeyInManila(date: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PHT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date)
}

export function formatEventTime(isoDate: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function formatEventDayLabel(isoDate: string): string {
  const date = new Date(isoDate)
  const todayKey = dateKeyInManila(new Date())
  const targetKey = dateKeyInManila(date)

  if (targetKey === todayKey) {
    return 'Today'
  }

  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  if (targetKey === dateKeyInManila(tomorrow)) {
    return 'Tomorrow'
  }

  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  }).format(date)
}

export function formatEventSchedule(
  startsAt: string,
  endsAt: string | null
): string {
  const startTime = formatEventTime(startsAt)
  const timeRange = endsAt ? `${startTime} – ${formatEventTime(endsAt)}` : startTime

  return `${formatEventDayLabel(startsAt)} · ${timeRange}`
}

export function formatEventDetailDateTime(
  startsAt: string,
  endsAt: string | null
): string {
  const dayPart = new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  }).format(new Date(startsAt))

  const startTime = formatEventTime(startsAt)
  const timePart = endsAt ? `${startTime} - ${formatEventTime(endsAt)}` : startTime

  return `${dayPart} at ${timePart}`
}

export function formatEventDate(isoDate: string): string {
  return new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(isoDate))
}

export function formatEventPrice(isFree: boolean, pricePhp: number | null): string {
  if (isFree) return 'Free'
  if (pricePhp == null) return 'Free'

  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(pricePhp)
}
