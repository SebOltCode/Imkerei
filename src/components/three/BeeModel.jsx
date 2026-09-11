// Realistische Honigbiene, komplett aus Three.js-Grundkörpern gebaut 🐝
//
// Bewusst selbst modelliert statt ein fertiges Modell zu laden: Das spart
// Megabyte (ein gescanntes Bienenmodell wiegt schnell über 20 MB) und es
// hängen keine Lizenzpflichten daran.
//
// Lokales Koordinatensystem der Biene:
//   +Z = Flugrichtung (Kopf), +Y = Rücken (dorsal), Länge ca. 1.8 Einheiten.

import * as THREE from 'three'

export const BEE_LENGTH = 2.05

// --- Wegpunkt-Routen (für fliegende wie laufende Bienen) -----------------
const smoothstep = (p) => p * p * (3 - 2 * p)

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
      outPos.set(
        s.from.x + (s.to.x - s.from.x) * e,
        s.from.y + (s.to.y - s.from.y) * e,
        0,
      )
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

// Gebänderter Hinterleib: Streifen werden als Textur erzeugt, damit ein
// einziger Körper die typische Zeichnung bekommt (statt vieler Ringe).
function makeAbdomenTexture() {
  const c = document.createElement('canvas')
  c.width = 8
  c.height = 128
  const ctx = c.getContext('2d')
  // Achtung: CanvasTexture kippt die Y-Achse (flipY), die oberste Zeile
  // landet also am Ende des Lathe-Profils – daher Spitze zuerst.
  const bands = [
    [0.0, 0.1, '#4a3316'], // Spitze
    [0.1, 0.24, '#2b1d0c'],
    [0.24, 0.38, '#e2a034'],
    [0.38, 0.5, '#33240f'],
    [0.5, 0.64, '#eeb247'],
    [0.64, 0.76, '#33240f'],
    [0.76, 0.9, '#e9a93a'],
    [0.9, 1.0, '#6b4a20'], // Taille
  ]
  bands.forEach(([a, b, color]) => {
    ctx.fillStyle = color
    ctx.fillRect(0, a * c.height, c.width, (b - a) * c.height + 1)
  })
  const tex = new THREE.CanvasTexture(c)
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

// Flügelblatt: schlanke, vorn gerundete Fläche
function makeWingGeometry(len, width) {
  const s = new THREE.Shape()
  s.moveTo(0, 0)
  s.bezierCurveTo(len * 0.2, width * 0.9, len * 0.75, width, len, width * 0.25)
  s.bezierCurveTo(len * 0.82, -width * 0.5, len * 0.3, -width * 0.6, 0, 0)
  const g = new THREE.ShapeGeometry(s, 14)
  g.rotateX(-Math.PI / 2) // in die XZ-Ebene legen: Flügel steht seitlich ab
  return g
}

// Alle Geometrien/Materialien einmal bauen und für alle Bienen teilen
export function createBeeAssets() {
  const abdomenTex = makeAbdomenTexture()

  // Hinterleib als Rotationskörper: nach hinten spitz zulaufend, wie beim
  // echten Tier – eine Kugel sah zu sehr nach Plüschtier aus.
  const abdomenProfile = [
    [0.2, 0.58],
    [0.27, 0.44],
    [0.3, 0.22],
    [0.29, 0.0],
    [0.25, -0.22],
    [0.17, -0.4],
    [0.08, -0.52],
    [0.015, -0.58],
  ].map(([r, y]) => new THREE.Vector2(r, y))
  const abdomenGeo = new THREE.LatheGeometry(abdomenProfile, 22)
  abdomenGeo.rotateX(Math.PI / 2) // Taille nach vorn (+Z), Spitze nach hinten

  const geo = {
    head: new THREE.SphereGeometry(0.25, 18, 14),
    eye: new THREE.SphereGeometry(0.14, 12, 10),
    thorax: new THREE.SphereGeometry(0.31, 20, 16),
    fuzz: new THREE.SphereGeometry(0.35, 16, 12),
    abdomen: abdomenGeo,
    stinger: new THREE.ConeGeometry(0.045, 0.14, 8),
    limb: new THREE.CylinderGeometry(0.022, 0.014, 1, 6),
    antennaTip: new THREE.SphereGeometry(0.035, 8, 6),
    foreWing: makeWingGeometry(0.95, 0.3),
    hindWing: makeWingGeometry(0.55, 0.2),
  }

  const mat = {
    dark: new THREE.MeshStandardMaterial({ color: '#2a1d0e', roughness: 0.85 }),
    // etwas heller als der Kopf, damit die Facettenaugen überhaupt lesbar sind
    eye: new THREE.MeshPhysicalMaterial({
      color: '#4a2f18',
      roughness: 0.3,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
    }),
    // Thorax wirkt durch hohe Rauheit samtig/pelzig
    thorax: new THREE.MeshStandardMaterial({ color: '#9a6f33', roughness: 1 }),
    fuzz: new THREE.MeshStandardMaterial({
      color: '#d8ab63',
      roughness: 1,
      transparent: true,
      opacity: 0.45,
    }),
    abdomen: new THREE.MeshStandardMaterial({ map: abdomenTex, roughness: 0.62 }),
    wing: new THREE.MeshPhysicalMaterial({
      color: '#eaf4fb',
      roughness: 0.12,
      transmission: 0,
      transparent: true,
      opacity: 0.42,
      side: THREE.DoubleSide,
      clearcoat: 1,
      clearcoatRoughness: 0.05,
      depthWrite: false,
    }),
  }

  return { geo, mat, dispose: () => abdomenTex.dispose() }
}

// Ein Bein aus zwei Segmenten (Schenkel + Schiene)
function makeLeg(geo, mat, side, z, spread, drop) {
  const leg = new THREE.Group()
  const upper = new THREE.Mesh(geo.limb, mat.dark)
  upper.scale.set(1, 0.26, 1)
  upper.position.set(side * 0.11, -0.13, 0)
  upper.rotation.z = side * -0.75
  leg.add(upper)

  const lower = new THREE.Mesh(geo.limb, mat.dark)
  lower.scale.set(0.85, 0.3, 0.85)
  lower.position.set(side * (0.11 + spread), -0.13 - drop, -0.04)
  lower.rotation.z = side * -0.2
  lower.rotation.x = 0.4
  leg.add(lower)

  leg.position.z = z
  return leg
}

// Baut eine komplette Biene. Die Flügelgruppen liegen in userData,
// damit die Szene den Flügelschlag animieren kann.
export function createBee({ geo, mat }) {
  const bee = new THREE.Group()

  // --- Kopf ---
  const head = new THREE.Mesh(geo.head, mat.dark)
  head.position.set(0, 0.02, 0.5)
  head.scale.set(1, 0.9, 0.86)
  bee.add(head)

  // Facettenaugen sitzen groß an den Kopfseiten
  ;[-1, 1].forEach((s) => {
    const eye = new THREE.Mesh(geo.eye, mat.eye)
    eye.position.set(s * 0.16, 0.04, 0.52)
    eye.scale.set(0.58, 1.15, 1.0)
    bee.add(eye)
  })

  // Fühler: geknickt, mit kleinem Endglied
  ;[-1, 1].forEach((s) => {
    const a = new THREE.Mesh(geo.limb, mat.dark)
    a.scale.set(0.55, 0.3, 0.55)
    a.position.set(s * 0.1, 0.15, 0.66)
    a.rotation.set(1.15, 0, s * -0.35)
    bee.add(a)
    const tip = new THREE.Mesh(geo.antennaTip, mat.dark)
    tip.position.set(s * 0.16, 0.21, 0.82)
    bee.add(tip)
  })

  // --- Thorax (pelzig) ---
  const thorax = new THREE.Mesh(geo.thorax, mat.thorax)
  thorax.position.set(0, 0, 0.18)
  thorax.scale.set(1, 0.95, 1.05)
  bee.add(thorax)

  const fuzz = new THREE.Mesh(geo.fuzz, mat.fuzz)
  fuzz.position.copy(thorax.position)
  fuzz.scale.set(1, 0.95, 1.02)
  bee.add(fuzz)

  // --- Hinterleib ---
  const abdomen = new THREE.Mesh(geo.abdomen, mat.abdomen)
  // Taille schließt an den Thorax an, Spitze zeigt nach hinten
  abdomen.position.set(0, -0.02, -0.68)
  abdomen.scale.set(1, 0.88, 1)
  bee.add(abdomen)

  const stinger = new THREE.Mesh(geo.stinger, mat.dark)
  stinger.position.set(0, -0.03, -1.3)
  stinger.rotation.x = -Math.PI / 2
  bee.add(stinger)

  // --- Beine (drei Paare) ---
  const legs = [
    { z: 0.38, spread: 0.12, drop: 0.1 },
    { z: 0.16, spread: 0.16, drop: 0.14 },
    { z: -0.06, spread: 0.14, drop: 0.18 },
  ]
  legs.forEach((l) => {
    bee.add(makeLeg(geo, mat, -1, l.z, l.spread, l.drop))
    bee.add(makeLeg(geo, mat, 1, l.z, l.spread, l.drop))
  })

  // --- Flügel: je Seite Vorder- und Hinterflügel in einer Gruppe ---
  const wings = [-1, 1].map((s) => {
    const g = new THREE.Group()
    const fore = new THREE.Mesh(geo.foreWing, mat.wing)
    fore.rotation.y = s * -0.18 // leicht nach hinten gepfeilt
    fore.scale.x = s
    g.add(fore)

    const hind = new THREE.Mesh(geo.hindWing, mat.wing)
    hind.position.set(0, -0.02, -0.18)
    hind.rotation.y = s * -0.08
    hind.scale.x = s
    g.add(hind)

    g.position.set(s * 0.13, 0.21, 0.2)
    bee.add(g)
    return g
  })

  bee.userData.wingL = wings[0]
  bee.userData.wingR = wings[1]
  return bee
}
