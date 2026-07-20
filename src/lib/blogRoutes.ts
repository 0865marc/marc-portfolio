export type AppRoute =
  | { view: 'landing'; anchor: string | null }
  | { view: 'blog-index' }
  | { view: 'blog-post'; id: string | null; source: BlogSource }

export type BlogSource = 'landing' | 'index'

export const LANDING_BLOG_HREF = '/#blog'
export const BLOG_INDEX_HREF = '/#/blog'

export function blogPostHref(id: string, source: BlogSource = 'index') {
  return `${BLOG_INDEX_HREF}/${encodeURIComponent(id)}?from=${source}`
}

export function parseHash(hash: string): AppRoute {
  if (hash === '#/blog') {
    return { view: 'blog-index' }
  }

  if (hash.startsWith('#/blog/')) {
    const routeValue = hash.slice('#/blog/'.length)
    const queryStart = routeValue.indexOf('?')
    const encodedId = queryStart === -1 ? routeValue : routeValue.slice(0, queryStart)
    const search = queryStart === -1 ? '' : routeValue.slice(queryStart + 1)
    const source = new URLSearchParams(search).get('from') === 'landing' ? 'landing' : 'index'

    if (!encodedId) {
      return { view: 'blog-post', id: null, source }
    }

    try {
      const id = decodeURIComponent(encodedId)
      return { view: 'blog-post', id: id || null, source }
    } catch {
      return { view: 'blog-post', id: null, source }
    }
  }

  if (hash.startsWith('#/')) {
    return { view: 'landing', anchor: null }
  }

  const rawAnchor = hash.startsWith('#') ? hash.slice(1) : hash

  if (!rawAnchor) {
    return { view: 'landing', anchor: null }
  }

  try {
    return { view: 'landing', anchor: decodeURIComponent(rawAnchor) }
  } catch {
    return { view: 'landing', anchor: rawAnchor }
  }
}
