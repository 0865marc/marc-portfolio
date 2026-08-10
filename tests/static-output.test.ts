import { readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { blogPosts, legacyBlogRoutes } from '../src/data/blog'
import { professionalProfile } from '../src/data/portfolio'

const dist = join(process.cwd(), 'dist')
const read = (path: string) => readFileSync(join(dist, path), 'utf8')

describe('static output', () => {
  it.each(['index.html', 'proyectos/ainkii/index.html', 'blog/index.html', '404.html', 'robots.txt', 'sitemap.xml'])(
    'emits %s',
    path => expect(statSync(join(dist, path)).size).toBeGreaterThan(50),
  )

  it('emits local identity and social assets', () => {
    expect(statSync(join(dist, 'favicon.svg')).size).toBeGreaterThan(100)
    expect(statSync(join(dist, 'og-card.svg')).size).toBeGreaterThan(500)
    expect(statSync(join(dist, 'og-card.png')).size).toBeGreaterThan(10_000)
    expect(read('index.html')).toContain('href="/favicon.svg"')
  })

  it('renders the complete factual landing without retired claims or remote media', () => {
    const html = read('index.html')
    for (const expected of [
      professionalProfile.identity.headline,
      'Taurus Research &amp; Development',
      'MCSystems',
      '3 distribuidores',
      '20–25 servicios',
      'Universitat de Lleida',
      'Profesional funcional',
      'Ainkii',
      'Hermes',
    ]) expect(html).toContain(expected)
    for (const unsupported of ['Miles de dispositivos', '15+ servidores', 'MQTT', 'Gym Tracker', 'Automation Systems']) {
      expect(html).not.toContain(unsupported)
    }
    expect(html).not.toMatch(/<(?:audio|img|source|video)\b[^>]+(?:src|srcset)=["']https?:\/\//i)
    expect(html).not.toContain('fonts.googleapis.com')
    expect(html).not.toContain('id="root"')
  })

  it('publishes canonical, social and Person/WebSite metadata', () => {
    const html = read('index.html')
    expect(html).toContain('https://portfolio.mybrawl.io/')
    expect(html).toContain('property="og:image" content="https://portfolio.mybrawl.io/og-card.png"')
    expect(html).toContain('name="twitter:card" content="summary_large_image"')
    expect(html).toContain('"@type":"Person"')
    expect(html).toContain('"@type":"WebSite"')
  })

  it('publishes the complete Ainkii model without an invented stack', () => {
    const html = read('proyectos/ainkii/index.html')
    for (const expected of ['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje', 'Copiloto editorial', 'Validación humana', 'En desarrollo']) {
      expect(html).toContain(expected)
    }
    expect(html).toContain('"@type":"CreativeWork"')
    expect(html).not.toContain('FastAPI')
    expect(html).not.toContain('React')
  })

  it.each(blogPosts)('emits $id with source-backed body and BlogPosting metadata', post => {
    const html = read(`blog/${post.id}/index.html`)
    expect(html).toContain(post.title)
    expect(html).toContain(post.introduction[0])
    expect(html).toContain(`https://portfolio.mybrawl.io/blog/${post.id}/`)
    expect(html).toContain('"@type":"BlogPosting"')
    expect(html).not.toContain('<pre')
  })

  it.each(legacyBlogRoutes)('keeps $id as a noindex retirement path', legacy => {
    const html = read(`blog/${legacy.id}/index.html`)
    expect(html).toContain('content="noindex,follow"')
    expect(html).toContain('http-equiv="refresh"')
    expect(html).toContain('Contenido retirado')
  })

  it('publishes discovery files with only canonical public routes', () => {
    const robots = read('robots.txt')
    const sitemap = read('sitemap.xml')
    expect(robots).toContain('Sitemap: https://portfolio.mybrawl.io/sitemap.xml')
    expect(sitemap).toContain('<loc>https://portfolio.mybrawl.io/</loc>')
    expect(sitemap).toContain('<loc>https://portfolio.mybrawl.io/proyectos/ainkii/</loc>')
    expect(sitemap).toContain(`<loc>https://portfolio.mybrawl.io/blog/${blogPosts[0].id}/</loc>`)
    expect(sitemap).not.toContain('404')
    for (const legacy of legacyBlogRoutes) expect(sitemap).not.toContain(legacy.id)
  })

  it('keeps 404 out of the canonical index', () => {
    const html = read('404.html')
    expect(html).toContain('content="noindex,follow"')
    expect(html).not.toContain('rel="canonical"')
  })

  it('keeps stable unique current and legacy IDs', () => {
    const ids = [...blogPosts.map(post => post.id), ...legacyBlogRoutes.map(route => route.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })
})
