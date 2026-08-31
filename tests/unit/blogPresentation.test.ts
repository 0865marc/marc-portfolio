import { describe, expect, it } from 'vitest'
import type { BlogPost } from '../../src/data/blog'
import { PROFILE_SOURCE_ID } from '../../src/data/portfolio'
import { getLandingBlogPosts } from '../../src/lib/blogPresentation'

const post = (id: string): BlogPost => ({
  id,
  category: 'Pruebas',
  tags: [],
  title: id,
  excerpt: 'Extracto.',
  publishedAt: '2026-08-01',
  sourceId: PROFILE_SOURCE_ID,
  introduction: ['Introducción.'],
  sections: [{ heading: 'Sección', paragraphs: ['Párrafo.'] }],
  takeaway: ['Cierre.'],
})

describe('landing blog presentation', () => {
  it('keeps the first three posts in their published order', () => {
    expect(getLandingBlogPosts(['one', 'two', 'three', 'four'].map(post)).map(article => article.id))
      .toEqual(['one', 'two', 'three'])
  })

  it('returns an empty selection without inventing content', () => {
    expect(getLandingBlogPosts([])).toEqual([])
  })
})
