import Link from 'next/link'
import { notFound } from 'next/navigation'
import { EventDetailInfoRow, eventDetailIcons } from '@/components/EventDetailInfoRow'
import { EventImage } from '@/components/EventImage'
import { Header } from '@/components/Header'
import { PageShell } from '@/components/PageShell'
import { formatEventDetailDateTime, formatEventPrice } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/types/event'

type EventPageProps = {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  const typedEvent = event as Event
  const isOwner = user?.id === typedEvent.user_id
  const priceLabel = formatEventPrice(typedEvent.is_free, typedEvent.price_php)

  return (
    <>
      <Header />
      <PageShell>
        <article className="overflow-hidden rounded-2xl border border-zinc-200 bg-white">
          {typedEvent.image_url && (
            <div className="relative aspect-[16/9] w-full bg-zinc-100">
              <EventImage
                src={typedEvent.image_url}
                alt={typedEvent.title}
                sizes="(max-width: 1024px) 100vw, 672px"
                priority
              />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
                <Link
                  href="/"
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-white/95 text-zinc-700 shadow-sm transition-colors hover:bg-white"
                  aria-label="Back to all events"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    className="h-5 w-5"
                  >
                    <path d="M15 6l-6 6 6 6" />
                  </svg>
                </Link>
                {isOwner && (
                  <Link
                    href={`/dashboard/events/${typedEvent.id}/edit`}
                    className="rounded-full bg-white/95 px-4 py-2 text-sm font-medium text-zinc-700 shadow-sm transition-colors hover:bg-white"
                  >
                    Edit
                  </Link>
                )}
              </div>
            </div>
          )}

          <div className="px-5 py-6 sm:px-6">
            {!typedEvent.image_url && (
              <div className="mb-4 flex items-center justify-between gap-3">
                <Link
                  href="/"
                  className="text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                >
                  ← All events
                </Link>
                {isOwner && (
                  <Link
                    href={`/dashboard/events/${typedEvent.id}/edit`}
                    className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-400 hover:bg-zinc-50"
                  >
                    Edit
                  </Link>
                )}
              </div>
            )}

            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 sm:text-3xl">
              {typedEvent.title}
            </h1>

            <div className="mt-6 divide-y divide-zinc-200 border-y border-zinc-200">
              <EventDetailInfoRow
                icon={eventDetailIcons.calendar}
                primary={formatEventDetailDateTime(
                  typedEvent.starts_at,
                  typedEvent.ends_at
                )}
              />
              <EventDetailInfoRow
                icon={eventDetailIcons.pin}
                primary={typedEvent.location}
              />
              <EventDetailInfoRow
                icon={eventDetailIcons.ticket}
                primary={priceLabel}
                secondary={typedEvent.is_free ? 'Free event' : undefined}
              />
            </div>

            <div className="mt-8">
              <p className="whitespace-pre-wrap text-base leading-7 text-zinc-700">
                {typedEvent.description}
              </p>
            </div>
          </div>
        </article>
      </PageShell>
    </>
  )
}
