# Fuentes de contenido público

El portfolio usa datos TypeScript estáticos y revisables. No hay CMS, API, base de datos ni contenido generado en tiempo de ejecución. Un cambio solo llega a producción después del flujo independiente de implementación y release del repositorio.

## Perfil profesional

`src/data/portfolio.ts` es la fuente pública de verdad sobre Marc. `professionalProfile` conserva:

- identidad, ubicación y posicionamiento;
- trayectoria y métricas con contexto;
- empresas, puestos, fechas, responsabilidades, tecnologías e IA aplicada;
- capacidades técnicas y profesionales;
- formación e idiomas;
- los proyectos Ainkii y Hermes;
- contactos ya públicos;
- reglas explícitas para no inferir información ausente.

`professionalProfile.source.id` establece la procedencia del perfil completo. Las entidades que pueden consumirse de forma independiente (`Experience`, `Project` y `BlogPost`) repiten `sourceId`; los hechos, capacidades, habilidades, formación, idiomas y fortalezas anidados heredan la procedencia del perfil raíz. El contenido visible puede resumir esos datos para mantener una página legible, pero no debe crear una biografía paralela ni añadir una cifra, tecnología, empresa, resultado, certificación o nivel profesional que no exista en la fuente.

Esta estructura está preparada para que un futuro chatbot pueda reutilizarla, pero el repositorio no implementa todavía recuperación, prompts, API ni interfaz conversacional. Un consumidor futuro debe:

1. consultar únicamente información marcada como pública;
2. respetar nombres canónicos y alias (`Ainkii` es el nombre público; `Ainki` solo un alias histórico);
3. responder que el dato no consta cuando falte evidencia;
4. no convertir textos editoriales en métricas o resultados;
5. conservar los límites de posicionamiento e idiomas definidos en `knowledgePolicy`.

## Notas publicadas

`src/data/blog.ts` contiene el archivo público. Cada `BlogPost` tiene este contrato:

```ts
{
  id: string
  category: string
  tags: string[]
  title: string
  excerpt: string
  publishedAt: string
  sourceId: typeof PROFILE_SOURCE_ID
  introduction: string[]
  sections: {
    heading: string
    paragraphs: string[]
    points?: string[]
  }[]
  takeaway: string[]
}
```

- `id` es un slug único y estable con formato `^[a-z0-9]+(?:-[a-z0-9]+)*$`.
- `publishedAt` usa `YYYY-MM-DD`.
- `sourceId` identifica la procedencia factual del contenido.
- `tags`, `title` y `excerpt` alimentan las tarjetas y el filtrado futuro.
- `introduction`, `sections` y `takeaway` forman el artículo semántico.

La landing y `/blog/` muestran únicamente `blogPosts`. Los filtros interactivos aparecen cuando el tamaño del archivo hace que aporten valor; con una colección pequeña se renderiza una lista directa y completamente usable sin JavaScript.

`legacyBlogRoutes` conserva slugs históricos cuyos cuerpos de muestra se retiraron. Esas rutas generan documentos `noindex` con retorno explícito al archivo: no vuelven a publicar el contenido genérico y tampoco dejan un enlace histórico sin salida.

## Rutas

- `/#blog`: sección de notas en la landing.
- `/blog/`: archivo público.
- `/blog/<id>/`: detalle canónico generado en build.
- `/blog/<id>/?from=landing|index`: conserva el origen del enlace de vuelta.
- `/#/blog...`: compatibilidad progresiva con bookmarks antiguos.

## Editar y verificar

Al añadir una nota, usa un ID nuevo, conserva la procedencia factual y completa el contenido en español. Al editarla, no cambies el ID. Al retirar una ruta conocida, muévela a `legacyBlogRoutes` en lugar de reutilizar el slug para otro tema.

La verificación mínima es:

```sh
npm run check
npm run test:unit
npm run build
npm run test:static
npm run test:e2e
git diff --check
```

La publicación, el commit y el despliegue pertenecen a gates posteriores; los archivos de datos no conceden esa autoridad.
