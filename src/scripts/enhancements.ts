const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

const reveal = (element: HTMLElement) => {
  if (element.classList.contains('revealed')) return
  element.classList.add('revealed')
  if (reducedMotion) return

  const delay = Number(element.dataset.revealDelay ?? 0)
  element.animate(
    [
      { transform: 'translateY(20px)' },
      { transform: 'translateY(0)' },
    ],
    {
      duration: 520,
      delay: Number.isFinite(delay) ? delay : 0,
      easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
      fill: 'backwards',
    },
  )
}

const revealElements = [...document.querySelectorAll<HTMLElement>('[data-reveal]')]
if (!reducedMotion && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return
      reveal(entry.target as HTMLElement)
      observer.unobserve(entry.target)
    })
  }, { rootMargin: '0px 0px -6%' })
  revealElements.forEach(element => observer.observe(element))
} else {
  revealElements.forEach(reveal)
}
