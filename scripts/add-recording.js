#!/usr/bin/env node
// Add a new recording: creates Stripe product + price + payment link,
// then writes both recordings.json files automatically.
//
// Run: node scripts/add-recording.js
// Needs STRIPE_SECRET_KEY in .env at project root.

import { readFileSync, writeFileSync, existsSync } from 'fs'
import { createInterface } from 'readline'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// ─── .env loader ──────────────────────────────────────────────────────────────

const envFile = join(ROOT, '.env')
if (existsSync(envFile)) {
  for (const line of readFileSync(envFile, 'utf-8').split('\n')) {
    const m = line.match(/^([A-Z_][A-Z0-9_]*)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]])
      process.env[m[1]] = m[2].replace(/^["']|["']$/g, '').trim()
  }
}

const STRIPE_KEY = process.env.STRIPE_SECRET_KEY
if (!STRIPE_KEY) {
  console.error('\nSTRIPE_SECRET_KEY not set. Add it to .env:\n  STRIPE_SECRET_KEY=sk_live_...\n')
  process.exit(1)
}

// ─── Prompt helper ────────────────────────────────────────────────────────────

const rl = createInterface({ input: process.stdin, output: process.stdout })
const ask = (label, hint) => new Promise(res =>
  rl.question(hint ? `${label} [${hint}]: ` : `${label}: `, a => res(a.trim()))
)
const askOr = (label, fallback) => ask(label, fallback).then(v => v || fallback)

// ─── Stripe helpers ───────────────────────────────────────────────────────────

async function stripe(path, params) {
  const res  = await fetch(`https://api.stripe.com/v1${path}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${STRIPE_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams(params).toString(),
  })
  const body = await res.json()
  if (!res.ok) throw new Error(body.error?.message ?? `Stripe error ${res.status} on ${path}`)
  return body
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log('\n── Add Recording ──────────────────────────────────────────────\n')

const id       = await ask('ID (slug, e.g. round-2)')
const title    = await ask('Title (e.g. Round 2 — Spring Circle)')
const date     = await ask('Date (e.g. April 5, 2026)')
const duration = await ask('Duration (e.g. 90 min)')
const note     = await ask('Short description (optional)')
const vimeoUrl = await ask('Vimeo URL')
const vimeoPassword = await ask('Vimeo password')
const priceRaw = await askOr('Price in USD', '33')
rl.close()

const price = parseFloat(priceRaw)
if (!id || !title || !vimeoUrl || !vimeoPassword || isNaN(price)) {
  console.error('\nMissing required fields.\n'); process.exit(1)
}

// Check for duplicate
const srcPath      = join(ROOT, 'src/data/recordings.json')
const fnPath       = join(ROOT, 'functions/data/recordings.json')
const existing     = JSON.parse(readFileSync(srcPath, 'utf-8'))
if (existing.find(r => r.id === id)) {
  console.error(`\nRecording "${id}" already exists.\n`); process.exit(1)
}

console.log()

process.stdout.write('Creating Stripe product…    ')
const product = await stripe('/products', { name: title, 'metadata[recording_id]': id })
console.log(`✓  ${product.id}`)

process.stdout.write('Creating Stripe price…      ')
const stripePrice = await stripe('/prices', {
  product: product.id, unit_amount: String(Math.round(price * 100)), currency: 'usd',
})
console.log(`✓  ${stripePrice.id}`)

process.stdout.write('Creating Stripe payment link… ')
const link = await stripe('/payment_links', {
  'line_items[0][price]':    stripePrice.id,
  'line_items[0][quantity]': '1',
  'metadata[recording_id]':  id,
})
console.log(`✓  ${link.url}`)

const entry = {
  id, title, date,
  ...(duration && { duration }),
  ...(note     && { note }),
  vimeoUrl,
  vimeoPassword,
  stripeProductId:   product.id,
  stripePriceId:     stripePrice.id,
  stripePaymentLink: link.url,
  price,
  available: true,
}

for (const p of [srcPath, fnPath]) {
  const recs = JSON.parse(readFileSync(p, 'utf-8'))
  recs.push(entry)
  writeFileSync(p, JSON.stringify(recs, null, 2) + '\n')
  console.log(`Updated ${p.replace(ROOT + '/', '')}`)
}

console.log(`
  Title:        ${title}
  Payment link: ${link.url}

Push to deploy and you're done.
`)
