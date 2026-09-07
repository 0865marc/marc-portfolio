import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { blogPosts } from '../../src/data/blog'
import { challengeWeeks, dailyProgressEntries } from '../../src/data/challenge'
const firstPublishedPost = blogPosts[0]

const retiredBlogIds = [
  'entorno-reproducible-con-agentes',
  'setup-pi-orquestacion-subagentes',
  'hermes-agent-hetzner-instalacion-segura',
  'pi-orquestacion-subagentes',
  'arquitecturas-plataformas-iot',
  'rabbitmq-celery-procesos-pesados',
  'infraestructura-distribuida-latencia',
]

const collectUnexpectedRemote = async (page: Page) => {
  const requests: string[] = []
  await page.route(/^https?:\/\//, route => {
    const url = new URL(route.request().url())
    if (url.hostname === '127.0.0.1') return route.continue()
    requests.push(url.href)
    return route.abort()
  })
  return requests
}

const materialAxeViolations = async (page: Page) => (await new AxeBuilder({ page }).analyze()).violations
  .filter(value => ['moderate', 'serious', 'critical'].includes(value.impact ?? ''))

const dailyBlockText = (blocks: typeof dailyProgressEntries[number]['introduction']) => blocks.flatMap(block => {
  if (block.type === 'paragraph') return block.text
  if (block.type === 'code') {
    const title = block.title
    return title?.trim() ? [title, block.code] : [block.code]
  }
  return block.items
})
const readingMinutes = (text: string[]) => Math.max(1, Math.ceil(text.join(' ').trim().split(/\s+/).length / 210))

