import Link from 'next/link'
import type { ReactNode } from 'react'

type HorizontalSectionProps = {
  id?: string
  title: string
  subtitle?: string
  href?: string
  children: ReactNode
}

export function HorizontalSection({
  id,
  title,
  subtitle,
  href,
  children,
}: HorizontalSectionProps) {
  return (
    <section id={id} className="scroll-mt-6 border-b border-zinc-200 pb-8 last:border-b-0">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-zinc-950">{title}</h2>
          {subtitle && <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>}
        </div>
        {href && (
          <Link
            href={href}
            className="shrink-0 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-950"
          >
            View all
          </Link>
        )}
      </div>
      <div className="-mx-4 overflow-x-auto px-4 pb-2">
        <div className="flex snap-x gap-4">
          {children}
        </div>
      </div>
    </section>
  )
}
