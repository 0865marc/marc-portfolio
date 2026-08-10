import { test, expect, type Page } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'
import { blogPosts, legacyBlogRoutes } from '../../src/data/blog'
import { professionalProfile } from '../../src/data/portfolio'

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

test.beforeEach(async ({ page }, info) => {
  if (info.project.name === 'chromium-reduced-motion') await page.emulateMedia({ reducedMotion: 'reduce' })
})

test('landing communicates the approved positioning and selected work', async ({ page }) => {
  const remoteRequests = await collectUnexpectedRemote(page)
  await page.goto('/')
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(/Marc\s*Teixidó/i)
  await expect(page.getByText(professionalProfile.identity.headline, { exact: true })).toBeVisible()
  await expect(page.locator('[data-project-card]')).toHaveCount(2)
  await expect(page.getByRole('heading', { name: 'Ainkii', exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Hermes', exact: true })).toBeVisible()
  await expect(page.getByText('Gym Tracker')).toHaveCount(0)
  await expect(page.getByText('Automation Systems')).toHaveCount(0)
  await expect(page.locator('img')).toHaveCount(0)
  expect(remoteRequests).toEqual([])
})

test('profile exposes the complete factual trajectory and limits', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium')
  await page.goto('/#about')
  await expect(page.getByText('Taurus Research & Development', { exact: true })).toBeVisible()
  await expect(page.getByText('Responsable de proyectos IT / IT Project Lead', { exact: true })).toBeVisible()
  await expect(page.getByText('MCSystems', { exact: true })).toBeVisible()
  await expect(page.getByText('Django Full-stack Developer / Software Engineer', { exact: true })).toBeVisible()
  await expect(page.getByText('3 distribuidores', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('20–25 servicios', { exact: true }).first()).toBeVisible()
  await expect(page.getByText('Universitat de Lleida', { exact: false })).toBeVisible()
  await expect(page.getByText(/Inglés · Profesional funcional/)).toBeVisible()
  await expect(page.locator('#about').getByRole('heading', { name: 'IA y automatización aplicada' })).toBeVisible()
  const body = await page.locator('body').innerText()
  for (const unsupported of ['Miles de dispositivos', '15+ servidores', 'MQTT']) expect(body).not.toContain(unsupported)
})

test('Ainkii has a complete canonical case study without inferred technology', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-320'].includes(info.project.name))
  const remoteRequests = await collectUnexpectedRemote(page)
  await page.goto('/proyectos/ainkii/')
  await expect(page).toHaveURL(/\/proyectos\/ainkii\/$/)
  await expect(page.getByRole('heading', { level: 1, name: 'Ainkii' })).toBeFocused()
  for (const level of ['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje']) {
    await expect(page.getByText(level, { exact: true })).toBeVisible()
  }
  await expect(page.locator('.ainkii-capabilities li')).toHaveCount(8)
  await expect(page.getByRole('heading', { name: 'La decisión importante sigue siendo humana' })).toBeVisible()
  await expect(page.getByText('En desarrollo', { exact: true }).first()).toBeVisible()
  const body = await page.locator('body').innerText()
  expect(body).not.toContain('FastAPI')
  expect(body).not.toContain('React')
  expect(remoteRequests).toEqual([])
})

test('blog exposes only the factual Hermes case and retires sample routes', async ({ page, javaScriptEnabled }, info) => {
  test.skip(!['chromium', 'firefox', 'webkit', 'chromium-js-off'].includes(info.project.name))
  await page.goto('/blog/')
  await expect(page.getByRole('heading', { level: 1, name: 'Blog', exact: true })).toBeVisible()
  await expect(page.locator('[data-blog-card]')).toHaveCount(1)
  await expect(page.locator('[data-blog-search]')).toHaveCount(0)
  await page.getByRole('link', { name: /Leer artículo:/ }).click()
  await expect(page).toHaveURL(new RegExp(`/blog/${blogPosts[0].id}/\\?from=index$`))
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(blogPosts[0].title)
  await expect(page.locator('pre')).toHaveCount(0)
  await expect(page.getByRole('heading', { name: 'Autonomía no significa permiso ilimitado' })).toBeVisible()

  if (javaScriptEnabled !== false) {
    await page.goto(`/blog/${legacyBlogRoutes[0].id}/`)
    await expect(page).toHaveURL(/\/blog\/$/)
    await page.goto('/#/blog')
    await expect(page).toHaveURL(/\/blog\/$/)
    await page.goto(`/#/blog/${legacyBlogRoutes[0].id}?from=landing`)
    await expect(page).toHaveURL(/\/blog\/$/)
    await page.goto('/#/blog/%E0%A4%A')
    await expect.poll(() => new URL(page.url()).pathname).toBe('/blog/articulo-no-encontrado/')
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Página no encontrada')
  }
})

test('route navigation moves focus and exposes a visible indicator', async ({ page, javaScriptEnabled }, info) => {
  test.skip(javaScriptEnabled === false || info.project.name !== 'chromium')
  await page.goto('/')
  await page.getByRole('navigation', { name: 'Principal' }).getByRole('link', { name: 'Blog', exact: true }).click()
  await expect(page).toHaveURL(/\/#blog$/)
  const blogHeading = page.getByRole('heading', { name: 'Blog', exact: true })
  await expect(blogHeading).toBeFocused()
  expect(await blogHeading.evaluate(heading => getComputedStyle(heading).boxShadow)).not.toBe('none')
  await page.getByRole('link', { name: 'Abrir blog' }).click()
  const routeHeading = page.getByRole('heading', { level: 1 })
  await expect(routeHeading).toBeFocused()
  expect(await routeHeading.evaluate(heading => getComputedStyle(heading).boxShadow)).not.toBe('none')
})

test('all primary content remains available without JavaScript', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-js-off')
  await page.goto('/')
  await expect(page.locator('[data-project-card]')).toHaveCount(2)
  await expect(page.getByText('Taurus Research & Development', { exact: true })).toBeVisible()
  await page.goto('/blog/')
  await expect(page.locator('[data-blog-card]')).toHaveCount(1)
  await page.goto(`/blog/${blogPosts[0].id}/`)
  await expect(page.getByRole('heading', { level: 1, name: blogPosts[0].title, exact: true })).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Contenido del artículo' })).toBeVisible()
  await expect(page.locator('[data-floating-index]')).toBeHidden()
  await page.goto('/proyectos/ainkii/')
  await expect(page.locator('.ainkii-capabilities li')).toHaveCount(8)
})

test('representative routes fit narrow screens and pass material axe checks', async ({ page }, info) => {
  test.skip(![
    'chromium',
    'chromium-mobile-320',
    'chromium-mobile-375',
    'chromium-768',
    'chromium-1024',
    'chromium-1440',
  ].includes(info.project.name))
  const routes = ['/', '/proyectos/ainkii/', '/blog/', `/blog/${blogPosts[0].id}/`, '/404.html']
  const remoteRequests = await collectUnexpectedRemote(page)
  for (const route of routes) {
    remoteRequests.length = 0
    await page.goto(route)
    const layout = await page.evaluate(() => ({
      viewportFits: document.documentElement.scrollWidth <= document.documentElement.clientWidth,
      clippedHeadings: [...document.querySelectorAll<HTMLElement>('h1, h2, h3')]
        .filter(heading => heading.offsetWidth > 1 && heading.offsetHeight > 1)
        .filter(heading => heading.scrollWidth > heading.clientWidth + 1)
        .map(heading => heading.textContent?.trim()),
    }))
    expect(layout.viewportFits).toBe(true)
    expect(layout.clippedHeadings).toEqual([])
    expect(remoteRequests).toEqual([])
    if (info.project.name === 'chromium') expect(await materialAxeViolations(page)).toEqual([])
  }
})

test('reduced motion leaves content static and readable', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-reduced-motion')
  await page.goto('/')
  expect(await page.evaluate(() => matchMedia('(prefers-reduced-motion: reduce)').matches)).toBe(true)
  expect(await page.evaluate(() => getComputedStyle(document.documentElement).scrollBehavior)).toBe('auto')
  await expect(page.getByRole('heading', { name: 'Ainkii', exact: true })).toBeVisible()
})

test('journey steps stay contained across responsive grids', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-1440')
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/')

  for (const width of [320, 375, 768, 1024, 1440]) {
    await page.setViewportSize({ width, height: 900 })
    await page.locator('.journey-strip').scrollIntoViewIfNeeded()
    await page.evaluate(() => document.fonts.ready)
    const geometry = await page.locator('.journey-strip').evaluate(strip => {
      const list = strip.querySelector<HTMLElement>('.journey-list')!
      const stripBounds = strip.getBoundingClientRect()
      const descendants = [...strip.querySelectorAll<HTMLElement>('.journey-list li, .journey-list li *')]
      const outOfBounds = descendants.filter(element => {
        const bounds = element.getBoundingClientRect()
        return bounds.left < stripBounds.left - 1
          || bounds.right > stripBounds.right + 1
          || bounds.top < stripBounds.top - 1
          || bounds.bottom > stripBounds.bottom + 1
      }).map(element => ({ tag: element.tagName, text: element.textContent?.trim() }))
      return {
        columns: getComputedStyle(list).gridTemplateColumns.trim().split(/\s+/).filter(Boolean).length,
        contained: outOfBounds.length === 0,
        outOfBounds,
      }
    })
    expect(geometry.columns).toBe(width >= 1280 ? 4 : width >= 640 ? 2 : 1)
    expect(geometry.contained, `${width}: ${JSON.stringify(geometry.outOfBounds)}`).toBe(true)
  }
})

