import { logInstagramStep, logInstagramSummary } from '@/lib/instagram/logging'
import { createAdminClient } from '@/lib/supabase/admin'

export type AccountBatchResult = {
  postsScraped: number
  postsProcessed: number
  eventsCreated: number
  skipped: number
  failed: number
  alreadyProcessed: number
  scrapeFailed?: boolean
  error?: string
}

export async function createScrapeBatch(
  accountUsernames: string[]
): Promise<string> {
  const supabase = createAdminClient()

  const { data, error } = await supabase
    .from('instagram_scrape_batches')
    .insert({ account_usernames: accountUsernames })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create scrape batch: ${error.message}`)
  }

  return data.id
}

function formatAccountBatchDetail(result: AccountBatchResult): string {
  if (result.scrapeFailed) {
    return `could not start — ${result.error ?? 'unknown error'}`
  }

  const parts = [`${result.eventsCreated} event(s) created`]

  if (result.skipped > 0) {
    parts.push(`${result.skipped} skipped`)
  }

  if (result.failed > 0) {
    parts.push(`${result.failed} failed`)
  }

  if (result.alreadyProcessed > 0) {
    parts.push(`${result.alreadyProcessed} already processed`)
  }

  if (result.postsScraped === 0) {
    parts.push('no posts scraped')
  }

  return parts.join(', ')
}

async function mergeAccountBatchResult(
  batchId: string,
  username: string,
  result: AccountBatchResult
): Promise<Record<string, AccountBatchResult>> {
  const supabase = createAdminClient()

  const { data, error } = await supabase.rpc(
    'merge_instagram_batch_account_result',
    {
      p_batch_id: batchId,
      p_username: username,
      p_result: result,
    }
  )

  if (error) {
    throw new Error(
      `Failed to update batch for @${username}: ${error.message}`
    )
  }

  return (data ?? {}) as Record<string, AccountBatchResult>
}

export async function recordAccountBatchResult(
  batchId: string,
  username: string,
  result: AccountBatchResult
): Promise<void> {
  const supabase = createAdminClient()

  let accountResults: Record<string, AccountBatchResult>

  try {
    accountResults = await mergeAccountBatchResult(batchId, username, result)
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    console.error(`[instagram:summary] ${message}`)
    return
  }

  const { data: batch, error: fetchError } = await supabase
    .from('instagram_scrape_batches')
    .select('account_usernames, finished_at')
    .eq('id', batchId)
    .maybeSingle()

  if (fetchError || !batch || batch.finished_at) {
    return
  }

  const completedCount = Object.keys(accountResults).length
  const expectedCount = batch.account_usernames.length
  const step = result.scrapeFailed ? 'scrape' : 'process'

  logInstagramStep(
    step,
    `@${username} — ${formatAccountBatchDetail(result)} (${completedCount}/${expectedCount} accounts)`
  )

  if (completedCount < expectedCount) {
    return
  }

  await finalizeScrapeBatch(batchId, batch.account_usernames, accountResults)
}

async function finalizeScrapeBatch(
  batchId: string,
  accountUsernames: string[],
  accountResults: Record<string, AccountBatchResult>
) {
  const supabase = createAdminClient()

  const accountsWithEvents = accountUsernames.filter(
    (username) => (accountResults[username]?.eventsCreated ?? 0) > 0
  )

  const totalEventsCreated = accountUsernames.reduce(
    (sum, username) => sum + (accountResults[username]?.eventsCreated ?? 0),
    0
  )

  const perAccount = Object.fromEntries(
    accountUsernames.map((username) => {
      const result = accountResults[username]
      return [
        username,
        {
          postsScraped: result?.postsScraped ?? 0,
          eventsCreated: result?.eventsCreated ?? 0,
          skipped: result?.skipped ?? 0,
          failed: result?.failed ?? 0,
          scrapeFailed: result?.scrapeFailed ?? false,
        },
      ]
    })
  )

  await supabase
    .from('instagram_scrape_batches')
    .update({ finished_at: new Date().toISOString() })
    .eq('id', batchId)

  logInstagramSummary({
    batchId,
    accountsChecked: accountUsernames.length,
    eventsCreated: totalEventsCreated,
    accountsWithEvents,
    accounts: perAccount,
  })
}
