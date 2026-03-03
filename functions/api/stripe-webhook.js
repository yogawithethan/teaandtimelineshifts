// Cloudflare Pages Function — POST /api/stripe-webhook

import recordings from '../data/recordings.json'

export async function onRequestPost(context) {
  const { env, request } = context

  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')

  try {
    await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const event = JSON.parse(body)
  if (event.type === 'checkout.session.completed') {
    context.waitUntil(processRecordingPurchase(event.data.object, env))
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

async function verifyStripeSignature(body, sigHeader, secret) {
  const parts      = Object.fromEntries(sigHeader.split(',').map(p => p.split('=')))
  const { t: timestamp, v1: expectedSig } = parts
  if (!timestamp || !expectedSig) throw new Error('Invalid signature header')
  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) throw new Error('Timestamp out of range')

  const encoder = new TextEncoder()
  const key     = await crypto.subtle.importKey('raw', encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sigBytes    = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`))
  const computedSig = Array.from(new Uint8Array(sigBytes)).map(b => b.toString(16).padStart(2, '0')).join('')
  if (computedSig !== expectedSig) throw new Error('Signature mismatch')
}

async function processRecordingPurchase(session, env) {
  const email       = session.customer_details?.email
  const recordingId = session.metadata?.recording_id
  const recording   = recordings.find(r => r.id === recordingId)
  if (!email || !recording) return

  let subscriberId = null, currentOwned = ''
  const existing = await ckGet(`/subscribers?email_address=${encodeURIComponent(email)}`, env)
  if (existing.ok) {
    const sub = (await existing.json()).subscribers?.[0]
    if (sub) { subscriberId = sub.id; currentOwned = sub.fields?.['tts-recording_owned'] || '' }
  }

  const ownedSet = new Set(currentOwned.split(',').map(s => s.trim()).filter(Boolean))
  ownedSet.add(recordingId)

  const upsert = await ckPost('/subscribers', {
    email_address: email,
    fields: {
      'tts-recording_latest':   recordingId,
      'tts-recording_owned':    [...ownedSet].join(','),
      'tts-recording_password': recording.vimeoPassword,
    },
  }, env)
  if (upsert.ok) subscriberId ??= (await upsert.json()).subscriber?.id

  const tag = await ckPost(`/tags/${env.CONVERTKIT_TAG_PURCHASED_RECORDING}/subscribers`, { email_address: email }, env)
  if (tag.ok) subscriberId ??= (await tag.json()).subscriber?.id

  if (subscriberId) {
    await new Promise(r => setTimeout(r, 1000))
    await ckDelete(`/tags/${env.CONVERTKIT_TAG_PURCHASED_RECORDING}/subscribers/${subscriberId}`, env)
  }
}

const CK = 'https://api.convertkit.com/v4'
const ckHeaders = env => ({ Authorization: `Bearer ${env.CONVERTKIT_API_KEY}`, 'Content-Type': 'application/json' })
const ckGet    = (p, env)    => fetch(`${CK}${p}`, { headers: ckHeaders(env) })
const ckPost   = (p, b, env) => fetch(`${CK}${p}`, { method: 'POST',   headers: ckHeaders(env), body: JSON.stringify(b) })
const ckDelete = (p, env)    => fetch(`${CK}${p}`, { method: 'DELETE', headers: ckHeaders(env) })
