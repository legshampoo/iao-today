'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

function getTokensFromHash() {
  if (typeof window === 'undefined' || !window.location.hash.includes('access_token=')) {
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

export function AuthHashHandler() {
  const router = useRouter()

  useEffect(() => {
    if (window.location.pathname.startsWith('/auth/callback')) {
      return
    }

    const tokens = getTokensFromHash()

    if (!tokens) {
      return
    }

    const supabase = createClient()

    void supabase.auth.setSession(tokens).then(({ error }) => {
      if (error) {
        console.error('Auth hash session error:', error)
        return
      }

      const next = new URLSearchParams(window.location.search).get('next')
      const destination =
        next && next.startsWith('/') ? next : '/dashboard'

      router.replace(destination)
      router.refresh()
    })
  }, [router])

  return null
}
