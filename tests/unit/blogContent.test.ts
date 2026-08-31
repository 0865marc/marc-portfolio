import { describe, expect, it } from 'vitest'
import { buildPublishedBlogPosts } from '../../src/data/blog'

const tag = (id: string, label = id) => ({ id, label })
const post = (overrides: Record<string, unknown> = {}) => ({
  id: 'article',
  status: 'published',
  position: 1,
  category: 'Pruebas',
  tags: ['tag'],
  title: 'Artículo de prueba',
  excerpt: 'Extracto de prueba.',
  publishedAt: '2026-08-01',
  introduction: ['Introducción de prueba.'],
  sections: [{ heading: 'Sección de prueba', paragraphs: ['Párrafo de prueba.'] }],
  takeaway: ['Conclusión de prueba.'],
  ...overrides,
})

describe('blog content adapter', () => {
  it('publishes only published posts in ascending position order', () => {
    const posts = buildPublishedBlogPosts({
      tags: [tag('tag', 'Etiqueta visible')],
      posts: [
        post({ id: 'published-second', position: 20 }),
        post({ id: 'draft-first', status: 'draft', position: 10 }),
        post({ id: 'deleted-third', status: 'deleted', position: 30 }),
        post({ id: 'published-first', position: 15 }),
      ],
    })

    expect(posts.map(article => article.id)).toEqual(['published-first', 'published-second'])
  })

  it('accepts a collection with only drafts and deleted posts', () => {
    const posts = buildPublishedBlogPosts({
      tags: [tag('tag')],
      posts: [
        post({ id: 'draft-article', status: 'draft', position: 1 }),
        post({ id: 'deleted-article', status: 'deleted', position: 2 }),
      ],
    })

    expect(posts).toEqual([])
  })

  it('resolves stable tag IDs to their current visible labels', () => {
    const [article] = buildPublishedBlogPosts({
      tags: [tag('revision-editorial', 'Edición revisada')],
      posts: [post({ tags: ['revision-editorial'] })],
    })

    expect(article.tags).toEqual(['Edición revisada'])
  })

  it.each([
    {
      label: 'an invalid post ID',
      content: { tags: [tag('tag')], posts: [post({ id: 'ID inválido' })] },
      error: /posts\[0\]\.id/,
    },
    {
      label: 'a duplicate post ID',
      content: { tags: [tag('tag')], posts: [post(), post({ position: 2 })] },
      error: /duplicate ID/,
    },
    {
      label: 'a duplicate position',
      content: { tags: [tag('tag')], posts: [post(), post({ id: 'other-article' })] },
      error: /duplicate position/,
    },
    {
      label: 'an unknown tag reference',
      content: { tags: [tag('tag')], posts: [post({ tags: ['missing-tag'] })] },
      error: /unknown tag/,
    },
    {
      label: 'an invalid status',
      content: { tags: [tag('tag')], posts: [post({ status: 'review' })] },
      error: /must be one of/,
    },
  ])('rejects $label', ({ content, error }) => {
    expect(() => buildPublishedBlogPosts(content)).toThrow(error)
  })
})
