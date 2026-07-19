import { services } from '../data/portfolio'
import { FadeIn } from './FadeIn'

export function ServicesSection() {
  return (
    <section
      className="rounded-t-[40px] bg-white px-5 py-20 text-[#0C0C0C] sm:rounded-t-[50px] sm:px-8 sm:py-24 md:rounded-t-[60px] md:px-10 md:py-32"
      aria-labelledby="services-title"
    >
      <FadeIn y={40}>
        <h2
          id="services-title"
          className="mb-16 text-center text-[clamp(3rem,12vw,160px)] font-black uppercase leading-none tracking-tight sm:mb-20 md:mb-28"
        >
          Services
        </h2>
      </FadeIn>

      <div className="mx-auto max-w-5xl">
        {services.map((service, index) => (
          <FadeIn key={service.number} delay={index * 0.1} y={30}>
            <article className="grid grid-cols-[72px_1fr] gap-4 border-t border-[rgba(12,12,12,0.15)] py-8 sm:grid-cols-[140px_1fr] sm:gap-6 sm:py-10 md:grid-cols-[180px_1fr] md:gap-8 md:py-12">
              <p className="text-[clamp(3rem,10vw,140px)] font-black leading-[0.8] tracking-tight">
                {service.number}
              </p>
              <div>
                <h3 className="text-[clamp(1rem,2.2vw,2.1rem)] font-medium uppercase leading-tight">
                  {service.name}
                </h3>
                <p className="mt-3 max-w-2xl text-[clamp(0.85rem,1.6vw,1.25rem)] font-light leading-relaxed opacity-60">
                  {service.description}
                </p>
              </div>
            </article>
          </FadeIn>
        ))}
      </div>
    </section>
  )
}
