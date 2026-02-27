import { useState, Fragment } from 'react'
import { usePalette } from '../context/PaletteContext'
import Logo from '../components/Logo'

function InstagramIcon({ color, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <rect x="2" y="2" width="20" height="20" rx="5" stroke={color} strokeWidth="1.5"/>
      <circle cx="12" cy="12" r="4.5" stroke={color} strokeWidth="1.5"/>
      <circle cx="17.5" cy="6.5" r="1.2" fill={color}/>
    </svg>
  )
}

function GlobeIcon({ color, size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      style={{ display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }}>
      <circle cx="12" cy="12" r="9" stroke={color} strokeWidth="1.5"/>
      <path d="M12 3c-2.8 3.6-4 6.1-4 9s1.2 5.4 4 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M12 3c2.8 3.6 4 6.1 4 9s-1.2 5.4-4 9" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M3 12h18" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  )
}

const LUMA_URL = 'https://lu.ma/7deuollg'

const EVENT = {
  tag: 'Founding Round',
  name: 'Tea & Timeline Shifts — Founding Round',
  date: 'Sunday, March 1, 2026',
  time: '7:00 – 9:00 PM EST',
  format: 'Online · Zoom',
  price: 'Starting at $33',
  priceFuture: 'Future rounds $77',
  seats: 'Limited to 20 seats',
  inclusions: [
    '7-day hypnosis and healing frequency audio',
    'Guided grounding audio for nervous system reset',
    '$33 coupon for Ethan\'s yoga training',
    '10% off coaching for one month',
    'Locked-in pricing for future tea circles',
  ],
}

// Event: March 1 2026 7:00 PM EST = March 2 2026 00:00 UTC
const EVENT_START_UTC = new Date('2026-03-02T00:00:00Z')
const EVENT_END_UTC   = new Date('2026-03-02T02:00:00Z')

const ITINERARY_UTC = [
  { s: '2026-03-02T00:00:00Z', e: '2026-03-02T00:15:00Z', desc: 'Arriving, tea pouring, settling the nervous system' },
  { s: '2026-03-02T00:15:00Z', e: '2026-03-02T01:00:00Z', desc: 'Deep nervous system regulation with Ethan' },
  { s: '2026-03-02T01:00:00Z', e: '2026-03-02T01:40:00Z', desc: 'Timeline journaling and visualization with Ash' },
  { s: '2026-03-02T01:40:00Z', e: '2026-03-02T02:00:00Z', desc: 'Closing integration — grounding the shift into the body' },
]

function getTzAbbr(date, tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, timeZoneName: 'short', hour: 'numeric' })
      .formatToParts(date).find(p => p.type === 'timeZoneName')?.value ?? ''
  } catch { return '' }
}
function fmtTime(date, tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, hour: 'numeric', minute: '2-digit', hour12: true }).format(date)
  } catch { return '' }
}
function fmtDate(date, tz) {
  try {
    return new Intl.DateTimeFormat('en-US', { timeZone: tz, weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(date)
  } catch { return 'Sunday, March 1, 2026' }
}

const IS_THIS_YOU = [
  {
    text: "You've done the visualizations, said the affirmations, but there's still a quiet panic underneath.",
    img: '/images/card-bg-1.jpg',
  },
  {
    text: "You know what you want but you can't stop checking whether it's coming.",
    img: '/images/card-bg-2.jpg',
  },
  {
    text: "You've been told to 'let go' a thousand times but nobody's shown you how your body actually does that.",
    img: '/images/card-bg-3.jpg',
  },
]

const STEPS = [
  {
    key: 'ACCESS',
    subtitle: 'Settle into your subconscious',
    body: 'We begin with tea and breath. Ethan guides the room through deep nervous system regulation — not as a warm-up, but as the foundation. Your body arrives first. Your subconscious opens when your nervous system finally feels safe.',
  },
  {
    key: 'SCRIPT',
    subtitle: 'Write your own transmission',
    body: "From that open state, Ash leads you through journaling and visualization. You clarify what you actually want — without strain — and speak it aloud in your own voice. Not generic affirmations. A script written from the version of you who's already there.",
  },
  {
    key: 'LOOP',
    subtitle: 'Listen for 7 days',
    body: "Our generator takes your recording and weaves it into a looping hypnosis track with reverb, binaural beats, and theta-wave music. You listen before sleep for the next week. Each time you press play, you're not remembering the shift — you're re-entering it.",
  },
]

const GUIDES = [
  {
    photo: '/images/MYI-Ethan.jpg',
    name: 'Ethan Hill',
    bio: 'Writer, entrepreneur, and international yoga teacher. After leaving corporate in 2019, Ethan has dedicated over 12,000 hours to learning and teaching yoga, prāṇāyāma, meditation, and nutrition around the globe. He shares the mystical and practical teachings of Christianity, Hinduism, and Buddhism through a unique blend of engineering and spirituality.',
    links: [
      { label: '@yogawithethan', href: 'https://instagram.com/yogawithethan' },
      { label: 'yogawithethan.com', href: 'https://yogawithethan.com' },
    ],
  },
  {
    photo: '/images/MYI-Ash.JPG',
    name: 'Ash',
    bio: 'Manifestation and subconscious work practitioner. Originally from Canada, now based in Indonesia, Ash has spent years studying sound healing, energy work, trauma-informed modalities, and subconscious reprogramming. She guides people into states where change feels natural — where the nervous system softens, identity stabilizes, and desire becomes steady instead of strained.',
    links: [
      { label: '@ashofwands.healing', href: 'https://instagram.com/ashofwands.healing' },
    ],
  },
]

function SectionEyebrow({ label, pal }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: 8,
        padding: '6px 14px 6px 10px', borderRadius: 20,
        background: pal.glass, backdropFilter: 'blur(12px)', WebkitBackdropFilter: 'blur(12px)',
        border: `1px solid ${pal.border}`, transition: 'background 0.8s, border-color 0.8s',
      }}>
        <div style={{
          width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
          background: `radial-gradient(circle, #ffffff 0%, ${pal.accent} 35%, transparent 100%)`,
          boxShadow: `0 0 5px 2px ${pal.accent}77`, transition: 'all 0.8s',
        }} />
        <span style={{
          fontFamily: "'Livvic', sans-serif", fontSize: 10, fontWeight: 700,
          letterSpacing: '0.2em', textTransform: 'uppercase',
          color: pal.textFaint, transition: 'color 0.8s',
        }}>
          {label}
        </span>
      </div>
    </div>
  )
}

