import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { professionalProfile } from '../../src/data/portfolio'
import { learningConcepts, conceptHref } from '../../src/data/learning'
import { learningCourses } from '../../src/data/learningCourses'
import { challengeWeeks, dailyProgressEntries } from '../../src/data/challenge'

const retiredBlogIds = [
  'entorno-reproducible',
  'lo-que-decidi-no-contar-en-este-portfolio',
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

const selectLearningCourse = async (page: Page, id: string) => {
  const nav = page.getByRole('navigation', { name: 'Cursos de la especialización' })
  if (await nav.locator('details').getAttribute('open') === null) await nav.locator('summary').click()
  await nav.locator(`a[href="#${id}"]`).click()
}

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

test('landing makes projects, formation and contact discoverable', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320', 'chromium-1440'].includes(info.project.name))
  const remoteRequests = await collectUnexpectedRemote(page)
  await page.goto('/')
  const navigation = page.getByRole('navigation', { name: 'Navegación principal' })
  await expect(page).toHaveTitle(professionalProfile.identity.seo.title)
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', professionalProfile.identity.seo.description)
  await expect(page.getByRole('heading', { level: 1, name: 'Marc Teixidó', exact: true })).toBeVisible()
  await expect(page.getByText(professionalProfile.identity.headline, { exact: true })).toBeVisible()
  await expect(page.getByText(professionalProfile.identity.summary, { exact: true })).toBeVisible()
  await expect(navigation.locator('a')).toHaveText(['Perfil', 'Proyectos', 'Formación', 'Contacto'])
  for (const id of ['about', 'projects', 'formacion', 'contact']) await expect(page.locator(`#${id}`)).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explorar el aprendizaje', exact: true })).toHaveAttribute('href', '/aprendizaje/')
  await expect(page.getByRole('link', { name: 'Ver el proyecto', exact: true })).toHaveAttribute('href', '/proyectos/ainkii/')
  await expect(page.getByRole('link', { name: 'Escríbeme por correo', exact: true })).toHaveAttribute('href', `mailto:${professionalProfile.contacts.email}`)
  await expect(page.locator('#contact')).not.toContainText(professionalProfile.contacts.email)
  await expect(page.locator('#blog, a[href="#blog"], a[href^="/blog/"]')).toHaveCount(0)
  await expect(page.locator('#formacion')).toContainText('En curso · IBM / Coursera')
  await expect(page.locator('#formacion')).toContainText('Estoy cursando esta especialización')
  await expect(page.locator('#formacion')).not.toContainText('AWS')
  await expect(page.locator('#formacion article')).toHaveCount(1)
  await expect(page.locator('a[href="/career-sprint-daily/"], a[href="/roadmap/"]')).toHaveCount(0)
  expect(remoteRequests).toEqual([])
})

test('mobile navigation labels fit inside their own targets', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-mobile-320')
  await page.goto('/')
  await page.evaluate(() => document.fonts.ready)
  const geometry = await page.locator('.landing-nav-link').evaluateAll(links => links.map(link => {
    const box = link.getBoundingClientRect()
    const range = document.createRange()
    range.selectNodeContents(link)
    const text = range.getBoundingClientRect()
    return { label: link.textContent, box: { left: box.left, right: box.right, height: box.height }, text: { left: text.left, right: text.right }, width: link.clientWidth, scroll: link.scrollWidth }
  }))
  for (const link of geometry) {
    expect(link.text.left, link.label ?? '').toBeGreaterThanOrEqual(link.box.left - 1)
    expect(link.text.right, link.label ?? '').toBeLessThanOrEqual(link.box.right + 1)
    expect(link.scroll, link.label ?? '').toBeLessThanOrEqual(link.width + 1)
    expect(link.box.height).toBeGreaterThanOrEqual(44)
  }
})

