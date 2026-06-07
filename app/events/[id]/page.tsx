import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Header } from '@/components/Header'
import { formatEventDate, formatEventPrice } from '@/lib/format'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/types/event'

type EventPageProps = {
  params: Promise<{ id: string }>
}

export default async function EventPage({ params }: EventPageProps) {
  const { id } = await params
  const supabase = await createClient()

  const { data: event, error } = await supabase
    .from('events')
    .select('*')
    .eq('id', id)
    .single()

  if (error || !event) {
    notFound()
  }

  const typedEvent = event as Event

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <Link
          href="/"
          className="mb-6 inline-block text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
        >
          ← All events
        </Link>

        <article>
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h1 className="text-3xl font-semibold tracking-tight text-zinc-900">
              {typedEvent.title}
            </h1>
            <span className="rounded-full bg-zinc-100 px-3 py-1 text-sm font-medium text-zinc-700">
              {formatEventPrice(typedEvent.is_free, typedEvent.price_php)}
            </span>
          </div>

          <dl className="mt-6 space-y-3 text-sm">
            <div>
              <dt className="font-medium text-zinc-500">When</dt>
              <dd className="mt-0.5 text-zinc-900">
                {formatEventDate(typedEvent.starts_at)}
                {typedEvent.ends_at && (
                  <span className="text-zinc-600">
                    {' '}
                    – {formatEventDate(typedEvent.ends_at)}
                  </span>
                )}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-zinc-500">Where</dt>
              <dd className="mt-0.5 text-zinc-900">{typedEvent.location}</dd>
            </div>
          </dl>

          <div className="mt-8 border-t border-zinc-200 pt-8">
            <h2 className="text-sm font-medium text-zinc-500">About</h2>
            <p className="mt-2 whitespace-pre-wrap text-zinc-800">
              {typedEvent.description}
            </p>
          </div>
        </article>
      </main>
    </>
  )
}
