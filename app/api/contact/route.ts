import { Resend } from 'resend'
import { NextResponse } from 'next/server'

type ContactPayload = {
  name?: string
  email?: string
  message?: string
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: Request) {
  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      { error: 'Email is not configured.' },
      { status: 500 }
    )
  }

  const toEmail = process.env.CONTACT_TO_EMAIL
  const fromEmail =
    process.env.RESEND_FROM_EMAIL ?? 'IAO Today <onboarding@resend.dev>'

  if (!toEmail) {
    return NextResponse.json(
      { error: 'Contact recipient is not configured.' },
      { status: 500 }
    )
  }

  let body: ContactPayload

  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const name = body.name?.trim() ?? ''
  const email = body.email?.trim() ?? ''
  const message = body.message?.trim() ?? ''

  if (!name || !email || !message) {
    return NextResponse.json(
      { error: 'Please fill in all fields.' },
      { status: 400 }
    )
  }

  if (!isValidEmail(email)) {
    return NextResponse.json(
      { error: 'Please enter a valid email address.' },
      { status: 400 }
    )
  }

  if (message.length > 5000) {
    return NextResponse.json(
      { error: 'Message is too long.' },
      { status: 400 }
    )
  }

  const resend = new Resend(process.env.RESEND_API_KEY)

  const { error } = await resend.emails.send({
    from: fromEmail,
    to: [toEmail],
    replyTo: email,
    subject: `Contact from ${name}`,
    text: `${message}\n\n— ${name} (${email})`,
  })

  if (error) {
    console.error('Resend contact error:', error)

    const resendMessage = 'message' in error ? String(error.message) : ''

    if (resendMessage.includes('your own email address')) {
      return NextResponse.json(
        {
          error:
            'Email is not fully set up yet. The site owner needs to verify a domain in Resend, or set CONTACT_TO_EMAIL to their Resend account email.',
        },
        { status: 500 }
      )
    }

    return NextResponse.json(
      {
        error:
          process.env.NODE_ENV === 'development' && resendMessage
            ? resendMessage
            : 'Could not send message. Please try again later.',
      },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
