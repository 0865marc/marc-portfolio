import { describe, expect, it } from 'vitest'
import { PROFILE_SOURCE_ID, professionalProfile } from '../../src/data/portfolio'

describe('professional profile source', () => {
  it('keeps the approved identity and positioning', () => {
    expect(professionalProfile.identity.fullName).toBe('Marc Teixidó Rosauro')
    expect(professionalProfile.identity.location).toBe('Balaguer, Lleida')
    expect(professionalProfile.identity.headline).toBe('Software Engineer · IT Project Lead · AI & Automation')
    expect(professionalProfile.source.id).toBe(PROFILE_SOURCE_ID)
  })

  it('preserves both professional stages with dates and provenance', () => {
    expect(professionalProfile.experience.map(entry => [entry.company, entry.startDate, entry.endDate])).toEqual([
      ['Taurus Research & Development', '2025-06', null],
      ['MCSystems', '2022-09', '2025-06'],
    ])
    expect(professionalProfile.experience.every(entry => entry.sourceId === PROFILE_SOURCE_ID)).toBe(true)
    expect(professionalProfile.experience[0].publicSections[0].items.join(' ')).toContain('20–25 servicios')
    expect(professionalProfile.experience[0].publicSections[0].items.join(' ')).toContain('4 desarrolladores')
  })

  it('publishes only Ainkii and Hermes as selected projects', () => {
    expect(professionalProfile.projects.map(project => project.id)).toEqual(['ainkii', 'hermes'])
    const ainkii = professionalProfile.projects[0]
    expect(ainkii.canonicalName).toBe('Ainkii')
    expect(ainkii.aliases).toContain('Ainki')
    expect(ainkii.model).toEqual(['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje'])
    expect(ainkii.principle).toContain('validación y aprobación')
    expect(professionalProfile.projects.every(project => project.sourceId === PROFILE_SOURCE_ID)).toBe(true)
  })

  it('does not reintroduce unsupported portfolio claims', () => {
    const publicEntities = JSON.stringify({
      facts: professionalProfile.facts,
      experience: professionalProfile.experience,
      capabilities: professionalProfile.capabilities,
      projects: professionalProfile.projects,
    })
    for (const unsupported of ['15+ servidores', 'miles de dispositivos', 'MQTT', 'Gym Tracker', 'Automation Systems']) {
      expect(publicEntities).not.toContain(unsupported)
    }
  })

  it('keeps education and language limits explicit', () => {
    expect(professionalProfile.education).toMatchObject({ institution: 'Universitat de Lleida', startYear: 2018, endYear: 2022 })
    expect(professionalProfile.languages).toEqual(expect.arrayContaining([
      expect.objectContaining({ language: 'Catalán', level: 'Nativo' }),
      expect.objectContaining({ language: 'Español', level: 'Nativo' }),
      expect.objectContaining({ language: 'Inglés', level: 'Profesional funcional' }),
    ]))
  })
})
