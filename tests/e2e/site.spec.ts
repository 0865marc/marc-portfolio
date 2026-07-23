import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { blogPosts } from '../../src/data/blog'

const blockRemote = (page: Page) => page.route(/^https?:\/\/(?!127\.0\.0\.1)/, route => route.abort())
const seriousAxe = async (page: Page) => (await new AxeBuilder({ page }).analyze()).violations.filter(value => ['serious', 'critical'].includes(value.impact ?? ''))

test.beforeEach(async ({ page }, info) => {
  if (info.project.name === 'chromium-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('landing anchor route focus and canonical blog navigation', async ({ page, javaScriptEnabled }) => {
  test.skip(javaScriptEnabled === false)
  await blockRemote(page)
  await page.goto('/')
  await page.getByRole('link', { name: 'Blog', exact: true }).click()
  await expect(page).toHaveURL(/\/#blog$/)
  await expect(page.getByRole('heading', { name: 'Blog', exact: true })).toBeFocused()
  await page.getByRole('link', { name: 'Ver todos', exact: true }).click()
  await expect(page).toHaveURL(/\/blog\/$/)
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
})

test('new tab opens direct article content in a separate page', async ({ page, context, javaScriptEnabled }) => {
  test.skip(javaScriptEnabled === false)
  await blockRemote(page)
  await page.goto('/blog/')
  const href = await page.getByRole('link', { name: /Leer artículo:/ }).first().getAttribute('href')
  const articlePage = await context.newPage()
  await blockRemote(articlePage)
  const response = await articlePage.goto(href!, { waitUntil: 'load' })
  expect(response?.ok()).toBe(true)
  await expect(articlePage).toHaveURL(new RegExp(`/blog/${blogPosts[0].id}/\\?from=index$`))
  await expect(articlePage.getByRole('heading', { level: 1 })).toHaveText(blogPosts[0].title)
  await articlePage.close()
  await expect(page).toHaveURL(/\/blog\/$/)
})

test('history preserves focus and cards through ten navigations', async ({ page, javaScriptEnabled, browserName }) => {
  test.setTimeout(browserName === 'webkit' ? 180_000 : 60_000)
  test.skip(javaScriptEnabled === false)
  await blockRemote(page)
  await page.goto('/blog/')
  for (let index = 0; index < 5; index += 1) {
    if (index === 0 || browserName === 'webkit') {
      await Promise.all([
        page.waitForURL(new RegExp(`/blog/${blogPosts[0].id}/\\?from=index$`), { waitUntil: 'commit' }),
        page.getByRole('link', { name: /Leer artículo:/ }).first().click({ noWaitAfter: true }),
      ])
    } else {
      await page.goForward({ waitUntil: 'commit' })
    }
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(new RegExp(`/blog/${blogPosts[0].id}/\\?from=index$`))
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await page.goBack({ waitUntil: 'commit' })
    await page.waitForLoadState('domcontentloaded')
    await expect(page).toHaveURL(/\/blog\/$/)
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    await expect(page.locator('[data-blog-card]')).toHaveCount(3)
  }
})

test('route heading remains focused after refresh', async ({ page, javaScriptEnabled }) => {
  test.skip(javaScriptEnabled === false)
  await blockRemote(page)
  await page.goto('/blog/')
  await page.reload()
  await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
})

test('filters cover diacritics, exact tags, clear, live region, and no match', async ({ page, javaScriptEnabled }) => {
  await page.goto('/blog/')
  await expect(page.locator('[data-blog-card]')).toHaveCount(3)
  if (javaScriptEnabled === false) {
    await expect(page.locator('[data-blog-search]')).toBeHidden()
    await expect(page.locator('[data-blog-card]')).toHaveCount(3)
    return
  }
  await page.locator('[data-blog-search]').fill('laténcia resiliencia')
  await expect(page.locator('[data-blog-card]:visible')).toHaveCount(1)
  await expect(page.getByRole('status')).toContainText('1 de 3')
  await page.getByRole('button', { name: 'MQTT', exact: true }).click()
  await expect(page.locator('[data-blog-card]:visible')).toHaveCount(0)
  await expect(page.locator('[data-blog-empty]')).toBeVisible()
  await page.getByRole('button', { name: 'Mostrar todos' }).click()
  await expect(page.locator('[data-blog-card]:visible')).toHaveCount(3)
  await expect(page.getByRole('button', { name: 'Limpiar filtros' })).toBeDisabled()
})

test('articles, query-specific back link, legacy variants, malformed route and designed document', async ({ page, javaScriptEnabled }) => {
  for (const post of blogPosts) {
    await page.goto(`/blog/${post.id}/?from=index`)
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(post.title)
  }
  if (javaScriptEnabled !== false) {
    await page.goto(`/blog/${blogPosts[0].id}/?from=landing`)
    await expect(page.locator('[data-article-back]')).toHaveAttribute('href', '/#blog')
    await page.goto('/#/blog')
    await expect(page).toHaveURL(/\/blog\/$/)
    await page.goto('/#/blog/arquitecturas-plataformas-iot?from=landing')
    await expect(page).toHaveURL(/\/blog\/arquitecturas-plataformas-iot\/\?from=landing/)
    await page.goto('/#/blog/%E0%A4%A')
    await expect(page).toHaveURL(/\/blog\/articulo-no-encontrado\//)
  }
  const response = await page.goto('/404.html')
  expect(response?.status()).toBe(200)
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Página no encontrada')
})

test('focus is not stolen from controls and listener lifecycle is bounded per document', async ({ page, javaScriptEnabled }) => {
  test.skip(javaScriptEnabled === false)
  await page.addInitScript(() => {
    const original = EventTarget.prototype.addEventListener
    const counts: Record<string, number> = {}
    EventTarget.prototype.addEventListener = function(type, listener, options) {
      counts[type] = (counts[type] ?? 0) + 1
      return original.call(this, type, listener, options)
    }
    Object.defineProperty(window, '__listeners', { value: counts })
  })
  await page.goto('/blog/')
  const input = page.locator('[data-blog-search]')
  await input.focus()
  await input.fill('iot')
  await expect(input).toBeFocused()
  const counts = await page.evaluate(() => (window as unknown as { __listeners: Record<string, number> }).__listeners)
  expect(counts.input ?? 0).toBeLessThanOrEqual(2)
  expect(counts.hashchange ?? 0).toBeLessThanOrEqual(2)
  expect(counts.error ?? 0).toBeLessThanOrEqual(20)
})

test('image failure, reduced motion, overflow, and representative axe states', async ({ page, javaScriptEnabled }, info) => {
  await blockRemote(page)
  await page.goto('/#projects')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true)
  if (javaScriptEnabled !== false) await expect(page.locator('[data-image-fallback][data-failed=true]').first()).toBeAttached()
  if (info.project.name === 'chromium-reduced-motion') {
    expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
    expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  }
  if (info.project.name === 'chromium') {
    await page.locator('[data-reveal]').evaluateAll(elements => elements.forEach(element => element.classList.add('revealed')))
    expect(await seriousAxe(page)).toEqual([])
    await page.goto('/blog/')
    await page.locator('[data-blog-search]').fill('sin coincidencia')
    await expect(page.locator('[data-blog-empty]')).toBeVisible()
    expect(await seriousAxe(page)).toEqual([])
    await page.goto(`/blog/${blogPosts[0].id}/`)
    expect(await seriousAxe(page)).toEqual([])
    await page.goto('/404.html')
    expect(await seriousAxe(page)).toEqual([])
  }
})

test('refined UI keeps headings visible and exposes progressive states', async ({ page, javaScriptEnabled }) => {
  await blockRemote(page)
  const routes = ['/', '/blog/', `/blog/${blogPosts[0].id}/`, '/404.html']

  for (const route of routes) {
    await page.goto(route)
    const layout = await page.evaluate(() => ({
      viewportFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      clippedHeadings: [...document.querySelectorAll<HTMLElement>('h1, h2, h3')]
        .filter(heading => heading.scrollWidth > heading.clientWidth + 1)
        .map(heading => heading.textContent?.trim()),
    }))
    expect(layout.viewportFits).toBe(true)
    expect(layout.clippedHeadings).toEqual([])
  }

  await page.goto('/blog/')
  if (javaScriptEnabled !== false) {
    await expect(page.getByRole('heading', { level: 1 })).toBeFocused()
    expect(await page.getByRole('heading', { level: 1 }).evaluate(heading => getComputedStyle(heading).outlineStyle)).toBe('none')
  }

  await page.goto(`/blog/${blogPosts[0].id}/`)
  await expect(page.getByText(/min de lectura/)).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Contenido del artículo' })).toBeVisible()
  if (javaScriptEnabled !== false) {
    await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
    await expect.poll(() => page.locator('[data-reading-progress]').evaluate(element => Number(getComputedStyle(element).getPropertyValue('--reading-progress')))).toBeGreaterThan(0.9)
  }
})

test('landing navigation, contact actions, and article reading aids stay coherent', async ({ page, javaScriptEnabled }) => {
  await blockRemote(page)
  await page.goto('/')
  const primaryNavigation = page.getByRole('navigation', { name: 'Principal' })
  await expect(primaryNavigation.locator('.control')).toHaveCount(0)
  await expect(primaryNavigation.getByRole('link')).toHaveCount(4)

  const contactPanel = page.locator('[data-contact-panel]')
  await contactPanel.scrollIntoViewIfNeeded()
  expect(await contactPanel.evaluate(panel => {
    const parent = panel.getBoundingClientRect()
    return [...panel.querySelectorAll<HTMLElement>('.contact-action')].every(action => {
      const bounds = action.getBoundingClientRect()
      return bounds.left >= parent.left && bounds.right <= parent.right
    })
  })).toBe(true)

  await page.goto(`/blog/${blogPosts[0].id}/`)
  const readingRoot = page.locator('[data-reading-root]')
  const initialArticleBox = await readingRoot.boundingBox()
  expect(initialArticleBox).not.toBeNull()
  expect(Math.abs((initialArticleBox?.x ?? 0) + (initialArticleBox?.width ?? 0) / 2 - (await page.evaluate(() => innerWidth / 2)))).toBeLessThanOrEqual(1)

  const proseMetrics = await page.locator('.article-prose').evaluate(prose => {
    const bodyParagraphs = [...prose.querySelectorAll<HTMLElement>('section > p:not(.article-section-number)')]
    const continuation = prose.querySelector<HTMLElement>(':scope > p:nth-of-type(2)')
    return {
      minimumFontSize: Math.min(...bodyParagraphs.map(paragraph => Number.parseFloat(getComputedStyle(paragraph).fontSize))),
      continuationIndent: continuation ? Number.parseFloat(getComputedStyle(continuation).textIndent) : 0,
      textAlign: bodyParagraphs[0] ? getComputedStyle(bodyParagraphs[0]).textAlign : '',
    }
  })
  expect(proseMetrics.minimumFontSize).toBeGreaterThanOrEqual(17)
  expect(proseMetrics.continuationIndent).toBeGreaterThan(0)
  expect(proseMetrics.textAlign).toBe('justify')
  expect(await readingRoot.locator('h1').evaluate(title => Number.parseFloat(getComputedStyle(title).fontSize))).toBeLessThanOrEqual(56)
  expect(await readingRoot.evaluate(article => getComputedStyle(article).transitionProperty)).toContain('transform')

  const floatingIndex = page.locator('[data-floating-index]')
  await expect(floatingIndex).toHaveAttribute('aria-hidden', 'true')
  if (javaScriptEnabled !== false && (await page.evaluate(() => innerWidth)) >= 1280) {
    await page.locator('[data-article-section]').nth(1).scrollIntoViewIfNeeded()
    await expect(floatingIndex).toHaveAttribute('aria-hidden', 'false')
    await expect(page.locator('.article-reading-layout')).toHaveClass(/has-floating-index/)
    await expect(floatingIndex.locator('[aria-current="location"]')).toHaveCount(1)
    await expect.poll(async () => (await readingRoot.boundingBox())?.x ?? 0).toBeLessThan((initialArticleBox?.x ?? 0) - 100)
    await page.evaluate(() => scrollTo(0, 0))
    await expect(floatingIndex).toHaveAttribute('aria-hidden', 'true')
    await expect(page.locator('.article-reading-layout')).not.toHaveClass(/has-floating-index/)
    await expect.poll(async () => Math.abs(((await readingRoot.boundingBox())?.x ?? 0) - (initialArticleBox?.x ?? 0))).toBeLessThanOrEqual(1)
  }
})
