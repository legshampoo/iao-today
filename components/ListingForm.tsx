'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState } from 'react'
import {
  displayListingPrice,
  priceTypeLabels,
  priceTypes,
  priceUnitLabels,
  priceUnits,
} from '@/lib/listings/price'
import { createClient } from '@/lib/supabase/client'
import {
  deleteListingImage,
  uploadListingImage,
  validateListingImage,
} from '@/lib/storage/listing-image'
import type { ListingType, ListingWithDetails } from '@/lib/types/listing'
import {
  defaultListingFormValues,
  formValuesToDiscountDetailsPayload,
  formValuesToEventDetailsPayload,
  formValuesToListingPayload,
  listingFormSchema,
  listingToFormValues,
  listingTypes,
  recurrenceFrequencies,
  type ListingFormValues,
} from '@/lib/validations/listing'

type ListingFormProps = {
  mode: 'create' | 'edit'
  listing?: ListingWithDetails
  isAdmin?: boolean
  managementBasePath?: string
}

const categoryLabels: Record<ListingType, string> = {
  event: 'Event',
  discount: 'Discount',
  tour: 'Tour',
  restaurant: 'Restaurant',
  wellness: 'Wellness',
  accommodation: 'Accommodation',
}

const recurrenceLabels = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
} as const

export function ListingForm({
  mode,
  listing,
  isAdmin = false,
  managementBasePath = '/admin/listings',
}: ListingFormProps) {
  const router = useRouter()
  const defaults = listing ? listingToFormValues(listing) : defaultListingFormValues()
  const [listingType, setListingType] = useState<ListingType>(defaults.type)
  const [priceType, setPriceType] = useState(defaults.price_type)
  const [priceAmount, setPriceAmount] = useState(defaults.price_amount)
  const [priceAmountMax, setPriceAmountMax] = useState(defaults.price_amount_max)
  const [priceUnit, setPriceUnit] = useState(defaults.price_unit)
  const [priceDisplayOverride, setPriceDisplayOverride] = useState(defaults.price_display_override)
  const [isRecurring, setIsRecurring] = useState(defaults.event.is_recurring)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [removeImage, setRemoveImage] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const isPublished = listing?.status === 'published'

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null)
      return
    }

    const previewUrl = URL.createObjectURL(imageFile)
    setImagePreview(previewUrl)

    return () => {
      URL.revokeObjectURL(previewUrl)
    }
  }, [imageFile])

  const pricePreview = useMemo(() => {
    return displayListingPrice({
      price_type: priceType,
      currency: defaults.currency,
      price_amount: priceAmount.trim() ? Number(priceAmount) : null,
      price_amount_max: priceAmountMax.trim() ? Number(priceAmountMax) : null,
      price_unit: priceUnit || null,
      price_label: priceDisplayOverride.trim() || null,
    })
  }, [priceType, priceAmount, priceAmountMax, priceUnit, priceDisplayOverride, defaults.currency])

  function handleImageChange(file: File | null) {
    setImageError(null)
    setRemoveImage(false)

    if (!file) {
      setImageFile(null)
      return
    }

    const validationError = validateListingImage(file)

    if (validationError) {
      setImageError(validationError)
      setImageFile(null)
      return
    }

    setImageFile(file)
  }

  async function handleSave(targetStatus?: ListingFormValues['status']) {
    setSubmitError(null)
    setIsSubmitting(true)

    const form = document.getElementById('listing-form') as HTMLFormElement | null

    if (!form) {
      setSubmitError('Form not found.')
      setIsSubmitting(false)
      return
    }

    const values = valuesFromForm(form, {
      listingType,
      status: targetStatus ?? (mode === 'create' ? 'published' : listing?.status === 'published' ? 'published' : 'draft'),
      priceType,
      priceAmount,
      priceAmountMax,
      priceUnit,
      priceDisplayOverride,
      isAdmin,
      listing,
    })
    const parsed = listingFormSchema.safeParse(values)

    if (!parsed.success) {
      setSubmitError(parsed.error.issues.map((issue) => issue.message).join(' '))
      setIsSubmitting(false)
      return
    }

    const supabase = createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      setSubmitError('You must be signed in.')
      setIsSubmitting(false)
      return
    }

    try {
      const listingId = await saveListing(supabase, mode, listing, parsed.data, user.id)
      await syncListingImage(supabase, user.id, listingId, listing?.image_url, imageFile, removeImage)
      await syncListingDetails(supabase, listingId, parsed.data)

      router.push(managementBasePath)
      router.refresh()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Could not save listing.')
      setIsSubmitting(false)
    }
  }

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    await handleSave(mode === 'create' ? 'published' : undefined)
  }

  async function handleSaveDraft() {
    await handleSave('draft')
  }

  async function handlePublish() {
    await handleSave('published')
  }

  async function handleUnpublish() {
    await handleSave('draft')
  }

  async function handleDelete() {
    if (!listing) return
    if (!window.confirm('Delete this listing? This cannot be undone.')) return

    setSubmitError(null)
    setIsSubmitting(true)

    const supabase = createClient()

    if (listing.image_url) {
      await deleteListingImage(supabase, listing.image_url)
    }

    const { error } = await supabase.from('listings').delete().eq('id', listing.id)

    if (error) {
      setSubmitError(error.message)
      setIsSubmitting(false)
      return
    }

    router.push(managementBasePath)
    router.refresh()
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
  const labelClass = 'block text-sm font-medium text-zinc-700'
  const currentImageUrl =
    imagePreview ?? (!removeImage ? listing?.image_url ?? null : null)

  return (
    <form id="listing-form" onSubmit={onSubmit} className="space-y-6">
      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <div className="min-w-[220px]">
          <label htmlFor="type" className={labelClass}>
            Category
          </label>
          <select
            id="type"
            name="type"
            defaultValue={defaults.type}
            className={inputClass}
            onChange={(event) => setListingType(event.target.value as ListingType)}
          >
            {listingTypes.map((type) => (
              <option key={type} value={type}>
                {categoryLabels[type]}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="title" className={labelClass}>
              Title
            </label>
            <input id="title" name="title" defaultValue={defaults.title} className={inputClass} />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="description" className={labelClass}>
              Description
            </label>
            <textarea
              id="description"
              name="description"
              rows={5}
              defaultValue={defaults.description}
              placeholder="Add details, links, and anything visitors should know."
              className={inputClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="image" className={labelClass}>
              Image
            </label>
            {currentImageUrl && (
              <div className="relative mt-2 aspect-[16/10] w-full max-w-md overflow-hidden rounded-lg bg-zinc-100">
                <Image
                  src={currentImageUrl}
                  alt="Listing preview"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 448px"
                  unoptimized={Boolean(imagePreview)}
                />
              </div>
            )}
            <input
              id="image"
              name="image"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-2 block w-full cursor-pointer text-sm text-zinc-600 file:mr-3 file:cursor-pointer file:rounded-lg file:border-0 file:bg-zinc-100 file:px-3 file:py-2 file:text-sm file:font-medium file:text-zinc-700 hover:file:bg-zinc-200"
              onChange={(event) => handleImageChange(event.target.files?.[0] ?? null)}
            />
            {imageError && <p className="mt-1 text-sm text-red-600">{imageError}</p>}
            {currentImageUrl && (
              <button
                type="button"
                onClick={() => {
                  setImageFile(null)
                  setRemoveImage(true)
                }}
                className="mt-2 cursor-pointer text-sm font-medium text-red-600 hover:text-red-800"
              >
                Remove image
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-950">Pricing</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="price_type" className={labelClass}>
              Pricing Type
            </label>
            <select
              id="price_type"
              name="price_type"
              value={priceType}
              onChange={(event) => setPriceType(event.target.value as typeof priceType)}
              className={inputClass}
            >
              {priceTypes.map((type) => (
                <option key={type} value={type}>
                  {priceTypeLabels[type]}
                </option>
              ))}
            </select>
          </div>

          {priceType === 'paid' && (
            <>
              <div>
                <label htmlFor="currency" className={labelClass}>
                  Currency
                </label>
                <input
                  id="currency"
                  name="currency"
                  value="PHP"
                  readOnly
                  className={`${inputClass} bg-zinc-50`}
                />
              </div>

              <div>
                <label htmlFor="price_amount" className={labelClass}>
                  Amount
                </label>
                <input
                  id="price_amount"
                  name="price_amount"
                  inputMode="decimal"
                  value={priceAmount}
                  onChange={(event) => setPriceAmount(event.target.value)}
                  placeholder="500"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="price_amount_max" className={labelClass}>
                  Maximum Amount <span className="font-normal text-zinc-400">(optional)</span>
                </label>
                <input
                  id="price_amount_max"
                  name="price_amount_max"
                  inputMode="decimal"
                  value={priceAmountMax}
                  onChange={(event) => setPriceAmountMax(event.target.value)}
                  placeholder="1000"
                  className={inputClass}
                />
              </div>

              <div>
                <label htmlFor="price_unit" className={labelClass}>
                  Price Unit
                </label>
                <select
                  id="price_unit"
                  name="price_unit"
                  value={priceUnit}
                  onChange={(event) => setPriceUnit(event.target.value as typeof priceUnit)}
                  className={inputClass}
                >
                  <option value="">Select unit</option>
                  {priceUnits.map((unit) => (
                    <option key={unit} value={unit}>
                      {priceUnitLabels[unit]}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          <div className="sm:col-span-2">
            <label htmlFor="price_display_override" className={labelClass}>
              Display Label <span className="font-normal text-zinc-400">(optional)</span>
            </label>
            <input
              id="price_display_override"
              name="price_display_override"
              value={priceDisplayOverride}
              onChange={(event) => setPriceDisplayOverride(event.target.value)}
              placeholder="₱500/person, From ₱500, ₱300 Early Bird"
              className={inputClass}
            />
            <p className="mt-2 text-xs text-zinc-500">
              Leave blank to generate automatically from the pricing fields above.
            </p>
          </div>

          {pricePreview && (
            <div className="sm:col-span-2 rounded-lg bg-zinc-50 px-4 py-3 text-sm text-zinc-600">
              Displays as: <span className="font-semibold text-zinc-900">{pricePreview}</span>
            </div>
          )}
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-950">Location</h2>
        <div className="mt-5">
          <label htmlFor="maps_url" className={labelClass}>
            Google Maps Link
          </label>
          <input
            id="maps_url"
            name="maps_url"
            type="url"
            defaultValue={defaults.maps_url}
            placeholder="https://maps.app.goo.gl/..."
            className={inputClass}
          />
          <p className="mt-2 text-xs text-zinc-500">
            Paste a Google Maps share link. Visitors will get a &quot;View on map&quot; button.
          </p>
        </div>
      </div>

      {isAdmin && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-950">Curation</h2>
          <p className="mt-1 text-sm text-zinc-500">Admin-only homepage placement flags.</p>
          <div className="mt-4 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <input
                name="is_top_pick"
                type="checkbox"
                defaultChecked={defaults.is_top_pick}
                className="h-4 w-4 rounded border-zinc-300"
              />
              Top Pick
            </label>
            <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <input
                name="is_featured"
                type="checkbox"
                defaultChecked={defaults.is_featured}
                className="h-4 w-4 rounded border-zinc-300"
              />
              Featured
            </label>
          </div>
        </div>
      )}

      {listingType === 'event' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-950">Event Details</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="event_starts_at" className={labelClass}>
                Starts At
              </label>
              <input
                id="event_starts_at"
                name="event_starts_at"
                type="datetime-local"
                defaultValue={defaults.event.starts_at}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="event_ends_at" className={labelClass}>
                Ends At
              </label>
              <input
                id="event_ends_at"
                name="event_ends_at"
                type="datetime-local"
                defaultValue={defaults.event.ends_at}
                className={inputClass}
              />
            </div>
            <div className="sm:col-span-2">
              <label className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <input
                  name="event_is_recurring"
                  type="checkbox"
                  checked={isRecurring}
                  className="h-4 w-4 rounded border-zinc-300"
                  onChange={(event) => setIsRecurring(event.target.checked)}
                />
                Recurring
              </label>
            </div>
            {isRecurring && (
              <div className="sm:col-span-2">
                <label htmlFor="event_recurrence_frequency" className={labelClass}>
                  Recurrence
                </label>
                <select
                  id="event_recurrence_frequency"
                  name="event_recurrence_frequency"
                  defaultValue={defaults.event.recurrence_frequency}
                  className={inputClass}
                >
                  <option value="">Select frequency</option>
                  {recurrenceFrequencies.map((frequency) => (
                    <option key={frequency} value={frequency}>
                      {recurrenceLabels[frequency]}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        </div>
      )}

      {listingType === 'discount' && (
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <h2 className="text-sm font-semibold text-zinc-950">Discount Details</h2>
          <div className="mt-5 grid gap-4">
            <div>
              <label htmlFor="discount_label" className={labelClass}>
                Discount Label
              </label>
              <input
                id="discount_label"
                name="discount_label"
                defaultValue={defaults.discount.discount_label}
                placeholder="20% off, 2-for-1"
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="discount_valid_from" className={labelClass}>
                Valid From
              </label>
              <input
                id="discount_valid_from"
                name="discount_valid_from"
                type="datetime-local"
                defaultValue={defaults.discount.valid_from}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="discount_valid_until" className={labelClass}>
                Valid To
              </label>
              <input
                id="discount_valid_until"
                name="discount_valid_until"
                type="datetime-local"
                defaultValue={defaults.discount.valid_until}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="discount_terms" className={labelClass}>
                Terms
              </label>
              <textarea
                id="discount_terms"
                name="discount_terms"
                rows={4}
                defaultValue={defaults.discount.terms}
                className={inputClass}
              />
            </div>
          </div>
        </div>
      )}

      {submitError && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {submitError}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-3">
        {mode === 'create' ? (
          <>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Creating...' : 'Create Listing'}
            </button>
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Save as draft
            </button>
          </>
        ) : (
          <>
            <button
              type="submit"
              disabled={isSubmitting}
              className="cursor-pointer rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            {isPublished ? (
              <button
                type="button"
                onClick={handleUnpublish}
                disabled={isSubmitting}
                className="cursor-pointer rounded-lg border border-zinc-300 bg-white px-4 py-2.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Working...' : 'Unpublish'}
              </button>
            ) : (
              <button
                type="button"
                onClick={handlePublish}
                disabled={isSubmitting}
                className="cursor-pointer rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-800 transition-colors hover:bg-emerald-100 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isSubmitting ? 'Working...' : 'Publish'}
              </button>
            )}
          </>
        )}
        <Link
          href={managementBasePath}
          className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
        >
          Cancel
        </Link>
        {mode === 'edit' && (
          <button
            type="button"
            onClick={handleDelete}
            disabled={isSubmitting}
            className="ml-auto cursor-pointer text-sm font-medium text-red-600 hover:text-red-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Delete Listing
          </button>
        )}
      </div>
    </form>
  )
}

type ValuesFromFormOptions = {
  listingType: ListingType
  status: ListingFormValues['status']
  priceType: ListingFormValues['price_type']
  priceAmount: string
  priceAmountMax: string
  priceUnit: ListingFormValues['price_unit']
  priceDisplayOverride: string
  isAdmin: boolean
  listing?: ListingWithDetails
}

function valuesFromForm(
  form: HTMLFormElement,
  options: ValuesFromFormOptions
): ListingFormValues {
  const formData = new FormData(form)
  const value = (name: string) => String(formData.get(name) ?? '')

  return {
    title: value('title'),
    type: options.listingType,
    status: options.status,
    description: value('description'),
    price_type: options.priceType,
    currency: 'PHP',
    price_amount: options.priceAmount,
    price_amount_max: options.priceAmountMax,
    price_unit: options.priceUnit,
    price_display_override: options.priceDisplayOverride,
    maps_url: value('maps_url'),
    is_top_pick: options.isAdmin
      ? formData.has('is_top_pick')
      : (options.listing?.is_top_pick ?? false),
    is_featured: options.isAdmin
      ? formData.has('is_featured')
      : (options.listing?.is_featured ?? false),
    event: {
      starts_at: value('event_starts_at'),
      ends_at: value('event_ends_at'),
      is_recurring: formData.has('event_is_recurring'),
      recurrence_frequency: value('event_recurrence_frequency') as ListingFormValues['event']['recurrence_frequency'],
    },
    discount: {
      discount_label: value('discount_label'),
      valid_from: value('discount_valid_from'),
      valid_until: value('discount_valid_until'),
      terms: value('discount_terms'),
    },
  }
}

async function saveListing(
  supabase: ReturnType<typeof createClient>,
  mode: 'create' | 'edit',
  listing: ListingWithDetails | undefined,
  values: ListingFormValues,
  userId: string
) {
  const payload = formValuesToListingPayload(values, {
    existingPublishedAt: listing?.published_at,
    existingSlug: listing?.slug,
  })

  if (mode === 'create') {
    const { data, error } = await supabase
      .from('listings')
      .insert({ ...payload, user_id: userId })
      .select('id')
      .single()

    if (error) {
      throw new Error(error.message)
    }

    return data.id as string
  }

  if (!listing?.id) {
    throw new Error('Missing listing id.')
  }

  const { error } = await supabase.from('listings').update(payload).eq('id', listing.id)

  if (error) {
    throw new Error(error.message)
  }

  return listing.id
}

async function syncListingImage(
  supabase: ReturnType<typeof createClient>,
  userId: string,
  listingId: string,
  previousImageUrl: string | null | undefined,
  imageFile: File | null,
  removeImage: boolean
) {
  if (imageFile) {
    const validationError = validateListingImage(imageFile)
    if (validationError) {
      throw new Error(validationError)
    }

    const imageUrl = await uploadListingImage(supabase, userId, listingId, imageFile)

    if (previousImageUrl && previousImageUrl !== imageUrl) {
      await deleteListingImage(supabase, previousImageUrl)
    }

    const { error } = await supabase
      .from('listings')
      .update({ image_url: imageUrl })
      .eq('id', listingId)

    if (error) {
      throw new Error(error.message)
    }

    return
  }

  if (removeImage && previousImageUrl) {
    await deleteListingImage(supabase, previousImageUrl)

    const { error } = await supabase
      .from('listings')
      .update({ image_url: null })
      .eq('id', listingId)

    if (error) {
      throw new Error(error.message)
    }
  }
}

async function syncListingDetails(
  supabase: ReturnType<typeof createClient>,
  listingId: string,
  values: ListingFormValues
) {
  const eventPayload = formValuesToEventDetailsPayload(values)
  const discountPayload = formValuesToDiscountDetailsPayload(values)

  if (eventPayload) {
    const { error } = await supabase
      .from('event_details')
      .upsert({ listing_id: listingId, ...eventPayload }, { onConflict: 'listing_id' })

    if (error) throw new Error(error.message)
    await supabase.from('discount_details').delete().eq('listing_id', listingId)
    return
  }

  if (discountPayload) {
    const { error } = await supabase
      .from('discount_details')
      .upsert({ listing_id: listingId, ...discountPayload }, { onConflict: 'listing_id' })

    if (error) throw new Error(error.message)
    await supabase.from('event_details').delete().eq('listing_id', listingId)
    return
  }

  await supabase.from('event_details').delete().eq('listing_id', listingId)
  await supabase.from('discount_details').delete().eq('listing_id', listingId)
}
