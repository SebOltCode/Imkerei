import { useForm, ValidationError } from '@formspree/react'
import Reveal from './Reveal.jsx'

export default function Contact() {
  // Formspree-Anbindung. Die Form-ID stammt aus dem Endpoint
  // https://formspree.io/f/xpqepzvd
  const [state, handleSubmit] = useForm('xpqepzvd')

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
                <p>0151 54759546</p>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal className="contact__form-wrap" delay={120}>
          {state.succeeded ? (
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
              {/* Aussagekräftiger Betreff in der eingehenden E-Mail */}
              <input
                type="hidden"
                name="_subject"
                value="Neue Nachricht über imkerei-olthoff.de"
              />

              <div className="form-row">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" type="text" required placeholder="Ihr Name" />
                <ValidationError prefix="Name" field="name" errors={state.errors} className="form-error" />
              </div>

              <div className="form-row">
                <label htmlFor="email">E-Mail</label>
                <input id="email" name="email" type="email" required placeholder="ihre@email.de" />
                <ValidationError prefix="E-Mail" field="email" errors={state.errors} className="form-error" />
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
                <ValidationError prefix="Nachricht" field="message" errors={state.errors} className="form-error" />
              </div>

              {/* Allgemeiner Fehler (z. B. Netzwerkproblem) */}
              {state.errors && (
                <p className="form-error" role="alert">
                  Hoppla, das hat leider nicht geklappt. Bitte versuchen Sie es
                  erneut oder schreiben Sie uns direkt an info@imkerei-olthoff.de.
                </p>
              )}

              <button
                type="submit"
                className="btn btn--primary btn--full"
                disabled={state.submitting}
              >
                {state.submitting ? (
                  'Wird gesendet …'
                ) : (
                  <>
                    Nachricht senden <span aria-hidden="true">🍯</span>
                  </>
                )}
              </button>

              <p className="contact__consent">
                Mit dem Absenden stimmen Sie der Verarbeitung Ihrer Angaben gemäß
                unserer{' '}
                <a href="#/datenschutz">Datenschutzerklärung</a> zu.
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  )
}
