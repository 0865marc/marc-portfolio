import { test, expect } from '@playwright/test'

test('@performance filter interaction is a lab INP proxy under 200ms', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium')
  await page.goto('/blog/')
  const start = await page.evaluate(() => performance.now())
  await page.locator('[data-blog-search]').fill('latencia')
  await expect(page.locator('[data-blog-card]:visible')).toHaveCount(1)
  const duration = await page.evaluate(startTime => performance.now() - startTime, start)
  expect(duration).toBeLessThan(200)
})

test('@performance landing layout shift attribution', async ({ page }, info) => {
  test.skip(!['chromium', 'chromium-mobile-375'].includes(info.project.name))
  await page.addInitScript(() => {
    type ShiftSource = { node?: Node; previousRect: DOMRectReadOnly; currentRect: DOMRectReadOnly }
    type ShiftEntry = PerformanceEntry & { value: number; hadRecentInput: boolean; sources: ShiftSource[] }
    const selector = (node?: Node) => {
      if (!(node instanceof Element)) return null
      if (node.id) return `#${CSS.escape(node.id)}`
      const marker = [...node.attributes].find(attribute => attribute.name.startsWith('data-'))
      return marker ? `${node.tagName.toLowerCase()}[${marker.name}]` : node.tagName.toLowerCase()
    }
    const shifts: object[] = []
    new PerformanceObserver(list => {
      for (const entry of list.getEntries() as ShiftEntry[]) {
        if (entry.hadRecentInput) continue
        shifts.push({
          value: entry.value,
          timestamp: entry.startTime,
          fontReady: document.fonts.status,
          sources: entry.sources.map(source => ({
            selector: selector(source.node),
            previousRect: source.previousRect.toJSON(),
            currentRect: source.currentRect.toJSON(),
            image: source.node instanceof HTMLImageElement ? {
              complete: source.node.complete,
              naturalWidth: source.node.naturalWidth,
              naturalHeight: source.node.naturalHeight,
              renderedWidth: source.node.getBoundingClientRect().width,
              renderedHeight: source.node.getBoundingClientRect().height,
            } : null,
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
    images: [...document.images].map(image => ({
      src: image.currentSrc || image.src,
      complete: image.complete,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: image.getBoundingClientRect().width,
      renderedHeight: image.getBoundingClientRect().height,
    })),
    shifts: (window as unknown as { __layoutShifts: object[] }).__layoutShifts,
  }))
  await info.attach('layout-shift-attribution.json', {
    body: JSON.stringify(report, null, 2),
    contentType: 'application/json',
  })
  if (process.env.LAYOUT_SHIFT_DIAGNOSTICS === '1') console.log(JSON.stringify(report, null, 2))
  expect(report.fontStatus).toBe('loaded')
})
