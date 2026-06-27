import { ForgotPasswordForm } from '@/components/ForgotPasswordForm'
import { Header } from '@/components/Header'

export default function ForgotPasswordPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <ForgotPasswordForm />
      </main>
    </>
  )
}
