import { useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePalette } from '../context/PaletteContext'
import { siteConfig } from '../config/siteConfig'

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 256 256" fill="currentColor">
      <path d="M240,208H224V136l2.34,2.34A8,8,0,0,0,237.66,127L139.31,28.68a16,16,0,0,0-22.62,0L18.34,127a8,8,0,0,0,11.32,11.31L32,136v72H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Zm-88,0H104V160a4,4,0,0,1,4-4h40a4,4,0,0,1,4,4Z"/>
    </svg>
  )
}

function FilmIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x={2} y={2} width={20} height={20} rx={2.18}/>
      <line x1={7} y1={2} x2={7} y2={22}/>
      <line x1={17} y1={2} x2={17} y2={22}/>
      <line x1={2} y1={12} x2={22} y2={12}/>
      <line x1={2} y1={7} x2={7} y2={7}/>
      <line x1={2} y1={17} x2={7} y2={17}/>
      <line x1={17} y1={17} x2={22} y2={17}/>
      <line x1={17} y1={7} x2={22} y2={7}/>
    </svg>
  )
}

function SpiralIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 256 256" fill="currentColor">
      <path d="M248,144a8,8,0,0,1-16,0,96.11,96.11,0,0,0-96-96,88.1,88.1,0,0,0-88,88,80.09,80.09,0,0,0,80,80,72.08,72.08,0,0,0,72-72,64.07,64.07,0,0,0-64-64,56.06,56.06,0,0,0-56,56,48.05,48.05,0,0,0,48,48,40,40,0,0,0,40-40,32,32,0,0,0-32-32,24,24,0,0,0-24,24,16,16,0,0,0,16,16,8,8,0,0,0,8-8,8,8,0,0,1,0-16,16,16,0,0,1,16,16,24,24,0,0,1-24,24,32,32,0,0,1-32-32,40,40,0,0,1,40-40,48.05,48.05,0,0,1,48,48,56.06,56.06,0,0,1-56,56,64.07,64.07,0,0,1-64-64,72.08,72.08,0,0,1,72-72,80.09,80.09,0,0,1,80,80,88.1,88.1,0,0,1-88,88,96.11,96.11,0,0,1-96-96A104.11,104.11,0,0,1,136,32,112.12,112.12,0,0,1,248,144Z"/>
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 256 256" fill="currentColor">
      <path d="M232,104a8,8,0,0,0,8-8V64a16,16,0,0,0-16-16H32A16,16,0,0,0,16,64V96a8,8,0,0,0,8,8,24,24,0,0,1,0,48,8,8,0,0,0-8,8v32a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V160a8,8,0,0,0-8-8,24,24,0,0,1,0-48ZM32,167.2a40,40,0,0,0,0-78.4V64H88V192H32Zm192,0V192H104V64H224V88.8a40,40,0,0,0,0,78.4Z"/>
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function brighterGlass(g, factor = 2.2) {
  const m = g.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!m) return g
  const a = Math.min(parseFloat(m[4] ?? '1') * factor, 0.88)
  return `rgba(${m[1]},${m[2]},${m[3]},${a.toFixed(2)})`
}