test.beforeEach(async ({ page }, info) => {
  if (info.project.name === 'chromium-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('landing exposes the personal profile and current Home visibility', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320', 'chromium-1440'].includes(info.project.name))
  const remoteRequests = await collectUnexpectedRemote(page)
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' })

  await expect(page).toHaveTitle('Marc Teixidó — Product Engineering e IA aplicada')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Perfil orientado a Product Engineering con foco en IA aplicada y evidencia publicada: cerca de 3 años full-stack y alrededor de 1 año coordinando proyectos IT.')
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Marc Teixidó — Product Engineering e IA aplicada')
  await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', 'Perfil orientado a Product Engineering con foco en IA aplicada y evidencia publicada: cerca de 3 años full-stack y alrededor de 1 año coordinando proyectos IT.')
  await expect(page.locator('meta[property="og:image:alt"]')).toHaveAttribute('content', 'Marc Teixidó — Product Engineering, cerca de 3 años full-stack, alrededor de 1 año coordinando proyectos IT e IA aplicada')
  await expect(page.locator('meta[name="twitter:title"]')).toHaveAttribute('content', 'Marc Teixidó — Product Engineering e IA aplicada')
  await expect(page.locator('meta[name="twitter:description"]')).toHaveAttribute('content', 'Perfil orientado a Product Engineering con foco en IA aplicada y evidencia publicada: cerca de 3 años full-stack y alrededor de 1 año coordinando proyectos IT.')
  await expect(page.locator('meta[name="twitter:image:alt"]')).toHaveAttribute('content', 'Marc Teixidó — Product Engineering, cerca de 3 años full-stack, alrededor de 1 año coordinando proyectos IT e IA aplicada')
  await expect(page.getByRole('heading', { level: 1, name: 'Marc Teixidó', exact: true })).toBeVisible()
  await expect(page.getByText('Balaguer, Lleida', { exact: true })).toBeVisible()
  await expect(page.getByText('Perfil orientado a Product Engineering con foco en IA aplicada', { exact: true })).toBeVisible()
  await expect(page.getByText('Responsable de proyectos IT en Taurus Research & Development', { exact: true })).toBeVisible()
  await expect(page.getByText('Conecto visión de producto y ejecución técnica para convertir necesidades en software, coordinar su entrega y aplicar automatización e IA cuando aportan valor.', { exact: true })).toBeVisible()
  const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
  expect(jsonLd.join('')).toContain('"jobTitle":"Responsable de proyectos IT"')
  expect(jsonLd.join('')).toContain('"homeLocation":{"@type":"Place","name":"Balaguer, Lleida"}')
  expect(jsonLd.join('')).toContain('"worksFor":{"@type":"Organization","name":"Taurus Research & Development"}')
  await expect(navigation.locator('a')).toHaveText(['01 Perfil', '02 Career Sprint', '03 Contacto'])
  await expect(navigation.getByRole('link', { name: 'Perfil', exact: true })).toHaveAttribute('href', '#about')
  await expect(navigation.getByRole('link', { name: 'Career Sprint', exact: true })).toHaveAttribute('href', '#career-sprint')
  await expect(navigation.getByRole('link', { name: 'Contacto', exact: true })).toHaveAttribute('href', '#contact')
  await expect(navigation.getByRole('link', { name: 'Proyecto', exact: true })).toHaveCount(0)
  await expect(navigation.getByRole('link', { name: 'Blog', exact: true })).toHaveCount(0)
  await expect(page.locator('a[href="#projects"], a[href="#blog"]')).toHaveCount(0)
  await expect(page.getByRole('link', { name: 'Ver plan de 8 semanas', exact: true })).toHaveAttribute('href', '/roadmap/')
  await expect(page.getByRole('link', { name: 'Ver evidencia publicada', exact: true })).toHaveAttribute('href', '/career-sprint-daily/')
  await expect(page.getByRole('link', { name: 'Contactar', exact: true })).toHaveAttribute('href', '#contact')
  await expect(page.getByRole('link', { name: 'Ver experiencia', exact: true })).toHaveAttribute('href', '#about')
  await expect(page.getByRole('link', { name: 'Explorar Ainkii', exact: true })).toHaveCount(0)
  await expect(page.getByRole('heading', { level: 2, name: 'Software, producto y coordinación técnica', exact: true })).toBeVisible()
  const profileFactCards = page.locator('#about .profile-facts > div')
  await expect(page.getByRole('link', { name: 'Career Sprint', exact: true })).toHaveCount(1)
  await expect(page.getByText('Sobre mí', { exact: true })).toBeVisible()
  await expect(page.locator('#about').getByText('Mi experiencia combina desarrollo full-stack y coordinación de proyectos IT. Trabajo entre las necesidades de producto, las decisiones técnicas y la entrega, manteniendo una visión de principio a fin.', { exact: true })).toBeVisible()
  await expect(page.locator('#about').getByText('Taurus Research & Development', { exact: true })).toBeVisible()
  await expect(profileFactCards).toHaveCount(2)
  await expect(profileFactCards.locator('dt')).toHaveText(['Desarrollo full-stack', 'Liderazgo de proyectos IT'])
  await expect(profileFactCards.locator('.profile-fact-value')).toHaveText(['≈ 3 años', '≈ 1 año'])
  await expect(profileFactCards.getByText(/^(IA aplicada|Evidencia publicada)$/)).toHaveCount(0)
  await expect(page.getByText('Coordino el roadmap y el desarrollo de un ecosistema internacional de servicios web, móviles y cloud para un producto de cocina conectado. Trabajo con dirección, distribuidores y desarrolladores externos, traduciendo necesidades de producto en especificaciones, prioridades y entregas. También introduzco automatizaciones con IA en procesos de documentación, contenido y monitorización.', { exact: true })).toBeVisible()
  await expect(page.getByText('Fui responsable de migrar la plataforma interna de la empresa a una arquitectura más moderna y escalable. Desarrollé funcionalidades de CRM y ERP, procesos asíncronos con Celery y RabbitMQ, dashboards y modelos predictivos sobre datos de sensores. También gestioné despliegues, migraciones y entornos de test y producción.', { exact: true })).toBeVisible()
  await expect(page.locator('#about').getByText('Inglés · Uso profesional', { exact: true })).toBeVisible()
  await expect(page.locator('#career-sprint')).toBeVisible()
  await expect(page.locator('footer#contact')).toBeVisible()
  await expect(page.locator('section#projects[hidden]')).toHaveCount(1)
  await expect(page.locator('section#projects[hidden]')).toBeHidden()
  await expect(page.locator('div[hidden] > section#blog')).toHaveCount(1)
  await expect(page.locator('div[hidden] > section#blog')).toBeHidden()
  expect(remoteRequests).toEqual([])
})

