import { defineConfig, devices } from '@playwright/test'

const port = 4323
const baseURL = `http://127.0.0.1:${port}`
// Use full Chromium's headless mode: headless shell stalls cross-document view transitions.
// https://playwright.dev/docs/browsers#chromium-new-headless-mode
const chromium = { ...devices['Desktop Chrome'], channel: 'chromium' }

export default defineConfig({
  testDir: 'tests/e2e',
  timeout: 60_000,
  workers: 4,
  webServer: {
    command: `npm run preview -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
  },
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...chromium } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'chromium-mobile-320', use: { ...chromium, viewport: { width: 320, height: 800 } } },
    { name: 'chromium-mobile-375', use: { ...chromium, viewport: { width: 375, height: 812 } } },
    { name: 'chromium-768', use: { ...chromium, viewport: { width: 768, height: 900 } } },
    { name: 'chromium-1024', use: { ...chromium, viewport: { width: 1024, height: 900 } } },
    { name: 'chromium-1440', use: { ...chromium, viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-js-off', use: { ...chromium, javaScriptEnabled: false } },
    { name: 'chromium-reduced-motion', use: { ...chromium } },
  ],
})
