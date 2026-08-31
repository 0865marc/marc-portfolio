import { describe, expect, it } from 'vitest'
import { blogPosts } from '../../src/data/blog'
import { blogPostHref } from '../../src/lib/blogRoutes'

describe('blog routes', () => {
  it('builds encoded canonical URLs for both current posts', () => {
    expect(blogPostHref('á/b', 'landing')).toBe('/blog/%C3%A1%2Fb/?from=landing')
    expect(blogPostHref(blogPosts[0].id)).toBe('/blog/entorno-reproducible/?from=index')
    expect(blogPostHref(blogPosts[1].id, 'landing')).toBe('/blog/lo-que-decidi-no-contar-en-este-portfolio/?from=landing')
  })
})
