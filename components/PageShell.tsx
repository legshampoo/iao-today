import type { ReactNode } from 'react'
import { Sidebar } from '@/components/Sidebar'

type PageShellProps = {
  children: ReactNode
}

export function PageShell({ children }: PageShellProps) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-8">
      <div className="flex flex-col gap-8 lg:flex-row lg:items-start">
        <div className="w-full shrink-0 lg:sticky lg:top-8 lg:w-72">
          <Sidebar />
        </div>
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </main>
  )
}
