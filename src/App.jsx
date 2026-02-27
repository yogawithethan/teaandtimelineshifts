import { Routes, Route, Link } from 'react-router-dom'
import { PaletteProvider } from './context/PaletteContext'
import SiteLayout from './layouts/SiteLayout'
import Home from './pages/Home'
import Events from './pages/Events'
import Products from './pages/Products'
import Generator from './pages/Generator'
import LogoSmall from './components/LogoSmall'

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
  return (
    <PaletteProvider>
      <LogoSmallLink />
      <Routes>
        {/* Generator is fully self-contained with its own palette system */}
        <Route path="/generator" element={<Generator />} />

        {/* All other pages share the site layout with palette context */}
        <Route element={<SiteLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/products" element={<Products />} />
        </Route>
      </Routes>
    </PaletteProvider>
  )
}
