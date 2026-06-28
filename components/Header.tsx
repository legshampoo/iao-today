import Link from 'next/link'
import { LogoutButton } from '@/components/LogoutButton'
import { createClient } from '@/lib/supabase/server'

const navLinkClass =
  'text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900'

export async function Header() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  const { data: profile } = user
    ? await supabase.from('profiles').select('admin').eq('id', user.id).maybeSingle()
    : { data: null }

  return (
    <header className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-semibold tracking-tight text-zinc-900">
          Love Siargao
        </Link>
        <nav className="flex items-center gap-4">
          {user ? (
            <>
              <Link href="/" className={navLinkClass}>
                Discover
              </Link>
              <Link href="/dashboard" className={navLinkClass}>
                Dashboard
              </Link>
              {profile?.admin && (
                <Link href="/admin" className={navLinkClass}>
                  Admin
                </Link>
              )}
              <LogoutButton />
            </>
          ) : (
            <Link href="/login" className={navLinkClass}>
              Login
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
