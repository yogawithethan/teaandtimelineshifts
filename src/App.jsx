import { Routes, Route } from 'react-router-dom'
import SiteLayout from './layouts/SiteLayout'
import Home from './pages/Home'
import Events from './pages/Events'
import Products from './pages/Products'
import Generator from './pages/Generator'

export default function App() {
  return (
    <Routes>
      {/* Generator gets its own full-screen layout (no nav) */}
      <Route path="/generator" element={<Generator />} />

      {/* All other pages share the site layout with nav */}
      <Route element={<SiteLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/events" element={<Events />} />
        <Route path="/products" element={<Products />} />
      </Route>
    </Routes>
  )
}
