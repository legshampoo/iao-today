import { Header } from '@/components/Header'
import { ListingForm } from '@/components/ListingForm'

export default async function NewDashboardListingPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create listing</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Add a listing to your account. Published listings appear publicly.
        </p>
        <div className="mt-8">
          <ListingForm mode="create" managementBasePath="/dashboard" />
        </div>
      </main>
    </>
  )
}
