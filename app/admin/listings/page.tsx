import Link from 'next/link'
import { AdminShell } from '@/components/AdminShell'
import { listingTypeLabel } from '@/lib/listings/format'
import { createClient } from '@/lib/supabase/server'
import type { Listing } from '@/lib/types/listing'
import { buttonClasses } from '@/lib/ui/button'

export default async function AdminListingsPage() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from('listings')
    .select('*')
    .order('created_at', { ascending: false })

  const listings = (data ?? []) as Listing[]

  return (
    <AdminShell
      title="Listings"
      subtitle="Create, edit, publish, and archive everything shown on Siargao Now."
      action={
        <Link href="/admin/listings/new" className={buttonClasses()}>
          New Listing
        </Link>
      }
    >
      {error ? (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          Could not load listings.
        </p>
      ) : listings.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-zinc-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-zinc-500">No listings yet.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          <ul className="divide-y divide-zinc-200">
            {listings.map((listing) => (
              <li key={listing.id} className="flex flex-wrap items-center justify-between gap-4 p-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="font-semibold tracking-tight text-zinc-950">
                      {listing.title}
                    </h2>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {listingTypeLabel(listing.type)}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2 py-0.5 text-xs font-medium text-zinc-600">
                      {listing.status}
                    </span>
                  </div>
                  <p className="mt-1 truncate text-sm text-zinc-500">/{listing.slug}</p>
                </div>
                <div className="flex items-center gap-3">
                  {listing.status === 'published' && (
                    <Link
                      href={`/listing/${listing.slug}`}
                      className="text-sm font-medium text-zinc-600 hover:text-zinc-950"
                    >
                      View
                    </Link>
                  )}
                  <Link
                    href={`/admin/listings/${listing.id}/edit`}
                    className="text-sm font-medium text-zinc-700 underline hover:text-zinc-950"
                  >
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </AdminShell>
  )
}
