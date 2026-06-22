import { WHATSAPP_CHANNEL_URL } from '@/lib/constants'
import { formatEventPrice, formatEventTime, formatTodayInManila } from '@/lib/format'
import type { Event } from '@/lib/types/event'
import { getSiteUrl } from '@/lib/whatsapp/config'

const WHATSAPP_TEXT_LIMIT = 4096

function truncateForWhatsApp(text: string): string {
  if (text.length <= WHATSAPP_TEXT_LIMIT) {
    return text
  }

  return `${text.slice(0, WHATSAPP_TEXT_LIMIT - 1)}…`
}

function formatEventLine(event: Event, index: number, siteUrl: string): string {
  const priceLabel = formatEventPrice(event.is_free, event.price_php)
  const timeLabel = event.time_tbc ? 'Time TBC' : formatEventTime(event.starts_at)
  const eventUrl = `${siteUrl}/events/${event.id}`

  return [
    `${index}. ${event.title}`,
    `   ${timeLabel} · ${event.location} · ${priceLabel}`,
    `   ${eventUrl}`,
  ].join('\n')
}

export function formatDigestMessage(events: Event[], siteUrl = getSiteUrl()): string {
  const dateLabel = formatTodayInManila()

  if (events.length === 0) {
    return truncateForWhatsApp(
      [
        `🌴 IAO Today — ${dateLabel}`,
        '',
        'No events listed for today yet.',
        '',
        'Be the first — add yours and help the community discover what\'s on:',
        `${siteUrl}/dashboard/events/new`,
        '',
        `More events: ${siteUrl}`,
        `Follow the channel: ${WHATSAPP_CHANNEL_URL}`,
      ].join('\n')
    )
  }

  const lines = events.map((event, index) =>
    formatEventLine(event, index + 1, siteUrl)
  )

  return truncateForWhatsApp(
    [
      `🌴 IAO Today — ${dateLabel}`,
      '',
      ...lines,
      '',
      `More events: ${siteUrl}`,
    ].join('\n')
  )
}
