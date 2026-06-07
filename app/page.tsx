import { EventCard } from '@/components/EventCard'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/types/event'

export default async function Home() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: events, error } = await supabase
    .from('events')
    .select('*')
    .gte('starts_at', new Date().toISOString())
    .order('starts_at', { ascending: true })

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
            Upcoming Events
          </h1>
          <p className="mt-1 text-sm text-zinc-500">
            What&apos;s happening in Siargao
          </p>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            Could not load events. Check your Supabase connection.
          </p>
        )}

        {!error && (!events || events.length === 0) && (
          <p className="rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-6 py-12 text-center text-sm text-zinc-500">
            No upcoming events yet. Check back soon.
          </p>
        )}

        {!error && events && events.length > 0 && (
          <ul className="flex flex-col gap-4">
            {(events as Event[]).map((event) => (
              <li key={event.id}>
                <EventCard event={event} isOwner={user?.id === event.user_id} />
              </li>
            ))}
          </ul>
        )}
      </main>
    </>
  )
}
