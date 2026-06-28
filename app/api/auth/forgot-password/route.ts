import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

type ForgotPasswordPayload = {
  email?: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json({ error: 'Email is not configured.' }, { status: 500 })
  }

  let body: ForgotPasswordPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const email = body.email?.trim().toLowerCase() ?? ''

  if (!isValidEmail(email)) {
    return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 })
  }

  const { origin } = new URL(request.url)
  const supabase = createAdminClient()
  const { data, error } = await supabase.auth.admin.generateLink({
    type: 'recovery',
    email,
    options: {
      redirectTo: `${origin}/auth/callback?next=/reset-password`,
    },
  })

  // Do not reveal whether an email exists.
  if (error) {
    console.error('Password reset link error:', error)
    return NextResponse.json({ success: true })
  }

  const resetUrl = data.properties?.action_link

  if (!resetUrl) {
    return NextResponse.json({ success: true })
  }

  const resend = new Resend(process.env.RESEND_API_KEY)
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? 'IAO Today <onboarding@resend.dev>'

  const { error: resendError } = await resend.emails.send({
    from: fromEmail,
    to: [email],
    subject: 'Reset your Love Siargao password',
    text: `Reset your Love Siargao password:\n\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
  })

  if (resendError) {
    console.error('Resend password reset error:', resendError)
    return NextResponse.json(
      { error: 'Could not send reset email. Please try again later.' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
