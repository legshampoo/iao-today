import { z } from 'zod'
import { slugifyListingTitle } from '@/lib/listings/format'
import { priceTypes, priceUnits } from '@/lib/listings/price'
import type { ListingWithDetails } from '@/lib/types/listing'

export const listingTypes = [
  'event',
  'discount',
  'tour',
  'restaurant',
  'wellness',
  'accommodation',
  'surfing',
  'transportation',
] as const

export const listingStatuses = ['draft', 'published', 'archived'] as const
export const recurrenceFrequencies = ['daily', 'weekly', 'monthly'] as const

export const listingFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    type: z.enum(listingTypes),
    status: z.enum(['draft', 'published']),
    description: z.string().max(5000).optional(),
    price_type: z.enum(priceTypes),
    currency: z.string().default('PHP'),
    price_amount: z.string().default(''),
    price_amount_max: z.string().default(''),
    price_unit: z.union([z.enum(priceUnits), z.literal('')]),
    price_display_override: z.string().max(120).default(''),
    website_url: z.string().url('Enter a valid website URL').optional().or(z.literal('')),
    instagram_url: z.string().url('Enter a valid Instagram URL').optional().or(z.literal('')),
    maps_url: z.string().url('Enter a valid Google Maps link').optional().or(z.literal('')),
    is_top_pick: z.boolean(),
    is_featured: z.boolean(),
    event: z.object({
      starts_at: z.string().optional(),
      ends_at: z.string().optional(),
      is_recurring: z.boolean(),
      recurrence_frequency: z.union([z.enum(recurrenceFrequencies), z.literal('')]),
    }),
    discount: z.object({
      discount_label: z.string().max(120).optional(),
      valid_from: z.string().optional(),
      valid_until: z.string().optional(),
      terms: z.string().max(2000).optional(),
    }),
  })
  .superRefine((data, ctx) => {
    if (data.price_type === 'paid') {
      if (!data.price_amount?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a price amount',
          path: ['price_amount'],
        })
      }

      if (!data.price_unit) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select a price unit',
          path: ['price_unit'],
        })
      }
    }

    if (data.type === 'event') {
      if (!data.event.starts_at?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Events need a start date and time',
          path: ['event', 'starts_at'],
        })
      }

      if (data.event.starts_at && data.event.ends_at) {
        validateDateOrder(data.event.starts_at, data.event.ends_at, ctx, ['event', 'ends_at'])
      }

      if (data.event.is_recurring && !data.event.recurrence_frequency) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Select a recurrence frequency',
          path: ['event', 'recurrence_frequency'],
        })
      }
    }

    if (data.type === 'discount') {
      if (!data.discount.discount_label?.trim()) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Discount listings need a discount label',
          path: ['discount', 'discount_label'],
        })
      }

      if (data.discount.valid_from && data.discount.valid_until) {
        validateDateOrder(data.discount.valid_from, data.discount.valid_until, ctx, [
          'discount',
          'valid_until',
        ])
      }
    }
  })

export type ListingFormValues = z.infer<typeof listingFormSchema>

export function defaultListingFormValues(): ListingFormValues {
  return {
    title: '',
    type: 'event',
    status: 'draft',
    description: '',
    price_type: 'not_listed',
    currency: 'PHP',
    price_amount: '',
    price_amount_max: '',
    price_unit: '',
    price_display_override: '',
    website_url: '',
    instagram_url: '',
    maps_url: '',
    is_top_pick: false,
    is_featured: false,
    event: {
      starts_at: '',
      ends_at: '',
      is_recurring: false,
      recurrence_frequency: '',
    },
    discount: {
      discount_label: '',
      valid_from: '',
      valid_until: '',
      terms: '',
    },
  }
}

