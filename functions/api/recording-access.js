// Cloudflare Pages Function — GET /api/recording-access?session_id=...
// Verifies a paid Stripe Checkout session and returns recording details.
// Uses Stripe REST API directly (no SDK).
//
// Required env vars: STRIPE_SECRET_KEY

import recordings from '../../src/data/recordings.json'

export async function onRequestGet(context) {
  const { env, request } = context

  const sessionId = new URL(request.url).searchParams.get('session_id')
  if (!sessionId) {
    return json({ error: 'Missing session_id.' }, 400)
  }

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe key not configured.' }, 500)
  }

  try {
    const res = await fetch(
      `https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`,
      { headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` } },
    )

    const session = await res.json()
    if (!res.ok) {
      console.error('Stripe error:', session.error?.message)
      return json({ error: 'Could not verify session.' }, 500)
    }

    if (session.payment_status !== 'paid') {
      return json({ error: 'Payment not completed.' }, 402)
    }

    const recordingId = session.metadata?.recording_id
    const recording = recordings.find(r => r.id === recordingId)
    if (!recording) {
      return json({ error: 'Recording not found.' }, 404)
    }

    return json({
      recording: {
        id: recording.id,
        title: recording.title,
        date: recording.date,
        duration: recording.duration,
        note: recording.note,
        vimeoUrl: recording.vimeoUrl,
        vimeoPassword: recording.vimeoPassword,
      },
      email: session.customer_details?.email ?? null,
    })
  } catch (err) {
    console.error('Fetch error:', err.message)
    return json({ error: 'Could not verify session.' }, 500)
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
