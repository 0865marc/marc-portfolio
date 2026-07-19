import type { SyntheticEvent } from 'react'
import { FadeIn } from './FadeIn'
import { Magnet } from './Magnet'
import { ContactButton } from './ContactButton'

const portraitUrl =
  'https://shrug-person-78902957.figma.site/_components/v2/d24c01ad3a56fc65e942a1f501eb73db42d7cf9a/Rectangle_40443.81459862.png'

const navigation = [
  { label: 'About', href: '#about' },
  { label: 'Blog', href: '#blog' },
  { label: 'Projects', href: '#projects' },
  { label: 'Contact', href: '#contact' },
]

function hideBrokenImage(event: SyntheticEvent<HTMLImageElement>) {
  event.currentTarget.style.opacity = '0'
}

export function HeroSection() {
  return (
    <section className="relative min-h-screen overflow-hidden bg-[#0C0C0C]" aria-labelledby="hero-title">
      <div className="relative z-20 flex min-h-screen flex-col px-6 md:px-10">
        <FadeIn delay={0} y={-20} className="w-full">
          <nav className="flex items-center justify-between gap-4 pt-6 md:pt-8" aria-label="Primary navigation">
            <a
              href="#hero-title"
              className="text-sm font-semibold uppercase tracking-[0.24em] text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 md:text-lg lg:text-[1.4rem]"
            >
              Marc
            </a>
            <ul className="flex items-center gap-4 text-right sm:gap-6 md:gap-10 lg:gap-14">
              {navigation.map((item) => (
                <li key={item.href}>
                  <a
                    href={item.href}
                    className="text-xs font-medium uppercase tracking-wider text-[#D7E2EA] transition-opacity duration-200 hover:opacity-70 sm:text-sm md:text-lg lg:text-[1.4rem]"
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </FadeIn>

        <div className="flex flex-1 flex-col justify-center pb-24 pt-16 md:justify-start md:pb-28 md:pt-24">
          <FadeIn delay={0.15} y={40}>
            <div className="overflow-hidden">
              <h1
                id="hero-title"
                className="hero-heading w-full whitespace-nowrap text-[14vw] font-black uppercase leading-none tracking-tight sm:text-[15vw] md:-mt-5 md:text-[16vw] lg:text-[17.5vw]"
              >
                Hi, i&apos;m marc
              </h1>
            </div>
          </FadeIn>
        </div>

        <Magnet
          padding={150}
          strength={3}
          className="absolute left-1/2 top-1/2 z-10 w-[280px] -translate-x-1/2 -translate-y-1/2 sm:top-auto sm:bottom-0 sm:w-[360px] sm:translate-y-0 md:w-[440px] lg:w-[520px]"
        >
          <div className="overflow-hidden rounded-t-[45%] bg-[radial-gradient(circle_at_50%_30%,rgba(215,226,234,0.22),transparent_62%)]">
            <img
              src={portraitUrl}
              alt="Marc, Fullstack Developer"
              width={520}
              height={680}
              decoding="async"
              onError={hideBrokenImage}
              className="block h-auto w-full object-contain"
            />
          </div>
        </Magnet>

        <div className="relative z-30 flex items-end justify-between gap-5 pb-7 sm:pb-8 md:pb-10">
          <FadeIn delay={0.35} y={20} className="max-w-[160px] sm:max-w-[220px] md:max-w-[260px]">
            <p className="text-[clamp(0.75rem,1.4vw,1.5rem)] font-light uppercase leading-snug tracking-wide text-[#D7E2EA]">
              a fullstack developer crafting polished apps, robust systems, and memorable digital products
            </p>
          </FadeIn>
          <FadeIn delay={0.5} y={20}>
            <ContactButton />
          </FadeIn>
        </div>
      </div>
    </section>
  )
}
