// Cloudflare Pages Function — GET /api/recording-access?session_id=...

import recordings from '../data/recordings.json'

export async function onRequest(context) {
  const { env, request } = context

  if (request.method !== 'GET') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  const sessionId = new URL(request.url).searchParams.get('session_id')
  if (!sessionId) return json({ error: 'Missing session_id.' }, 400)
  if (!env.STRIPE_SECRET_KEY) return json({ error: 'Stripe key not configured.' }, 500)

  try {
    const res     = await fetch(`https://api.stripe.com/v1/checkout/sessions/${encodeURIComponent(sessionId)}`, {
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}` },
    })
    const session = await res.json()
    if (!res.ok) return json({ error: 'Could not verify session.' }, 500)
    if (session.payment_status !== 'paid') return json({ error: 'Payment not completed.' }, 402)

    const recording = recordings.find(r => r.id === session.metadata?.recording_id)
    if (!recording) return json({ error: 'Recording not found.' }, 404)

    return json({
      recording: {
        id: recording.id, title: recording.title, date: recording.date,
        duration: recording.duration, note: recording.note,
        vimeoUrl: recording.vimeoUrl, vimeoPassword: recording.vimeoPassword,
      },
      email: session.customer_details?.email ?? null,
    })
  } catch (err) {
    return json({ error: 'Could not verify session.' }, 500)
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
