import { useState } from 'react'
import Reveal from './Reveal.jsx'

export default function Contact() {
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    // PLATZHALTER: Hier später eine echte Versand-Logik anbinden
    // (z. B. E-Mail-Dienst, Formspree, eigenes Backend).
    setSent(true)
  }

  return (
    <section id="kontakt" className="section contact">
      <div className="container contact__grid">
        <Reveal className="contact__intro">
          <span className="section__kicker">Kontakt</span>
          <h2 className="section__title">Lust auf echten Heimat-Honig?</h2>
          <p className="section__lead">
            Schreiben Sie uns einfach – wir freuen uns über jede Nachricht, ob
            Bestellung, Frage oder ein nettes Hallo. Wir melden uns persönlich
            zurück.
          </p>

          <ul className="contact__details">
            <li>
              <span aria-hidden="true">📍</span>
              <div>
                <strong>Imkerei-Olthoff</strong>
                <p>Irgendwo schön in Ostfriesland{/* Adresse später ergänzen */}</p>
              </div>
            </li>
            <li>
              <span aria-hidden="true">✉️</span>
              <div>
                <strong>E-Mail</strong>
                <p>info@imkerei-olthoff.de{/* Platzhalter */}</p>
              </div>
            </li>
            <li>
              <span aria-hidden="true">📞</span>
              <div>
                <strong>Telefon</strong>
                <p>0123 / 456 789{/* Platzhalter */}</p>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal className="contact__form-wrap" delay={120}>
          {sent ? (
            <div className="contact__thanks">
              <span className="contact__thanks-icon" aria-hidden="true">🐝</span>
              <h3>Dankeschön!</h3>
              <p>
                Ihre Nachricht ist angekommen. Wir summen uns so schnell wie
                möglich bei Ihnen zurück.
              </p>
            </div>
          ) : (
            <form className="contact__form" onSubmit={handleSubmit}>
              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" required placeholder="Ihr Name" />
              </div>
              <div className="form-row">
                <label htmlFor="email">E-Mail</label>
                <input id="email" name="email" type="email" required placeholder="ihre@email.de" />
              </div>
              <div className="form-row">
                <label htmlFor="message">Nachricht</label>
                <textarea
                  id="message"
                  name="message"
                  rows="5"
                  required
                  placeholder="Worüber möchten Sie sprechen?"
                />
              </div>
              <button type="submit" className="btn btn--primary btn--full">
                Nachricht senden <span aria-hidden="true">🍯</span>
              </button>
              <p className="contact__hint">
                Formular ist ein Platzhalter – die Versand-Logik binden Sie später an.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
