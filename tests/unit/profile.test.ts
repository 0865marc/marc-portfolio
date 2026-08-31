import { describe, expect, it } from 'vitest'
import { PROFILE_SOURCE_ID, professionalProfile } from '../../src/data/portfolio'

describe('professional profile source', () => {
  it('keeps the approved public identity and positioning', () => {
    expect(professionalProfile.identity).toMatchObject({
      fullName: 'Marc Teixidó Rosauro',
      location: 'Balaguer, Lleida',
      headline: 'Ingeniero de software y responsable de proyectos IT',
      summary: 'Construyo y coordino productos digitales, desde el backend y la infraestructura hasta los datos y la automatización.',
      aboutIntro: 'Soy graduado en Ingeniería Electrónica Industrial y Automática. Desde 2022 trabajo desarrollando software y he ido asumiendo cada vez más responsabilidad sobre arquitectura, proveedores y decisiones técnicas. Me interesa entender los problemas de principio a fin y usar la automatización —incluida la IA— cuando aporta una mejora real.',
      seo: {
        title: 'Marc Teixidó — Ingeniero de software y responsable de proyectos IT',
        description: 'Portfolio de Marc Teixidó: desarrollo de software, coordinación de proyectos IT, datos, infraestructura y automatización.',
        imageAlt: 'Marc Teixidó — Ingeniero de software y responsable de proyectos IT',
      },
    })
    expect(professionalProfile.source.id).toBe(PROFILE_SOURCE_ID)
    expect(professionalProfile.facts).toEqual([
      {
        label: 'Trayectoria',
        value: 'Desde 2022',
        context: 'Del desarrollo full-stack a la coordinación de proyectos y productos digitales.',
      },
      {
        label: 'Producto integral',
        value: 'De principio a fin',
        context: 'Entiendo el problema, aterrizo la solución y acompaño su implementación.',
      },
      {
        label: 'Base técnica',
        value: 'Ingeniería y software',
        context: 'Una visión técnica para conectar producto, negocio y desarrollo.',
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
      teaser: 'Proyecto educativo en desarrollo.',
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
