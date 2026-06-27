import Image from 'next/image'
import {
  DEFAULT_LOCATION_LABEL,
  HERO_IMAGE_PATH,
  WHATSAPP_CHANNEL_URL,
  WHATSAPP_GROUP_URL,
} from '@/lib/constants'
import { formatTodayInManila } from '@/lib/format'

function MapPinIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5 shrink-0"
    >
      <path d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function WhatsAppIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="h-5 w-5"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.435 9.884-9.881 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

export function Sidebar() {
  const dateTimeLabel = formatTodayInManila()
  const locationLabel = DEFAULT_LOCATION_LABEL

  return (
    <aside className="space-y-6">
      <div className="relative h-[20vh] min-h-[120px] w-full overflow-hidden rounded-2xl bg-zinc-100 lg:aspect-[5/3] lg:h-auto">
        <Image
          src={HERO_IMAGE_PATH}
          alt="Siargao Today"
          fill
          className="object-cover"
          sizes="(max-width: 1024px) 100vw, 288px"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/45 via-black/10 to-black/55" />
        <div className="absolute inset-0 flex flex-col justify-between p-4 text-white">
          <div>
            <p className="text-2xl font-bold tracking-tight">iao.today</p>
            <p className="mt-0.5 text-sm font-medium text-white/90">{dateTimeLabel}</p>
          </div>
          <p className="flex items-center gap-1.5 text-sm text-white/90">
            <MapPinIcon />
            {locationLabel}
          </p>
        </div>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Daily Feed</h2>
        <p className="mt-2 text-sm leading-6 text-zinc-600">
          Your daily guide to the best events, places, and deals in Siargao.
        </p>
        <div className="mt-4 space-y-3">
          <a
            href={WHATSAPP_GROUP_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-[#25D366] bg-white px-4 py-3 text-sm font-medium text-[#128C7E] transition-colors hover:bg-[#25D366]/5"
          >
            <WhatsAppIcon />
            WhatsApp Group
          </a>
          <a
            href={WHATSAPP_CHANNEL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-[#20bd5a]"
          >
            <WhatsAppIcon />
            WhatsApp Channel
          </a>
        </div>

        <div className="mt-6 border-t border-zinc-200 pt-6">
          <h3 className="text-sm font-semibold text-zinc-900">
            Missing something?
          </h3>
          <p className="mt-2 text-sm leading-6 text-zinc-600">
            Know a place, deal, or experience we should feature? Send it to us
            and we&apos;ll review it for a future update.
          </p>
          <a
            href="mailto:hello@iao.today"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:bg-white"
          >
            Suggest a Listing
          </a>
        </div>
      </div>
    </aside>
  )
}
