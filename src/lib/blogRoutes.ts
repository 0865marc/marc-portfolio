export type BlogSource = 'landing' | 'index'
export const LANDING_BLOG_HREF = '/#blog'
export const BLOG_INDEX_HREF = '/blog/'
export const MISSING_POST_HREF = '/blog/articulo-no-encontrado/'
export function blogPostHref(id: string, source: BlogSource = 'index') { return `/blog/${encodeURIComponent(id)}/?from=${source}` }
export function legacyHashTarget(hash: string): string | null {
  if (hash === '#/blog') return BLOG_INDEX_HREF
  if (!hash.startsWith('#/blog/')) return null
  const route = hash.slice(7); const queryAt = route.indexOf('?')
  const encodedId = queryAt < 0 ? route : route.slice(0, queryAt)
  const source = new URLSearchParams(queryAt < 0 ? '' : route.slice(queryAt + 1)).get('from') === 'landing' ? 'landing' : 'index'
  if (!encodedId) return `${MISSING_POST_HREF}?from=${source}`
  try { const id = decodeURIComponent(encodedId); return id ? blogPostHref(id, source) : `${MISSING_POST_HREF}?from=${source}` }
  catch { return `${MISSING_POST_HREF}?from=${source}` }
}
