import { CategoryChips } from '@/components/CategoryChips'
import { Header } from '@/components/Header'
import { ListingGrid } from '@/components/ListingGrid'
import { PageShell } from '@/components/PageShell'
import { getPublishedListingsByType } from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'
import type { ListingType, ListingWithDetails } from '@/lib/types/listing'

type ListingIndexPageProps = {
  type: ListingType
  activeSlug: string
  title: string
  subtitle: string
  emptyMessage: string
}

export async function ListingIndexPage({
  type,
  activeSlug,
  title,
  subtitle,
  emptyMessage,
}: ListingIndexPageProps) {
  const supabase = await createClient()
  let listings: ListingWithDetails[] = []
  let error: string | null = null

  try {
    listings = await getPublishedListingsByType(supabase, type, { limit: 60 })
  } catch {
    error = 'Could not load listings. Check your Supabase connection.'
  }

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-6 space-y-5">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">
              {title}
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              {subtitle}
            </p>
          </div>
          <CategoryChips activeSlug={activeSlug} />
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <p className="text-sm leading-6 text-zinc-500">{emptyMessage}</p>
          </div>
        ) : (
          <ListingGrid listings={listings} />
        )}
      </PageShell>
    </>
  )
}
