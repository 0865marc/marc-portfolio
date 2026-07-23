# Gestión del blog

Los contenidos visibles de la sección `Blog` se administran en `src/data/blog.ts`. El índice y las páginas de detalle se generan desde el mismo array tipado: no hay un panel de administración, no se escriben archivos desde el navegador y un sitio ya desplegado no cambia hasta que el contenido sigue el flujo aprobado de publicación.

## Modelo de una entrada

Cada `BlogPost` contiene estos campos:

```ts
{
  id: string
  category: string
  tags: string[]
  title: string
  excerpt: string
  isSample: boolean
  introduction: string[]
  sections: {
    heading: string
    paragraphs: string[]
    points?: string[]
  }[]
  takeaway: string[]
}
```

- `id`: identificador único, estable y público. Debe cumplir `^[a-z0-9]+(?:-[a-z0-9]+)*$`. Es el slug de la ruta y no debe cambiar al editar el título o el contenido.
- `category`: categoría visible en la tarjeta y en el detalle.
- `tags`: etiquetas visibles para describir y filtrar la entrada. Debe contener valores estables, no vacíos y sin duplicados dentro de la misma entrada.
- `title`: título visible de la entrada.
- `excerpt`: resumen breve visible en la tarjeta y como introducción destacada del detalle.
- `isSample`: indica si el detalle debe mostrar `Artículo de muestra`.
- `introduction`: dos o más párrafos introductorios completos.
- `sections`: secciones ordenadas con encabezados únicos dentro de la entrada. Cada sección renderiza sus párrafos y, opcionalmente, una lista semántica de `points`.
- `takeaway`: uno o más párrafos de cierre. La interfaz muestra el encabezado fijo `Idea final`.

La posición de la entrada en `blogPosts` determina el orden del índice. La landing usa `blogPosts.slice(0, 3)`, por lo que añadir al final conserva las tres muestras actuales; reordenar el array cambia tanto el orden del índice como las tres entradas visibles en la landing. Los identificadores existentes son:

- `arquitecturas-plataformas-iot`
- `rabbitmq-celery-procesos-pesados`
- `infraestructura-distribuida-latencia`

## Rutas públicas

Astro genera rutas de directorio estáticas y canónicas:

- `/#blog`: sección Blog de la landing.
- `/blog/`: índice con todas las entradas.
- `/blog/<id>/`: detalle generado en build con el `id` codificado mediante `encodeURIComponent`.
- `/blog/<id>/?from=landing|index`: conserva un enlace explícito al origen.

Un pequeño script progresivo conserva los antiguos `/#/blog...` bookmarks y los reemplaza por la ruta canónica. Un `id` eliminado o desconocido llega al 404 real del servidor; no existe fallback SPA. La publicación verifica el índice, cada documento generado, los assets y `404.html`.
Un detalle abierto directamente sin `from`, con un valor desconocido o desde un enlace antiguo usa el índice del Blog como origen predeterminado. El origen forma parte del hash para que el enlace de vuelta también funcione al abrir el artículo en una pestaña nueva; no depende de `history.back()`.

## Crear una entrada

Añade al final de `blogPosts` un objeto completo con un identificador nuevo, único y estable. Completa todos los campos, escribe el contenido en español y deja las tres muestras actuales en sus posiciones si la nueva entrada no debe aparecer en la landing:

```ts
{
  id: 'identificador-unico-estable',
  category: 'Categoría',
  tags: ['Etiqueta principal', 'Otra etiqueta'],
  title: 'Título',
  excerpt: 'Resumen breve en español',
  isSample: false,
  introduction: ['Primer párrafo.', 'Segundo párrafo.'],
  sections: [
    {
      heading: 'Sección',
      paragraphs: ['Primer párrafo de la sección.', 'Segundo párrafo de la sección.'],
      points: ['Punto opcional.'],
    },
  ],
  takeaway: ['Idea de cierre.'],
},
```

Crear, editar y eliminar son operaciones de repositorio. No existe CRUD en tiempo de ejecución, backend, CMS, panel, autenticación, `localStorage` ni programación de publicaciones.

## Editar una entrada

Modifica `category`, `tags`, `title`, `excerpt`, `isSample` o los campos de contenido en el mismo objeto, pero conserva su `id` para no romper enlaces copiados. Mantén los encabezados de `sections` únicos y el orden que deba leer el usuario.

## Eliminar una entrada

Elimina el objeto completo de `blogPosts`. Las tarjetas desaparecen automáticamente del índice y de la landing cuando corresponda. Los enlaces antiguos a su `id` muestran la vista honesta de artículo no encontrado.

## Verificar el contenido y publicar

Desde la raíz del proyecto, ejecuta la comprobación de rutas, la comprobación de integridad de datos, `npm run build` y `git diff --check`. Revisa también los hashes directos, la navegación del navegador, el foco y el desbordamiento en las vistas requeridas.

La publicación requiere el flujo de revisión, commit y despliegue aprobado por separado para el proyecto. Este archivo y `blog.ts` no ofrecen una interfaz de publicación ni mutan un sitio en producción por sí mismos.