test('profile facts use the available mobile width and a centered desktop cap', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium')
  const profileFacts = page.locator('#about .profile-facts')
  const measureProfileFacts = () => profileFacts.evaluate(element => {
    const container = element.parentElement
    const [firstCard, secondCard] = Array.from(element.children)
    if (!container || element.children.length !== 2 || !(firstCard instanceof HTMLElement) || !(secondCard instanceof HTMLElement)) {
      throw new Error('Expected profile facts to have a container and two HTML cards')
    }
    const blockRect = element.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()
    const columns = getComputedStyle(element).gridTemplateColumns
      .trim()
      .split(/\s+/)
      .map(column => Number.parseFloat(column))
    return {
      block: { left: blockRect.left, right: blockRect.right, width: blockRect.width },
      container: { left: containerRect.left, right: containerRect.right, width: containerRect.width },
      cards: {
        first: { top: firstCard.offsetTop, bottom: firstCard.offsetTop + firstCard.offsetHeight },
        second: { top: secondCard.offsetTop },
      },
      columns: { count: columns.length, first: columns[0] ?? 0, second: columns[1] ?? 0 },
      hasHorizontalOverflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
    }
  })

  await page.setViewportSize({ width: 390, height: 900 })
  await page.goto('/')
  const mobile = await measureProfileFacts()
  expect(Math.abs(mobile.block.width - mobile.container.width)).toBeLessThanOrEqual(1)
  expect(mobile.columns.count).toBe(1)
  expect(mobile.cards.second.top).toBeGreaterThanOrEqual(mobile.cards.first.bottom - 1)
  expect(mobile.hasHorizontalOverflow).toBe(false)

  await page.setViewportSize({ width: 1440, height: 1000 })
  const desktop = await measureProfileFacts()
  const leftGutter = desktop.block.left - desktop.container.left
  const rightGutter = desktop.container.right - desktop.block.right
  expect(desktop.block.width).toBeLessThanOrEqual(897)
  expect(Math.abs(leftGutter - rightGutter)).toBeLessThanOrEqual(1)
  expect(desktop.columns.count).toBe(2)
  expect(Math.abs(desktop.columns.first - desktop.columns.second)).toBeLessThanOrEqual(1)
  expect(Math.abs(desktop.cards.first.top - desktop.cards.second.top)).toBeLessThanOrEqual(1)
  expect(desktop.hasHorizontalOverflow).toBe(false)
})

test('roadmap renders seven visible events from the eight-week source', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320', 'chromium-1440'].includes(info.project.name))
  await page.goto('/roadmap/')

  await expect(page.getByRole('heading', { level: 1, name: 'Career Sprint — AI Engineering & Cloud Architecture', exact: true })).toBeVisible()
  await expect(page.locator('li[id^="w"]')).toHaveCount(7)
  await expect(page.locator('details')).toHaveCount(7)
  await expect(page.locator('#w1')).toHaveCount(1)
  await expect(page.locator('#w2')).toHaveCount(1)
  await expect(page.locator('#w1 #w2')).toHaveCount(1)

  const firstWeekDetails = page.locator('details').first()
  await firstWeekDetails.locator('summary').click()
  await expect(firstWeekDetails).toHaveAttribute('open', '')
  await expect(firstWeekDetails.getByRole('heading', { name: 'Agenda', exact: true })).toBeVisible()
  await expect(firstWeekDetails.getByRole('heading', { name: 'Temas', exact: true })).toBeVisible()
  await expect(firstWeekDetails.locator('ol > li')).toHaveCount(7)
  for (const course of [
    'Generative AI and LLMs: Architecture and Data Preparation',
    'Gen AI Foundational Models for NLP & Language Understanding',
    'Generative AI Language Modeling with Transformers',
    'Generative AI Engineering and Fine-Tuning Transformers',
    'Generative AI Advanced Fine-Tuning for LLMs',
    'Fundamentals of AI Agents Using RAG and LangChain',
    'Project: Generative AI Applications with RAG and LangChain',
  ]) {
    await expect(firstWeekDetails.getByText(course, { exact: true })).toBeVisible()
  }
  await expect(page.getByText('Hitos', { exact: true })).toHaveCount(0)
  await expect(page.getByText('Reservas', { exact: true })).toHaveCount(0)
  await expect(page.locator('main > div > header').getByText('Plan de 8 semanas · 24 de agosto de 2026 — 18 de octubre de 2026', { exact: true })).toBeVisible()
  await expect(page.getByText('Planificada', { exact: true })).toHaveCount(7)
  for (const week of challengeWeeks.slice(2)) {
    const weekSection = page.locator(`#${week.id}`)
    await expect(weekSection.getByText(week.focus, { exact: false })).toBeVisible()
    await expect(weekSection.getByText(week.objective, { exact: true })).toBeVisible()
  }
  expect(challengeWeeks).toHaveLength(8)
  expect(challengeWeeks.map(week => week.id)).toEqual(['w1', 'w2', 'w3', 'w4', 'w5', 'w6', 'w7', 'w8'])
  expect(challengeWeeks.map(week => week.progressState)).toEqual(Array(8).fill('planned'))
})

