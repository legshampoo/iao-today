import { dateKeyInManila } from '@/lib/format'

const PHT_TIMEZONE = 'Asia/Manila'
const MANILA_OFFSET = '+08:00'

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/
const ZULU =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?Z$/i
const HAS_OFFSET = /[+-]\d{2}:\d{2}$/
const LOCAL_DATETIME =
  /^(\d{4}-\d{2}-\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.\d+)?$/

export function manilaStartOfDayIso(dateKey: string): string {
  return `${dateKey}T00:00:00${MANILA_OFFSET}`
}

export function formatManilaContext(now = new Date()) {
  const dateKey = dateKeyInManila(now)
  const weekday = new Intl.DateTimeFormat('en-US', {
    timeZone: PHT_TIMEZONE,
    weekday: 'long',
  }).format(now)
  const time = new Intl.DateTimeFormat('en-PH', {
    timeZone: PHT_TIMEZONE,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  }).format(now)

  return { dateKey, weekday, time }
}

/** Format an instant as ISO 8601 with a fixed +08:00 offset (Siargao local). */
export function formatManilaDateTimeIso(date: Date): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: PHT_TIMEZONE,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date)

  const pick = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? '00'

  const dateKey = `${pick('year')}-${pick('month')}-${pick('day')}`
  const time = `${pick('hour')}:${pick('minute')}:${pick('second')}`

  return `${dateKey}T${time}${MANILA_OFFSET}`
}

/**
 * Parse LLM or user date strings as Siargao (Asia/Manila) local time.
 * All Instagram events are local to Siargao; strings without an offset are
 * treated as Manila time, not UTC.
 */
export function parseManilaDateTime(input: string, timeTbc = false): Date {
  const trimmed = input.trim()

  if (DATE_ONLY.test(trimmed)) {
    return new Date(manilaStartOfDayIso(trimmed))
  }

  const zuluMatch = trimmed.match(ZULU)

  if (zuluMatch) {
    const [, date, hours, minutes, seconds] = zuluMatch

    if (
      timeTbc ||
      (hours === '00' && minutes === '00' && seconds === '00') ||
      (hours === '16' && minutes === '00' && seconds === '00')
    ) {
      return new Date(manilaStartOfDayIso(date))
    }

    return new Date(trimmed)
  }

  if (HAS_OFFSET.test(trimmed)) {
    const parsed = new Date(trimmed)

    if (timeTbc) {
      return new Date(manilaStartOfDayIso(dateKeyInManila(parsed)))
    }

    return parsed
  }

  if (LOCAL_DATETIME.test(trimmed)) {
    const withoutFraction = trimmed.replace(/\.\d+$/, '')
    const parsed = new Date(`${withoutFraction}${MANILA_OFFSET}`)

    if (timeTbc) {
      return new Date(manilaStartOfDayIso(dateKeyInManila(parsed)))
    }

    return parsed
  }

  const fallback = new Date(trimmed)

  if (Number.isNaN(fallback.getTime())) {
    return fallback
  }

  if (timeTbc) {
    return new Date(manilaStartOfDayIso(dateKeyInManila(fallback)))
  }

  return fallback
}

export function normalizeManilaDateTimeString(
  input: string,
  timeTbc: boolean
): string {
  const parsed = parseManilaDateTime(input, timeTbc)

  if (Number.isNaN(parsed.getTime())) {
    return input.trim()
  }

  return timeTbc
    ? manilaStartOfDayIso(dateKeyInManila(parsed))
    : formatManilaDateTimeIso(parsed)
}
