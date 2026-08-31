const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches

if (import.meta.hot) {
  import.meta.hot.on('career-content-updated', () => window.location.reload())
}

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

const disclosures = [...document.querySelectorAll<HTMLDetailsElement>('[data-disclosure]')]
if (!reducedMotion) {
  const disclosureDuration = 420

  disclosures.forEach(disclosure => {
    const summary = disclosure.querySelector<HTMLElement>('summary')
    const panel = disclosure.querySelector<HTMLElement>('[data-disclosure-panel]')
    if (!summary || !panel) return

    let animating = false
    let timeoutId: number | undefined
    disclosure.classList.add('disclosure-enhanced')

    const watchTransition = (opening: boolean) => {
      let settled = false
      const settle = () => {
        if (settled) return
        settled = true
        panel.removeEventListener('transitionend', onTransitionEnd)
        panel.removeEventListener('transitioncancel', onTransitionCancel)
        if (timeoutId !== undefined) window.clearTimeout(timeoutId)
        if (opening) panel.style.height = 'auto'
        else {
          disclosure.open = false
          panel.style.removeProperty('height')
        }
        animating = false
      }
      const onTransitionEnd = (event: TransitionEvent) => {
        if (event.target !== panel || event.propertyName !== 'height') return
        settle()
      }
      const onTransitionCancel = (event: TransitionEvent) => {
        if (event.target !== panel || event.propertyName !== 'height') return
        settle()
      }
      panel.addEventListener('transitionend', onTransitionEnd)
      panel.addEventListener('transitioncancel', onTransitionCancel)
      timeoutId = window.setTimeout(settle, disclosureDuration + 80)
    }

    summary.addEventListener('click', event => {
      event.preventDefault()
      if (animating) return

      const opening = !disclosure.open
      animating = true
      disclosure.open = true

      if (opening) {
        panel.style.height = '0px'
        watchTransition(true)
        requestAnimationFrame(() => {
          panel.style.height = `${panel.scrollHeight}px`
        })
      } else {
        panel.style.height = `${panel.getBoundingClientRect().height}px`
        watchTransition(false)
        requestAnimationFrame(() => {
          panel.style.height = '0px'
        })
      }
    })
  })
}

const readingRoot = document.querySelector<HTMLElement>('[data-reading-root]')
const readingProgress = document.querySelector<HTMLElement>('[data-reading-progress]')
const articleIndex = document.querySelector<HTMLElement>('[data-article-index]')
const floatingIndex = document.querySelector<HTMLElement>('[data-floating-index]')
if (readingRoot && readingProgress) {
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
