import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

const dist = process.argv[2] || 'dist'
const publishedIds = ['hermes-agent-hetzner-instalacion-segura']
const legacyIds = ['arquitecturas-plataformas-iot', 'rabbitmq-celery-procesos-pesados', 'infraestructura-distribuida-latencia']
const required = [
  'index.html',
  'proyectos/ainkii/index.html',
  'blog/index.html',
  '404.html',
  'robots.txt',
  'sitemap.xml',
  'og-card.svg',
  'og-card.png',
  ...publishedIds.map(id => `blog/${id}/index.html`),
  ...legacyIds.map(id => `blog/${id}/index.html`),
]

for (const path of required) {
  const file = join(dist, path)
  if (!existsSync(file) || !readFileSync(file).length) throw new Error(`missing ${path}`)
}

const assets = readdirSync(join(dist, 'assets'))
if (!assets.some(name => /\.[A-Za-z0-9_-]+\.(js|css)$/.test(name))) throw new Error('missing hashed JS/CSS assets')
if (!assets.some(name => name.endsWith('.woff2'))) throw new Error('missing self-hosted font assets')

const landing = readFileSync(join(dist, 'index.html'), 'utf8')
if (landing.includes('id="root"')) throw new Error('SPA root found')
if (/<(?:audio|img|source|video)\b[^>]+(?:src|srcset)=["']https?:\/\//i.test(landing)) throw new Error('remote media found')
if (landing.includes('fonts.googleapis.com') || landing.includes('fonts.gstatic.com')) throw new Error('remote font found')

console.log(`verified ${required.length} documents/assets and ${assets.length} hashed assets`)
