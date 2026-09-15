# Fuentes de contenido público

El sitio es estático: el perfil vive en TypeScript y los conceptos y archivos de aprendizaje viven en JSON gestionado con Git. No hay API, base de datos ni contenido generado en tiempo de ejecución.

## Formación y aprendizaje por cursos

La portada presenta experiencia, Ainkii, formación continua y contacto. El grado universitario aparece una sola vez en el perfil; `FormationSection.astro` presenta la especialización IBM/Coursera como formación en curso. El bloque de formación prevista en AWS se ha retirado.

`src/data/learningCourses.ts` define los siete cursos de Generative AI Engineering with LLMs, en el orden del programa oficial de IBM consultado el 7 de septiembre de 2026. Cada entrada conserva el título y enlace oficiales, una explicación propia en español y conceptos o diagramas. `available` controla si se publica su contenido: los cursos 1–4 están disponibles; los cursos 5–7 aparecen como botones deshabilitados con la etiqueta «Pendiente» y su contenido no se emite. La disponibilidad de una explicación no acredita la finalización del curso ni una certificación.

- `/aprendizaje/` muestra solo el curso seleccionado, mediante los enlaces `#curso-1` a `#curso-4`; al entrar sin un curso disponible muestra el primero, incluidos los enlaces directos a los cursos pendientes. La selección funciona con CSS incluso sin JavaScript y conserva enlaces directos e historial, sin plantilla de blog, fechas ni tiempos de lectura.
- `LearningLab.astro`, `src/lib/learningLabs.ts` y `src/scripts/learningLabs.ts` implementan ejemplos deterministas de tokenización, bolsa de palabras y máscara de atención. Funcionan localmente, sin APIs ni modelos reales. La tokenización ilustrativa se etiqueta como tal.
- El índice empieza debajo de la introducción, junto al contenido del curso, y queda fijo al desplazarse: lista lateral en escritorio y selector desplegable en móvil. JavaScript marca el enlace actual y cierra el selector móvil al elegir. Sin JavaScript, el `details` nativo sigue operativo, las explicaciones, los diagramas y los ejemplos iniciales permanecen disponibles, y los controles dinámicos están ocultos.
- Los cursos 1–3 introducen cada concepto con lenguaje cotidiano y ejemplos antes de desarrollar el detalle técnico en sus desplegables. Se conservan términos como token, batch, embedding o Query, explicando qué representan al presentarlos.
- `content/concepts/*.json` conserva los detalles técnicos editables desde el CMS. Solo conceptos `published` aparecen en los desplegables de su curso, y `learningCourses.ts` asigna cada concepto publicado a una sección.
- Las URLs anteriores `/aprendizaje/<id>/` redirigen a su curso. No se incluyen en el sitemap; la única página canónica de aprendizaje es `/aprendizaje/`.

La primera edición procede de las notas públicas de agosto: tokenización y datos (día 24); embeddings, clasificación, contexto y evaluación (25 y 29); atención y transformers (31). Los resúmenes de los siguientes cursos describen el programa, no logros del autor.

## Perfil profesional y proyecto separado

`src/data/portfolio.ts` contiene únicamente los hechos compactos que siguen siendo públicos: identidad, experiencia verificable, formación, idiomas, contactos y Ainkii. `professionalProfile.identity` centraliza el copy del Hero, la introducción de Perfil y el SEO de Home. La experiencia actual se publica con el empleador autorizado `Taurus Research & Development` y la descripción detallada proporcionada; no debe recuperar datos adicionales de operación interna, proveedores, cifras, arquitectura o calendarios, ni reintroducir Hermes.

`professionalProfile.source.id` identifica la procedencia factual. `Ainkii` es el único proyecto seleccionado, permanece «En desarrollo» y es evidencia separada: no debe presentarse como el proyecto del reto de ocho semanas.
La ubicación pública actual de la identidad es `Balaguer, Lleida`; las ubicaciones de experiencia se mantienen como hechos históricos independientes.

## Contenido de aprendizaje

