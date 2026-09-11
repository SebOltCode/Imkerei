// Eine Ebene des Bienenschwarms.
//
// Für den Tiefeneffekt gibt es zwei dieser Szenen: eine hinter dem Text
// und eine davor. Jede Biene existiert in beiden, ist aber immer nur in
// einer sichtbar – welche, entscheidet ihre aktuelle Flugrichtung. Beim
// Richtungswechsel links/rechts taucht sie also hinter den Text ab oder
// kommt davor hervor.
//
// Damit beide Ebenen exakt dieselbe Position berechnen, kommen Routen und
// Zeitbasis von außen (siehe routes.js) statt aus der jeweiligen Szene.

import { useEffect, useMemo } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BEE_LENGTH, createBee, createBeeAssets } from './BeeModel.jsx'
import { sampleRoute, sharedTime } from './routes.js'

const UP = new THREE.Vector3(0, 0, 1) // Rücken zeigt zur Kamera (Draufsicht)
const pos = new THREE.Vector3()
const dir = new THREE.Vector3()
const target = new THREE.Vector3()

function Swarm({ specs, layer, animate }) {
  const assets = useMemo(() => createBeeAssets(), [])
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)

  const bees = useMemo(
    () => specs.map((spec) => ({ obj: createBee(assets), spec })),
    [specs, assets],
  )

  useEffect(() => () => assets.dispose(), [assets])
  useEffect(() => {
    invalidate() // auch im pausierten Zustand ein Bild zeichnen
  }, [invalidate, viewport.width, viewport.height])

  useFrame(() => {
    // Direkt nach dem Mounten steht der Canvas noch auf seiner Standardgröße
    // (300x150) statt auf Fenstergröße. Dann stimmt das Verhältnis
    // Weltmaß/Pixel nicht und die Bienen erschienen kurz riesig.
    // Vergleich bewusst mit clientWidth, nicht mit innerWidth: innerWidth
    // enthält die Scrollleiste, der Canvas nicht – sonst gilt die Szene nie
    // als bereit und es fliegt gar keine Biene mehr.
    const ready = Math.abs(size.width - document.documentElement.clientWidth) <= 4
    if (!ready) {
      bees.forEach(({ obj }) => (obj.visible = false))
      return
    }
    const t = animate ? sharedTime() : 0
    const pxToWorld = viewport.width / Math.max(1, size.width)

    bees.forEach(({ obj: o, spec }) => {
      const resting = sampleRoute(spec.route, t, pos, dir)

      // Flugrichtung bestimmt die Ebene; "flip" ist je Biene anders, damit
      // nicht alle gleichzeitig vor bzw. hinter dem Text fliegen.
      const inFront = dir.x >= 0 !== spec.flip
      const show = inFront === (layer === 'front')
      o.visible = show
      if (!show) return

      // hintere Bienen etwas kleiner – das verkauft die Tiefe
      o.scale.setScalar(((spec.px * pxToWorld) / BEE_LENGTH) * (inFront ? 1 : 0.86))

      const wx = (pos.x - 0.5) * viewport.width
      const wy = (0.5 - pos.y) * viewport.height
      const bob = animate
        ? Math.sin(t * 3.1 + spec.phase) * (resting ? 0.004 : 0.012) * viewport.height
        : 0
      o.position.set(wx, wy + bob, 0)

      if (dir.lengthSq() > 1e-6) {
        dir.normalize()
        o.up.copy(UP)
        target.set(o.position.x + dir.x, o.position.y - dir.y, 0)
        o.lookAt(target)
      }

      if (animate) {
        const amp = resting ? 0.12 : 0.85
        const f = Math.sin(t * Math.PI * 2 * spec.flap + spec.phase) * amp
        o.userData.wingL.rotation.z = 0.12 + f
        o.userData.wingR.rotation.z = -0.12 - f
      }
    })
  })

  return bees.map((b, i) => <primitive key={i} object={b.obj} />)
}

export default function BeeScene({ specs, layer = 'front', active = true, compact = false }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, compact ? 1.25 : 1.6]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 8]} intensity={1.5} color="#fff3da" />
      <directionalLight position={[-4, -2, 4]} intensity={0.5} color="#ffd89a" />
      <Swarm specs={specs} layer={layer} animate={active} />
    </Canvas>
  )
}
