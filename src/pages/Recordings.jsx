import { useState, useEffect, useRef } from 'react'
import { usePalette } from '../context/PaletteContext'
import recordingsData from '../data/recordings.json'

// ─── Storage helpers ──────────────────────────────────────────────────────────

const STORAGE_KEY = 'tts_recordings'

function readOwned() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]') } catch { return [] }
}

function mergeIntoStorage(incoming) {
  const existing = readOwned()
  const map = Object.fromEntries(existing.map(r => [r.id, r]))
  for (const r of incoming) map[r.id] = r
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.values(map))) } catch { /* */ }
}

// ─── Vimeo helper ─────────────────────────────────────────────────────────────

// Supports vimeo.com/ID or vimeo.com/ID/HASH (unlisted)
function vimeoEmbedUrl(url) {
  const m = url?.match(/vimeo\.com\/(\d+)(?:\/(\w+))?/)
  if (!m) return null
  const params = 'badge=0&autopause=0&player_id=0&app_id=58479&dnt=1'
  return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}&${params}` : `?${params}`}`
}

// ─── Password copy ────────────────────────────────────────────────────────────

function PasswordRow({ password, pal }) {
  const [copied, setCopied] = useState(false)
  function copy() {
    navigator.clipboard.writeText(password).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      gap: 12,
      padding: '11px 16px',
      borderTop: `1px solid ${pal.border}`,
      transition: 'border-color 0.8s',
    }}>
      <span style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.12em',
        textTransform: 'uppercase',
        color: pal.textFaint,
        flexShrink: 0,
        transition: 'color 0.8s',
      }}>Password</span>
      <code style={{
        fontSize: 12,
        color: pal.textMain,
        letterSpacing: '0.06em',
        flex: 1,
        transition: 'color 0.8s',
      }}>{password}</code>
      <button onClick={copy} style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: copied ? pal.accent : pal.textFaint,
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        flexShrink: 0,
        transition: 'color 0.3s',
      }}>{copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}

// ─── Recording card ───────────────────────────────────────────────────────────

