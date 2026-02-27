import { createContext, useContext, useState, useCallback, useEffect } from 'react'

export const PALETTES = [
  { name:"sky",bg:["#d6e6f2","#c0d6ea","#b4cce3","#c8dced"],accent:"#7ba8c9",textMain:"#1a1a1a",textSoft:"rgba(0,0,0,0.45)",textFaint:"rgba(0,0,0,0.22)",border:"rgba(0,0,0,0.07)",glass:"rgba(255,255,255,0.28)",shadow:"rgba(120,170,210,0.35)",shadowHover:"rgba(120,170,210,0.5)",orbGlow:"rgba(255,255,255,0.7)" },
  { name:"dusk",bg:["#e8ddd4","#ddd0c5","#d4c4b6","#e0d3c8"],accent:"#b08d6e",textMain:"#2a2018",textSoft:"rgba(42,32,24,0.5)",textFaint:"rgba(42,32,24,0.22)",border:"rgba(42,32,24,0.07)",glass:"rgba(255,255,255,0.3)",shadow:"rgba(176,141,110,0.35)",shadowHover:"rgba(176,141,110,0.5)",orbGlow:"rgba(255,255,255,0.65)" },
  { name:"ocean",bg:["#0f1923","#0a1628","#0d1f35","#111e2e"],accent:"#4a8bc2",textMain:"#c8dae8",textSoft:"rgba(200,218,232,0.6)",textFaint:"rgba(200,218,232,0.3)",border:"rgba(200,218,232,0.08)",glass:"rgba(255,255,255,0.04)",shadow:"rgba(74,139,194,0.3)",shadowHover:"rgba(74,139,194,0.5)",orbGlow:"rgba(74,139,194,0.5)" },
  { name:"cosmos",bg:["#0d0a18","#12081f","#1a0e2a","#0f0b1e"],accent:"#9b6fdf",textMain:"#d4c8e8",textSoft:"rgba(212,200,232,0.6)",textFaint:"rgba(212,200,232,0.28)",border:"rgba(212,200,232,0.08)",glass:"rgba(255,255,255,0.03)",shadow:"rgba(155,111,223,0.3)",shadowHover:"rgba(155,111,223,0.5)",orbGlow:"rgba(155,111,223,0.5)" },
  { name:"sage",bg:["#d4dfd6","#c5d6c9","#b8cebe","#cddad0"],accent:"#7a9e82",textMain:"#1a221c",textSoft:"rgba(26,34,28,0.5)",textFaint:"rgba(26,34,28,0.22)",border:"rgba(26,34,28,0.07)",glass:"rgba(255,255,255,0.28)",shadow:"rgba(122,158,130,0.35)",shadowHover:"rgba(122,158,130,0.5)",orbGlow:"rgba(255,255,255,0.65)" },
  { name:"ember",bg:["#1a0f0a","#201008","#2a1510","#1c110c"],accent:"#d4845a",textMain:"#e8d0c0",textSoft:"rgba(232,208,192,0.6)",textFaint:"rgba(232,208,192,0.28)",border:"rgba(232,208,192,0.08)",glass:"rgba(255,255,255,0.03)",shadow:"rgba(212,132,90,0.3)",shadowHover:"rgba(212,132,90,0.5)",orbGlow:"rgba(212,132,90,0.5)" },
  { name:"lavender",bg:["#ddd6e8","#d2c9e0","#c7bdd8","#d6cfe2"],accent:"#9a82b8",textMain:"#1e1a24",textSoft:"rgba(30,26,36,0.5)",textFaint:"rgba(30,26,36,0.22)",border:"rgba(30,26,36,0.07)",glass:"rgba(255,255,255,0.28)",shadow:"rgba(154,130,184,0.35)",shadowHover:"rgba(154,130,184,0.5)",orbGlow:"rgba(255,255,255,0.65)" },
  { name:"void",bg:["#060608","#0a0a10","#08080e","#050507"],accent:"#5a5a7a",textMain:"#a0a0b8",textSoft:"rgba(160,160,184,0.55)",textFaint:"rgba(160,160,184,0.25)",border:"rgba(160,160,184,0.06)",glass:"rgba(255,255,255,0.02)",shadow:"rgba(90,90,122,0.25)",shadowHover:"rgba(90,90,122,0.45)",orbGlow:"rgba(160,160,184,0.35)" },
]

export const bgGrad = p =>
  `linear-gradient(180deg,${p.bg[0]} 0%,${p.bg[1]} 30%,${p.bg[2]} 60%,${p.bg[3]} 100%)`

const PaletteContext = createContext(null)

export function PaletteProvider({ children }) {
  const [palIdx, setPalIdx] = useState(0)
  const pal = PALETTES[palIdx]
  const shiftPalette = useCallback(() => setPalIdx(p => (p + 1) % PALETTES.length), [])

  // Sync with Generator's internal palette when it shifts
  useEffect(() => {
    const handler = e => setPalIdx(e.detail)
    window.addEventListener('tts-palette-shift', handler)
    return () => window.removeEventListener('tts-palette-shift', handler)
  }, [])

  return (
    <PaletteContext.Provider value={{ palIdx, pal, shiftPalette }}>
      {children}
    </PaletteContext.Provider>
  )
}

export function usePalette() {
  return useContext(PaletteContext)
}
