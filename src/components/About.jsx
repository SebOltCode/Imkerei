import Reveal from './Reveal.jsx'

export default function About() {
  return (
    <section id="ueber-uns" className="section about">
      <div className="container about__grid">
        <Reveal className="about__text">
          <span className="section__kicker">Über uns</span>
          <h2 className="section__title">
            Eine Handvoll Bienenvölker – und ganz viel Herzblut
          </h2>
          <p>
            Die <strong>Imkerei-Olthoff</strong> ist klein, persönlich und mit
            viel Hingabe geführt. Bei uns dreht sich alles um gesunde Bienen,
            ehrliches Handwerk und einen Honig, hinter dem wir mit unserem Namen
            stehen.
          </p>
          <p>
            Unsere Völker stehen mitten in der ostfriesischen Natur – zwischen
            blühenden Wiesen, alten Alleen und dem weiten Land hinterm Deich. Wir
            arbeiten im Rhythmus der Jahreszeiten, schleudern in Ruhe und füllen
            jedes Glas von Hand ab. So bleibt der Honig das, was er sein soll:
            naturbelassen und ehrlich.
          </p>

          <ul className="about__values">
            <li>
              <span className="about__value-icon" aria-hidden="true">🌼</span>
              <div>
                <strong>Im Einklang mit der Natur</strong>
                <p>Wir geben unseren Bienen Raum und Zeit, die sie brauchen.</p>
              </div>
            </li>
            <li>
              <span className="about__value-icon" aria-hidden="true">🤲</span>
              <div>
                <strong>Handarbeit aus Überzeugung</strong>
                <p>Vom Bienenstock bis ins Glas – alles bei uns vor Ort.</p>
              </div>
            </li>
            <li>
              <span className="about__value-icon" aria-hidden="true">📍</span>
              <div>
                <strong>Regional verwurzelt</strong>
                <p>Echtes Ostfriesland in jedem Löffel Honig.</p>
              </div>
            </li>
          </ul>
        </Reveal>

        <Reveal className="about__media" delay={120}>
          {/* PLATZHALTER: Bild der Imkerei / des Imkers später hier einsetzen */}
          <div className="about__photo placeholder">
            <span className="placeholder__icon" aria-hidden="true">🧑‍🌾🐝</span>
            <span className="placeholder__label">Foto folgt</span>
          </div>
          <div className="about__honeydrop" aria-hidden="true">🍯</div>
          <div className="about__note">
            <span aria-hidden="true">“</span>
            Wir imkern so, wie wir selbst gerne Honig essen – mit Geduld und Liebe.
          </div>
        </Reveal>
      </div>
    </section>
  )
}
