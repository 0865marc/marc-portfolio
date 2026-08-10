export const PROFILE_SOURCE_ID = 'profile-2026-08-10' as const

export type ProfileFact = {
  label: string
  value: string
  context: string
}

export type ExperienceSection = {
  title: string
  items: string[]
}

export type AppliedAIUse = {
  title: string
  description: string
}

export type Experience = {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  period: string
  location: string
  workMode: string | null
  summary: string
  responsibilities: string[]
  publicSections: ExperienceSection[]
  technologies: string[]
  appliedAI: AppliedAIUse[]
  sourceId: typeof PROFILE_SOURCE_ID
}

export type Capability = {
  number: string
  name: string
  description: string
  tools: string[]
}

export type Project = {
  id: 'ainkii' | 'hermes'
  number: string
  canonicalName: string
  aliases: string[]
  category: string
  status: string
  flagship: boolean
  href: string
  description: string
  focus: string
  tags: string[]
  audience: string | null
  model: string[]
  capabilities: string[]
  principle: string
  sourceId: typeof PROFILE_SOURCE_ID
}

export type SkillGroup = {
  id: string
  name: string
  levelNote: string | null
  items: string[]
}

export type ProfessionalProfile = {
  source: {
    id: typeof PROFILE_SOURCE_ID
    reviewedAt: string
    visibility: 'public'
    authority: string
  }
  identity: {
    fullName: string
    displayName: string
    location: string
    headline: string
    shortPositioning: string
    summary: string
    narrative: string
  }
  journey: string[]
  facts: ProfileFact[]
  experience: Experience[]
  capabilities: Capability[]
  technicalProfile: SkillGroup[]
  professionalStrengths: string[]
  education: {
    qualification: string
    institution: string
    startYear: number
    endYear: number
    context: string
  }
  languages: Array<{
    language: string
    level: string
    context: string
  }>
  projects: Project[]
  contacts: {
    email: string
    linkedin: string
  }
  knowledgePolicy: {
    unknownAnswer: string
    rules: string[]
  }
}

