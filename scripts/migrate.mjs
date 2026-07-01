import { existsSync, readFileSync } from 'node:fs'
import { readdir, readFile } from 'node:fs/promises'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import pg from 'pg'

const __dirname = dirname(fileURLToPath(import.meta.url))
const projectRoot = resolve(__dirname, '..')
const migrationsDir = join(projectRoot, 'supabase', 'migrations')

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

const MIGRATIONS_TABLE = 'public.schema_migrations'

async function ensureMigrationsTable(client) {
  await client.query(`
    create table if not exists ${MIGRATIONS_TABLE} (
      filename   text primary key,
      applied_at timestamptz not null default now()
    );
  `)

  await client.query(`
    alter table ${MIGRATIONS_TABLE} enable row level security;
    revoke all on ${MIGRATIONS_TABLE} from anon, authenticated, public;
  `)
}

async function getAppliedMigrations(client) {
  const { rows } = await client.query(
    `select filename from ${MIGRATIONS_TABLE} order by filename`
  )

  return new Set(rows.map((row) => row.filename))
}

async function listMigrationFiles() {
  const entries = await readdir(migrationsDir)

  return entries.filter((name) => name.endsWith('.sql')).sort()
}

function createDatabaseClient() {
  const connectionString = process.env.DATABASE_URL

  if (!connectionString) {
    return null
  }

  const isLocal =
    connectionString.includes('localhost') ||
    connectionString.includes('127.0.0.1')

  return new pg.Client({
    connectionString,
    ssl: isLocal ? false : { rejectUnauthorized: false },
  })
}

function isAlreadyAppliedError(error) {
  const alreadyAppliedCodes = new Set(['42P07', '42710', '42P06', '42723'])

  if (error.code && alreadyAppliedCodes.has(error.code)) {
    return true
  }

  return /already exists/i.test(error.message ?? '')
}

async function recordMigration(client, filename) {
  await client.query(
    `insert into ${MIGRATIONS_TABLE} (filename) values ($1) on conflict (filename) do nothing`,
    [filename]
  )
}

async function runMigration(client, filename, sql) {
  await client.query('begin')

  try {
    await client.query(sql)
    await recordMigration(client, filename)
    await client.query('commit')
  } catch (error) {
    await client.query('rollback')

    if (isAlreadyAppliedError(error)) {
      await recordMigration(client, filename)
      console.log(
        `[migrate] Baselined ${filename} (database objects already exist).`
      )
      return
    }

    throw error
  }
}

async function main() {
  const client = createDatabaseClient()

  if (!client) {
    console.warn(
      '[migrate] DATABASE_URL is not set — skipping migrations. Add it to .env.local (Supabase → Project Settings → Database → URI).'
    )
    return
  }

  await client.connect()

  try {
    await ensureMigrationsTable(client)

    const applied = await getAppliedMigrations(client)
    const files = await listMigrationFiles()
    const pending = files.filter((file) => !applied.has(file))

    if (pending.length === 0) {
      console.log('[migrate] Database is up to date.')
      return
    }

    for (const filename of pending) {
      const sql = await readFile(join(migrationsDir, filename), 'utf8')
      console.log(`[migrate] Applying ${filename}...`)
      await runMigration(client, filename, sql)
      console.log(`[migrate] Applied ${filename}.`)
    }

    console.log(`[migrate] Done. ${pending.length} migration(s) applied.`)
  } finally {
    await client.end()
  }
}

main().catch((error) => {
  console.error('[migrate] Failed:', error.message)
  process.exit(1)
})