test('article index floats beside the centered reading column without shifting it', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium-1440')
  const route = `/blog/${blogPosts[0].id}/`

  for (const width of [1280, 1440]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.goto(route)
    await page.evaluate(() => document.fonts.ready)

    const readingRoot = page.locator('[data-reading-root]')
    const inlineIndex = page.locator('[data-article-index]')
    const floatingIndex = page.locator('[data-floating-index]')
    const before = await readingRoot.boundingBox()
    expect(before).not.toBeNull()
    await expect(inlineIndex).toBeVisible()
    await expect(floatingIndex).toHaveAttribute('aria-hidden', 'true')
    expect(await floatingIndex.evaluate(element => (element as HTMLElement).inert)).toBe(true)

    await page.evaluate(() => {
      const index = document.querySelector<HTMLElement>('[data-article-index]')!
      scrollTo(0, index.getBoundingClientRect().bottom + scrollY + 20)
    })
    await expect(floatingIndex).toHaveAttribute('aria-hidden', 'false')
    await expect.poll(() => floatingIndex.locator('[aria-current="location"]').count()).toBe(1)

    const after = await readingRoot.boundingBox()
    const geometry = await page.evaluate(() => {
      const article = document.querySelector<HTMLElement>('[data-reading-root]')!.getBoundingClientRect()
      const floating = document.querySelector<HTMLElement>('[data-floating-index]')!.getBoundingClientRect()
      const viewport = { width: innerWidth, height: innerHeight }
      return {
        expectedLeft: viewport.width / 2 + 24 * 16 + 16,
        floating,
        article,
        withinViewport: floating.left >= 16 && floating.right <= viewport.width - 16
          && floating.top >= 0 && floating.bottom <= viewport.height,
        doesNotIntersect: floating.right <= article.left || floating.left >= article.right,
      }
    })
    expect(Math.abs((after?.x ?? 0) - (before?.x ?? 0))).toBeLessThanOrEqual(1)
    expect(Math.abs((after?.width ?? 0) - (before?.width ?? 0))).toBeLessThanOrEqual(1)
    expect(Math.abs(geometry.floating.left - geometry.expectedLeft)).toBeLessThanOrEqual(1)
    expect(geometry.withinViewport).toBe(true)
    expect(geometry.doesNotIntersect).toBe(true)
  }

  await page.setViewportSize({ width: 1024, height: 900 })
  await page.goto(route)
  const floatingIndex = page.locator('[data-floating-index]')
  await expect(page.locator('[data-article-index]')).toBeVisible()
  await expect(page.locator('.article-index-aside')).toBeHidden()
  await expect(floatingIndex).toHaveAttribute('aria-hidden', 'true')
  expect(await floatingIndex.evaluate(element => (element as HTMLElement).inert)).toBe(true)
})

test('article reading aids and contact actions stay coherent', async ({ page, javaScriptEnabled }, info) => {
  test.skip(javaScriptEnabled === false || !['chromium', 'chromium-1440', 'chromium-mobile-320'].includes(info.project.name))
  await page.goto(`/blog/${blogPosts[0].id}/`)
  await expect(page.getByText(/min de lectura/)).toBeVisible()
  await expect(page.getByRole('navigation', { name: 'Contenido del artículo' })).toBeVisible()
  await page.evaluate(() => scrollTo(0, document.documentElement.scrollHeight))
  await expect.poll(() => page.locator('[data-reading-progress]').evaluate(element => Number(getComputedStyle(element).getPropertyValue('--reading-progress')))).toBeGreaterThan(0.9)

  await page.goto('/#contact')
  const contactPanel = page.locator('[data-contact-panel]')
  await contactPanel.scrollIntoViewIfNeeded()
  expect(await contactPanel.evaluate(panel => {
    const parent = panel.getBoundingClientRect()
    return [...panel.querySelectorAll<HTMLElement>('.contact-action')].every(action => {
      const bounds = action.getBoundingClientRect()
      return bounds.left >= parent.left && bounds.right <= parent.right
    })
  })).toBe(true)
})
