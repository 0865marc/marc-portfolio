import { describe, expect, it } from 'vitest'
import { PROFILE_SOURCE_ID, PROJECT_SOURCE_ID, professionalProfile } from '../../src/data/portfolio'

describe('professional profile source', () => {
  it('keeps the approved public identity and positioning', () => {
    expect(professionalProfile.identity).toMatchObject({
      fullName: 'Marc Teixidó Rosauro',
      location: 'Balaguer, Lleida',
      headline: 'Ingeniero de software y responsable de proyectos IT',
      positioning: 'Ingeniería de software y gestión de proyectos IT con orientación a producto',
      summary: 'Desarrollo software y lidero proyectos IT, conectando necesidades de negocio, decisiones técnicas y entrega. Mi experiencia combina desarrollo full-stack con la gestión del roadmap, la coordinación entre departamentos y la ejecución con desarrolladores externos.',
      aboutIntro: 'Mi trayectoria combina desarrollo de aplicaciones de negocio, migración de plataformas y responsabilidad sobre un producto IoT. Además, desarrollo productos propios, manteniendo una práctica técnica activa y una perspectiva que conecta software, producto y negocio.',
      seo: {
        title: 'Marc Teixidó — Ingeniería de software y proyectos IT',
        description: 'Desarrollo full-stack, orientación a producto y gestión de proyectos IT. Experiencia, proyectos y formación de Marc Teixidó.',
        imageAlt: 'Marc Teixidó — Ingeniero de software y responsable de proyectos IT, con experiencia en desarrollo full-stack y gestión del roadmap.',
      },
    })
    expect(professionalProfile.source.id).toBe(PROFILE_SOURCE_ID)
    expect(professionalProfile.facts).toEqual([
      {
        label: 'Desarrollo de software',
        value: 'Full-stack',
        context: 'Aplicaciones de negocio con Django, procesos asíncronos, datos y despliegues.',
      },
      {
        label: 'Gestión de proyectos IT',
        value: 'Roadmap y ejecución',
        context: 'Coordinación entre departamentos y desarrolladores externos, desde las necesidades de producto hasta las entregas.',
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
      summary: 'Soy responsable del roadmap de un producto IoT con servicios web, móviles y cloud. Coordino su ejecución con desarrolladores externos y hago seguimiento de las entregas. Trabajo con atención al cliente, marketing y comercial para traducir las necesidades del producto en prioridades de desarrollo. Colaboro también con dirección y distribuidores en un entorno internacional. Además, incorporo automatizaciones con IA en procesos de documentación, contenido y monitorización.',
      location: 'Cataluña',
    })
    expect(professionalProfile.experience[1]).toMatchObject({
      role: 'Desarrollador full-stack con Django',
      summary: 'Fui responsable de la migración de la plataforma interna de la empresa. Desarrollé funcionalidades de CRM y ERP con Django, procesos asíncronos con Celery y RabbitMQ, dashboards y modelos predictivos sobre datos de sensores. Gestioné también despliegues, migraciones y entornos de pruebas y producción.',
      location: 'Cataluña',
    })
    expect(professionalProfile.experience.every(entry => entry.sourceId === PROFILE_SOURCE_ID)).toBe(true)
  })

  it('distinguishes the public ButiPunt app from the Ainkii landing', () => {
    expect(professionalProfile.projects.map(project => project.id)).toEqual(['ainkii', 'butipunt'])
    const [ainkii, butipunt] = professionalProfile.projects
    expect(ainkii.canonicalName).toBe('Ainkii')
    expect(ainkii.aliases).toContain('Ainki')
    expect(ainkii.model).toEqual(['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje'])
    expect(ainkii.status).toBe('En desarrollo')
    expect(ainkii).toMatchObject({
      href: '/proyectos/ainkii/',
      website: 'https://ainkii.mteixido.dev/',
      availability: 'Presentación y demo públicas. Aplicación interna en desarrollo, todavía sin acceso público.',
    })
    expect(butipunt).toMatchObject({
      canonicalName: 'ButiPunt',
      status: 'Disponible',
      href: '/proyectos/butipunt/',
      website: 'https://butipunt.mteixido.dev/',
    })
    expect(professionalProfile.projects.every(project => project.sourceId === PROJECT_SOURCE_ID)).toBe(true)
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
      context: 'El grado me dio una base transversal en electrónica, automatización y programación. Orienté mis optativas hacia el Internet de las Cosas (IoT), la programación y las comunicaciones.',
    })
    expect(professionalProfile.languages).toEqual(expect.arrayContaining([
      expect.objectContaining({ language: 'Catalán', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' }),
      expect.objectContaining({ language: 'Español', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' }),
      expect.objectContaining({ language: 'Inglés', level: 'Uso profesional', context: 'Reuniones, documentación y comunicación técnica con equipos y distribuidores internacionales.' }),
    ]))
  })
})
