import { ArrowUpRight } from 'lucide-react'

type LiveProjectButtonProps = {
  href?: string
  label?: string
  light?: boolean
}

export function LiveProjectButton({
  href = '#contact',
  label = 'Ver proyecto',
  light = false,
}: LiveProjectButtonProps) {
  return (
    <a
      href={href}
      className={`group inline-flex shrink-0 items-center gap-2 rounded-full border-2 px-5 py-2.5 text-xs font-medium uppercase tracking-[0.18em] transition duration-300 hover:-translate-y-1 sm:px-7 sm:py-3 sm:text-sm ${
        light
          ? 'border-[#0C0C0C]/70 text-[#0C0C0C] hover:bg-[#0C0C0C]/5'
          : 'border-[#D7E2EA] text-[#D7E2EA] hover:bg-[#D7E2EA]/10'
      }`}
    >
      {label}
      <ArrowUpRight size={17} strokeWidth={1.8} aria-hidden="true" className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  )
}
