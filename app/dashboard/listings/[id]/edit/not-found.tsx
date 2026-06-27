import Link from 'next/link'
import { Header } from '@/components/Header'

export default function EditDashboardListingNotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Listing not found
        </h1>
        <p className="mt-2 text-sm text-zinc-500">
          This listing does not exist or does not belong to your account.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-flex rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white"
        >
          Back to Dashboard
        </Link>
      </main>
    </>
  )
}
