import { extname, normalize, resolve, sep } from 'node:path'
import { defineConfig } from 'astro/config'

const watchedContentDirectories = ['content/daily', 'content/weeks', 'content/tags']

const isWatchedContentFile = (file, root) => {
  const normalizedFile = normalize(resolve(root, file))
  if (extname(normalizedFile) !== '.json') return false
  return watchedContentDirectories.some(directory => normalizedFile.startsWith(`${normalize(resolve(root, directory))}${sep}`))
}

const adminDirectoryRedirect = {
  name: 'admin-directory-redirect',
  apply: 'serve',
  handleHotUpdate({ file, server }) {
    if (isWatchedContentFile(file, server.config.root)) return []
  },
  configureServer(server) {
    server.middlewares.use((request, response, next) => {
      const requestUrl = new URL(request.url ?? '/', 'http://127.0.0.1')
      if (requestUrl.pathname !== '/admin/') {
        next()
        return
      }

      response.statusCode = 302
      response.setHeader('Location', `/admin/index.html${requestUrl.search}`)
      response.setHeader('Cache-Control', 'no-store')
      response.end()
    })

    const challengeModulePath = normalize(resolve(server.config.root, 'src/data/challenge.ts'))
    const watchedRoots = watchedContentDirectories.map(directory => `${normalize(resolve(server.config.root, directory))}${sep}`)
    const pendingFiles = new Set()
    let debounceTimer

    const invalidateChallengeAdapter = () => {
      const ssrEnvironment = server.environments?.ssr
      if (!ssrEnvironment) return false

      ssrEnvironment.moduleGraph.getModulesByFile(challengeModulePath)?.forEach(module => {
        ssrEnvironment.moduleGraph.invalidateModule(module)
      })

      const runner = 'runner' in ssrEnvironment ? ssrEnvironment.runner : undefined
      runner?.evaluatedModules.getModulesByFile(challengeModulePath)?.forEach(module => {
        runner.evaluatedModules.invalidateModule(module)
      })
      return true
    }

    const flushContentUpdate = () => {
      debounceTimer = undefined
      const files = [...pendingFiles]
      pendingFiles.clear()
      if (!invalidateChallengeAdapter()) return
      server.hot.send({ type: 'custom', event: 'career-content-updated', data: { files } })
    }

    const onContentEvent = file => {
      const normalizedFile = normalize(resolve(server.config.root, file))
      if (extname(normalizedFile) !== '.json' || !watchedRoots.some(root => normalizedFile.startsWith(root))) return
      pendingFiles.add(normalizedFile)
      clearTimeout(debounceTimer)
      debounceTimer = setTimeout(flushContentUpdate, 100)
    }

    server.watcher.on('add', onContentEvent)
    server.watcher.on('change', onContentEvent)
    server.watcher.on('unlink', onContentEvent)
  },
}

export default defineConfig({
  site: 'https://portfolio.mybrawl.io',
  output: 'static',
  trailingSlash: 'always',
  build: { format: 'directory', assets: 'assets' },
  vite: { plugins: [adminDirectoryRedirect] },
})
