import { describe, expect, it } from 'vitest'
import { bagExamples, countWords, attentionTokens, visiblePositions } from '../../src/lib/learningLabs'
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
  it('keeps earlier concept URLs mapped to an available course', () => {
    const assigned = learningCourses.filter(course => course.available).flatMap(course => [...course.concepts])
    expect(new Set(assigned).size).toBe(assigned.length)
    expect(conceptCourseHref('tokenizacion-y-vocabulario')).toBe('/aprendizaje/#curso-1')
    expect(conceptCourseHref('embeddings')).toBe('/aprendizaje/#curso-2')
    expect(conceptCourseHref('transformers-y-atencion')).toBe('/aprendizaje/#curso-3')
    expect(() => conceptCourseHref('missing')).toThrow('Concept has no course')
  })
})
