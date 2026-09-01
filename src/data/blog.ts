import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import { PROFILE_SOURCE_ID } from './portfolio'

const BLOG_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const BLOG_STATES = ['draft', 'published', 'deleted'] as const
const BLOG_CODE_LANGUAGES = ['bash', 'json', 'markdown', 'typescript', 'text'] as const

export type BlogCodeLanguage = typeof BLOG_CODE_LANGUAGES[number]
export type BlogPostStatus = typeof BLOG_STATES[number]

export type BlogCodeBlock = {
  language: BlogCodeLanguage
  code: string
  title?: string
}

export type BlogArticleSection = {
  heading: string
  paragraphs: string[]
  points?: string[]
  codeBlocks?: BlogCodeBlock[]
}

export type BlogPost = {
  id: string
  category: string
  tags: string[]
  title: string
  excerpt: string
  publishedAt: string
  sourceId: typeof PROFILE_SOURCE_ID
  introduction: string[]
  sections: BlogArticleSection[]
  takeaway: string[]
}

type BlogContentTag = {
  id: string
  label: string
}

type BlogContentPost = Omit<BlogPost, 'sourceId' | 'tags'> & {
  status: BlogPostStatus
  position: number
  tags: string[]
}

type BlogContent = {
  tags: unknown[]
  posts: unknown[]
}

type ContentFile = {
  file: string
  value: unknown
}

const contentRoot = join(process.cwd(), 'content')

const fail = (field: string, message: string): never => {
  throw new Error(`Invalid blog content at ${field}: ${message}`)
}

const expectRecord = (value: unknown, field: string): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return fail(field, 'expected an object')
  return value as Record<string, unknown>
}

const expectString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) return fail(field, 'expected a non-empty string')
  return value
}

const expectStringList = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || !value.length) return fail(field, 'expected a non-empty array')
  return value.map((item, index) => expectString(item, `${field}[${index}]`))
}

const expectId = (value: unknown, field: string): string => {
  const id = expectString(value, field)
  if (!BLOG_ID_PATTERN.test(id)) fail(field, 'must use lowercase letters, numbers, and single hyphens')
  return id
}

const expectDate = (value: unknown, field: string): string => {
  const date = expectString(value, field)
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date)
  if (!match) return fail(field, 'must use YYYY-MM-DD')

  const [year, month, day] = match.slice(1).map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  if (parsed.getUTCFullYear() !== year || parsed.getUTCMonth() !== month - 1 || parsed.getUTCDate() !== day) {
    return fail(field, 'must be a real calendar date')
  }
  return date
}

const expectStatus = (value: unknown, field: string): BlogPostStatus => {
  const status = expectString(value, field)
  if (!BLOG_STATES.includes(status as BlogPostStatus)) fail(field, `must be one of ${BLOG_STATES.join(', ')}`)
  return status as BlogPostStatus
}

const expectPosition = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) return fail(field, 'must be a positive integer')
  return value
}

const parseCodeBlock = (value: unknown, field: string): BlogCodeBlock => {
  const record = expectRecord(value, field)
  const language = expectString(record.language, `${field}.language`)
  if (!(BLOG_CODE_LANGUAGES as readonly string[]).includes(language)) {
    fail(`${field}.language`, `must be one of ${BLOG_CODE_LANGUAGES.join(', ')}`)
  }

  const title = record.title === undefined ? undefined : expectString(record.title, `${field}.title`)
  return {
    language: language as BlogCodeLanguage,
    code: expectString(record.code, `${field}.code`),
    ...(title === undefined ? {} : { title }),
  }
}

const parseSection = (value: unknown, field: string): BlogArticleSection => {
  const record = expectRecord(value, field)
  const points = record.points === undefined ? undefined : expectStringList(record.points, `${field}.points`)
  const codeBlockValues = record.codeBlocks
  const codeBlocks = codeBlockValues === undefined
    ? undefined
    : (() => {
        if (!Array.isArray(codeBlockValues) || !codeBlockValues.length) {
          return fail(`${field}.codeBlocks`, 'expected a non-empty array')
        }
        return codeBlockValues.map((block, index) => parseCodeBlock(block, `${field}.codeBlocks[${index}]`))
      })()

  return {
    heading: expectString(record.heading, `${field}.heading`),
    paragraphs: expectStringList(record.paragraphs, `${field}.paragraphs`),
    ...(points === undefined ? {} : { points }),
    ...(codeBlocks === undefined ? {} : { codeBlocks }),
  }
}

