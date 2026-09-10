import { useEffect, useRef } from 'react'
import HeroHoneycomb from './HeroHoneycomb.jsx'

// Der Titel wird Wort für Wort eingeblendet. "Heimat" bekommt die Markierung.
const TITLE = ['Honig,', 'der', 'nach', { text: 'Heimat', highlight: true }, 'schmeckt']

export default function Hero() {
  const ref = useRef(null)

  // Parallaxe: Scrollposition als CSS-Variable, Wolken & Deich wandern
  // langsamer als der Rest (siehe .hero__clouds / .hero__hills in index.css)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const onScroll = () => {
      if (raf) return
      raf = requestAnimationFrame(() => {
        raf = 0
        el.style.setProperty('--hero-scroll', String(Math.min(window.scrollY, window.innerHeight)))
      })
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => {
      window.removeEventListener('scroll', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <section id="start" className="hero" ref={ref}>
      {/* Sanfte Landschaft: Himmel, Sonne, Deich, Wiese */}
      <div className="hero__scenery" aria-hidden="true">
        <div className="hero__sun" />
        <div className="hero__clouds">
          <span className="cloud cloud--1" />
          <span className="cloud cloud--2" />
          <span className="cloud cloud--3" />
        </div>
        <svg className="hero__hills" viewBox="0 0 1440 320" preserveAspectRatio="none">
          <path
            fill="#cfe3b6"
            d="M0,224 C240,160 480,288 720,256 C960,224 1200,160 1440,224 L1440,320 L0,320 Z"
          />
          <path
            fill="#a9cf86"
            d="M0,288 C240,240 480,320 720,288 C960,256 1200,304 1440,272 L1440,320 L0,320 Z"
          />
        </svg>
        {/* schwankende Gräser */}
        <div className="hero__grass">
          {Array.from({ length: 9 }).map((_, i) => (
            <span key={i} className="blade" style={{ '--i': i }} />
          ))}
        </div>
      </div>

      <div className="hero__inner">
        <div className="hero__content">
          <p className="hero__eyebrow hero__fade" style={{ '--d': '0.05s' }}>
            🐝 Kleine, private Imkerei aus Ostfriesland
          </p>

          <h1 className="hero__title">
            {TITLE.map((w, i) => {
              const isObj = typeof w !== 'string'
              return (
                <span key={i}>
                  <span className="hero__word">
                    <span className="hero__word-inner" style={{ '--d': `${0.15 + i * 0.09}s` }}>
                      {isObj ? <span className="hero__highlight">{w.text}</span> : w}
                    </span>
                  </span>{' '}
                </span>
              )
            })}
          </h1>

          <p className="hero__subtitle hero__fade" style={{ '--d': '0.65s' }}>
            Mit Liebe zum Handwerk, im Einklang mit der Natur. Goldener Honig von
            unseren Bienen – gesammelt zwischen Deich, Wiese und weitem
            ostfriesischen Himmel.
          </p>

          <div className="hero__actions hero__fade" style={{ '--d': '0.8s' }}>
            <a href="#honig" className="btn btn--primary">
              Unseren Honig entdecken
            </a>
            <a href="#ueber-uns" className="btn btn--ghost">
              Unsere Geschichte
            </a>
          </div>

          <ul className="hero__badges hero__fade" style={{ '--d': '0.95s' }}>
            <li><span aria-hidden="true">🌿</span> 100 % naturbelassen</li>
            <li><span aria-hidden="true">📍</span> Direkt aus Ostfriesland</li>
            <li><span aria-hidden="true">🤲</span> Echtes Imkerhandwerk</li>
          </ul>
        </div>

        {/* Die 3D-Honigwabe */}
        <HeroHoneycomb />
      </div>

      <a href="#ueber-uns" className="hero__scroll" aria-label="Weiter nach unten">
        <span></span>
      </a>
    </section>
  )
}
