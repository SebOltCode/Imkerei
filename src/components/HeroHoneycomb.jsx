// Hülle um die 3D-Honigwabe:
//  - rendert im Hero-Raster einen Platzhalter (.hero__3d), der nur den Platz
//    reserviert; die Wabe wird später genau dort hineingerechnet
//  - der eigentliche Canvas wird per Portal über den GANZEN Hero gelegt,
//    damit der Honig bis zum unteren Rand tropfen kann
//  - lädt das Three.js-Bundle erst, wenn der Browser Luft hat (Lazy Loading)
//  - rendert nur, solange der Hero im sichtbaren Bereich ist
//  - CSS-Platzhalter, falls WebGL fehlt oder das Laden scheitert
//  - respektiert "prefers-reduced-motion"

import { Component, Suspense, lazy, useCallback, useEffect, useState } from 'react'
import { createPortal } from 'react-dom'

const HoneycombScene = lazy(() => import('./three/HoneycombScene.jsx'))

// Fängt Fehler der 3D-Szene ab (z. B. kein WebGL)
class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
  }
  componentDidCatch() {
    this.props.onError?.()
  }
  render() {
    return this.state.failed ? null : this.props.children
  }
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const update = () => setMatches(mq.matches)
    update()
    mq.addEventListener('change', update)
    return () => mq.removeEventListener('change', update)
  }, [query])
  return matches
}

export default function HeroHoneycomb() {
  // Bewusst als State-DOM-Knoten (nicht als Ref-Objekt): so lösen ein
  // gesetzter Knoten und ein Re-Render zuverlässig aus, und es müssen
  // keine Refs über die Canvas-Grenze gereicht werden.
  const [spacerEl, setSpacerEl] = useState(null)
  const [heroEl, setHeroEl] = useState(null) // Portal-Ziel: die Hero-Section
  const [ready, setReady] = useState(false) // 3D erst nach dem ersten Paint laden
  const [loaded, setLoaded] = useState(false) // Szene gerendert?
  const [failed, setFailed] = useState(false)
  const [active, setActive] = useState(true) // Hero im Bild?
  const compact = useMediaQuery('(max-width: 640px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    setHeroEl(spacerEl?.closest('.hero') ?? null)
  }, [spacerEl])

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 1500 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setReady(true), 300)
    return () => clearTimeout(id)
  }, [])

  useEffect(() => {
    if (!heroEl) return
    const io = new IntersectionObserver(([entry]) => setActive(entry.isIntersecting), {
      threshold: 0.02,
    })
    io.observe(heroEl)
    return () => io.disconnect()
  }, [heroEl])

  const onLoaded = useCallback(() => setLoaded(true), [])
  const onError = useCallback(() => setFailed(true), [])

  const showScene = ready && heroEl && spacerEl && !failed

  return (
    <>
      <div ref={setSpacerEl} className="hero__3d" aria-hidden="true">
        <div className="hero__3d-glow" />
        {(!loaded || failed) && <div className="hero__3d-fallback" />}
      </div>

      {showScene &&
        createPortal(
          <div className="hero__canvas" aria-hidden="true">
            <SceneBoundary onError={onError}>
              <Suspense fallback={null}>
                <HoneycombScene
                  active={active}
                  reducedMotion={reducedMotion}
                  compact={compact}
                  spacerEl={spacerEl}
                  heroEl={heroEl}
                  onLoaded={onLoaded}
                />
              </Suspense>
            </SceneBoundary>
          </div>,
          heroEl,
        )}
    </>
  )
}
