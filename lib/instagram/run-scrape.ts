import {
  getApifyRunStatus,
  isApifyRunTerminal,
  startInstagramProfileScrape,
} from '@/lib/instagram/apify-client'
import { getInstagramScrapeConfig } from '@/lib/instagram/config'
import { getActiveInstagramAccounts } from '@/lib/instagram/get-accounts'
import { logInstagramStep, logInstagramSummary } from '@/lib/instagram/logging'
import {
  createScrapeBatch,
  recordAccountBatchResult,
} from '@/lib/instagram/scrape-batch'
import type { ScrapeTriggerResult } from '@/lib/instagram/types'

const DELAY_BETWEEN_RUNS_MS = 1500
const RUN_STATUS_POLL_MS = 3000

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

async function purgeFinishedRuns(activeRuns: Map<string, string>) {
  for (const [runId] of activeRuns) {
    try {
      const status = await getApifyRunStatus(runId)

      if (isApifyRunTerminal(status)) {
        activeRuns.delete(runId)
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      logInstagramStep('scrape', `could not poll run ${runId} — ${message}`)
    }
  }
}

async function waitForApifyRunSlot(activeRuns: Map<string, string>) {
  const { maxConcurrentRuns } = getInstagramScrapeConfig()

  while (activeRuns.size >= maxConcurrentRuns) {
    await delay(RUN_STATUS_POLL_MS)
    await purgeFinishedRuns(activeRuns)
  }
}

export async function runInstagramScrape(): Promise<ScrapeTriggerResult> {
  try {
    const accounts = await getActiveInstagramAccounts()
    const { maxConcurrentRuns } = getInstagramScrapeConfig()

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
    const activeRuns = new Map<string, string>()

    logInstagramStep(
      'scrape',
      `starting batch ${batchId} (max ${maxConcurrentRuns} concurrent Apify runs)`
    )

    const started: Array<{ username: string; runId: string }> = []
    const failed: Array<{ username: string; error: string }> = []

    for (const account of accounts) {
      await waitForApifyRunSlot(activeRuns)

      try {
        const { runId } = await startInstagramProfileScrape(
          account.username,
          batchId
        )
        started.push({ username: account.username, runId })
        activeRuns.set(runId, account.username)
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
      maxConcurrentRuns,
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
