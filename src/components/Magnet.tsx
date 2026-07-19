import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react'
import { useReducedMotion } from 'framer-motion'

type MagnetProps = {
  children: ReactNode
  className?: string
  padding?: number
  strength?: number
}

export function Magnet({
  children,
  className = '',
  padding = 150,
  strength = 3,
}: MagnetProps) {
  const elementRef = useRef<HTMLDivElement>(null)
  const [transform, setTransform] = useState('translate3d(0, 0, 0)')
  const [coarsePointer, setCoarsePointer] = useState(false)
  const reducedMotion = useReducedMotion()

  useEffect(() => {
    const mediaQuery = window.matchMedia('(pointer: coarse)')
    const updatePointer = () => setCoarsePointer(mediaQuery.matches)
    updatePointer()
    mediaQuery.addEventListener('change', updatePointer)

    return () => mediaQuery.removeEventListener('change', updatePointer)
  }, [])

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    if (coarsePointer || reducedMotion || !elementRef.current) return

    const rect = elementRef.current.getBoundingClientRect()
    const relativeX = event.clientX - (rect.left + rect.width / 2)
    const relativeY = event.clientY - (rect.top + rect.height / 2)
    const withinPadding =
      Math.abs(relativeX) <= rect.width / 2 + padding &&
      Math.abs(relativeY) <= rect.height / 2 + padding

    if (!withinPadding) return

    setTransform(
      `translate3d(${relativeX / strength}px, ${relativeY / strength}px, 0)`,
    )
  }

  const resetTransform = () => setTransform('translate3d(0, 0, 0)')

  return (
    <div className={className}>
      <div
        ref={elementRef}
        onPointerMove={handlePointerMove}
        onPointerLeave={resetTransform}
        style={{
          transform: coarsePointer || reducedMotion ? undefined : transform,
          transition: 'transform 0.6s ease-in-out',
          willChange: coarsePointer || reducedMotion ? 'auto' : 'transform',
        }}
      >
        {children}
      </div>
    </div>
  )
}
