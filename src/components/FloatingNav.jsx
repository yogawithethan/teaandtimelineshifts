import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { usePalette } from '../context/PaletteContext'
import { siteConfig } from '../config/siteConfig'

// ─── Icons ────────────────────────────────────────────────────────────────────

function HomeIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 256 256" fill="currentColor">
      <path d="M240,208H224V136l2.34,2.34A8,8,0,0,0,237.66,127L139.31,28.68a16,16,0,0,0-22.62,0L18.34,127a8,8,0,0,0,11.32,11.31L32,136v72H16a8,8,0,0,0,0,16H240a8,8,0,0,0,0-16Zm-88,0H104V160a4,4,0,0,1,4-4h40a4,4,0,0,1,4,4Z"/>
    </svg>
  )
}

function FilmIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor"
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
    <svg width={16} height={16} viewBox="0 0 256 256" fill="currentColor">
      <path d="M248,144a8,8,0,0,1-16,0,96.11,96.11,0,0,0-96-96,88.1,88.1,0,0,0-88,88,80.09,80.09,0,0,0,80,80,72.08,72.08,0,0,0,72-72,64.07,64.07,0,0,0-64-64,56.06,56.06,0,0,0-56,56,48.05,48.05,0,0,0,48,48,40,40,0,0,0,40-40,32,32,0,0,0-32-32,24,24,0,0,0-24,24,16,16,0,0,0,16,16,8,8,0,0,0,8-8,8,8,0,0,1,0-16,16,16,0,0,1,16,16,24,24,0,0,1-24,24,32,32,0,0,1-32-32,40,40,0,0,1,40-40,48.05,48.05,0,0,1,48,48,56.06,56.06,0,0,1-56,56,64.07,64.07,0,0,1-64-64,72.08,72.08,0,0,1,72-72,80.09,80.09,0,0,1,80,80,88.1,88.1,0,0,1-88,88,96.11,96.11,0,0,1-96-96A104.11,104.11,0,0,1,136,32,112.12,112.12,0,0,1,248,144Z"/>
    </svg>
  )
}

