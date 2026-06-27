import { Header } from '@/components/Header'
import { SignupForm } from '@/components/SignupForm'

export default function SignupPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-16">
        <SignupForm />
      </main>
    </>
  )
}
