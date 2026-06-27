import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { ListingForm } from '@/components/ListingForm'
import { getAdminListingById } from '@/lib/listings/queries'
import { createClient } from '@/lib/supabase/server'

type EditDashboardListingPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditDashboardListingPage({
  params,
}: EditDashboardListingPageProps) {
  const { id } = await params
  const supabase = await createClient()
  const listing = await getAdminListingById(supabase, id)

  if (!listing) {
    notFound()
  }

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit listing</h1>
        <p className="mt-1 text-sm text-zinc-500">{listing.title}</p>
        <div className="mt-8">
          <ListingForm mode="edit" listing={listing} managementBasePath="/dashboard" />
        </div>
      </main>
    </>
  )
}
