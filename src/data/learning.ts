import { buildPublishedArticles, readArticleCollection } from './articleContent'
export { conceptCourseHref as conceptHref } from './learningCourses'

// Concepts use the shared validated article format and publishing states,
// while retaining their own collection, stable URLs and thematic ordering.
export const learningConcepts = buildPublishedArticles(readArticleCollection('concepts'))
