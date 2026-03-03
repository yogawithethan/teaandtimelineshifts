// Cloudflare Pages Function — POST /api/stripe-webhook

import recordings from '../data/recordings.json'

export async function onRequest(context) {
  const { env, request } = context

  // Only accept POST — return proper 405 with Allow header if not
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', {
      status: 405,
      headers: { Allow: 'POST' },
    })
  }

  const body = await request.text()
  const sig  = request.headers.get('stripe-signature')

  try {
    await verifyStripeSignature(body, sig, env.STRIPE_WEBHOOK_SECRET)
  } catch (err) {
    return new Response(`Webhook Error: ${err.message}`, { status: 400 })
  }

  const event = JSON.parse(body)
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object
    context.waitUntil(Promise.all([
      processRecordingPurchase(session, env),
      processRevenueShare(session, env),
    ]))
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  })
}

// ─── Revenue share ─────────────────────────────────────────────────────────────
// Transfers 40% of net revenue to Ash's connected Stripe account.
// Only runs for TTS products (identified by recording_id in metadata,
// or "timeline"/"tts" in the product name).

async function processRevenueShare(session, env) {
  const ashAccountId = env.STRIPE_ASH_ACCOUNT_ID
  if (!ashAccountId) {
    console.warn('[revenue-share] STRIPE_ASH_ACCOUNT_ID not configured — skipping')
    return
  }

  // Filter to TTS products only
  const isTTSProduct = isTTS(session, env)
  if (!isTTSProduct) {
    console.log(`[revenue-share] session ${session.id} is not a TTS product — skipping`)
    return
  }

  const grossAmount = session.amount_total   // cents
  const currency    = session.currency ?? 'usd'
  if (!grossAmount || grossAmount <= 0) {
    console.log(`[revenue-share] session ${session.id} has no payable amount — skipping`)
    return
  }

  // Fetch the actual net amount (after Stripe fees) from the balance transaction
  let netAmount = estimateNet(grossAmount)
  if (session.payment_intent) {
    try {
      const pi = await stripeGet(
        `/payment_intents/${session.payment_intent}?expand[]=latest_charge.balance_transaction`,
        env,
      )
      const bt = pi.latest_charge?.balance_transaction
      if (typeof bt?.net === 'number') netAmount = bt.net
    } catch (err) {
      console.warn(`[revenue-share] could not fetch balance transaction, using estimate: ${err.message}`)
    }
  }

  const ashAmount  = Math.round(netAmount * 0.40)
  const ttsAmount  = netAmount - ashAmount   // 60% stays (20% business + 40% Ethan)

  console.log(
    `[revenue-share] session=${session.id}` +
    ` gross=${grossAmount}¢ net=${netAmount}¢` +
    ` ash=${ashAmount}¢ (40%) tts=${ttsAmount}¢ (60%)`
  )

  try {
    const transfer = await stripePost('/transfers', {
      amount:           String(ashAmount),
      currency,
      destination:      ashAccountId,
      transfer_group:   session.id,
      'metadata[session_id]':      session.id,
      'metadata[payment_intent]':  session.payment_intent ?? '',
      'metadata[recording_id]':    session.metadata?.recording_id ?? '',
      'metadata[gross_cents]':     String(grossAmount),
      'metadata[net_cents]':       String(netAmount),
      'metadata[ash_pct]':         '40',
      'metadata[timestamp]':       new Date().toISOString(),
    }, env)

    console.log(
      `[revenue-share] transfer created: id=${transfer.id}` +
      ` amount=${transfer.amount}¢ destination=${transfer.destination}` +
      ` session=${session.id} payment_intent=${session.payment_intent}` +
      ` timestamp=${new Date().toISOString()}`
    )
  } catch (err) {
    console.error(`[revenue-share] transfer FAILED session=${session.id}: ${err.message}`)
  }
}

// A product is a TTS product if it has recording_id metadata (set by our checkout)
// or if the product name contains "timeline" or "tts" (case-insensitive).
function isTTS(session) {
  if (session.metadata?.recording_id) return true
  const name = (session.metadata?.product_name ?? '').toLowerCase()
  return name.includes('timeline') || name.includes('tts')
}

// Stripe standard card fee estimate: 2.9% + $0.30
function estimateNet(grossCents) {
  return Math.round(grossCents * (1 - 0.029)) - 30
}

// ─── Recording purchase (ConvertKit) ──────────────────────────────────────────

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

// ─── Stripe REST helpers ───────────────────────────────────────────────────────

const STRIPE = 'https://api.stripe.com/v1'

const stripeHeaders = env => ({
  Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`,
  'Content-Type': 'application/x-www-form-urlencoded',
})

async function stripeGet(path, env) {
  const res  = await fetch(`${STRIPE}${path}`, { headers: stripeHeaders(env) })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error?.message ?? `Stripe GET ${res.status}`)
  return body
}

async function stripePost(path, params, env) {
  const res  = await fetch(`${STRIPE}${path}`, {
    method:  'POST',
    headers: stripeHeaders(env),
    body:    new URLSearchParams(params).toString(),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error?.message ?? `Stripe POST ${res.status}`)
  return body
}

// ─── ConvertKit REST helpers ───────────────────────────────────────────────────

const CK = 'https://api.convertkit.com/v4'
const ckHeaders = env => ({ Authorization: `Bearer ${env.CONVERTKIT_API_KEY}`, 'Content-Type': 'application/json' })
const ckGet    = (p, env)    => fetch(`${CK}${p}`, { headers: ckHeaders(env) })
const ckPost   = (p, b, env) => fetch(`${CK}${p}`, { method: 'POST',   headers: ckHeaders(env), body: JSON.stringify(b) })
const ckDelete = (p, env)    => fetch(`${CK}${p}`, { method: 'DELETE', headers: ckHeaders(env) })

// ─── Signature verification ────────────────────────────────────────────────────

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
