import { NextResponse } from 'next/server'
import { processInstagramPost } from '@/lib/instagram/processing/run'
import { isCronAuthorized } from '@/lib/whatsapp/cron-auth'

/** Async processing trigger — auth via ?key=CRON_SECRET&postId=... */
export async function POST(request: Request) {
  if (!isCronAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const postId = searchParams.get('postId')

  if (!postId) {
    return NextResponse.json({ error: 'Missing postId' }, { status: 400 })
  }

  const result = await processInstagramPost(postId)

  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 500 })
  }

  return NextResponse.json(result)
}
