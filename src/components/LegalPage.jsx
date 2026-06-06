// Gemeinsames Layout für die Rechtsseiten (Impressum & Datenschutz).
export default function LegalPage({ title, intro, children }) {
  return (
    <main className="legal">
      <div className="container legal__inner">
        <a href="#start" className="legal__back">
          <span aria-hidden="true">←</span> Zurück zur Startseite
        </a>
        <h1 className="legal__title">{title}</h1>
        {intro && <p className="legal__intro">{intro}</p>}
        <div className="legal__content">{children}</div>
      </div>
    </main>
  )
}
