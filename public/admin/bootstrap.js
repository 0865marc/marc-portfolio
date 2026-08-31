(() => {
  const locale = 'es-CO'
  const nativeFetch = window.fetch.bind(window)

  for (const [property, value] of Object.entries({ language: locale, languages: [locale, 'es'] })) {
    try {
      Object.defineProperty(navigator, property, { configurable: true, value })
    } catch {
      // Browsers that lock navigator fields still use their Spanish locale when configured.
    }
  }
  window.fetch = (input, init) => {
    const url = new URL(input instanceof Request ? input.url : input, window.location.href)
    const locale = url.pathname.match(/^\/@sveltia\/cms@0\.196\.0\/locales\/(es(?:-CO)?)\.json$/)

    if (url.hostname !== 'unpkg.com') return nativeFetch(input, init)
    if (locale) return nativeFetch(`/admin/locales/${locale[1]}.json`, init)
    if (url.pathname === '/@sveltia/cms/package.json') return nativeFetch('/admin/sveltia-cms-package.json', init)
    return nativeFetch(input, init)
  }
})()
