import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = process.argv[2] || 'dist'
const retiredIds = [
  'entorno-reproducible-con-agentes',
  'setup-pi-orquestacion-subagentes',
  'hermes-agent-hetzner-instalacion-segura',
  'pi-orquestacion-subagentes',
  'arquitecturas-plataformas-iot',
  'rabbitmq-celery-procesos-pesados',
  'infraestructura-distribuida-latencia',
]
const publishedEntryIds = directory => readdirSync(join(dist, directory), { withFileTypes: true })
  .filter(entry => entry.isDirectory() && existsSync(join(dist, directory, entry.name, 'index.html')))
  .map(entry => entry.name)
  .sort()
const publishedBlogIds = publishedEntryIds('blog')
const publishedDailyIds = publishedEntryIds('career-sprint-daily')
const required = [
  'index.html',
  'roadmap/index.html',
  'career-sprint-daily/index.html',
  'proyectos/ainkii/index.html',
  'blog/index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'og-card.svg',
  'og-card.png',
  'admin/index.html',
  'admin/config.yml',
  'admin/sveltia-cms.js',
  'admin/bootstrap.js',
  'admin/locales/es-CO.json',
  'admin/locales/es.json',
  'admin/sveltia-cms-package.json',
  'admin/fonts/source-sans-3-latin-wght-normal.woff2',
  'admin/fonts/noto-mono-latin-400-normal.woff2',
  'admin/fonts/material-symbols-outlined-latin-wght-normal.woff2',
  ...publishedBlogIds.map(id => `blog/${id}/index.html`),
  ...publishedDailyIds.map(id => `career-sprint-daily/${id}/index.html`),
]

for (const path of required) {
  const file = join(dist, path)
  if (!existsSync(file) || !readFileSync(file).length) throw new Error(`missing ${path}`)
}
for (const id of retiredIds) {
  if (existsSync(join(dist, 'blog', id, 'index.html'))) throw new Error(`retired blog document emitted for ${id}`)
}
if (existsSync(join(dist, 'progreso'))) throw new Error('legacy progress route emitted')

const assets = readdirSync(join(dist, 'assets'))
if (!assets.some(name => /\.[A-Za-z0-9_-]+\.(js|css)$/.test(name))) throw new Error('missing hashed JS/CSS assets')
if (!assets.some(name => name.endsWith('.woff2'))) throw new Error('missing self-hosted font assets')

const landing = readFileSync(join(dist, 'index.html'), 'utf8')
if (landing.includes('id="root"')) throw new Error('SPA root found')
if (/<(?:audio|img|source|video)\b[^>]+(?:src|srcset)=["']https?:\/\//i.test(landing)) throw new Error('remote media found')
if (landing.includes('fonts.googleapis.com') || landing.includes('fonts.gstatic.com')) throw new Error('remote font found')
if (landing.includes('/admin/')) throw new Error('private CMS linked from landing')

const admin = readFileSync(join(dist, 'admin/index.html'), 'utf8')
const config = readFileSync(join(dist, 'admin/config.yml'), 'utf8')
const sitemap = readFileSync(join(dist, 'sitemap.xml'), 'utf8')
if (!admin.includes('content="noindex,nofollow"')) throw new Error('admin metadata is indexable')
if (/<script\b[^>]+src=["']https?:\/\//i.test(admin)) throw new Error('admin CMS script is not self-hosted')
if (!admin.includes('src="./bootstrap.js"') || !admin.includes('src="./sveltia-cms.js"')) {
  throw new Error('admin CMS bootstrap or bundle is missing')
}
for (const requiredConfig of ['locale: es-CO', 'publish_mode: editorial_workflow', 'auth_methods: [oauth]', '- name: weeks', '- name: daily']) {
  if (!config.includes(requiredConfig)) throw new Error(`admin CMS config is missing ${requiredConfig}`)
}
for (const path of ['/roadmap/', '/career-sprint-daily/']) {
  if (!sitemap.includes(`<loc>https://portfolio.mybrawl.io${path}</loc>`)) throw new Error(`sitemap is missing ${path}`)
}
for (const id of publishedBlogIds) {
  if (!sitemap.includes(`<loc>https://portfolio.mybrawl.io/blog/${id}/</loc>`)) {
    throw new Error(`published blog document missing from sitemap: ${id}`)
  }
}
for (const id of publishedDailyIds) {
  if (!sitemap.includes(`<loc>https://portfolio.mybrawl.io/career-sprint-daily/${id}/</loc>`)) {
    throw new Error(`published daily document missing from sitemap: ${id}`)
  }
}
if (sitemap.includes('<loc>https://portfolio.mybrawl.io/progreso/')) throw new Error('legacy progress route in sitemap')

console.log(`verified ${required.length} documents/assets, ${publishedBlogIds.length} knowledge articles, ${publishedDailyIds.length} daily entries, and ${assets.length} hashed assets`)