function TimelineOrb({ index, pal }) {
  return (
    <div style={{
      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
      background: `radial-gradient(circle, #ffffff 0%, ${pal.accent} 35%, transparent 100%)`,
      boxShadow: `0 0 6px 3px ${pal.accent}66`,
      animation: 'timelineOrbPulse 3.5s ease-in-out infinite',
      animationDelay: `${index * 0.8}s`,
      transition: 'background 0.8s, box-shadow 0.8s',
    }} />
  )
}

export default function Home() {
  const { pal } = usePalette()
  const [activeStep, setActiveStep] = useState(0)
  const [stepFading, setStepFading] = useState(false)

  const tz             = Intl.DateTimeFormat().resolvedOptions().timeZone
  const tzAbbr         = getTzAbbr(EVENT_START_UTC, tz)
  const localEventDate = fmtDate(EVENT_START_UTC, tz)
  const localEventTime = `${fmtTime(EVENT_START_UTC, tz)} – ${fmtTime(EVENT_END_UTC, tz)} ${tzAbbr}`
  const localItinerary = ITINERARY_UTC.map(item => ({
    time: `${fmtTime(new Date(item.s), tz)} – ${fmtTime(new Date(item.e), tz)} ${tzAbbr}`,
    desc: item.desc,
  }))

  function handleStep(i) {
    if (i === activeStep) return
    setStepFading(true)
    setTimeout(() => { setActiveStep(i); setStepFading(false) }, 220)
  }

  return (
    <>
      <style>{`
        .home-wrap { color: ${pal.textMain}; transition: color 0.8s; }

        .home-section-heading {
          font-family: 'Livvic', sans-serif;
          font-size: 24px; font-weight: 700;
          letter-spacing: 0.12em; text-transform: uppercase;
          color: ${pal.textMain}; margin-bottom: 40px;
          transition: color 0.8s;
        }

        /* ── CTA button ── */
        .home-cta {
          display: inline-block;
          font-family: 'Livvic', sans-serif;
          font-size: 13px; font-weight: 700;
          letter-spacing: 0.18em; text-transform: uppercase;
          text-decoration: none;
          color: #ffffff;
          background: ${pal.cta};
          padding: 18px 52px;
          border-radius: 40px;
          border: none; cursor: pointer;
          box-shadow: 0 4px 28px ${pal.cta}66, 0 2px 8px ${pal.cta}44;
          transition: background 0.8s, box-shadow 0.4s ease, transform 0.3s ease;
        }
        .home-cta:hover {
          box-shadow: 0 6px 44px ${pal.cta}88, 0 3px 14px ${pal.cta}66;
          transform: translateY(-2px);
        }
        .home-cta-pulse { animation: ctaPulse 3.5s ease-in-out infinite; }

        @keyframes ctaPulse {
          0%, 100% { box-shadow: 0 4px 28px ${pal.cta}55, 0 2px 8px ${pal.cta}33; }
          50%       { box-shadow: 0 6px 48px ${pal.cta}99, 0 3px 16px ${pal.cta}66; }
        }

        /* ── Glass card ── */
        .home-glass-card {
          background: ${pal.glass};
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${pal.border}; border-radius: 20px;
          transition: background 0.8s, border-color 0.8s;
        }

        /* ── Guide cards ── */
        .home-guide-card {
          flex: 1; min-width: 0; overflow: hidden;
          background: ${pal.glass};
          backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);
          border: 1px solid ${pal.border}; border-radius: 20px;
          transition: background 0.8s, border-color 0.8s;
        }
        .home-guides-grid { display: flex; gap: 20px; align-items: stretch; }
        @media (max-width: 700px) { .home-guides-grid { flex-direction: column; } }

        .home-guide-link {
          display: flex; align-items: center; gap: 6px;
          font-family: 'DM Sans', sans-serif; font-size: 12px;
          color: ${pal.accent}; text-decoration: none;
          letter-spacing: 0.02em; transition: opacity 0.3s, color 0.8s;
        }
        .home-guide-link:hover { opacity: 0.7; }

        /* ── Is This You cards ── */
        .home-ity-grid { display: flex; gap: 20px; align-items: stretch; }
        @media (max-width: 700px) { .home-ity-grid { flex-direction: column; } }

        /* ── Misc ── */
        .home-divider {
          width: 36px; height: 1px;
          background: ${pal.border}; margin: 0 auto 80px;
          transition: background 0.8s;
        }
        .home-inclusion-item {
          display: flex; align-items: flex-start; gap: 12px;
          padding: 10px 0; border-bottom: 1px solid ${pal.border};
          font-family: 'DM Sans', sans-serif; font-size: 14px;
          color: ${pal.textSoft}; line-height: 1.6;
          transition: color 0.8s, border-color 0.8s;
        }
        .home-inclusion-item:last-child { border-bottom: none; }
        .home-inclusion-dot {
          width: 4px; height: 4px; border-radius: 50%;
          background: ${pal.accent}; flex-shrink: 0; margin-top: 8px;
          transition: background 0.8s;
        }
        .home-timeline-line {
          width: 1px; flex: 1;
          background: linear-gradient(to bottom, ${pal.accent}40, ${pal.border}, ${pal.accent}40);
          margin: 4px 0; min-height: 32px; transition: background 0.8s;
        }
        .home-hero-logo { width: 400px; max-width: 90vw; margin-bottom: 48px; }
        @media (max-width: 640px) { .home-hero-logo { width: 280px; } }
        @media (max-width: 480px) {
          .home-section-heading { font-size: 18px; }
          .home-hero { padding-top: 110px !important; }
        }

        @keyframes timelineOrbPulse {
          0%, 100% { box-shadow: 0 0 4px 2px ${pal.accent}44; }
          50%       { box-shadow: 0 0 10px 5px ${pal.accent}88, 0 0 2px 1px #ffffff77; }
        }
      `}</style>

      <div className="home-wrap">

        {/* ── Hero ── */}
        <section className="home-hero" style={{
          minHeight: '88vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          textAlign: 'center', padding: '160px 24px 80px',
        }}>
          <div className="home-hero-logo">
            <Logo style={{ width: '100%', height: 'auto' }} />
          </div>

          <p style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: 17, lineHeight: 1.9,
            color: pal.textSoft, maxWidth: 500, marginBottom: 52, transition: 'color 0.8s',
          }}>
            We don't help you think positive and hope it appears. We help your nervous system
            actually settle — so you stop forcing reality and start entering the flow where
            what you want is inevitable.
          </p>

          <a href={LUMA_URL} target="_blank" rel="noopener noreferrer"
            className="home-cta home-cta-pulse">
            Join the Next Tea Circle
          </a>
        </section>

        <div className="home-divider" />

        {/* ── Is This You? ── */}
        <section style={{ padding: '0 24px 100px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <SectionEyebrow label="Is This You" pal={pal} />

            <div className="home-ity-grid">
              {IS_THIS_YOU.map((card, i) => (
                <div key={i} style={{
                  flex: 1, minWidth: 0,
                  position: 'relative', overflow: 'hidden',
                  borderRadius: 20, border: `1px solid ${pal.border}`,
                  transition: 'border-color 0.8s',
                }}>
                  {/* Background texture image */}
                  <img
                    src={card.img}
                    alt=""
                    aria-hidden="true"
                    style={{
                      position: 'absolute', inset: 0,
                      width: '100%', height: '100%',
                      objectFit: 'cover', opacity: 0.18,
                      filter: 'blur(3px)', transform: 'scale(1.08)',
                      pointerEvents: 'none',
                    }}
                  />
                  {/* Glass surface */}
                  <div style={{
                    position: 'absolute', inset: 0,
                    background: pal.glass,
                    backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)',
                  }} />
                  {/* Content */}
                  <div style={{ position: 'relative', zIndex: 1, padding: '40px 28px 44px', textAlign: 'center' }}>
                    {/* Orb accent */}
                    <div style={{
                      width: 8, height: 8, borderRadius: '50%',
                      background: `radial-gradient(circle, #ffffff 0%, ${pal.accent} 35%, transparent 100%)`,
                      boxShadow: `0 0 7px 3px ${pal.accent}66`,
                      margin: '0 auto 28px', transition: 'all 0.8s',
                    }} />
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: 17, fontStyle: 'italic',
                      lineHeight: 1.85, color: pal.textSoft,
                      transition: 'color 0.8s',
                    }}>
                      {card.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="home-divider" />

        {/* ── How a Round Unfolds — Three-Step Carousel ── */}
        <section style={{ padding: '0 24px 60px' }}>
          <div style={{ maxWidth: 600, margin: '0 auto' }}>
            <SectionEyebrow label="The Method" pal={pal} />
            <h2 className="home-section-heading" style={{ textAlign: 'center' }}>
              How a Round Unfolds
            </h2>

            {/* ── Timeline ── */}
            <div style={{
              display: 'flex', alignItems: 'flex-start',
              maxWidth: 420, margin: '0 auto 16px', padding: '0 10px',
            }}>
              {STEPS.map((step, i) => (
                <Fragment key={step.key}>
                  <button
                    onClick={() => handleStep(i)}
                    style={{
                      flex: '0 0 auto', display: 'flex', flexDirection: 'column',
                      alignItems: 'center', gap: 10,
                      background: 'none', border: 'none', cursor: 'pointer',
                      padding: 0, width: 90,
                    }}
                  >
                    {/* Orb */}
                    <div style={{
                      width: 14, height: 14, borderRadius: '50%',
                      background: i === activeStep
                        ? `radial-gradient(circle, #ffffff 0%, ${pal.accent} 30%, transparent 100%)`
                        : `radial-gradient(circle, ${pal.accent}55 0%, ${pal.accent}33 50%, transparent 100%)`,
                      boxShadow: i === activeStep
                        ? `0 0 14px 5px ${pal.accent}99, 0 0 4px 1px #ffffff88`
                        : `0 0 4px 2px ${pal.accent}33`,
                      transition: 'all 0.4s ease',
                    }} />
                    {/* Label */}
                    <span style={{
                      fontFamily: "'Livvic', sans-serif",
                      fontSize: 10, fontWeight: 700,
                      letterSpacing: '0.2em', textTransform: 'uppercase',
                      color: i === activeStep ? pal.textMain : pal.textSoft,
                      transition: 'color 0.4s',
                    }}>
                      {step.key}
                    </span>
                  </button>

                  {/* Connector line */}
                  {i < STEPS.length - 1 && (
                    <div style={{
                      flex: 1, height: 1,
                      background: `linear-gradient(to right, ${pal.accent}55, ${pal.accent}33)`,
                      alignSelf: 'flex-start', marginTop: 7,
                      transition: 'background 0.8s',
                    }} />
                  )}
                </Fragment>
              ))}
            </div>

            {/* ── Step content ── */}
            <div style={{
              textAlign: 'center',
              opacity: stepFading ? 0 : 1,
              transition: 'opacity 0.22s ease',
              padding: '8px 0 0',
            }}>
              <p style={{
                fontFamily: "'Livvic', sans-serif",
                fontSize: 11, fontWeight: 700,
                letterSpacing: '0.22em', textTransform: 'uppercase',
                color: pal.accent, marginBottom: 10,
                transition: 'color 0.8s',
              }}>
                {STEPS[activeStep].subtitle}
              </p>
              <p style={{
                fontFamily: "'DM Sans', sans-serif",
                fontSize: 16, lineHeight: 1.95,
                color: pal.textSoft,
                maxWidth: 520, margin: '0 auto',
                transition: 'color 0.8s',
              }}>
                {STEPS[activeStep].body}
              </p>
            </div>
          </div>
        </section>

        {/* ── Condensed transition paragraph ── */}
        <div style={{ maxWidth: 520, margin: '0 auto', padding: '0 24px 100px', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 17, fontStyle: 'italic',
            lineHeight: 2.0, color: pal.textSoft,
            transition: 'color 0.8s',
          }}>
            Every round begins the same way — tea poured, bodies settling, breath slowing
            down. By the time you leave, you're not carrying an idea of change. You're
            carrying the shift in your body.
          </p>
        </div>

        <div className="home-divider" />

        {/* ── Upcoming Tea Circle ── */}
        <section style={{ padding: '0 24px 100px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <SectionEyebrow label="Next Session" pal={pal} />
            <h2 className="home-section-heading" style={{ textAlign: 'center' }}>
              Upcoming Tea Circle
            </h2>

            <div className="home-glass-card" style={{ padding: '40px 36px' }}>
              {/* Tag */}
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 28 }}>
                <div style={{
                  width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                  background: `radial-gradient(circle, #ffffff 0%, ${pal.cta} 35%, transparent 100%)`,
                  boxShadow: `0 0 5px 2px ${pal.cta}77`, transition: 'all 0.8s',
                }} />
                <span style={{
                  fontFamily: "'Livvic', sans-serif", fontSize: 9, fontWeight: 700,
                  letterSpacing: '0.2em', textTransform: 'uppercase',
                  color: pal.cta, transition: 'color 0.8s',
                }}>
                  {EVENT.tag}
                </span>
              </div>

              {/* Event name */}
              <h3 style={{
                fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: 22,
                letterSpacing: '0.1em', textTransform: 'uppercase',
                color: pal.textMain, marginBottom: 6, lineHeight: 1.3,
                transition: 'color 0.8s',
              }}>
                {EVENT.name}
              </h3>

              {/* Date & time */}
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, color: pal.textSoft, marginBottom: 4, transition: 'color 0.8s' }}>
                {localEventDate}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, color: pal.textFaint, marginBottom: 4, transition: 'color 0.8s' }}>
                {localEventTime}
              </p>
              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, letterSpacing: '0.04em', color: pal.textFaint, marginBottom: 28, transition: 'color 0.8s' }}>
                {EVENT.format}
              </p>

              {/* Price + seats */}
              <div style={{ display: 'flex', gap: 20, alignItems: 'baseline', marginBottom: 28, flexWrap: 'wrap' }}>
                <span style={{ fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: 20, letterSpacing: '0.06em', color: pal.textMain, transition: 'color 0.8s' }}>
                  {EVENT.price}
                </span>
                <span style={{ fontSize: 12, color: pal.textFaint, transition: 'color 0.8s' }}>{EVENT.priceFuture}</span>
                <span style={{ fontSize: 12, color: pal.textFaint, transition: 'color 0.8s' }}>{EVENT.seats}</span>
              </div>

              {/* Divider + inclusions */}
              <div style={{ marginBottom: 28 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 5, paddingTop: 4, marginBottom: 18 }}>
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: pal.textSoft, opacity: 0.4, flexShrink: 0, transition: 'all 0.8s' }} />
                  <div style={{ flex: 1, height: 1, background: pal.border, transition: 'background 0.8s' }} />
                  <div style={{ width: 4, height: 4, borderRadius: '50%', background: pal.textSoft, opacity: 0.4, flexShrink: 0, transition: 'all 0.8s' }} />
                </div>
                <p style={{ fontFamily: "'Livvic', sans-serif", fontSize: 9, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: pal.textFaint, marginBottom: 14, transition: 'color 0.8s' }}>
                  Your ticket includes
                </p>
                {EVENT.inclusions.map((item, i) => (
                  <div key={i} className="home-inclusion-item">
                    <div className="home-inclusion-dot" />
                    {item}
                  </div>
                ))}
              </div>

              {/* CTA */}
              <div style={{ textAlign: 'center' }}>
                <a href={LUMA_URL} target="_blank" rel="noopener noreferrer"
                  className="home-cta home-cta-pulse">
                  Reserve Your Seat
                </a>
              </div>
            </div>
          </div>
        </section>

        <div className="home-divider" />

        {/* ── Schedule ── */}
        <section style={{ padding: '0 24px 100px' }}>
          <div style={{ maxWidth: 560, margin: '0 auto' }}>
            <SectionEyebrow label="Schedule" pal={pal} />
            <h2 className="home-section-heading" style={{ textAlign: 'center' }}>
              The Evening
            </h2>

            <div style={{ maxWidth: 420, margin: '0 auto' }}>
              {localItinerary.map((item, i) => (
                <div key={i} style={{ display: 'flex', gap: 20, alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', paddingTop: 2, flexShrink: 0 }}>
                    <TimelineOrb index={i} pal={pal} />
                    {i < localItinerary.length - 1 && <div className="home-timeline-line" />}
                  </div>
                  <div style={{ paddingBottom: i < localItinerary.length - 1 ? 40 : 0 }}>
                    <p style={{ fontFamily: "'Livvic', sans-serif", fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: pal.accent, marginBottom: 6, transition: 'color 0.8s' }}>
                      {item.time}
                    </p>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 15, lineHeight: 1.7, color: pal.textMain, transition: 'color 0.8s' }}>
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}

              <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 12, lineHeight: 1.7, color: pal.textSoft, opacity: 0.6, marginTop: 32, textAlign: 'center', transition: 'color 0.8s' }}>
                Times shown in your local timezone ({tzAbbr || tz}).{' '}
                We're working on offering sessions across more global time zones soon.
              </p>
            </div>
          </div>
        </section>

        <div className="home-divider" />

        {/* ── Meet Your Guides ── */}
        <section style={{ padding: '0 24px 120px' }}>
          <div style={{ maxWidth: 720, margin: '0 auto' }}>
            <SectionEyebrow label="Your Hosts" pal={pal} />
            <h2 className="home-section-heading" style={{ textAlign: 'center' }}>
              Meet Your Guides
            </h2>

            <div className="home-guides-grid">
              {GUIDES.map(guide => (
                <div key={guide.name} className="home-guide-card">
                  <img
                    src={guide.photo}
                    alt={guide.name}
                    loading="lazy"
                    style={{
                      width: '100%', height: 280, objectFit: 'cover',
                      objectPosition: 'center top', display: 'block',
                      maskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(to bottom, black 0%, black 55%, transparent 100%)',
                    }}
                  />
                  <div style={{ padding: '0 26px 26px' }}>
                    <h3 style={{ marginTop: 18, marginBottom: 14, fontFamily: "'Livvic', sans-serif", fontWeight: 700, fontSize: 28, letterSpacing: '0.08em', textTransform: 'uppercase', color: pal.textMain, lineHeight: 1.1, transition: 'color 0.8s' }}>
                      {guide.name}
                    </h3>
                    <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: 14, lineHeight: 1.85, color: pal.textSoft, marginBottom: 20, transition: 'color 0.8s' }}>
                      {guide.bio}
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {guide.links.map(link => (
                        <a key={link.label} href={link.href} target="_blank" rel="noopener noreferrer" className="home-guide-link">
                          {link.href.includes('instagram.com')
                            ? <InstagramIcon color={pal.accent} size={14} />
                            : <GlobeIcon color={pal.accent} size={14} />
                          }
                          {link.label}
                        </a>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="home-divider" />

        {/* ── Final CTA ── */}
        <section style={{ padding: '0 24px 120px', textAlign: 'center' }}>
          <p style={{
            fontFamily: "'DM Sans', sans-serif",
            fontSize: 16, fontStyle: 'italic',
            lineHeight: 1.9, color: pal.textSoft,
            maxWidth: 440, margin: '0 auto 40px',
            transition: 'color 0.8s',
          }}>
            The next round is {localEventDate}. Twenty seats. Your voice, your words, your shift.
          </p>
          <a href={LUMA_URL} target="_blank" rel="noopener noreferrer"
            className="home-cta home-cta-pulse">
            Join the Next Tea Circle
          </a>
        </section>

      </div>
    </>
  )
}
