import { ContactForm } from '@/components/ContactForm'
import { Header } from '@/components/Header'

export default function ContactPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Contact</h1>
        <p className="mt-2 text-sm text-zinc-600">
          Questions, feedback, or help with your event? Send us a message.
        </p>
        <div className="mt-8">
          <ContactForm />
        </div>
      </main>
    </>
  )
}
