import { useEffect, useRef } from 'react'

// Schmaler "Honig-Balken" am oberen Rand, der sich beim Scrollen füllt –
// mit einem kleinen Tropfen am Ende.
export default function ScrollProgress() {
  const ref = useRef(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = document.documentElement.scrollHeight - window.innerHeight
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0
      el.style.setProperty('--p', p.toFixed(4))
      el.style.setProperty('--vis', window.scrollY > 12 ? '1' : '0')
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <div ref={ref} className="scroll-progress" aria-hidden="true">
      <div className="scroll-progress__bar" />
      <span className="scroll-progress__drop" />
    </div>
  )
}
