// Cloudflare Pages Function — POST /api/create-checkout

import recordings from '../data/recordings.json'

export async function onRequestPost(context) {
  const { env, request } = context

  if (!env.STRIPE_SECRET_KEY) {
    return json({ error: 'Stripe key not configured.' }, 500)
  }

  let recordingId
  try {
    ;({ recordingId } = await request.json())
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  const recording = recordings.find(r => r.id === recordingId && r.available)
  if (!recording) {
    return json({ error: 'Recording not found.' }, 404)
  }

  const origin  = new URL(request.url).origin
  const siteUrl = env.SITE_URL || origin

  const params = new URLSearchParams()
  params.set('mode', 'payment')
  params.set('metadata[recording_id]', recording.id)
  params.set('success_url', `${siteUrl}/recordings/success?session_id={CHECKOUT_SESSION_ID}`)
  params.set('cancel_url', `${siteUrl}/recordings`)
  params.append('payment_method_types[]', 'card')

  const hasRealPrice = recording.stripePriceId && !recording.stripePriceId.startsWith('INSERT')
  if (hasRealPrice) {
    params.set('line_items[0][price]', recording.stripePriceId)
    params.set('line_items[0][quantity]', '1')
  } else {
    params.set('line_items[0][price_data][currency]', 'usd')
    params.set('line_items[0][price_data][unit_amount]', String(Math.round(recording.price * 100)))
    params.set('line_items[0][price_data][product_data][name]', recording.title)
    params.set('line_items[0][quantity]', '1')
  }

  try {
    const res  = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    })
    const data = await res.json()
    if (!res.ok) return json({ error: data.error?.message || 'Stripe error.' }, 500)
    return json({ url: data.url })
  } catch (err) {
    return json({ error: err.message || 'Could not create checkout session.' }, 500)
  }
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
