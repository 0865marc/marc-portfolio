import type { BlogPost } from '../data/blog'

export function normalizeBlogSearch(value: string) {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLocaleLowerCase('es')
    .trim()
}

export function getBlogTags(posts: BlogPost[]) {
  return Array.from(new Set(posts.flatMap((post) => post.tags).filter((tag) => tag.trim().length > 0))).sort(
    (first, second) => first.localeCompare(second, 'es', { sensitivity: 'base' }),
  )
}

export function filterBlogPosts(posts: BlogPost[], query: string, selectedTag: string | null) {
  const queryTerms = normalizeBlogSearch(query).split(/\s+/).filter(Boolean)

  return posts.filter((post) => {
    if (selectedTag !== null && !post.tags.includes(selectedTag)) {
      return false
    }

    if (queryTerms.length === 0) {
      return true
    }

    const searchableText = normalizeBlogSearch(
      [post.title, post.excerpt, post.category, ...post.tags].join(' '),
    )

    return queryTerms.every((term) => searchableText.includes(term))
  })
}
