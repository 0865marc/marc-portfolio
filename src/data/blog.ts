import { PROFILE_SOURCE_ID } from './portfolio'

export type BlogArticleSection = {
  heading: string
  paragraphs: string[]
  points?: string[]
}

export type BlogPost = {
  id: string
  category: string
  tags: string[]
  title: string
  excerpt: string
  publishedAt: string
  sourceId: typeof PROFILE_SOURCE_ID
  introduction: string[]
  sections: BlogArticleSection[]
  takeaway: string[]
}

export type LegacyBlogRoute = {
  id: string
  formerTitle: string
  destination: '/blog/'
}

export const blogPosts: BlogPost[] = [
  {
    id: 'hermes-agent-hetzner-instalacion-segura',
    category: 'Agentes y automatización',
    tags: ['Hermes', 'Hetzner', 'Telegram', 'Codex', 'Supervisión humana'],
    title: 'Hermes: autonomía útil con supervisión humana',
    excerpt:
      'Qué estoy aprendiendo al mantener un agente activo 24/7 y decidir qué puede ejecutar solo, qué necesita aprobación y cómo conservar el control.',
    publishedAt: '2026-08-10',
    sourceId: PROFILE_SOURCE_ID,
    introduction: [
      'Hermes es un agente autónomo que mantengo desplegado 24/7 en un VPS de Hetzner. Telegram funciona como interfaz para interactuar con él y supervisar su actividad, mientras el sistema se conecta con herramientas de desarrollo y puede ejecutar tareas autónomas y periódicas.',
      'Lo que me interesa no es presentar otro chatbot, sino explorar una pregunta de ingeniería y producto: cuánta autonomía resulta realmente útil cuando un agente puede actuar sobre herramientas, cambios y despliegues, y cómo se conserva una supervisión humana clara.',
    ],
    sections: [
      {
        heading: 'Un agente que puede actuar',
        paragraphs: [
          'Hermes no se limita a responder texto. Puede ejecutar tareas de desarrollo, coordinar trabajo mediante otros agentes, revisar Pull Requests, supervisar cambios, desplegar y mantener procesos periódicos. Esa capacidad de actuar es precisamente lo que hace necesario diseñar sus límites con cuidado.',
          'El sistema vive de forma permanente en un VPS. Esta continuidad permite encargar procesos que no dependen de mantener una sesión local abierta, pero también obliga a pensar en estados, permisos y mecanismos de supervisión antes de aumentar su alcance.',
        ],
      },
      {
        heading: 'Telegram como interfaz de supervisión',
        paragraphs: [
          'Telegram es la interfaz desde la que interactúo con el agente y sigo su actividad. Tener un canal cotidiano reduce la fricción para iniciar o revisar trabajo, y mantiene visible que existe una persona responsable detrás de las decisiones importantes.',
          'La interfaz no cambia el principio de control: una instrucción accesible no implica que toda acción deba ser automática. El valor está en separar con claridad conversación, ejecución y aprobación.',
        ],
      },
      {
        heading: 'Trabajo conectado al desarrollo',
        paragraphs: [
          'Habitualmente Hermes utiliza Codex con GPT-5.6 Sol para tareas de programación. Su entorno está conectado con herramientas de desarrollo para que pueda trabajar sobre tareas concretas y coordinar procesos que normalmente requerirían varias intervenciones manuales.',
        ],
        points: [
          'Ejecutar tareas de desarrollo y coordinar trabajo mediante agentes.',
          'Revisar Pull Requests y supervisar cambios.',
          'Desplegar cambios automáticamente dentro de los workflows definidos.',
          'Ejecutar procesos periódicos e interactuar conmigo mediante Telegram.',
        ],
      },
      {
        heading: 'Autonomía no significa permiso ilimitado',
        paragraphs: [
          'Mi foco está en decidir qué acciones puede completar un agente por sí mismo y cuáles necesitan una aprobación explícita. Cuanto mayor es el impacto potencial de una acción, más importante resulta que el workflow haga visible el contexto, la evidencia y el punto exacto de decisión humana.',
          'La supervisión tampoco consiste en revisar manualmente cada paso. Consiste en construir fronteras comprensibles: tareas acotadas, herramientas con un propósito concreto y gates que impiden convertir una instrucción ambigua en un cambio difícil de revertir.',
        ],
      },
      {
        heading: 'Un laboratorio práctico de sistemas agénticos',
        paragraphs: [
          'Hermes es un proyecto en evolución y un entorno de experimentación continua. Me permite probar nuevas formas de desarrollar software con modelos de lenguaje, observar dónde aportan autonomía real y detectar qué partes siguen necesitando criterio humano.',
          'El aprendizaje principal no está en conseguir que el agente haga más cosas, sino en hacer que cada capacidad tenga un alcance, una supervisión y una responsabilidad que se puedan explicar.',
        ],
      },
    ],
    takeaway: [
      'Un agente útil no es el que puede hacerlo todo, sino el que combina capacidad de ejecución con límites comprensibles y una ruta clara de aprobación humana.',
    ],
  },
]

export const legacyBlogRoutes: LegacyBlogRoute[] = [
  {
    id: 'arquitecturas-plataformas-iot',
    formerTitle: 'Arquitecturas para plataformas IoT',
    destination: '/blog/',
  },
  {
    id: 'rabbitmq-celery-procesos-pesados',
    formerTitle: 'RabbitMQ y Celery para procesos pesados',
    destination: '/blog/',
  },
  {
    id: 'infraestructura-distribuida-latencia',
    formerTitle: 'Infraestructura distribuida y latencia',
    destination: '/blog/',
  },
]
