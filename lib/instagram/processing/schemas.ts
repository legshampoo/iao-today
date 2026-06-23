import { z } from 'zod'
import {
  normalizeManilaDateTimeString,
  parseManilaDateTime,
} from '@/lib/datetime/manila'
import { dateKeyInManila } from '@/lib/format'
import { normalizeEventPricing, parsePricePhp } from '@/lib/instagram/processing/pricing'
import type { ExtractedEventFields } from '@/lib/instagram/types'

export const classificationSchema = z.object({
  isEvent: z.boolean(),
  reason: z.string(),
})

export const extractedEventItemSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  location: z.string().min(1).max(200),
  starts_at: z.string().min(1),
  ends_at: z.string().nullable(),
  time_tbc: z.boolean(),
  is_free: z.boolean(),
  price_php: z.preprocess(
    (value) => parsePricePhp(value),
    z.number().nullable()
  ),
})

export const extractedEventsSchema = z.object({
  events: z.array(extractedEventItemSchema).min(1).max(30),
})

export type ClassificationOutput = z.infer<typeof classificationSchema>
export type ExtractedEventOutput = z.infer<typeof extractedEventItemSchema>

export type ValidationResult =
  | { status: 'valid'; data: ExtractedEventOutput[] }
  | { status: 'skip'; reason: string }

function slugifyTitle(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

  return slug.slice(0, 48) || 'event'
}

export function buildInstagramEventKey(
  postId: string,
  startsAt: Date,
  title: string
): string {
  const date = dateKeyInManila(startsAt)
  return `${postId}#${date}#${slugifyTitle(title)}`
}

export function normalizeEventDates(
  event: ExtractedEventOutput
): ExtractedEventOutput {
  let timeTbc = event.time_tbc

  if (/^\d{4}-\d{2}-\d{2}$/.test(event.starts_at.trim())) {
    timeTbc = true
  }

  const startsAt = normalizeManilaDateTimeString(event.starts_at, timeTbc)

  let endsAt = event.ends_at

  if (endsAt && /^\d{4}-\d{2}-\d{2}$/.test(endsAt.trim())) {
    endsAt = null
  } else if (endsAt?.trim()) {
    endsAt = normalizeManilaDateTimeString(endsAt, false)
  }

  return {
    ...event,
    starts_at: startsAt,
    ends_at: endsAt,
    time_tbc: timeTbc,
  }
}

function isUpcomingEvent(
  startsAt: Date,
  timeTbc: boolean,
  referenceDate: Date
): boolean {
  if (timeTbc) {
    return dateKeyInManila(startsAt) >= dateKeyInManila(referenceDate)
  }

  return startsAt >= referenceDate
}

function normalizeExtractedEvent(
  event: ExtractedEventOutput
): ExtractedEventOutput {
  return normalizeEventPricing(normalizeEventDates(event))
}

function validateSingleEvent(
  event: ExtractedEventOutput,
  referenceDate: Date
): { status: 'valid'; data: ExtractedEventOutput } | { status: 'skip' } {
  const normalized = normalizeExtractedEvent(event)
  const startsAt = parseManilaDateTime(
    normalized.starts_at,
    normalized.time_tbc
  )

  if (Number.isNaN(startsAt.getTime())) {
    return { status: 'skip' }
  }

  if (!isUpcomingEvent(startsAt, normalized.time_tbc, referenceDate)) {
    return { status: 'skip' }
  }

  if (normalized.ends_at) {
    const endsAt = parseManilaDateTime(normalized.ends_at, false)

    if (Number.isNaN(endsAt.getTime()) || endsAt < startsAt) {
      return { status: 'skip' }
    }
  }

  return { status: 'valid', data: normalized }
}

export function validateExtractedEvents(
  events: ExtractedEventOutput[],
  referenceDate = new Date()
): ValidationResult {
  const validEvents: ExtractedEventOutput[] = []

  for (const event of events) {
    const result = validateSingleEvent(event, referenceDate)

    if (result.status === 'valid') {
      validEvents.push(result.data)
    }
  }

  if (validEvents.length === 0) {
    return {
      status: 'skip',
      reason: 'No upcoming event dates found in this post.',
    }
  }

  return { status: 'valid', data: validEvents }
}

export function toExtractedEventFields(
  event: ExtractedEventOutput
): ExtractedEventFields {
  return event
}
