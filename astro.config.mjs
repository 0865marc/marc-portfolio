import { defineConfig } from 'astro/config'
export default defineConfig({ site: 'https://portfolio.mybrawl.io', output: 'static', trailingSlash: 'always', build: { format: 'directory', assets: 'assets' } })
