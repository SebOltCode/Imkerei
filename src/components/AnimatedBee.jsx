// Ein kleiner Schwarm liebevoll & realistisch animierter Honigbienen 🐝
// Draufsicht (Vogelperspektive), wie sie im Flug von oben aussehen:
//  - getrennter Hinterleib (Abdomen), Brustkorb (Thorax) & Kopf
//  - vier transluzente Flügel mit feiner Aderung, die schlagen
//  - behaarter Thorax (Härchen werden unten berechnet)
//  - Facettenaugen, geknickte Fühler, sechs Beine
//
// Es fliegen mehrere Bienen auf unterschiedlichen Flugbahnen, in
// verschiedenen Größen, Tempi und mit eigenen Landepausen (siehe CSS:
// .bee-flight--1 … --5). Bei "prefers-reduced-motion: reduce" werden
// alle Bienen ausgeblendet.

// Kurze Härchen rund um den Thorax (behaarter Look)
const THORAX = { cx: 64, cy: 32, rx: 13, ry: 12 }
const hairs = Array.from({ length: 26 }, (_, i) => {
  const a = (i / 26) * Math.PI * 2
  const jitter = (i % 3) * 0.9
  const x1 = THORAX.cx + Math.cos(a) * (THORAX.rx - 2)
  const y1 = THORAX.cy + Math.sin(a) * (THORAX.ry - 2)
  const x2 = THORAX.cx + Math.cos(a) * (THORAX.rx + 2.6 + jitter)
  const y2 = THORAX.cy + Math.sin(a) * (THORAX.ry + 2.6 + jitter)
  return { x1, y1, x2, y2 }
})

