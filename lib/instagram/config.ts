const ACTOR_ID = 'apify~instagram-scraper'
const POSTS_LIMIT = 1
const DEFAULT_MAX_CONCURRENT_RUNS = 4

export function getInstagramScrapeConfig() {
  const apifyToken = process.env.APIFY_API_TOKEN
  const cronSecret = process.env.CRON_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const maxConcurrentRuns = Number.parseInt(
    process.env.APIFY_MAX_CONCURRENT_RUNS ?? '',
    10
  )

  if (!apifyToken) {
    throw new Error('APIFY_API_TOKEN is required for Instagram scraping.')
  }

  if (!cronSecret) {
    throw new Error('CRON_SECRET is required for Instagram scrape webhooks.')
  }

  if (!siteUrl) {
    throw new Error('NEXT_PUBLIC_SITE_URL is required for Apify webhook callbacks.')
  }

  return {
    apifyToken,
    cronSecret,
    siteUrl: siteUrl.replace(/\/$/, ''),
    actorId: ACTOR_ID,
    postsLimit: POSTS_LIMIT,
    maxConcurrentRuns:
      Number.isFinite(maxConcurrentRuns) && maxConcurrentRuns > 0
        ? maxConcurrentRuns
        : DEFAULT_MAX_CONCURRENT_RUNS,
  }
}
