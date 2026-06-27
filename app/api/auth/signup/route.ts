import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type SignupPayload = {
  email?: string
  password?: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email is not configured.' }, { status: 500 })
  }

  let body: SignupPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase() ?? ''
  const password = body.password ?? ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  if (password.length < 8) {
    return NextResponse.json(
      { error: 'Password must be at least 8 characters.' },
      { status: 400 }
    )
  }

  const { origin } = new URL(request.url)
  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'signup',
    email,
    password,
    options: {
      redirectTo: `${origin}/auth/callback?next=/dashboard`,
    },
  })

  if (error) {
    const message = error.message?.toLowerCase() ?? ''

    if (message.includes('already') || message.includes('registered')) {
      return NextResponse.json(
        { error: 'An account with this email already exists. Try signing in instead.' },
        { status: 409 }
      )
    }

    console.error('Signup link error:', error)
    return NextResponse.json(
      { error: 'Could not create account. Please try again later.' },
      { status: 500 }
    )
  }

  const confirmUrl = data.properties?.action_link

  if (!confirmUrl) {
    return NextResponse.json(
      { error: 'Could not generate confirmation link. Please try again later.' },
      { status: 500 }
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? 'IAO Today <onboarding@resend.dev>'

  const { error: resendError } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'Confirm your IAO Today account',
    text: `Welcome to IAO Today!\n\nConfirm your account to get started:\n\n${confirmUrl}\n\nIf you did not create this account, you can ignore this email.`,
  })

  if (resendError) {
    console.error('Resend signup confirmation error:', resendError)
    return NextResponse.json(
      { error: 'Account created, but the confirmation email could not be sent. Please use Forgot password to receive a link.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
