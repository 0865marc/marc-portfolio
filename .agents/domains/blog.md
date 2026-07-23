# Blog domain

## Content model

[`src/data/blog.ts`](../../src/data/blog.ts) defines `BlogPost` and `BlogArticleSection`. A post has a stable `id`, category, tags, title, excerpt, `isSample`, introduction paragraphs, structured sections, and takeaway paragraphs. IDs are route identifiers and must remain backward-compatible.

The current entries cover IoT platform architecture, RabbitMQ/Celery heavy processing, and distributed infrastructure/latency. They are static bundle content, not API responses.

## Routes

[`src/lib/blogRoutes.ts`](../../src/lib/blogRoutes.ts) defines canonical static routes, legacy-hash translation, and the return-source contract. Preserve:

- `BLOG_INDEX_HREF = '/blog/'`
- `LANDING_BLOG_HREF = '/#blog'`
- `MISSING_POST_HREF = '/blog/articulo-no-encontrado/'`
- `BlogSource = 'landing' | 'index'`
- URL-encoded article IDs
- safe legacy fallback for malformed or missing IDs

## Views and states

- `BlogSection.astro` shows up to three posts and an empty state on the landing page.
- `BlogFilters.astro` renders every post before JavaScript runs; `src/scripts/blogFilters.ts` progressively adds text search, tag filtering, polite result counts, clear actions, and the no-match state.
- `src/pages/blog/[id].astro` emits one article per stable ID and preserves the source-aware back link.
- `BlogCard.astro` uses the requested heading level and includes tags in the accessible link name.

## Search semantics

[`src/lib/blogFilters.ts`](../../src/lib/blogFilters.ts) strips diacritics, lowercases using the Spanish locale, trims whitespace, and matches every query term against title, excerpt, category, and tags. Tag selection is exact. Do not silently change these semantics when adjusting the UI.

## Reading design

Index routes use the dark canvas. Article content uses a white rounded surface with dark text, a constrained reading width, generous line height, and explicit heading hierarchy. Long titles, tags, and links must wrap without horizontal overflow. Canonical page navigation and legacy hash translation move focus to the route heading without turning the site back into a client router.
