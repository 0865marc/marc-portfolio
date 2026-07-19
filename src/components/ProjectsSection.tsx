import { useRef, type SyntheticEvent } from 'react'
import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion'
import { projects } from '../data/portfolio'
import { FadeIn } from './FadeIn'
import { LiveProjectButton } from './LiveProjectButton'

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0'
}

type ProjectCardProps = {
  index: number
  total: number
  number: string
  category: string
  name: string
  images: [string, string, string]
}

function ProjectCard({
  index,
  total,
  number,
  category,
  name,
  images,
}: ProjectCardProps) {
  const cardRef = useRef<HTMLElement>(null)
  const reducedMotion = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: cardRef,
    offset: ['start end', 'start start'],
  })
  const targetScale = 1 - (total - 1 - index) * 0.03
  const scale = useTransform(scrollYProgress, [0, 1], [1, targetScale])

  return (
    <div className="relative md:min-h-[85vh] md:pb-24">
      <motion.article
        ref={cardRef}
        style={{
          scale: reducedMotion ? 1 : scale,
          top: `${index * 28}px`,
        }}
        className="project-card-motion relative min-h-[545px] overflow-hidden rounded-[40px] border-2 border-[#D7E2EA] bg-[#0C0C0C] p-4 sm:rounded-[50px] sm:p-6 md:sticky md:top-32 md:min-h-0 md:rounded-[60px] md:p-8"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-baseline gap-3 text-[#D7E2EA]">
              <span className="text-[clamp(3rem,10vw,140px)] font-black leading-[0.72] tracking-tight">
                {number}
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.2em] opacity-60 sm:text-sm">
                {category}
              </span>
            </div>
            <h3 className="mt-5 max-w-xl text-[clamp(1.4rem,3vw,3rem)] font-medium uppercase leading-tight text-[#D7E2EA] sm:mt-7">
              {name}
            </h3>
          </div>
          <LiveProjectButton />
        </div>

        <div className="mt-8 grid grid-cols-[40%_60%] gap-2 sm:gap-3 md:mt-10">
          <div className="flex flex-col gap-2 sm:gap-3">
            <ProjectImage src={images[0]} alt={`${name} interface view one`} className="h-[130px] sm:h-[170px] md:h-[clamp(130px,16vw,230px)]" />
            <ProjectImage src={images[1]} alt={`${name} interface view two`} className="h-[160px] sm:h-[210px] md:h-[clamp(160px,22vw,340px)]" />
          </div>
          <ProjectImage src={images[2]} alt={`${name} interface overview`} className="h-[298px] sm:h-[383px] md:h-[clamp(300px,40vw,580px)]" />
        </div>
      </motion.article>
    </div>
  )
}

type ProjectImageProps = {
  src: string
  alt: string
  className: string
}

function ProjectImage({ src, alt, className }: ProjectImageProps) {
  return (
    <div className={`overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#1a1724,#334554)] sm:rounded-[40px] md:rounded-[60px] ${className}`}>
      <img
        src={src}
        alt={alt}
        width={1280}
        height={720}
        loading="lazy"
        decoding="async"
        onError={hideBrokenImage}
        className="block h-full w-full object-cover transition-opacity duration-500"
      />
    </div>
  )
}

export function ProjectsSection() {
  return (
    <section
      id="projects"
      className="relative z-10 -mt-10 scroll-mt-6 rounded-t-[40px] bg-[#0C0C0C] px-5 pb-0 pt-20 sm:-mt-12 sm:rounded-t-[50px] sm:px-8 sm:pt-24 md:-mt-14 md:rounded-t-[60px] md:px-10 md:pt-32"
      aria-labelledby="projects-title"
    >
      <FadeIn y={40}>
        <h2
          id="projects-title"
          className="hero-heading text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight"
        >
          Project
        </h2>
      </FadeIn>

      <div className="mx-auto mt-12 max-w-6xl sm:mt-16 md:mt-20">
        {projects.map((project, index) => (
          <ProjectCard key={project.number} index={index} total={projects.length} {...project} />
        ))}
      </div>

      <footer
        id="contact"
        className="mx-auto mt-16 flex max-w-6xl flex-col gap-8 border-t border-[#D7E2EA]/20 py-12 text-[#D7E2EA] sm:mt-24 sm:flex-row sm:items-end sm:justify-between sm:py-16"
      >
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] opacity-[0.55]">Have a product in mind?</p>
          <h2 className="mt-4 max-w-2xl text-[clamp(2rem,5vw,5rem)] font-medium uppercase leading-none">
            Let&apos;s build something useful.
          </h2>
        </div>
        <a
          href="mailto:hello@marc.dev"
          className="w-fit text-sm font-medium uppercase tracking-[0.16em] underline decoration-[#D7E2EA]/40 underline-offset-8 transition-opacity duration-200 hover:opacity-70 sm:text-base"
        >
          hello@marc.dev
        </a>
      </footer>
    </section>
  )
}
