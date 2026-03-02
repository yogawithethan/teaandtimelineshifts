// Cloudflare Pages Function — POST /api/stripe-webhook
// Verifies Stripe signature using SubtleCrypto (no SDK needed).
// On checkout.session.completed: updates ConvertKit subscriber fields and tags.
//
// Required env vars:
//   STRIPE_SECRET_KEY                  — sk_live_… or sk_test_…
//   STRIPE_WEBHOOK_SECRET              — whsec_… from Stripe webhook settings
//   CONVERTKIT_API_KEY                 — Bearer token from ConvertKit account settings
//   CONVERTKIT_TAG_PURCHASED_RECORDING — numeric tag ID for "tts-purchased_recording"

import recordings from '../../src/data/recordings.json'

export async function onRequestPost(context) {
  const { env, request } = context

  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')

  try {
    await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    console.error('Webhook signature failed:', err.message)
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

// ─── Stripe HMAC-SHA256 verification (SubtleCrypto) ──────────────────────────

async function verifyStripeSignature(body, sigHeader, secret) {
  const parts = Object.fromEntries(
    sigHeader.split(',').map(p => p.split('=')),
  )
  const { t: timestamp, v1: expectedSig } = parts
  if (!timestamp || !expectedSig) throw new Error('Invalid signature header')

  if (Math.abs(Date.now() / 1000 - parseInt(timestamp)) > 300) {
    throw new Error('Timestamp outside tolerance window')
  }

  const encoder  = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sigBytes   = await crypto.subtle.sign('HMAC', key, encoder.encode(`${timestamp}.${body}`))
  const computedSig = Array.from(new Uint8Array(sigBytes))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')

  if (computedSig !== expectedSig) throw new Error('Signature mismatch')
}

// ─── Purchase processing ──────────────────────────────────────────────────────

async function processRecordingPurchase(session, env) {
  const email = session.customer_details?.email
  if (!email) { console.error('No customer email'); return }

  const recordingId = session.metadata?.recording_id
  const recording   = recordings.find(r => r.id === recordingId)
  if (!recording) { console.error(`Unknown recording_id "${recordingId}"`); return }

  // Fetch current subscriber to build the updated owned list
  let subscriberId = null
  let currentOwned = ''
  const existing = await ckGet(`/subscribers?email_address=${encodeURIComponent(email)}`, env)
  if (existing.ok) {
    const data = await existing.json()
    const sub  = data.subscribers?.[0]
    if (sub) { subscriberId = sub.id; currentOwned = sub.fields?.['tts-recording_owned'] || '' }
  }

  const ownedSet = new Set(currentOwned.split(',').map(s => s.trim()).filter(Boolean))
  ownedSet.add(recordingId)

  const upsertRes = await ckPost('/subscribers', {
    email_address: email,
    fields: {
      'tts-recording_latest':  recordingId,
      'tts-recording_owned':   [...ownedSet].join(','),
      'tts-recording_password': recording.vimeoPassword,
    },
  }, env)

  if (!upsertRes.ok) { console.error('ConvertKit upsert failed:', await upsertRes.text()); return }
  const upsertData = await upsertRes.json()
  subscriberId ??= upsertData.subscriber?.id

  const tagRes = await ckPost(
    `/tags/${env.CONVERTKIT_TAG_PURCHASED_RECORDING}/subscribers`,
    { email_address: email },
    env,
  )
  if (tagRes.ok) { subscriberId ??= (await tagRes.json()).subscriber?.id }
  else { console.error('ConvertKit tag failed:', await tagRes.text()) }

  if (subscriberId) {
    await new Promise(r => setTimeout(r, 1000))
    await ckDelete(`/tags/${env.CONVERTKIT_TAG_PURCHASED_RECORDING}/subscribers/${subscriberId}`, env)
  }
}

// ─── ConvertKit v4 helpers ────────────────────────────────────────────────────

const CK = 'https://api.convertkit.com/v4'

function ckHeaders(env) {
  return { Authorization: `Bearer ${env.CONVERTKIT_API_KEY}`, 'Content-Type': 'application/json' }
}
const ckGet    = (path, env)       => fetch(`${CK}${path}`, { headers: ckHeaders(env) })
const ckPost   = (path, body, env) => fetch(`${CK}${path}`, { method: 'POST',   headers: ckHeaders(env), body: JSON.stringify(body) })
const ckDelete = (path, env)       => fetch(`${CK}${path}`, { method: 'DELETE', headers: ckHeaders(env) })
