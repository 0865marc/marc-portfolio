import { describe, expect, it } from 'vitest'
import { blogPostHref, legacyHashTarget } from '../../src/lib/blogRoutes'
describe('blog routes', () => {
  it('builds encoded canonical URLs', () => expect(blogPostHref('á/b','landing')).toBe('/blog/%C3%A1%2Fb/?from=landing'))
  it('maps legacy routes', () => { expect(legacyHashTarget('#/blog')).toBe('/blog/'); expect(legacyHashTarget('#/blog/demo?from=landing')).toBe('/blog/demo/?from=landing'); expect(legacyHashTarget('#/blog/demo?from=x')).toBe('/blog/demo/?from=index') })
  it('leaves anchors and unknown routes safe', () => { expect(legacyHashTarget('#blog')).toBeNull(); expect(legacyHashTarget('#/unknown')).toBeNull() })
  it('maps missing or malformed IDs to missing route', () => { expect(legacyHashTarget('#/blog/')).toContain('articulo-no-encontrado'); expect(legacyHashTarget('#/blog/%E0%A4%A')).toContain('articulo-no-encontrado') })
})
