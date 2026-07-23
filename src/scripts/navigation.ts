const heading = document.querySelector<HTMLElement>('[data-route-heading]')

const focusRoute = () => {
  const pageHasFocusTarget = document.activeElement === document.body || document.activeElement === document.documentElement
  if (heading && !location.hash && pageHasFocusTarget) heading.focus({ preventScroll: true })
}

focusRoute()
addEventListener('pageshow', focusRoute, { once: true })
addEventListener('pagereveal', focusRoute, { once: true })

const back = document.querySelector<HTMLAnchorElement>('[data-article-back]')
if (back && new URLSearchParams(location.search).get('from') === 'landing') {
  back.href = '/#blog'
  back.firstChild!.textContent = 'Volver al blog del portfolio '
}

const focusHash = () => {
  const id = location.hash.slice(1)
  if (!id || id.startsWith('/')) return
  const target = document.getElementById(id)
  const associatedHeading = target?.matches('h1,h2,h3,h4,h5,h6')
    ? target as HTMLElement
    : target?.querySelector<HTMLElement>('h1,h2,h3,h4,h5,h6')
  target?.scrollIntoView()
  associatedHeading?.focus({ preventScroll: true })
}

addEventListener('hashchange', focusHash)
if (location.hash) requestAnimationFrame(focusHash)
