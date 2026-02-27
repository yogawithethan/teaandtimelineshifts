import { Outlet, NavLink } from 'react-router-dom'

const navItems = [
  { to: '/', label: 'Home' },
  { to: '/events', label: 'Events' },
  { to: '/products', label: 'Products' },
  { to: '/generator', label: 'Generator' },
]

export default function SiteLayout() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <nav style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '20px 40px',
        borderBottom: '1px solid rgba(0,0,0,0.06)',
      }}>
        <NavLink to="/" style={{ textDecoration: 'none', color: '#1a1a1a' }}>
          <span style={{
            fontFamily: "'Instrument Serif', serif",
            fontSize: 20,
            fontWeight: 400,
          }}>
            Tea & Timeline Shifts
          </span>
        </NavLink>

        <div style={{ display: 'flex', gap: 32 }}>
          {navItems.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              style={({ isActive }) => ({
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 500 : 400,
                letterSpacing: '0.04em',
                color: isActive ? '#1a1a1a' : 'rgba(0,0,0,0.4)',
                transition: 'color 0.3s',
              })}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* Page content renders here */}
      <main style={{ flex: 1 }}>
        <Outlet />
      </main>

      <footer style={{
        padding: '40px',
        borderTop: '1px solid rgba(0,0,0,0.06)',
        textAlign: 'center',
        fontSize: 12,
        color: 'rgba(0,0,0,0.3)',
        letterSpacing: '0.04em',
      }}>
        © {new Date().getFullYear()} Tea & Timeline Shifts
      </footer>
    </div>
  )
}
