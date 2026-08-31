import { describe, expect, it } from 'vitest'
import { buildChallengeContent, challenge, challengeWeeks, dailyProgressEntries } from '../../src/data/challenge'

const tags = [{ id: 'repositorio', label: 'Repositorio' }]
const daily = (overrides: Record<string, unknown> = {}) => ({
  id: '2026-08-24',
  status: 'published',
  position: 1,
  activityDate: '2026-08-24',
  weekId: 'w1',
  category: 'Progreso del reto',
  title: 'Jornada de prueba',
  excerpt: 'Extracto de prueba.',
  tags: ['repositorio'],
  introduction: [{ type: 'paragraph', text: 'Introducción de prueba.' }],
  sections: [{ heading: 'Sección de prueba', blocks: [{ type: 'paragraph', text: 'Párrafo de prueba.' }] }],
  takeaway: [{ type: 'paragraph', text: 'Cierre de prueba.' }],
  ...overrides,
})
const content = (dailyEntries: unknown[] = [], weeks = challengeWeeks) => ({ tags, weeks, daily: dailyEntries })
const weeklyContracts = [
  {
    id: 'w1',
    title: 'Semana 1',
    focus: 'IBM Generative AI Engineering with LLMs — Coursera',
    objective: 'Objetivo previsto: construir una base técnica sólida del funcionamiento de los modelos generativos mediante arquitectura LLM, transformers, PyTorch, Hugging Face, embeddings y NLP moderno.',
    topics: ['arquitectura LLM', 'transformers', 'PyTorch', 'Hugging Face', 'embeddings', 'NLP moderno', 'ejercicios prácticos'],
    agenda: ['Arquitectura LLM y transformers', 'PyTorch y Hugging Face', 'Embeddings y NLP moderno', 'Inicio de ejercicios prácticos'],
    resourceLabel: 'Ver especialización',
  },
  {
    id: 'w2',
    title: 'Semana 2',
    focus: 'IBM Generative AI Engineering with LLMs — Coursera',
    objective: 'Objetivo previsto: completar la especialización y trasladar sus conceptos a sistemas reales mediante adaptación de modelos, RAG, bases vectoriales, agentes y aplicaciones LLM.',
    topics: ['fine-tuning', 'adaptación', 'LoRA', 'QLoRA', 'RAG', 'bases vectoriales', 'agentes', 'aplicaciones LLM'],
    agenda: ['Fine-tuning y adaptación de modelos', 'LoRA y QLoRA', 'RAG y bases de datos vectoriales', 'Agentes y aplicaciones LLM'],
    resourceLabel: 'Ver especialización',
  },
  {
    id: 'w3',
    title: 'Semana 3',
    focus: 'AWS Solutions Architect — Learning Plan',
    objective: 'Objetivo previsto: diseñar arquitecturas cloud robustas y escalables en AWS mediante servicios fundamentales, patrones distribuidos y Builder Labs.',
    topics: ['IAM', 'networking', 'VPC', 'compute', 'storage', 'databases', 'serverless', 'event-driven', 'alta disponibilidad', 'resiliencia', 'seguridad', 'Builder Labs'],
    agenda: ['IAM, networking y VPC', 'Compute, storage y databases', 'Serverless y arquitecturas event-driven', 'Alta disponibilidad, resiliencia y seguridad', 'Builder Labs previstos'],
    resourceLabel: 'Ver plan AWS',
  },
  {
    id: 'w4',
    title: 'Semana 4',
    focus: 'AWS Solutions Architect — Exam Prep + Exam',
    objective: 'Objetivo previsto: validar formalmente conocimientos de arquitectura AWS mediante repaso por dominios, práctica guiada y un examen previsto AWS Certified Solutions Architect – Associate.',
    topics: ['dominios de arquitectura', 'SimuLearn', 'Builder Labs', 'preguntas oficiales', 'simulacros', 'AWS Certified Solutions Architect – Associate'],
    agenda: ['Repaso previsto por dominios', 'SimuLearn y Builder Labs', 'Preguntas y simulacros oficiales', 'Revisión de puntos débiles', 'Examen previsto AWS Certified Solutions Architect – Associate'],
    resourceLabel: 'Ver plan de preparación',
  },
  {
    id: 'w5',
    title: 'Semana 5',
    focus: 'AWS Generative AI Developer — Learning Plan',
    objective: 'Objetivo previsto: diseñar e implementar aplicaciones GenAI sobre AWS mediante foundation models, RAG, agentes, seguridad y arquitecturas GenAI empresariales.',
    topics: ['Amazon Bedrock', 'foundation models', 'RAG', 'Knowledge Bases', 'agents', 'tool use', 'guardrails', 'seguridad', 'Builder Labs'],
    agenda: ['Amazon Bedrock y foundation models', 'RAG y Knowledge Bases', 'Agents y tool use', 'Guardrails y seguridad', 'Builder Labs previstos'],
    resourceLabel: 'Ver plan GenAI',
  },
  {
    id: 'w6',
    title: 'Semana 6',
    focus: 'AWS Generative AI Developer — Learning Plan',
    objective: 'Objetivo previsto: pasar de prototipos IA a sistemas production-grade mediante evaluación, observabilidad, troubleshooting, control de coste y operación escalable en AWS.',
    topics: ['evaluación', 'modelos', 'aplicaciones', 'observabilidad', 'troubleshooting', 'coste', 'latencia', 'integración AWS', 'escalabilidad', 'producción'],
    agenda: ['Evaluación de modelos y aplicaciones', 'Observabilidad y troubleshooting', 'Coste y latencia', 'Integración AWS', 'Escalabilidad y operación en producción'],
    resourceLabel: 'Ver plan GenAI',
  },
  {
    id: 'w7',
    title: 'Semana 7',
    focus: 'AWS Generative AI Developer — Exam Prep',
    objective: 'Objetivo previsto: consolidar conocimientos y detectar áreas débiles mediante repaso de dominios, casos de arquitectura, laboratorios, Practice Question Sets y simulacros.',
    topics: ['dominios', 'casos de arquitectura', 'SimuLearn', 'labs', 'Practice Question Sets', 'simulacros'],
    agenda: ['Repaso previsto de dominios', 'Casos de arquitectura', 'SimuLearn y labs', 'Practice Question Sets', 'Simulacros previstos'],
    resourceLabel: 'Ver plan de preparación',
  },
  {
    id: 'w8',
    title: 'Semana 8',
    focus: 'AWS Generative AI Developer — Exam + Portfolio',
    objective: 'Objetivo previsto: cerrar el sprint con preparación de certificaciones y experiencia práctica documentada, sin afirmar que el examen, la certificación o los proyectos se hayan completado.',
    topics: ['repaso final', 'AWS Certified Generative AI Developer – Professional', 'arquitectura', 'aprendizajes', 'proyectos', 'casos de estudio', 'portfolio'],
    agenda: ['Repaso final previsto', 'Examen previsto AWS Certified Generative AI Developer – Professional', 'Documentación de arquitectura y aprendizajes', 'Consolidación prevista de proyectos y casos de estudio en portfolio'],
    resourceLabel: 'Ver plan de preparación',
  },
] as const

