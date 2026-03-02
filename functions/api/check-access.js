// Cloudflare Pages Function — POST /api/check-access
// Accepts { email } in the request body, queries ConvertKit for the
// subscriber's tts-recording_owned field, and returns full recording details
// so the frontend can restore access on a new device.
//
// Required environment variables:
//   CONVERTKIT_API_KEY — Bearer token from ConvertKit account settings

import recordings from '../../src/data/recordings.json'

export async function onRequestPost(context) {
  const { env, request } = context

  let email
  try {
    ;({ email } = await request.json())
  } catch {
    return jsonResponse({ error: 'Invalid request body.' }, 400)
  }

  if (!email || !email.includes('@')) {
    return jsonResponse({ error: 'Valid email required.' }, 400)
  }

  const ckRes = await fetch(
    `https://api.convertkit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${env.CONVERTKIT_API_KEY}` } },
  )

  if (!ckRes.ok) {
    console.error('ConvertKit lookup failed:', await ckRes.text())
    return jsonResponse({ error: 'Could not look up access.' }, 500)
  }

  const data = await ckRes.json()
  const subscriber = data.subscribers?.[0]

  if (!subscriber) {
    return jsonResponse({ recordings: [] })
  }

  const owned = subscriber.fields?.['tts-recording_owned'] || ''
  const ownedIds = owned.split(',').map(s => s.trim()).filter(Boolean)

  const ownedRecordings = ownedIds
    .map(id => recordings.find(r => r.id === id))
    .filter(Boolean)
    .map(r => ({
      id: r.id,
      title: r.title,
      date: r.date,
      duration: r.duration,
      note: r.note,
      vimeoUrl: r.vimeoUrl,
      vimeoPassword: r.vimeoPassword,
    }))

  return jsonResponse({ recordings: ownedRecordings })
}

function jsonResponse(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
