// Cloudflare Pages Function — POST /api/check-access

import recordings from '../data/recordings.json'

export async function onRequest(context) {
  const { env, request } = context

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405)
  }

  let email
  try {
    ;({ email } = await request.json())
  } catch {
    return json({ error: 'Invalid request body.' }, 400)
  }

  if (!email || !email.includes('@')) return json({ error: 'Valid email required.' }, 400)

  const ckRes = await fetch(
    `https://api.convertkit.com/v4/subscribers?email_address=${encodeURIComponent(email)}`,
    { headers: { Authorization: `Bearer ${env.CONVERTKIT_API_KEY}` } },
  )

  if (!ckRes.ok) return json({ error: 'Could not look up access.' }, 500)

  const data       = await ckRes.json()
  const subscriber = data.subscribers?.[0]
  if (!subscriber) return json({ recordings: [] })

  const ownedIds = (subscriber.fields?.['tts-recording_owned'] || '')
    .split(',').map(s => s.trim()).filter(Boolean)

  const ownedRecordings = ownedIds
    .map(id => recordings.find(r => r.id === id))
    .filter(Boolean)
    .map(r => ({
      id: r.id, title: r.title, date: r.date, duration: r.duration,
      note: r.note, vimeoUrl: r.vimeoUrl, vimeoPassword: r.vimeoPassword,
    }))

  return json({ recordings: ownedRecordings })
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  })
}
