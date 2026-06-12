import {
  assertWhatsAppSenderConfigured,
  getWhatsAppConfig,
  type WhatsAppConfig,
} from '@/lib/whatsapp/config'

export type SendChannelPostResult = {
  mode: 'dry_run' | 'gateway'
  messageId?: string
}

async function sendViaGateway(
  config: WhatsAppConfig,
  text: string
): Promise<SendChannelPostResult> {
  const response = await fetch(`${config.apiBaseUrl}/messages/text`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      to: config.channelRecipientId,
      body: text,
    }),
  })

  const payload = await response.json().catch(() => null)

  if (!response.ok) {
    const detail =
      payload && typeof payload === 'object' && 'message' in payload
        ? String(payload.message)
        : response.statusText

    throw new Error(`WhatsApp gateway error (${response.status}): ${detail}`)
  }

  const messageId =
    payload &&
    typeof payload === 'object' &&
    'message' in payload &&
    payload.message &&
    typeof payload.message === 'object' &&
    'id' in payload.message
      ? String(payload.message.id)
      : undefined

  return { mode: 'gateway', messageId }
}

export async function sendChannelPost(text: string): Promise<SendChannelPostResult> {
  const config = getWhatsAppConfig()
  const mode = assertWhatsAppSenderConfigured(config)

  if (mode === 'dry_run') {
    return { mode: 'dry_run' }
  }

  return sendViaGateway(config, text)
}
