import { test, expect } from '@playwright/test'

for (const width of [375, 360, 390]) {
  test(`@performance hero CTA arrangement stays stable when fonts load at ${width}px`, async ({ page }, info) => {
    test.skip(info.project.name !== 'chromium-mobile-375')
    await page.setViewportSize({ width, height: 812 })
    const requests = new Set<string>()
    let releaseFonts!: () => void
    const fontGate = new Promise<void>(resolve => { releaseFonts = resolve })
    await page.route(/\.(woff2?|ttf)(\?.*)?$/, async route => {
      requests.add(route.request().url())
      await fontGate
      await route.continue()
    })
    await page.addInitScript(() => {
      type Shift = PerformanceEntry & {
        value: number; hadRecentInput: boolean
        sources: Array<{ node?: Node; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }>
      }
      const shifts: object[] = []
      new PerformanceObserver(list => {
        for (const entry of list.getEntries() as Shift[]) {
          if (!entry.hadRecentInput) shifts.push({
            value: entry.value,
            sources: entry.sources.map(source => ({
              href: source.node instanceof Element ? source.node.closest('a')?.getAttribute('href') : null,
              previous: source.previousRect.toJSON(), current: source.currentRect.toJSON(),
            })),
          })
        }
      }).observe({ type: 'layout-shift', buffered: true })
      Object.defineProperty(window, '__fontShifts', { value: shifts })
    })
    const geometry = () => page.locator('section[aria-labelledby="hero-title"] a.button-light, section[aria-labelledby="hero-title"] a.control').evaluateAll(links =>
      links.map(link => {
        const rect = link.getBoundingClientRect()
        return { href: link.getAttribute('href'), x: rect.x, y: rect.y, width: rect.width, height: rect.height }
      }))
    try {
      await page.goto('/', { waitUntil: 'domcontentloaded' })
      await expect.poll(() => requests.size).toBeGreaterThanOrEqual(4)
      // Wait for real fallback paint and finished intro motion, not a timed sleep.
      await page.waitForFunction(() =>
        performance.getEntriesByName('first-contentful-paint').length > 0 &&
        document.fonts.status === 'loading' &&
        document.getAnimations().every(animation => animation.playState === 'finished'))
      await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))))
      expect(await page.evaluate(() => document.fonts.check('500 13px Kanit'))).toBe(false)
      const fallback = await geometry()
      releaseFonts()
      await page.evaluate(async () => {
        await document.fonts.ready
        await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
      })
      const loaded = await geometry()
      const shifts = await page.evaluate(() => (window as unknown as { __fontShifts: Array<{ value: number }> }).__fontShifts)
      const cls = shifts.reduce((total, shift) => total + shift.value, 0)
      console.log(JSON.stringify({ width, cls, fallback, loaded }))
      expect(await page.evaluate(() => document.fonts.check('500 13px Kanit'))).toBe(true)
      expect(fallback.map(link => link.href)).toEqual(['#projects', '#contact'])
      expect(loaded.every(link => link.height >= 44 && link.x >= 20 && link.x + link.width <= width - 20)).toBe(true)
      expect.soft(cls, JSON.stringify({ requests: [...requests], shifts })).toBeLessThanOrEqual(0.1)
      // Font metrics may change widths, but must not change the CTA row arrangement.
      expect(Math.abs((loaded[1].y - loaded[0].y) - (fallback[1].y - fallback[0].y))).toBeLessThanOrEqual(1)
    } finally {
      releaseFonts()
      await page.unrouteAll({ behavior: 'wait' })
    }
  })
}

test('@performance landing keeps a bounded first-party document', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium')
  await page.goto('/', { waitUntil: 'load' })
  const report = await page.evaluate(async () => {
    await document.fonts.ready
    const navigation = performance.getEntriesByType('navigation') as PerformanceNavigationTiming[]
    const resources = performance.getEntriesByType('resource') as PerformanceResourceTiming[]
    return {
      elements: document.querySelectorAll('*').length,
      images: document.images.length,
      thirdParty: resources.map(entry => entry.name).filter(name => new URL(name).origin !== location.origin),
      transfer: [...navigation, ...resources].reduce((total, entry) => total + (entry.transferSize || 0), 0),
    }
  })
  expect(report.elements).toBeLessThan(700)
  expect(report.images).toBe(0)
  expect(report.thirdParty).toEqual([])
  expect(report.transfer).toBeLessThan(750 * 1024)
})

test('@performance landing layout shift attribution', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-375'].includes(info.project.name))
  await page.addInitScript(() => {
    type ShiftSource = { node?: Node; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }
    type ShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean; sources: ShiftSource[] }
    const shifts: Array<{ value: number; timestamp: number; sources: object[] }> = []
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as ShiftEntry[]) {
        if (entry.hadRecentInput) continue
        shifts.push({
          value: entry.value,
          timestamp: entry.startTime,
          sources: entry.sources.map(source => ({
            node: source.node instanceof Element ? source.node.tagName.toLowerCase() : null,
            previousRect: source.previousRect.toJSON(),
            currentRect: source.currentRect.toJSON(),
          })),
        })
      }
    }).observe({ type: 'layout-shift', buffered: true })
    Object.defineProperty(window, '__layoutShifts', { value: shifts })
  })
  await page.goto('/', { waitUntil: 'load' })
  await page.evaluate(async () => {
    await document.fonts.ready
    await new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))
  })
  const report = await page.evaluate(() => ({
    viewport: { width: innerWidth, height: innerHeight },
    fontStatus: document.fonts.status,
    shifts: (window as unknown as { __layoutShifts: Array<{ value: number }> }).__layoutShifts,
  }))
  await info.attach('layout-shift-attribution.json', {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  })
  expect(report.fontStatus).toBe('loaded')
  expect(report.shifts.reduce((total, shift) => total + shift.value, 0)).toBeLessThanOrEqual(0.1)
})