test('daily progress publishes both factual entries and retires the old routes', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320'].includes(info.project.name))
  await page.goto('/career-sprint-daily/')

  await expect(page.getByRole('heading', { level: 1, name: 'Evidencia publicada', exact: true })).toBeVisible()
  await expect(page.locator('ol > li')).toHaveCount(dailyProgressEntries.length)
  for (const entry of dailyProgressEntries) {
    await expect(page.getByRole('link', { name: new RegExp(entry.title) })).toHaveAttribute('href', `/career-sprint-daily/${entry.activityDate}/`)
  }

  for (const entry of dailyProgressEntries) {
    const response = await page.goto(`/career-sprint-daily/${entry.activityDate}/`)
    expect(response?.status()).toBe(200)
    await expect(page.getByRole('heading', { level: 1, name: entry.title, exact: true })).toBeVisible()
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://portfolio.mybrawl.io/career-sprint-daily/${entry.activityDate}/`)
    await expect(page.locator('[data-article-back]')).toHaveAttribute('href', '/career-sprint-daily/')
    const jsonLd = await page.locator('script[type="application/ld+json"]').allTextContents()
    expect(jsonLd.join('')).toContain(`"mainEntityOfPage":"https://portfolio.mybrawl.io/career-sprint-daily/${entry.activityDate}/"`)
  }

  for (const path of ['/progreso/', '/progreso/2026-08-24/']) {
    const response = await page.goto(path)
    expect(response?.status(), path).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: 'No encuentro esa página', exact: true })).toBeVisible()
  }
})

test('daily reading time includes introduction and takeaway blocks', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320'].includes(info.project.name))
  const entry = dailyProgressEntries.find(candidate => candidate.activityDate === '2026-08-25')
  if (!entry) throw new Error('Expected daily reading-time regression entry is missing')
  const sectionText = entry.sections.flatMap(section => [section.heading, ...dailyBlockText(section.blocks)])
  const expectedMinutes = readingMinutes([
    ...dailyBlockText(entry.introduction),
    ...sectionText,
    ...dailyBlockText(entry.takeaway),
  ])
  expect(expectedMinutes).toBeGreaterThan(readingMinutes(sectionText))
  await page.goto(`/career-sprint-daily/${entry.activityDate}/`)
  await expect(page.locator('article header').getByText(`${expectedMinutes} min de lectura`, { exact: true })).toBeVisible()
})

test('daily 2026-08-31 reading time covers all published blocks', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320'].includes(info.project.name))
  const entry = dailyProgressEntries.find(candidate => candidate.activityDate === '2026-08-31')
  if (!entry) throw new Error('Expected 2026-08-31 daily reading-time entry is missing')
  const publishedBlocks = [
    ...dailyBlockText(entry.introduction),
    ...entry.sections.flatMap(section => [section.heading, ...dailyBlockText(section.blocks)]),
    ...dailyBlockText(entry.takeaway),
  ]
  const expectedMinutes = readingMinutes(publishedBlocks)
  await page.goto(`/career-sprint-daily/${entry.activityDate}/`)
  for (const block of publishedBlocks) {
    expect(block.trim()).not.toBe('')
    await expect(page.locator('article')).toContainText(block.replaceAll('`', ''))
  }
  await expect(page.locator('article header').getByText(`${expectedMinutes} min de lectura`, { exact: true })).toBeVisible()
})

