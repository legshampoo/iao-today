'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { slugifyListingTitle } from '@/lib/listings/format'
import { createClient } from '@/lib/supabase/client'
import type { ListingCategory } from '@/lib/types/listing'

type CategoryManagerProps = {
  initialCategories: ListingCategory[]
}

export function CategoryManager({ initialCategories }: CategoryManagerProps) {
  const router = useRouter()
  const [categories, setCategories] = useState(initialCategories)
  const [name, setName] = useState('')
  const [slug, setSlug] = useState('')
  const [icon, setIcon] = useState('')
  const [message, setMessage] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  async function handleCreate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setMessage(null)
    setIsSaving(true)

    const categoryName = name.trim()
    const categorySlug = slugifyListingTitle(slug || name)

    if (!categoryName || !categorySlug) {
      setMessage('Name and slug are required.')
      setIsSaving(false)
      return
    }

    const supabase = createClient()
    const { data, error } = await supabase
      .from('listing_categories')
      .insert({
        name: categoryName,
        slug: categorySlug,
        icon: icon.trim() || null,
      })
      .select('*')
      .single()

    if (error) {
      setMessage(error.message)
      setIsSaving(false)
      return
    }

    setCategories((current) => [...current, data as ListingCategory])
    setName('')
    setSlug('')
    setIcon('')
    setIsSaving(false)
    router.refresh()
  }

  async function handleUpdate(category: ListingCategory) {
    setMessage(null)
    const categorySlug = slugifyListingTitle(category.slug || category.name)

    if (!category.name.trim() || !categorySlug) {
      setMessage('Name and slug are required.')
      return
    }

    const supabase = createClient()
    const { error } = await supabase
      .from('listing_categories')
      .update({
        name: category.name.trim(),
        slug: categorySlug,
        icon: category.icon?.trim() || null,
      })
      .eq('id', category.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setCategories((current) =>
      current.map((item) =>
        item.id === category.id ? { ...category, slug: categorySlug } : item
      )
    )
    setMessage('Category saved.')
    router.refresh()
  }

  async function handleDelete(category: ListingCategory) {
    if (!window.confirm(`Delete ${category.name}? This will remove its listing links.`)) {
      return
    }

    setMessage(null)
    const supabase = createClient()
    const { error } = await supabase.from('listing_categories').delete().eq('id', category.id)

    if (error) {
      setMessage(error.message)
      return
    }

    setCategories((current) => current.filter((item) => item.id !== category.id))
    router.refresh()
  }

  const inputClass =
    'w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'

  return (
    <div className="space-y-6">
      <form onSubmit={handleCreate} className="rounded-2xl border border-zinc-200 bg-white p-5">
        <h2 className="text-sm font-semibold text-zinc-950">Add Category</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-3">
          <input
            value={name}
            onChange={(event) => {
              setName(event.target.value)
              if (!slug) setSlug(slugifyListingTitle(event.target.value))
            }}
            placeholder="Name"
            className={inputClass}
          />
          <input
            value={slug}
            onChange={(event) => setSlug(event.target.value)}
            placeholder="slug"
            className={inputClass}
          />
          <input
            value={icon}
            onChange={(event) => setIcon(event.target.value)}
            placeholder="icon"
            className={inputClass}
          />
        </div>
        <button
          type="submit"
          disabled={isSaving}
          className="mt-4 rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
        >
          {isSaving ? 'Adding...' : 'Add Category'}
        </button>
      </form>

      {message && (
        <p className="rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm text-zinc-600">
          {message}
        </p>
      )}

      <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
        <ul className="divide-y divide-zinc-200">
          {categories.map((category) => (
            <li key={category.id} className="grid gap-3 p-4 lg:grid-cols-[1fr_1fr_1fr_auto]">
              <input
                value={category.name}
                onChange={(event) =>
                  setCategories((current) =>
                    current.map((item) =>
                      item.id === category.id ? { ...item, name: event.target.value } : item
                    )
                  )
                }
                className={inputClass}
                aria-label={`${category.name} name`}
              />
              <input
                value={category.slug}
                onChange={(event) =>
                  setCategories((current) =>
                    current.map((item) =>
                      item.id === category.id ? { ...item, slug: event.target.value } : item
                    )
                  )
                }
                className={inputClass}
                aria-label={`${category.name} slug`}
              />
              <input
                value={category.icon ?? ''}
                onChange={(event) =>
                  setCategories((current) =>
                    current.map((item) =>
                      item.id === category.id ? { ...item, icon: event.target.value } : item
                    )
                  )
                }
                className={inputClass}
                aria-label={`${category.name} icon`}
              />
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => handleUpdate(category)}
                  className="text-sm font-medium text-zinc-700 underline hover:text-zinc-950"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(category)}
                  className="text-sm font-medium text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
