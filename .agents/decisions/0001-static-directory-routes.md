# 0001: Static directory routes with bounded legacy hash compatibility

Status: accepted

Date: 2026-07-22

## Context

The former client-rendered application used hash routes for the blog. The Astro migration can emit crawlable, independently loadable HTML documents, but previously shared blog URLs must continue to resolve safely.

## Decision

Astro emits directory-format static documents for `/`, `/blog/`, and every known `/blog/<encoded-id>/`, plus `/404.html`. Canonical links use those paths. A small inline script in `BaseLayout.astro` translates only the legacy `/#/blog` and `/#/blog/<encoded-id>?from=...` forms to canonical URLs. Ordinary navigation remains native, and framework-free scripts may enhance focus and filtering without becoming a client router.

Unknown server paths use the designed static 404 through the reviewed Nginx `error_page` contract. Article IDs remain stable route identifiers.

## Consequences

- Primary content and navigation work without a client framework runtime.
- Canonical URLs are crawlable static documents with consistent trailing slashes.
- Legacy shared hashes remain compatible through a deliberately bounded redirect.
- Route generation, legacy translation, focus behaviour, Nginx 404 handling, and no-JavaScript output require tests.
- A future route-model change must supersede this ADR rather than silently reintroducing client-owned routing.

## References

- `astro.config.mjs`
- `src/layouts/BaseLayout.astro`
- `src/lib/blogRoutes.ts`
- `src/pages/blog/[id].astro`
- `ops/nginx/container.conf`
