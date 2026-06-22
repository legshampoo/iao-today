import { z } from 'zod'
import { dateKeyInManila } from '@/lib/format'
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
  price_php: z.number().nullable(),
})

export const extractedEventsSchema = z.object({
  events: z.array(extractedEventItemSchema).min(1).max(30),
})

export type ClassificationOutput = z.infer<typeof classificationSchema>
export type ExtractedEventOutput = z.infer<typeof extractedEventItemSchema>

export type ValidationResult =
  | { status: 'valid'; data: ExtractedEventOutput[] }
  | { status: 'skip'; reason: string }

const MANILA_OFFSET = '+08:00'
const START_OF_DAY = 'T00:00:00'

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
  let startsAt = event.starts_at.trim()
  let timeTbc = event.time_tbc

  if (/^\d{4}-\d{2}-\d{2}$/.test(startsAt)) {
    startsAt = `${startsAt}${START_OF_DAY}${MANILA_OFFSET}`
    timeTbc = true
  }

  let endsAt = event.ends_at

  if (endsAt && /^\d{4}-\d{2}-\d{2}$/.test(endsAt.trim())) {
    endsAt = null
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

  return startsAt > referenceDate
}

function validateSingleEvent(
  event: ExtractedEventOutput,
  referenceDate: Date
): { status: 'valid'; data: ExtractedEventOutput } | { status: 'skip' } {
  const normalized = normalizeEventDates(event)
  const startsAt = new Date(normalized.starts_at)

  if (Number.isNaN(startsAt.getTime())) {
    return { status: 'skip' }
  }

  if (!isUpcomingEvent(startsAt, normalized.time_tbc, referenceDate)) {
    return { status: 'skip' }
  }

  if (normalized.ends_at) {
    const endsAt = new Date(normalized.ends_at)

    if (Number.isNaN(endsAt.getTime()) || endsAt < startsAt) {
      return { status: 'skip' }
    }
  }

  if (normalized.is_free && normalized.price_php != null) {
    return { status: 'skip' }
  }

  if (!normalized.is_free) {
    if (normalized.price_php == null || normalized.price_php < 0) {
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
