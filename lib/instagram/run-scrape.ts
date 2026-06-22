import { startInstagramProfileScrape } from '@/lib/instagram/apify-client'
import { getActiveInstagramAccounts } from '@/lib/instagram/get-accounts'
import type { ScrapeTriggerResult } from '@/lib/instagram/types'

export async function runInstagramScrape(): Promise<ScrapeTriggerResult> {
  try {
    const accounts = await getActiveInstagramAccounts()

    if (accounts.length === 0) {
      return {
        ok: true,
        accountCount: 0,
        started: [],
        failed: [],
      }
    }

    const started: Array<{ username: string; runId: string }> = []
    const failed: Array<{ username: string; error: string }> = []

    for (const account of accounts) {
      try {
        const { runId } = await startInstagramProfileScrape(account.username)
        started.push({ username: account.username, runId })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        failed.push({ username: account.username, error: message })
        console.error(
          `[instagram-scrape] Failed to start scrape for @${account.username}:`,
          message
        )
      }
    }

    return {
      ok: true,
      accountCount: accounts.length,
      started,
      failed,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[instagram-scrape] Trigger failed:', message)
    return { ok: false, error: message }
  }
}
