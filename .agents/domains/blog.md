# Knowledge domain

## Content model

[`content/posts/`](../../content/posts/) and [`content/tags/`](../../content/tags/) are the Git-backed authoring sources. [`src/data/blog.ts`](../../src/data/blog.ts) validates them and exposes the stable `BlogPost`/`blogPosts` API. IDs remain public route identifiers; only `published` entries are emitted, while `draft` and `deleted` stay out of every public output.

The existing notes remain routable. They are knowledge material, not the primary landing narrative; the eight-week challenge and its factual progress own that priority.

## Routes

[`src/lib/blogRoutes.ts`](../../src/lib/blogRoutes.ts) builds canonical article links:

- `/#blog` is retained only as a hidden Home slot during the temporary Home suppression; it is not in active navigation.
- `/blog/` is the canonical knowledge index.
- `/blog/<encoded-id>/?from=landing|index` is the canonical article route.
- Retired `/blog/<id>/` paths are not emitted and use the designed 404 response.

## Views and states

- `BlogSection.astro` is preserved in a hidden Home slot and renders up to three published articles when restored.
- `BlogFilters.astro` renders every published entry before JavaScript runs; search and tag controls appear only when there are at least four posts, so the current two-post site renders a direct list without filters.
- `[id].astro` emits only `blogPosts`.
- `BlogCard.astro` uses the supplied heading level and includes tags in the accessible link name.

## Search and reading

[`src/lib/blogFilters.ts`](../../src/lib/blogFilters.ts) strips Spanish diacritics, lowercases, trims whitespace and requires every query term to match title, excerpt, category or tags. Article pages retain a white reading surface on the dark canvas, semantic heading hierarchy, wrapping and route focus restoration.
