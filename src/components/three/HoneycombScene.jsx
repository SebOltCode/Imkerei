// 3D-Honigwabe im Rähmchen mit fließendem Honig (Three.js / @react-three/fiber) 🍯
//
// Vorbild ist eine echte Imker-Wabe: ein Holzrähmchen mit hunderten feiner
// Zellen – oben weiß verdeckelt, unten goldener Honig, dazwischen eine
// unregelmäßige Grenze. Aus dem Unterträger fließt Honig als zäher Faden
// nach unten, wird dünner, reißt ab und hinterlässt fallende Tropfen.
// Am unteren Bildschirmrand sammeln sich daraus Pfützen.
//
// Die vielen Zellen werden als InstancedMesh gezeichnet (wenige Draw-Calls).
// Der Canvas liegt über dem ganzen Hero; die Wabe wird an der Position des
// Layout-Platzhalters (.hero__3d) eingerechnet.

import { useEffect, useLayoutEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Environment, Float, Lightformer } from '@react-three/drei'
import * as THREE from 'three'

// --- Wabenraster ---------------------------------------------------------
const CELL_R = 0.085 // Umkreisradius einer Zelle
const DX = Math.sqrt(3) * CELL_R // Spaltenabstand
const DY = 1.5 * CELL_R // Zeilenabstand
const CELL_D = 0.16 // Zelltiefe
const BAR = 0.17 // Stärke der Rähmchen-Leisten
const LUG = 0.24 // Überstand der "Ohren" am Oberträger

const smooth = (p) => p * p * (3 - 2 * p)
const clamp01 = (v) => (v < 0 ? 0 : v > 1 ? 1 : v)

function mulberry32(seed) {
  return function () {
    seed |= 0
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function hexShape(radius) {
  const s = new THREE.Shape()
  for (let k = 0; k < 6; k++) {
    const a = Math.PI / 6 + (k * Math.PI) / 3
    const x = radius * Math.cos(a)
    const y = radius * Math.sin(a)
    if (k === 0) s.moveTo(x, y)
    else s.lineTo(x, y)
  }
  s.closePath()
  return s
}

// Zellen erzeugen: Raster + Zuordnung verdeckelt / Honig / leer
function buildComb(cols, rows) {
  const rnd = mulberry32(11)
  const innerW = cols * DX
  const innerH = rows * DY
  const cells = []

  // Wellige Grenze zwischen verdeckeltem (oben) und offenem Honig (unten)
  const boundary = (x) => {
    const u = x / innerW
    return (
      innerH * 0.06 +
      innerH * 0.17 * Math.sin(u * 5.2 + 0.6) +
      innerH * 0.08 * Math.sin(u * 11.3 + 2.1)
    )
  }

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      // Versatz jeder zweiten Zeile (dichteste Packung)
      const x = c * DX + (r % 2 ? DX / 2 : 0) - innerW / 2
      const y = r * DY - innerH / 2
      if (Math.abs(x) > innerW / 2 - CELL_R * 0.4) continue

      const b = boundary(x)
      const d = y - b // >0 = oberhalb der Grenze
      const noise = (rnd() - 0.5) * DY * 2.4
      let kind = d + noise > 0 ? 'cap' : 'honey'
      // ganz vereinzelt offene Zellen für Lebendigkeit
      if (rnd() < 0.012) kind = 'open'
      cells.push({ x, y, kind, v: rnd() })
    }
  }
  return { cells, innerW, innerH }
}

function useCombData(cols, rows) {
  return useMemo(() => buildComb(cols, rows), [cols, rows])
}

