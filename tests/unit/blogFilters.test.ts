import { describe, expect, it } from 'vitest'
import { blogPosts } from '../../src/data/blog'
import { filterBlogPosts, getBlogTags, normalizeBlogSearch } from '../../src/lib/blogFilters'
describe('blog filters', () => {
  it('normalizes Spanish casing, whitespace, and diacritics', () => {
    const normalized = normalizeBlogSearch('  LATÉNCIA  ')
    expect(normalized).toBe('latencia')
  })

  it('requires all terms', () => {
    const matches = filterBlogPosts(blogPosts, 'portfolio privacidad', null)
    expect(matches.map(post => post.id)).toEqual(['lo-que-decidi-no-contar-en-este-portfolio'])
  })

  it('combines exact tags and query', () => {
    const matchingTag = filterBlogPosts(blogPosts, 'portfolio', 'Privacidad')
    const missingTag = filterBlogPosts(blogPosts, '', 'Code')
    expect(matchingTag.map(post => post.id)).toEqual(['lo-que-decidi-no-contar-en-este-portfolio'])
    expect(missingTag).toEqual([])
  })

  it('returns sorted unique tags', () => {
    const tags = getBlogTags([...blogPosts, { ...blogPosts[0], tags: ['Privacidad', ''] }])
    const sortedTags = [...tags].sort((left, right) => left.localeCompare(right, 'es', { sensitivity: 'base' }))
    expect(tags.filter(tag => tag === 'Privacidad')).toHaveLength(1)
    expect(tags).toEqual(sortedTags)
  })
})
