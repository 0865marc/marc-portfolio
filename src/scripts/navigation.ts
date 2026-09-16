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
// Wait for native fragment navigation before focusing the associated heading.
// Cached history entries retain the browser's restored scroll and focus.
addEventListener('pageshow', event => {
  if (!event.persisted && location.hash) requestAnimationFrame(focusHash)
})