export const professionalProfile: ProfessionalProfile = {
  source: {
    id: PROFILE_SOURCE_ID,
    reviewedAt: '2026-08-10',
    visibility: 'public',
    authority: 'Fuente factual proporcionada por Marc Teixidó Rosauro.',
  },
  identity: {
    fullName: 'Marc Teixidó Rosauro',
    displayName: 'Marc Teixidó',
    location: 'Balaguer, Lleida',
    headline: 'Software Engineer · IT Project Lead · AI & Automation',
    shortPositioning: 'Ingeniero especializado en software, proyectos IT, datos y automatización.',
    summary:
      'Combino una base técnica en desarrollo full-stack, backend, infraestructura y datos con experiencia coordinando producto, roadmap y equipos tecnológicos internacionales.',
    narrative:
      'Empecé construyendo plataformas web, procesos asíncronos y modelos sobre datos de sensores. Hoy conecto necesidades de negocio con especificaciones, arquitectura, ejecución, infraestructura y automatización, manteniendo criterio técnico en cada capa.',
  },
  journey: ['Negocio y producto', 'Especificación', 'Arquitectura', 'Desarrollo', 'Infraestructura', 'Datos', 'Automatización e IA'],
  facts: [
    {
      label: 'Trayectoria',
      value: 'Casi 4 años',
      context: 'Software, datos, automatización y gestión de proyectos IT desde septiembre de 2022.',
    },
    {
      label: 'Ecosistema actual',
      value: '3 distribuidores',
      context: 'Entornos cloud y servicios propios coordinados en un contexto internacional.',
    },
    {
      label: 'Coordinación actual',
      value: '20–25 servicios',
      context: 'Web, APIs, bases de datos, móvil, Android embebido e infraestructura asociada.',
    },
  ],
  experience: [
    {
      id: 'taurus-rd',
      company: 'Taurus Research & Development',
      role: 'Responsable de proyectos IT / IT Project Lead',
      startDate: '2025-06',
      endDate: null,
      period: 'Jun 2025 — Actualidad',
      location: 'Oliana',
      workMode: 'Híbrido',
      summary:
        'Coordino el ecosistema tecnológico asociado a un producto de cocina conectado. Reporto al Director de R+D y participo en prioridades, roadmap técnico, validación de entregas y coordinación internacional.',
      responsibilities: [
        'Coordinar el desarrollo de productos y servicios.',
        'Definir y seguir el roadmap técnico.',
        'Convertir necesidades de producto y negocio en especificaciones técnicas.',
        'Priorizar desarrollos y validar implementaciones y entregas.',
        'Coordinar dirección, distribuidores y desarrolladores externos.',
        'Gestionar infraestructura, entornos cloud, despliegues y funcionamiento de servicios.',
        'Presentar proyectos, decisiones técnicas, costes y fechas a dirección.',
        'Elaborar documentación técnica y demostrar herramientas internas.',
        'Explicar sistemas complejos a dirección y distribuidores.',
      ],
      publicSections: [
        {
          title: 'Ecosistema internacional',
          items: [
            '3 distribuidores, cada uno con su propio entorno cloud y servicios asociados.',
            'Aproximadamente 20–25 servicios entre web, APIs, bases de datos, iOS, Android y Android embebido.',
            'Coordinación de 4 desarrolladores externos especializados, principalmente en India y con comunicación técnica en inglés.',
          ],
        },
        {
          title: 'Producto y ejecución',
          items: [
            'Roadmap, prioridades y traducción de necesidades de negocio a especificaciones técnicas.',
            'Validación de implementaciones, supervisión de despliegues y operación de los distintos entornos.',
            'Presentación de decisiones, costes, fechas y sistemas complejos a dirección y distribuidores.',
          ],
        },
      ],
      technologies: ['Docker', 'Terraform', 'Grafana', 'Prometheus', 'APIs', 'Bases de datos', 'Cloud', 'Web y móvil', 'Android embebido'],
      appliedAI: [
        {
          title: 'Especificaciones asistidas',
          description:
            'Uso de IA para estructurar requisitos y cambios, reducir trabajo manual y mejorar la comunicación entre producto, coordinación y desarrollo.',
        },
        {
          title: 'Contenido de usuarios',
          description:
            'Procesos basados en IA para analizar, clasificar, revisar o gestionar contenido subido por los usuarios.',
        },
        {
          title: 'Detección de anomalías',
          description:
            'Experimentación con información de Grafana y monitorización para detectar comportamientos anómalos y facilitar la identificación preventiva de problemas.',
        },
      ],
      sourceId: PROFILE_SOURCE_ID,
    },
    {
      id: 'mcsystems',
      company: 'MCSystems',
      role: 'Django Full-stack Developer / Software Engineer',
      startDate: '2022-09',
      endDate: '2025-06',
      period: 'Sep 2022 — Jun 2025',
      location: 'Tàrrega',
      workMode: null,
      summary:
        'Fui responsable de migrar la aplicación web anterior hacia una plataforma más moderna, mantenible y escalable, trabajando en desarrollo full-stack, backend, bases de datos, procesamiento, infraestructura y mantenimiento.',
      responsibilities: [
        'Migrar la aplicación web anterior a una nueva plataforma Django.',
        'Desarrollar funcionalidades de CRM, ERP, operación, visualización, dashboards y herramientas internas.',
        'Procesar datos procedentes de sensores distribuidos globalmente.',
        'Desarrollar tareas pesadas en segundo plano con RabbitMQ y Celery.',
        'Gestionar producción, test, despliegues, migraciones, actualizaciones, mantenimiento e incidencias.',
        'Desarrollar e integrar modelos estadísticos predictivos para patrones de consumo.',
        'Construir dashboards y herramientas de visualización para apoyar decisiones.',
      ],
      publicSections: [
        {
          title: 'Plataforma central',
          items: [
            'CRM, ERP, gestión operativa, herramientas internas y visualización de información.',
            'Procesamiento de datos procedentes de sensores distribuidos globalmente.',
            'Trabajo de extremo a extremo entre aplicación, datos, infraestructura y mantenimiento.',
          ],
        },
        {
          title: 'Datos y asincronía',
          items: [
            'RabbitMQ y Celery para ejecutar procesamiento pesado sin bloquear la aplicación principal.',
            'Regresiones, series temporales y análisis histórico para predecir patrones de consumo.',
            'Dashboards que convertían grandes volúmenes de datos en información útil.',
          ],
        },
        {
          title: 'Operación',
          items: [
            'Entornos de producción y test, despliegues, migraciones y actualizaciones.',
            'Mantenimiento técnico y resolución de incidencias.',
          ],
        },
      ],
      technologies: ['Python', 'Django', 'PostgreSQL', 'SQLite', 'RabbitMQ', 'Celery', 'JavaScript', 'Bootstrap', 'HTML', 'CSS / SCSS', 'Linux', 'Git'],
      appliedAI: [],
      sourceId: PROFILE_SOURCE_ID,
    },
  ],
  capabilities: [
    {
      number: '01',
      name: 'Producto y proyectos IT',
      description:
        'Convierto necesidades de negocio en prioridades, especificaciones y un roadmap que equipos técnicos y stakeholders pueden compartir.',
      tools: ['Roadmap', 'Priorización', 'Especificaciones', 'Validación', 'Comunicación internacional'],
    },
    {
      number: '02',
      name: 'Backend y arquitectura',
      description:
        'Construyo y razono sistemas backend, APIs y procesos asíncronos, con especial profundidad en el ecosistema Python y Django.',
      tools: ['Python', 'Django', 'FastAPI', 'Celery', 'RabbitMQ', 'Redis', 'REST'],
    },
    {
      number: '03',
      name: 'Datos y modelos',
      description:
        'Trabajo con datos de sensores, series temporales, regresiones, modelos predictivos, métricas y visualización orientada a decisiones.',
      tools: ['PostgreSQL', 'SQLite', 'Series temporales', 'Regresiones', 'Dashboards', 'Métricas'],
    },
    {
      number: '04',
      name: 'Infraestructura y operación',
      description:
        'Gestiono entornos cloud y VPS de forma directa, desde despliegues y CI/CD hasta observabilidad, mantenimiento e incidencias.',
      tools: ['Linux', 'Docker', 'Terraform', 'CI/CD', 'VPS', 'Grafana', 'Prometheus'],
    },
    {
      number: '05',
      name: 'IA y automatización aplicada',
      description:
        'Integro modelos y agentes en procesos reales con límites explícitos: contenido, especificaciones, desarrollo, supervisión y detección de anomalías.',
      tools: ['ChatGPT', 'Codex', 'Claude Code', 'APIs de modelos', 'Agentes', 'Automatización'],
    },
  ],
  technicalProfile: [
    {
      id: 'backend',
      name: 'Backend y programación',
      levelNote: 'Python y Django avanzado/experto; FastAPI y Celery avanzados.',
      items: ['Python', 'Django', 'FastAPI', 'Celery', 'RabbitMQ', 'Redis', 'APIs REST', 'Procesamiento asíncrono', 'Arquitectura backend'],
    },
    {
      id: 'databases',
      name: 'Bases de datos',
      levelNote: null,
      items: ['PostgreSQL', 'SQLite', 'Diseño de bases de datos', 'Procesamiento y análisis de datos'],
    },
    {
      id: 'frontend',
      name: 'Frontend',
      levelNote: 'Orientado a construir productos completos e integrar todas sus capas.',
      items: ['JavaScript', 'React', 'Astro', 'Tailwind CSS', 'HTML', 'CSS / SCSS', 'Bootstrap'],
    },
    {
      id: 'infrastructure',
      name: 'Infraestructura y DevOps',
      levelNote: 'Experiencia centrada en VPS y cloud gestionada directamente.',
      items: ['Linux', 'Docker', 'Terraform', 'Git', 'GitLab / GitHub', 'CI/CD', 'VPS', 'Producción y test', 'Grafana', 'Prometheus'],
    },
    {
      id: 'data',
      name: 'Datos',
      levelNote: null,
      items: ['Sensores', 'Series temporales', 'Regresiones', 'Modelos estadísticos', 'Modelos predictivos', 'Dashboards', 'Métricas', 'Monitorización', 'Detección de anomalías'],
    },
  ],
  professionalStrengths: [
    'Gestión y coordinación de proyectos IT.',
    'Definición de roadmap y priorización de tareas.',
    'Coordinación de desarrolladores externos y validación de entregas.',
    'Comunicación entre negocio, dirección, distribuidores y tecnología.',
    'Preparación de estimaciones, costes, fechas y documentación técnica.',
    'Presentaciones y demostraciones de herramientas internas.',
    'Traducción de problemas de negocio a soluciones técnicas.',
    'Análisis de nuevas tecnologías y automatización de procesos.',
  ],
  education: {
    qualification: 'Grado en Ingeniería Electrónica Industrial y Automática',
    institution: 'Universitat de Lleida',
    startYear: 2018,
    endYear: 2022,
    context:
      'Una base de ingeniería, automatización, electrónica y programación que después orienté hacia software, datos y sistemas tecnológicos.',
  },
  languages: [
    { language: 'Catalán', level: 'Nativo', context: 'Uso cotidiano y profesional.' },
    { language: 'Español', level: 'Nativo', context: 'Uso cotidiano y profesional.' },
    {
      language: 'Inglés',
      level: 'Profesional funcional',
      context: 'Reuniones, documentación y comunicación técnica con distribuidores y desarrolladores internacionales; sin certificación oficial.',
    },
  ],
  projects: [
    {
      id: 'ainkii',
      number: '01',
      canonicalName: 'Ainkii',
      aliases: ['Ainki'],
      category: 'Producto personal · AI-first',
      status: 'En desarrollo',
      flagship: true,
      href: '/proyectos/ainkii/',
      description:
        'Una plataforma educativa que ayuda a profesores y creadores a estructurar, revisar y mejorar materiales de aprendizaje con IA.',
      focus: 'Producto educativo, estructura del conocimiento e IA con validación humana',
      tags: ['Producto educativo', 'IA aplicada', 'Copiloto editorial', 'Human-in-the-loop'],
      audience: 'Profesores y creadores de contenido educativo.',
      model: ['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje'],
      capabilities: [
        'Analizar la estructura de un curso.',
        'Detectar posibles huecos de conocimiento.',
        'Proponer nuevos temas o conocimientos.',
        'Revisar contenidos existentes y detectar relaciones.',
        'Generar o mejorar materiales educativos.',
        'Crear tarjetas de aprendizaje.',
        'Transformar contenido existente en material estructurado para estudiar.',
        'Asistir durante la creación y revisión del temario.',
      ],
      principle:
        'La IA actúa como copiloto editorial: no sustituye al profesor y los cambios importantes requieren validación y aprobación del usuario.',
      sourceId: PROFILE_SOURCE_ID,
    },
    {
      id: 'hermes',
      number: '02',
      canonicalName: 'Hermes',
      aliases: [],
      category: 'Agente autónomo personal',
      status: 'Operativo · 24/7',
      flagship: false,
      href: '/blog/hermes-agent-hetzner-instalacion-segura/',
      description:
        'Un agente desplegado permanentemente en un VPS de Hetzner, con Telegram como interfaz de interacción y supervisión y herramientas conectadas al desarrollo.',
      focus: 'Autonomía útil con permisos, supervisión y aprobaciones explícitas',
      tags: ['Agentes', 'Hetzner', 'Telegram', 'Codex', 'Automatización'],
      audience: null,
      model: ['Telegram', 'Hermes 24/7', 'Herramientas de desarrollo', 'Supervisión humana'],
      capabilities: [
        'Ejecutar tareas de desarrollo.',
        'Coordinar trabajo mediante agentes.',
        'Revisar Pull Requests y supervisar cambios.',
        'Desplegar cambios automáticamente.',
        'Ejecutar procesos periódicos.',
        'Interactuar conmigo mediante Telegram.',
      ],
      principle:
        'El objetivo es decidir qué puede hacer el agente por sí mismo, qué necesita aprobación y cómo estructurar workflows que eviten comportamientos no deseados.',
      sourceId: PROFILE_SOURCE_ID,
    },
  ],
  contacts: {
    email: '0865marc@gmail.com',
    linkedin: 'https://linkedin.com/in/marc-teixid%C3%B3-rosauro',
  },
  knowledgePolicy: {
    unknownAnswer: 'Ese dato no consta en el perfil público de Marc.',
    rules: [
      'Responder únicamente con hechos presentes en esta fuente pública.',
      'No inferir empresas, tecnologías, cifras, resultados, disponibilidad o certificaciones.',
      'Usar Ainkii como nombre canónico y tratar Ainki únicamente como alias histórico.',
      'No presentar el inglés como nativo o bilingüe.',
      'No elevar el posicionamiento a experto en IA, AI leader, CTO o consultor sénior de IA.',
    ],
  },
}

export const experience = professionalProfile.experience
export const capabilities = professionalProfile.capabilities
export const projects = professionalProfile.projects
