import { describe, expect, it } from 'vitest'
import { blogPosts } from '../../src/data/blog'
import { filterBlogPosts, getBlogTags, normalizeBlogSearch } from '../../src/lib/blogFilters'
describe('blog filters', () => {
  it('normalizes Spanish casing, whitespace, and diacritics', () => expect(normalizeBlogSearch('  LATÉNCIA  ')).toBe('latencia'))
  it('requires all terms', () => expect(filterBlogPosts(blogPosts, 'autonomía supervisión', null).map(p => p.id)).toEqual(['hermes-agent-hetzner-instalacion-segura']))
  it('combines exact tags and query', () => { expect(filterBlogPosts(blogPosts, 'autonomía', 'Codex').map(p => p.id)).toEqual(['hermes-agent-hetzner-instalacion-segura']); expect(filterBlogPosts(blogPosts, '', 'Code')).toEqual([]) })
  it('returns sorted unique tags', () => { const tags = getBlogTags([...blogPosts, {...blogPosts[0], tags: ['Hermes', '']}]); expect(tags.filter(t => t === 'Hermes')).toHaveLength(1); expect(tags).toEqual([...tags].sort((a,b) => a.localeCompare(b, 'es', {sensitivity:'base'}))) })
})
