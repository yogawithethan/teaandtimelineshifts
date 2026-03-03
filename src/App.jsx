import { useState, useEffect } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import { PaletteProvider } from './context/PaletteContext'
import SiteLayout from './layouts/SiteLayout'
import Home from './pages/Home'
import Events from './pages/Events'
import Products from './pages/Products'
import Recordings from './pages/Recordings'
import RecordingSuccess from './pages/RecordingSuccess'
import Generator from './pages/Generator'
import FloatingNav from './components/FloatingNav'
import MobileNav from './components/MobileNav'
import LogoSmall from './components/LogoSmall'

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    () => typeof window !== 'undefined' && window.innerWidth < 768
  )
  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])
  return isMobile
}

function LogoSmallLink() {
  return (
    <Link
      to="/"
      style={{
        position: 'fixed',
        top: 20,
        left: 24,
        zIndex: 100,
        display: 'block',
        textDecoration: 'none',
        opacity: 0.9,
        transition: 'opacity 0.3s',
      }}
      onMouseEnter={e => e.currentTarget.style.opacity = 1}
      onMouseLeave={e => e.currentTarget.style.opacity = 0.9}
    >
      <LogoSmall size={80} />
    </Link>
  )
}

export default function App() {
  const isMobile = useIsMobile()

  return (
    <PaletteProvider>
      {/* Desktop: logo + top floating nav. Mobile: bottom nav only. */}
      {!isMobile && <LogoSmallLink />}
      {!isMobile && <FloatingNav />}
      {isMobile  && <MobileNav />}

      <Routes>
        {/* Generator is fully self-contained with its own palette system */}
        <Route path="/generator" element={<Generator />} />

        {/* All other pages share the site layout with palette context */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/products" element={<Products />} />
          <Route path="/recordings" element={<Recordings />} />
          <Route path="/recordings/success" element={<RecordingSuccess />} />
        </Route>
      </Routes>
    </PaletteProvider>
  )
}
