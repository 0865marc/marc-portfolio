import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = process.argv[2] || 'dist'
const required = [
  'index.html',
  'proyectos/ainkii/index.html',
  'aprendizaje/index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'og-card.svg',
  'og-card.png',
]

for (const path of required) {
  const file = join(dist, path)
  if (!existsSync(file) || !readFileSync(file).length) throw new Error(`missing ${path}`)
}
const retiredRoutes = ['admin', 'blog', 'roadmap', 'career-sprint-daily', 'progreso']
for (const route of retiredRoutes) {
  if (existsSync(join(dist, route))) throw new Error(`removed route emitted: ${route}`)
}

const assets = readdirSync(join(dist, 'assets'))
if (!assets.some(name => /\.[A-Za-z0-9_-]+\.(js|css)$/.test(name))) throw new Error('missing hashed JS/CSS assets')
if (!assets.some(name => name.endsWith('.woff2'))) throw new Error('missing self-hosted font assets')

const landing = readFileSync(join(dist, 'index.html'), 'utf8')
if (landing.includes('id="root"')) throw new Error('SPA root found')
if (/<(?:audio|img|source|video)\b[^>]+(?:src|srcset)=["']https?:\/\//i.test(landing)) throw new Error('remote media found')
if (landing.includes('fonts.googleapis.com') || landing.includes('fonts.gstatic.com')) throw new Error('remote font found')
if (landing.includes('/admin/')) throw new Error('removed CMS linked from landing')

const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8')
for (const path of ['/aprendizaje/', '/proyectos/ainkii/']) {
  if (!sitemap.includes(`<loc>https://portfolio.mybrawl.io${path}</loc>`)) throw new Error(`sitemap is missing ${path}`)
}
for (const route of retiredRoutes) {
  if (sitemap.includes(`/${route}/`)) throw new Error(`removed route in sitemap: ${route}`)
}

console.log(`verified ${required.length} documents/assets and ${assets.length} hashed assets`)
