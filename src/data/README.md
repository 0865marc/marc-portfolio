# Fuentes de contenido público

El sitio es estático: el perfil y el catálogo de cursos viven en TypeScript; las explicaciones de aprendizaje se escriben directamente en HTML dentro de componentes Astro. No hay API, base de datos ni contenido generado en tiempo de ejecución.

## Formación y aprendizaje por cursos

La portada presenta experiencia, Ainkii y ButiPunt, formación académica y continua y contacto. `FormationSection.astro` presenta primero el grado en Ingeniería Electrónica Industrial y Automática, en una tarjeta destacada con la Universitat de Lleida, el periodo 2018–2022 y el contexto de `professionalProfile.education`. El grado aparece una sola vez en la portada y ya no se incluye en Experiencia. Debajo se presenta la especialización IBM/Coursera como formación en curso. El bloque de formación prevista en AWS se ha retirado.

El emblema circular de la Universitat de Lleida — Escola Politècnica Superior procede de la imagen proporcionada por el propietario el 16 de septiembre de 2026. El original se conserva en `src/assets/universitat-lleida-eps.png`; Astro genera una versión PNG a su tamaño nativo de 364 × 364 píxeles para servirlo localmente. Se mantienen las proporciones y los colores, dentro de un marco blanco cuadrado con esquinas redondeadas, del mismo tamaño y con el mismo margen interior que la imagen de IBM/Coursera. El marco pertenece al contenedor; la imagen tiene un contorno circular propio para evitar el remate plano del borde inferior del archivo original.

La imagen de la especialización se sirve desde `public/media/certifications/generative-ai-engineering-with-llms.png`, proporcionada por el propietario el 16 de septiembre de 2026. Se conserva el archivo original completo, sin recortes; identifica el programa y no cambia su estado de formación en curso.

`src/data/learningCourses.ts` define los siete cursos de Generative AI Engineering with LLMs, en el orden del programa oficial de IBM consultado el 7 de septiembre de 2026. Cada entrada conserva el título y enlace oficiales, una explicación propia en español y conceptos o diagramas. `available` controla si se publica su contenido: los cursos 1–4 están disponibles; los cursos 5–7 aparecen como botones deshabilitados con la etiqueta «Pendiente» y su contenido no se emite. La disponibilidad de una explicación no acredita la finalización del curso ni una certificación.

- `/aprendizaje/` muestra solo el curso seleccionado, mediante los enlaces `#curso-1` a `#curso-4`; al entrar sin un curso disponible muestra el primero, incluidos los enlaces directos a los cursos pendientes. La selección funciona con CSS incluso sin JavaScript y conserva enlaces directos e historial, sin plantilla de blog, fechas ni tiempos de lectura.
- `LearningLab.astro`, `src/lib/learningLabs.ts` y `src/scripts/learningLabs.ts` implementan ejemplos deterministas de tokenización, bolsa de palabras y máscara de atención. Funcionan localmente, sin APIs ni modelos reales. La tokenización ilustrativa se etiqueta como tal.
- El índice empieza debajo de la introducción, junto al contenido del curso, y queda fijo al desplazarse: lista lateral en escritorio y selector desplegable en móvil. JavaScript marca el enlace actual y cierra el selector móvil al elegir. Sin JavaScript, el `details` nativo sigue operativo, las explicaciones, los diagramas y los ejemplos iniciales permanecen disponibles, y los controles dinámicos están ocultos.
- Los cursos 1–3 introducen cada concepto con lenguaje cotidiano y ejemplos antes de desarrollar el detalle técnico en sus desplegables. Se conservan términos como token, batch, embedding o Query, explicando qué representan al presentarlos.
- `src/components/LearningNotes.astro` contiene las seis explicaciones de «Para profundizar» como HTML: títulos, párrafos, listas y ejemplos de código dentro de `details` nativos. No hay CMS, colecciones JSON ni adaptador de artículos. `learningCourses.ts` conserva sus IDs para los enlaces antiguos y la organización por curso.
- Las URLs anteriores `/aprendizaje/<id>/` redirigen a su curso. No se incluyen en el sitemap; la única página canónica de aprendizaje es `/aprendizaje/`.