function RecordingCard({ recording, ownedData, isWatching, onWatch, pal }) {
  const [thumbnail, setThumbnail] = useState(null)

  // Attempt to load Vimeo thumbnail via oEmbed (works for public videos)
  useEffect(() => {
    const videoId = recording.vimeoUrl?.match(/vimeo\.com\/(\d+)/)?.[1]
    if (!videoId) return
    fetch(`https://vimeo.com/api/oembed.json?url=https://vimeo.com/${videoId}&width=640`)
      .then(r => r.ok ? r.json() : null)
      .then(data => { if (data?.thumbnail_url) setThumbnail(data.thumbnail_url) })
      .catch(() => { /* use gradient fallback */ })
  }, [recording.vimeoUrl])

  function handlePurchase() {
    window.open(recording.stripePaymentLink, '_blank', 'noopener')
  }

  const embedUrl = ownedData ? vimeoEmbedUrl(ownedData.vimeoUrl) : null

  return (
    <article style={{
      borderRadius: 20,
      overflow: 'hidden',
      background: pal.glass,
      backdropFilter: 'blur(14px)',
      WebkitBackdropFilter: 'blur(14px)',
      border: `1px solid ${pal.border}`,
      boxShadow: `0 4px 32px ${pal.shadow}`,
      transition: 'background 0.8s, border-color 0.8s, box-shadow 0.8s',
    }}>

      {/* Vimeo embed — visible when watching */}
      {isWatching && embedUrl ? (
        <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: 'rgba(0,0,0,0.1)' }}>
          <iframe
            src={embedUrl}
            style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
            allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
            title={recording.title}
            allowFullScreen
          />
        </div>
      ) : (
        /* Preview thumbnail — shown when not watching */
        <div style={{
          position: 'relative',
          height: 180,
          overflow: 'hidden',
          background: thumbnail
            ? `url(${thumbnail}) center/cover no-repeat`
            : `linear-gradient(135deg, ${pal.bg?.[0] ?? pal.glass} 0%, ${pal.bg?.[1] ?? pal.glass} 100%)`,
          transition: 'background 0.8s',
        }}>
          {/* Gradient overlay so text stays legible over any thumbnail */}
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.08) 0%, rgba(0,0,0,0.45) 100%)',
          }} />
          {/* Session label */}
          <div style={{
            position: 'absolute',
            bottom: 16,
            left: 20,
            right: 20,
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}>
            <span style={{
              fontSize: 9,
              fontWeight: 500,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.75)',
              background: 'rgba(0,0,0,0.25)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              borderRadius: 20,
              padding: '4px 10px',
            }}>Recording</span>
          </div>
        </div>
      )}

      {/* Meta */}
      <div style={{ padding: '22px 26px 24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.16em',
              textTransform: 'uppercase',
              color: pal.accent,
              marginBottom: 8,
              transition: 'color 0.8s',
            }}>Tea & Timeline Shifts</p>

            <h2 style={{
              fontFamily: "'Livvic', sans-serif",
              fontSize: 18,
              fontWeight: 700,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              color: pal.textMain,
              marginBottom: 8,
              transition: 'color 0.8s',
            }}>{recording.title}</h2>

            {recording.note && (
              <p style={{
                fontSize: 12,
                fontWeight: 300,
                color: pal.textSoft,
                lineHeight: 1.65,
                marginBottom: 14,
                transition: 'color 0.8s',
              }}>{recording.note}</p>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 11, color: pal.textSoft, transition: 'color 0.8s' }}>{recording.date}</span>
              {recording.duration && (
                <>
                  <span style={{ fontSize: 10, color: pal.textFaint, transition: 'color 0.8s' }}>·</span>
                  <span style={{
                    fontSize: 10,
                    fontWeight: 500,
                    letterSpacing: '0.1em',
                    textTransform: 'uppercase',
                    color: pal.textFaint,
                    border: `1px solid ${pal.border}`,
                    padding: '3px 10px',
                    borderRadius: 20,
                    transition: 'color 0.8s, border-color 0.8s',
                  }}>{recording.duration}</span>
                </>
              )}
            </div>
          </div>

          {/* Watch / Close — right side, only when owned */}
          {ownedData && (
            <div style={{ flexShrink: 0, paddingTop: 2 }}>
              <button
                onClick={() => onWatch(recording.id)}
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  letterSpacing: '0.12em',
                  textTransform: 'uppercase',
                  color: isWatching ? pal.textFaint : pal.accent,
                  background: 'none',
                  border: `1px solid ${isWatching ? pal.border : pal.accent}`,
                  borderRadius: 40,
                  padding: '8px 16px',
                  cursor: 'pointer',
                  transition: 'color 0.3s, border-color 0.3s',
                }}
              >{isWatching ? 'Close' : 'Watch'}</button>
            </div>
          )}
        </div>

        {/* Purchase — standalone full-width CTA below meta, only when not owned */}
        {!ownedData && (
          <div style={{ marginTop: 20 }}>
            <button
              onClick={handlePurchase}
              style={{
                width: '100%',
                height: 48,
                fontSize: 11,
                fontWeight: 500,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: '#fff',
                background: pal.cta,
                border: 'none',
                borderRadius: 24,
                cursor: 'pointer',
                transition: 'background 0.8s',
              }}
            >{`Purchase — $${recording.price}`}</button>
          </div>
        )}
      </div>

      {/* Password row — shown when watching */}
      {isWatching && ownedData?.vimeoPassword && (
        <PasswordRow password={ownedData.vimeoPassword} pal={pal} />
      )}
    </article>
  )
}

// ─── Email access check ───────────────────────────────────────────────────────

