# Application architecture

## Entry and route selection

Astro pages under [`src/pages/`](../../src/pages/) emit directory-format static documents for `/`, `/blog/`, every known `/blog/<id>/`, and `/404.html`. [`src/layouts/BaseLayout.astro`](../../src/layouts/BaseLayout.astro) owns shared metadata, global CSS, canonical URLs, and the narrow inline redirect that translates legacy blog hashes before rendering.

[`src/lib/blogRoutes.ts`](../../src/lib/blogRoutes.ts) is the URL contract:

- `/#blog` remains the landing-page anchor.
- `/blog/` is the canonical blog index.
- `/blog/<encoded-id>/?from=landing|index` is the canonical article route and preserves the return destination.
- Legacy `/#/blog` and `/#/blog/<encoded-id>?from=...` addresses redirect to their canonical static equivalents.
- Unknown server paths use the designed `404.html` response through the container Nginx configuration.

[`src/scripts/navigation.ts`](../../src/scripts/navigation.ts) restores route-heading and hash-target focus without owning routing. Preserve canonical paths, legacy translations, source values, and focus semantics unless an accepted ADR supersedes them.

## Landing composition

[`src/pages/index.astro`](../../src/pages/index.astro) composes the landing page in this order:

1. `HeroSection`
2. `MarqueeSection`
3. `AboutSection`
4. `ServicesSection`
5. `BlogSection`
6. `ProjectsSection`, including the contact footer

Astro components provide the structure, while most content comes from typed static data. [`src/data/portfolio.ts`](../../src/data/portfolio.ts) contains experience, service, project, and marquee records.

## Blog flow

[`src/data/blog.ts`](../../src/data/blog.ts) is the article source. `BlogSection.astro` renders the first three entries, `BlogFilters.astro` renders the complete collection with usable no-JavaScript content, and `[id].astro` statically emits one page per entry through `getStaticPaths`. `BlogCard.astro` is reused on landing and index routes.

[`src/lib/blogFilters.ts`](../../src/lib/blogFilters.ts) normalizes Spanish diacritics, builds sorted unique tags, and requires every query term to match the combined title/excerpt/category/tag text. Filtering is client-side and has no remote loading state.

## Styling and interaction

Tailwind utility classes in Astro components carry most layout and visual values. [`src/index.css`](../../src/index.css) defines the Kanit base, dark canvas, focus treatment, hero gradient, overflow controls, progressive reveal states, reduced-motion fallback, and selection colors. [DESIGN.md](../DESIGN.md) is the reviewed token map derived from these files.

[`src/scripts/enhancements.ts`](../../src/scripts/enhancements.ts) adds intersection-based reveals and safe image-failure handling; [`src/scripts/blogFilters.ts`](../../src/scripts/blogFilters.ts) adds framework-free filtering. Primary content remains usable without JavaScript and reduced-motion users receive static content. Interactive elements use native links, buttons, inputs, fieldsets, and focus-visible styles.

## Data and service boundaries

The generated documents contain all portfolio and blog content. Images and decorative media are remote URLs and hide failed decorative/project images without introducing a backend fallback. This repository has no API client, persistence layer, authentication, application server, or runtime server-side rendering.

## Build boundary

`npm run build` runs `astro check` and produces Astro directory-format static output in `dist/`. `npm run verify` adds TypeScript, unit, static-output, asset-budget, agent-knowledge, and workflow-contract checks. Generated `dist/`, `.astro/`, reports, and `*.tsbuildinfo` are not authored knowledge and are excluded from the project index.
