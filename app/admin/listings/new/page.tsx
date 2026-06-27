import { AdminShell } from '@/components/AdminShell'
import { ListingForm } from '@/components/ListingForm'

export default async function NewListingPage() {
  return (
    <AdminShell
      title="New Listing"
      subtitle="Manually add a curated listing to the discovery guide."
    >
      <ListingForm mode="create" isAdmin />
    </AdminShell>
  )
}