function useGeometries() {
  return useMemo(() => {
    // Zellwand: Sechseck-Ring, flach extrudiert (ohne Bevel – viele Instanzen)
    const ring = hexShape(CELL_R)
    ring.holes.push(hexShape(CELL_R * 0.78))
    const wall = new THREE.ExtrudeGeometry(ring, { depth: CELL_D, bevelEnabled: false })
    wall.translate(0, 0, -CELL_D / 2)

    // Honigfüllung: flaches Sechseck-Prisma
    const honey = new THREE.CylinderGeometry(CELL_R * 0.79, CELL_R * 0.79, CELL_D * 0.72, 6)
    honey.rotateX(Math.PI / 2)

    // Wachsdeckel: leicht gewölbte Kuppe
    const cap = new THREE.SphereGeometry(CELL_R * 0.82, 8, 4, 0, Math.PI * 2, 0, Math.PI / 2)
    cap.rotateX(Math.PI / 2)
    cap.scale(1, 1, 0.34)

    // Fließender Honig: Zylindersegment (zwischen zwei Punkten aufgespannt)
    const seg = new THREE.CylinderGeometry(1, 1, 1, 10, 1, true)

    const blob = new THREE.SphereGeometry(1, 18, 12)
    const particle = new THREE.CylinderGeometry(0.055, 0.055, 0.03, 6)
    particle.rotateX(Math.PI / 2)
    return { wall, honey, cap, seg, blob, particle }
  }, [])
}

function useMaterials() {
  return useMemo(() => {
    // Honig: sehr glatt, klarer Lack + leichtes Eigenleuchten (statt teurem
    // "transmission", das pro Bild eine zusätzliche Szene rendern würde)
    const honeyMat = (color, emissive, opacity = 1) =>
      new THREE.MeshPhysicalMaterial({
        color,
        roughness: 0.08,
        metalness: 0,
        clearcoat: 1,
        clearcoatRoughness: 0.04,
        emissive: new THREE.Color(emissive),
        emissiveIntensity: 0.45,
        transparent: opacity < 1,
        opacity,
      })
    return {
      wall: new THREE.MeshPhysicalMaterial({
        color: '#e8c98b',
        roughness: 0.72,
        clearcoat: 0.12,
      }),
      honey: honeyMat('#e0921f', '#8a4b00'),
      flow: honeyMat('#e79c22', '#8f5000', 0.95),
      cap: new THREE.MeshPhysicalMaterial({
        color: '#f6ecd6',
        roughness: 0.86,
        clearcoat: 0.06,
      }),
      open: new THREE.MeshStandardMaterial({ color: '#8a6428', roughness: 0.95 }),
      wood: new THREE.MeshStandardMaterial({ color: '#b3803f', roughness: 0.82 }),
      woodDark: new THREE.MeshStandardMaterial({ color: '#8a5f28', roughness: 0.88 }),
    }
  }, [])
}

// Statische Instanzen (Zellen) einmalig setzen.
// "tint" darf pro Zelle eine leichte Farbabweichung liefern – echte Waben
// sind nie gleichförmig, das nimmt der Fläche das Künstliche.
const tintColor = new THREE.Color()
function useInstances(ref, items, place, tint) {
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    const d = new THREE.Object3D()
    items.forEach((it, i) => {
      place(d, it)
      d.updateMatrix()
      mesh.setMatrixAt(i, d.matrix)
      if (tint) {
        tint(tintColor, it)
        mesh.setColorAt(i, tintColor)
      }
    })
    mesh.count = items.length
    mesh.instanceMatrix.needsUpdate = true
    if (tint && mesh.instanceColor) mesh.instanceColor.needsUpdate = true
    mesh.computeBoundingSphere?.()
  }, [ref, items, place, tint])
}

