import { after } from 'next/server'
import { fetchApifyDatasetItems } from '@/lib/instagram/apify-client'
import { logInstagramStep } from '@/lib/instagram/logging'
import { normalizeAccountPosts } from '@/lib/instagram/normalize-posts'
import { summarizeProcessResults } from '@/lib/instagram/processing/summarize'
import { processInstagramPosts } from '@/lib/instagram/processing/run'
import { saveScrapedPosts } from '@/lib/instagram/processing/posts-repository'
import {
  recordAccountBatchResult,
  type AccountBatchResult,
} from '@/lib/instagram/scrape-batch'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ApifyWebhookPayload } from '@/lib/instagram/types'

async function markAccountScraped(username: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('instagram_accounts')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('username', username)

  if (error) {
    logInstagramStep(
      'webhook',
      `@${username} — could not update last_scraped_at`
    )
  }
}

function triggerAsyncProcessing(
  username: string,
  batchId: string | null,
  postIds: string[],
  postsScraped: number
) {
  after(async () => {
    logInstagramStep(
      'process',
      `@${username} — processing ${postIds.length} post(s)`
    )

    if (postIds.length === 0) {
      if (batchId) {
        await recordAccountBatchResult(batchId, username, {
          postsScraped,
          postsProcessed: 0,
          eventsCreated: 0,
          skipped: 0,
          failed: 0,
          alreadyProcessed: 0,
        })
      }
      return
    }

    const results = await processInstagramPosts(postIds)
    const summary = summarizeProcessResults(results)

    if (batchId) {
      await recordAccountBatchResult(batchId, username, {
        postsScraped,
        ...summary,
      })
    }
  })
}

async function recordScrapeFailure(
  batchId: string | null,
  username: string,
  error: string
) {
  if (!batchId) {
    return
  }

  const result: AccountBatchResult = {
    postsScraped: 0,
    postsProcessed: 0,
    eventsCreated: 0,
    skipped: 0,
    failed: 0,
    alreadyProcessed: 0,
    scrapeFailed: true,
    error,
  }

  await recordAccountBatchResult(batchId, username, result)
}

export async function handleApifyWebhook(
  username: string,
  batchId: string | null,
  payload: ApifyWebhookPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const eventType = payload.eventType ?? 'unknown'
  const runId = payload.resource?.id ?? 'unknown'

  if (eventType === 'ACTOR.RUN.FAILED') {
    logInstagramStep('webhook', `@${username} — Apify run failed (${runId})`)
    await recordScrapeFailure(batchId, username, 'Apify run failed')
    return { ok: true }
  }

  if (eventType !== 'ACTOR.RUN.SUCCEEDED') {
    return { ok: true }
  }

  const datasetId = payload.resource?.defaultDatasetId

  if (!datasetId) {
    return {
      ok: false,
      error: `Apify run ${runId} for @${username} has no defaultDatasetId.`,
    }
  }

  try {
    logInstagramStep('webhook', `@${username} — scrape complete`)

    const items = await fetchApifyDatasetItems(datasetId)
    const result = normalizeAccountPosts(username, items)

    if (result.posts.length === 0) {
      logInstagramStep(
        'webhook',
        `@${username} — no scrapable posts (latest may be a reel)`
      )
    }

    const postIdsToProcess = await saveScrapedPosts(result)

    if (result.posts.length > 0 && postIdsToProcess.length === 0) {
      logInstagramStep(
        'webhook',
        `@${username} — ${result.posts.length} post(s) already processed`
      )
    }

    triggerAsyncProcessing(
      username,
      batchId,
      postIdsToProcess,
      result.posts.length
    )
    await markAccountScraped(username)

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    logInstagramStep('webhook', `@${username} — failed — ${message}`)
    await recordScrapeFailure(batchId, username, message)
    return { ok: false, error: message }
  }
}
