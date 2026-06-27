import Link from 'next/link'
import type { ReactNode } from 'react'
import { Header } from '@/components/Header'

type AdminShellProps = {
  title: string
  subtitle?: string
  action?: ReactNode
  children: ReactNode
}

const adminLinks = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/listings', label: 'Listings' },
  { href: '/admin/listings/new', label: 'New Listing' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/settings', label: 'Settings' },
]

export function AdminShell({ title, subtitle, action, children }: AdminShellProps) {
  return (
    <>
      <Header />
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8 flex flex-col gap-6 lg:flex-row lg:items-start">
          <aside className="w-full shrink-0 lg:w-56">
            <nav className="rounded-2xl border border-zinc-200 bg-white p-2">
              {adminLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="block rounded-xl px-3 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-50 hover:text-zinc-950"
                >
                  {link.label}
                </Link>
              ))}
            </nav>
          </aside>

          <section className="min-w-0 flex-1">
            <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-950">
                  {title}
                </h1>
                {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
              </div>
              {action}
            </div>

            {children}
          </section>
        </div>
      </main>
    </>
  )
}
