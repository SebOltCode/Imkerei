export default function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="footer">
      <div className="footer__wave" aria-hidden="true" />
      <div className="container footer__inner">
        <div className="footer__brand">
          <span className="footer__brand-icon" aria-hidden="true">🍯</span>
          <div>
            <strong>Imkerei-Olthoff</strong>
            <p>Honig aus Ostfriesland · mit Liebe gemacht</p>
          </div>
        </div>

        <nav className="footer__links" aria-label="Footer-Navigation">
          <a href="#ueber-uns">Über uns</a>
          <a href="#honig">Unser Honig</a>
          <a href="#galerie">Galerie</a>
          <a href="#partner">Partner</a>
          <a href="#kontakt">Kontakt</a>
        </nav>

        <div className="footer__legal">
          <a href="#">Impressum</a>
          <a href="#">Datenschutz</a>
        </div>
      </div>

      <div className="footer__bottom">
        <p>
          © {year} Imkerei-Olthoff · Gemacht mit <span aria-hidden="true">🐝</span> in Ostfriesland
        </p>
      </div>
    </footer>
  )
}
