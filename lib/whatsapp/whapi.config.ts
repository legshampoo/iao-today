export const whapiConfig = {
  /** When true, the daily digest cron posts to the channel (9:00 AM Asia/Manila via vercel.json). */
  digestEnabled: true,
  /** When true, digest cron formats messages but does not post to the channel. */
  dryRun: false,
  graphApiVersion: 'v21.0',
  apiBaseUrl: 'https://gate.whapi.cloud',
} as const
