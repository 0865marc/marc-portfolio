import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { buildSync } from 'esbuild'
import { test, expect } from '@playwright/test'

const fixture = readFileSync(join(process.cwd(), 'tests/fixtures/blog-filters.fixture.html'), 'utf8')
const compiledFilterScript = buildSync({
  entryPoints: [join(process.cwd(), 'src/scripts/blogFilters.ts')],
  bundle: true,
  format: 'iife',
  platform: 'browser',
  target: 'es2022',
  write: false,
}).outputFiles[0].text

test('compiled public blog filter script updates visibility, status and accessible controls', async ({ page }, info) => {
  test.skip(info.project.name !== 'chromium')
  await page.setContent(fixture)
  await page.addScriptTag({ content: compiledFilterScript })

  const input = page.locator('[data-blog-search]')
  const status = page.locator('[data-blog-status]')
  const clear = page.locator('[data-blog-clear]')
  const empty = page.locator('[data-blog-empty]')

  await input.focus()
  await expect(input).toBeFocused()
  await input.fill('sin coincidencias')
  await expect(status).toHaveText('Mostrando 0 de 4 artículos.')
  await expect(page.locator('[data-blog-card][hidden]')).toHaveCount(4)
  await expect(empty).toBeVisible()
  await expect(clear).toBeEnabled()

  await page.locator('[data-blog-empty-clear]').click()
  await expect(input).toHaveValue('')
  await expect(status).toHaveText('4 artículos disponibles.')
  await expect(page.locator('[data-blog-card][hidden]')).toHaveCount(0)
  await expect(empty).toBeHidden()
  await expect(clear).toBeDisabled()

  const aws = page.locator('[data-blog-tag="AWS"]')
  await aws.focus()
  await expect(aws).toBeFocused()
  await aws.click()
  await expect(aws).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('[data-blog-tag=""]')).toHaveAttribute('aria-pressed', 'false')
  await expect(status).toHaveText('Mostrando 2 de 4 artículos.')
  await expect(page.locator('[data-blog-card][hidden]')).toHaveCount(2)

  await clear.click()
  await expect(clear).toBeFocused()
  await expect(clear).toBeDisabled()
  await expect(status).toHaveText('4 artículos disponibles.')
  await expect(page.locator('[data-blog-card][hidden]')).toHaveCount(0)
})
