import { Header } from '@/components/Header'

export default function AboutPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">About</h1>
        <div className="mt-6 space-y-4 text-sm leading-7 text-zinc-700">
          <p>
            Siargao Events is a community board for locals, businesses, and organizers
            on the island to share what&apos;s happening — yoga sessions, markets,
            live music, workshops, and everything in between.
          </p>
          <p>
            We built this for Siargao people promoting their own events: simple to
            post, easy to discover, and focused on what&apos;s coming up on the island.
          </p>
          <p>
            Whether you run a surf camp, a café, a retreat space, or just want to
            spread the word about a gathering, this is your place to reach the
            community.
          </p>
        </div>
      </main>
    </>
  )
}
