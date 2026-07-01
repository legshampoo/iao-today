import { getWhatsAppConfig } from '@/lib/whatsapp/config'
import { recordDigestLog } from '@/lib/whatsapp/digest-log'
import { formatDigestMessage } from '@/lib/whatsapp/format-digest'
import { getListingsForDigest } from '@/lib/whatsapp/get-listings-for-digest'
import { sendChannelPost } from '@/lib/whatsapp/send-channel-post'

export type DigestResult =
  | {
      ok: true
      preview?: true
      skipped?: true
      reason?: string
      dateKey: string
      eventCount: number
      message?: string
      digestEnabled?: boolean
      dryRun?: boolean
      mode?: 'dry_run' | 'gateway'
      messageId?: string
    }
  | { ok: false; error: string }

export async function runDigest(options: {
  preview?: boolean
}): Promise<DigestResult> {
  const config = getWhatsAppConfig()

  try {
    const { dateKey, listings } = await getListingsForDigest()
    const message = formatDigestMessage(listings, config.siteUrl)

    if (options.preview) {
      return {
        ok: true,
        preview: true,
        dateKey,
        eventCount: listings.length,
        message,
        digestEnabled: config.digestEnabled,
        dryRun: config.dryRun,
      }
    }

    if (!config.digestEnabled) {
      return {
        ok: true,
        skipped: true,
        reason: 'digestEnabled is false in lib/whatsapp/whapi.config.ts',
        dateKey,
        eventCount: listings.length,
      }
    }

    const result = await sendChannelPost(message)

    await recordDigestLog({
      digestDate: dateKey,
      status: 'sent',
      messageBody: message,
    })

    return {
      ok: true,
      dateKey,
      eventCount: listings.length,
      mode: result.mode,
      messageId: result.messageId,
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    try {
      const { dateKey } = await getListingsForDigest()
      await recordDigestLog({
        digestDate: dateKey,
        status: 'failed',
        errorMessage,
      })
    } catch {
      // Best-effort failure logging only.
    }

    console.error('WhatsApp digest failed:', error)

    return { ok: false, error: errorMessage }
  }
}
