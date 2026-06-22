import { startInstagramProfileScrape } from '@/lib/instagram/apify-client'
import { getActiveInstagramAccounts } from '@/lib/instagram/get-accounts'
import { logInstagramStep, logInstagramSummary } from '@/lib/instagram/logging'
import {
  createScrapeBatch,
  recordAccountBatchResult,
} from '@/lib/instagram/scrape-batch'
import type { ScrapeTriggerResult } from '@/lib/instagram/types'

const DELAY_BETWEEN_RUNS_MS = 1500

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export async function runInstagramScrape(): Promise<ScrapeTriggerResult> {
  try {
    const accounts = await getActiveInstagramAccounts()

    if (accounts.length === 0) {
      logInstagramSummary({
        accountsChecked: 0,
        eventsCreated: 0,
        accountsWithEvents: [],
        accounts: {},
      })

      return {
        ok: true,
        batchId: null,
        accountCount: 0,
        started: [],
        failed: [],
      }
    }

    const usernames = accounts.map((account) => account.username)
    const batchId = await createScrapeBatch(usernames)

    logInstagramStep('scrape', `starting batch ${batchId}`)

    const started: Array<{ username: string; runId: string }> = []
    const failed: Array<{ username: string; error: string }> = []

    for (const account of accounts) {
      try {
        const { runId } = await startInstagramProfileScrape(
          account.username,
          batchId
        )
        started.push({ username: account.username, runId })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error'
        failed.push({ username: account.username, error: message })

        await recordAccountBatchResult(batchId, account.username, {
          postsScraped: 0,
          postsProcessed: 0,
          eventsCreated: 0,
          skipped: 0,
          failed: 0,
          alreadyProcessed: 0,
          scrapeFailed: true,
          error: message,
        })
      }

      await delay(DELAY_BETWEEN_RUNS_MS)
    }

    logInstagramSummary({
      step: 'scrape',
      batchId,
      accountsChecked: accounts.length,
      apifyRunsStarted: started.length,
      apifyRunsFailed: failed.length,
      started: started.map((item) => item.username),
      failed,
    })

    return {
      ok: true,
      batchId,
      accountCount: accounts.length,
      started,
      failed,
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logInstagramStep('scrape', `failed — ${message}`)
    return { ok: false, error: message }
  }
}
