import Reveal from './Reveal.jsx'
import { products } from '../data/products.js'

export default function Products() {
  return (
    <section id="honig" className="section products">
      <div className="container">
        <Reveal className="section__head">
          <span className="section__kicker">Unser Honig</span>
          <h2 className="section__title">Goldene Vielfalt aus der Region</h2>
          <p className="section__lead">
            Jede Sorte erzählt von einer anderen Ecke Ostfrieslands. Probieren Sie
            sich durch unser Sortiment – frisch, naturbelassen und mit Liebe
            abgefüllt.
          </p>
        </Reveal>

        <div className="products__grid">
          {products.map((p, i) => (
            <Reveal key={p.id} delay={i * 90}>
              <article className={`product-card product-card--${p.accent}`}>
                <div className="product-card__emoji" aria-hidden="true">{p.emoji}</div>
                <h3 className="product-card__name">{p.name}</h3>
                <p className="product-card__tagline">{p.tagline}</p>
                <p className="product-card__desc">{p.description}</p>
                <a href="#kontakt" className="product-card__link">
                  Anfragen <span aria-hidden="true">→</span>
                </a>
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