test('learning follows the courses with inline explanations and stable earlier URLs', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320', 'chromium-js-off'].includes(info.project.name))
  await page.goto('/')
  await expect(page.locator('#about [data-education]')).toContainText(professionalProfile.education.qualification)
  await expect(page.locator('#formacion')).not.toContainText(professionalProfile.education.qualification)
  await expect(page.getByText(professionalProfile.education.qualification, { exact: false })).toHaveCount(1)
  await page.getByRole('link', { name: 'Explorar el aprendizaje', exact: true }).click()
  await expect(page.getByRole('heading', { level: 1, name: 'Aprender a construir con LLMs' })).toBeVisible()
  await expect(page.locator('.course-section')).toHaveCount(4)
  await expect(page.locator('.course-section:visible')).toHaveCount(1)
  await expect(page.locator('#curso-1')).toBeVisible()
  await expect(page.locator('[data-reading-root], .concept-card')).toHaveCount(0)
  const nav = page.getByRole('navigation', { name: 'Cursos de la especialización' })
  await expect(nav).not.toContainText('Ejemplos desarrollados')
  for (const course of learningCourses.filter(course => course.available)) {
    await selectLearningCourse(page, course.id)
    await expect(page).toHaveURL(new RegExp(`#${course.id}$`))
    await expect(page.locator('.course-section:visible')).toHaveCount(1)
    await expect(page.locator(`#${course.id}`)).toBeVisible()
    await expect(page.locator(`#${course.id} h2`)).toHaveText(course.title)
    if (info.project.name !== 'chromium-js-off') {
      await expect(nav.locator('[aria-current="location"]')).toHaveAttribute('href', `#${course.id}`)
      await expect(page.locator(`#${course.id} h2`)).toBeFocused()
    }
  }
  await page.goBack()
  await expect(page.locator('#curso-3')).toBeVisible()
  await page.goForward()
  await expect(page.locator('#curso-4')).toBeVisible()
  await page.reload()
  await expect(page.locator('#curso-4')).toBeVisible()
  await expect(page.locator('.course-section:visible')).toHaveCount(1)
  await selectLearningCourse(page, 'curso-1')
  await page.locator('#curso-1 summary').first().click()
  await expect(page.getByRole('heading', { name: 'De una frase a sus piezas', exact: true })).toBeVisible()
  for (const concept of learningConcepts) {
    await page.goto(`/aprendizaje/${concept.id}/`)
    await expect(page).toHaveURL(new RegExp(conceptHref(concept.id).replace('/', '\/') + '$'))
    await expect(page.locator('.course-section:visible')).toHaveAttribute('id', conceptHref(concept.id).split('#')[1])
  }
})

test('pending courses remain visible but cannot be opened, including by direct hash', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320', 'chromium-js-off'].includes(info.project.name))
  await page.goto('/aprendizaje/#curso-4')
  const nav = page.getByRole('navigation', { name: 'Cursos de la especialización' })
  if (await nav.locator('details').getAttribute('open') === null) await nav.locator('summary').click()
  await expect(nav.locator('a')).toHaveCount(4)
  await expect(nav.getByRole('button', { disabled: true })).toHaveCount(3)
  for (const course of learningCourses.filter(course => !course.available)) {
    const pending = nav.getByRole('button', { name: new RegExp(course.title) })
    await expect(pending).toBeVisible()
    await expect(pending).toBeDisabled()
    await expect(pending).toContainText('Pendiente')
    await pending.click({ force: true })
    await expect(page).toHaveURL(/#curso-4$/)
    await expect(page.locator('.course-section:visible')).toHaveAttribute('id', 'curso-4')
  }
  if (info.project.name === 'chromium-mobile-320') await page.screenshot({ path: info.outputPath('pending-courses.png') })
  for (const id of ['curso-5', 'curso-6', 'curso-7']) {
    await page.goto(`/aprendizaje/#${id}`)
    await expect(page.locator(`#${id}, a[href="#${id}"]`)).toHaveCount(0)
    await expect(page.locator('.course-section:visible')).toHaveAttribute('id', 'curso-1')
    if (info.project.name !== 'chromium-js-off') await expect(nav.locator('[aria-current="location"]')).toHaveAttribute('href', '#curso-1')
  }
})

