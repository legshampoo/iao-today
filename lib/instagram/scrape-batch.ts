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

export async function recordAccountBatchResult(
  batchId: string,
  username: string,
  result: AccountBatchResult
): Promise<void> {
  const supabase = createAdminClient()

  const { data: batch, error: fetchError } = await supabase
    .from('instagram_scrape_batches')
    .select('account_usernames, account_results, finished_at')
    .eq('id', batchId)
    .maybeSingle()

  if (fetchError || !batch || batch.finished_at) {
    return
  }

  const accountResults = (batch.account_results ?? {}) as Record<
    string,
    AccountBatchResult
  >

  accountResults[username] = result

  const { error: updateError } = await supabase
    .from('instagram_scrape_batches')
    .update({ account_results: accountResults })
    .eq('id', batchId)

  if (updateError) {
    console.error(
      `[instagram:summary] Failed to update batch for @${username}:`,
      updateError.message
    )
    return
  }

  const completedCount = Object.keys(accountResults).length
  const expectedCount = batch.account_usernames.length

  if (completedCount < expectedCount) {
    const step = result.scrapeFailed ? 'scrape' : 'process'
    const detail = result.scrapeFailed
      ? `could not start — ${result.error ?? 'unknown error'}`
      : 'done'
    logInstagramStep(
      step,
      `@${username} ${detail} (${completedCount}/${expectedCount} accounts)`
    )
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
