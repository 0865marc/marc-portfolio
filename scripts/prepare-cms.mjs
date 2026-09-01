import { copyFile, mkdir, readFile, writeFile } from 'node:fs/promises'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const cmsDirectory = resolve(root, 'node_modules/@sveltia/cms')
const adminDirectory = resolve(root, 'public/admin')
const localesDirectory = resolve(adminDirectory, 'locales')
const fontsDirectory = resolve(adminDirectory, 'fonts')
const bundleSource = resolve(cmsDirectory, 'dist/sveltia-cms.js')
const bundleDestination = resolve(adminDirectory, 'sveltia-cms.js')
const fontURLs = {
  'https://cdn.jsdelivr.net/fontsource/fonts/source-sans-3:vf@5.3.0/latin-wght-normal.woff2': '/admin/fonts/source-sans-3-latin-wght-normal.woff2',
  'https://cdn.jsdelivr.net/fontsource/fonts/noto-mono@5.3.0/latin-400-normal.woff2': '/admin/fonts/noto-mono-latin-400-normal.woff2',
  'https://cdn.jsdelivr.net/fontsource/fonts/material-symbols-outlined:vf@5.3.1/latin-wght-normal.woff2': '/admin/fonts/material-symbols-outlined-latin-wght-normal.woff2',
}

let bundle = await readFile(bundleSource, 'utf8')
for (const [remoteURL, localURL] of Object.entries(fontURLs)) {
  if (!bundle.includes(remoteURL)) throw new Error(`Missing expected CMS font URL: ${remoteURL}`)
  bundle = bundle.replaceAll(remoteURL, localURL)
}

await Promise.all([mkdir(localesDirectory, { recursive: true }), mkdir(fontsDirectory, { recursive: true })])
await Promise.all([
  writeFile(bundleDestination, bundle),
  copyFile(resolve(cmsDirectory, 'locales/es-CO.json'), resolve(localesDirectory, 'es-CO.json')),
  copyFile(resolve(cmsDirectory, 'locales/es-CO.json'), resolve(localesDirectory, 'es.json')),
  copyFile(resolve(cmsDirectory, 'package.json'), resolve(adminDirectory, 'sveltia-cms-package.json')),
  copyFile(resolve(root, 'node_modules/@fontsource-variable/source-sans-3/files/source-sans-3-latin-wght-normal.woff2'), resolve(fontsDirectory, 'source-sans-3-latin-wght-normal.woff2')),
  copyFile(resolve(root, 'node_modules/@fontsource/noto-mono/files/noto-mono-latin-400-normal.woff2'), resolve(fontsDirectory, 'noto-mono-latin-400-normal.woff2')),
  copyFile(resolve(root, 'node_modules/@fontsource-variable/material-symbols-outlined/files/material-symbols-outlined-latin-wght-normal.woff2'), resolve(fontsDirectory, 'material-symbols-outlined-latin-wght-normal.woff2')),
])
