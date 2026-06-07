import type { ReactNode } from 'react'

type EventDetailInfoRowProps = {
  icon: ReactNode
  primary: string
  secondary?: string
}

export function EventDetailInfoRow({
  icon,
  primary,
  secondary,
}: EventDetailInfoRowProps) {
  return (
    <div className="flex items-start gap-4 py-4">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-zinc-100 text-zinc-500">
        {icon}
      </div>
      <div className="min-w-0 pt-0.5">
        <p className="font-semibold text-zinc-900">{primary}</p>
        {secondary && (
          <p className="mt-0.5 text-sm text-zinc-500">{secondary}</p>
        )}
      </div>
    </div>
  )
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

export const eventDetailIcons = {
  calendar: <CalendarIcon />,
  pin: <PinIcon />,
  ticket: <TicketIcon />,
}
