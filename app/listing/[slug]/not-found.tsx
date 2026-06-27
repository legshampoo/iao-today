import Link from 'next/link'
import { Header } from '@/components/Header'
import { PageShell } from '@/components/PageShell'

export default function ListingNotFound() {
  return (
    <>
      <Header />
      <PageShell>
        <div className="rounded-2xl border border-zinc-200 bg-white px-6 py-12 text-center">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-950">
            Listing not found
          </h1>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-zinc-500">
            This listing may have been removed, archived, or is not published yet.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-xl bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Back to Discover
          </Link>
        </div>
      </PageShell>
    </>
  )
}