`src/data/articleContent.ts` valida el formato compartido de los conceptos de IA y los tipos de las notas originales. `content/concepts/*.json` y `content/tags/*.json` son las fuentes editables del aprendizaje. Solo entradas `published` se muestran; los IDs y referencias de etiquetas se conservan estables.

El blog se retiró por completo de la web y del CMS el 15 de septiembre de 2026. Las URLs `/blog/` y `/blog/<id>/` responden con la página 404 y quedan fuera del sitemap. Los JSON históricos de `content/posts/` se conservan como fuentes archivadas: no se cargan, no se publican y no generan páginas.

El contacto conserva los enlaces de correo y LinkedIn; la dirección de correo no se muestra como texto separado.

## Archivo del plan y notas originales

Las rutas de calendario y notas diarias se conservan para los enlaces existentes. Ofrecen acceso a la página didáctica por cursos, pero no son el recorrido principal de la portada. El índice de notas muestra primero las más recientes sin cambiar el orden del adaptador ni los IDs históricos.

`content/weeks/w1.json` a `content/weeks/w8.json` son la ruta factual de 2026. `src/data/challenge.ts` valida y adapta semanas y entradas diarias; ningún componente consume esos JSON directamente.

Una semana contiene `id`, `status`, `position`, fechas, título/foco, objetivo, agenda por día y bloque, reparto de horas, `hoursPlanned` opcional, temas, hitos, reservas, criterios y `progressState`.

- Las ocho semanas son consecutivas del `2026-08-24` al `2026-10-18`.
- Todas comienzan `planned`; la fecha no cambia ese estado automáticamente.
- `hoursPlanned` solo existe donde el plan da un total explícito: W1, W2, W4, W5, W6 y W7 usan `63`; W3 y W8 lo omiten.
- Hitos, exámenes, costes, cursos, labs y criterios son objetivos o referencias del plan hasta que exista evidencia diaria publicada.

`content/daily/` admite un JSON por jornada real. Una entrada debe tener `id` igual al nombre de archivo e `activityDate` (`YYYY-MM-DD`), `weekId` existente, posición única, estado editorial, tags existentes, `hoursActual` opcional no negativo y la misma prosa estructurada que un artículo. No hay jornadas de ejemplo, vacías ni futuras: una colección diaria vacía es válida y muestra un estado accesible.

Solo jornadas `published` generan `/career-sprint-daily/<YYYY-MM-DD>/`, JSON-LD y sitemap. Su fecha debe estar dentro de la semana referenciada.

## CMS y rutas

`/admin/` usa Sveltia CMS autoalojado en español. Las colecciones `Conceptos de IA`, `Etiquetas`, `Semanas` y `Progreso diario` guardan JSON en ramas y pull requests editoriales; `delete:false` y `publish:false` evitan operaciones destructivas o merge directo. OAuth, el Worker y sus secretos se documentan en [`ops/cms-auth/README.md`](../../ops/cms-auth/README.md).

Rutas públicas:

- `/#about`, `/#projects`, `/#formacion`, `/#contact`: navegación visible de la portada. `#career-sprint` y `#progress` se conservan como anclas de compatibilidad dentro de formación.
- `/aprendizaje/#curso-1` a `#curso-4`: contenido disponible de la página didáctica por cursos. Las rutas antiguas de conceptos redirigen a estas secciones.
- `/roadmap/`: archivo del plan de ocho semanas.
- `/career-sprint-daily/`: archivo de notas originales, con la última primero.
- `/career-sprint-daily/<YYYY-MM-DD>/`: detalle estático de una jornada publicada.
- `/proyectos/ainkii/`: proyecto separado.

Las rutas retiradas responden con la página 404 y no se reutilizan.

## Editar y verificar

No cambies ni reutilices IDs o nombres de archivo. Publica una jornada solo después de realizarla y comprobar que la copy es factual; no conviertas la agenda ni una reserva de examen en evidencia.

```sh
npm run check
npm run test:unit
npm run build
npm run test:static
npm run test:e2e
```

La publicación, el commit y el despliegue pertenecen a gates posteriores; los archivos de datos no conceden esa autoridad.
