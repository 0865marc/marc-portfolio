import { describe, expect, it } from 'vitest'
import { blogPosts } from '../../src/data/blog'
import { filterBlogPosts, getBlogTags, normalizeBlogSearch } from '../../src/lib/blogFilters'
describe('blog filters', () => {
  it('normalizes Spanish casing, whitespace, and diacritics', () => expect(normalizeBlogSearch('  LATÉNCIA  ')).toBe('latencia'))
  it('requires all terms', () => expect(filterBlogPosts(blogPosts, 'infraestructura resiliencia', null).map(p => p.id)).toEqual(['infraestructura-distribuida-latencia']))
  it('combines exact tags and query', () => { expect(filterBlogPosts(blogPosts, 'procesos', 'Celery').map(p => p.id)).toEqual(['rabbitmq-celery-procesos-pesados']); expect(filterBlogPosts(blogPosts, '', 'celer')).toEqual([]) })
  it('returns sorted unique tags', () => { const tags = getBlogTags([...blogPosts, {...blogPosts[0], tags: ['IoT', '']}]); expect(tags.filter(t => t === 'IoT')).toHaveLength(1); expect(tags).toEqual([...tags].sort((a,b) => a.localeCompare(b, 'es', {sensitivity:'base'}))) })
})
