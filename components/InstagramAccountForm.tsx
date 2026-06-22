'use client'

import { useState, type FormEvent } from 'react'

export function InstagramAccountForm() {
  const [username, setUsername] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submittedUsername, setSubmittedUsername] = useState<string | null>(
    null
  )
  const [alreadyExists, setAlreadyExists] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  function resetForm() {
    setSubmittedUsername(null)
    setAlreadyExists(false)
    setError(null)
    setUsername('')
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)

    if (!username.trim()) {
      setError('Please enter an Instagram username.')
      return
    }

    setIsSubmitting(true)

    try {
      const response = await fetch('/api/instagram-accounts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: username.trim() }),
      })

      const data = (await response.json()) as {
        error?: string
        username?: string
        alreadyExists?: boolean
      }

      if (!response.ok) {
        setError(data.error ?? 'Could not submit account. Please try again.')
        return
      }

      setSubmittedUsername(data.username ?? username.trim())
      setAlreadyExists(Boolean(data.alreadyExists))
      setUsername('')
    } catch {
      setError('Could not submit account. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submittedUsername) {
    return (
      <div className="space-y-3">
        <p
          className={
            alreadyExists
              ? 'rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5 text-sm leading-6 text-amber-900'
              : 'rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2.5 text-sm leading-6 text-emerald-900'
          }
        >
          {alreadyExists
            ? `@${submittedUsername} is already in our list — no need to submit again.`
            : `Thanks! We’ll start monitoring @${submittedUsername} for future events.`}
        </p>
        <button
          type="button"
          onClick={resetForm}
          className="text-sm font-medium text-zinc-600 underline transition-colors hover:text-zinc-900"
        >
          Submit another account
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div>
        <label htmlFor="instagram-username" className="sr-only">
          Instagram username
        </label>
        <input
          id="instagram-username"
          type="text"
          placeholder="@username"
          className="w-full rounded-xl border border-zinc-300 px-3 py-2.5 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-500 focus:ring-1 focus:ring-zinc-500"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          disabled={isSubmitting}
          autoComplete="off"
          spellCheck={false}
        />
      </div>

      {error && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="inline-flex w-full items-center justify-center rounded-xl bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-50"
      >
        {isSubmitting ? 'Submitting…' : 'Submit account'}
      </button>
    </form>
  )
}
