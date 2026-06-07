import { Header } from '@/components/Header'

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Privacy Policy
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: June 7, 2026</p>

        <div className="mt-8 space-y-6 text-sm leading-7 text-zinc-700">
          <section>
            <h2 className="text-base font-semibold text-zinc-900">1. Overview</h2>
            <p>
              Siargao Events respects your privacy. This policy describes what information
              we collect, how we use it, and your choices.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">2. Information we collect</h2>
            <p>
              When you create an account, we collect your email address through our
              authentication provider. When you post events, we store the information you
              submit (title, description, location, dates, pricing, and images). We may
              collect basic usage data such as pages visited and device type through
              standard server and analytics logs.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">3. How we use information</h2>
            <p>
              We use your information to operate the platform, display event listings,
              authenticate users, and respond to support requests. We do not sell your
              personal information to third parties.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">4. Third-party services</h2>
            <p>
              We use Supabase for authentication, database, and file storage, and may
              use hosting providers such as Vercel to run the site. These services process
              data according to their own privacy policies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">5. Cookies</h2>
            <p>
              We use essential cookies and similar technologies to keep you signed in and
              to maintain session security. We do not use advertising cookies.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">6. Data retention</h2>
            <p>
              We retain account and event data while your account is active or as needed
              to operate the service. You may request deletion of your account and
              associated events by contacting us.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">7. Your rights</h2>
            <p>
              You may access, correct, or delete your personal information by contacting
              us or through your account settings where available.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">8. Contact</h2>
            <p>
              For privacy-related questions, please use our{' '}
              <a href="/contact" className="font-medium text-zinc-900 underline">
                contact page
              </a>
              .
            </p>
          </section>
        </div>
      </main>
    </>
  )
}
