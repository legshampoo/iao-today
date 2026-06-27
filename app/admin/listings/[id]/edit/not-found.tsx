import Link from 'next/link'
import { AdminShell } from '@/components/AdminShell'

export default function EditListingNotFound() {
  return (
    <AdminShell title="Listing not found">
      <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center">
        <p className="text-sm text-zinc-500">This listing does not exist.</p>
        <Link
          href="/admin/listings"
          className="mt-6 inline-flex rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white"
        >
          Back to Listings
        </Link>
      </div>
    </AdminShell>
  )
}