function AccessCheck({ onFound, pal }) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState(null) // null | 'loading' | 'found' | 'not-found' | 'error'
  const inputRef = useRef(null)

  async function handleCheck(e) {
    e.preventDefault()
    const trimmed = email.trim()
    if (!trimmed) return
    setStatus('loading')
    try {
      const res = await fetch('/api/check-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: trimmed }),
      })
      const data = await res.json()
      if (data.error) throw new Error(data.error)
      if (data.recordings?.length > 0) {
        mergeIntoStorage(data.recordings)
        onFound(data.recordings)
        setStatus('found')
      } else {
        setStatus('not-found')
      }
    } catch {
      setStatus('error')
    }
  }

  const statusText = {
    'found': 'Access restored. Your recordings are now unlocked above.',
    'not-found': 'No purchases found for that email.',
    'error': 'Something went wrong. Please try again.',
  }[status]

  return (
    <div style={{ textAlign: 'center', paddingTop: 60 }}>
      <div style={{
        width: 36,
        height: 1,
        background: pal.border,
        margin: '0 auto 32px',
        transition: 'background 0.8s',
      }} />

      <p style={{
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.18em',
        textTransform: 'uppercase',
        color: pal.textFaint,
        marginBottom: 10,
        transition: 'color 0.8s',
      }}>On a new device?</p>

      <p style={{
        fontSize: 13,
        fontWeight: 300,
        color: pal.textSoft,
        lineHeight: 1.75,
        marginBottom: 22,
        transition: 'color 0.8s',
      }}>Enter your email to restore access to recordings you've purchased.</p>

      <form onSubmit={handleCheck} style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <input
          ref={inputRef}
          type="email"
          value={email}
          onChange={e => { setEmail(e.target.value); setStatus(null) }}
          placeholder="your@email.com"
          style={{
            fontSize: 13,
            fontWeight: 300,
            color: pal.textMain,
            background: pal.glass,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${pal.border}`,
            borderRadius: 40,
            padding: '10px 18px',
            outline: 'none',
            width: 240,
            transition: 'color 0.8s, background 0.8s, border-color 0.8s',
          }}
        />
        <button
          type="submit"
          disabled={status === 'loading'}
          style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: pal.textMain,
            background: pal.glass,
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: `1px solid ${pal.border}`,
            borderRadius: 40,
            padding: '10px 20px',
            cursor: status === 'loading' ? 'default' : 'pointer',
            opacity: status === 'loading' ? 0.6 : 1,
            transition: 'opacity 0.3s, background 0.8s, border-color 0.8s, color 0.8s',
          }}
        >{status === 'loading' ? 'Checking…' : 'Check Access'}</button>
      </form>

      {statusText && (
        <p style={{
          marginTop: 16,
          fontSize: 12,
          fontWeight: 300,
          color: status === 'found' ? pal.accent : pal.textFaint,
          transition: 'color 0.8s',
        }}>{statusText}</p>
      )}
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function Recordings() {
  const { pal } = usePalette()
  const [ownedMap, setOwnedMap] = useState({})   // { 'round-1': { id, title, vimeoUrl, vimeoPassword, … } }
  const [watching, setWatching] = useState(null)  // recording id currently expanded

  const available = recordingsData.filter(r => r.available)
  const single = available.length === 1

  // Load owned recordings from localStorage on mount
  useEffect(() => {
    const stored = readOwned()
    const map = {}
    for (const r of stored) map[r.id] = r
    setOwnedMap(map)
  }, [])

  function toggleWatch(id) {
    setWatching(prev => (prev === id ? null : id))
  }

  function handleAccessFound(recordings) {
    setOwnedMap(prev => {
      const next = { ...prev }
      for (const r of recordings) next[r.id] = r
      return next
    })
  }

  return (
    <div style={{
      maxWidth: single ? 740 : 920,
      margin: '0 auto',
      padding: '160px 24px 100px',
      transition: 'max-width 0.4s',
    }}>

      {/* Header */}
      <header style={{ textAlign: 'center', marginBottom: 60 }}>
        <p style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.2em',
          textTransform: 'uppercase',
          color: pal.accent,
          marginBottom: 14,
          transition: 'color 0.8s',
        }}>Archive</p>

        <h1 style={{
          fontFamily: "'Livvic', sans-serif",
          fontSize: 32,
          fontWeight: 700,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: pal.textMain,
          marginBottom: 20,
          transition: 'color 0.8s',
        }}>Recordings</h1>

        <div style={{
          width: 36,
          height: 1,
          background: pal.border,
          margin: '0 auto 20px',
          transition: 'background 0.8s',
        }} />

        <p style={{
          fontSize: 13,
          fontWeight: 300,
          color: pal.textSoft,
          lineHeight: 1.75,
          maxWidth: 380,
          margin: '0 auto',
          transition: 'color 0.8s',
        }}>
          Past sessions, available to revisit at your own pace.
        </p>
      </header>

      {/* Recording cards */}
      {available.length > 0 ? (
        <div style={{
          display: 'grid',
          gridTemplateColumns: single ? '1fr' : 'repeat(auto-fill, minmax(380px, 1fr))',
          gap: 24,
        }}>
          {available.map(r => (
            <RecordingCard
              key={r.id}
              recording={r}
              ownedData={ownedMap[r.id] ?? null}
              isWatching={watching === r.id}
              onWatch={toggleWatch}
              pal={pal}
            />
          ))}
        </div>
      ) : (
        <p style={{
          textAlign: 'center',
          fontSize: 13,
          fontWeight: 300,
          color: pal.textFaint,
          letterSpacing: '0.04em',
          lineHeight: 1.7,
          transition: 'color 0.8s',
        }}>Recordings will appear here after each session.</p>
      )}

      {/* TODO: Bundle option — "Buy all recordings" */}

      {/* Email access check */}
      <AccessCheck onFound={handleAccessFound} pal={pal} />
    </div>
  )
}
