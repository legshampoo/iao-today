import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')

function loadEnvFile(filename) {
  const path = join(projectRoot, filename)

  if (!existsSync(path)) {
    return
  }

  const contents = readFileSync(path, 'utf8')

  for (const line of contents.split('\n')) {
    const trimmed = line.trim()

    if (!trimmed || trimmed.startsWith('#')) {
      continue
    }

    const separator = trimmed.indexOf('=')

    if (separator === -1) {
      continue
    }

    const key = trimmed.slice(0, separator).trim()
    let value = trimmed.slice(separator + 1).trim()

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1)
    }

    if (!(key in process.env)) {
      process.env[key] = value
    }
  }
}

loadEnvFile('.env')
loadEnvFile('.env.local')

const skipScrape = process.argv.includes('--no-scrape')
const useLocal = process.argv.includes('--local')

const databaseUrl = process.env.DATABASE_URL
const cronSecret = process.env.CRON_SECRET
const siteUrl = useLocal
  ? `http://localhost:${process.env.PORT ?? '3000'}`
  : process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, '')

if (!databaseUrl) {
  console.error('[instagram-reset] DATABASE_URL is not set in .env.local')
  process.exit(1)
}

if (!cronSecret) {
  console.error('[instagram-reset] CRON_SECRET is not set in .env.local')
  process.exit(1)
}

if (!skipScrape && !siteUrl) {
  console.error(
    '[instagram-reset] NEXT_PUBLIC_SITE_URL is not set (or pass --local for localhost)'
  )
  process.exit(1)
}

function createDatabaseClient() {
  const isLocal =
    databaseUrl.includes('localhost') || databaseUrl.includes('127.0.0.1')

  return new pg.Client({
    connectionString: databaseUrl,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  })
}

async function resetInstagramData() {
  const client = createDatabaseClient()
  await client.connect()

  try {
    const { rowCount: deletedListings } = await client.query(
      `delete from public.listings where source = 'instagram'`
    )

    const { rowCount: deletedPosts } = await client.query(
      `delete from public.instagram_posts`
    )

    console.log(`[instagram-reset] Deleted ${deletedListings ?? 0} instagram listing(s)`)
    console.log(`[instagram-reset] Deleted ${deletedPosts ?? 0} instagram post record(s)`)
    console.log('[instagram-reset] Manual listings were not touched.')
  } finally {
    await client.end()
  }
}

async function triggerScrape() {
  const url = `${siteUrl}/api/cron/instagram-scrape/trigger?key=${encodeURIComponent(cronSecret)}`

  console.log(`[instagram-reset] Triggering scrape at ${siteUrl}...`)

  const response = await fetch(url)
  const payload = await response.json()
  console.log(JSON.stringify(payload, null, 2))

  if (!response.ok) {
    throw new Error(`Scrape trigger failed (${response.status})`)
  }
}

try {
  await resetInstagramData()

  if (skipScrape) {
    console.log('[instagram-reset] Done. Run pnpm instagram:scrape to scrape manually.')
    process.exit(0)
  }

  await triggerScrape()
  console.log(
    '[instagram-reset] Done. Apify will webhook back when runs finish (~30–60s). Check Vercel logs for processing results.'
  )
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[instagram-reset] Failed: ${message}`)

  if (useLocal) {
    console.error('[instagram-reset] Is the dev server running? Try: pnpm dev')
  }

  process.exit(1)
}
