# Fuentes de contenido público

El sitio es estático: el perfil vive en TypeScript y el conocimiento, la ruta y la bitácora viven en JSON Git-backed. No hay API, base de datos ni contenido generado en tiempo de ejecución.

## Perfil profesional y proyecto separado

`src/data/portfolio.ts` contiene únicamente los hechos compactos que siguen siendo públicos: identidad, experiencia verificable, formación, idiomas, contactos y Ainkii. `professionalProfile.identity` centraliza el copy del Hero, la introducción de Perfil y el SEO de Home. La experiencia actual se publica con el empleador autorizado `Taurus Research & Development` y la descripción detallada proporcionada; no debe recuperar datos adicionales de operación interna, proveedores, cifras, arquitectura o calendarios, ni reintroducir Hermes.

`professionalProfile.source.id` identifica la procedencia factual. `Ainkii` es el único proyecto seleccionado, permanece «En desarrollo» y es evidencia separada: no debe presentarse como el proyecto del reto de ocho semanas.
La ubicación pública actual de la identidad es `Balaguer, Lleida`; las ubicaciones de experiencia se mantienen como hechos históricos independientes.

## Blog gestionado

Los archivos de autoría son `content/posts/*.json` y `content/tags/*.json`. `src/data/blog.ts` es el único adaptador hacia `BlogPost` y `blogPosts`; los componentes no leen JSON directamente.

- Cada post tiene `id`, `status`, `position`, categoría, IDs de tags, fecha y prosa estructurada.
- Solo `published` llega a landing, `/blog/`, rutas, JSON-LD y sitemap. `draft` y `deleted` no borran físicamente el archivo.
- La landing muestra como máximo los tres primeros artículos; `/blog/` conserva todos los publicados.
- Los IDs de tag son estables y el adaptador resuelve sus etiquetas visibles al compilar.

## Ruta y progreso gestionados

`content/weeks/w1.json` a `content/weeks/w8.json` son la ruta factual de 2026. `src/data/challenge.ts` valida y adapta semanas y entradas diarias; ningún componente consume esos JSON directamente.

Una semana contiene `id`, `status`, `position`, fechas, título/foco, objetivo, agenda por día y bloque, reparto de horas, `hoursPlanned` opcional, temas, hitos, reservas, criterios y `progressState`.

- Las ocho semanas son consecutivas del `2026-08-24` al `2026-10-18`.
- Todas comienzan `planned`; la fecha no cambia ese estado automáticamente.
- `hoursPlanned` solo existe donde el plan da un total explícito: W1, W2, W4, W5, W6 y W7 usan `63`; W3 y W8 lo omiten.
- Hitos, exámenes, costes, cursos, labs y criterios son objetivos o referencias del plan hasta que exista evidencia diaria publicada.

`content/daily/` admite un JSON por jornada real. Una entrada debe tener `id` igual al nombre de archivo e `activityDate` (`YYYY-MM-DD`), `weekId` existente, posición única, estado editorial, tags existentes, `hoursActual` opcional no negativo y la misma prosa estructurada que un artículo. No hay jornadas de ejemplo, vacías ni futuras: una colección diaria vacía es válida y muestra un estado accesible.

Solo jornadas `published` generan `/career-sprint-daily/<YYYY-MM-DD>/`, JSON-LD y sitemap. Su fecha debe estar dentro de la semana referenciada.

## CMS y rutas

`/admin/` usa Sveltia CMS autoalojado en español. Las colecciones `Conocimiento`, `Etiquetas`, `Semanas` y `Progreso diario` guardan JSON en ramas y pull requests editoriales; `delete:false` y `publish:false` evitan operaciones destructivas o merge directo. OAuth, el Worker y sus secretos se documentan en [`ops/cms-auth/README.md`](../../ops/cms-auth/README.md).

Rutas públicas:

- `/#career-sprint`, `/#progress`, `/#contact`: secciones visibles de la portada; `#blog` y `#projects` quedan ocultos temporalmente.
- `/roadmap/`: ledger editorial de las semanas publicadas.
- `/career-sprint-daily/`: cronología diaria publicada.
- `/career-sprint-daily/<YYYY-MM-DD>/`: detalle estático de una jornada publicada.
- `/blog/` y `/blog/<id>/`: Blog.
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
