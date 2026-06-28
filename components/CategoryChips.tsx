import Link from 'next/link'

type CategoryChip = {
  label: string
  href: string
  icon: string
  slug: string
}

const CATEGORY_CHIPS: CategoryChip[] = [
  { label: 'Top Picks', href: '/#top-picks', icon: 'Hot', slug: 'top-picks' },
  { label: 'Events', href: '/events', icon: 'Cal', slug: 'events' },
  { label: 'Discounts', href: '/discounts', icon: 'Deal', slug: 'discounts' },
  { label: 'Tours', href: '/tours', icon: 'Sea', slug: 'tours' },
  { label: 'Restaurants', href: '/restaurants', icon: 'Food', slug: 'restaurants' },
  { label: 'Wellness', href: '/wellness', icon: 'Zen', slug: 'wellness' },
  { label: 'Stay', href: '/stay', icon: 'Home', slug: 'stay' },
  { label: 'All', href: '/#all', icon: 'All', slug: 'all' },
]

type CategoryChipsProps = {
  activeSlug?: string
}

export function CategoryChips({ activeSlug = 'all' }: CategoryChipsProps) {
  return (
    <nav aria-label="Listing categories" className="-mx-4 overflow-x-auto px-4">
      <div className="flex w-max gap-2 pb-2">
        {CATEGORY_CHIPS.map((chip) => {
          const isActive = chip.slug === activeSlug

          return (
            <Link
              key={chip.slug}
              href={chip.href}
              className={
                isActive
                  ? 'inline-flex items-center gap-2 rounded-full bg-zinc-950 px-3 py-2 text-sm font-semibold text-white shadow-sm'
                  : 'inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-600 transition hover:border-zinc-300 hover:text-zinc-950'
              }
            >
              <span
                className={
                  isActive
                    ? 'text-[10px] font-bold uppercase tracking-wide text-white/75'
                    : 'text-[10px] font-bold uppercase tracking-wide text-zinc-400'
                }
              >
                {chip.icon}
              </span>
              {chip.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
