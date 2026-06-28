import Link from 'next/link'
import { AdminShell } from '@/components/AdminShell'
import { createClient } from '@/lib/supabase/server'

export default async function AdminPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const [{ count: listingCount }, { count: categoryCount }] = await Promise.all([
    supabase.from('listings').select('*', { count: 'exact', head: true }),
    supabase.from('listing_categories').select('*', { count: 'exact', head: true }),
  ])

  return (
    <AdminShell
      title="Admin"
      subtitle={user?.email ? `Signed in as ${user.email}` : 'Manage Love Siargao listings'}
      action={
        <Link
          href="/admin/listings/new"
          className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          New Listing
        </Link>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-500">Listings</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            {listingCount ?? 0}
          </p>
          <Link
            href="/admin/listings"
            className="mt-4 inline-flex text-sm font-medium text-zinc-700 hover:text-zinc-950"
          >
            Manage listings
          </Link>
        </div>
        <div className="rounded-2xl border border-zinc-200 bg-white p-5">
          <p className="text-sm font-medium text-zinc-500">Categories</p>
          <p className="mt-2 text-3xl font-bold tracking-tight text-zinc-950">
            {categoryCount ?? 0}
          </p>
          <Link
            href="/admin/categories"
            className="mt-4 inline-flex text-sm font-medium text-zinc-700 hover:text-zinc-950"
          >
            Manage categories
          </Link>
        </div>
      </div>
    </AdminShell>
  )
}
