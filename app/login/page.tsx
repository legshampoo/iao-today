import Link from 'next/link'
import { Header } from '@/components/Header'
import { LoginForm } from '@/components/LoginForm'
import { LogoutButton } from '@/components/LogoutButton'
import { createClient } from '@/lib/supabase/server'

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  const params = await searchParams

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        {user ? (
          <div className="mx-auto w-full max-w-sm text-center">
            <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
              Already signed in
            </h1>
            <p className="mt-2 text-sm text-zinc-500">
              You&apos;re logged in as{' '}
              <span className="font-medium text-zinc-700">{user.email}</span>
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <Link
                href="/dashboard"
                className="w-full rounded-lg bg-zinc-900 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                Go to dashboard
              </Link>
              <LogoutButton />
            </div>
          </div>
        ) : (
          <LoginForm authError={params.error === 'auth'} />
        )}
      </main>
    </>
  )
}
