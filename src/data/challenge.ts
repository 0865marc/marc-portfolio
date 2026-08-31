import { readdirSync, readFileSync } from 'node:fs'
import { basename, extname, join } from 'node:path'
import type { BlogPost, BlogPostStatus } from './blog'
import { PROFILE_SOURCE_ID } from './portfolio'

const CONTENT_ROOT = join(process.cwd(), 'content')
const ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
const EDITORIAL_STATES = ['draft', 'published', 'deleted'] as const
const PROGRESS_STATES = ['planned', 'active', 'complete', 'paused'] as const
const CODE_LANGUAGES = ['bash', 'json', 'markdown', 'typescript', 'text'] as const
const CHALLENGE_START_DATE = '2026-08-24'
const CHALLENGE_END_DATE = '2026-10-18'
const DAILY_ARTICLE_SECTION_KEYS = ['heading', 'blocks'] as const
const DAILY_ARTICLE_PARAGRAPH_KEYS = ['type', 'text'] as const
const DAILY_ARTICLE_CODE_KEYS = ['type', 'language', 'code', 'title'] as const
const DAILY_ARTICLE_LIST_KEYS = ['type', 'style', 'items'] as const

export type ChallengeProgressState = typeof PROGRESS_STATES[number]

export type ChallengeAgendaBlock = {
  time: string
  activity: string
}

export type ChallengeAgendaDay = {
  day: string
  blocks: ChallengeAgendaBlock[]
}

export type ChallengeHoursBreakdown = {
  label: string
  hours: number
}
export type ChallengeResource = {
  label: string
  href: string
}

export type ChallengeWeek = {
  id: string
  status: BlogPostStatus
  position: number
  startDate: string
  endDate: string
  title: string
  focus: string
  objective: string
  agenda: ChallengeAgendaDay[]
  hoursBreakdown: ChallengeHoursBreakdown[]
  hoursPlanned?: number
  topics: string[]
  milestones: string[]
  reservations: string[]
  criteria: string[]
  resource?: ChallengeResource
  progressState: ChallengeProgressState
}

export type DailyArticleCodeLanguage = typeof CODE_LANGUAGES[number]

export type DailyArticleBlock =
  | { type: 'paragraph'; text: string }
  | { type: 'code'; language: DailyArticleCodeLanguage; code: string; title?: string }
  | { type: 'list'; style: 'ordered' | 'unordered'; items: string[] }

export type DailyArticleSection = {
  heading: string
  blocks: DailyArticleBlock[]
}

export type DailyProgressEntry = Omit<BlogPost, 'introduction' | 'sections' | 'takeaway'> & {
  status: BlogPostStatus
  introduction: DailyArticleBlock[]
  sections: DailyArticleSection[]
  takeaway: DailyArticleBlock[]
  position: number
  activityDate: string
  weekId: string
  hoursActual?: number
}

type ChallengeContent = {
  tags: unknown[]
  weeks: unknown[]
  daily: unknown[]
}

type ContentFile = {
  file: string
  value: unknown
}

type RawDailyProgressEntry = Omit<DailyProgressEntry, 'sourceId' | 'publishedAt' | 'tags'> & {
  tags: string[]
}

const fail = (field: string, message: string): never => {
  throw new Error(`Invalid challenge content at ${field}: ${message}`)
}

const expectRecord = (value: unknown, field: string, allowedKeys?: readonly string[]): Record<string, unknown> => {
  if (typeof value !== 'object' || value === null || Array.isArray(value)) return fail(field, 'expected an object')
  const record = value as Record<string, unknown>
  if (allowedKeys !== undefined) {
    const unexpectedKey = Object.keys(record).find(key => !allowedKeys.includes(key))
    if (unexpectedKey !== undefined) return fail(`${field}.${unexpectedKey}`, 'unexpected key')
  }
  return record
}

const expectString = (value: unknown, field: string): string => {
  if (typeof value !== 'string' || !value.trim()) return fail(field, 'expected a non-empty string')
  return value
}

const expectStringList = (value: unknown, field: string): string[] => {
  if (!Array.isArray(value) || !value.length) return fail(field, 'expected a non-empty array')
  return value.map((item, index) => expectString(item, `${field}[${index}]`))
}

const expectOptionalStringList = (value: unknown, field: string): string[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) return fail(field, 'expected an array')
  return value.map((item, index) => expectString(item, `${field}[${index}]`))
}

