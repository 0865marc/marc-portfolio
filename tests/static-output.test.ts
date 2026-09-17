import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { professionalProfile } from '../src/data/portfolio'
import { learningCourses, conceptCourseHref } from '../src/data/learningCourses'

const conceptIds = learningCourses.filter(course => course.available).flatMap(course => [...course.concepts])
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
  'aprendizaje/index.html',
  ...conceptIds.map(id => `aprendizaje/${id}/index.html`),
  'proyectos/ainkii/index.html',
  'proyectos/butipunt/index.html',
  '404.html',
] as const
const publicNavigation = publicHtmlPaths.map(path => read(path)).join('\n')
const textOutputExtensions = new Set(['.css', '.html', '.js', '.json', '.map', '.svg', '.txt', '.xml'])
const publicTextFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true }).flatMap(entry => {
  const path = join(directory, entry.name)
  if (entry.isDirectory()) return publicTextFiles(path)
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

  it('exposes projects and separates formation from the thematic learning space', () => {
    const landing = read('index.html')
    const { identity } = professionalProfile
    expect(landing).toContain(`<title>${identity.seo.title}</title>`)
    for (const attribute of ['name="description"', 'property="og:description"', 'name="twitter:description"']) {
      expect(landing).toContain(`${attribute} content="${identity.seo.description}"`)
    }
    expect(landing).toContain(identity.headline)
    expect(landing).toContain(identity.summary)
    expect(landing).toContain(identity.aboutIntro)
    expect(landing).toContain('Balaguer, Lleida')
    expect(landing).toContain('"jobTitle":"Responsable de proyectos IT"')
    expect(landing).toContain('"worksFor":{"@type":"Organization","name":"Taurus Research & Development"}')
    for (const id of ['about', 'projects', 'formacion', 'contact']) {
      expect(landing).toContain(`href="#${id}"`)
      expect(landing).not.toMatch(new RegExp(`<section[^>]*id="${id}"[^>]*hidden`))
    }
    expect(landing).toContain('href="/proyectos/ainkii/"')
    expect(landing).toContain('href="/aprendizaje/"')
    expect(landing).toContain('En curso · IBM / Coursera')
    expect(landing).not.toContain('Formación prevista')
    expect(landing).not.toContain('IA y arquitectura cloud')
    expect(landing).not.toContain('href="/career-sprint-daily/"')
    expect(landing).not.toContain('href="/roadmap/"')
    expect(landing).not.toContain('Evidencia publicada')
    expect(landing).toContain('id="career-sprint"')
    expect(landing).toContain('id="progress"')
    expect(landing.match(/class="profile-fact-value"/g) ?? []).toHaveLength(2)
    for (const fact of professionalProfile.facts) {
      expect(landing).toContain(fact.label)
      expect(landing).toContain(fact.value)
      expect(landing).toContain(escapeHtmlText(fact.context))
    }
    for (const entry of professionalProfile.experience) {
      expect(landing).toContain(escapeHtmlText(entry.company))
      expect(landing).toContain(entry.role)
      for (const sentence of entry.summary.split(/(?<=\.)\s+(?=[A-ZÁÉÍÓÚ])/)) expect(landing).toContain(escapeHtmlText(sentence))
    }
    expect(landing).toContain(professionalProfile.education.qualification)
    expect(landing).toContain('Escríbeme por correo')
  })

  it('organizes inline explanations by course and redirects earlier concept URLs', () => {
    const index = read('aprendizaje/index.html')
    const sitemap = read('sitemap.xml')
    expect(index).not.toMatch(/<article[^>]*data-reading-root/)
    expect(index).not.toContain('min de lectura')
    expect(index).not.toContain('type="Article"')
    expect(sitemap).toContain('<loc>https://portfolio.mybrawl.io/aprendizaje/</loc>')
    expect(learningCourses).toHaveLength(7)
    for (const course of learningCourses) {
      expect(index).toContain(escapeHtmlText(course.title))
      if (course.available) {
        expect(index).toContain(`id="${course.id}"`)
        expect(index).toContain(`href="#${course.id}"`)
        expect(index).toContain(escapeHtmlText(course.officialTitle))
        expect(index).toContain(`href="${course.url}"`)
      } else {
        expect(index).not.toContain(`id="${course.id}"`)
        expect(index).not.toContain(`href="#${course.id}"`)
        expect(index).not.toContain(escapeHtmlText(course.description))
        expect(index).toContain(`${escapeHtmlText(course.title)}<small>Contenido no publicado</small>`)
      }
    }
    for (const id of conceptIds) {
      expect(index).toContain(`data-concept="${id}"`)
      const html = read(`aprendizaje/${id}/index.html`)
      expect(html).toContain(conceptCourseHref(id))
      expect(html).toContain('http-equiv="refresh"')
      expect(sitemap).not.toContain(`/aprendizaje/${id}/`)
    }
    for (const lab of ['token', 'bag', 'attention']) expect(index).toContain(`data-${lab}-lab`)
  })

  it('keeps local identity assets and only local public media', () => {
    const html = read('index.html')
    const ogCard = read('og-card.svg')
    expect(statSync(join(dist, 'favicon.svg')).size).toBeGreaterThan(100)
    expect(statSync(join(dist, 'og-card.svg')).size).toBeGreaterThan(500)
    expect(statSync(join(dist, 'og-card.png')).size).toBeGreaterThan(10_000)
    const currentEmployment = professionalProfile.experience.find(entry => entry.endDate === null)!
    expect(html).toContain(escapeHtmlText(currentEmployment.company))
    expect(html).not.toContain(`${currentEmployment.role} en ${escapeHtmlText(currentEmployment.company)}`)
    expect(html).toContain(professionalProfile.identity.seo.description)
    expect(html).toContain(professionalProfile.identity.seo.imageAlt)
    expect(ogCard).toContain('PORTFOLIO · BALAGUER, LLEIDA')
    expect(ogCard).toContain('Ingeniería de software y proyectos IT')
    expect(ogCard).toContain('SOFTWARE · PRODUCTO · PROYECTOS IT')
    expect(ogCard).toContain('FULL-STACK · PRODUCTO · ROADMAP Y ENTREGAS')
    expect(ogCard).toContain('PERFIL PROFESIONAL')
    expect(ogCard.toUpperCase()).not.toContain('AINKII')
    expect(ogCard).not.toContain('id="panel"')
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

  it('does not retain GPT references from the retired daily article', () => {
    expect(readPublicTextOutput()).not.toMatch(/\bGPT\b/i)
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
    expect(html).toContain('Proyecto en desarrollo con landing pública; aplicación interna aún no abierta al público.')
    expect(html).toContain(professionalProfile.projects[0].description)
    expect(html).toContain('"@type":"CreativeWork"')
    expect(html).toContain('De entender a practicar')
    expect(html).not.toContain('Proyecto insignia')
    expect(html).not.toContain('próximamente')
  })

  it('publishes both project pages, local logos and links to the public sites', () => {
    const landing = read('index.html')
    const sitemap = read('sitemap.xml')
    for (const project of professionalProfile.projects) {
      const html = read(`proyectos/${project.id}/index.html`)
      expect(landing).toContain(`href="${project.href}"`)
      expect(sitemap).toContain(`${project.href}</loc>`)
      for (const page of [landing, html]) {
        expect(page).toContain(`href="${project.website}"`)
        expect(page).toContain(`src="${project.logo.src}"`)
        expect(page).toContain(project.availability)
      }
      expect(statSync(join(dist, project.logo.src)).size).toBeGreaterThan(100)
    }
    expect(read('proyectos/butipunt/index.html')).toContain('No se sincroniza entre dispositivos')
    expect(read('proyectos/ainkii/index.html')).not.toMatch(/href="https:\/\/ainkii\.mteixido\.dev\/login/)
  })

  it('removes blog pages, navigation and sitemap entries', () => {
    expect(existsSync(join(dist, 'blog'))).toBe(false)
    expect(publicNavigation).not.toMatch(/href="(?:[^"#]*\/blog\/|#blog)/)
    expect(read('index.html')).not.toContain('id="blog"')
    expect(read('sitemap.xml')).not.toContain('/blog/')

  })

  it('does not publish a CMS or its assets and authentication references', () => {
    expect(existsSync(join(dist, 'admin'))).toBe(false)
    expect(publicNavigation).not.toContain('href="/admin/')
    expect(readPublicTextOutput()).not.toMatch(/sveltia|cms-auth\.portfolio|api\.github\.com/i)
  })

  it('does not emit or link to the retired daily archive and calendar', () => {
    for (const route of ['roadmap', 'career-sprint-daily', 'progreso']) {
      expect(existsSync(join(dist, route))).toBe(false)
      expect(read('sitemap.xml')).not.toContain(`/${route}/`)
      expect(publicNavigation).not.toContain(`href="/${route}/`)
    }
  })

  it('keeps the fallback page out of the canonical index', () => {
    const html = read('404.html')
    expect(html).toContain('<title>Página no encontrada — Marc Teixidó</title>')
    expect(html).toContain('content="noindex,follow"')
    expect(html).toContain('Página no disponible')
    expect(html).toContain('Esta página no existe o ha cambiado de dirección. Puedes volver al portfolio.')
    expect(html).toContain('Volver al portfolio')
    expect(html).toContain('href="/"')
    expect(html).not.toContain('Explorar conceptos')
    expect(html).not.toContain('href="/aprendizaje/"')
    expect(html).not.toContain('rel="canonical"')
  })
})
