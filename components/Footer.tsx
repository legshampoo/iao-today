import Link from 'next/link'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-zinc-200 bg-white text-zinc-600">
      <div className="mx-auto grid max-w-3xl gap-8 px-4 py-10 sm:grid-cols-2">
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Support</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/about" className="transition-colors hover:text-zinc-900">
                About
              </Link>
            </li>
            <li>
              <Link href="/contact" className="transition-colors hover:text-zinc-900">
                Contact
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-zinc-900">Legal</h2>
          <ul className="mt-3 space-y-2 text-sm">
            <li>
              <Link href="/terms" className="transition-colors hover:text-zinc-900">
                Terms of Use
              </Link>
            </li>
            <li>
              <Link href="/privacy" className="transition-colors hover:text-zinc-900">
                Privacy Policy
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-zinc-200">
        <p className="mx-auto max-w-3xl px-4 py-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} Siargao Events
        </p>
      </div>
    </footer>
  )
}
