import type { SyntheticEvent } from 'react'
import { experience } from '../data/portfolio'
import { FadeIn } from './FadeIn'
import { AnimatedText } from './AnimatedText'
import { ContactButton } from './ContactButton'

const decorativeImages = [
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/moon_icon.11395d36.png',
    className: 'left-[1%] top-[4%] w-[120px] sm:left-[2%] sm:w-[160px] md:left-[4%] md:w-[210px]',
    delay: 0.1,
    x: -80,
  },
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/p59_1.4659672e.png',
    className: 'bottom-[8%] left-[3%] w-[100px] sm:left-[6%] sm:w-[140px] md:left-[10%] md:w-[180px]',
    delay: 0.25,
    x: -80,
  },
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/lego_icon-1.703bb594.png',
    className: 'right-[1%] top-[4%] w-[120px] sm:right-[2%] sm:w-[160px] md:right-[4%] md:w-[210px]',
    delay: 0.15,
    x: 80,
  },
  {
    src: 'https://shrug-person-78902957.figma.site/_components/v2/ebb2b8f25d8e24d5f0a5ca8af4c950de81aa2fd7/Group_134-1.2e04f3ce.png',
    className: 'bottom-[8%] right-[3%] w-[130px] sm:right-[6%] sm:w-[170px] md:right-[10%] md:w-[220px]',
    delay: 0.3,
    x: 80,
  },
]

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0'
}

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative flex min-h-screen scroll-mt-6 items-center justify-center overflow-hidden bg-[#0C0C0C] px-5 py-20 sm:px-8 md:px-10"
      aria-labelledby="about-title"
    >
      {decorativeImages.map((image, index) => (
        <FadeIn
          key={image.src}
          delay={image.delay}
          x={image.x}
          y={0}
          className={`pointer-events-none absolute z-0 hidden opacity-80 sm:block ${image.className}`}
        >
          <img
            src={image.src}
            alt=""
            aria-hidden="true"
            width={220}
            height={220}
            loading="lazy"
            decoding="async"
            onError={hideBrokenImage}
            className="block h-auto w-full object-contain transition-opacity duration-500"
          />
        </FadeIn>
      ))}

      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center gap-14 text-center sm:gap-20 md:gap-24">
        <FadeIn delay={0} y={40}>
          <h2
            id="about-title"
            className="hero-heading text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight"
          >
            Sobre mí
          </h2>
        </FadeIn>

        <div className="flex w-full flex-col items-center gap-14 sm:gap-20 md:gap-24">
          <AnimatedText
            text="Soy Marc, desarrollador fullstack y director de proyectos. Trabajo conectando producto, software e infraestructura: desde una plataforma web que recibe datos de miles de dispositivos IoT hasta operaciones distribuidas con servidores en distintos países."
            className="max-w-2xl text-[clamp(1rem,2vw,1.35rem)] font-medium leading-relaxed text-[#D7E2EA]"
          />

          <div className="w-full max-w-3xl text-left">
            <h3 className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.24em] text-[#D7E2EA]/60 sm:mb-10">
              Experiencia
            </h3>
            <div className="space-y-8 sm:space-y-10">
              {experience.map((entry) => (
                <article
                  key={entry.id}
                  className="grid gap-4 border-t border-[#D7E2EA]/20 pt-8 sm:grid-cols-[minmax(0,0.85fr)_minmax(0,1.5fr)] sm:gap-8 sm:pt-10"
                >
                  <h4 className="text-[clamp(1.15rem,2.5vw,1.8rem)] font-medium uppercase leading-tight text-[#D7E2EA]">
                    {entry.title}
                  </h4>
                  <div>
                    <p className="text-[clamp(0.95rem,1.6vw,1.2rem)] font-light leading-relaxed text-[#D7E2EA]/80">
                      {entry.description}
                    </p>
                    <p className="mt-4 text-xs font-medium uppercase tracking-[0.14em] text-[#D7E2EA]/50">
                      {entry.stack}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          </div>

          <FadeIn delay={0.2} y={20}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
