import type { ReactNode } from 'react'

type EventDetailInfoRowProps = {
  icon: ReactNode
  primary: string
  secondary?: string
  href?: string
}

export function EventDetailInfoRow({
  icon,
  primary,
  secondary,
  href,
}: EventDetailInfoRowProps) {
  const content = (
    <>
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="font-semibold text-zinc-900">{primary}</p>
        {secondary && (
          <p className="mt-0.5 text-sm text-zinc-500">{secondary}</p>
        )}
      </div>
    </>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-start gap-4 py-4 transition-colors hover:text-emerald-700"
      >
        {content}
      </a>
    )
  }

  return <div className="flex items-start gap-4 py-4">{content}</div>
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <path d="M12 21s7-4.5 7-11a7 7 0 1 0-14 0c0 6.5 7 11 7 11Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <path d="M3 9h3v6H3zM18 9h3v6h-3z" />
      <path d="M6 9h12v6H6z" strokeLinecap="round" />
      <path d="M9 12h0M15 12h0" strokeLinecap="round" strokeWidth="3" />
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3a15 15 0 0 1 0 18M12 3a15 15 0 0 0 0 18" />
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      className="h-5 w-5"
    >
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  )
}

export const eventDetailIcons = {
  calendar: <CalendarIcon />,
  pin: <PinIcon />,
  ticket: <TicketIcon />,
  globe: <GlobeIcon />,
  instagram: <InstagramIcon />,
}
