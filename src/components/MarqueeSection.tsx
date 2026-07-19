import { useEffect, useRef, useState, type SyntheticEvent } from 'react'
import { marqueeRows } from '../data/portfolio'
import { FadeIn } from './FadeIn'
import { useReducedMotion } from 'framer-motion'

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0'
}

export function MarqueeSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [scrollOffset, setScrollOffset] = useState(0)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    if (reducedMotion) return

    let sectionTop = sectionRef.current?.offsetTop ?? 0
    let frame: number | null = null

    const updateSectionTop = () => {
      sectionTop = sectionRef.current?.offsetTop ?? 0
    }

    const updateOffset = () => {
      if (frame !== null) return

      frame = window.requestAnimationFrame(() => {
        const offset = (window.scrollY - sectionTop + window.innerHeight) * 0.3
        setScrollOffset(offset)
        frame = null
      })
    }

    window.addEventListener('scroll', updateOffset, { passive: true })
    window.addEventListener('resize', updateSectionTop)
    updateOffset()

    return () => {
      window.removeEventListener('scroll', updateOffset)
      window.removeEventListener('resize', updateSectionTop)
      if (frame !== null) window.cancelAnimationFrame(frame)
    }
  }, [reducedMotion])

  return (
    <section
      ref={sectionRef}
      className="overflow-hidden bg-[#0C0C0C] pb-10 pt-24 sm:pt-32 md:pt-40"
      aria-label="Selected interface inspiration"
    >
      <div className="flex flex-col gap-3">
        {marqueeRows.map((row, rowIndex) => {
          const direction = rowIndex === 0 ? 1 : -1
          const translate = reducedMotion
            ? 0
            : direction === 1
              ? scrollOffset - 200
              : -(scrollOffset - 200)

          return (
            <FadeIn key={rowIndex} delay={rowIndex * 0.1} y={20}>
              <div
                className="flex w-max gap-3 will-change-transform"
                style={{ transform: `translate3d(${translate}px, 0, 0)` }}
              >
                {row.map((gifUrl, imageIndex) => (
                  <div
                    key={`${rowIndex}-${imageIndex}-${gifUrl}`}
                    className="h-[190px] w-[280px] shrink-0 overflow-hidden rounded-2xl bg-[linear-gradient(135deg,#1a1724,#334554)] sm:h-[270px] sm:w-[420px]"
                  >
                    <img
                      src={gifUrl}
                      alt=""
                      aria-hidden="true"
                      width={420}
                      height={270}
                      loading="lazy"
                      decoding="async"
                      onError={hideBrokenImage}
                      className="block h-full w-full object-cover transition-opacity duration-500"
                    />
                  </div>
                ))}
              </div>
            </FadeIn>
          )
        })}
      </div>
    </section>
  )
}