function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function MobileNav() {
  const { pal }     = usePalette()
  const { pathname } = useLocation()

  // Inject CTA pulse keyframe once
  useEffect(() => {
    if (document.getElementById('tts-mob-styles')) return
    const el = document.createElement('style')
    el.id = 'tts-mob-styles'
    el.textContent = `
      @keyframes tts-mob-cta-pulse {
        0%,100% { box-shadow: var(--mob-cta-sa); }
        50%      { box-shadow: var(--mob-cta-sb); }
      }
      .tts-mob-pill-wrap::-webkit-scrollbar { display: none; }
    `
    document.head.appendChild(el)
  }, [])

  // Generator is full-screen — no nav overlay
  if (pathname === '/generator') return null

  const isHome       = pathname === '/'
  const isRecordings = pathname.startsWith('/recordings')
  const isGenerator  = pathname === '/generator'

  const activeGlass = brighterGlass(pal.glass, 2.2)
  const ctaShadowA  = `0 4px 20px ${hexToRgba(pal.cta, 0.45)}, 0 0 42px ${hexToRgba(pal.cta, 0.16)}`
  const ctaShadowB  = `0 4px 26px ${hexToRgba(pal.cta, 0.62)}, 0 0 54px ${hexToRgba(pal.cta, 0.30)}`

  const glass = {
    background:              pal.glass,
    backdropFilter:          'blur(24px)',
    WebkitBackdropFilter:    'blur(24px)',
    border:                  `1px solid ${pal.border}`,
    boxShadow:               `0 4px 24px ${pal.shadow}, 0 1px 4px rgba(0,0,0,0.05)`,
    transition:              'background 0.8s, border-color 0.8s, box-shadow 0.8s',
  }

  const tabLabel = {
    fontSize:      10,
    fontWeight:    500,
    letterSpacing: '0.07em',
    textTransform: 'uppercase',
    lineHeight:    1,
    transition:    'color 0.3s, color 0.8s',
  }

  function tabStyle(active) {
    return {
      display:        'flex',
      flexDirection:  'column',
      alignItems:     'center',
      gap:            4,
      padding:        '8px 20px',
      borderRadius:   24,
      textDecoration: 'none',
      color:          active ? pal.textMain : pal.textSoft,
      background:     active ? activeGlass : 'transparent',
      boxShadow:      active ? `0 2px 10px ${pal.shadow}` : 'none',
      whiteSpace:     'nowrap',
      transition:     'color 0.3s, background 0.3s, color 0.8s',
    }
  }

  return (
    <nav style={{
      position:        'fixed',
      bottom:          'calc(16px + env(safe-area-inset-bottom, 0px))',
      left:            '50%',
      transform:       'translateX(-50%)',
      display:         'flex',
      alignItems:      'center',
      gap:             6,
      zIndex:          200,
      width:           'calc(100% - 32px)',
      maxWidth:        420,
    }}>

      {/* ── Home circle ── */}
      <Link to="/" style={{
        display:        'flex',
        alignItems:     'center',
        justifyContent: 'center',
        textDecoration: 'none',
        flexShrink:     0,
        width:          56,
        height:         56,
        borderRadius:   '50%',
        ...glass,
        background:     isHome ? activeGlass : pal.glass,
        color:          isHome ? pal.textMain : pal.textSoft,
        transition:     'background 0.3s, color 0.3s, background 0.8s, border-color 0.8s',
      }}>
        <HomeIcon />
      </Link>

      {/* ── Scrollable center pill ── */}
      <div
        className="tts-mob-pill-wrap"
        style={{
          flex:                    1,
          overflowX:               'auto',
          overflowY:               'hidden',
          WebkitOverflowScrolling: 'touch',
          scrollbarWidth:          'none',
          display:                 'flex',
          justifyContent:          'center',
          /* Vertical padding gives the pill's box-shadow room before the overflow clips it */
          padding:                 '12px 2px',
          margin:                  '-12px 0',
        }}
      >
        <div style={{
          ...glass,
          display:        'flex',
          alignItems:     'center',
          gap:            2,
          borderRadius:   28,
          padding:        4,
          minWidth:       'fit-content',
        }}>

          <Link to="/recordings" style={tabStyle(isRecordings)}>
            <FilmIcon />
            <span style={{ ...tabLabel, color: 'inherit' }}>Recordings</span>
          </Link>

          <Link to="/generator" style={tabStyle(isGenerator)}>
            <SpiralIcon />
            <span style={{ ...tabLabel, color: 'inherit' }}>Generator</span>
          </Link>

        </div>
      </div>

      {/* ── CTA ticket circle ── */}
      <a
        href={siteConfig.nextEventUrl}
        target="_blank"
        rel="noopener noreferrer"
        style={{
          '--mob-cta-sa':  ctaShadowA,
          '--mob-cta-sb':  ctaShadowB,
          display:         'flex',
          alignItems:      'center',
          justifyContent:  'center',
          textDecoration:  'none',
          flexShrink:      0,
          width:           56,
          height:          56,
          borderRadius:    '50%',
          background:      pal.cta,
          color:           '#fff',
          animation:       'tts-mob-cta-pulse 3.5s ease-in-out infinite',
          transition:      'background 0.8s',
        }}
      >
        <TicketIcon />
      </a>

    </nav>
  )
}
