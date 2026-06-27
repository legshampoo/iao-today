import Link from 'next/link'
import { Header } from '@/components/Header'
import { ListingCard } from '@/components/ListingCard'
import { getUserListings } from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'
import type { ListingWithDetails } from '@/lib/types/listing'

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  let listings: ListingWithDetails[] = []
  let error: string | null = null

  try {
    listings = await getUserListings(supabase, user!.id)
  } catch {
    error = 'Could not load your listings.'
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">My Listings</h1>
            <p className="mt-1 text-sm text-zinc-500">Signed in as {user?.email}</p>
          </div>
          <Link
            href="/dashboard/listings/new"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Create listing
          </Link>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        )}

        {!error && listings.length === 0 && (
          <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500">
            You haven&apos;t created any listings yet.
          </p>
        )}

        {!error && listings.length > 0 && (
          <div className="mt-8 grid grid-cols-1 gap-4 lg:grid-cols-3">
            {listings.map((listing) => (
              <ListingCard
                key={listing.id}
                listing={listing}
                href={`/dashboard/listings/${listing.id}/edit`}
                status={listing.status}
              />
            ))}
          </div>
        )}
      </main>
    </>
  )
}
