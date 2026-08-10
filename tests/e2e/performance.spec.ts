import { test, expect } from '@playwright/test'

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
