export const PROFILE_SOURCE_ID = 'profile-2026-09-16' as const
export const PROJECT_SOURCE_ID = 'public-projects-2026-09-16' as const

export type ProfileFact = {
  label: string
  value: string
  context: string
}

export type Experience = {
  id: string
  company: string
  role: string
  startDate: string
  endDate: string | null
  period: string
  location: string
  summary: string
  sourceId: typeof PROFILE_SOURCE_ID
}

export type Project = {
  id: 'ainkii' | 'butipunt'
  canonicalName: string
  aliases: string[]
  category: string
  status: string
  availability: string
  website: string
  websiteLabel: string
  logo: { src: string; width: number; height: number }
  href: string
  teaser: string
  description: string
  focus: string
  tags: string[]
  audience: string
  model: string[]
  capabilities: string[]
  principle: string
  sourceId: typeof PROJECT_SOURCE_ID
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
    positioning: string
    summary: string
    aboutIntro: string
    seo: {
      title: string
      description: string
      imageAlt: string
    }
  }
  facts: ProfileFact[]
  experience: Experience[]
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
    reviewedAt: '2026-09-16',
    visibility: 'public',
    authority: 'Fuente factual proporcionada por Marc Teixidó Rosauro.',
  },
  identity: {
    fullName: 'Marc Teixidó Rosauro',
    displayName: 'Marc Teixidó',
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
  },
  facts: [
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
  ],
  experience: [
    {
      id: 'current-it-projects',
      company: 'Taurus Research & Development',
      role: 'Responsable de proyectos IT',
      startDate: '2025',
      endDate: null,
      period: '2025 — Actualidad',
      location: 'Cataluña',
      summary: 'Soy responsable del roadmap de un producto IoT con servicios web, móviles y cloud. Coordino su ejecución con desarrolladores externos y hago seguimiento de las entregas. Trabajo con atención al cliente, marketing y comercial para traducir las necesidades del producto en prioridades de desarrollo. Colaboro también con dirección y distribuidores en un entorno internacional. Además, incorporo automatizaciones con IA en procesos de documentación, contenido y monitorización.',
      sourceId: PROFILE_SOURCE_ID,
    },
    {
      id: 'mcsystems',
      company: 'MCSystems',
      role: 'Desarrollador full-stack con Django',
      startDate: '2022-09',
      endDate: '2025-06',
      period: '2022 — 2025',
      location: 'Cataluña',
      summary: 'Fui responsable de la migración de la plataforma interna de la empresa. Desarrollé funcionalidades de CRM y ERP con Django, procesos asíncronos con Celery y RabbitMQ, dashboards y modelos predictivos sobre datos de sensores. Gestioné también despliegues, migraciones y entornos de pruebas y producción.',
      sourceId: PROFILE_SOURCE_ID,
    },
  ],
  education: {
    qualification: 'Grado en Ingeniería Electrónica Industrial y Automática',
    institution: 'Universitat de Lleida',
    startYear: 2018,
    endYear: 2022,
    context: 'El grado me dio una base transversal en electrónica, automatización y programación. Orienté mis optativas hacia el Internet de las Cosas (IoT), la programación y las comunicaciones.',
  },
  languages: [
    { language: 'Catalán', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' },
    { language: 'Español', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' },
    { language: 'Inglés', level: 'Uso profesional', context: 'Reuniones, documentación y comunicación técnica con equipos y distribuidores internacionales.' },
  ],
  projects: [
    {
      id: 'ainkii',
      canonicalName: 'Ainkii',
      aliases: ['Ainki'],
      category: 'Producto educativo personal',
      status: 'En desarrollo',
      availability: 'Presentación y demo públicas. Aplicación interna en desarrollo, todavía sin acceso público.',
      website: 'https://ainkii.mteixido.dev/',
      websiteLabel: 'Ver presentación y demo',
      logo: { src: '/media/projects/ainkii-logo.svg', width: 320, height: 100 },
      href: '/proyectos/ainkii/',
      teaser: 'Desarrollo una plataforma educativa que conecta contenidos, tarjetas de práctica y seguimiento del aprendizaje para alumnos y academias. La propuesta incorpora IA para preparar materiales bajo revisión docente.',
      description: 'Estoy desarrollando Ainkii para conectar lo que una academia enseña con lo que sus alumnos comprenden y practican: temarios estructurados, tarjetas vinculadas al contenido y seguimiento del aprendizaje.',
      focus: 'Entender, practicar y reconocer el avance.',
      tags: ['Aprendizaje conectado', 'IA editorial', 'Alumnos y academias'],
      audience: 'Alumnos que estudian con su academia y docentes que preparan y acompañan ese recorrido.',
      model: ['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje'],
      capabilities: [
        'Organizar temarios en temas y conocimientos conectados mediante relaciones y requisitos.',
        'Practicar con tarjetas vinculadas a los conocimientos leídos y orientar el repaso según los resultados.',
        'Consultar lecturas, práctica y precisión para acompañar el progreso de cada alumno.',
        'Preparar borradores a partir de fuentes PDF y vídeo, con propuestas de IA que se revisan antes de aplicarse.',
      ],
      principle: 'El profesor decide los cambios.',
      sourceId: PROJECT_SOURCE_ID,
    },
    {
      id: 'butipunt',
      canonicalName: 'ButiPunt',
      aliases: [],
      category: 'Gestión de torneos presenciales',
      status: 'Disponible',
      availability: 'Aplicación pública, sin registro. El torneo se guarda en el navegador del dispositivo.',
      website: 'https://butipunt.mteixido.dev/',
      websiteLabel: 'Abrir ButiPunt',
      logo: { src: '/media/projects/butipunt-logo.svg', width: 320, height: 100 },
      href: '/proyectos/butipunt/',
      teaser: 'He creado una aplicación web para organizar torneos presenciales de butifarra: inscripción de parejas, emparejamientos, resultados y clasificación, sin registro y con guardado local.',
      description: 'He creado ButiPunt para llevar la organización de un torneo de butifarra de principio a fin. Reúne parejas, mesas, rondas y clasificación, mientras las partidas se juegan presencialmente.',
      focus: 'El juego, en la mesa. El torneo, organizado.',
      tags: ['Torneos de butifarra', 'Sin registro', 'Guardado local'],
      audience: 'Personas que organizan torneos presenciales de butifarra por parejas.',
      model: ['Parejas', 'Rondas', 'Resultados', 'Clasificación'],
      capabilities: [
        'Crear un torneo con nombre, número de rondas y los dos jugadores de cada pareja.',
        'Sortear la primera ronda y consultar las parejas asignadas a cada mesa.',
        'Anotar y confirmar resultados, corregir los de la ronda actual y consultar rondas anteriores.',
        'Actualizar la clasificación y preparar las siguientes rondas según victorias y puntos.',
      ],
      principle: 'Las partidas se juegan en la mesa; la aplicación lleva la organización.',
      sourceId: PROJECT_SOURCE_ID,
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
export const projects = professionalProfile.projects
