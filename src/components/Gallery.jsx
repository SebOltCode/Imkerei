import Reveal from './Reveal.jsx'
import { galleryItems } from '../data/gallery.js'

export default function Gallery() {
  return (
    <section id="galerie" className="section gallery">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__kicker">Einblicke</span>
          <h2 className="section__title">Aus unserem Imkerleben</h2>
          <p className="section__lead">
            Bald finden Sie hier echte Eindrücke von unseren Bienen, Waben und der
            Arbeit am Stock. Die Plätze sind schon reserviert – die Fotos folgen.
          </p>
        </Reveal>

        <div className="gallery__grid">
          {galleryItems.map((item, i) => (
            <Reveal key={item.id} delay={i * 70}>
              <figure className="gallery__item">
                {item.image ? (
                  <img src={item.image} alt={item.alt} loading="lazy" />
                ) : (
                  <div className="gallery__placeholder placeholder">
                    <span className="placeholder__icon" aria-hidden="true">{item.emoji}</span>
                    <span className="placeholder__label">Foto folgt</span>
                  </div>
                )}
                <figcaption className="gallery__caption">{item.caption}</figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
