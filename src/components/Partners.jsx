import Reveal from './Reveal.jsx'
import { partners } from '../data/partners.js'

export default function Partners() {
  return (
    <section id="partner" className="section partners">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__kicker">Partner & Freunde</span>
          <h2 className="section__title">Gemeinsam für die Region</h2>
          <p className="section__lead">
            Hier finden Sie bald unsere Partner – Hofläden, Märkte und Freunde, bei
            denen es unseren Honig gibt. Die Verlinkungen sind als Platzhalter
            angelegt und schnell austauschbar.
          </p>
        </Reveal>

        <div className="partners__grid">
          {partners.map((p, i) => (
            <Reveal key={p.id} delay={i * 80}>
              <a
                className="partner-card"
                href={p.url}
                target={p.url !== '#' ? '_blank' : undefined}
                rel={p.url !== '#' ? 'noopener noreferrer' : undefined}
              >
                <div className="partner-card__logo">
                  {p.logo ? (
                    <img src={p.logo} alt={`Logo ${p.name}`} />
                  ) : (
                    <span aria-hidden="true">{p.emoji}</span>
                  )}
                </div>
                <h3 className="partner-card__name">{p.name}</h3>
                <p className="partner-card__desc">{p.description}</p>
                <span className="partner-card__link">
                  Mehr erfahren <span aria-hidden="true">→</span>
                </span>
              </a>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