const expectId = (value: unknown, field: string): string => {
  const id = expectString(value, field)
  if (!ID_PATTERN.test(id)) fail(field, 'must use lowercase letters, numbers, and single hyphens')
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

const expectEditorialStatus = (value: unknown, field: string): BlogPostStatus => {
  const status = expectString(value, field)
  if (!(EDITORIAL_STATES as readonly string[]).includes(status)) fail(field, `must be one of ${EDITORIAL_STATES.join(', ')}`)
  return status as BlogPostStatus
}

const expectProgressState = (value: unknown, field: string): ChallengeProgressState => {
  const progressState = expectString(value, field)
  if (!(PROGRESS_STATES as readonly string[]).includes(progressState)) fail(field, `must be one of ${PROGRESS_STATES.join(', ')}`)
  return progressState as ChallengeProgressState
}

const expectPosition = (value: unknown, field: string): number => {
  if (typeof value !== 'number' || !Number.isSafeInteger(value) || value < 1) return fail(field, 'must be a positive integer')
  return value
}

const expectOptionalHours = (value: unknown, field: string): number | undefined => {
  if (value === undefined || value === null) return undefined
  if (typeof value !== 'number' || !Number.isFinite(value) || value < 0) return fail(field, 'must be a non-negative number')
  return value
}

const expectOptionalHttpsUrl = (value: unknown, field: string): string | undefined => {
  if (value === undefined) return undefined
  const href = expectString(value, field)
  try {
    if (new URL(href).protocol !== 'https:') return fail(field, 'must use an HTTPS URL')
  } catch {
    return fail(field, 'must use a valid HTTPS URL')
  }
  return href
}

const parseOptionalResource = (record: Record<string, unknown>, field: string): ChallengeResource | undefined => {
  const label = record.resourceLabel === undefined ? undefined : expectString(record.resourceLabel, `${field}.resourceLabel`)
  const href = expectOptionalHttpsUrl(record.resourceHref, `${field}.resourceHref`)
  if (label === undefined && href === undefined) return undefined
  if (label === undefined || href === undefined) return fail(field, 'resourceLabel and resourceHref must be provided together')
  return { label, href }
}

const parseDailyArticleBlocks = (value: unknown, field: string): DailyArticleBlock[] => {
  if (!Array.isArray(value) || !value.length) return fail(field, 'expected a non-empty array')

  return value.map((value, index) => {
    const blockField = `${field}[${index}]`
    const record = expectRecord(value, blockField)
    const type = expectString(record.type, `${blockField}.type`)

    if (type === 'paragraph') {
      expectRecord(record, blockField, DAILY_ARTICLE_PARAGRAPH_KEYS)
      return { type, text: expectString(record.text, `${blockField}.text`) }
    }

    if (type === 'code') {
      expectRecord(record, blockField, DAILY_ARTICLE_CODE_KEYS)
      const language = expectString(record.language, `${blockField}.language`)
      if (!(CODE_LANGUAGES as readonly string[]).includes(language)) fail(`${blockField}.language`, 'is not supported')
      const title = record.title === undefined ? undefined : expectString(record.title, `${blockField}.title`)
      return {
        type,
        language: language as DailyArticleCodeLanguage,
        code: expectString(record.code, `${blockField}.code`),
        ...(title === undefined ? {} : { title }),
      }
    }

    if (type === 'list') {
      expectRecord(record, blockField, DAILY_ARTICLE_LIST_KEYS)
      const style = expectString(record.style, `${blockField}.style`)
      if (style !== 'ordered' && style !== 'unordered') return fail(`${blockField}.style`, 'must be ordered or unordered')
      return {
        type,
        style,
        items: expectStringList(record.items, `${blockField}.items`),
      }
    }

    return fail(`${blockField}.type`, 'must be paragraph, code, or list')
  })
}

const parseDailyArticleSection = (value: unknown, field: string): DailyArticleSection => {
  const record = expectRecord(value, field, DAILY_ARTICLE_SECTION_KEYS)
  return {
    heading: expectString(record.heading, `${field}.heading`),
    blocks: parseDailyArticleBlocks(record.blocks, `${field}.blocks`),
  }
}

const parseAgenda = (value: unknown, field: string): ChallengeAgendaDay[] => {
  if (!Array.isArray(value) || !value.length) return fail(field, 'expected a non-empty array')

  return value.map((agendaDay, dayIndex) => {
    const record = expectRecord(agendaDay, `${field}[${dayIndex}]`)
    if (!Array.isArray(record.blocks) || !record.blocks.length) return fail(`${field}[${dayIndex}].blocks`, 'expected a non-empty array')

    return {
      day: expectString(record.day, `${field}[${dayIndex}].day`),
      blocks: record.blocks.map((block, blockIndex) => {
        const blockRecord = expectRecord(block, `${field}[${dayIndex}].blocks[${blockIndex}]`)
        return {
          time: expectString(blockRecord.time, `${field}[${dayIndex}].blocks[${blockIndex}].time`),
          activity: expectString(blockRecord.activity, `${field}[${dayIndex}].blocks[${blockIndex}].activity`),
        }
      }),
    }
  })
}

const parseHoursBreakdown = (value: unknown, field: string): ChallengeHoursBreakdown[] => {
  if (value === undefined) return []
  if (!Array.isArray(value)) return fail(field, 'expected an array')

  return value.map((entry, index) => {
    const record = expectRecord(entry, `${field}[${index}]`)
    const hours = expectOptionalHours(record.hours, `${field}[${index}].hours`)
    if (hours === undefined || hours === 0) return fail(`${field}[${index}].hours`, 'must be greater than zero')
    return { label: expectString(record.label, `${field}[${index}].label`), hours }
  })
}

const parseWeek = (value: unknown, field: string): ChallengeWeek => {
  const record = expectRecord(value, field)
  const hoursBreakdown = parseHoursBreakdown(record.hoursBreakdown, `${field}.hoursBreakdown`)
  const hoursPlanned = expectOptionalHours(record.hoursPlanned, `${field}.hoursPlanned`)
  if (hoursPlanned !== undefined && hoursBreakdown.reduce((total, entry) => total + entry.hours, 0) !== hoursPlanned) {
    return fail(`${field}.hoursPlanned`, 'must equal the hours breakdown')
  }
  const resource = parseOptionalResource(record, field)

  return {
    id: expectId(record.id, `${field}.id`),
    status: expectEditorialStatus(record.status, `${field}.status`),
    position: expectPosition(record.position, `${field}.position`),
    startDate: expectDate(record.startDate, `${field}.startDate`),
    endDate: expectDate(record.endDate, `${field}.endDate`),
    title: expectString(record.title, `${field}.title`),
    focus: expectString(record.focus, `${field}.focus`),
    objective: expectString(record.objective, `${field}.objective`),
    agenda: parseAgenda(record.agenda, `${field}.agenda`),
    hoursBreakdown,
    ...(hoursPlanned === undefined ? {} : { hoursPlanned }),
    topics: expectStringList(record.topics, `${field}.topics`),
    milestones: expectOptionalStringList(record.milestones, `${field}.milestones`),
    reservations: expectOptionalStringList(record.reservations, `${field}.reservations`),
    criteria: expectOptionalStringList(record.criteria, `${field}.criteria`),
    ...(resource === undefined ? {} : { resource }),
    progressState: expectProgressState(record.progressState, `${field}.progressState`),
  }
}

const parseDailyProgress = (value: unknown, field: string): RawDailyProgressEntry => {
  const record = expectRecord(value, field)
  if (!Array.isArray(record.sections) || !record.sections.length) return fail(`${field}.sections`, 'expected a non-empty array')
  const activityDate = expectDate(record.activityDate, `${field}.activityDate`)
  const id = expectDate(record.id, `${field}.id`)
  if (id !== activityDate) fail(`${field}.id`, 'must equal activityDate')
  const hoursActual = expectOptionalHours(record.hoursActual, `${field}.hoursActual`)

  return {
    id,
    status: expectEditorialStatus(record.status, `${field}.status`),
    position: expectPosition(record.position, `${field}.position`),
    activityDate,
    weekId: expectId(record.weekId, `${field}.weekId`),
    category: expectString(record.category, `${field}.category`),
    title: expectString(record.title, `${field}.title`),
    excerpt: expectString(record.excerpt, `${field}.excerpt`),
    tags: expectStringList(record.tags, `${field}.tags`),
    introduction: parseDailyArticleBlocks(record.introduction, `${field}.introduction`),
    sections: record.sections.map((section, index) => parseDailyArticleSection(section, `${field}.sections[${index}]`)),
    takeaway: parseDailyArticleBlocks(record.takeaway, `${field}.takeaway`),
    ...(hoursActual === undefined ? {} : { hoursActual }),
  }
}

const parseTagLabels = (value: unknown, field: string): { id: string; label: string } => {
  const record = expectRecord(value, field)
  return {
    id: expectId(record.id, `${field}.id`),
    label: expectString(record.label, `${field}.label`),
  }
}

const addDays = (date: string, amount: number): string => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + amount)
  return value.toISOString().slice(0, 10)
}

