import { CategoryChips } from '@/components/CategoryChips'
import { Header } from '@/components/Header'
import { HorizontalSection } from '@/components/HorizontalSection'
import { ListingCard } from '@/components/ListingCard'
import { PageShell } from '@/components/PageShell'
import {
  getHomepageListingSections,
  type ListingSection,
  type ListingSectionKey,
} from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'

const FEATURED_SECTIONS = new Set<ListingSectionKey>(['top-picks'])
const COMPACT_SECTIONS = new Set<ListingSectionKey>(['recently-added'])

export default async function Home() {
  const supabase = await createClient()

  let sections: ListingSection[] = []
  let error: string | null = null

  try {
    sections = await getHomepageListingSections(supabase)
  } catch {
    error = 'Could not load listings. Check your Supabase connection.'
  }

  return (
    <>
      <Header />
      <PageShell>
        <div className="mb-6 space-y-5">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
              Siargao discovery guide
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
              What should I do today?
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-zinc-500">
              Fresh picks for events, deals, tours, restaurants, wellness, and
              places to stay around the island.
            </p>
          </div>
          <CategoryChips />
        </div>

        {error ? (
          <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : sections.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
            <h2 className="text-lg font-semibold tracking-tight text-zinc-950">
              Listings are coming soon
            </h2>
            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
              The new discovery guide is ready for manually curated listings.
              Publish the first few in admin and they&apos;ll appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-8">
            {sections.map((section) => (
              <HorizontalSection
                key={section.key}
                id={section.key}
                title={section.title}
                subtitle={section.subtitle}
                href={section.href}
              >
                {section.listings.map((listing) => {
                  const variant = FEATURED_SECTIONS.has(section.key)
                    ? 'featured'
                    : COMPACT_SECTIONS.has(section.key)
                      ? 'compact'
                      : 'standard'
                  const widthClass = FEATURED_SECTIONS.has(section.key)
                    ? 'w-[78vw] max-w-[340px] sm:w-[320px]'
                    : COMPACT_SECTIONS.has(section.key)
                      ? 'w-[58vw] max-w-[230px] sm:w-[220px]'
                      : 'w-[68vw] max-w-[280px] sm:w-[260px]'

                  return (
                    <div key={listing.id} className={`shrink-0 snap-start ${widthClass}`}>
                      <ListingCard listing={listing} variant={variant} />
                    </div>
                  )
                })}
              </HorizontalSection>
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}
