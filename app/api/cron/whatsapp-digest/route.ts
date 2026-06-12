import { NextResponse } from 'next/server'
import { getWhatsAppConfig } from '@/lib/whatsapp/config'
import { getDigestLog, recordDigestLog } from '@/lib/whatsapp/digest-log'
import { formatDigestMessage } from '@/lib/whatsapp/format-digest'
import { getEventsForDigest } from '@/lib/whatsapp/get-events-for-digest'
import { sendChannelPost } from '@/lib/whatsapp/send-channel-post'

function isAuthorized(request: Request): boolean {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return false
  }

  return request.headers.get('authorization') === `Bearer ${cronSecret}`
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const preview = searchParams.get('preview') === '1'
  const config = getWhatsAppConfig()

  try {
    const { dateKey, events } = await getEventsForDigest()
    const message = formatDigestMessage(events, config.siteUrl)

    if (preview) {
      return NextResponse.json({
        preview: true,
        dateKey,
        eventCount: events.length,
        message,
        digestEnabled: config.digestEnabled,
        dryRun: config.dryRun,
      })
    }

    if (!config.digestEnabled) {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'digestEnabled is false in lib/whatsapp/whapi.config.ts',
        dateKey,
        eventCount: events.length,
      })
    }

    const existingLog = await getDigestLog(dateKey)

    if (existingLog?.status === 'sent') {
      return NextResponse.json({
        ok: true,
        skipped: true,
        reason: 'Digest already sent for this Manila date',
        dateKey,
      })
    }

    const result = await sendChannelPost(message)

    await recordDigestLog({
      digestDate: dateKey,
      status: 'sent',
      messageBody: message,
    })

    return NextResponse.json({
      ok: true,
      dateKey,
      eventCount: events.length,
      mode: result.mode,
      messageId: result.messageId,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'

    try {
      const { dateKey } = await getEventsForDigest()
      await recordDigestLog({
        digestDate: dateKey,
        status: 'failed',
        errorMessage: message,
      })
    } catch {
      // Best-effort failure logging only.
    }

    console.error('WhatsApp digest cron failed:', error)

    return NextResponse.json({ error: message }, { status: 500 })
  }
}
