'use client'

import type { EmailOtpType } from '@supabase/supabase-js'
import { useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

function getSafeNext(next: string | null) {
  if (!next || !next.startsWith('/')) {
    return '/'
  }

  return next
}

function getTokensFromHash() {
  if (typeof window === 'undefined' || !window.location.hash) {
    return null
  }

  const params = new URLSearchParams(window.location.hash.slice(1))
  const access_token = params.get('access_token')
  const refresh_token = params.get('refresh_token')

  if (!access_token || !refresh_token) {
    return null
  }

  return { access_token, refresh_token }
}

export function AuthCallbackClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [message, setMessage] = useState('Signing you in...')

  useEffect(() => {
    let cancelled = false

    async function completeSignIn() {
      const supabase = createClient()
      const next = getSafeNext(searchParams.get('next'))

      const code = searchParams.get('code')

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code)

        if (!cancelled && !error) {
          router.replace(next)
          router.refresh()
          return
        }
      }

      const token_hash = searchParams.get('token_hash')
      const type = searchParams.get('type')

      if (token_hash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash,
          type: type as EmailOtpType,
        })

        if (!cancelled && !error) {
          router.replace(next)
          router.refresh()
          return
        }
      }

      const tokens = getTokensFromHash()

      if (tokens) {
        const { error } = await supabase.auth.setSession(tokens)

        if (!cancelled && !error) {
          router.replace(next)
          router.refresh()
          return
        }
      }

      if (!cancelled) {
        setMessage('Could not sign you in. Redirecting to login...')
        router.replace('/login?error=auth')
      }
    }

    void completeSignIn()

    return () => {
      cancelled = true
    }
  }, [router, searchParams])

  return (
    <div className="mx-auto flex min-h-[40vh] max-w-sm items-center justify-center px-4">
      <p className="text-sm text-zinc-600">{message}</p>
    </div>
  )
}
