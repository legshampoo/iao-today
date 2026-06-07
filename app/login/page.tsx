import { redirect } from 'next/navigation'
import { Header } from '@/components/Header'
import { LoginForm } from '@/components/LoginForm'
import { createClient } from '@/lib/supabase/server'

type LoginPageProps = {
  searchParams: Promise<{ error?: string }>
}

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  const params = await searchParams

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <LoginForm authError={params.error === 'auth'} />
      </main>
    </>
  )
}