export function listingToFormValues(listing: ListingWithDetails): ListingFormValues {
  return {
    title: listing.title,
    type: listing.type,
    status: listing.status === 'published' ? 'published' : 'draft',
    description: listing.description ?? '',
    price_type: listing.price_type ?? 'not_listed',
    currency: listing.currency ?? 'PHP',
    price_amount: listing.price_amount != null ? String(listing.price_amount) : '',
    price_amount_max:
      listing.price_amount_max != null ? String(listing.price_amount_max) : '',
    price_unit: listing.price_unit ?? '',
    price_display_override: listing.price_label ?? '',
    website_url: listing.external_url ?? '',
    instagram_url: listing.instagram_url ?? '',
    maps_url: listing.maps_url ?? '',
    is_top_pick: listing.is_top_pick,
    is_featured: listing.is_featured,
    event: {
      starts_at: listing.event_details?.starts_at
        ? toDatetimeLocalValue(listing.event_details.starts_at)
        : '',
      ends_at: listing.event_details?.ends_at
        ? toDatetimeLocalValue(listing.event_details.ends_at)
        : '',
      is_recurring: listing.event_details?.is_recurring ?? false,
      recurrence_frequency: parseRecurrenceFrequency(listing.event_details?.recurrence_rule),
    },
    discount: {
      discount_label: listing.discount_details?.discount_label ?? '',
      valid_from: listing.discount_details?.valid_from
        ? toDatetimeLocalValue(listing.discount_details.valid_from)
        : '',
      valid_until: listing.discount_details?.valid_until
        ? toDatetimeLocalValue(listing.discount_details.valid_until)
        : '',
      terms: listing.discount_details?.terms ?? '',
    },
  }
}

export function formValuesToListingPayload(
  values: ListingFormValues,
  options: { existingPublishedAt?: string | null; existingSlug?: string } = {}
) {
  return {
    title: values.title.trim(),
    slug: options.existingSlug ?? slugifyListingTitle(values.title),
    type: values.type,
    status: values.status,
    description: nullableTrim(values.description),
    price_type: values.price_type,
    currency: values.currency,
    price_amount: values.price_type === 'paid' ? nullableNumber(values.price_amount) : null,
    price_amount_max:
      values.price_type === 'paid' ? nullableNumber(values.price_amount_max) : null,
    price_unit:
      values.price_type === 'paid' && values.price_unit ? values.price_unit : null,
    price_label: nullableTrim(values.price_display_override),
    external_url: nullableTrim(values.website_url),
    instagram_url: nullableTrim(values.instagram_url),
    maps_url: nullableTrim(values.maps_url),
    is_top_pick: values.is_top_pick,
    is_featured: values.is_featured,
    published_at:
      values.status === 'published'
        ? options.existingPublishedAt ?? new Date().toISOString()
        : null,
  }
}

export function formValuesToEventDetailsPayload(values: ListingFormValues) {
  if (values.type !== 'event') {
    return null
  }

  return {
    starts_at: values.event.starts_at?.trim()
      ? new Date(values.event.starts_at).toISOString()
      : null,
    ends_at: values.event.ends_at?.trim()
      ? new Date(values.event.ends_at).toISOString()
      : null,
    date_label: null,
    time_label: null,
    is_recurring: values.event.is_recurring,
    recurrence_rule:
      values.event.is_recurring && values.event.recurrence_frequency
        ? values.event.recurrence_frequency
        : null,
  }
}

export function formValuesToDiscountDetailsPayload(values: ListingFormValues) {
  if (values.type !== 'discount') {
    return null
  }

  return {
    discount_label: nullableTrim(values.discount.discount_label),
    valid_from: values.discount.valid_from?.trim()
      ? new Date(values.discount.valid_from).toISOString()
      : null,
    valid_until: values.discount.valid_until?.trim()
      ? new Date(values.discount.valid_until).toISOString()
      : null,
    terms: nullableTrim(values.discount.terms),
  }
}

function nullableTrim(value: string | undefined): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed : null
}

function nullableNumber(value: string | undefined): number | null {
  const trimmed = value?.trim().replace(/,/g, '')
  if (!trimmed) {
    return null
  }

  const parsed = Number(trimmed)
  return Number.isFinite(parsed) ? parsed : null
}

function validateDateOrder(
  start: string,
  end: string,
  ctx: z.RefinementCtx,
  path: string[]
) {
  const startsAt = new Date(start)
  const endsAt = new Date(end)

  if (endsAt < startsAt) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'End must be after start',
      path,
    })
  }
}

function parseRecurrenceFrequency(
  recurrenceRule: string | null | undefined
): (typeof recurrenceFrequencies)[number] | '' {
  if (recurrenceRule === 'daily' || recurrenceRule === 'weekly' || recurrenceRule === 'monthly') {
    return recurrenceRule
  }

  return ''
}

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
