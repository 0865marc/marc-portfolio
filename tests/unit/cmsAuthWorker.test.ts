import cmsAuthWorker, { createCmsAuthWorker } from '../../ops/cms-auth/src/index.js'
import { describe, expect, it } from 'vitest'

const createAuthenticator = (capture: { request?: Request }, response = new Response('token')) => ({
  fetch: async (request: Request) => {
    capture.request = request
    return response
  },
})

describe('CMS auth worker wrapper', () => {
  it('requests exactly public_repo for GitHub authorization', async () => {
    const capture: { request?: Request } = {}
    const worker = createCmsAuthWorker(createAuthenticator(capture))

    await worker.fetch(new Request('https://cms-auth.portfolio.mybrawl.io/auth?provider=github&scope=public_repo,user'), {})

    const url = new URL(capture.request!.url)
    expect(url.searchParams.get('scope')).toBe('public_repo')
    expect(url.searchParams.get('scope')).not.toContain('user')
  })

  it.each([
    { label: 'another GitHub scope', requestURL: 'https://cms-auth.portfolio.mybrawl.io/auth?provider=github&scope=repo,user', scope: 'repo,user' },
    { label: 'a GitHub authorization without scope', requestURL: 'https://cms-auth.portfolio.mybrawl.io/auth?provider=github', scope: null },
    { label: 'a GitHub callback', requestURL: 'https://cms-auth.portfolio.mybrawl.io/callback?provider=github&scope=public_repo,user', scope: 'public_repo,user' },
  ])('leaves $label unchanged', async ({ requestURL, scope }) => {
    const capture: { request?: Request } = {}
    const worker = createCmsAuthWorker(createAuthenticator(capture))

    await worker.fetch(new Request(requestURL), {})

    expect(new URL(capture.request!.url).searchParams.get('scope')).toBe(scope)
  })

  it('redirects the official GitHub authorization flow with no user scope', async () => {
    const response = await cmsAuthWorker.fetch(
      new Request('https://cms-auth.portfolio.mybrawl.io/auth?provider=github&site_id=portfolio.mybrawl.io&scope=public_repo,user'),
      {
        ALLOWED_DOMAINS: 'portfolio.mybrawl.io',
        GITHUB_CLIENT_ID: 'test-client',
        GITHUB_CLIENT_SECRET: 'test-secret',
      },
    )
    const authorization = new URL(response.headers.get('Location')!)

    expect(response.status).toBe(302)
    expect(authorization.origin).toBe('https://github.com')
    expect(authorization.searchParams.get('scope')).toBe('public_repo')
    expect(authorization.searchParams.get('scope')).not.toContain('user')
  })

  it('does not alter non-GitHub authorization requests', async () => {
    const capture: { request?: Request } = {}
    const worker = createCmsAuthWorker(createAuthenticator(capture))

    await worker.fetch(new Request('https://cms-auth.portfolio.mybrawl.io/auth?provider=gitlab&scope=api'), {})

    expect(new URL(capture.request!.url).searchParams.get('scope')).toBe('api')
  })

  it('marks delegated authentication responses as non-cacheable and no-referrer', async () => {
    const capture: { request?: Request } = {}
    const worker = createCmsAuthWorker(createAuthenticator(capture, new Response('token', {
      headers: { 'Set-Cookie': 'csrf-token=token' },
    })))

    const response = await worker.fetch(new Request('https://cms-auth.portfolio.mybrawl.io/callback?code=token&state=state'), {})

    expect(await response.text()).toBe('token')
    expect(response.headers.get('Cache-Control')).toBe('no-store')
    expect(response.headers.get('Pragma')).toBe('no-cache')
    expect(response.headers.get('Referrer-Policy')).toBe('no-referrer')
    expect(response.headers.get('Set-Cookie')).toBe('csrf-token=token')
  })
})
