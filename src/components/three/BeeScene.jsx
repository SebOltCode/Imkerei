// Der Bienenschwarm als 3D-Szene über der ganzen Seite.
//
// Die Bienen fliegen auf zufälligen Wegpunkt-Routen quer durch das Bild,
// lassen sich zwischendurch kurz nieder (Rast), drehen sich in die
// Flugrichtung und schlagen mit den Flügeln.

import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import * as THREE from 'three'
import { BEE_LENGTH, createBee, createBeeAssets, makeRoute, sampleRoute } from './BeeModel.jsx'

const UP = new THREE.Vector3(0, 0, 1) // Rücken zeigt zur Kamera (Draufsicht)

// Route in Bildanteilen (0..1); darf seitlich aus dem Bild laufen
const makeFlightRoute = () =>
  makeRoute({
    cx: 0.5,
    cy: 0.48,
    w: 1.24,
    h: 0.84,
    speed: 0.1 + Math.random() * 0.1,
    holdChance: 0.35,
  })

const pos = new THREE.Vector3()
const dir = new THREE.Vector3()
const target = new THREE.Vector3()

function Swarm({ specs, animate }) {
  const assets = useMemo(() => createBeeAssets(), [])
  const viewport = useThree((s) => s.viewport)
  const size = useThree((s) => s.size)
  const invalidate = useThree((s) => s.invalidate)

  const bees = useMemo(
    () =>
      specs.map((sp) => ({
        obj: createBee(assets),
        route: makeFlightRoute(),
        px: sp.px,
        flap: 13 + Math.random() * 5, // Flügelschläge je Sekunde
        phase: Math.random() * Math.PI * 2,
      })),
    [specs, assets],
  )

  useEffect(() => () => assets.dispose(), [assets])

  // Auch im pausierten Zustand ein Bild zeichnen
  useEffect(() => {
    invalidate()
  }, [invalidate, viewport.width, viewport.height])

  useFrame((state) => {
    const t = state.clock.elapsedTime
    const pxToWorld = viewport.width / Math.max(1, size.width)

    bees.forEach((b) => {
      const resting = sampleRoute(b.route, animate ? t : 0, pos, dir)
      const o = b.obj
      o.scale.setScalar((b.px * pxToWorld) / BEE_LENGTH)

      // Bildanteile -> Weltkoordinaten
      const wx = (pos.x - 0.5) * viewport.width
      const wy = (0.5 - pos.y) * viewport.height
      // leichtes Auf und Ab, im Flug stärker als im Sitzen
      const bob = animate ? Math.sin(t * 3.1 + b.phase) * (resting ? 0.004 : 0.012) * viewport.height : 0
      o.position.set(wx, wy + bob, 0)

      // in Flugrichtung ausrichten (Rücken zur Kamera)
      if (dir.lengthSq() > 1e-6) {
        dir.normalize()
        o.up.copy(UP)
        target.set(o.position.x + dir.x, o.position.y - dir.y, 0)
        o.lookAt(target)
      }

      if (animate) {
        // Flügelschlag; beim Rasten deutlich ruhiger
        const amp = resting ? 0.12 : 0.85
        const f = Math.sin(t * Math.PI * 2 * b.flap + b.phase) * amp
        o.userData.wingL.rotation.z = 0.12 + f
        o.userData.wingR.rotation.z = -0.12 - f
      }
    })
  })

  return bees.map((b, i) => <primitive key={i} object={b.obj} />)
}

export default function BeeScene({ active = true, reducedMotion = false, compact = false }) {
  const animate = active && !reducedMotion

  // Größen in Pixeln – die kleinen wirken weiter entfernt
  const specs = useMemo(() => {
    const sizes = compact ? [46, 32, 24] : [54, 42, 32, 48, 26]
    return sizes.map((px) => ({ px }))
  }, [compact])

  return (
    <Canvas
      frameloop={animate ? 'always' : 'demand'}
      dpr={[1, compact ? 1.25 : 1.6]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.75} />
      <directionalLight position={[3, 5, 8]} intensity={1.5} color="#fff3da" />
      <directionalLight position={[-4, -2, 4]} intensity={0.5} color="#ffd89a" />
      <Swarm specs={specs} animate={animate} />
    </Canvas>
  )
}
