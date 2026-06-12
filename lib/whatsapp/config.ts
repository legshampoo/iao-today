import { whapiConfig } from '@/lib/whatsapp/whapi.config'

export type WhatsAppConfig = {
  digestEnabled: boolean
  dryRun: boolean
  siteUrl: string
  accessToken: string | undefined
  channelRecipientId: string | undefined
  apiBaseUrl: string | undefined
  graphApiVersion: string
}

export function getSiteUrl(): string {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, '')
  }

  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL}`
  }

  return 'http://localhost:3000'
}

export function getWhatsAppConfig(): WhatsAppConfig {
  return {
    digestEnabled: whapiConfig.digestEnabled,
    dryRun: whapiConfig.dryRun,
    siteUrl: getSiteUrl(),
    accessToken: process.env.WHATSAPP_ACCESS_TOKEN,
    channelRecipientId: process.env.WHATSAPP_CHANNEL_RECIPIENT_ID,
    apiBaseUrl: whapiConfig.apiBaseUrl.replace(/\/$/, ''),
    graphApiVersion: whapiConfig.graphApiVersion,
  }
}

export function assertWhatsAppSenderConfigured(
  config: WhatsAppConfig
): string {
  if (config.dryRun) {
    return 'dry_run'
  }

  if (
    config.apiBaseUrl &&
    config.accessToken &&
    config.channelRecipientId
  ) {
    return 'gateway'
  }

  if (!config.channelRecipientId) {
    throw new Error(
      'WHATSAPP_CHANNEL_RECIPIENT_ID is required. Use your channel gateway docs to find the ID (often ends with @newsletter).'
    )
  }

  if (!config.accessToken) {
    throw new Error('WHATSAPP_ACCESS_TOKEN is required.')
  }

  throw new Error(
    'Channel posting is not available via Meta Cloud API alone. Set apiBaseUrl in lib/whatsapp/whapi.config.ts or dryRun=true to test the digest formatter.'
  )
}
