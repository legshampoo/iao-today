import { Header } from '@/components/Header'
import { ResetPasswordForm } from '@/components/ResetPasswordForm'
import { createClient } from '@/lib/supabase/server'

export default async function ResetPasswordPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <ResetPasswordForm hasSession={Boolean(user)} />
      </main>
    </>
  )
}
