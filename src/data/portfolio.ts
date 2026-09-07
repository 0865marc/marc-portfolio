export const PROFILE_SOURCE_ID = 'profile-2026-08-10' as const

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
  id: 'ainkii'
  canonicalName: string
  aliases: string[]
  category: string
  status: string
  href: string
  teaser: string
  description: string
  focus: string
  tags: string[]
  audience: string
  model: string[]
  capabilities: string[]
  principle: string
  sourceId: typeof PROFILE_SOURCE_ID
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
    reviewedAt: '2026-08-10',
    visibility: 'public',
    authority: 'Fuente factual proporcionada por Marc Teixidó Rosauro.',
  },
  identity: {
    fullName: 'Marc Teixidó Rosauro',
    displayName: 'Marc Teixidó',
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
  },
  facts: [
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
      summary: 'Coordino el roadmap y el desarrollo de un ecosistema internacional de servicios web, móviles y cloud para un producto de cocina conectado. Trabajo con dirección, distribuidores y desarrolladores externos, traduciendo necesidades de producto en especificaciones, prioridades y entregas. También introduzco automatizaciones con IA en procesos de documentación, contenido y monitorización.',
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
      summary: 'Fui responsable de migrar la plataforma interna de la empresa a una arquitectura más moderna y escalable. Desarrollé funcionalidades de CRM y ERP, procesos asíncronos con Celery y RabbitMQ, dashboards y modelos predictivos sobre datos de sensores. También gestioné despliegues, migraciones y entornos de test y producción.',
      sourceId: PROFILE_SOURCE_ID,
    },
  ],
  education: {
    qualification: 'Grado en Ingeniería Electrónica Industrial y Automática',
    institution: 'Universitat de Lleida',
    startYear: 2018,
    endYear: 2022,
    context: 'El grado me dio una base transversal en electrónica, automatización y programación. Durante esos años orienté cada vez más mi trabajo hacia el desarrollo de software, los datos y los sistemas conectados.',
  },
  languages: [
    { language: 'Catalán', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' },
    { language: 'Español', level: 'Nativo', context: 'Uso habitual en entornos personales y profesionales.' },
    { language: 'Inglés', level: 'Uso profesional', context: 'Reuniones, documentación y comunicación técnica con equipos y distribuidores internacionales. Sin certificación oficial.' },
  ],
  projects: [
    {
      id: 'ainkii',
      canonicalName: 'Ainkii',
      aliases: ['Ainki'],
      category: 'Producto educativo personal',
      status: 'En desarrollo',
      href: '/proyectos/ainkii/',
      teaser: 'Exploración de producto educativo en desarrollo.',
      description: 'Ainkii es un proyecto en desarrollo que explora cómo ordenar materiales de aprendizaje con apoyo de IA.',
      focus: 'Recorrido de un temario a materiales de estudio',
      tags: ['Producto educativo', 'IA aplicada', 'Materiales de aprendizaje'],
      audience: 'Profesores y creadores de materiales educativos.',
      model: ['Temarios', 'Temas', 'Conocimientos', 'Tarjetas de aprendizaje'],
      capabilities: [
        'Revisar la estructura de un curso.',
        'Señalar posibles huecos de conocimiento.',
        'Proponer temas o conocimientos para revisar.',
        'Relacionar contenidos existentes.',
        'Ayudar a redactar o revisar materiales educativos.',
        'Crear tarjetas de aprendizaje.',
        'Convertir contenido existente en material estructurado para estudiar.',
        'Acompañar la creación y revisión de un temario.',
      ],
      principle: 'El profesor decide los cambios.',
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
export const projects = professionalProfile.projects
