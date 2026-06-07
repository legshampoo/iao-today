'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { createClient } from '@/lib/supabase/client'
import type { Event } from '@/lib/types/event'
import {
  eventFormSchema,
  eventToFormValues,
  formValuesToEventPayload,
  type EventFormValues,
} from '@/lib/validations/event'

type EventFormProps = {
  mode: 'create' | 'edit'
  event?: Event
}

export function EventForm({ mode, event }: EventFormProps) {
  const router = useRouter()
  const [submitError, setSubmitError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: event ? eventToFormValues(event) : {
      title: '',
      description: '',
      location: '',
      starts_at: '',
      ends_at: '',
      is_free: false,
      price_php: '',
    },
  })

  const isFree = watch('is_free')

  async function onSubmit(values: EventFormValues) {
    setSubmitError(null)
    const supabase = createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSubmitError('You must be signed in.')
      return
    }

    const payload = formValuesToEventPayload(values, user.id)

    if (mode === 'create') {
      const { error } = await supabase.from('events').insert(payload)
      if (error) {
        setSubmitError(error.message)
        return
      }
      router.push('/dashboard')
      router.refresh()
      return
    }

    if (!event) return

    const { error } = await supabase.from('events').update(payload).eq('id', event.id)
    if (error) {
      setSubmitError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  async function handleDelete() {
    if (!event) return
    if (!window.confirm('Delete this event? This cannot be undone.')) return

    setSubmitError(null)
    const supabase = createClient()
    const { error } = await supabase.from('events').delete().eq('id', event.id)

    if (error) {
      setSubmitError(error.message)
      return
    }

    router.push('/dashboard')
    router.refresh()
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
  const labelClass = 'block text-sm font-medium text-zinc-700'
  const errorClass = 'mt-1 text-sm text-red-600'

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label htmlFor="title" className={labelClass}>
          Title
        </label>
        <input id="title" type="text" className={inputClass} {...register('title')} />
        {errors.title && <p className={errorClass}>{errors.title.message}</p>}
      </div>

      <div>
        <label htmlFor="description" className={labelClass}>
          Description
        </label>
        <textarea
          id="description"
          rows={4}
          className={inputClass}
          {...register('description')}
        />
        {errors.description && <p className={errorClass}>{errors.description.message}</p>}
      </div>

      <div>
        <label htmlFor="location" className={labelClass}>
          Location
        </label>
        <input id="location" type="text" className={inputClass} {...register('location')} />
        {errors.location && <p className={errorClass}>{errors.location.message}</p>}
      </div>

      <div>
        <label htmlFor="starts_at" className={labelClass}>
          Starts
        </label>
        <input
          id="starts_at"
          type="datetime-local"
          className={inputClass}
          {...register('starts_at')}
        />
        {errors.starts_at && <p className={errorClass}>{errors.starts_at.message}</p>}
      </div>

      <div>
        <label htmlFor="ends_at" className={labelClass}>
          Ends <span className="font-normal text-zinc-400">(optional)</span>
        </label>
        <input
          id="ends_at"
          type="datetime-local"
          className={inputClass}
          {...register('ends_at')}
        />
        {errors.ends_at && <p className={errorClass}>{errors.ends_at.message}</p>}
      </div>

      <div className="flex items-center gap-2">
        <input
          id="is_free"
          type="checkbox"
          className="h-4 w-4 rounded border-zinc-300"
          {...register('is_free')}
        />
        <label htmlFor="is_free" className="text-sm font-medium text-zinc-700">
          Free event
        </label>
      </div>

      {!isFree && (
        <div>
          <label htmlFor="price_php" className={labelClass}>
            Price (PHP)
          </label>
          <input
            id="price_php"
            type="number"
            min="0"
            step="0.01"
            className={inputClass}
            {...register('price_php')}
          />
          {errors.price_php && <p className={errorClass}>{errors.price_php.message}</p>}
        </div>
      )}

      {submitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSubmitting
            ? 'Saving…'
            : mode === 'create'
              ? 'Create event'
              : 'Save changes'}
        </button>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          Cancel
        </Link>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            className="ml-auto text-sm font-medium text-red-600 transition-colors hover:text-red-800"
          >
            Delete event
          </button>
        )}
      </div>
    </form>
  )
}
