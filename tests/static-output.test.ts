import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { blogPosts } from '../src/data/blog'
import { challengeWeeks, dailyProgressEntries } from '../src/data/challenge'
import { professionalProfile } from '../src/data/portfolio'

const dist = join(process.cwd(), 'dist')
const retiredBlogIds = [
  'entorno-reproducible-con-agentes',
  'setup-pi-orquestacion-subagentes',
  'hermes-agent-hetzner-instalacion-segura',
  'pi-orquestacion-subagentes',
  'arquitecturas-plataformas-iot',
  'rabbitmq-celery-procesos-pesados',
  'infraestructura-distribuida-latencia',
]
const read = (path: string) => readFileSync(join(dist, path), 'utf8')
const escapeHtmlText = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
const publicHtmlPaths = [
  'index.html',
  'roadmap/index.html',
  'career-sprint-daily/index.html',
  'proyectos/ainkii/index.html',
  'blog/index.html',
  ...blogPosts.map(post => `blog/${post.id}/index.html`),
  ...dailyProgressEntries.map(entry => `career-sprint-daily/${entry.activityDate}/index.html`),
  '404.html',
] as const
const publicNavigation = publicHtmlPaths.map(path => read(path)).join('\n')
const textOutputExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt', '.xml'])
const publicTextFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name)
  if (entry.isDirectory()) return path === join(dist, 'admin') ? [] : publicTextFiles(path)
  return textOutputExtensions.has(extname(entry.name)) ? [path] : []
})
const readPublicTextOutput = () => publicTextFiles(dist).map(path => readFileSync(path, 'utf8')).join('\n')
const privacyTerms = [
  'Oliana',
  'Híbrido',
  'Director de R+D',
  '3 distribuidores',
  '20–25 servicios',
  'Android embebido',
  '4 desarrolladores externos',
  'India',
  'Grafana',
  'Prometheus',
  'detección de anomalías',
  'Contenido de usuarios',
  'Casi 4 años',
  'Tàrrega',
  'Hetzner',
  'Telegram',
  '24/7',
  'Codex',
  'GPT',
  '~/.pi',
  'openai-codex',
  'deep-workflow',
  'deep-workflow-observability',
  'downloads/pi',
  'Hermes',
  ...retiredBlogIds,
]
const unauthorizedRoadmapTerms = ['SAA-C03', 'AIP-C01', 'AWS Skill Builder', 'microcredencial', '150 USD', '300 USD']

