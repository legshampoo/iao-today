import { Suspense } from 'react'
import { AuthCallbackClient } from '@/components/AuthCallbackClient'

export default function AuthCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto flex min-h-[40vh] max-w-sm items-center justify-center px-4">
          <p className="text-sm text-zinc-600">Signing you in...</p>
        </div>
      }
    >
      <AuthCallbackClient />
    </Suspense>
  )
}
