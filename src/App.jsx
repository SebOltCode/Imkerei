import Navbar from './components/Navbar.jsx'
import Hero from './components/Hero.jsx'
import About from './components/About.jsx'
import Products from './components/Products.jsx'
import Region from './components/Region.jsx'
import Gallery from './components/Gallery.jsx'
import Partners from './components/Partners.jsx'
import Contact from './components/Contact.jsx'
import Footer from './components/Footer.jsx'
import AnimatedBee from './components/AnimatedBee.jsx'

export default function App() {
  return (
    <>
      <AnimatedBee />
      <Navbar />
      <main>
        <Hero />
        <About />
        <Products />
        <Region />
        <Gallery />
        <Partners />
        <Contact />
      </main>
      <Footer />
    </>
  )
}
