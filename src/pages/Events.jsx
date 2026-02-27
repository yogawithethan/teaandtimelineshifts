export default function Events() {
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
        Upcoming Events
      </h1>

      <p style={{
        fontSize: 15,
        lineHeight: 1.8,
        color: 'rgba(0,0,0,0.45)',
        marginBottom: 48,
      }}>
        Live ceremonies, workshops, and group timeline shifts.
      </p>

      {/* Placeholder — replace with real event data */}
      <div style={{
        padding: '32px',
        border: '1px solid rgba(0,0,0,0.06)',
        borderRadius: 16,
        marginBottom: 20,
      }}>
        <p style={{
          fontSize: 10,
          letterSpacing: '0.14em',
          textTransform: 'uppercase',
          color: 'rgba(0,0,0,0.3)',
          marginBottom: 8,
        }}>
          Coming Soon
        </p>
        <p style={{
          fontFamily: "'Instrument Serif', serif",
          fontSize: 22,
          color: '#1a1a1a',
        }}>
          Events will be listed here.
        </p>
      </div>
    </div>
  )
}
