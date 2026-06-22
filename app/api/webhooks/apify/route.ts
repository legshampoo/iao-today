import { NextResponse } from 'next/server'
import { handleApifyWebhook } from '@/lib/instagram/handle-webhook'
import type { ApifyWebhookPayload } from '@/lib/instagram/types'
import { isCronAuthorized } from '@/lib/whatsapp/cron-auth'

/** Apify ad-hoc webhook — auth via ?key=CRON_SECRET&username=... */
export async function POST(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const username = searchParams.get('username')

  if (!username) {
    return NextResponse.json({ error: 'Missing username' }, { status: 400 })
  }

  let payload: ApifyWebhookPayload

  try {
    payload = (await request.json()) as ApifyWebhookPayload
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const result = await handleApifyWebhook(username, payload)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
