export type InstagramLogStep = 'scrape' | 'webhook' | 'process' | 'summary'

export function logInstagramStep(step: InstagramLogStep, message: string) {
  console.log(`[instagram:${step}] ${message}`)
}

export function logInstagramSummary(summary: Record<string, unknown>) {
  console.log(`[instagram:summary] ${JSON.stringify(summary)}`)
}
