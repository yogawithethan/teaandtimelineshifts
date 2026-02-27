import { useState, useRef, useEffect } from 'react'
import { PALETTES, bgGrad } from '../context/PaletteContext'

export default function BgCrossfade({ palIdx }) {
  const [layers, setLayers] = useState([{ idx: palIdx, key: 0, opacity: 1 }])
  const keyRef = useRef(0)

  useEffect(() => {
    keyRef.current++
    const nk = keyRef.current
    setLayers(prev => [...prev, { idx: palIdx, key: nk, opacity: 0 }])
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setLayers(prev => prev.map(l => l.key === nk ? { ...l, opacity: 1 } : l))
      })
    })
    const t = setTimeout(() => {
      setLayers([{ idx: palIdx, key: nk, opacity: 1 }])
    }, 900)
    return () => clearTimeout(t)
  }, [palIdx])

  return (
    <>
      {layers.map(l => (
        <div
          key={l.key}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            background: bgGrad(PALETTES[l.idx]),
            opacity: l.opacity,
            transition: 'opacity 0.8s ease',
          }}
        />
      ))}
    </>
  )
}
