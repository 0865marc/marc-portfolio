export type BlogSource = 'landing' | 'index'
export function blogPostHref(id: string, source: BlogSource = 'index') { return `/blog/${encodeURIComponent(id)}/?from=${source}` }
