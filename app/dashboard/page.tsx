import Link from 'next/link'
import { DashboardEventRow } from '@/components/DashboardEventRow'
import { Header } from '@/components/Header'
import { categorizeEvents } from '@/lib/events/categorize'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/types/event'

function EventSection({
  title,
  events,
  expired = false,
}: {
  title: string
  events: Event[]
  expired?: boolean
}) {
  if (events.length === 0) return null

  return (
    <section className="mt-8">
      <h2 className="border-b border-zinc-200 pb-2 text-sm font-medium text-zinc-500">
        {title}
      </h2>
      <ul className="mt-3 flex flex-col gap-3">
        {events.map((event) => (
          <li key={event.id}>
            <DashboardEventRow event={event} expired={expired} />
          </li>
        ))}
      </ul>
    </section>
  )
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .eq('user_id', user!.id)
    .order('starts_at', { ascending: true })

  const allEvents = (events ?? []) as Event[]
  const { today, upcoming, past } = categorizeEvents(allEvents)

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">My Events</h1>
            <p className="mt-1 text-sm text-zinc-500">Signed in as {user?.email}</p>
          </div>
          <Link
            href="/dashboard/events/new"
            className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
          >
            Create event
          </Link>
        </div>

        {error && (
          <p className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load your events.
          </p>
        )}

        {!error && allEvents.length === 0 && (
          <p className="mt-8 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500">
            You haven&apos;t created any events yet.
          </p>
        )}

        {!error && allEvents.length > 0 && (
          <>
            <EventSection title="Today" events={today} />
            <EventSection title="Upcoming" events={upcoming} />
            <EventSection title="Past Events" events={past} expired />
          </>
        )}
      </main>
    </>
  )
}