test('404 exposes current fallback metadata and Career Sprint CTA', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320'].includes(info.project.name))
  const response = await page.goto('/missing/')

  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle('Página no encontrada — Marc Teixidó')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Parece que esta página no existe o ha cambiado de dirección. Puedes volver al portfolio o continuar por el Career Sprint.')
  await expect(page.getByText('Página no disponible', { exact: true })).toBeVisible()
  await expect(page.getByText('Parece que esta página no existe o ha cambiado de dirección. Puedes volver al portfolio o continuar por el Career Sprint.', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Ver el Career Sprint', exact: true })).toHaveAttribute('href', '/roadmap/')
})

test('Blog uses current published entries and retired paths stay 404', async ({ page }, info) => {
  test.skip(!['chromium', 'firefox', 'webkit', 'chromium-js-off'].includes(info.project.name))
  await page.goto('/blog/')

  await expect(page).toHaveTitle('Blog de Marc Teixidó — Ingeniería de software e IA aplicada')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Artículos publicados sobre ingeniería de software, automatización, herramientas y aprendizaje técnico.')
  await expect(page.getByRole('heading', { level: 1, name: 'Blog', exact: true })).toBeVisible()
  await expect(page.locator('a.control').first()).toHaveAttribute('href', '/')
  await expect(page.locator('[data-blog-card]')).toHaveCount(blogPosts.length)
  await expect(page.locator('[data-blog-search]')).toHaveCount(blogPosts.length >= 4 ? 1 : 0)
  if (firstPublishedPost) {
    await page.goto(`/blog/${firstPublishedPost.id}/?from=landing`)
    await expect(page.getByRole('heading', { level: 1, name: firstPublishedPost.title, exact: true })).toBeVisible()
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', firstPublishedPost.excerpt)
    if (info.project.name === 'chromium-js-off') {
      await expect(page.locator('[data-article-back]')).toHaveAttribute('href', '/blog/')
      await expect(page.locator('[data-article-back]')).toContainText('Volver al Blog')
    } else {
      await expect(page.locator('[data-article-back]')).toHaveAttribute('href', '/')
      await expect(page.locator('[data-article-back]')).toContainText('Volver al portfolio')
    }
    await page.goto('/blog/')
  }
  for (const post of blogPosts) {
    await expect(page.getByRole('link', { name: new RegExp(`Leer artículo: ${post.title}`) })).toHaveCount(1)
  }

  for (const id of retiredBlogIds) {
    const response = await page.goto(`/blog/${id}/`)
    expect(response?.status(), id).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: 'No encuentro esa página', exact: true })).toBeVisible()
  }
})

