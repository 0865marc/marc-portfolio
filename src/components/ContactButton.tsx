import { Mail } from 'lucide-react'

export function ContactButton() {
  return (
    <a
      href="#contact"
      className="group inline-flex items-center gap-3 rounded-full border-2 border-white bg-[linear-gradient(123deg,#18011F_7%,#B600A8_37%,#7621B0_72%,#BE4C00_100%)] px-8 py-3 text-xs font-medium uppercase tracking-[0.22em] text-white shadow-[0_4px_4px_rgba(181,1,167,0.25),4px_4px_12px_#7721B1_inset] transition duration-300 hover:-translate-y-1 hover:brightness-110 sm:px-10 sm:py-3.5 sm:text-sm md:px-12 md:py-4 md:text-base"
      aria-label="Contactar con Marc"
    >
      Contacto
      <Mail size={18} strokeWidth={1.8} aria-hidden="true" className="transition-transform duration-300 group-hover:rotate-12" />
    </a>
  )
}
