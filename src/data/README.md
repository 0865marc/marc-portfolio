# Fuentes de contenido público

El sitio es estático: el perfil y el catálogo de cursos viven en TypeScript; las explicaciones de aprendizaje se escriben directamente en HTML dentro de componentes Astro. No hay API, base de datos ni contenido generado en tiempo de ejecución.

## Formación y aprendizaje por cursos

La portada presenta experiencia, Ainkii, formación continua y contacto. El grado universitario aparece una sola vez en el perfil; `FormationSection.astro` presenta la especialización IBM/Coursera como formación en curso. El bloque de formación prevista en AWS se ha retirado.

`src/data/learningCourses.ts` define los siete cursos de Generative AI Engineering with LLMs, en el orden del programa oficial de IBM consultado el 7 de septiembre de 2026. Cada entrada conserva el título y enlace oficiales, una explicación propia en español y conceptos o diagramas. `available` controla si se publica su contenido: los cursos 1–4 están disponibles; los cursos 5–7 aparecen como botones deshabilitados con la etiqueta «Pendiente» y su contenido no se emite. La disponibilidad de una explicación no acredita la finalización del curso ni una certificación.

- `/aprendizaje/` muestra solo el curso seleccionado, mediante los enlaces `#curso-1` a `#curso-4`; al entrar sin un curso disponible muestra el primero, incluidos los enlaces directos a los cursos pendientes. La selección funciona con CSS incluso sin JavaScript y conserva enlaces directos e historial, sin plantilla de blog, fechas ni tiempos de lectura.
- `LearningLab.astro`, `src/lib/learningLabs.ts` y `src/scripts/learningLabs.ts` implementan ejemplos deterministas de tokenización, bolsa de palabras y máscara de atención. Funcionan localmente, sin APIs ni modelos reales. La tokenización ilustrativa se etiqueta como tal.
- El índice empieza debajo de la introducción, junto al contenido del curso, y queda fijo al desplazarse: lista lateral en escritorio y selector desplegable en móvil. JavaScript marca el enlace actual y cierra el selector móvil al elegir. Sin JavaScript, el `details` nativo sigue operativo, las explicaciones, los diagramas y los ejemplos iniciales permanecen disponibles, y los controles dinámicos están ocultos.
- Los cursos 1–3 introducen cada concepto con lenguaje cotidiano y ejemplos antes de desarrollar el detalle técnico en sus desplegables. Se conservan términos como token, batch, embedding o Query, explicando qué representan al presentarlos.
- `src/components/LearningNotes.astro` contiene las seis explicaciones de «Para profundizar» como HTML: títulos, párrafos, listas y ejemplos de código dentro de `details` nativos. No hay CMS, colecciones JSON ni adaptador de artículos. `learningCourses.ts` conserva sus IDs para los enlaces antiguos y la organización por curso.
- Las URLs anteriores `/aprendizaje/<id>/` redirigen a su curso. No se incluyen en el sitemap; la única página canónica de aprendizaje es `/aprendizaje/`.

La primera edición procede de las notas públicas de agosto: tokenización y datos (día 24); embeddings, clasificación, contexto y evaluación (25 y 29); atención y transformers (31). Los resúmenes de los siguientes cursos describen el programa, no logros del autor.

## Perfil profesional y proyecto separado

`src/data/portfolio.ts` contiene únicamente los hechos compactos que siguen siendo públicos: identidad, experiencia verificable, formación, idiomas, contactos y Ainkii. `professionalProfile.identity` centraliza el copy del Hero, la introducción de Perfil y el SEO de Home. La experiencia actual se publica con el empleador autorizado `Taurus Research & Development` y la descripción detallada proporcionada; no debe recuperar datos adicionales de operación interna, proveedores, cifras, arquitectura o calendarios, ni reintroducir Hermes.

`professionalProfile.source.id` identifica la procedencia factual. `Ainkii` es el único proyecto seleccionado, permanece «En desarrollo» y es evidencia separada: no debe presentarse como el proyecto del reto de ocho semanas.
La ubicación pública actual de la identidad es `Balaguer, Lleida`; las ubicaciones de experiencia se mantienen como hechos históricos independientes.

## Contenido de aprendizaje

Las explicaciones se editan en `src/components/LearningNotes.astro`; el catálogo, la disponibilidad y las introducciones de los cursos se editan en `src/data/learningCourses.ts`. Astro genera el HTML durante la compilación y conserva el contenido completo sin JavaScript. Los IDs de conceptos se mantienen para las redirecciones existentes.

El blog se retiró por completo de la web y del CMS el 15 de septiembre de 2026. Las URLs `/blog/` y `/blog/<id>/` responden con la página 404 y quedan fuera del sitemap. Los JSON históricos de `content/posts/` se conservan como fuentes archivadas: no se cargan, no se publican y no generan páginas.

El contacto conserva los enlaces de correo y LinkedIn; la dirección de correo no se muestra como texto separado.

## Retirada del archivo diario

El calendario del Career Sprint y sus apuntes diarios se han eliminado del proyecto: páginas, JSON de días y semanas, adaptador, componentes de artículo y animaciones específicas. Sus rutas `/roadmap/`, `/career-sprint-daily/` y `/career-sprint-daily/<fecha>/` responden con la página 404 y no figuran en el sitemap. Los textos didácticos de `LearningNotes.astro` son independientes y siguen publicados en `/aprendizaje/`. Las notas originales se pueden recuperar del historial de Git.

## Edición directa y rutas

Sveltia CMS se retiró del proyecto el 16 de septiembre de 2026: panel `/admin/`, colecciones JSON, dependencias, preparación de recursos, configuración OAuth y código del Worker del repositorio. Las URL del panel y sus recursos responden 404. Esta retirada de código no ejecuta operaciones sobre servicios externos ni despliega producción.

Rutas públicas:

- `/#about`, `/#projects`, `/#formacion`, `/#contact`: navegación visible de la portada. `#career-sprint` y `#progress` se conservan como anclas de compatibilidad dentro de formación.
- `/aprendizaje/#curso-1` a `#curso-4`: contenido disponible de la página didáctica por cursos. Las rutas antiguas de conceptos redirigen a estas secciones.
- `/proyectos/ainkii/`: proyecto separado.

Las rutas retiradas responden con la página 404 y no se reutilizan.

## Editar y verificar

No cambies ni reutilices IDs o nombres de archivo. Las explicaciones publicadas deben corresponder a conceptos trabajados; no conviertas temarios previstos en formación completada. En desarrollo, Astro actualiza los componentes al editar su HTML; no hay observadores de contenido propios del CMS.

```sh
npm run check
npm run test:unit
npm run build
npm run test:static
npm run test:e2e
```

La publicación, el commit y el despliegue pertenecen a gates posteriores; los archivos de datos no conceden esa autoridad.