// Eine einzelne Biene. "uid" macht die Verlaufs-/Clip-IDs eindeutig,
// damit sich mehrere Bienen im selben Dokument nicht stören.
function BeeSvg({ uid, width }) {
  const id = (name) => `${uid}-${name}`
  const height = Math.round(width * (64 / 112))
  return (
    <svg
      className="bee"
      viewBox="0 0 112 64"
      width={width}
      height={height}
      role="img"
      aria-label="Fliegende Honigbiene"
    >
      <defs>
        <linearGradient id={id('abdomen')} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#b06b16" />
          <stop offset="0.55" stopColor="#e9a33a" />
          <stop offset="1" stopColor="#f3c057" />
        </linearGradient>
        <radialGradient id={id('thorax')} cx="0.4" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#8a6633" />
          <stop offset="0.6" stopColor="#5f441f" />
          <stop offset="1" stopColor="#3e2c13" />
        </radialGradient>
        <radialGradient id={id('head')} cx="0.5" cy="0.4" r="0.7">
          <stop offset="0" stopColor="#4a3418" />
          <stop offset="1" stopColor="#2a1d0e" />
        </radialGradient>
        <linearGradient id={id('wing')} x1="1" y1="0.5" x2="0" y2="0.2">
          <stop offset="0" stopColor="#ffffff" stopOpacity="0.7" />
          <stop offset="0.6" stopColor="#dcebf6" stopOpacity="0.42" />
          <stop offset="1" stopColor="#b9d2e6" stopOpacity="0.18" />
        </linearGradient>
        <clipPath id={id('abdomenClip')}>
          <path d="M54 18 C62 21 62 43 54 46 C42 51 18 51 10 39 C6 34 6 30 10 25 C18 13 42 13 54 18 Z" />
        </clipPath>
      </defs>

      {/* ---------- Flügel (liegen hinter dem Körper) ---------- */}
      <g className="bee-wing bee-wing--top">
        <ellipse cx="38" cy="13" rx="22" ry="8" transform="rotate(-21 38 13)"
          fill={`url(#${id('wing')})`} stroke="#9fbdd6" strokeOpacity="0.55" strokeWidth="0.7" />
        <ellipse cx="46" cy="21" rx="13" ry="5.2" transform="rotate(-9 46 21)"
          fill={`url(#${id('wing')})`} stroke="#9fbdd6" strokeOpacity="0.5" strokeWidth="0.6" />
        <g stroke="#8fb0cb" strokeOpacity="0.5" strokeWidth="0.5" fill="none">
          <path d="M55 21 C44 16 32 11 22 9" />
          <path d="M52 19 C43 13 35 9 27 6" />
          <path d="M30 8 C33 12 36 15 40 17" />
        </g>
      </g>

      <g className="bee-wing bee-wing--bottom">
        <ellipse cx="38" cy="51" rx="22" ry="8" transform="rotate(21 38 51)"
          fill={`url(#${id('wing')})`} stroke="#9fbdd6" strokeOpacity="0.55" strokeWidth="0.7" />
        <ellipse cx="46" cy="43" rx="13" ry="5.2" transform="rotate(9 46 43)"
          fill={`url(#${id('wing')})`} stroke="#9fbdd6" strokeOpacity="0.5" strokeWidth="0.6" />
        <g stroke="#8fb0cb" strokeOpacity="0.5" strokeWidth="0.5" fill="none">
          <path d="M55 43 C44 48 32 53 22 55" />
          <path d="M52 45 C43 51 35 55 27 58" />
          <path d="M30 56 C33 52 36 49 40 47" />
        </g>
      </g>

      {/* ---------- Beine ---------- */}
      <g stroke="#241808" strokeWidth="1.7" strokeLinecap="round" fill="none">
        <path d="M60 40 C56 46 52 49 47 50" />
        <path d="M64 41 C62 48 58 52 53 54" />
        <path d="M68 41 C68 47 66 51 62 54" />
        <path d="M60 24 C56 18 52 15 47 14" />
        <path d="M64 23 C62 16 58 12 53 10" />
        <path d="M68 23 C68 17 66 13 62 10" />
      </g>

      {/* ---------- Hinterleib (Abdomen) ---------- */}
      <g>
        <path d="M54 18 C62 21 62 43 54 46 C42 51 18 51 10 39 C6 34 6 30 10 25 C18 13 42 13 54 18 Z"
          fill={`url(#${id('abdomen')})`} />
        <g clipPath={`url(#${id('abdomenClip')})`} stroke="#3a2912" strokeLinecap="round" fill="none">
          <path d="M16 14 Q18 32 16 50" strokeWidth="4.6" />
          <path d="M25 13 Q27 32 25 51" strokeWidth="5" />
          <path d="M34 13 Q36 32 34 51" strokeWidth="5" />
          <path d="M43 14 Q45 32 43 50" strokeWidth="4.8" />
        </g>
        <path d="M20 19 C30 16 44 16 52 20" stroke="#ffe6a8" strokeOpacity="0.5"
          strokeWidth="1.4" fill="none" strokeLinecap="round" />
        <path d="M9 31 L2 32 L9 33 Z" fill="#241808" />
      </g>

      {/* ---------- Brustkorb (Thorax) + Behaarung ---------- */}
      <g>
        <g stroke="#7a5a2c" strokeOpacity="0.85" strokeWidth="1.1" strokeLinecap="round">
          {hairs.map((h, i) => (
            <line key={i} x1={h.x1} y1={h.y1} x2={h.x2} y2={h.y2} />
          ))}
        </g>
        <ellipse cx={THORAX.cx} cy={THORAX.cy} rx={THORAX.rx} ry={THORAX.ry}
          fill={`url(#${id('thorax')})`} />
        <ellipse cx="60" cy="28" rx="4.5" ry="3.4" fill="#a47c3f" opacity="0.45" />
      </g>

      {/* ---------- Kopf ---------- */}
      <g>
        <ellipse cx="83" cy="32" rx="7.5" ry="8.6" fill={`url(#${id('head')})`} />
        <ellipse cx="85" cy="26" rx="2.7" ry="3.7" fill="#120c06" />
        <ellipse cx="85" cy="38" rx="2.7" ry="3.7" fill="#120c06" />
        <circle cx="84.2" cy="24.8" r="0.8" fill="#ffffff" opacity="0.6" />
        <circle cx="84.2" cy="36.8" r="0.8" fill="#ffffff" opacity="0.6" />
        <g stroke="#241808" strokeWidth="1.8" fill="none" strokeLinecap="round">
          <path d="M89 28 Q96 25 98 19" />
          <path d="M89 36 Q96 39 98 45" />
        </g>
        <circle cx="98" cy="18.6" r="1.5" fill="#241808" />
        <circle cx="98" cy="45.4" r="1.5" fill="#241808" />
      </g>
    </svg>
  )
}

// Der Schwarm: jede Biene hat eine eigene Flugbahn-Klasse, Größe,
// Grund-Transparenz (kleine wirken weiter weg) und einen Versatz beim
// Auf-und-Ab-Wippen, damit nichts synchron aussieht.
const bees = [
  { uid: 'bee-a', cls: 'bee-flight--1', w: 60, opacity: 1, bobDelay: '0s' },
  { uid: 'bee-b', cls: 'bee-flight--2', w: 44, opacity: 0.95, bobDelay: '-0.3s' },
  { uid: 'bee-c', cls: 'bee-flight--3', w: 34, opacity: 0.85, bobDelay: '-0.6s' },
  { uid: 'bee-d', cls: 'bee-flight--4', w: 50, opacity: 1, bobDelay: '-0.45s' },
  { uid: 'bee-e', cls: 'bee-flight--5', w: 28, opacity: 0.78, bobDelay: '-0.15s' },
]

export default function AnimatedBee() {
  return (
    <div className="bee-swarm" aria-hidden="true">
      {bees.map((b) => (
        <div key={b.uid} className={`bee-flight ${b.cls}`} style={{ opacity: b.opacity }}>
          <div className="bee-bob" style={{ animationDelay: b.bobDelay }}>
            <BeeSvg uid={b.uid} width={b.w} />
          </div>
        </div>
      ))}
    </div>
  )
}
