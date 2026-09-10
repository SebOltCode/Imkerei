import { useEffect, useRef } from 'react'

// Karte, die sich in 3D leicht zur Maus neigt – mit einem Glanzlicht,
// das dem Cursor folgt. Auf Touch-Geräten und bei reduzierter Bewegung
// bleibt sie still (dann ist es einfach eine normale Hülle).
export default function TiltCard({ children, className = '', max = 8 }) {
  const ref = useRef(null)
  // Media-Queries einmal anlegen, aber bei jeder Bewegung live auslesen –
  // so stimmt das Verhalten auch, wenn sich Gerät/Einstellungen nach dem
  // Laden ändern (z. B. Maus an ein Tablet angeschlossen).
  const mq = useRef(null)
  useEffect(() => {
    mq.current = {
      hover: window.matchMedia('(hover: hover) and (pointer: fine)'),
      reduced: window.matchMedia('(prefers-reduced-motion: reduce)'),
    }
  }, [])

  const onMove = (e) => {
    const el = ref.current
    const q = mq.current
    if (!el || !q || !q.hover.matches || q.reduced.matches) return
    const rect = el.getBoundingClientRect()
    const px = (e.clientX - rect.left) / rect.width
    const py = (e.clientY - rect.top) / rect.height
    el.style.setProperty('--ry', `${(px - 0.5) * max * 2}deg`)
    el.style.setProperty('--rx', `${(0.5 - py) * max * 2}deg`)
    el.style.setProperty('--gx', `${px * 100}%`)
    el.style.setProperty('--gy', `${py * 100}%`)
    el.style.setProperty('--go', '1')
    el.classList.add('is-tilting')
  }

  const onLeave = () => {
    const el = ref.current
    if (!el) return
    el.style.setProperty('--rx', '0deg')
    el.style.setProperty('--ry', '0deg')
    el.style.setProperty('--go', '0')
    el.classList.remove('is-tilting')
  }

  return (
    <div
      ref={ref}
      className={`tilt ${className}`}
      onPointerMove={onMove}
      onPointerLeave={onLeave}
    >
      {children}
      <span className="tilt__glare" aria-hidden="true" />
    </div>
  )
}
