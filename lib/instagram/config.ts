const ACTOR_ID = 'apify~instagram-scraper'
const POSTS_LIMIT = 1

export function getInstagramScrapeConfig() {
  const apifyToken = process.env.APIFY_API_TOKEN
  const cronSecret = process.env.CRON_SECRET
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL

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
  }
}