test('Ainkii remains a separate project in development', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320'].includes(info.project.name))
  await page.goto('/proyectos/ainkii/')
  await expect(page).toHaveTitle('Ainkii — Producto educativo en desarrollo | Marc Teixidó')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Proyecto educativo en desarrollo que explora cómo ayudar a docentes a revisar temarios y organizar materiales de estudio con apoyo de IA.')
  const backLink = page.locator('a.control').first()
  await expect(backLink).toHaveAttribute('href', '/')

  await expect(page.getByRole('heading', { level: 1, name: 'Ainkii' })).not.toBeFocused()
  await page.keyboard.press('Tab')
  await expect(backLink).toBeFocused()
  await expect(page.getByText('Ainkii es un proyecto en desarrollo que explora cómo ordenar materiales de aprendizaje con apoyo de IA.', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Qué estoy explorando', exact: true })).toBeVisible()
  await expect(page.locator('.ainkii-capabilities li')).toHaveCount(8)
  await expect(page.locator('.ainkii-human-gate')).toHaveCount(1)
  expect(await page.locator('.ainkii-route-actions a').evaluateAll(controls => controls.every(control => control.scrollWidth <= control.clientWidth))).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('challenge routes fit desktop and narrow viewports without material axe violations', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320', 'chromium-mobile-375', 'chromium-1440'].includes(info.project.name))
  const routes = ['/', '/roadmap/', '/career-sprint-daily/', '/blog/']
  const remoteRequests = await collectUnexpectedRemote(page)

  for (const width of [320, 390, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of routes) {
      remoteRequests.length = 0
      await page.goto(route)
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
      expect(remoteRequests).toEqual([])
      if (info.project.name === 'chromium' && width === 1440) expect(await materialAxeViolations(page)).toEqual([])
    }
  }
})

test('private CMS loads Spanish GitHub OAuth without external locale requests or public navigation', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium')
  const remoteRequests = await collectUnexpectedRemote(page)

  const response = await page.goto('/admin/')
  expect(response?.status()).toBe(200)
  await expect(page.locator('meta[name="robots"]').first()).toHaveAttribute('content', 'noindex,nofollow')
  await expect(page.getByRole('button', { name: /Iniciar sesión con.*GitHub/ })).toBeVisible()
  expect(remoteRequests.filter(request => ['unpkg.com', 'cdn.jsdelivr.net'].includes(new URL(request).hostname))).toEqual([])

  for (const path of ['/', '/blog/']) {
    await page.goto(path)
    await expect(page.locator('a[href="/admin/"], a[href="/admin"]')).toHaveCount(0)
  }
})

test('primary navigation moves focus to visible landing anchors', async ({ page, javaScriptEnabled }, info) => {
  test.skip(javaScriptEnabled === false || info.project.name !== 'chromium')
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' })
  await navigation.getByRole('link', { name: 'Perfil', exact: true }).click()
  await expect(page).toHaveURL(/\/#about$/)
  await expect(page.getByRole('heading', { level: 2, name: 'Software, producto y coordinación técnica', exact: true })).toBeFocused()

  await page.goto('/')
  await navigation.getByRole('link', { name: 'Career Sprint', exact: true }).click()
  await expect(page).toHaveURL(/\/#career-sprint$/)
  await expect(page.getByRole('heading', { name: 'Reto de 8 semanas', exact: true })).toBeFocused()

  await page.goto('/')
  const contactLink = navigation.getByRole('link', { name: 'Contacto', exact: true })
  await contactLink.focus()
  await contactLink.press('Enter')
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.getByRole('heading', { name: '¿Hablamos?', exact: true })).toBeFocused()
})

test('challenge, progress and Blog remain usable without JavaScript', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-js-off')
  await page.setViewportSize({ width: 320, height: 800 })

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Marc Teixidó', exact: true })).toBeVisible()
  await page.goto('/roadmap/')
  await expect(page.locator('details')).toHaveCount(7)
  await page.goto('/career-sprint-daily/')
  await expect(page.locator('ol > li')).toHaveCount(dailyProgressEntries.length)
  await page.goto('/blog/')
  await expect(page.locator('[data-blog-card]')).toHaveCount(blogPosts.length)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})


test('published knowledge detail returns to its public index', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium' || !firstPublishedPost)
  if (!firstPublishedPost) return

  await page.goto('/blog/')
  await page.getByRole('link', { name: new RegExp(`Leer artículo: ${firstPublishedPost.title}`) }).click()
  await expect(page.getByRole('heading', { level: 1, name: firstPublishedPost.title, exact: true })).toBeVisible()
  const back = page.locator('[data-article-back]')
  await back.focus()
  await back.press('Enter')
  await expect(page).toHaveURL(/\/blog\/$/)
})

test('reduced motion keeps challenge content static and readable', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-reduced-motion')
  await page.goto('/')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
})

test('mobile challenge routes pass material axe checks and keep article copy left-aligned', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-mobile-320')
  for (const route of ['/', '/roadmap/', '/career-sprint-daily/', '/blog/']) {
    await page.goto(route)
    expect(await materialAxeViolations(page)).toEqual([])
  }
  const [firstDailyEntry] = dailyProgressEntries
  if (!firstDailyEntry) throw new Error('Expected a published daily entry for mobile typography')
  await page.goto(`/career-sprint-daily/${firstDailyEntry.activityDate}/`)
  await expect(page.locator('.article-prose p').first()).toHaveCSS('text-align', 'left')
})