function TicketIcon() {
  return (
    <svg width={20} height={20} viewBox="0 0 256 256" fill="white">
      <path d="M232,104a8,8,0,0,0,8-8V64a16,16,0,0,0-16-16H32A16,16,0,0,0,16,64V96a8,8,0,0,0,8,8,24,24,0,0,1,0,48,8,8,0,0,0-8,8v32a16,16,0,0,0,16,16H224a16,16,0,0,0,16-16V160a8,8,0,0,0-8-8,24,24,0,0,1,0-48ZM32,167.2a40,40,0,0,0,0-78.4V64H88V192H32Zm192,0V192H104V64H224V88.8a40,40,0,0,0,0,78.4Z"/>
    </svg>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

// Returns a brighter version of a glass rgba string (for active/hover states)
function brighterGlass(g, factor = 2.2) {
  const m = g.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/)
  if (!m) return g
  const a = Math.min(parseFloat(m[4] ?? '1') * factor, 0.88)
  return `rgba(${m[1]},${m[2]},${m[3]},${a.toFixed(2)})`
}

// Hex (#RRGGBB) → rgba string for the CTA pulse shadows
function hexToRgba(hex, alpha) {
  const h = hex.replace('#', '')
  const r = parseInt(h.slice(0, 2), 16)
  const g = parseInt(h.slice(2, 4), 16)
  const b = parseInt(h.slice(4, 6), 16)
  return `rgba(${r},${g},${b},${alpha})`
}

// ─── FloatingNav ─────────────────────────────────────────────────────────────

export default function FloatingNav() {
  const { pal } = usePalette()
  const { pathname } = useLocation()

  const [homeHover, setHomeHover] = useState(false)
  const [recHover,  setRecHover]  = useState(false)
  const [genHover,  setGenHover]  = useState(false)
  const [ctaHover,  setCtaHover]  = useState(false)

  // Responsive: compact labels on narrow screens
  const [narrow, setNarrow] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 540,
  )
  useEffect(() => {
    const handler = () => setNarrow(window.innerWidth < 540)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Active page detection
  const isHome       = pathname === '/'
  const isRecordings = pathname.startsWith('/recordings')
  const isGenerator  = pathname === '/generator'

  // Glass surface shared by home button + pill
  const glassBase = {
    background: pal.glass,
    backdropFilter: 'blur(20px)',
    WebkitBackdropFilter: 'blur(20px)',
    border: `1px solid ${pal.border}`,
    boxShadow: `0 4px 24px ${pal.shadow}, 0 1px 4px rgba(0,0,0,0.05)`,
    transition: 'background 0.8s, border-color 0.8s, box-shadow 0.8s',
  }

  const activeGlass = brighterGlass(pal.glass, 2.2)
  const hoverGlass  = brighterGlass(pal.glass, 1.5)

  // CTA pulse shadow values — updated whenever palette shifts
  const ctaShadowA     = `0 4px 20px ${hexToRgba(pal.cta, 0.45)}, 0 0 42px ${hexToRgba(pal.cta, 0.16)}`
  const ctaShadowB     = `0 4px 26px ${hexToRgba(pal.cta, 0.62)}, 0 0 54px ${hexToRgba(pal.cta, 0.30)}`
  const ctaShadowHover = `0 6px 30px ${hexToRgba(pal.cta, 0.70)}, 0 0 64px ${hexToRgba(pal.cta, 0.38)}`

  // Inject keyframe + base styles once
  useEffect(() => {
    if (document.getElementById('tts-nav-styles')) return
    const el = document.createElement('style')
    el.id = 'tts-nav-styles'
    el.textContent = `
      @keyframes tts-cta-pulse {
        0%,100% { box-shadow: var(--cta-sa); }
        50%      { box-shadow: var(--cta-sb); }
      }
    `
    document.head.appendChild(el)
  }, [])

  // ─── Shared tab style factory
  function tabStyle(isActive, isHovered) {
    return {
      display: 'flex',
      alignItems: 'center',
      gap: 7,
      padding: narrow ? '8px 14px' : '9px 18px',
      borderRadius: 22,
      fontFamily: "'DM Sans', sans-serif",
      fontSize: narrow ? 12 : 13,
      fontWeight: 500,
      letterSpacing: '0.02em',
      textDecoration: 'none',
      color: (isActive || isHovered) ? pal.textMain : pal.textSoft,
      background: isActive ? activeGlass : isHovered ? hoverGlass : 'transparent',
      boxShadow: isActive ? `0 2px 10px ${pal.shadow}` : 'none',
      transition: 'color 0.25s, background 0.25s, box-shadow 0.25s, color 0.8s, background 0.8s',
      userSelect: 'none',
      whiteSpace: 'nowrap',
    }
  }

  function iconWrap(isActive, isHovered) {
    return {
      opacity: (isActive || isHovered) ? 0.9 : 0.5,
      display: 'flex',
      flexShrink: 0,
      transition: 'opacity 0.25s',
    }
  }

  return (
    <nav style={{
      position: 'fixed',
      top: 20,
      left: '50%',
      transform: 'translateX(-50%)',
      display: 'flex',
      alignItems: 'center',
      gap: 6,
      zIndex: 200,
    }}>

      {/* ── Home circle ── */}
      <Link
        to="/"
        title="Home"
        onMouseEnter={() => setHomeHover(true)}
        onMouseLeave={() => setHomeHover(false)}
        style={{
          ...glassBase,
          background: (isHome || homeHover) ? activeGlass : pal.glass,
          width: 48,
          height: 48,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          color: (isHome || homeHover) ? pal.textMain : pal.textSoft,
          opacity: (isHome || homeHover) ? 1 : 0.85,
          transform: homeHover ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.25s, opacity 0.25s, color 0.25s, background 0.8s, border-color 0.8s, box-shadow 0.8s',
          flexShrink: 0,
        }}
      >
        <HomeIcon />
      </Link>

      {/* ── Center pill ── */}
      <div style={{
        ...glassBase,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        borderRadius: 28,
        padding: '5px 6px',
      }}>
        {/* Recordings tab */}
        <Link
          to="/recordings"
          onMouseEnter={() => setRecHover(true)}
          onMouseLeave={() => setRecHover(false)}
          style={tabStyle(isRecordings, recHover)}
        >
          <span style={iconWrap(isRecordings, recHover)}><FilmIcon /></span>
          {narrow ? 'Recordings' : 'Live Recordings'}
        </Link>

        {/* Generator tab */}
        <Link
          to="/generator"
          onMouseEnter={() => setGenHover(true)}
          onMouseLeave={() => setGenHover(false)}
          style={tabStyle(isGenerator, genHover)}
        >
          <span style={iconWrap(isGenerator, genHover)}><SpiralIcon /></span>
          {narrow ? 'Generator' : 'Audio Generator'}
        </Link>
      </div>

      {/* ── CTA ticket circle ── */}
      <a
        href={siteConfig.nextEventUrl}
        target="_blank"
        rel="noopener noreferrer"
        title={siteConfig.nextEventTitle}
        onMouseEnter={() => setCtaHover(true)}
        onMouseLeave={() => setCtaHover(false)}
        style={{
          '--cta-sa': ctaShadowA,
          '--cta-sb': ctaShadowB,
          width: 48,
          height: 48,
          borderRadius: '50%',
          background: pal.cta,
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          textDecoration: 'none',
          cursor: 'pointer',
          // On hover: override animation shadow with static bright shadow
          boxShadow: ctaHover ? ctaShadowHover : undefined,
          animation: 'tts-cta-pulse 3.5s ease-in-out infinite',
          transform: ctaHover ? 'scale(1.1)' : 'scale(1)',
          transition: 'transform 0.25s, background 0.8s',
          flexShrink: 0,
        }}
      >
        <TicketIcon />
      </a>
    </nav>
  )
}
