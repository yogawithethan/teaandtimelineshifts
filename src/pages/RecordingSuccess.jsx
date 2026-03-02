import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { usePalette } from '../context/PaletteContext'

const STORAGE_KEY = 'tts_recordings'

// Parse vimeo.com/ID or vimeo.com/ID/HASH → embed URL
function vimeoEmbedUrl(url) {
  const m = url?.match(/vimeo\.com\/(\d+)(?:\/(\w+))?/)
  if (!m) return null
  const params = 'badge=0&autopause=0&player_id=0&app_id=58479&dnt=1'
  return `https://player.vimeo.com/video/${m[1]}${m[2] ? `?h=${m[2]}&${params}` : `?${params}`}`
}

function saveToStorage(recording) {
  try {
    const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]')
    const filtered = existing.filter(r => r.id !== recording.id)
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...filtered, recording]))
  } catch { /* localStorage unavailable */ }
}

// ─── Password display ─────────────────────────────────────────────────────────

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
      padding: '14px 20px',
      borderRadius: 10,
      background: pal.glass,
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      border: `1px solid ${pal.border}`,
      transition: 'background 0.8s, border-color 0.8s',
    }}>
      <span style={{
        fontSize: 11,
        fontWeight: 500,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        color: pal.textFaint,
        transition: 'color 0.8s',
        flexShrink: 0,
      }}>Password</span>
      <code style={{
        fontSize: 13,
        color: pal.textMain,
        letterSpacing: '0.08em',
        flex: 1,
        transition: 'color 0.8s',
      }}>{password}</code>
      <button
        onClick={copy}
        style={{
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
        }}
      >{copied ? 'Copied' : 'Copy'}</button>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RecordingSuccess() {
  const { pal } = usePalette()
  const [searchParams] = useSearchParams()
  const sessionId = searchParams.get('session_id')

  const [status, setStatus] = useState('loading') // loading | success | error
  const [recording, setRecording] = useState(null)

  useEffect(() => {
    if (!sessionId) {
      setStatus('error')
      return
    }

    fetch(`/api/recording-access?session_id=${encodeURIComponent(sessionId)}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error)
        setRecording(data.recording)
        saveToStorage(data.recording)
        setStatus('success')
      })
      .catch(err => {
        console.error('recording-access error:', err)
        setStatus('error')
      })
  }, [sessionId])

  return (
    <div style={{
      maxWidth: 740,
      margin: '0 auto',
      padding: '160px 24px 100px',
    }}>

      {status === 'loading' && (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <p style={{
            fontSize: 12,
            fontWeight: 300,
            letterSpacing: '0.08em',
            color: pal.textSoft,
            transition: 'color 0.8s',
          }}>Verifying your purchase…</p>
        </div>
      )}

      {status === 'error' && (
        <div style={{ textAlign: 'center', paddingTop: 60 }}>
          <p style={{
            fontSize: 10,
            fontWeight: 500,
            letterSpacing: '0.16em',
            textTransform: 'uppercase',
            color: pal.textFaint,
            marginBottom: 14,
            transition: 'color 0.8s',
          }}>Something went wrong</p>
          <p style={{
            fontSize: 13,
            fontWeight: 300,
            color: pal.textSoft,
            lineHeight: 1.8,
            marginBottom: 28,
            transition: 'color 0.8s',
          }}>
            The recording could not be loaded. Check your email — the viewing password should arrive within a few minutes.
          </p>
          <Link to="/recordings" style={{
            fontSize: 11,
            fontWeight: 500,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: pal.accent,
            textDecoration: 'none',
            transition: 'color 0.8s',
          }}>Back to recordings</Link>
        </div>
      )}

      {status === 'success' && recording && (
        <>
          {/* Confirmation header */}
          <header style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={{
              fontSize: 10,
              fontWeight: 500,
              letterSpacing: '0.2em',
              textTransform: 'uppercase',
              color: pal.accent,
              marginBottom: 14,
              transition: 'color 0.8s',
            }}>Purchase complete</p>

            <h1 style={{
              fontFamily: "'Livvic', sans-serif",
              fontSize: 28,
              fontWeight: 700,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: pal.textMain,
              marginBottom: 16,
              transition: 'color 0.8s',
            }}>{recording.title}</h1>

            <div style={{
              width: 36,
              height: 1,
              background: pal.border,
              margin: '0 auto 18px',
              transition: 'background 0.8s',
            }} />

            <p style={{
              fontSize: 13,
              fontWeight: 300,
              color: pal.textSoft,
              lineHeight: 1.75,
              transition: 'color 0.8s',
            }}>
              Your session recording is below. A copy of the password has been sent to your email.
            </p>
          </header>

          {/* Password */}
          {recording.vimeoPassword && (
            <div style={{ marginBottom: 20 }}>
              <PasswordRow password={recording.vimeoPassword} pal={pal} />
            </div>
          )}

          {/* Vimeo embed */}
          <div style={{
            borderRadius: 16,
            overflow: 'hidden',
            border: `1px solid ${pal.border}`,
            transition: 'border-color 0.8s',
          }}>
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, background: 'rgba(0,0,0,0.08)' }}>
              <iframe
                src={vimeoEmbedUrl(recording.vimeoUrl)}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen; picture-in-picture; clipboard-write; encrypted-media"
                title={recording.title}
              />
            </div>
          </div>

          {/* Meta row */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginTop: 18,
            marginBottom: 40,
          }}>
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

          <div style={{ textAlign: 'center' }}>
            <Link to="/recordings" style={{
              fontSize: 11,
              fontWeight: 500,
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: pal.textFaint,
              textDecoration: 'none',
              transition: 'color 0.8s',
            }}>View all recordings</Link>
          </div>
        </>
      )}
    </div>
  )
}
