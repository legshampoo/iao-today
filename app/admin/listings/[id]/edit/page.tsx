import { notFound } from 'next/navigation'
import { AdminShell } from '@/components/AdminShell'
import { ListingForm } from '@/components/ListingForm'
import { getAdminListingById } from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'

type EditListingPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditListingPage({ params }: EditListingPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const listing = await getAdminListingById(supabase, id)

  if (!listing) {
    notFound()
  }

  return (
    <AdminShell title="Edit Listing" subtitle={listing.title}>
      <ListingForm mode="edit" listing={listing} isAdmin />
    </AdminShell>
  )
}
