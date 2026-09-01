import officialAuthenticator from '../vendor/sveltia-cms-auth/src/index.js'

const isGitHubAuthorization = (request) => {
  const url = new URL(request.url)
  return request.method === 'GET'
    && (url.pathname === '/auth' || url.pathname === '/oauth/authorize')
    && url.searchParams.get('provider') === 'github'
    && url.searchParams.get('scope') === 'public_repo,user'
}

const normalizeGitHubScope = (request) => {
  const url = new URL(request.url)
  url.searchParams.set('scope', 'public_repo')
  return new Request(url, request)
}

const protectAuthenticationResponse = (response) => {
  const headers = new Headers(response.headers)
  headers.set('Cache-Control', 'no-store')
  headers.set('Pragma', 'no-cache')
  headers.set('Referrer-Policy', 'no-referrer')
  return new Response(response.body, { status: response.status, statusText: response.statusText, headers })
}

export const createCmsAuthWorker = (authenticator = officialAuthenticator) => ({
  async fetch(request, env, context) {
    const response = await authenticator.fetch(
      isGitHubAuthorization(request) ? normalizeGitHubScope(request) : request,
      env,
      context,
    )
    return protectAuthenticationResponse(response)
  },
})

export default createCmsAuthWorker()
