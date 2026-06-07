import { z } from 'zod'

export const eventFormSchema = z
  .object({
    title: z.string().min(1, 'Title is required').max(200),
    description: z.string().min(1, 'Description is required').max(5000),
    location: z.string().min(1, 'Location is required').max(200),
    starts_at: z.string().min(1, 'Start date is required'),
    ends_at: z.string().optional(),
    is_free: z.boolean(),
    price_php: z.string().optional(),
  })
  .superRefine((data, ctx) => {
    if (data.ends_at && data.starts_at) {
      const starts = new Date(data.starts_at)
      const ends = new Date(data.ends_at)
      if (ends < starts) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End must be after start',
          path: ['ends_at'],
        })
      }
    }

    if (!data.is_free) {
      const price = data.price_php?.trim()
      if (!price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Price is required for paid events',
          path: ['price_php'],
        })
        return
      }
      const parsed = Number(price)
      if (Number.isNaN(parsed) || parsed < 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Enter a valid price',
          path: ['price_php'],
        })
      }
    }
  })

export type EventFormValues = z.infer<typeof eventFormSchema>

export function eventToFormValues(event: {
  title: string
  description: string
  location: string
  starts_at: string
  ends_at: string | null
  is_free: boolean
  price_php: number | null
}): EventFormValues {
  return {
    title: event.title,
    description: event.description,
    location: event.location,
    starts_at: toDatetimeLocalValue(event.starts_at),
    ends_at: event.ends_at ? toDatetimeLocalValue(event.ends_at) : '',
    is_free: event.is_free,
    price_php: event.price_php != null ? String(event.price_php) : '',
  }
}

export function formValuesToEventPayload(values: EventFormValues, userId: string) {
  return {
    user_id: userId,
    title: values.title.trim(),
    description: values.description.trim(),
    location: values.location.trim(),
    starts_at: new Date(values.starts_at).toISOString(),
    ends_at: values.ends_at?.trim() ? new Date(values.ends_at).toISOString() : null,
    is_free: values.is_free,
    price_php: values.is_free ? null : Number(values.price_php),
  }
}

function toDatetimeLocalValue(iso: string): string {
  const date = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')

  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}
