import Link from 'next/link'
import { EventForm } from '@/components/EventForm'
import { Header } from '@/components/Header'

export default function NewEventPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/dashboard"
          className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
        >
          <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            className="h-4 w-4"
          >
            <path d="M15 6l-6 6 6 6" />
          </svg>
          Back
        </Link>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Create event</h1>
        <p className="mt-1 text-sm text-zinc-500">
          New events appear on the homepage immediately.
        </p>
        <div className="mt-8">
          <EventForm mode="create" />
        </div>
      </main>
    </>
  )
}
