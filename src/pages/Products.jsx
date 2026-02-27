import { Link } from 'react-router-dom'

export default function Products() {
  return (
    <div style={{
      maxWidth: 720,
      margin: '0 auto',
      padding: '80px 40px',
    }}>
      <h1 style={{
        fontFamily: "'Instrument Serif', serif",
        fontWeight: 400,
        fontSize: 40,
        marginBottom: 16,
        color: '#1a1a1a',
      }}>
        Products
      </h1>

      <p style={{
        fontSize: 15,
        lineHeight: 1.8,
        color: 'rgba(0,0,0,0.45)',
        marginBottom: 48,
      }}>
        Tools and recordings for your practice.
      </p>

      {/* Generator card */}
      <Link to="/generator" style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{
          padding: '32px',
          border: '1px solid rgba(0,0,0,0.06)',
          borderRadius: 16,
          marginBottom: 20,
          transition: 'all 0.3s',
          cursor: 'pointer',
        }}
          onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.12)'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(0,0,0,0.06)'}
        >
          <p style={{
            fontSize: 10,
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            color: 'rgba(0,0,0,0.3)',
            marginBottom: 8,
          }}>
            Interactive Tool
          </p>
          <p style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 22,
            color: '#1a1a1a',
            marginBottom: 8,
          }}>
            Personal Hypnosis Generator
          </p>
          <p style={{
            fontSize: 14,
            color: 'rgba(0,0,0,0.4)',
            lineHeight: 1.6,
          }}>
            Record your affirmation and generate a custom looping
            track with reverb, binaural beats, and theta-wave music.
          </p>
        </div>
      </Link>

      {/* Placeholder for future products */}
      <div style={{
        padding: '32px',
        border: '1px dashed rgba(0,0,0,0.08)',
        borderRadius: 16,
        textAlign: 'center',
      }}>
        <p style={{
          fontSize: 13,
          color: 'rgba(0,0,0,0.25)',
        }}>
          More products coming soon
        </p>
      </div>
    </div>
  )
}
