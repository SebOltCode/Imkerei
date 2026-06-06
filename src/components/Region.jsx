import Reveal from './Reveal.jsx'
import { regionHighlights } from '../data/region.js'

export default function Region() {
  return (
    <section id="region" className="section region">
      <div className="region__wave region__wave--top" aria-hidden="true" />
      <div className="container">
        <Reveal className="section__head section__head--light">
          <span className="section__kicker">Unsere Heimat</span>
          <h2 className="section__title">Ostfriesland – das schmeckt man</h2>
          <p className="section__lead">
            Zwischen Nordseeküste und weitem Binnenland liegt das Zuhause unserer
            Bienen. Diese besondere Landschaft macht unseren Honig zu dem, was er
            ist.
          </p>
        </Reveal>

        <div className="region__grid">
          {regionHighlights.map((r, i) => (
            <Reveal key={r.id} delay={i * 80}>
              <div className="region-card">
                <span className="region-card__icon" aria-hidden="true">{r.icon}</span>
                <h3>{r.title}</h3>
                <p>{r.text}</p>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal className="region__teatime" delay={120}>
          <span className="region__teatime-icon" aria-hidden="true">🫖🍯</span>
          <p>
            <strong>Ostfriesische Teestunde:</strong> Ein Klecks unseres milden
            Honigs verwandelt jede Tasse kräftigen Ostfriesentee in einen kleinen
            Moment Heimat.
          </p>
        </Reveal>
      </div>
      <div className="region__wave region__wave--bottom" aria-hidden="true" />
    </section>
  )
}
