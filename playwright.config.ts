import { defineConfig, devices } from '@playwright/test'

const port = 4323
const baseURL = `http://127.0.0.1:${port}`

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
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
    { name: 'chromium-mobile-320', use: { ...devices['Desktop Chrome'], viewport: { width: 320, height: 800 } } },
    { name: 'chromium-mobile-375', use: { ...devices['Desktop Chrome'], viewport: { width: 375, height: 812 } } },
    { name: 'chromium-768', use: { ...devices['Desktop Chrome'], viewport: { width: 768, height: 900 } } },
    { name: 'chromium-1024', use: { ...devices['Desktop Chrome'], viewport: { width: 1024, height: 900 } } },
    { name: 'chromium-1440', use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 1000 } } },
    { name: 'chromium-js-off', use: { ...devices['Desktop Chrome'], javaScriptEnabled: false } },
    { name: 'chromium-reduced-motion', use: { ...devices['Desktop Chrome'] } },
  ],
})
