import { after } from 'next/server'
import {
  fetchApifyDatasetItems,
} from '@/lib/instagram/apify-client'
import { normalizeAccountPosts } from '@/lib/instagram/normalize-posts'
import { processInstagramPosts } from '@/lib/instagram/processing/run'
import { saveScrapedPosts } from '@/lib/instagram/processing/posts-repository'
import { createAdminClient } from '@/lib/supabase/admin'
import type { ApifyWebhookPayload } from '@/lib/instagram/types'

async function markAccountScraped(username: string): Promise<void> {
  const supabase = createAdminClient()

  const { error } = await supabase
    .from('instagram_accounts')
    .update({ last_scraped_at: new Date().toISOString() })
    .eq('username', username)

  if (error) {
    console.error(
      `[instagram-scrape] Failed to update last_scraped_at for @${username}:`,
      error.message
    )
  }
}

function triggerAsyncProcessing(postIds: string[]) {
  if (postIds.length === 0) {
    return
  }

  after(async () => {
    const results = await processInstagramPosts(postIds)

    console.log('[instagram-scrape] processing complete', JSON.stringify(results))
  })
}

export async function handleApifyWebhook(
  username: string,
  payload: ApifyWebhookPayload
): Promise<{ ok: true } | { ok: false; error: string }> {
  const eventType = payload.eventType ?? 'unknown'
  const runId = payload.resource?.id ?? 'unknown'

  if (eventType === 'ACTOR.RUN.FAILED') {
    console.error(
      `[instagram-scrape] Apify run failed for @${username} (run ${runId}).`
    )
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
    const items = await fetchApifyDatasetItems(datasetId)
    const result = normalizeAccountPosts(username, items)

    console.log('[instagram-scrape]', JSON.stringify(result, null, 2))

    const postIdsToProcess = await saveScrapedPosts(result)
    triggerAsyncProcessing(postIdsToProcess)
    await markAccountScraped(username)

    return { ok: true }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error(
      `[instagram-scrape] Failed to process webhook for @${username}:`,
      message
    )
    return { ok: false, error: message }
  }
}