La primera edición procede de las notas públicas de agosto: tokenización y datos (día 24); embeddings, clasificación, contexto y evaluación (25 y 29); atención y transformers (31). Los resúmenes de los siguientes cursos describen el programa, no logros del autor.

## Perfil profesional y proyectos personales

`src/data/portfolio.ts` contiene únicamente los hechos compactos que siguen siendo públicos: identidad, experiencia verificable, formación, idiomas, contactos y proyectos personales. `professionalProfile.identity` centraliza el copy del Hero, la introducción de Perfil y el SEO de Home. La experiencia actual se publica con el empleador autorizado `Taurus Research & Development` y la descripción detallada proporcionada; no debe recuperar datos adicionales de operación interna, proveedores, cifras, arquitectura o calendarios, ni reintroducir Hermes.

`professionalProfile.source.id` identifica la procedencia factual del perfil. Los proyectos usan `PROJECT_SOURCE_ID` (`public-projects-2026-09-16`): sus descripciones se revisaron con las landings públicas y el estado de acceso confirmado por el propietario el 16 de septiembre de 2026.

- [Ainkii](https://ainkii.mteixido.dev/): producto para alumnos y academias; conecta temarios, conocimientos, tarjetas y seguimiento. Permanece «En desarrollo»: solo la landing y su demostración de ejemplo son públicas; la aplicación interna no está abierta al público. No enlazar el login como una aplicación disponible ni presentar datos de demostración como uso real.
- [ButiPunt](https://butipunt.mteixido.dev/): gestor disponible de torneos presenciales de butifarra, sin registro y con guardado en el navegador. No promete juego en línea ni sincronización entre dispositivos.

Los logos se sirven localmente desde `public/media/projects/`, conservando los trazados, colores y proporciones originales. Se normaliza únicamente el encuadre SVG a 320 × 100, centrando los límites visibles con el mismo margen horizontal; así ambos tienen una escala comparable dentro del marco compacto de `ProjectBrand.astro`. Procedencia: [logo de Ainkii](https://ainkii.mteixido.dev/brand/ainkii-logo-horizontal.svg) y [logo de ButiPunt](https://butipunt.mteixido.dev/brand/logo.svg), descargados el 16 de septiembre de 2026. El [pack de marca de ButiPunt](https://butipunt.mteixido.dev/marca/) documenta el uso sobre blanco. `ProjectBrand.astro` comparte su presentación; `ProjectsSection.astro` renderiza ambas fichas desde los datos. No se añaden afirmaciones sobre tecnologías, usuarios o resultados que las fuentes no acreditan.
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
- `/proyectos/ainkii/` y `/proyectos/butipunt/`: fichas de proyectos, incluidas en el sitemap, con enlaces a sus respectivas webs públicas.

Las rutas retiradas responden con la página 404 y no se reutilizan.

La navegación entre documentos usa View Transitions nativas mediante `@view-transition` en `src/index.css`: fundido de página y un nombre compartido por logo en `ProjectBrand.astro`. Los enlaces de vuelta de ambos proyectos apuntan a `/#projects`. Se desactivan las transiciones con `prefers-reduced-motion: reduce` o JavaScript deshabilitado; los navegadores sin soporte conservan la navegación normal. No se incorpora un router cliente ni cambia el ciclo de ejecución de los scripts de aprendizaje. El foco inicial de las anclas se aplica tras `pageshow` para respetar el desplazamiento nativo; las entradas de historial restauradas desde caché mantienen su posición y foco.

Los enlaces a dominios o subdominios externos (Ainkii, ButiPunt, LinkedIn y Coursera) se abren en una nueva pestaña mediante `target="_blank"` y `rel="noopener noreferrer"`. LinkedIn conserva además `rel="me"`. Los enlaces internos, las anclas y las acciones de correo mantienen su comportamiento habitual.

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
