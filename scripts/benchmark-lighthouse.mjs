import lighthouse from 'lighthouse'
import { launch } from 'chrome-launcher'
import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const values = process.argv.slice(2)
const option = (name, fallback) => {
  const index = values.indexOf(`--${name}`)
  return index < 0 ? fallback : values[index + 1]
}
const runs = Number(option('runs', '5'))
const routes = option('routes', '/,/blog/').split(',').filter(Boolean)
const outputDirectory = resolve(option('output', 'lighthouse-results'))
const targets = [['baseline', option('baseline')], ['candidate', option('candidate')]].filter(([, url]) => url)
const targetRoutes = {
  baseline: option('baseline-routes', routes.join(',')).split(',').filter(Boolean),
  candidate: option('candidate-routes', routes.join(',')).split(',').filter(Boolean),
}
if (targets.length === 2 && targetRoutes.baseline.length !== targetRoutes.candidate.length) throw new Error('Baseline and candidate route lists must have equal lengths')
if (!targets.length || !Number.isInteger(runs) || runs < 1) {
  throw new Error('Usage: npm run benchmark:lighthouse -- --baseline URL --candidate URL [--runs 5] [--routes /,/blog/]')
}

const chromePath = process.env.CHROME_PATH
const median = numbers => [...numbers].sort((a, b) => a - b)[Math.floor(numbers.length / 2)]
const round = number => Math.round(number * 1000) / 1000
const modes = [
  { name: 'first-party', blockedUrlPatterns: ['https://*/*'] },
  { name: 'full-media', blockedUrlPatterns: [] },
]

await mkdir(outputDirectory, { recursive: true })
const chrome = await launch({
  chromePath,
  chromeFlags: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage', '--disable-gpu'],
})
const records = []
try {
  for (const [target, base] of targets) {
    for (const [routeIndex, route] of targetRoutes[target].entries()) {
      for (const mode of modes) {
        for (let run = 1; run <= runs; run += 1) {
          const url = new URL(route, base).href
          const result = await lighthouse(url, {
            port: chrome.port,
            output: 'json',
            logLevel: 'error',
            onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
            blockedUrlPatterns: mode.blockedUrlPatterns,
            formFactor: 'mobile',
            screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2, disabled: false },
            throttlingMethod: 'simulate',
          })
          if (!result) throw new Error(`Lighthouse returned no result for ${url}`)
          const lhr = result.lhr
          if (lhr.runtimeError) throw new Error(`${lhr.runtimeError.code}: ${lhr.runtimeError.message}`)
          const requests = lhr.audits['network-requests']?.details?.items ?? []
          const origin = new URL(base).origin
          const transfer = requests.reduce((sum, request) => {
            const key = new URL(request.url).origin === origin ? 'firstParty' : 'thirdParty'
            sum[key] += request.transferSize ?? 0
            return sum
          }, { firstParty: 0, thirdParty: 0 })
          const layoutShifts = (lhr.audits['layout-shifts']?.details?.items ?? []).map(item => ({
            score: item.score ?? 0,
            selector: item.node?.selector ?? null,
            label: item.node?.nodeLabel ?? null,
            causes: (item.subItems?.items ?? []).map(cause => ({
              cause: cause.cause ?? null,
              url: cause.extra?.value ?? null,
            })),
          }))
          const failedRemoteRequests = requests
            .filter(request => new URL(request.url).origin !== origin && (!request.statusCode || request.statusCode >= 400))
            .map(request => ({ url: request.url, statusCode: request.statusCode ?? 0 }))
          const record = {
            target, route, routeIndex, mode: mode.name, run, url,
            categories: Object.fromEntries(Object.entries(lhr.categories).map(([key, category]) => [key, round(category.score * 100)])),
            lcpMs: round(lhr.audits['largest-contentful-paint'].numericValue),
            cls: round(lhr.audits['cumulative-layout-shift'].numericValue),
            transfer, layoutShifts, failedRemoteRequests,
            runtimeError: lhr.runtimeError ?? null,
          }
          records.push(record)
          await writeFile(`${outputDirectory}/${target}-${route.replaceAll('/', '_') || 'root'}-${mode.name}-${run}.json`, result.report)
          process.stdout.write(`${target} ${route} ${mode.name} ${run}/${runs}: ${JSON.stringify(record)}\n`)
        }
      }
    }
  }
} finally {
  await chrome.kill()
}

const groups = []
for (const [target] of targets) for (const [routeIndex, route] of targetRoutes[target].entries()) for (const mode of modes) {
  const selected = records.filter(record => record.target === target && record.routeIndex === routeIndex && record.mode === mode.name)
  groups.push({
    target, route, routeIndex, mode: mode.name,
    medians: {
      performance: median(selected.map(value => value.categories.performance)),
      accessibility: median(selected.map(value => value.categories.accessibility)),
      bestPractices: median(selected.map(value => value.categories['best-practices'])),
      seo: median(selected.map(value => value.categories.seo)),
      lcpMs: median(selected.map(value => value.lcpMs)), cls: median(selected.map(value => value.cls)),
      firstPartyTransfer: median(selected.map(value => value.transfer.firstParty)),
      thirdPartyTransfer: median(selected.map(value => value.transfer.thirdParty)),
    },
  })
}
const failures = []
for (const candidate of groups.filter(group => group.target === 'candidate')) {
  const baseline = groups.find(group => group.target === 'baseline' && group.routeIndex === candidate.routeIndex && group.mode === candidate.mode)
  const value = candidate.medians
  if (candidate.mode === 'full-media') {
    if (candidate.routeIndex === 0 && value.cls > .1) failures.push(`${candidate.route} ${candidate.mode}: CLS ${value.cls} > 0.10`)
    continue
  }
  if (value.lcpMs > 2500) failures.push(`${candidate.route} ${candidate.mode}: LCP ${value.lcpMs}ms > 2500ms`)
  if (value.cls > .1) failures.push(`${candidate.route} ${candidate.mode}: CLS ${value.cls} > 0.10`)
  for (const category of ['accessibility', 'bestPractices', 'seo']) if (value[category] < 95) failures.push(`${candidate.route} ${candidate.mode}: ${category} ${value[category]} < 95`)
  if (value.performance < 90 && baseline && value.performance < baseline.medians.performance + 10) failures.push(`${candidate.route} ${candidate.mode}: performance ${value.performance} neither >=90 nor +10`)
  if (baseline && value.cls - baseline.medians.cls > .02) failures.push(`${candidate.route} ${candidate.mode}: CLS regression > 0.02`)
  if (baseline?.medians.lcpMs > 2000 && value.lcpMs > baseline.medians.lcpMs * .8) failures.push(`${candidate.route} ${candidate.mode}: LCP improvement <20%`)
  if (baseline) for (const category of ['accessibility', 'bestPractices', 'seo']) if (value[category] < baseline.medians[category]) failures.push(`${candidate.route} ${candidate.mode}: ${category} regressed`)
}
const summary = { lighthouseVersion: '12.8.2', runs, targetRoutes, chromePath: chromePath ?? 'auto-detected', records, groups, failures }
await writeFile(`${outputDirectory}/summary.json`, JSON.stringify(summary, null, 2))
console.log(JSON.stringify({ groups, failures }, null, 2))
if (failures.length) process.exitCode = 1
