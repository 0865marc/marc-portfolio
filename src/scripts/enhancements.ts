const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

const markBrokenImage = (image: HTMLImageElement) => {
  image.style.opacity = '0'
  image.dataset.failed = 'true'
  image.closest<HTMLElement>('[data-image-frame]')?.classList.add('image-failed')
}

document.querySelectorAll<HTMLImageElement>('[data-image-fallback]').forEach(image => {
  image.addEventListener('error', () => markBrokenImage(image), { once: true })
  if (image.complete && !image.naturalWidth) markBrokenImage(image)
})

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

const readingRoot = document.querySelector<HTMLElement>('[data-reading-root]')
const readingProgress = document.querySelector<HTMLElement>('[data-reading-progress]')
const articleIndex = document.querySelector<HTMLElement>('[data-article-index]')
const floatingIndex = document.querySelector<HTMLElement>('[data-floating-index]')
if (readingRoot && readingProgress) {
  const readingLayout = readingRoot.closest<HTMLElement>('.article-reading-layout')
  let scheduled = false
  const articleSections = [...readingRoot.querySelectorAll<HTMLElement>('[data-article-section]')]
  const floatingLinks = floatingIndex
    ? [...floatingIndex.querySelectorAll<HTMLAnchorElement>('[data-floating-index-link]')]
    : []

  const updateArticleState = () => {
    const start = readingRoot.offsetTop
    const distance = Math.max(1, readingRoot.offsetHeight - innerHeight)
    const progress = Math.min(1, Math.max(0, (scrollY - start) / distance))
    readingProgress.style.setProperty('--reading-progress', String(progress))

    if (articleIndex && floatingIndex) {
      const indexBounds = articleIndex.getBoundingClientRect()
      const articleBounds = readingRoot.getBoundingClientRect()
      const showFloatingIndex = innerWidth >= 1280 && indexBounds.bottom < 24 && articleBounds.bottom > 160
      readingLayout?.classList.toggle('has-floating-index', showFloatingIndex)
      floatingIndex.classList.toggle('is-visible', showFloatingIndex)
      floatingIndex.setAttribute('aria-hidden', String(!showFloatingIndex))
      floatingIndex.inert = !showFloatingIndex

      const readingLine = innerHeight * 0.3
      const activeSection = articleSections.reduce<HTMLElement | null>((active, section) => (
        section.getBoundingClientRect().top <= readingLine ? section : active
      ), articleSections[0] ?? null)
      floatingLinks.forEach(link => {
        const active = activeSection ? link.hash === `#${activeSection.id}` : false
        link.classList.toggle('is-active', active)
        if (active) link.setAttribute('aria-current', 'location')
        else link.removeAttribute('aria-current')
      })
    }
    scheduled = false
  }
  const scheduleArticleState = () => {
    if (scheduled) return
    scheduled = true
    requestAnimationFrame(updateArticleState)
  }
  updateArticleState()
  addEventListener('scroll', scheduleArticleState, { passive: true })
  addEventListener('resize', scheduleArticleState)
}
