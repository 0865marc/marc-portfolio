# Application architecture

## Entry and route selection

[`src/main.tsx`](../../src/main.tsx) mounts the single React root and imports global CSS. [`src/App.tsx`](../../src/App.tsx) owns route state and listens for `hashchange`. There is no router dependency.

[`src/lib/blogRoutes.ts`](../../src/lib/blogRoutes.ts) is the route contract:

- `/#blog` selects the landing page and blog anchor.
- `/#/blog` selects the full blog index.
- `/#/blog/<encoded-id>?from=landing|index` selects an article and preserves the return destination.
- Unknown `#/` routes fall back to the landing view.

After a route change, `App` moves scroll/focus to the relevant heading. Preserve these hashes, source values, and focus semantics unless a task explicitly changes the route contract.

## Landing composition

The landing page is rendered in this order:

1. `HeroSection`
2. `MarqueeSection`
3. `AboutSection`
4. `ServicesSection`
5. `BlogSection`
6. `ProjectsSection`, including the contact footer

The landing is component-driven, but most content comes from typed static data. [`src/data/portfolio.ts`](../../src/data/portfolio.ts) contains experience, service, project, and marquee records.

## Blog flow

[`src/data/blog.ts`](../../src/data/blog.ts) is the article source. `BlogSection` renders the first three entries; `BlogIndexView` renders the complete searchable/filterable collection; `BlogPostView` finds one entry by ID and renders its structured sections. `BlogCard` is reused on landing and index routes.

[`src/lib/blogFilters.ts`](../../src/lib/blogFilters.ts) normalizes Spanish diacritics, builds sorted unique tags, and requires every query term to match the combined title/excerpt/category/tag text. Filtering is client-side and has no remote loading state.

## Styling and interaction

Tailwind utility classes in components carry most layout and visual values. [`src/index.css`](../../src/index.css) defines the Kanit base, dark canvas, focus treatment, hero gradient, overflow controls, mobile project-card motion override, reduced-motion fallback, and selection colors. [DESIGN.md](../DESIGN.md) is the reviewed token map derived from these files.

Framer Motion powers reusable `FadeIn`, text animation, marquee movement, and project-card scroll scaling. Existing reduced-motion handling must be retained. Interactive elements use native links, buttons, inputs, fieldsets, and focus-visible styles.

## Data and service boundaries

The application bundle contains all portfolio and blog content. Images and decorative media are remote URLs and hide failed decorative/project images without introducing a backend fallback. This repository has no API client, persistence layer, authentication, or server-side rendering.

## Build boundary

`npm run build` runs TypeScript project compilation and the Vite production build. Generated `dist/` and `*.tsbuildinfo` are not authored knowledge and are excluded from the project index.
