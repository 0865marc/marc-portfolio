import { FadeIn } from './FadeIn'
import { ContactButton } from './ContactButton'

const navigation = [
  { label: 'Sobre mí', href: '#about' },
  { label: 'Notas', href: '#blog' },
  { label: 'Proyectos', href: '#projects' },
  { label: 'Contacto', href: '#contact' },
]

export function HeroSection() {
  return (
    <section className="relative min-h-[100svh] bg-[#0C0C0C]" aria-labelledby="hero-title">
      <div className="mx-auto flex min-h-[100svh] w-full max-w-[1440px] flex-col px-5 sm:px-8 lg:px-12">
        <FadeIn delay={0} y={-20} className="w-full">
          <nav
            className="flex flex-col gap-1 pt-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 sm:pt-6 md:pt-8"
            aria-label="Navegación principal"
          >
            <a
              href="#hero-title"
              className="inline-flex min-h-11 shrink-0 items-center text-sm font-semibold uppercase tracking-[0.24em] text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 md:text-[0.9375rem]"
            >
              Marc
            </a>
            <ul className="grid w-full grid-cols-4 text-center text-[0.6875rem] font-medium uppercase tracking-[0.08em] text-[#D7E2EA] sm:flex sm:w-auto sm:items-center sm:justify-end sm:gap-4 sm:text-left sm:text-xs md:gap-6 md:text-sm lg:gap-8">
              {navigation.map((item) => (
                <li key={item.href} className="min-w-0">
                  <a
                    href={item.href}
                    className="inline-flex min-h-11 w-full items-center justify-center transition-opacity duration-200 hover:opacity-70 sm:w-auto"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </FadeIn>

        <div className="flex flex-1 flex-col justify-center gap-6 pb-10 pt-8 sm:gap-7 sm:pb-16 sm:pt-16 md:gap-8 md:pb-20 md:pt-20 lg:pb-24 lg:pt-24">
          <FadeIn delay={0.1} y={24}>
            <p className="max-w-[42ch] text-[0.6875rem] font-medium uppercase leading-snug tracking-[0.14em] text-[#D7E2EA] sm:text-xs md:text-sm">
              Director de proyectos y desarrollador fullstack
            </p>
          </FadeIn>
          <FadeIn delay={0.18} y={24}>
            <h1
              id="hero-title"
              className="hero-heading w-full max-w-[28ch] text-[clamp(2.5rem,8vw,5.5rem)] font-black leading-[0.98] tracking-tight"
            >
              Sistemas fiables, del producto a la infraestructura.
            </h1>
          </FadeIn>
          <FadeIn delay={0.28} y={24}>
            <p className="max-w-[42ch] text-base font-light leading-relaxed text-[#D7E2EA] sm:text-lg md:text-xl">
              Diseño y mantengo plataformas IoT, productos web e infraestructuras distribuidas.
            </p>
          </FadeIn>
          <FadeIn delay={0.38} y={24}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