test('learning examples expose token granularity, word order and causal visibility', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320', 'chromium-js-off'].includes(info.project.name))
  await page.goto('/aprendizaje/')
  if (info.project.name === 'chromium-js-off') {
    await expect(page.locator('[data-lab-controls]:visible')).toHaveCount(0)
    await expect(page.locator('[data-token-output] li')).toHaveCount(5)
    await expect(page.locator('.word-counts dd')).toHaveText(['1', '1', '1', '1', '1'])
    await expect(page.locator('.attention-strip [data-visible="true"]')).toHaveCount(3)
    return
  }
  await page.getByLabel('Dividir por', { exact: true }).selectOption('fragments')
  await expect(page.locator('[data-token-output] li')).toHaveCount(7)
  await expect(page.locator('[data-token-result]')).toContainText('7 tokens')
  await page.getByLabel('Dividir por', { exact: true }).selectOption('words')
  await expect(page.locator('[data-token-output] li')).toHaveCount(5)
  await selectLearningCourse(page, 'curso-2')
  await page.getByLabel('Quién persigue a quién').selectOption('1')
  await expect(page.locator('[data-bag-sentence]')).toHaveText('El perro persigue al gato.')
  await expect(page.locator('.word-counts dd')).toHaveText(['1', '1', '1', '1', '1'])
  await selectLearningCourse(page, 'curso-3')
  const firstToken = page.locator('.attention-controls').getByRole('button', { name: 'El', exact: true })
  await firstToken.focus()
  await firstToken.press('Enter')
  await expect(firstToken).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.attention-strip [data-visible="true"]')).toHaveCount(1)
  await page.getByLabel('Qué parte de la frase puede usar').selectOption('full')
  await expect(page.locator('.attention-strip [data-visible="true"]')).toHaveCount(5)
  await page.getByLabel('Qué parte de la frase puede usar').selectOption('causal')
  await page.locator('.attention-controls').getByRole('button', { name: 'luna', exact: true }).click()
  await expect(page.locator('.attention-strip [data-visible="true"]')).toHaveCount(5)
  await expect(page.locator('[data-attention-result]')).toHaveText('Desde «luna», el modelo puede usar: El, gato, mira, la, luna.')
  await expect(page.locator('#curso-4')).toContainText('Conceptos clave')
})

test('learning course navigation stays visible while reading and supports keyboard selection', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320', 'chromium-1440', 'chromium-js-off'].includes(info.project.name))
  await page.goto('/aprendizaje/')
  const nav = page.getByRole('navigation', { name: 'Cursos de la especialización' })
  const header = await page.locator('.learning-header').boundingBox()
  const initialNav = await nav.boundingBox()
  expect(initialNav!.y).toBeGreaterThanOrEqual(header!.y + header!.height - 6)
  if (['chromium-1440', 'chromium-mobile-320'].includes(info.project.name)) {
    await page.screenshot({ path: info.outputPath('learning-overview.png') })
  }
  await selectLearningCourse(page, 'curso-1')
  if (['chromium-1440', 'chromium-mobile-320'].includes(info.project.name)) {
    await page.screenshot({ path: info.outputPath('selected-course.png') })
  }
  await page.locator('#curso-1 summary').last().click()
  await page.locator('.learning-footer').scrollIntoViewIfNeeded()
  const bounds = await nav.boundingBox()
  expect(bounds).not.toBeNull()
  expect(bounds!.y).toBeGreaterThanOrEqual(0)
  expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(page.viewportSize()!.height)
  if (['chromium-1440', 'chromium-mobile-320'].includes(info.project.name)) {
    await page.screenshot({ path: info.outputPath('navigation-while-reading.png') })
  }
  if (await nav.locator('details').getAttribute('open') === null) {
    await nav.locator('summary').focus()
    await page.keyboard.press('Enter')
  }
  const thirdCourse = nav.locator('a[href="#curso-3"]')
  await thirdCourse.focus()
  await page.keyboard.press('Enter')
  await expect(page.locator('#curso-3')).toBeVisible()
  await expect(page.locator('.course-section:visible')).toHaveCount(1)
  if (info.project.name !== 'chromium-js-off') await expect(page.locator('#curso-3 h2')).toBeFocused()
  if (page.viewportSize()!.width < 1024) {
    await expect(nav.locator('details')).not.toHaveAttribute('open')
    await nav.locator('summary').click()
    await thirdCourse.focus()
    await page.keyboard.press('Escape')
    await expect(nav.locator('details')).not.toHaveAttribute('open')
    await expect(nav.locator('summary')).toBeFocused()
  }
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

  await expect(page.getByRole('heading', { level: 1, name: 'Plan de formación de 2026', exact: true })).toBeVisible()
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
  await expect(page.locator('main > div > header').getByText('Archivo · 24 de agosto de 2026 — 18 de octubre de 2026', { exact: true })).toBeVisible()
  await expect(page.getByText('Objetivo previsto', { exact: true })).toHaveCount(7)
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

  await expect(page.getByRole('heading', { level: 1, name: 'Notas originales', exact: true })).toBeVisible()
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

test('404 offers the current learning route', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320'].includes(info.project.name))
  const response = await page.goto('/missing/')

  expect(response?.status()).toBe(404)
  await expect(page).toHaveTitle('Página no encontrada — Marc Teixidó')
  await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', 'Esta página no existe o ha cambiado de dirección. Puedes volver al portfolio o explorar el cuaderno de IA.')
  await expect(page.getByText('Página no disponible', { exact: true })).toBeVisible()
  await expect(page.getByText('Esta página no existe o ha cambiado de dirección. Puedes volver al portfolio o explorar el cuaderno de IA.', { exact: true })).toBeVisible()
  await expect(page.getByRole('link', { name: 'Explorar conceptos', exact: true })).toHaveAttribute('href', '/aprendizaje/')
})

