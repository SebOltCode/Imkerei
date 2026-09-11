// Der Bienenschwarm 🐝 – jetzt als 3D-Szene (Three.js) über der Seite.
//
// Der Canvas liegt fest über dem Viewport (unter der Navigation, über dem
// Inhalt) und lässt Klicks durch. Geladen wird er erst, wenn der Browser
// Luft hat; pausiert wird, sobald der Tab in den Hintergrund geht.
// Bei "prefers-reduced-motion: reduce" bleibt der Schwarm ganz aus.

import { Component, Suspense, lazy, useEffect, useMemo, useState } from 'react'
import { makeFlightRoute } from './three/routes.js'

const BeeScene = lazy(() => import('./three/BeeScene.jsx'))

class SceneBoundary extends Component {
  state = { failed: false }
  static getDerivedStateFromError() {
    return { failed: true }
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

export default function AnimatedBee() {
  const [ready, setReady] = useState(false)
  const [visible, setVisible] = useState(true)
  const compact = useMediaQuery('(max-width: 640px)')
  const reducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')

  useEffect(() => {
    if ('requestIdleCallback' in window) {
      const id = window.requestIdleCallback(() => setReady(true), { timeout: 2000 })
      return () => window.cancelIdleCallback(id)
    }
    const id = setTimeout(() => setReady(true), 400)
    return () => clearTimeout(id)
  }, [])

  // Im Hintergrund-Tab nicht weiterrechnen
  useEffect(() => {
    const onVis = () => setVisible(!document.hidden)
    document.addEventListener('visibilitychange', onVis)
    return () => document.removeEventListener('visibilitychange', onVis)
  }, [])

  // Routen hier erzeugen, nicht in den Szenen: Beide Ebenen müssen exakt
  // dieselben verwenden, sonst passt die Biene beim Wechsel nicht zusammen.
  const specs = useMemo(() => {
    const sizes = compact ? [46, 32, 24] : [54, 42, 32, 48, 26]
    return sizes.map((px) => ({
      px,
      route: makeFlightRoute(),
      flap: 13 + Math.random() * 5, // Flügelschläge je Sekunde
      phase: Math.random() * Math.PI * 2,
      // entscheidet, welche Flugrichtung vor dem Text liegt – je Biene anders
      flip: Math.random() < 0.5,
    }))
  }, [compact])

  if (reducedMotion || !ready) return null

  return (
    <SceneBoundary>
      <Suspense fallback={null}>
        {/* hinter dem Text, aber über den Sektions-Hintergründen */}
        <div className="bee-canvas bee-canvas--back" aria-hidden="true">
          <BeeScene specs={specs} layer="back" active={visible} compact={compact} />
        </div>
        {/* vor dem Text */}
        <div className="bee-canvas bee-canvas--front" aria-hidden="true">
          <BeeScene specs={specs} layer="front" active={visible} compact={compact} />
        </div>
      </Suspense>
    </SceneBoundary>
  )
}