export const buildChallengeContent = (content: ChallengeContent): { weeks: ChallengeWeek[]; daily: DailyProgressEntry[] } => {
  const tags = new Map<string, string>()
  for (const [index, rawTag] of content.tags.entries()) {
    const tag = parseTagLabels(rawTag, `tags[${index}]`)
    if (tags.has(tag.id)) fail(`tags.${tag.id}`, 'duplicate ID')
    tags.set(tag.id, tag.label)
  }

  const weeks = content.weeks.map((week, index) => parseWeek(week, `weeks[${index}]`))
  if (weeks.length !== 8) fail('weeks', 'must contain exactly eight weeks')
  const weekIds = new Set<string>()
  const weekPositions = new Set<number>()
  const orderedWeeks = [...weeks].sort((left, right) => left.position - right.position || left.id.localeCompare(right.id))
  for (const [index, week] of orderedWeeks.entries()) {
    if (weekIds.has(week.id)) fail(`weeks.${week.id}`, 'duplicate ID')
    if (weekPositions.has(week.position)) fail(`weeks.${week.id}.position`, 'duplicate position')
    if (week.id !== `w${index + 1}` || week.position !== index + 1) fail(`weeks.${week.id}`, 'must use consecutive w1 to w8 positions')
    if (index === 0 && week.startDate !== CHALLENGE_START_DATE) fail(`weeks.${week.id}.startDate`, 'must begin at the challenge start date')
    if (index === orderedWeeks.length - 1 && week.endDate !== CHALLENGE_END_DATE) fail(`weeks.${week.id}.endDate`, 'must end at the challenge end date')
    if (week.endDate !== addDays(week.startDate, 6)) fail(`weeks.${week.id}.endDate`, 'must last seven days')
    if (index > 0 && week.startDate !== addDays(orderedWeeks[index - 1].endDate, 1)) fail(`weeks.${week.id}.startDate`, 'must follow the previous week')
    weekIds.add(week.id)
    weekPositions.add(week.position)
  }

  const daily = content.daily.map((entry, index) => parseDailyProgress(entry, `daily[${index}]`))
  const dailyIds = new Set<string>()
  const dailyPositions = new Set<number>()
  for (const entry of daily) {
    if (dailyIds.has(entry.id)) fail(`daily.${entry.id}`, 'duplicate ID')
    if (dailyPositions.has(entry.position)) fail(`daily.${entry.id}.position`, 'duplicate position')
    const week = weeks.find(candidate => candidate.id === entry.weekId)
    if (!week) return fail(`daily.${entry.id}.weekId`, `unknown week "${entry.weekId}"`)
    if (entry.activityDate < week.startDate || entry.activityDate > week.endDate) fail(`daily.${entry.id}.activityDate`, 'must be inside its week')
    if (entry.status === 'published' && week.status !== 'published') fail(`daily.${entry.id}.weekId`, 'published progress requires a published week')

    const entryTags = new Set<string>()
    for (const tagId of entry.tags) {
      if (!tags.has(tagId)) fail(`daily.${entry.id}.tags`, `unknown tag "${tagId}"`)
      if (entryTags.has(tagId)) fail(`daily.${entry.id}.tags`, `duplicate tag "${tagId}"`)
      entryTags.add(tagId)
    }
    dailyIds.add(entry.id)
    dailyPositions.add(entry.position)
  }

  return {
    weeks: orderedWeeks.filter(week => week.status === 'published'),
    daily: daily
      .filter(entry => entry.status === 'published')
      .sort((left, right) => left.activityDate.localeCompare(right.activityDate) || left.position - right.position || left.id.localeCompare(right.id))
      .map(entry => ({
        ...entry,
        tags: entry.tags.map(tagId => tags.get(tagId)!),
        publishedAt: entry.activityDate,
        sourceId: PROFILE_SOURCE_ID,
      })),
  }
}

const readJsonDirectory = (directoryName: string): ContentFile[] => {
  const directory = join(CONTENT_ROOT, directoryName)
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
  const id = expectString(record.id, `${file}.id`)
  if (basename(file, extname(file)) !== id) fail(file, `filename must match ID "${id}"`)
  return value
}

const content: ChallengeContent = {
  tags: readJsonDirectory('tags').map(assertFilenameMatchesId),
  weeks: readJsonDirectory('weeks').map(assertFilenameMatchesId),
  daily: readJsonDirectory('daily').map(assertFilenameMatchesId),
}

const compiled = buildChallengeContent(content)

export const challenge = {
  title: 'Career Sprint — AI Engineering & Cloud Architecture',
  startDate: CHALLENGE_START_DATE,
  endDate: CHALLENGE_END_DATE,
}

export const challengeWeeks = compiled.weeks
export const dailyProgressEntries = compiled.daily
