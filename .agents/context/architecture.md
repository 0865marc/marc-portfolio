# Application architecture

## Entry and route selection

Astro pages under [`src/pages/`](../../src/pages/) emit directory-format static documents for `/`, `/roadmap/`, `/career-sprint-daily/`, every published `/career-sprint-daily/<YYYY-MM-DD>/`, `/blog/`, every published `/blog/<id>/`, `/proyectos/ainkii/`, the sitemap, and `/404.html`. [`src/layouts/BaseLayout.astro`](../../src/layouts/BaseLayout.astro) owns shared metadata, global CSS, canonical URLs and focus restoration.

[`src/lib/blogRoutes.ts`](../../src/lib/blogRoutes.ts) preserves article URLs. [`src/lib/challengeRoutes.ts`](../../src/lib/challengeRoutes.ts) builds the roadmap and daily-progress URLs. Unknown server paths use the designed `404.html` response through container Nginx.

[`src/scripts/navigation.ts`](../../src/scripts/navigation.ts) restores route-heading and hash-target focus without owning routing. Home navigation exposes `#about`, `#career-sprint` and `#contact`; `#progress` remains an active content anchor while the Home `#projects` and `#blog` sections remain temporarily hidden.

## Landing composition

`src/pages/index.astro` composes the Home surface in this order:

1. `HeroSection` — visible profile, Career Sprint and contact navigation with profile framing.
2. `AboutSection` — public profile and current location.
3. `ProjectsSection` — owns the project/contact structure, rendering the named `career-sprint` slot before its hidden project block, hidden notes slot and Contacto.
4. `CareerSprintSection` — supplied by `src/pages/index.astro` as `<CareerSprintSection slot="career-sprint" />`; its current block links to the roadmap and daily-progress routes.

## Knowledge and challenge flow

[`src/data/blog.ts`](../../src/data/blog.ts) adapts managed knowledge JSON and exposes `blogPosts`. `BlogSection.astro` renders up to three articles on the landing; `BlogFilters.astro` renders the whole published collection at `/blog/`.

[`src/data/challenge.ts`](../../src/data/challenge.ts) is the central adapter for `content/weeks/*.json`, `content/daily/*.json` and tag references. It validates the eight consecutive weeks, editorial states, dates, positions, totals, daily IDs and weekly/tag references before emitting published `challengeWeeks` and `dailyProgressEntries`. `roadmap/index.astro` renders all published weeks as a native-details ledger; `career-sprint-daily/index.astro` and `[date].astro` emit only published daily entries.

## Styling and interaction

Tailwind utility classes in Astro components carry most layout and visual values. [`src/index.css`](../../src/index.css) defines the Kanit base, dark canvas, focus treatment, hero gradient, overflow controls, progressive reveal states, reduced-motion fallback, and selection colors. [DESIGN.md](../DESIGN.md) is the reviewed token map derived from these files.

[`src/scripts/enhancements.ts`](../../src/scripts/enhancements.ts) adds intersection-based reveals and safe image-failure handling; [`src/scripts/blogFilters.ts`](../../src/scripts/blogFilters.ts) adds framework-free filtering. Primary content remains usable without JavaScript and reduced-motion users receive static content. Interactive elements use native links, buttons, inputs, fieldsets, and focus-visible styles.

## Data and service boundaries

The generated documents contain all public portfolio, knowledge, roadmap and daily-progress content. The CMS edits JSON through GitHub branches and pull requests; it does not introduce a public application backend, database, API client or runtime server-side rendering. Draft and deleted content stays out of all public routes, JSON-LD and sitemap output.

## Build boundary

`npm run build` runs `astro check` and produces Astro directory-format static output in `dist/`. `npm run verify` adds TypeScript, unit, static-output, asset-budget, CMS worker integrity and authored-knowledge checks. Generated `dist/`, `.astro/`, reports, and `*.tsbuildinfo` are not authored knowledge and are excluded from source documentation.