function Comb({ combRef, data, geo, mats }) {
  const { cells, innerW, innerH } = data
  const wallRef = useRef()
  const honeyRef = useRef()
  const capRef = useRef()
  const openRef = useRef()

  const groups = useMemo(
    () => ({
      all: cells,
      honey: cells.filter((c) => c.kind === 'honey'),
      cap: cells.filter((c) => c.kind === 'cap'),
      open: cells.filter((c) => c.kind === 'open'),
    }),
    [cells],
  )

  const placeWall = useMemo(() => (d, c) => d.position.set(c.x, c.y, 0), [])
  const placeHoney = useMemo(
    () => (d, c) => {
      // Füllstand leicht variieren – wirkt lebendiger
      d.position.set(c.x, c.y, -CELL_D * 0.1 + c.v * CELL_D * 0.1)
      d.scale.set(1, 1, 0.8 + c.v * 0.35)
    },
    [],
  )
  const placeCap = useMemo(() => (d, c) => d.position.set(c.x, c.y, CELL_D / 2 - 0.005), [])
  const placeOpen = useMemo(() => (d, c) => d.position.set(c.x, c.y, -CELL_D * 0.3), [])

  // leichte Farbstreuung je Zelle (v ist ein fester Zufallswert pro Zelle)
  const tintWall = useMemo(() => (col, c) => col.setScalar(0.88 + c.v * 0.24), [])
  const tintHoney = useMemo(
    () => (col, c) => col.setRGB(0.82 + c.v * 0.3, 0.62 + c.v * 0.3, 0.28 + c.v * 0.22),
    [],
  )
  const tintCap = useMemo(() => (col, c) => col.setScalar(0.86 + c.v * 0.26), [])

  useInstances(wallRef, groups.all, placeWall, tintWall)
  useInstances(honeyRef, groups.honey, placeHoney, tintHoney)
  useInstances(capRef, groups.cap, placeCap, tintCap)
  useInstances(openRef, groups.open, placeOpen)

  const outerW = innerW + BAR * 2
  const outerH = innerH + BAR * 2
  const zBar = 0

  return (
    <group ref={combRef}>
      <instancedMesh ref={wallRef} args={[geo.wall, mats.wall, groups.all.length]} />
      <instancedMesh ref={honeyRef} args={[geo.honey, mats.honey, groups.honey.length]} />
      <instancedMesh ref={capRef} args={[geo.cap, mats.cap, groups.cap.length]} />
      {/* offene, leere Zellen: gleiche Form wie die Füllung, nur dunkel */}
      <instancedMesh ref={openRef} args={[geo.honey, mats.open, Math.max(1, groups.open.length)]} />

      {/* --- Rähmchen aus Holz --- */}
      {/* Oberträger mit Ohren */}
      <mesh position={[0, innerH / 2 + BAR / 2, zBar]} material={mats.wood}>
        <boxGeometry args={[outerW + LUG * 2, BAR, CELL_D + 0.14]} />
      </mesh>
      {/* Unterträger */}
      <mesh position={[0, -innerH / 2 - BAR / 2, zBar]} material={mats.wood}>
        <boxGeometry args={[outerW, BAR, CELL_D + 0.14]} />
      </mesh>
      {/* Seitenteile */}
      <mesh position={[-innerW / 2 - BAR / 2, 0, zBar]} material={mats.woodDark}>
        <boxGeometry args={[BAR, innerH, CELL_D + 0.14]} />
      </mesh>
      <mesh position={[innerW / 2 + BAR / 2, 0, zBar]} material={mats.woodDark}>
        <boxGeometry args={[BAR, innerH, CELL_D + 0.14]} />
      </mesh>
    </group>
  )
}

function Particles({ count, geo, animate }) {
  const items = useMemo(() => {
    const rnd = mulberry32(21)
    return Array.from({ length: count }, () => ({
      pos: [(rnd() - 0.5) * 9, (rnd() - 0.5) * 5.5, (rnd() - 0.5) * 2 - 0.8],
      speed: 1 + rnd() * 1.5,
      rot: rnd() * Math.PI,
      scale: 0.6 + rnd() * 0.9,
    }))
  }, [count])
  return items.map((p, i) => (
    <Float key={i} speed={animate ? p.speed : 0} rotationIntensity={0.6} floatIntensity={1.2}>
      <mesh geometry={geo.particle} position={p.pos} rotation={[0.4, p.rot, 0]} scale={p.scale}>
        <meshPhysicalMaterial color="#f3c057" roughness={0.25} clearcoat={0.9} transparent opacity={0.75} />
      </mesh>
    </Float>
  ))
}

// --- Fließender Honig ----------------------------------------------------
const SEGS = 15 // Segmente je Honigfaden
const POOLS = 8
const Y_AXIS = new THREE.Vector3(0, 1, 0)
const vA = new THREE.Vector3()
const vB = new THREE.Vector3()
const vDir = new THREE.Vector3()
const nozzleWorld = new THREE.Vector3()

