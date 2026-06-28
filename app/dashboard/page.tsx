import Link from 'next/link'
import { DashboardListings } from '@/components/DashboardListings'
import { Header } from '@/components/Header'
import { PageShell } from '@/components/PageShell'
import { getUserListings } from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'
import type { ListingWithDetails } from '@/lib/types/listing'
import { buttonClasses } from '@/lib/ui/button'

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
      <PageShell>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-950">My Listings</h1>
            <p className="mt-1 text-sm text-zinc-500">Manage your submissions</p>
          </div>
          <Link
            href="/dashboard/listings/new"
            className={buttonClasses({ shape: 'pill', className: 'px-5' })}
          >
            <span className="text-base leading-none">+</span>
            Create
          </Link>
        </div>

        {error ? (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </p>
        ) : (
          <div className="mt-6">
            <DashboardListings listings={listings} />
          </div>
        )}
      </PageShell>
    </>
  )
}