const parseTag = (value: unknown, field: string): BlogContentTag => {
  const record = expectRecord(value, field)
  return {
    id: expectId(record.id, `${field}.id`),
    label: expectString(record.label, `${field}.label`),
  }
}

const parsePost = (value: unknown, field: string): BlogContentPost => {
  const record = expectRecord(value, field)
  const sectionValues = record.sections
  if (!Array.isArray(sectionValues) || !sectionValues.length) {
    return fail(`${field}.sections`, 'expected a non-empty array')
  }

  return {
    id: expectId(record.id, `${field}.id`),
    status: expectStatus(record.status, `${field}.status`),
    position: expectPosition(record.position, `${field}.position`),
    category: expectString(record.category, `${field}.category`),
    tags: expectStringList(record.tags, `${field}.tags`),
    title: expectString(record.title, `${field}.title`),
    excerpt: expectString(record.excerpt, `${field}.excerpt`),
    publishedAt: expectDate(record.publishedAt, `${field}.publishedAt`),
    introduction: expectStringList(record.introduction, `${field}.introduction`),
    sections: sectionValues.map((section, index) => parseSection(section, `${field}.sections[${index}]`)),
    takeaway: expectStringList(record.takeaway, `${field}.takeaway`),
  }
}

const comparePosts = (left: BlogContentPost, right: BlogContentPost): number =>
  left.position - right.position || (left.id < right.id ? -1 : left.id > right.id ? 1 : 0)

export const buildPublishedBlogPosts = (content: BlogContent): BlogPost[] => {
  const tags = content.tags.map((tag, index) => parseTag(tag, `tags[${index}]`))
  const tagLabels = new Map<string, string>()
  for (const tag of tags) {
    if (tagLabels.has(tag.id)) fail(`tags.${tag.id}`, 'duplicate ID')
    tagLabels.set(tag.id, tag.label)
  }

  const posts = content.posts.map((post, index) => parsePost(post, `posts[${index}]`))
  const postIds = new Set<string>()
  const positions = new Set<number>()
  for (const post of posts) {
    if (postIds.has(post.id)) fail(`posts.${post.id}`, 'duplicate ID')
    if (positions.has(post.position)) fail(`posts.${post.id}.position`, 'duplicate position')
    postIds.add(post.id)
    positions.add(post.position)

    const postTagIds = new Set<string>()
    for (const tagId of post.tags) {
      if (!tagLabels.has(tagId)) fail(`posts.${post.id}.tags`, `unknown tag "${tagId}"`)
      if (postTagIds.has(tagId)) fail(`posts.${post.id}.tags`, `duplicate tag "${tagId}"`)
      postTagIds.add(tagId)
    }
  }

  return posts
    .filter(post => post.status === 'published')
    .sort(comparePosts)
    .map(post => ({
      id: post.id,
      category: post.category,
      tags: post.tags.map(tagId => tagLabels.get(tagId)!),
      title: post.title,
      excerpt: post.excerpt,
      publishedAt: post.publishedAt,
      sourceId: PROFILE_SOURCE_ID,
      introduction: post.introduction,
      sections: post.sections,
      takeaway: post.takeaway,
    }))
}

const readJsonDirectory = (directoryName: string): ContentFile[] => {
  const directory = join(contentRoot, directoryName)
  const files = (() => {
    try {
      return readdirSync(directory)
    } catch (error) {
      return fail(directory, error instanceof Error ? error.message : 'unable to read directory')
    }
  })()

  return files
    .filter(file => extname(file) === '.json')
    .sort()
    .map(file => {
      const path = join(directory, file)
      try {
        return { file: path, value: JSON.parse(readFileSync(path, 'utf8')) }
      } catch (error) {
        return fail(path, error instanceof Error ? error.message : 'invalid JSON')
      }
    })
}

const assertFilenameMatchesId = ({ file, value }: ContentFile): unknown => {
  const record = expectRecord(value, file)
  const id = expectId(record.id, `${file}.id`)
  if (basename(file, extname(file)) !== id) fail(file, `filename must match ID "${id}"`)
  return value
}

const readBlogContent = (): BlogContent => ({
  tags: readJsonDirectory('tags').map(assertFilenameMatchesId),
  posts: readJsonDirectory('posts').map(assertFilenameMatchesId),
})

export const blogPosts: BlogPost[] = buildPublishedBlogPosts(readBlogContent())
