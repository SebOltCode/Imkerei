import { useEffect, useRef, useState } from 'react'
import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Products from './components/Products.jsx'
import Region from './components/Region.jsx'
import Gallery from './components/Gallery.jsx'
import Partners from './components/Partners.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import AnimatedBee from './components/AnimatedBee.jsx'
import Impressum from './components/Impressum.jsx'
import Datenschutz from './components/Datenschutz.jsx'

// Leichtgewichtiges Routing über den Hash – ohne zusätzliche Bibliothek.
// "#/impressum" und "#/datenschutz" zeigen die Rechtsseiten, alle anderen
// Hashes (z. B. "#honig") bleiben normale Sprungmarken der Startseite.
function getRoute() {
  const h = window.location.hash
  if (h === '#/impressum') return 'impressum'
  if (h === '#/datenschutz') return 'datenschutz'
  return 'home'
}

function Home() {
  return (
    <main>
      <Hero />
      <About />
      <Products />
      <Region />
      <Gallery />
      <Partners />
      <Contact />
    </main>
  )
}

export default function App() {
  const [route, setRoute] = useState(getRoute())
  // Merkt sich eine Sprungmarke, zu der nach dem Rendern der Startseite
  // gescrollt werden soll (z. B. beim Wechsel von einer Rechtsseite).
  const pendingScroll = useRef(null)

  useEffect(() => {
    const onHashChange = () => {
      const h = window.location.hash
      const next = getRoute()
      setRoute(next)
      if (next !== 'home') {
        window.scrollTo(0, 0) // Rechtsseite immer oben beginnen
      } else if (h && !h.startsWith('#/')) {
        pendingScroll.current = h.slice(1)
      }
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // Nach dem Wechsel zur Startseite zur gemerkten Sprungmarke scrollen –
  // erst wenn die Sektionen tatsächlich im DOM stehen.
  useEffect(() => {
    if (route === 'home' && pendingScroll.current) {
      const id = pendingScroll.current
      pendingScroll.current = null
      // Nur scrollen, solange die Sprungmarke noch aktuell ist – so sind
      // verspätete Nachfass-Versuche harmlos, falls der Nutzer inzwischen
      // woanders hin navigiert hat.
      const scrollToTarget = () => {
        if (window.location.hash.slice(1) !== id) return
        // bewusst ohne Smooth-Scroll, damit die Nachfass-Versuche nicht
        // jeweils eine neue Animation starten und sich gegenseitig stören
        document.getElementById(id)?.scrollIntoView({ behavior: 'auto' })
      }
      // Mehrfach nachfassen: direkt nach dem Rendern, sobald die Webfonts
      // geladen sind und über einige gestaffelte Zeitpunkte. So bleibt das
      // Ziel auch bei nachträglichem Reflow (progressives Font-Laden) korrekt.
      requestAnimationFrame(scrollToTarget)
      if (document.fonts?.ready) {
        document.fonts.ready.then(scrollToTarget)
      }
      ;[120, 350, 700, 1100].forEach((t) => setTimeout(scrollToTarget, t))
    }
  }, [route])

  return (
    <>
      <AnimatedBee />
      <Navbar />
      {route === 'impressum' ? (
        <Impressum />
      ) : route === 'datenschutz' ? (
        <Datenschutz />
      ) : (
        <Home />
      )}
      <Footer />
    </>
  )
}
