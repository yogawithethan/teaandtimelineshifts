import { Outlet } from 'react-router-dom'
import { usePalette } from '../context/PaletteContext'
import BgCrossfade from '../components/BgCrossfade'
import PortalButton from '../components/PortalButton'

export default function SiteLayout() {
  const { palIdx, pal } = usePalette()

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', position: 'relative', zIndex: 1 }}>
      <BgCrossfade palIdx={palIdx} />

      {/* Fixed portal icon — upper right (from PortalButton component) */}
      <PortalButton />

      <main style={{ flex: 1, position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>

      <footer style={{
        position: 'relative',
        zIndex: 1,
        padding: '40px',
        borderTop: `1px solid ${pal.border}`,
        textAlign: 'center',
        fontSize: 11,
        letterSpacing: '0.08em',
        color: pal.textFaint,
        transition: 'color 0.8s, border-color 0.8s',
      }}>
        © 2025 Tea & Timeline Shifts
      </footer>
    </div>
  )
}
