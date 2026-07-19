import { useRef } from 'react'
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'framer-motion'

type AnimatedTextProps = {
  text: string
  className?: string
}

type AnimatedCharacterProps = {
  character: string
  index: number
  total: number
  progress: MotionValue<number>
}

function AnimatedCharacter({
  character,
  index,
  total,
  progress,
}: AnimatedCharacterProps) {
  const start = index / total
  const end = Math.min(1, start + 0.14)
  const opacity = useTransform(progress, [start, end], [0.2, 1])

  return (
    <motion.span aria-hidden="true" className="inline-block" style={{ opacity }}>
      {character === ' ' ? '\u00a0' : character}
    </motion.span>
  )
}

export function AnimatedText({ text, className = '' }: AnimatedTextProps) {
  const paragraphRef = useRef<HTMLParagraphElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: paragraphRef,
    offset: ['start 0.8', 'end 0.2'],
  })

  if (reducedMotion) {
    return (
      <p ref={paragraphRef} className={className}>
        {text}
      </p>
    )
  }

  const characters = Array.from(text)

  return (
    <p ref={paragraphRef} className={className} aria-label={text}>
      {characters.map((character, index) => (
        <AnimatedCharacter
          key={`${character}-${index}`}
          character={character}
          index={index}
          total={characters.length}
          progress={scrollYProgress}
        />
      ))}
    </p>
  )
}
