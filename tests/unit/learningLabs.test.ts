import { describe, expect, it } from 'vitest'
import { bagExamples, countWords, attentionTokens, visiblePositions } from '../../src/lib/learningLabs'
import { learningConcepts } from '../../src/data/learning'
import { learningCourses, conceptCourseHref } from '../../src/data/learningCourses'

describe('learning demonstrations', () => {
  it('shows that reversing subject and object preserves word counts', () => {
    expect(bagExamples[0]).not.toBe(bagExamples[1])
    expect(countWords(bagExamples[0])).toEqual(countWords(bagExamples[1]))
    expect(countWords(bagExamples[0]).reduce((a, b) => a + b, 0)).toBe(5)
  })
  it('never exposes a future token in the causal mask', () => {
    for (let position = 0; position < attentionTokens.length; position++) {
      const visibility = visiblePositions(position, true)
      expect(visibility.slice(0, position + 1).every(Boolean)).toBe(true)
      expect(visibility.slice(position + 1).some(Boolean)).toBe(false)
      expect(visiblePositions(position, false).every(Boolean)).toBe(true)
    }
  })
  it('assigns every published concept to exactly one course', () => {
    const assigned = learningCourses.flatMap(course => [...course.concepts])
    expect(assigned.slice().sort()).toEqual(learningConcepts.map(concept => concept.id).sort())
    expect(new Set(assigned).size).toBe(assigned.length)
    for (const id of assigned) expect(conceptCourseHref(id)).toMatch(/^\/aprendizaje\/#curso-[1-3]$/)
    expect(() => conceptCourseHref('missing')).toThrow('Concept has no course')
  })
})
