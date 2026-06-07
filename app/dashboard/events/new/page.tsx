import { EventForm } from '@/components/EventForm'
import { Header } from '@/components/Header'

export default function NewEventPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
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
