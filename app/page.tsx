import { EventCard } from '@/components/EventCard'
import { Header } from '@/components/Header'
import { PageShell } from '@/components/PageShell'
import { groupEventsByDay } from '@/lib/events/group-by-day'
import { isUpcomingEvent, startOfTodayManilaIso } from '@/lib/events/upcoming'
import { dateKeyInManila } from '@/lib/format'
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
    .gte('starts_at', startOfTodayManilaIso())
    .order('starts_at', { ascending: true })

  const upcoming = ((events ?? []) as Event[]).filter((event) =>
    isUpcomingEvent(event)
  )
  const dayGroups = groupEventsByDay(upcoming)
  const todayKey = dateKeyInManila(new Date())

  return (
    <>
      <Header />
      <PageShell>
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

        {!error && (
          <div className="flex flex-col gap-8">
            {dayGroups.map((group) => (
              <section key={group.dateKey}>
                <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
                  {group.label}
                </h2>
                {group.events.length === 0 && group.dateKey === todayKey ? (
                  <p className="mt-3 text-sm text-zinc-500">No events today</p>
                ) : (
                  <ul className="mt-3 flex flex-col gap-3">
                    {group.events.map((event) => (
                      <li key={event.id}>
                        <EventCard
                          event={event}
                          isOwner={user?.id === event.user_id}
                          groupedByDay
                        />
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            ))}
          </div>
        )}
      </PageShell>
    </>
  )
}
