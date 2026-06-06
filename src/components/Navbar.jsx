import { useEffect, useState } from 'react'

const links = [
  { href: '#ueber-uns', label: 'Über uns' },
  { href: '#honig', label: 'Unser Honig' },
  { href: '#region', label: 'Ostfriesland' },
  { href: '#galerie', label: 'Galerie' },
  { href: '#partner', label: 'Partner' },
  { href: '#kontakt', label: 'Kontakt' },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={`navbar ${scrolled ? 'navbar--scrolled' : ''}`}>
      <div className="navbar__inner">
        <a href="#start" className="navbar__brand" onClick={() => setOpen(false)}>
          <span className="navbar__brand-icon" aria-hidden="true">🍯</span>
          <span className="navbar__brand-text">
            Imkerei<span className="navbar__brand-accent">-Olthoff</span>
          </span>
        </a>

        <button
          className={`navbar__burger ${open ? 'is-open' : ''}`}
          aria-label="Menü öffnen"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>

        <nav className={`navbar__nav ${open ? 'is-open' : ''}`}>
          {links.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
            </a>
          ))}
          <a href="#kontakt" className="navbar__cta" onClick={() => setOpen(false)}>
            Honig bestellen
          </a>
        </nav>
      </div>
    </header>
  )
}