const shiftDate = (date: string, days: number) => {
  const value = new Date(`${date}T00:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0, 10)
}

describe('challenge content adapter', () => {
  it('keeps the current challenge title, exact 2026 eight-week bounds and planned state', () => {
    expect(challenge.title).toBe('Career Sprint — AI Engineering & Cloud Architecture')
    expect(challengeWeeks).toHaveLength(8)
    expect(challengeWeeks.map(week => week.id)).toEqual(weeklyContracts.map(contract => contract.id))
    expect(challengeWeeks.map(week => week.status)).toEqual(Array(8).fill('published'))
    expect(challengeWeeks.map(week => week.progressState)).toEqual(Array(8).fill('planned'))
    expect(challengeWeeks.map(week => [week.startDate, week.endDate])).toEqual([
      ['2026-08-24', '2026-08-30'],
      ['2026-08-31', '2026-09-06'],
      ['2026-09-07', '2026-09-13'],
      ['2026-09-14', '2026-09-20'],
      ['2026-09-21', '2026-09-27'],
      ['2026-09-28', '2026-10-04'],
      ['2026-10-05', '2026-10-11'],
      ['2026-10-12', '2026-10-18'],
    ])
  })

  it.each(weeklyContracts)('keeps semantic contract for $id', contract => {
    const week = challengeWeeks.find(candidate => candidate.id === contract.id)!
    const agendaActivities = week.agenda.flatMap(day => day.blocks.map(block => block.activity))

    expect(week.title).toBe(contract.title)
    expect(week.focus).toBe(contract.focus)
    expect(week.objective).toBe(contract.objective)
    expect(week.status).toBe('published')
    expect(week.progressState).toBe('planned')
    expect(week.topics).toEqual(contract.topics)
    expect(agendaActivities).toEqual(contract.agenda)
    expect(week.agenda).toHaveLength(1)
    expect(week.agenda[0].day).toBe('Plan semanal')
    expect(week.milestones).toHaveLength(2)
    expect(week.reservations).toEqual([])
    expect(week.criteria).toHaveLength(1)
    expect(week.resource?.label).toBe(contract.resourceLabel)
    expect(week.hoursPlanned).toBeUndefined()
    expect(week.hoursBreakdown).toEqual([])
  })

  it('rejects a global date shift, a non-seven-day range, and broken continuity', () => {
    const globallyShifted = challengeWeeks.map(week => ({
      ...week,
      startDate: shiftDate(week.startDate, 1),
      endDate: shiftDate(week.endDate, 1),
    }))
    const wrongDuration = challengeWeeks.map(week => week.id === 'w4' ? { ...week, endDate: '2026-09-21' } : week)
    const gap = challengeWeeks.map(week => week.id === 'w2'
      ? { ...week, startDate: '2026-09-02', endDate: '2026-09-08' }
      : week)

    expect(() => buildChallengeContent(content([], globallyShifted))).toThrow(/must begin at the challenge start date/)
    expect(() => buildChallengeContent(content([], wrongDuration))).toThrow(/must last seven days/)
    expect(() => buildChallengeContent(content([], gap))).toThrow(/must follow the previous week/)
  })

  it('publishes the factual daily entries in chronological order', () => {
    expect(dailyProgressEntries.map(entry => entry.id)).toEqual(['2026-08-24', '2026-08-25', '2026-08-29'])
    expect(dailyProgressEntries.map(entry => entry.position)).toEqual([1, 2, 3])
    expect(dailyProgressEntries.every(entry => entry.status === 'published')).toBe(true)
    expect(dailyProgressEntries[1].title).toBe('De los índices a la predicción: embeddings, clasificación y modelos n-grama')
  })

  it('orders and filters daily entries while resolving existing tags', () => {
    const result = buildChallengeContent(content([
      daily({ id: '2026-08-25', activityDate: '2026-08-25', position: 2 }),
      daily({ id: '2026-08-24', activityDate: '2026-08-24', position: 1, status: 'draft' }),
      daily({ id: '2026-08-26', activityDate: '2026-08-26', position: 3 }),
    ]))

    expect(result.daily.map(entry => entry.id)).toEqual(['2026-08-25', '2026-08-26'])
    expect(result.daily[0].tags).toEqual(['Repositorio'])
  })

  it('preserves ordered prose, code, and lists in daily body blocks', () => {
    const result = buildChallengeContent(content([daily({
      introduction: [
        { type: 'paragraph', text: 'Antes.' },
        { type: 'code', language: 'text', code: 'pipeline', title: 'Pipeline' },
        { type: 'paragraph', text: 'Después.' },
      ],
      sections: [{
        heading: 'Sección de prueba',
        blocks: [
          { type: 'paragraph', text: 'Explicación.' },
          { type: 'list', style: 'unordered', items: ['Primer punto.', 'Segundo punto.'] },
          { type: 'code', language: 'text', code: 'resultado', title: 'Resultado' },
        ],
      }],
    })]))

    expect(result.daily[0].introduction.map(block => block.type)).toEqual(['paragraph', 'code', 'paragraph'])
    expect(result.daily[0].introduction[1]).toEqual({ type: 'code', language: 'text', code: 'pipeline', title: 'Pipeline' })
    expect(result.daily[0].sections[0].blocks.map(block => block.type)).toEqual(['paragraph', 'list', 'code'])
    expect(result.daily[0].sections[0].blocks[2]).toEqual({ type: 'code', language: 'text', code: 'resultado', title: 'Resultado' })
  })

  it.each([
    { label: 'a mismatched date ID', entry: daily({ id: '2026-08-25' }), error: /must equal activityDate/ },
    {
      label: 'a mixed ordered and legacy section body',
      entry: daily({
        sections: [{
          heading: 'Sección de prueba',
          blocks: [{ type: 'paragraph', text: 'Párrafo de prueba.' }],
          paragraphs: ['Contenido heredado.'],
        }],
      }),
      error: /sections\[0\]\.paragraphs: unexpected key/,
    },
    {
      label: 'a daily block with an extra field',
      entry: daily({ introduction: [{ type: 'paragraph', text: 'Párrafo de prueba.', title: 'No permitido.' }] }),
      error: /introduction\[0\]\.title: unexpected key/,
    },
    { label: 'an unknown week', entry: daily({ weekId: 'w9' }), error: /unknown week/ },
    { label: 'a negative actual hour value', entry: daily({ hoursActual: -1 }), error: /non-negative number/ },
    { label: 'an unknown tag', entry: daily({ tags: ['missing'] }), error: /unknown tag/ },
  ])('rejects $label', ({ entry, error }) => {
    expect(() => buildChallengeContent(content([entry]))).toThrow(error)
  })
})
