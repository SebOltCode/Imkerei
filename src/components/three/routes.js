// Wegpunkt-Routen für fliegende wie laufende Bienen.
//
// Bewusst ohne Three.js-Import: Diese Datei wird auch außerhalb der
// 3D-Szenen geladen (die Routen entstehen eine Ebene höher, damit beide
// Canvas-Ebenen dieselben verwenden). Ein Import von "three" hier würde
// die ganze Bibliothek ins Haupt-Bundle ziehen.

const smoothstep = (p) => p * p * (3 - 2 * p)

// Gemeinsame Zeitbasis für alle Szenen. Beide Bienen-Ebenen müssen exakt
// dieselbe Zeit verwenden, sonst springt eine Biene beim Ebenenwechsel.
const T0 = typeof performance !== 'undefined' ? performance.now() : 0
export const sharedTime = () =>
  (typeof performance !== 'undefined' ? performance.now() - T0 : 0) / 1000

// Zufällige Route innerhalb eines Rechtecks. An manchen Wegpunkten wird
// gerastet – Bienen halten ständig an, das wirkt natürlicher als Dauerlauf.
export function makeRoute({
  cx = 0,
  cy = 0,
  w = 1,
  h = 1,
  speed = 0.15,
  holdChance = 0.35,
  minHold = 0.7,
  maxHold = 2.6,
  minPts = 5,
  maxPts = 7,
} = {}) {
  const n = minPts + Math.floor(Math.random() * (maxPts - minPts + 1))
  const pts = Array.from({ length: n }, () => ({
    x: cx + (Math.random() - 0.5) * w,
    y: cy + (Math.random() - 0.5) * h,
    hold: Math.random() < holdChance ? minHold + Math.random() * (maxHold - minHold) : 0,
  }))
  const segs = pts.map((p, i) => {
    const q = pts[(i + 1) % n]
    const d = Math.hypot(q.x - p.x, q.y - p.y)
    return { from: p, to: q, travel: Math.max(0.5, d / speed), hold: p.hold }
  })
  const total = segs.reduce((a, s) => a + s.travel + s.hold, 0)
  return { segs, total, t0: Math.random() * total }
}

// Flugroute in Bildanteilen (0..1); darf seitlich aus dem Bild laufen.
export const makeFlightRoute = () =>
  makeRoute({
    cx: 0.5,
    cy: 0.48,
    w: 1.24,
    h: 0.84,
    speed: 0.1 + Math.random() * 0.1,
    holdChance: 0.35,
  })

// Position und Richtung zu einem Zeitpunkt. Gibt zurück, ob gerade gerastet
// wird. Schreibt in outPos.x/y und outDir.x/y (z bleibt unberührt).
export function sampleRoute(route, time, outPos, outDir) {
  let t = (time + route.t0) % route.total
  for (const s of route.segs) {
    if (t < s.hold) {
      outPos.set(s.from.x, s.from.y, 0)
      outDir.set(s.to.x - s.from.x, s.to.y - s.from.y, 0)
      return true
    }
    t -= s.hold
    if (t < s.travel) {
      const e = smoothstep(t / s.travel) // sanft anfahren und abbremsen
      outPos.set(s.from.x + (s.to.x - s.from.x) * e, s.from.y + (s.to.y - s.from.y) * e, 0)
      outDir.set(s.to.x - s.from.x, s.to.y - s.from.y, 0)
      return false
    }
    t -= s.travel
  }
  const last = route.segs[route.segs.length - 1]
  outPos.set(last.to.x, last.to.y, 0)
  outDir.set(1, 0, 0)
  return false
}
