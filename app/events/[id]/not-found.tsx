import Link from 'next/link'
import { Header } from '@/components/Header'

export default function EventNotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Event not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This event may have ended or doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="mt-6 inline-block text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
        >
          Back to all events
        </Link>
      </main>
    </>
  )
}
