import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { extname, join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { challengeWeeks, dailyProgressEntries } from '../src/data/challenge'
import { professionalProfile } from '../src/data/portfolio'
import { learningConcepts, conceptHref } from '../src/data/learning'
import { learningCourses } from '../src/data/learningCourses'

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
  ...learningConcepts.map(concept => `aprendizaje/${concept.id}/index.html`),
  'roadmap/index.html',
  'career-sprint-daily/index.html',
  'proyectos/ainkii/index.html',
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
  '~/.pi',
  'openai-codex',
  'deep-workflow',
  'deep-workflow-observability',
  'downloads/pi',
  'Hermes',
  ...retiredBlogIds,
]
const approvedGptRoute = 'career-sprint-daily/2026-08-31/index.html'
const approvedGptSentence = 'Un GPT decoder-only normal no necesita esta ruta: prompt y respuesta forman una sola secuencia y se relacionan mediante causal self-attention.'
const gptOccurrences = (value: string) => value.match(/\bGPT\b/gi) ?? []
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
        expect(index).toContain(`${escapeHtmlText(course.title)}<small>Pendiente</small>`)
      }
    }
    for (const concept of learningConcepts) {
      expect(index).toContain(concept.title)
      const html = read(`aprendizaje/${concept.id}/index.html`)
      expect(html).toContain(conceptHref(concept.id))
      expect(html).toContain('http-equiv="refresh"')
      expect(sitemap).not.toContain(`/aprendizaje/${concept.id}/`)
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
    expect(html).toContain(`${currentEmployment.role} en ${escapeHtmlText(currentEmployment.company)}`)
    expect(html).toContain(professionalProfile.identity.seo.description)
    expect(html).toContain(professionalProfile.identity.seo.imageAlt)
    expect(ogCard).toContain('PORTFOLIO · BALAGUER, LLEIDA')
    expect(ogCard).toContain('Product Engineering e IA aplicada')
    expect(ogCard).toContain('PRODUCT ENGINEERING · IA APLICADA')
    expect(ogCard).toContain('≈ 3 AÑOS FULL-STACK · ≈ 1 AÑO COORDINANDO PROYECTOS IT')
    expect(ogCard).toContain('EVIDENCIA PUBLICADA')
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

  it('allows GPT only in the approved daily sentence', () => {
    const approvedOutput = read(approvedGptRoute)
    expect(approvedOutput).toContain(approvedGptSentence)
    expect(gptOccurrences(approvedOutput)).toHaveLength(1)
    const approvedPath = join(dist, approvedGptRoute)
    for (const path of publicTextFiles(dist)) {
      if (path === approvedPath) continue
      expect(gptOccurrences(readFileSync(path, 'utf8')), path).toHaveLength(0)
    }
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
    expect(html).toContain('Proyecto educativo en desarrollo que explora cómo ayudar a docentes a revisar temarios y organizar materiales de estudio con apoyo de IA.')
    expect(html).toContain(professionalProfile.projects[0].description)
    expect(html).toContain('"@type":"CreativeWork"')
    expect(html).toContain('Qué quiero resolver')
    expect(html).not.toContain('Proyecto insignia')
    expect(html).not.toContain('próximamente')
  })

  it('removes blog pages, navigation, sitemap entries and CMS collection', () => {
    expect(existsSync(join(dist, 'blog'))).toBe(false)
    expect(publicNavigation).not.toMatch(/href="(?:[^"#]*\/blog\/|#blog)/)
    expect(read('index.html')).not.toContain('id="blog"')
    expect(read('sitemap.xml')).not.toContain('/blog/')
    const config = read('admin/config.yml')
    expect(config).not.toContain('- name: posts')
    expect(config).not.toContain('folder: content/posts')
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
    expect(roadmap).toContain('Plan de formación de 2026')
    expect(roadmap).toContain('El itinerario original recoge los objetivos de ocho semanas.')
    expect(roadmap).toContain('Explorar conceptos')
    expect(progress).toContain('Notas originales')
    expect(progress).toContain('Explorar por conceptos')
    expect(progress).not.toContain('Lo Hoy')
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
    expect(dailyProgressEntries.map(entry => entry.activityDate)).toEqual(['2026-08-24', '2026-08-25', '2026-08-29', '2026-08-31'])
    expect(progress).toContain('Lo que aprendí hoy sobre tokenización y carga de datos')
    expect(progress).toContain('De los índices a la predicción: embeddings, clasificación y modelos n-grama')
    expect(progress).toContain('De situar cada token a clasificar documentos con contexto')
    expect(emittedDailyIds).toEqual(dailyProgressEntries.map(entry => entry.activityDate).sort())
    expect(existsSync(join(dist, 'progreso'))).toBe(false)
    expect(sitemap).toContain('<loc>https://portfolio.mybrawl.io/roadmap/</loc>')
    expect(sitemap).toContain('<loc>https://portfolio.mybrawl.io/career-sprint-daily/</loc>')
    expect(sitemap).not.toContain('<loc>https://portfolio.mybrawl.io/progreso/')
    for (const entry of dailyProgressEntries) expect(sitemap).toContain(`<loc>https://portfolio.mybrawl.io/career-sprint-daily/${entry.activityDate}/</loc>`)
    for (const id of retiredBlogIds) expect(existsSync(join(dist, 'blog', id, 'index.html'))).toBe(false)
  })

  it('preserves daily Python and inline formula rendering contracts', () => {
    const html = read(approvedGptRoute)
    const config = read('admin/config.yml')
    const dailyCmsConfig = config.slice(config.indexOf('  - name: daily'))
    const knowledgeCmsConfig = config.slice(0, config.indexOf('  - name: tags'))
    const dailyLanguageOptions = dailyCmsConfig.match(/options: \[bash, json, markdown, typescript, text, python\]/g) ?? []

    expect(dailyLanguageOptions).toHaveLength(3)
    expect(knowledgeCmsConfig).toContain('options: [bash, json, markdown, typescript, text]')
    expect(knowledgeCmsConfig).not.toContain('options: [bash, json, markdown, typescript, text, python]')
    expect(html).toContain('<code class="language-python">weights = torch.softmax(scores, dim=-1)</code>')
    expect(html).toContain('<code class="article-inline-code">Attention(Q, K, V) = softmax(QKᵀ / sqrt(d_k)) V</code>')
    expect(html).not.toContain('$$')
  })
  it('keeps the CMS private, self-hosted, and configured for challenge collections', () => {
    const admin = read('admin/index.html')
    const config = read('admin/config.yml')
    const dailyCmsConfig = config.slice(config.indexOf('  - name: daily'))

    expect(statSync(join(dist, 'admin', 'sveltia-cms.js')).size).toBeGreaterThan(1_000_000)
    expect(statSync(join(dist, 'admin', 'locales', 'es-CO.json')).size).toBeGreaterThan(10_000)
    expect(admin).toContain('content="noindex,nofollow"')
    expect(admin).toContain('src="./bootstrap.js"')
    expect(config).toContain('- name: weeks')
    expect(config).toContain('- name: daily')
    expect(config).toContain('- name: concepts')
    expect(config).toContain('folder: content/concepts')
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
    expect(html).toContain('Esta página no existe o ha cambiado de dirección. Puedes volver al portfolio o explorar el cuaderno de IA.')
    expect(html).toContain('Explorar conceptos')
    expect(html).toContain('href="/aprendizaje/"')
    expect(html).not.toContain('rel="canonical"')
  })
})