describe('static output', () => {
  it.each([...publicHtmlPaths, 'robots.txt', 'sitemap.xml', 'og-card.svg'])(
    'emits %s',
    path => expect(statSync(join(dist, path)).size).toBeGreaterThan(50),
  )

  it('exposes the public profile while hiding temporary Home sections', () => {
    const landing = read('index.html')
    expect(landing).toContain('<title>Marc Teixidó — Ingeniero de software y responsable de proyectos IT</title>')
    expect(landing).toContain('name="description" content="Portfolio de Marc Teixidó: desarrollo de software, coordinación de proyectos IT, datos, infraestructura y automatización."')
    expect(landing).toContain('property="og:image:alt" content="Marc Teixidó — Ingeniero de software y responsable de proyectos IT"')

    expect(landing).toContain('Marc Teixidó')
    expect(landing).toContain('Balaguer, Lleida')
    expect(landing).toContain('Software y producto digital')
    expect(landing).toContain('Ingeniero de software y responsable de proyectos IT')
    expect(landing).toContain('Construyo y coordino productos digitales, desde el backend y la infraestructura hasta los datos y la automatización.')
    expect(landing).toContain('Conocer mi trayectoria')
    expect(landing).not.toContain('Explorar Ainkii')
    for (const fact of professionalProfile.facts) {
      expect(landing).toContain(fact.label)
      expect(landing).toContain(fact.value)
      expect(landing).toContain(fact.context)
    }
    for (const entry of professionalProfile.experience) {
      expect(landing).toContain(escapeHtmlText(entry.company))
      expect(landing).toContain(entry.role)
      expect(landing).toContain(entry.summary)
    }
    expect(landing).toContain('Sobre mí')
    expect(landing).toContain('Software, producto y coordinación técnica')
    expect(landing).toContain('Taurus Research &amp; Development')
    expect(landing).toContain('"homeLocation":{"@type":"Place","name":"Balaguer, Lleida"}')
    expect(landing).toMatch(/<nav[\s\S]*?href="#about"[\s\S]*?Perfil[\s\S]*?href="#career-sprint"[\s\S]*?Career Sprint[\s\S]*?href="#contact"[\s\S]*?Contacto[\s\S]*?<\/nav>/)
    expect(landing).not.toContain('Career Sprint ↘')
    expect(landing).not.toContain('href="#projects"')
    expect(landing).not.toContain('href="#blog"')
    expect(landing).toContain('href="/proyectos/ainkii/"')
    expect(landing).toContain('id="career-sprint"')
    expect(landing).toContain('id="contact"')
    expect(landing).toMatch(/<section[^>]*id="projects"[^>]*hidden/)
    expect(landing).toMatch(/<div[^>]*hidden[^>]*>[\s\S]*id="blog"/)
    expect(landing).not.toContain('id="root"')
  })

  it('keeps local identity assets and only local public media', () => {
    const html = read('index.html')
    const ogCard = read('og-card.svg')
    expect(statSync(join(dist, 'favicon.svg')).size).toBeGreaterThan(100)
    expect(statSync(join(dist, 'og-card.svg')).size).toBeGreaterThan(500)
    expect(statSync(join(dist, 'og-card.png')).size).toBeGreaterThan(10_000)
    expect(html).toContain(professionalProfile.identity.headline)
    expect(html).toContain(professionalProfile.identity.seo.description)
    expect(html).toContain(professionalProfile.identity.seo.imageAlt)
    expect(ogCard).toContain('PORTFOLIO · BALAGUER, LLEIDA')
    expect(ogCard).toContain('INGENIERO DE SOFTWARE Y RESPONSABLE DE PROYECTOS IT')
    expect(ogCard).toContain('CONSTRUYO Y COORDINO PRODUCTOS DIGITALES')
    expect(ogCard).not.toContain('CATALUÑA')
    expect(ogCard).not.toContain('INGENIERO DE SOFTWARE · PROYECTOS IT')
    expect(html).toContain(`mailto:${professionalProfile.contacts.email}`)
    expect(html).not.toMatch(/<(?:audio|img|source|video)\b[^>]+(?:src|srcset)=["']https?:\/\//i)
    expect(html).not.toContain('fonts.googleapis.com')
  })

  it('does not publish private terms in textual public output', () => {
    const output = readPublicTextOutput().toLocaleLowerCase('es')
    for (const term of privacyTerms) expect(output).not.toContain(term.toLocaleLowerCase('es'))
  })

  it('does not publish the replaced certification roadmap', () => {
    const output = readPublicTextOutput()
    for (const term of unauthorizedRoadmapTerms) expect(output).not.toContain(term)
  })

  it('keeps Ainkii as a separate project in development', () => {
    const html = read('proyectos/ainkii/index.html')
    for (const expected of ['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje', 'En desarrollo']) {
      expect(html).toContain(expected)
    }
    expect(html).toContain('<title>Ainkii — Producto educativo en desarrollo | Marc Teixidó</title>')
    expect(html).toContain('Proyecto educativo en desarrollo para ayudar a docentes a revisar temarios, detectar huecos y convertir contenidos en materiales de estudio.')
    expect(html).toContain('"@type":"CreativeWork"')
    expect(html).not.toContain('próximamente')
  })

  it('keeps the current Blog index metadata', () => {
    const html = read('blog/index.html')
    expect(html).toContain('<title>Blog de Marc Teixidó — Software, automatización y proyectos</title>')
    expect(html).toContain('name="description" content="Notas de Marc Teixidó sobre desarrollo de software, herramientas, automatización y decisiones técnicas."')
  })

  it.each(blogPosts)('emits $id with canonical article metadata', post => {
    const html = read(`blog/${post.id}/index.html`)
    const canonical = `https://portfolio.mybrawl.io/blog/${post.id}/`
    expect(html).toContain(post.title)
    expect(html).toContain(post.excerpt)
    expect(html).toContain(`rel="canonical" href="${canonical}"`)
    expect(html).toContain(`property="og:url" content="${canonical}"`)
    expect(html).toContain(`"mainEntityOfPage":"${canonical}"`)
    expect(html).toContain('"@type":"BlogPosting"')
  })

  it('emits the roadmap, published daily chronology, and only published routes', () => {
    const roadmap = read('roadmap/index.html')
    const progress = read('career-sprint-daily/index.html')
    const sitemap = read('sitemap.xml')
    const emittedDailyIds = readdirSync(join(dist, 'career-sprint-daily'), { withFileTypes: true })
      .filter(entry => entry.isDirectory() && existsSync(join(dist, 'career-sprint-daily', entry.name, 'index.html')))
      .map(entry => entry.name)
      .sort()

    expect(challengeWeeks).toHaveLength(8)
    expect(challengeWeeks.map(week => week.id)).toEqual(['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'])
    expect(challengeWeeks.map(week => week.progressState)).toEqual(Array(8).fill('planned'))
    expect(roadmap).toContain('Career Sprint — AI Engineering &amp; Cloud Architecture')
    expect(roadmap).toContain('Semanas 1–2')
    expect((roadmap.match(/<li id="w\d+"/g) ?? [])).toHaveLength(7)
    expect((roadmap.match(/<details\b/g) ?? [])).toHaveLength(7)
    expect(roadmap).toMatch(/<li id="w1"[\s\S]*?<article id="w2"[\s\S]*?<details\b/)
    expect(roadmap).toContain('Agenda')
    expect(roadmap).toContain('Temas')
    const ibmCourses = [
      'Generative AI and LLMs: Architecture and Data Preparation',
      'Gen AI Foundational Models for NLP & Language Understanding',
      'Generative AI Language Modeling with Transformers',
      'Generative AI Engineering and Fine-Tuning Transformers',
      'Generative AI Advanced Fine-Tuning for LLMs',
      'Fundamentals of AI Agents Using RAG and LangChain',
      'Project: Generative AI Applications with RAG and LangChain',
    ]
    for (const course of ibmCourses) expect(roadmap).toContain(course.replaceAll('&', '&amp;'))
    expect(roadmap).not.toContain('Hitos')
    expect(roadmap).not.toContain('Reservas')
    for (const week of challengeWeeks.slice(2)) {
      expect(roadmap).toContain(week.focus)
      expect(roadmap).toContain(week.objective)
    }
    expect(dailyProgressEntries.map(entry => entry.activityDate)).toEqual(['2026-08-24', '2026-08-25', '2026-08-29'])
    expect(progress).toContain('Lo que aprendí hoy sobre tokenización y carga de datos')
    expect(progress).toContain('De los índices a la predicción: embeddings, clasificación y modelos n-grama')
    expect(emittedDailyIds).toEqual(dailyProgressEntries.map(entry => entry.activityDate).sort())
    expect(existsSync(join(dist, 'progreso'))).toBe(false)
    expect(sitemap).toContain('<loc>https://portfolio.mybrawl.io/roadmap/</loc>')
    expect(sitemap).toContain('<loc>https://portfolio.mybrawl.io/career-sprint-daily/</loc>')
    expect(sitemap).not.toContain('<loc>https://portfolio.mybrawl.io/progreso/')
    for (const post of blogPosts) expect(sitemap).toContain(`<loc>https://portfolio.mybrawl.io/blog/${post.id}/</loc>`)
    for (const entry of dailyProgressEntries) expect(sitemap).toContain(`<loc>https://portfolio.mybrawl.io/career-sprint-daily/${entry.activityDate}/</loc>`)
    for (const id of retiredBlogIds) expect(existsSync(join(dist, 'blog', id, 'index.html'))).toBe(false)
  })

  it('keeps the CMS private, self-hosted, and configured for challenge collections', () => {
    const admin = read('admin/index.html')
    const config = read('admin/config.yml')
    const dailyCmsConfig = config.slice(config.indexOf('  - name: daily'))

    expect(statSync(join(dist, 'admin', 'sveltia-cms.js')).size).toBeGreaterThan(1_000_000)
    expect(statSync(join(dist, 'admin', 'locales', 'es-CO.json')).size).toBeGreaterThan(10_000)
    expect(admin).toContain('content="noindex,nofollow"')
    expect(admin).toContain('src="./bootstrap.js"')
    expect(config).toContain('label: Conocimiento')
    expect(config).toContain('- name: weeks')
    expect(config).toContain('- name: daily')
    expect(config).toContain('delete: false')
    expect(config).toContain('publish: false')
    expect(config).toMatch(/name: weeks[\s\S]*?create: false[\s\S]*?readonly: true/)
    expect(config).not.toMatch(/name: weeks[\s\S]*?reorder:/)
    expect(config).toMatch(/name: daily[\s\S]*?create: true/)
    expect(dailyCmsConfig).toContain('name: blocks')
    expect(dailyCmsConfig).toContain('types:')
    expect(dailyCmsConfig).not.toMatch(/name: (paragraphs|points|codeBlocks)/)
    expect(dailyCmsConfig).not.toMatch(/name: daily[\s\S]*?reorder:/)
    expect(publicNavigation).not.toContain('href="/admin/')
  })

  it('keeps the fallback page out of the canonical index', () => {
    const html = read('404.html')
    expect(html).toContain('<title>Página no encontrada — Marc Teixidó</title>')
    expect(html).toContain('content="noindex,follow"')
    expect(html).toContain('Página no disponible')
    expect(html).toContain('Parece que esta página no existe o ha cambiado de dirección. Puedes volver al portfolio o continuar por el Career Sprint.')
    expect(html).toContain('Ver el Career Sprint')
    expect(html).toContain('href="/roadmap/"')
    expect(html).not.toContain('rel="canonical"')
  })
})
