import { NextResponse } from 'next/server'
import { isCronAuthorized } from '@/lib/whatsapp/cron-auth'
import { runDigest } from '@/lib/whatsapp/run-digest'

/** Uptime Robot / external schedulers — auth via ?key=CRON_SECRET (no custom headers needed). */
export async function GET(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const result = await runDigest({ preview: false })

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result)
}
