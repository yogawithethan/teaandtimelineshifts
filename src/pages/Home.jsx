import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '80px 40px',
    }}>
      <h1 style={{
        fontFamily: "'Instrument Serif', serif",
        fontWeight: 400,
        fontSize: 48,
        lineHeight: 1.2,
        marginBottom: 24,
        color: '#1a1a1a',
      }}>
        Tea & Timeline Shifts
      </h1>

      <p style={{
        fontSize: 17,
        lineHeight: 1.8,
        color: 'rgba(0,0,0,0.5)',
        marginBottom: 40,
        maxWidth: 520,
      }}>
        A personal hypnosis experience. Record your affirmation,
        let the generator weave it into a looping track with reverb,
        binaural beats, and theta-wave backing music. Then listen
        before sleep and let the shift happen.
      </p>

      <Link
        to="/generator"
        style={{
          display: 'inline-block',
          fontFamily: "'DM Sans', sans-serif",
          fontSize: 13,
          fontWeight: 500,
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          textDecoration: 'none',
          color: '#7ba8c9',
          background: '#fff',
          padding: '14px 36px',
          borderRadius: 40,
          boxShadow: '0 4px 24px rgba(120,170,210,0.35), 0 1px 6px rgba(120,170,210,0.2)',
          transition: 'all 0.4s ease',
        }}
      >
        Open Generator
      </Link>
    </div>
  )
}
