import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import {
  isValidInstagramUsername,
  normalizeInstagramUsername,
} from '@/lib/instagram/normalize-username'

type SubmitPayload = {
  username?: string
}

export async function POST(request: Request) {
  let body: SubmitPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const rawUsername = body.username?.trim() ?? ''

  if (!rawUsername) {
    return NextResponse.json(
      { error: 'Please enter an Instagram username.' },
      { status: 400 }
    )
  }

  const username = normalizeInstagramUsername(rawUsername)

  if (!isValidInstagramUsername(username)) {
    return NextResponse.json(
      { error: 'Please enter a valid Instagram username.' },
      { status: 400 }
    )
  }

  const supabase = createAdminClient()

  const { data: existing, error: lookupError } = await supabase
    .from('instagram_accounts')
    .select('username')
    .eq('username', username)
    .maybeSingle()

  if (lookupError) {
    console.error('Instagram account lookup error:', lookupError)
    return NextResponse.json(
      { error: 'Could not save account. Please try again later.' },
      { status: 500 }
    )
  }

  if (existing) {
    return NextResponse.json({
      success: true,
      username,
      alreadyExists: true,
    })
  }

  const { error } = await supabase.from('instagram_accounts').insert({
    username,
    is_active: true,
  })

  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({
        success: true,
        username,
        alreadyExists: true,
      })
    }

    console.error('Instagram account submit error:', error)
    return NextResponse.json(
      { error: 'Could not save account. Please try again later.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true, username, alreadyExists: false })
}
