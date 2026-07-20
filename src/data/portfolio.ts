export type Service = {
  number: string
  name: string
  description: string
}

export type Experience = {
  id: string
  title: string
  description: string
  stack: string
}

export type Project = {
  number: string
  category: string
  name: string
  images: [string, string, string]
}

export const marqueeGifs = [
  'https://motionsites.ai/assets/hero-space-voyage-preview-eECLH3Yc.gif',
  'https://motionsites.ai/assets/hero-codenest-preview-Cgppc2qV.gif',
  'https://motionsites.ai/assets/hero-vex-ventures-preview-BczMFIiw.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-v2-preview-DjvxjG3C.gif',
  'https://motionsites.ai/assets/hero-asme-preview-B_nGDnTP.gif',
  'https://motionsites.ai/assets/hero-transform-data-preview-Cx5OU29N.gif',
  'https://motionsites.ai/assets/hero-vitara-preview-Cjz2QYyU.gif',
  'https://motionsites.ai/assets/hero-terra-preview-BFjrCr7T.gif',
  'https://motionsites.ai/assets/hero-skyelite-preview-DHaZIgUv.gif',
  'https://motionsites.ai/assets/hero-aethera-preview-DknSlcTa.gif',
  'https://motionsites.ai/assets/hero-designpro-preview-D8c5_een.gif',
  'https://motionsites.ai/assets/hero-stellar-ai-preview-D3HL6bw1.gif',
  'https://motionsites.ai/assets/hero-xportfolio-preview-D4A8maiC.gif',
  'https://motionsites.ai/assets/hero-orbit-web3-preview-BXt4OttD.gif',
  'https://motionsites.ai/assets/hero-nexora-preview-cx5HmUgo.gif',
  'https://motionsites.ai/assets/hero-evr-ventures-preview-DZxeVFEX.gif',
  'https://motionsites.ai/assets/hero-planet-orbit-preview-DWAP8Z1P.gif',
  'https://motionsites.ai/assets/hero-new-era-preview-CocuDUm9.gif',
  'https://motionsites.ai/assets/hero-wealth-preview-B70idl_u.gif',
  'https://motionsites.ai/assets/hero-luminex-preview-CxOP7ce6.gif',
  'https://motionsites.ai/assets/hero-celestia-preview-0yO3jXO8.gif',
] as const

export const marqueeRows = [
  [...marqueeGifs.slice(0, 11), ...marqueeGifs.slice(0, 11), ...marqueeGifs.slice(0, 11)],
  [...marqueeGifs.slice(11), ...marqueeGifs.slice(11), ...marqueeGifs.slice(11)],
] as const

export const experience: Experience[] = [
  {
    id: 'first-stage',
    title: 'Primera etapa profesional — Desarrollo fullstack e IoT',
    description:
      'Participé en un refactor integral hacia una plataforma web Django/Python más escalable, que recibía datos de miles de dispositivos IoT agrícolas e industriales e incorporaba herramientas de gestión ERP y CRM. Trabajé con PostgreSQL, MQTT, RabbitMQ y Celery para tareas asíncronas pesadas, además de la gestión cloud y VPS.',
    stack: 'PostgreSQL · MQTT · RabbitMQ · Celery · cloud · VPS',
  },
  {
    id: 'project-direction',
    title: 'Director de proyectos e infraestructura',
    description:
      'Dirijo proyectos e infraestructura para un dispositivo IoT de cocina, gestiono la relación con clientes y distribuidores internacionales y coordino desarrolladores externos en APIs, web, Android, iOS y sistemas embebidos. Mantengo más de 15 servidores en distintos países y trabajo con Docker, Terraform y VPS para cuidar la latencia y la experiencia de usuario.',
    stack: 'Dirección técnica · Docker · Terraform · VPS · sistemas distribuidos',
  },
]

export const services: Service[] = [
  {
    number: '01',
    name: 'Plataformas IoT y backend',
    description:
      'Plataformas web y sistemas backend que reciben, procesan y exponen datos de dispositivos con fiabilidad.',
  },
  {
    number: '02',
    name: 'Arquitectura Django y Python',
    description:
      'Aplicaciones escalables con Django y Python, modelos de datos en PostgreSQL y herramientas de gestión ERP y CRM.',
  },
  {
    number: '03',
    name: 'Mensajería y procesos asíncronos',
    description:
      'Flujos de dispositivos y operaciones con MQTT, RabbitMQ y Celery para trabajo asíncrono pesado.',
  },
  {
    number: '04',
    name: 'Infraestructura cloud y VPS',
    description:
      'Operación de cloud y VPS con Docker y Terraform, cuidando la fiabilidad, la latencia y la experiencia de usuario.',
  },
  {
    number: '05',
    name: 'Dirección técnica y producto',
    description:
      'Coordinación técnica de APIs, web, Android, iOS, sistemas embebidos, desarrolladores externos y distribuidores internacionales.',
  },
]

export const projects: Project[] = [
  {
    number: '01',
    category: 'Client',
    name: 'Ainki Learning Platform',
    images: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055344_5eff02e0-87a5-41ce-b64f-eb08da8f33db.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055431_11d841fd-8b41-46a5-82e4-b04f2407a7d8.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055451_e317bf2d-28d4-48cc-86b0-6f72f25b6327.png&w=1280&q=85',
    ],
  },
  {
    number: '02',
    category: 'Personal',
    name: 'Gym Tracker',
    images: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055654_911201c5-36d9-4bc6-bac7-331adfce159f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055723_5ceda0b8-d9c2-4665-b2e3-83ba19ba76d1.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055753_adc5dcbd-a8e6-49c0-b43a-9b030d835cea.png&w=1280&q=85',
    ],
  },
  {
    number: '03',
    category: 'Client',
    name: 'Automation Systems',
    images: [
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055759_963cfb0b-4bd1-4b0f-9d0a-09bd6cf95b2f.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_060108_438f781a-9846-4dcc-89ab-c4e6cb830f5b.png&w=1280&q=85',
      'https://images.higgs.ai/?default=1&output=webp&url=https%3A%2F%2Fd8j0ntlcm91z4.cloudfront.net%2Fuser_38xzZboKViGWJOttwIXH07lWA1P%2Fhf_20260412_055818_9d062121-ad7e-46b9-999a-1a6a692ef1ee.png&w=1280&q=85',
    ],
  },
]
