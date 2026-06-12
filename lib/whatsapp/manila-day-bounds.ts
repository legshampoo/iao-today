const PHT_TIMEZONE = 'Asia/Manila'
const MANILA_OFFSET_MS = 8 * 60 * 60 * 1000

function manilaDateParts(date: Date) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PHT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(date)

  const year = Number(parts.find((part) => part.type === 'year')?.value)
  const month = Number(parts.find((part) => part.type === 'month')?.value)
  const day = Number(parts.find((part) => part.type === 'day')?.value)

  return { year, month, day }
}

export function manilaDateKey(date: Date = new Date()): string {
  const { year, month, day } = manilaDateParts(date)
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function manilaDayBounds(date: Date = new Date()) {
  const { year, month, day } = manilaDateParts(date)
  const start = new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0) - MANILA_OFFSET_MS)
  const end = new Date(Date.UTC(year, month - 1, day + 1, 0, 0, 0, 0) - MANILA_OFFSET_MS)

  return {
    dateKey: manilaDateKey(date),
    startIso: start.toISOString(),
    endIso: end.toISOString(),
  }
}
