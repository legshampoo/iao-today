import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

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

const mode = process.argv[2]

if (mode !== 'preview' && mode !== 'send') {
  console.error('Usage: node scripts/whatsapp-digest.mjs <preview|send>')
  process.exit(1)
}

const cronSecret = process.env.CRON_SECRET

if (!cronSecret) {
  console.error('[digest] CRON_SECRET is not set in .env.local')
  process.exit(1)
}

const port = process.env.PORT ?? '3000'
const baseUrl = `http://localhost:${port}/api/cron/whatsapp-digest`
const url = mode === 'preview' ? `${baseUrl}?preview=1` : baseUrl

try {
  const response = await fetch(url, {
    headers: { authorization: `Bearer ${cronSecret}` },
  })

  const payload = await response.json()
  console.log(JSON.stringify(payload, null, 2))

  if (!response.ok) {
    process.exit(1)
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error)
  console.error(`[digest] Request failed: ${message}`)
  console.error('[digest] Is the dev server running? Try: pnpm dev')
  process.exit(1)
}
