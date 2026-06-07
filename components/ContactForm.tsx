'use client'

import { useState, type FormEvent } from 'react'

const CONTACT_EMAIL = 'hello@siargaotoday.com'

export function ContactForm() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitted, setSubmitted] = useState(false)

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError('Please fill in all fields.')
      return
    }

    const subject = encodeURIComponent(`Contact from ${name.trim()}`)
    const body = encodeURIComponent(
      `${message.trim()}\n\n— ${name.trim()} (${email.trim()})`
    )

    window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`
    setSubmitted(true)
  }

  const inputClass =
    'mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm text-zinc-900 outline-none focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500'
  const labelClass = 'block text-sm font-medium text-zinc-700'

  if (submitted) {
    return (
      <p className="rounded-xl border border-zinc-200 bg-zinc-50 px-6 py-8 text-sm text-zinc-600">
        Thanks for reaching out. Your email app should open so you can send your
        message. If it didn&apos;t, write to{' '}
        <a href={`mailto:${CONTACT_EMAIL}`} className="font-medium text-zinc-900 underline">
          {CONTACT_EMAIL}
        </a>
        .
      </p>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          type="text"
          className={inputClass}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          type="email"
          className={inputClass}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </div>

      <div>
        <label htmlFor="message" className={labelClass}>
          Message
        </label>
        <textarea
          id="message"
          rows={5}
          className={inputClass}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        className="rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
      >
        Send message
      </button>
    </form>
  )
}
