import { Header } from '@/components/Header'

export default function TermsPage() {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">
          Terms of Use
        </h1>
        <p className="mt-2 text-sm text-zinc-500">Last updated: June 7, 2026</p>

        <div className="prose-zinc mt-8 space-y-6 text-sm leading-7 text-zinc-700">
          <section>
            <h2 className="text-base font-semibold text-zinc-900">1. Acceptance</h2>
            <p>
              By using Siargao Events, you agree to these Terms of Use. If you do not
              agree, please do not use the site.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">2. Use of the service</h2>
            <p>
              Siargao Events provides a platform for listing and discovering events in
              Siargao. You may browse events without an account. To create or manage
              events, you must register and keep your account secure.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">3. Event listings</h2>
            <p>
              You are responsible for the accuracy of any event you post, including
              dates, location, pricing, and descriptions. Do not post misleading,
              illegal, or harmful content. We may remove listings that violate these
              terms or community standards.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">4. No guarantee</h2>
            <p>
              We do not organize, host, or verify events listed on the site. Attendance
              and transactions between attendees and organizers are solely between those
              parties. Siargao Events is not liable for cancellations, changes, injuries,
              or disputes arising from any event.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">5. Intellectual property</h2>
            <p>
              You retain ownership of content you submit. By posting, you grant us a
              non-exclusive license to display it on the platform. Do not upload material
              you do not have the right to use.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">6. Changes</h2>
            <p>
              We may update these terms from time to time. Continued use of the site
              after changes constitutes acceptance of the updated terms.
            </p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-zinc-900">7. Contact</h2>
            <p>
              For questions about these terms, please use our{' '}
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
