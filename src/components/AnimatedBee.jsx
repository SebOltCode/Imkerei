// Der Bienenschwarm 🐝 – jetzt als 3D-Szene (Three.js) über der Seite.
//
// Der Canvas liegt fest über dem Viewport (unter der Navigation, über dem
// Inhalt) und lässt Klicks durch. Geladen wird er erst, wenn der Browser
// Luft hat; pausiert wird, sobald der Tab in den Hintergrund geht.
// Bei "prefers-reduced-motion: reduce" bleibt der Schwarm ganz aus.

import { Component, Suspense, lazy, useEffect, useState } from 'react'

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

  if (reducedMotion || !ready) return null

  return (
    <div className="bee-canvas" aria-hidden="true">
      <SceneBoundary>
        <Suspense fallback={null}>
          <BeeScene active={visible} reducedMotion={reducedMotion} compact={compact} />
        </Suspense>
      </SceneBoundary>
    </div>
  )
}