function Stage({ cols, rows, pointer, animate, spacerEl, heroEl, onLoaded }) {
  const viewport = useThree((s) => s.viewport)
  const invalidate = useThree((s) => s.invalidate)
  const geo = useGeometries()
  const mats = useMaterials()
  const data = useCombData(cols, rows)

  const combRef = useRef()
  const flowRef = useRef() // Fadensegmente (instanziert)
  const blobRef = useRef() // hängende + fallende Tropfen, Pfützen (instanziert)
  const layout = useRef({ x: 0, y: 0, s: 1 })
  const dummy = useMemo(() => new THREE.Object3D(), [])

  // Genau zwei Austrittsstellen: eine zufällig in der linken, eine in der
  // rechten Hälfte des Unterträgers. Bewusst echtes Math.random(), damit die
  // Wabe bei jedem Seitenaufruf anders tropft.
  const sources = useMemo(() => {
    const half = data.innerW * 0.42
    const y = -data.innerH / 2 - BAR
    return [-1, 1].map((side) => ({
      x: side * half * (0.25 + Math.random() * 0.75),
      y,
      // eigener Phasenversatz, damit die beiden Fäden nicht im Gleichtakt schwingen
      phase: Math.random() * Math.PI * 2,
    }))
  }, [data.innerW, data.innerH])

  const sim = useMemo(
    () => ({
      flows: sources.map((s) => ({
        phase: 'wait',
        t: 0.5 + Math.random() * 4.5, // zufälliger Start, kein Reihum
        tipY: 0,
        vy: 0,
        neck: 0, // Grad der Einschnürung (0 = keine, 1 = durchtrennt)
        pinchU: 0.3, // wo der Faden einschnürt (0 = oben, 1 = Spitze)
        retractLen: 0,
        swellDur: 0.9,
        flowDur: 3,
        short: false,
        shortT: 1,
        src: s,
      })),
      pieces: [], // abgerissene, fallende Honigstücke
      pools: Array.from({ length: POOLS }, () => ({ active: false, x: 0, size: 0, target: 0, idle: 0 })),
    }),
    [sources],
  )

  useEffect(() => {
    onLoaded?.()
  }, [onLoaded])

  // Layout: Platzhalter-Rechteck -> Weltkoordinaten
  useEffect(() => {
    if (!spacerEl || !heroEl) return
    const nativeW = data.innerW + BAR * 2 + LUG * 2
    const measure = () => {
      const hero = heroEl.getBoundingClientRect()
      const r = spacerEl.getBoundingClientRect()
      if (!hero.width || !hero.height) return
      const cx = (r.left + r.width / 2 - hero.left) / hero.width
      const cy = (r.top + r.height / 2 - hero.top) / hero.height
      layout.current = {
        x: (cx - 0.5) * viewport.width,
        y: (0.5 - cy) * viewport.height,
        s: (((r.width / hero.width) * viewport.width) / nativeW) * 0.98,
      }
      // Auch ohne laufende Animation korrekt platzieren
      const comb = combRef.current
      if (comb) {
        comb.position.set(layout.current.x, layout.current.y, 0)
        comb.scale.setScalar(layout.current.s)
      }
      invalidate()
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(heroEl)
    ro.observe(spacerEl)
    return () => ro.disconnect()
  }, [viewport.width, viewport.height, heroEl, spacerEl, data.innerW, invalidate])

  const addToPool = (x, amount, S) => {
    const { pools } = sim
    let p = pools.find((q) => q.active && Math.abs(q.x - x) < 0.5 * S)
    if (!p) {
      p = pools.find((q) => !q.active) || pools.reduce((a, b) => (a.size < b.size ? a : b))
      Object.assign(p, { active: true, x, size: 0.01, target: 0.1 * S })
    }
    // bewusst kleiner Deckel: es sollen kleine Pfützen bleiben, kein Honigband
    p.target = Math.min(0.3 * S, p.target + amount)
    p.idle = 0
  }

  useFrame((state, delta) => {
    const comb = combRef.current
    const flow = flowRef.current
    const blobs = blobRef.current
    if (!comb || !flow || !blobs) return
    const dt = Math.min(delta, 0.05)
    const t = state.clock.elapsedTime
    const L = layout.current
    const S = L.s

    // Wabe platzieren + sanft neigen
    comb.position.set(L.x, L.y + (animate ? Math.sin(t * 0.8) * 0.035 * S : 0), 0)
    comb.scale.setScalar(S)
    const tx = animate ? pointer.current.y * -0.18 + Math.sin(t * 0.25) * 0.03 : 0
    const ty = animate ? pointer.current.x * 0.26 + Math.sin(t * 0.31) * 0.08 : 0
    comb.rotation.x = THREE.MathUtils.lerp(comb.rotation.x, tx, 0.05)
    comb.rotation.y = THREE.MathUtils.lerp(comb.rotation.y, ty, 0.05)
    comb.updateMatrixWorld()

    if (!animate) {
      flow.count = 0
      blobs.count = 0
      flow.instanceMatrix.needsUpdate = true
      blobs.instanceMatrix.needsUpdate = true
      return
    }

    const floorY = -viewport.height / 2
    const { flows, pieces, pools } = sim
    let segIdx = 0
    let blobIdx = 0

    flows.forEach((f) => {
      // Austrittspunkt in Weltkoordinaten (die Wabe wippt leicht)
      nozzleWorld.set(f.src.x, f.src.y, CELL_D)
      comb.localToWorld(nozzleWorld)
      const nx = nozzleWorld.x
      const ny = nozzleWorld.y

      if (f.phase === 'wait') {
        f.t -= dt
        if (f.t <= 0) {
          // Alle Kennwerte für JEDEN Zyklus neu würfeln – so wiederholt
          // sich der Rhythmus nie und die beiden Fäden laufen nie im Takt.
          f.phase = 'swell'
          f.t = 0
          f.tipY = ny
          f.vy = 0
          f.neck = 0
          f.swellDur = 0.7 + Math.random() * 0.5
          f.flowDur = 1.2 + Math.random() * 3.8
          f.pinchU = 0.18 + Math.random() * 0.24
          f.short = Math.random() < 0.3 // mal reißt es schon unterwegs ab
          f.shortT = 0.4 + Math.random() * 0.9
        }
        return
      }

      if (f.phase === 'swell') {
        // Ein Tropfen quillt am Unterträger hervor
        f.t += dt
        const e = smooth(clamp01(f.t / f.swellDur))
        f.tipY = ny - (0.03 + e * 0.14) * S
        if (e >= 1) {
          f.phase = 'extend'
          f.t = 0
          f.vy = 0.12 * S
        }
      } else if (f.phase === 'extend') {
        // Zäher Faden zieht sich nach unten (gedämpft, nicht freier Fall)
        f.t += dt
        f.vy = Math.min(2.2 * S, f.vy + 3.2 * S * dt)
        f.tipY -= f.vy * dt
        if (f.tipY <= floorY + 0.04) {
          f.tipY = floorY + 0.04
          f.phase = 'flow'
          f.t = 0
        } else if (f.short && f.t >= f.shortT) {
          f.phase = 'pinch' // kurzer Tropfen, reißt schon unterwegs
          f.t = 0
        }
      } else if (f.phase === 'flow') {
        f.t += dt
        f.tipY = floorY + 0.04
        addToPool(nx, 0.03 * S * dt, S)
        if (f.t >= f.flowDur) {
          f.phase = 'pinch'
          f.t = 0
        }
      } else if (f.phase === 'pinch') {
        // Zähe Flüssigkeiten reißen nicht gleichmäßig dünn, sondern schnüren
        // sich an EINER Stelle ein und trennen sich dort.
        f.t += dt
        f.neck = clamp01(f.t / 0.85)
        if (f.tipY <= floorY + 0.06) addToPool(nx, 0.012 * S * dt * (1 - f.neck), S)
        if (f.neck >= 1) {
          const len = ny - f.tipY
          if (f.tipY > floorY + 0.06) {
            // das untere Stück löst sich und fällt
            pieces.push({
              x: nx,
              y: ny - f.pinchU * len,
              vy: Math.max(0.35 * S, f.vy * 0.55),
              r: 0.055 * S,
              stretch: 1.1,
            })
          } else {
            addToPool(nx, 0.05 * S, S) // hing schon in der Pfütze
          }
          f.phase = 'retract'
          f.t = 0
          f.retractLen = f.pinchU * len
          f.neck = 0
        }
      } else if (f.phase === 'retract') {
        // Der obere Stummel schnellt durch die Oberflächenspannung zurück
        f.t += dt
        const p = smooth(clamp01(f.t / 0.45))
        f.tipY = ny - f.retractLen * (1 - p)
        if (p >= 1) {
          f.phase = 'wait'
          f.t = 2.5 + Math.random() * 6.5 // zufällige Pause
        }
      }

      // --- Faden zeichnen ---
      const len = ny - f.tipY
      if (len > 0.005) {
        const ph = f.src.phase
        const rBase = 0.05 * S
        // leichtes Pulsieren, solange Honig nachläuft
        const pulse = f.phase === 'flow' ? 1 + 0.05 * Math.sin(t * 2.2 + ph) : 1
        // beim Zurückschnellen wird der Stummel kurz dicker
        const retractBulge = f.phase === 'retract' ? 1 + 0.55 * clamp01(f.t / 0.45) : 1
        // zwei überlagerte Wellen mit eigenem Phasenversatz je Faden
        const sway = (u) =>
          (Math.sin(u * 5.5 + t * 1.6 + ph) * 0.7 + Math.sin(u * 9.3 - t * 1.1 + ph * 1.7) * 0.3) *
          0.014 * S * (0.2 + u * 0.8)

        for (let j = 0; j < SEGS; j++) {
          const u0 = j / SEGS
          const u1 = (j + 1) / SEGS
          vA.set(nx + sway(u0), ny - u0 * len, nozzleWorld.z)
          vB.set(nx + sway(u1), ny - u1 * len, nozzleWorld.z)
          const um = (u0 + u1) / 2
          // dick am Austritt, rasch verjüngend
          const taper = 0.3 + 0.7 * Math.exp(-um * 3.6)
          const tipBulge = f.phase === 'extend' ? 1 + 1.6 * Math.pow(um, 8) : 1
          // schmale Gauss-Kerbe an der Abrissstelle
          const neck =
            f.neck > 0 ? 1 - f.neck * Math.exp(-Math.pow((um - f.pinchU) / 0.09, 2)) : 1
          const rad = rBase * taper * tipBulge * pulse * retractBulge * Math.max(0.015, neck)

          vDir.subVectors(vB, vA)
          const segLen = vDir.length()
          dummy.position.copy(vA).addScaledVector(vDir, 0.5)
          dummy.quaternion.setFromUnitVectors(Y_AXIS, vDir.normalize())
          dummy.scale.set(rad, segLen * 1.04, rad)
          dummy.updateMatrix()
          if (segIdx < flow.instanceMatrix.count) flow.setMatrixAt(segIdx++, dummy.matrix)
        }
        // Tropfenkopf am unteren Ende
        const headR =
          rBase * (f.phase === 'extend' ? 1.45 : f.phase === 'retract' ? 1.25 : 1.0) * retractBulge
        dummy.position.set(nx + sway(1), f.tipY, nozzleWorld.z)
        dummy.quaternion.identity()
        dummy.scale.set(headR, headR * 1.15, headR)
        dummy.updateMatrix()
        if (blobIdx < blobs.instanceMatrix.count) blobs.setMatrixAt(blobIdx++, dummy.matrix)
      }
    })

    // --- abgerissene Stücke fallen und runden sich dabei ab ---
    for (let i = pieces.length - 1; i >= 0; i--) {
      const pc = pieces[i]
      pc.vy += 7 * S * dt
      pc.y -= pc.vy * dt
      if (pc.y - pc.r <= floorY + 0.02) {
        addToPool(pc.x, 0.045 * S, S)
        pieces.splice(i, 1)
        continue
      }
      // Direkt nach dem Abriss langgezogen; die Oberflächenspannung zieht das
      // Stück dann zur Kugel zusammen, bis der Fahrtwind es wieder streckt.
      const target = Math.min(0.5, (pc.vy * 0.12) / S)
      pc.stretch += (target - pc.stretch) * (1 - Math.exp(-dt * 5))
      const sx = pc.r * (1 - pc.stretch * 0.26)
      const sy = pc.r * (1 + pc.stretch)
      dummy.position.set(pc.x, pc.y, nozzleWorld.z)
      dummy.quaternion.identity()
      dummy.scale.set(sx, sy, sx)
      dummy.updateMatrix()
      if (blobIdx < blobs.instanceMatrix.count) blobs.setMatrixAt(blobIdx++, dummy.matrix)
      // kleiner Zipfel oben – ergibt die Tropfenform statt einer Ellipse
      if (pc.stretch > 0.12 && blobIdx < blobs.instanceMatrix.count) {
        const tr = pc.r * (0.5 - pc.stretch * 0.18)
        dummy.position.set(pc.x, pc.y + sy * 0.72, nozzleWorld.z)
        dummy.scale.set(tr, tr * 1.3, tr)
        dummy.updateMatrix()
        blobs.setMatrixAt(blobIdx++, dummy.matrix)
      }
    }

    // --- Pfützen am unteren Rand ---
    pools.forEach((p) => {
      if (!p.active) return
      p.size += (p.target - p.size) * (1 - Math.exp(-dt * 3))
      p.idle += dt
      if (p.idle > 14) {
        p.target = Math.max(0, p.target - 0.05 * S * dt)
        if (p.size < 0.012) {
          p.active = false
          return
        }
      }
      dummy.position.set(p.x, floorY + 0.01, nozzleWorld.z)
      dummy.quaternion.identity()
      dummy.scale.set(p.size * 2.1, p.size * 0.55, p.size)
      dummy.updateMatrix()
      if (blobIdx < blobs.instanceMatrix.count) blobs.setMatrixAt(blobIdx++, dummy.matrix)
    })

    flow.count = segIdx
    blobs.count = blobIdx
    flow.instanceMatrix.needsUpdate = true
    blobs.instanceMatrix.needsUpdate = true
  })

  const maxSegs = sources.length * SEGS
  const maxBlobs = sources.length * 2 + POOLS + 24

  return (
    <>
      <Comb combRef={combRef} data={data} geo={geo} mats={mats} />
      <instancedMesh ref={flowRef} args={[geo.seg, mats.flow, maxSegs]} frustumCulled={false} />
      <instancedMesh ref={blobRef} args={[geo.blob, mats.flow, maxBlobs]} frustumCulled={false} />
      <Particles count={cols > 20 ? 10 : 6} geo={geo} animate={animate} />
    </>
  )
}

export default function HoneycombScene({
  active = true,
  reducedMotion = false,
  compact = false,
  spacerEl,
  heroEl,
  onLoaded,
}) {
  const pointer = useRef({ x: 0, y: 0 })

  useEffect(() => {
    if (reducedMotion) return
    const onMove = (e) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [reducedMotion])

  const animate = active && !reducedMotion

  return (
    <Canvas
      // Nie ganz abschalten: pausiert wird mit "demand", damit weiterhin ein
      // (statisches) Bild gezeichnet wird – "never" ließe den Canvas leer.
      frameloop={animate ? 'always' : 'demand'}
      dpr={[1, compact ? 1.25 : 1.6]}
      camera={{ position: [0, 0, 10], fov: 35 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      style={{ background: 'transparent' }}
    >
      <ambientLight intensity={0.62} />
      <directionalLight position={[3, 6, 8]} intensity={1.35} color="#fff2d4" />
      <pointLight position={[-5, -2, 5]} intensity={0.7} color="#f6ce5b" />
      {/* Streiflicht von hinten: lässt den Honig durchleuchten */}
      <pointLight position={[2, -1, -4]} intensity={1.1} color="#ffa93d" />

      <Environment resolution={256} frames={1}>
        <Lightformer intensity={2.3} color="#ffeec2" position={[0, 6, -8]} scale={[12, 6, 1]} />
        <Lightformer intensity={1.2} color="#cfe6f5" position={[-8, 2, 0]} rotation-y={Math.PI / 2} scale={[10, 3, 1]} />
        <Lightformer intensity={1.7} color="#ffd27a" position={[8, -2, 2]} rotation-y={-Math.PI / 2} scale={[10, 3, 1]} />
      </Environment>

      <Stage
        cols={compact ? 20 : 30}
        rows={compact ? 14 : 20}
        pointer={pointer}
        animate={animate}
        spacerEl={spacerEl}
        heroEl={heroEl}
        onLoaded={onLoaded}
      />
    </Canvas>
  )
}
