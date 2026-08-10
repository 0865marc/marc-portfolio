import type { APIRoute } from 'astro'
import { blogPosts } from '../data/blog'

export const prerender = true

const escapeXml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&apos;')

export const GET: APIRoute = ({ site }) => {
  const origin = site ?? new URL('https://portfolio.mybrawl.io')
  const entries = [
    { path: '/', lastmod: null },
    { path: '/proyectos/ainkii/', lastmod: '2026-08-10' },
    { path: '/blog/', lastmod: null },
    ...blogPosts.map(post => ({ path: `/blog/${post.id}/`, lastmod: post.publishedAt })),
  ]
  const urls = entries.map(entry => {
    const loc = escapeXml(new URL(entry.path, origin).href)
    const lastmod = entry.lastmod ? `<lastmod>${entry.lastmod}</lastmod>` : ''
    return `<url><loc>${loc}</loc>${lastmod}</url>`
  }).join('')
  const body = `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`

  return new Response(body, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  })
}
