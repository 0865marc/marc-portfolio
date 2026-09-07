import { describe, expect, it } from 'vitest'
import { PROFILE_SOURCE_ID, professionalProfile } from '../../src/data/portfolio'

describe('professional profile source', () => {
  it('keeps the approved public identity and positioning', () => {
    expect(professionalProfile.identity).toMatchObject({
      fullName: 'Marc Teixidó Rosauro',
      location: 'Balaguer, Lleida',
      headline: 'Ingeniero de software y responsable de proyectos IT',
      positioning: 'Perfil orientado a Product Engineering con foco en IA aplicada',
      summary: 'Conecto visión de producto y ejecución técnica para convertir necesidades en software, coordinar su entrega y aplicar automatización e IA cuando aportan valor.',
      aboutIntro: 'Mi experiencia combina desarrollo full-stack y coordinación de proyectos IT. Trabajo entre las necesidades de producto, las decisiones técnicas y la entrega, manteniendo una visión de principio a fin.',
      seo: {
        title: 'Marc Teixidó — Product Engineering e IA aplicada',
        description: 'Perfil orientado a Product Engineering con foco en IA aplicada y evidencia publicada: cerca de 3 años full-stack y alrededor de 1 año coordinando proyectos IT.',
        imageAlt: 'Marc Teixidó — Product Engineering, cerca de 3 años full-stack, alrededor de 1 año coordinando proyectos IT e IA aplicada',
      },
    })
    expect(professionalProfile.source.id).toBe(PROFILE_SOURCE_ID)
    expect(professionalProfile.facts).toEqual([
      {
        label: 'Desarrollo full-stack',
        value: '≈ 3 años',
        context: 'Software de negocio, datos, despliegues e infraestructura entre 2022 y 2025.',
      },
      {
        label: 'Liderazgo de proyectos IT',
        value: '≈ 1 año',
        context: 'Responsable de proyectos IT en Taurus Research & Development desde 2025.',
      },
    ])
  })

  it('keeps the authorized current role and public previous stage', () => {
    expect(professionalProfile.experience.map(entry => [entry.company, entry.startDate, entry.endDate])).toEqual([
      ['Taurus Research & Development', '2025', null],
      ['MCSystems', '2022-09', '2025-06'],
    ])
    expect(professionalProfile.experience[0]).toMatchObject({
      role: 'Responsable de proyectos IT',
      summary: 'Coordino el roadmap y el desarrollo de un ecosistema internacional de servicios web, móviles y cloud para un producto de cocina conectado. Trabajo con dirección, distribuidores y desarrolladores externos, traduciendo necesidades de producto en especificaciones, prioridades y entregas. También introduzco automatizaciones con IA en procesos de documentación, contenido y monitorización.',
      location: 'Cataluña',
    })
    expect(professionalProfile.experience[1]).toMatchObject({
      role: 'Desarrollador full-stack con Django',
      summary: 'Fui responsable de migrar la plataforma interna de la empresa a una arquitectura más moderna y escalable. Desarrollé funcionalidades de CRM y ERP, procesos asíncronos con Celery y RabbitMQ, dashboards y modelos predictivos sobre datos de sensores. También gestioné despliegues, migraciones y entornos de test y producción.',
      location: 'Cataluña',
    })
    expect(professionalProfile.experience.every(entry => entry.sourceId === PROFILE_SOURCE_ID)).toBe(true)
  })

  it('publishes Ainkii as the only selected project', () => {
    expect(professionalProfile.projects.map(project => project.id)).toEqual(['ainkii'])
    const [ainkii] = professionalProfile.projects
    expect(ainkii.canonicalName).toBe('Ainkii')
    expect(ainkii.aliases).toContain('Ainki')
    expect(ainkii.model).toEqual(['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje'])
    expect(ainkii.status).toBe('En desarrollo')
    expect(ainkii).toMatchObject({
      href: '/proyectos/ainkii/',
      teaser: 'Exploración de producto educativo en desarrollo.',
      description: 'Ainkii es un proyecto en desarrollo que explora cómo ordenar materiales de aprendizaje con apoyo de IA.',
    })
    expect(professionalProfile.projects.every(project => project.sourceId === PROFILE_SOURCE_ID)).toBe(true)
  })

  it('does not reintroduce removed employment or agent details', () => {
    const publicEntities = JSON.stringify({
      identity: professionalProfile.identity,
      facts: professionalProfile.facts,
      experience: professionalProfile.experience,
      projects: professionalProfile.projects,
    })
    for (const removedDetail of ['Oliana', '3 distribuidores', '20–25 servicios', 'Android embebido', 'Grafana', 'Telegram', 'Hetzner', '24/7', 'Hermes']) {
      expect(publicEntities).not.toContain(removedDetail)
    }
  })

  it('keeps education and language limits explicit', () => {
    expect(professionalProfile.education).toMatchObject({
      institution: 'Universitat de Lleida',
      startYear: 2018,
      endYear: 2022,
      context: 'El grado me dio una base transversal en electrónica, automatización y programación. Durante esos años orienté cada vez más mi trabajo hacia el desarrollo de software, los datos y los sistemas conectados.',
    })
    expect(professionalProfile.languages).toEqual(expect.arrayContaining([
      expect.objectContaining({ language: 'Catalán', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' }),
      expect.objectContaining({ language: 'Español', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' }),
      expect.objectContaining({ language: 'Inglés', level: 'Uso profesional', context: 'Reuniones, documentación y comunicación técnica con equipos y distribuidores internacionales. Sin certificación oficial.' }),
    ]))
  })
})
