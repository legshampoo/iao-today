import type { ProcessPostResult } from '@/lib/instagram/processing/run'
import type { AccountBatchResult } from '@/lib/instagram/scrape-batch'

export function summarizeProcessResults(
  results: ProcessPostResult[]
): Omit<AccountBatchResult, 'postsScraped'> {
  let eventsCreated = 0
  let skipped = 0
  let failed = 0
  let alreadyProcessed = 0

  for (const result of results) {
    if (!result.ok) {
      failed += 1
      continue
    }

    switch (result.status) {
      case 'processed':
        eventsCreated += result.eventIds.length
        break
      case 'skipped':
        skipped += 1
        break
      case 'already_processed':
        alreadyProcessed += 1
        break
    }
  }

  return {
    postsProcessed: results.length,
    eventsCreated,
    skipped,
    failed,
    alreadyProcessed,
  }
}