test('removed blog routes return the portfolio fallback', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-js-off', 'chromium-mobile-320'].includes(info.project.name))
  for (const path of ['/blog/', ...retiredBlogIds.map(id => `/blog/${id}/`)]) {
    const response = await page.goto(path)
    expect(response?.status(), path).toBe(404)
    await expect(page.getByRole('heading', { level: 1, name: 'No encuentro esa página', exact: true })).toBeVisible()
    await expect(page.locator('a[href^="/blog/"]')).toHaveCount(0)
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
  await expect(page.getByText(professionalProfile.projects[0].description, { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { level: 3, name: 'Qué quiero resolver', exact: true })).toBeVisible()
  await expect(page.locator('.ainkii-capabilities li p')).toHaveText(professionalProfile.projects[0].capabilities)
  await expect(page.locator('.ainkii-human-gate')).toHaveCount(1)
  expect(await page.locator('.ainkii-route-actions a').evaluateAll(controls => controls.every(control => control.scrollWidth <= control.clientWidth))).toBe(true)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
})

test('Ainkii model labels fit their cards at each layout width', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium')
  for (const width of [320, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    for (const route of ['/', '/proyectos/ainkii/']) {
      await page.goto(route)
      await page.evaluate(() => document.fonts.ready)
      const labels = await page.locator('.ainkii-model li strong').evaluateAll(items => items.map(item => {
        const card = item.parentElement!.getBoundingClientRect()
        const range = document.createRange()
        range.selectNodeContents(item)
        const label = range.getBoundingClientRect()
        return { text: item.textContent, left: label.left, right: label.right, cardLeft: card.left, cardRight: card.right }
      }))
      for (const label of labels) {
        expect(label.left, label.text ?? '').toBeGreaterThanOrEqual(label.cardLeft)
        expect(label.right, label.text ?? '').toBeLessThanOrEqual(label.cardRight)
      }
    }
  }
})

test('challenge routes fit desktop and narrow viewports without material axe violations', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320', 'chromium-mobile-375', 'chromium-1440'].includes(info.project.name))
  const routes = ['/', '/roadmap/', '/career-sprint-daily/', '/aprendizaje/', '/aprendizaje/#curso-3']
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

  for (const path of ['/', '/aprendizaje/']) {
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
  await expect(page.getByRole('heading', { level: 2, name: 'Experiencia', exact: true })).toBeFocused()

  await page.goto('/')
  await navigation.getByRole('link', { name: 'Formación', exact: true }).click()
  await expect(page).toHaveURL(/\/#formacion$/)
  await expect(page.getByRole('heading', { name: 'IA generativa', exact: true })).toBeFocused()

  await page.goto('/')
  const contactLink = navigation.getByRole('link', { name: 'Contacto', exact: true })
  await contactLink.focus()
  await contactLink.press('Enter')
  await expect(page).toHaveURL(/\/#contact$/)
  await expect(page.getByRole('heading', { name: '¿Hablamos?', exact: true })).toBeFocused()
})

test('challenge, progress and learning remain usable without JavaScript', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-js-off')
  await page.setViewportSize({ width: 320, height: 800 })

  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1, name: 'Marc Teixidó', exact: true })).toBeVisible()
  await page.goto('/roadmap/')
  await expect(page.locator('details')).toHaveCount(7)
  await page.goto('/career-sprint-daily/')
  await expect(page.locator('ol > li')).toHaveCount(dailyProgressEntries.length)
  await page.goto('/aprendizaje/')
  await expect(page.locator('.course-section:visible')).toHaveCount(1)
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
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
  for (const route of ['/', '/roadmap/', '/career-sprint-daily/', '/aprendizaje/', '/aprendizaje/#curso-3']) {
    await page.goto(route)
    expect(await materialAxeViolations(page)).toEqual([])
  }
  const [firstDailyEntry] = dailyProgressEntries
  if (!firstDailyEntry) throw new Error('Expected a published daily entry for mobile typography')
  await page.goto(`/career-sprint-daily/${firstDailyEntry.activityDate}/`)
  await expect(page.locator('.article-prose p').first()).toHaveCSS('text-align', 'left')
})
