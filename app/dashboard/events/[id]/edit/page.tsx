import { notFound } from 'next/navigation'
import { EventForm } from '@/components/EventForm'
import { Header } from '@/components/Header'
import { createClient } from '@/lib/supabase/server'
import type { Event } from '@/lib/types/event'

type EditEventPageProps = {
  params: Promise<{ id: string }>
}

export default async function EditEventPage({ params }: EditEventPageProps) {
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

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Edit event</h1>
        <div className="mt-8">
          <EventForm mode="edit" event={event as Event} />
        </div>
      </main>
    </>
  )
}
