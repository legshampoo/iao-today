import Link from 'next/link'
import { Header } from '@/components/Header'

export default function EditEventNotFound() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16 text-center">
        <h1 className="text-2xl font-semibold text-zinc-900">Event not found</h1>
        <p className="mt-2 text-sm text-zinc-500">
          This event doesn&apos;t exist or you don&apos;t have permission to edit it.
        </p>
        <Link
          href="/dashboard"
          className="mt-6 inline-block text-sm font-medium text-zinc-700 underline hover:text-zinc-900"
        >
          Back to dashboard
        </Link>
      </main>
    </>
  )
}
