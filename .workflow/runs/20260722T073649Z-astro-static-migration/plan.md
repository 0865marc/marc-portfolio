# Astro static migration implementation plan

## Objective

Migrate `marc-portfolio` from a React 18/Vite single-root hash-routed SPA to an Astro 7 static site that:

- emits meaningful build-time HTML for `/`, `/blog/`, each known `/blog/<id>/`, and `/404.html`;
- preserves the current Spanish copy, content model, design tokens, section order, anchors, keyboard/focus behavior, reduced-motion behavior, and remote-image failure fallbacks;
- preserves old `/#/blog...` bookmarks through a small progressive compatibility script while making directory-style routes canonical;
- uses no page-wide React runtime and retains a React blog-filter island only if a measured prototype is smaller or materially safer than a framework-free implementation while preserving exact semantics and accessibility;
- replaces Framer Motion with progressive CSS and narrowly scoped vanilla TypeScript enhancements;
- remains a pure static `dist/` hosted by Nginx and published by the existing timestamped-release/symlink mechanism; and
- is implemented and proven in an isolated worktree before any separately approved production cutover.

The migration is a coordinated static-site cutover, not a long-lived Vite/Astro hybrid. The production rollback baseline is commit `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`.

## Current system and inspected baseline

Repository: `/home/agent/deployments/marc-portfolio-production`

Read-only inspection on 2026-07-22 found:

- `main`, `origin/main`, and `origin/HEAD` all at `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`;
- clean Git status, no staged/untracked files reported, one worktree only, and `.workflow/current.yaml` with `active_run: null`;
- `.agents` index validation and `.workflow` validation both passing;
- Node `v22.16.0`, npm `10.9.2`, Nginx and Docker available, but no host Chromium/Firefox executables on `PATH`;
- current application dependencies resolve to React 18.3.1, Framer Motion 12.42.2, Vite 5.4.21, Tailwind 3.4.19, and TypeScript 5.9.3;
- current routing is entirely in `src/App.tsx` and `src/lib/blogRoutes.ts`; fragments select landing, blog index, and article views, so Nginx currently sees only `/`;
- `src/data/blog.ts` contains three stable article IDs and full structured Spanish article content; `src/lib/blogFilters.ts` defines the exact all-term/diacritic/tag semantics;
- most components are static markup. The only necessary live UI is blog filtering. Five source files import Framer Motion; `Magnet.tsx` has no source consumer despite `.agents/domains/portfolio.md` describing it as shared motion;
- generated but ignored current `dist/` contains one 334,134-byte raw / 107,458-byte gzip first-party JS bundle, one 23,911-byte raw / 5,687-byte gzip CSS file, and a 972-byte HTML shell. These are observations only and must not be used as the reproducible baseline;
- `ops/deploy-static.sh` will already copy nested Astro output atomically as long as `dist/index.html` exists;
- `ops/auto-deploy-production.sh` currently requires source-root `index.html`, builds with `npm ci && npm run build`, checks a fixed title marker, publishes, and verifies only `/`;
- repository and installed Nginx configurations cache `/assets/` immutably, no-cache only `/index.html`, and use `try_files $uri $uri/ =404`; the installed TLS file is Certbot-managed and currently has no custom `error_page`, so unknown clean routes display the generic Nginx 404;
- a push to `origin/main` invokes production automatically through the existing shared GitHub webhook. The repository must not add a webhook receiver, runtime Node service, adapter, port, or application server.

Authority applied: `.workflow/policy.yaml` and request policy; application/operations source and observed state; tests; `.agents/DESIGN.md` and accepted decisions; curated notes; generated index. There are no accepted ADRs and no repository `.hermes.md`. Source wins over the stale `Magnet` note and the old hash-only guidance in `src/data/README.md`.

## Assumptions and approved defaults

These defaults are part of the implementation plan unless plan approval explicitly changes them:

1. Canonical URLs are `/`, `/blog/`, and `/blog/<stable-id>/`, with `trailingSlash: 'always'` and directory-format output. Same-page anchors remain `/#about`, `/#blog`, `/#projects`, and `/#contact`.
2. Astro remains `output: 'static'` with no adapter. `site` is `https://portfolio.mybrawl.io`, `build.format` is `directory`, and generated assets stay under `/assets/` to avoid production caching drift.
3. Use exact Astro `7.1.3`, whose registry engine requirement (`node >=22.12.0`, npm `>=9.6.5`) is satisfied by the observed host. Use exact versions, not caret ranges, for all newly introduced build/test packages. Preserve Tailwind 3 through the existing PostCSS integration rather than use `@astrojs/tailwind`, whose current peer range does not include Astro 7.
4. The final target is framework-free filtering. A bounded React prototype is still measured as required. Keep React only if it preserves behavior with lower total shipped gzip bytes or if the vanilla alternative cannot pass the same unit/browser/accessibility tests without materially greater complexity. Equal results favor vanilla. The anticipated final state removes React, ReactDOM, Framer Motion, Lucide React, `@vitejs/plugin-react`, and Vite as direct dependencies.
5. Use normal cross-document navigation and the native View Transition API/CSS (`@view-transition { navigation: auto; }`) as the preferred final transition. Unsupported browsers get ordinary navigation. Prototype Astro `ClientRouter` only long enough to measure its global JS and lifecycle behavior; retain it only if native transitions fail focus/announcement acceptance and it still meets route JS budgets. Accessibility, predictable document semantics, and byte budgets outrank exact animation parity.
6. Preserve remote media URLs initially. Do not add build-time remote image fetching, localization, or an image CDN migration. Measure first-party and third-party costs separately.
7. Article back links default in static HTML to `/blog/`. A tiny query enhancement changes them to `/#blog` and the Spanish landing-specific label only when `from=landing`; unknown/missing `from` remains index. No SSR is added for this preference.
8. Unknown canonical posts and malformed/missing legacy article IDs must reach a genuine Nginx 404 with the designed Spanish `404.html`; do not add an SPA fallback.
9. A lab interaction-duration measurement can be used as an INP proxy before release. It must be labeled as such because true field INP cannot be manufactured locally. Lack of production RUM must be reported, not presented as measured field INP.
10. Implementation may install locked dependencies only in the approved isolated worktrees. This PLAN ONLY invocation does not install anything.

No product question blocks isolated implementation. A production release is blocked until a policy-compliant, explicitly approved method for activating the reviewed Nginx `error_page`/cache changes is recorded; the current webhook publishes files but does not install `/etc/nginx` configuration.

## Target architecture

### Static document and component boundary

- `astro.config.mjs` configures static output, canonical site, directory format, trailing slashes, and `build.assets: 'assets'`.
- `src/layouts/BaseLayout.astro` owns `lang="es"`, viewport/theme/font links, per-page title/description/canonical metadata, global CSS, the early legacy-route module on `/`, and shared progressive-enhancement modules. It must not hydrate a page-wide framework root.
- `src/pages/index.astro` composes the landing in the current order: hero, marquee, about, services, blog preview, projects/contact.
- `src/pages/blog/index.astro` renders the full filter controls and every article card as HTML. With JavaScript disabled, filter controls are hidden or clearly inert and every card remains readable/navigable.
- `src/pages/blog/[id].astro` uses `getStaticPaths()` over `blogPosts`. Each page receives one post only and emits unique Spanish title, description, canonical URL, category/tags, article headings, and body. Full article collections must not enter client bundles.
- `src/pages/404.astro` renders the designed Spanish not-found state and safe navigation. Nginx maps real misses internally to this file while retaining status 404.
- Static `.astro` components replace current TSX markup. Reusable arrows/mail icons are inline accessible SVG in `src/components/Icon.astro`; no React icon package is needed.

### Framework-free filter

`src/components/BlogFilters.astro` renders:

- the labelled search input;
- tag `fieldset`/`legend`, “Todas”, exact `aria-pressed` states, and `aria-controls`;
- clear action with correct disabled state;
- polite result status;
- all cards and no-match/no-content states;
- only the searchable card fields (ID, title, excerpt, category, tags) in DOM attributes or a small serialized payload, never article bodies.

`src/scripts/blogFilters.ts` attaches once, uses shared pure helpers from `src/lib/blogFilters.ts`, toggles the native `hidden` state, updates count/pressed/disabled/live-region state, and restores all cards. The pure helper remains Spanish-locale, NFD/diacritic normalized, whitespace-tokenized, all-term matching against title/excerpt/category/tags, with exact tag matching. Unit tests are the semantic source of truth.

The comparison prototype uses temporary `src/components/prototypes/BlogFiltersReact.tsx` plus exact `@astrojs/react@6.0.1`, React 18.3.1, and ReactDOM 18.3.1, hydrated only with `client:load`. It is run against the same tests/markup and measured per-route. If vanilla wins, remove the prototype and React integration/dependencies before the candidate lockfile and final measurements. If React wins, retain only `src/components/BlogFilters.tsx`, `@astrojs/react`, React/ReactDOM/types, and the blog-index island; landing/articles must still request no React chunk. Record the decision and gzip results in workflow evidence.

### Legacy route and navigation compatibility

Refactor `src/lib/blogRoutes.ts` into pure, unit-tested canonical/legacy helpers and use `src/scripts/navigation.ts` for browser behavior:

- `/#/blog` -> `/blog/` with `location.replace()`;
- `/#/blog/<encoded-id>?from=landing|index` -> `/blog/<encoded-id>/?from=landing|index`, preserving valid source and URL encoding;
- missing/malformed encoded IDs -> a known missing canonical path so Nginx returns the designed real 404;
- unknown `#/...` values retain the current safe landing fallback rather than selecting a post;
- `/#blog` and all ordinary landing anchors remain same-document anchors and are never mistaken for legacy routes;
- initial legacy replacement uses `replace`, so back does not lead to a useless hash route;
- canonical card links always use encoded stable IDs and a real query (`?from=landing|index`);
- direct navigation, refresh, new tabs, back/forward, query preservation, and trailing-slash redirect behavior are tested.

Each blog/index/article/404 route heading has `tabindex="-1"` and a route-heading marker. On blog document load and back/forward restoration, the scoped navigation module scrolls to the top as appropriate and focuses the route `h1` with `preventScroll`; landing anchor changes scroll to and focus the associated heading without trapping focus or causing a second jump. The module must not steal focus from an already focused interactive control on ordinary same-document actions.

### Motion, image fallbacks, and view transitions

- Keep core content visible and in final layout before JavaScript. Add enhancement classes only after JavaScript is known to be running.
- Replace `FadeIn` with a shared CSS reveal pattern plus one `IntersectionObserver` in `src/scripts/enhancements.ts`. Failure to initialize reveals all elements; `prefers-reduced-motion: reduce` bypasses transforms/opacity animation.
- Render About copy as one semantic paragraph. Do not reproduce the current hundreds of per-character React spans. An optional CSS/observer emphasis may change opacity only; readable text remains present in no-JS and reduced-motion modes.
- Render marquee rows statically. A passive scroll listener scheduled through one `requestAnimationFrame` updates CSS custom properties only while the section is relevant. No motion on reduced motion; no required content depends on translation.
- Keep project cards static on mobile and reduced motion. Desktop sticky/scale is progressive CSS or one rAF/CSS-variable enhancement, with no React hooks.
- Use delegated/error-safe handling for images marked with `data-image-fallback`. Also check already-complete failed images at initialization, fade only the broken `<img>`, preserve the sized gradient container, dimensions, loading/decoding attributes, and meaningful project `alt`; decorative images retain empty `alt`/`aria-hidden`.
- Add subtle native cross-document view-transition CSS for supported Chromium only. Firefox/WebKit receive normal navigation. Disable transition names/animations under reduced motion. Do not hide the full document while waiting for media/fonts.
- If the ClientRouter prototype is retained, all scripts must initialize on `astro:page-load`, avoid duplicate listeners across ten transitions, use Astro’s route announcement behavior, and remain within the same JS budgets. Otherwise remove all ClientRouter code/dependency before final verification.

## Exact affected files

### Create

- `astro.config.mjs`
- `src/env.d.ts`
- `src/layouts/BaseLayout.astro`
- `src/pages/index.astro`
- `src/pages/blog/index.astro`
- `src/pages/blog/[id].astro`
- `src/pages/404.astro`
- `src/components/Icon.astro`
- `src/components/HeroSection.astro`
- `src/components/MarqueeSection.astro`
- `src/components/AboutSection.astro`
- `src/components/ServicesSection.astro`
- `src/components/BlogCard.astro`
- `src/components/BlogSection.astro`
- `src/components/BlogFilters.astro` (or final `BlogFilters.tsx` only if React wins)
- `src/components/Article.astro`
- `src/components/ProjectsSection.astro`
- `src/scripts/navigation.ts`
- `src/scripts/blogFilters.ts` (vanilla winner only)
- `src/scripts/enhancements.ts`
- `tests/unit/blogFilters.test.ts`
- `tests/unit/blogRoutes.test.ts`
- `tests/static-output.test.ts`
- `tests/e2e/site.spec.ts`
- `tests/e2e/performance.spec.ts`
- `tests/fixtures/nginx.conf`
- `vitest.config.ts`
- `playwright.config.ts`
- `scripts/measure-route-assets.mjs`
- `scripts/benchmark-lighthouse.mjs`
- `scripts/verify-nginx-static.sh`
- `.agents/tasks/reviews/dev-20260722-0719-astro-migration.yaml` as a pending bounded knowledge delta after implementation (not authored knowledge approval)
- a new `.workflow/runs/<UTC-run-id>-astro-static-migration/` run directory, its required request/plan/state/approval/evidence/result records, and the corresponding `.workflow/current.yaml` pointer during approved execution

Temporary comparison-only file, removed if it loses:

- `src/components/prototypes/BlogFiltersReact.tsx`

### Modify

- `package.json`: exact Astro/check/test/browser/benchmark scripts and exact dependency versions
- `package-lock.json`: regenerated only by approved npm operations and verified by two clean `npm ci` builds
- `tsconfig.json`: extend `astro/tsconfigs/strict`, include Astro/TS source and tests as appropriate
- `tailwind.config.js`: scan `./src/**/*.{astro,html,js,jsx,md,mdx,ts,tsx}` and remove reliance on source-root `index.html`
- `src/index.css`: preserve tokens/focus/overflow/reduced-motion rules; change `#root` assumptions; add progressive reveal, marquee/project, `hidden`, JS-only/no-JS, and native view-transition rules
- `src/lib/blogFilters.ts`: preserve semantics while exposing a minimal searchable record shape usable by vanilla and tests
- `src/lib/blogRoutes.ts`: canonical href builders and pure legacy hash mapping
- `src/data/README.md`: replace stale hash-only instructions with canonical routes, stable-ID policy, legacy compatibility, static generation, and approved publish verification
- `.gitignore`: ignore Playwright reports/results, Lighthouse/raw benchmark output, and temporary benchmark artifacts without ignoring authored test fixtures/evidence
- `ops/auto-deploy-production.sh`: require Astro source/config rather than source-root `index.html`; run static route verification; verify index, blog index, all generated article documents, 404, marker, and public canonical routes; preserve lock/branch/clean-tree/fetch/build/atomic/public safeguards
- `ops/nginx/portfolio.mybrawl.io.conf`: immutable `/assets/`, no-cache generated HTML routes, directory `try_files`, and internal `error_page 404 /404.html` with actual 404 status; never add an SPA fallback
- `ops/portfolio-host.sh`: replace the obsolete title marker and make its reviewed Nginx source expectations consistent, without changing DNS/TLS ownership or running it
- `ops/github-webhook-autodeploy.md`: document Astro static output checks, unchanged shared gateway contract, Nginx configuration prerequisite, canonical route verification, and separate release approval

### Delete after parity is implemented

- `index.html`
- `vite.config.ts`
- `tsconfig.node.json`
- `src/main.tsx`
- `src/App.tsx`
- all superseded TSX components under `src/components/`: `AboutSection.tsx`, `AnimatedText.tsx`, `BlogCard.tsx`, `BlogIndexView.tsx`, `BlogPostView.tsx`, `BlogSection.tsx`, `ContactButton.tsx`, `FadeIn.tsx`, `HeroSection.tsx`, `LiveProjectButton.tsx`, `Magnet.tsx`, `MarqueeSection.tsx`, `ProjectsSection.tsx`, `ServicesSection.tsx`

Do not edit `.agents/generated/` manually. Do not edit authored `.agents/context`, `.agents/domains`, `.agents/DESIGN.md`, or create an ADR during implementation; only propose the bounded pending delta for independent review.

## Dependency and script target

Use exact pins compatible with Node 22.16/npm 10.9:

- `astro`: `7.1.3`
- `@astrojs/check`: `0.9.9`
- `typescript`: `5.9.3`
- `tailwindcss`: `3.4.19`
- `postcss`: `8.5.20`
- `autoprefixer`: `10.5.4`
- `vitest`: `4.1.10`
- `@playwright/test`: `1.61.1`
- `@axe-core/playwright`: `4.12.1`
- `lighthouse`: `12.8.2` (not Lighthouse 13.4.1, which requires Node >=22.19)

Comparison-only exact pins: `@astrojs/react` `6.0.1`, React/ReactDOM `18.3.1`, and current matching type packages. Remove them from final `package.json`/lockfile if vanilla wins.

Expected scripts:

- `dev`: `astro dev --host 0.0.0.0`
- `build`: `astro check && astro build`
- `preview`: `astro preview --host 0.0.0.0`
- `check`: `astro check && tsc --noEmit`
- `test`: `vitest run`
- `test:unit`: focused Vitest unit suite
- `test:static`: build first, then Vitest static-output suite
- `test:e2e`: Playwright matrix
- `measure:assets`: route-attributed raw/gzip/brotli first-party asset report
- `benchmark:lighthouse`: controlled five-run baseline/candidate benchmark
- `verify`: check, unit/static tests, build, route-size checks, and policy-safe repository validation; browser tests remain separately visible because browser provisioning can fail independently

## Implementation phases

### Phase 1 — establish the governed isolated run and reproducible Vite baseline

This phase begins only after the external plan is explicitly approved and an execution-start approval is present.

1. Recheck `/home/agent/deployments/marc-portfolio-production` path, `main`, exact baseline SHA, remote, `.workflow/current.yaml`, worktrees, and full Git status. Stop if the active pointer, baseline, or status changed; do not stash/reset/clean or adopt unknown work.
2. Create the repository-local workflow run from templates, copy the approved scope/plan into project-relative records, calculate scope/plan/policy/pre-existing-change digests, obtain valid `plan_approval` and `execution_start` records, and set `.workflow/current.yaml`. The execution-start evidence must use the required six-item order and bind the exact isolated branch and baseline.
3. Create `/home/agent/deployments/marc-portfolio-astro-migration` as branch `feat/astro-static-migration` from exact baseline `c45c6be...`; leave the production checkout untouched. Create a detached read-only-source baseline worktree `/home/agent/deployments/marc-portfolio-vite-baseline-c45c6be` at the same SHA for builds/benchmarks. If either path exists or another workflow run appears, stop for ownership resolution.
4. In the baseline worktree only, run locked `npm ci`, two clean Vite builds, output inventory, route asset compression, and controlled browser/Lighthouse captures. Record Node/npm/commit, exact commands, medians/raw run values, first/third-party transfer split, remote-media failures, and build times in workflow evidence. Do not commit baseline `dist`, `node_modules`, or raw reports.
5. Baseline route matrix uses `/`, `/#blog`, `/#/blog`, and each existing hash article with both `from` values. Capture semantic text, headings, focus, screenshots at required viewports, console/network errors, JS bytes, LCP/CLS, Lighthouse categories, and controlled filter interaction timing. The ignored pre-existing `dist/` is never the benchmark source.

Gate: no migration implementation starts if the locked baseline cannot build or if browser/performance tooling cannot be provisioned after trying the pinned Playwright browsers or a pinned Playwright 1.61.1 container. Record a blocker rather than substituting old artifacts.

### Phase 2 — build and decide the vertical architecture prototypes

1. Replace build scaffolding with the minimum Astro static shell and one representative landing, blog index, article, and 404 route. Pin dependencies and lockfile; keep output under `dist/` and assets under `/assets/`.
2. Write unit tests first for canonical hrefs, legacy hashes (valid, source defaulting, missing, malformed encoding, ordinary anchors, unknown `#/`), filter normalization/diacritics/Spanish casing/all-term matching/tags/count inputs, stable slug uniqueness, and empty collections.
3. Implement both filter variants behind equivalent server-rendered markup. Run the same browser tests, then compare route JS requests, raw/gzip/brotli bytes, DOM payload, accessibility, keyboard behavior, live announcements, implementation surface, and listener lifecycle. Record a decision table. Remove the loser completely.
4. Prototype native cross-document transitions and Astro ClientRouter separately. Test Chromium, Firefox, WebKit, reduced motion, JS disabled, ten back/forward/client navigations, heading focus, title/canonical updates, scroll restoration, duplicate listeners, and global JS. Select native transitions by default; retain ClientRouter only on documented evidence that it is required and budgets still pass.
5. Prove the vertical slice through the Nginx-equivalent fixture: direct `/blog/`, representative `/blog/<id>/`, slash redirect, immutable assets, no-cache HTML, unknown path with designed content and HTTP 404.

Go/no-go gate: stop and report Partial/Blocked before a full rewrite if landing/article first-party JS cannot meet 25 KiB gzip, blog cannot meet 55 KiB gzip, meaningful no-JS content fails, or parity requires global React/Framer Motion. An explicit product decision is required before relaxing those gates.

### Phase 3 — complete the static migration and parity implementation

1. Convert every landing section/card/article into `.astro` markup using current data and classes, preserving Spanish copy, DOM semantics, section order, anchors/heading IDs, Kanit loading, exact design colors/radii/gutters, 44 px controls, wrapping, and reading widths.
2. Generate all three known article routes with unique metadata/canonical URLs and no article collection in client JS. Build the designed 404 and honest unknown-ID path.
3. Complete the selected filtering implementation and all empty/no-match/status/clear/tag states. Ensure all articles remain present without JavaScript.
4. Complete legacy translation, source-aware back links, heading/anchor focus, direct/new-tab/back-forward behavior, and canonical slash/query handling.
5. Replace Framer Motion effects and image handlers with the scoped progressive modules described above. Remove all React/Vite/Framer/Lucide runtime code not justified by the measured winner.
6. Update CSS/Tailwind globs and remove the old root/Vite files. Audit final production bundles to prove landing/article do not request React/Framer or full blog bodies.
7. Update blog authoring documentation and package scripts. Run the full unit/static suite after each coherent area; do not defer route/data regressions to final verification.

### Phase 4 — operations compatibility, automated validation, and candidate evidence

1. Update `ops/auto-deploy-production.sh` prerequisites from source `index.html` to `astro.config.mjs`, `src/pages/index.astro`, package/lock, and deploy scripts. After build, call the repository static-output verifier rather than only grep one title. Verify all expected generated files from `blogPosts`, nonempty hashed assets, application marker, and absence of an SPA fallback. Extend public checks to `/`, `/blog/`, each known article, assets, and a missing path’s 404 status/body while preserving branch, lock, clean tracked tree, fetch, atomic release, and symlink containment checks.
2. Keep `ops/deploy-static.sh` unchanged unless a test proves a necessary static-copy defect; nested directories already copy correctly. Any change needs a focused shell test and separate review.
3. Update repository Nginx config so `/assets/` is immutable, route HTML is no-cache, `try_files $uri $uri/ =404` remains, and `error_page 404 /404.html` internally serves designed content with status 404. Do not add `try_files ... /index.html`, proxying, Node, or webhook locations.
4. Validate an isolated generated Nginx config using `tests/fixtures/nginx.conf`, a temporary prefix/PID/log, a high unprivileged port, and candidate `dist/`. Run `nginx -t -p <temp> -c <fixture>`, start it without touching system Nginx, curl the complete route/header/status matrix, then terminate it and verify no process remains. Do not copy config into `/etc`, run production `nginx -t`, reload Nginx, invoke deploy scripts, or switch symlinks during implementation.
5. Run two fresh `npm ci` + production build cycles from the candidate worktree and compare route inventories/referenced asset hashes where deterministic. Run unit, static, e2e, axe, JS-off, reduced-motion, responsive overflow, remote-image-failure, and performance suites. Inspect final Git diff/status independently and ensure only approved files changed.
6. Create `.agents/tasks/reviews/dev-20260722-0719-astro-migration.yaml` with pending changes for architecture/project/blog/release notes, stale `Magnet` guidance, stale hash-only `src/data/README.md` knowledge, and whether an ADR is warranted for canonical route/deployment contract changes. Do not apply authored knowledge or regenerate the index until independent knowledge review approves it.
7. Write workflow evidence/result with real outputs, failures, benchmark table, exact candidate SHA/diff/artifact digest, pre-existing changes, residual risks, and Git/push/deploy state. Independent verification is required before `ready_for_release`.

Gate: implementation completion does not authorize push or deployment. The feature worktree may be locally committed only under the commit gate below; it remains non-production.

### Phase 5 — separately approved production cutover, observation, and rollback readiness

This phase is deliberately not authorized by plan approval alone.

1. Obtain independent verification of the exact commit and built artifact and transition the run to `ready_for_release`.
2. Resolve the Nginx activation blocker through an explicit higher-authority/policy-compliant release approval naming the exact reviewed config, installed Certbot-preserving target, privileged actor/mechanism, validation/reload commands, and rollback config. The current webhook does not install Nginx configuration; do not infer permission or run `ops/portfolio-host.sh`, which refuses existing config.
3. Recheck `origin/main`. If it moved from the verified base, stop; integrate in a new approved plan, rebuild, reverify, and bind approvals to the new exact commit. Do not force, reset, clean, or stash.
4. Obtain a single-use deployment approval bound to exact candidate commit, artifact digest, `origin/main`, environment `production`, and trigger `github_push_webhook`, with `state.git` allowing that same commit/target. Only then may the exact fast-forward push occur. The push itself triggers production; there is no separate manual deploy command.
5. Independently verify production checkout SHA, release symlink containment, public `/`, `/blog/`, every article, old hashes in a browser, designed 404 with status, slash/query redirects, cache headers, first-party assets, console/network health, reduced motion, focus, and responsive overflow. Record active/previous release paths as evidence, not as permission to mutate them.
6. Observe remote media errors and Web Vitals. Report lab proxy versus real field INP honestly. Do not close a deployed run without post-deploy evidence and closure approval.

## Acceptance criteria

### Static rendering and content

- `dist/index.html`, `dist/blog/index.html`, `dist/blog/arquitecturas-plataformas-iot/index.html`, `dist/blog/rabbitmq-celery-procesos-pesados/index.html`, `dist/blog/infraestructura-distribuida-latencia/index.html`, and `dist/404.html` exist and are nonempty.
- JavaScript-disabled landing, all article cards, full article body, native navigation/contact links, index-return back link, and not-found explanation are usable.
- Page source contains meaningful Spanish text and correct heading hierarchy, not an empty framework root.
- Every article has a unique title/description/canonical URL and no article client bundle contains other full article bodies.
- Spanish content and the `blogPosts`/portfolio data contracts remain intact; stable IDs are unchanged and unique.

### Routes and history

- `/`, `/blog/`, and each known `/blog/<id>/` return 200 directly and on refresh through Nginx-equivalent serving.
- `/blog` and article paths without slash canonicalize consistently while preserving query strings.
- `/#blog` and `/#about|projects|contact` remain working anchors.
- Every current `/#/blog...` contract maps with `location.replace` to the intended canonical route and source query; malformed/missing IDs produce an honest not-found route; unknown old `#/` values retain safe landing fallback.
- Direct navigation, copied URLs, new tabs, back, forward, query-source links, percent encoding, and unknown IDs behave correctly.
- Unknown canonical paths return HTTP 404 with the designed Spanish page, not a 200 SPA fallback or generic Nginx body.

### Filtering and accessibility

- Filtering passes exact tests for NFD diacritic stripping, Spanish locale lowercase, whitespace splitting, all-term matching over title/excerpt/category/tags, exact selected tag, sorted unique tags, counts, clear action, no-match, and no-post states.
- Search is labelled; tags use fieldset/legend and `aria-pressed`; results are controlled and announced politely; disabled/empty/error states are explicit.
- Keyboard-only navigation/filtering is complete, focus is visible, heading focus is predictable, and no focus trap/double scroll occurs.
- Axe has zero serious/critical violations on landing, blog default/filtered/no-match, every article representative, and 404.
- Heading hierarchy, accessible link names, image alternatives, and minimum 44 px targets are preserved.

### Design, motion, and browser behavior

- The site matches `.agents/DESIGN.md`: `#0C0C0C`, `#D7E2EA`, white surfaces, Kanit, established rounded scale, mobile-first gutters, constrained article width, section order, and Spanish labels.
- No horizontal overflow occurs at 320, 375, 768, 1024, or 1440 CSS px, including long tags/URLs/titles.
- With reduced motion, reveal, marquee, character emphasis, project scale, smooth scroll, and page transitions are disabled while all content remains visible.
- With JavaScript disabled or enhancement failure, no content remains opacity-hidden or transformed offscreen.
- Failed remote images leave sized fallback surfaces and do not create broken required text/layout.
- Chromium receives native transitions when supported; Firefox and WebKit normal navigation fallback passes. Required matrix: current pinned Playwright Chromium, Firefox, WebKit; Chromium mobile 320/375; JS-off Chromium; reduced-motion projects. Safari behavior is represented by WebKit automation and called out as not physical-device Safari unless such a device is separately available.

### Build and performance

- Two fresh `npm ci --no-audit --no-fund` installs and `npm run build` runs succeed under Node 22.16/npm 10.9.
- `npm run check`, unit/static tests, all provisioned browser projects, axe, shell syntax/static checks, `git diff --check`, workflow validation, `.agents` validation, and DESIGN validation pass.
- Landing and article first-party JS are <=25 KiB gzip; blog index <=55 KiB gzip and preferably <=30 KiB with vanilla; landing/article request no React or Framer Motion chunk.
- No first-party initialization long task exceeds 50 ms in controlled mobile tracing and ten repeated navigations do not duplicate listeners.
- Median of five identical controlled mobile Lighthouse runs per representative baseline/candidate route: LCP <=2.5 s and >=20% better unless baseline <=2.0 s; CLS <=0.10 and no regression >0.02; controlled filter/route interaction duration <=200 ms as a clearly labeled lab INP proxy; performance improves >=10 points or reaches >=90; Accessibility/Best Practices/SEO each >=95 without baseline regression.
- Build time <=30 seconds and <=25% slower than clean Vite baseline unless a documented blocker is approved.
- Reports include all five values/median, exact browser/version/throttling, warmup policy, remote media failures, and separate first-/third-party transfer. A failed gate is a blocker, not a rounded or omitted result.

### Operations

- Isolated Nginx-equivalent serving proves canonical route status, slash redirects, designed 404/status, `/assets/` immutable headers, and generated HTML no-cache headers.
- Hook checks recognize Astro source and every expected output while retaining lock, branch, clean-tree, exact origin, atomic symlink, and HTTPS safeguards.
- `dist/index.html` remains compatible with `ops/deploy-static.sh`; no application server, adapter, webhook receiver, runtime Node process, port, DNS, secret, or production data change is introduced.
- No production Nginx/config/symlink/deploy state changes occur before the separate exact release gate.

## Exact tests and verification commands

Commands below are for an approved execution in the isolated worktrees, not this planning invocation.

### Identity, policy, and isolation

```bash
cd /home/agent/deployments/marc-portfolio-production
pwd
git status --short --branch --untracked-files=all
git rev-parse HEAD
git worktree list --porcelain
git remote -v
python3 .workflow/scripts/validate.py --project .
python3 .agents/scripts/index_project.py --project . validate
node --version
npm --version
```

After valid workflow approvals:

```bash
git worktree add -b feat/astro-static-migration /home/agent/deployments/marc-portfolio-astro-migration c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed
git worktree add --detach /home/agent/deployments/marc-portfolio-vite-baseline-c45c6be c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed
```

### Baseline and candidate build

```bash
cd /home/agent/deployments/marc-portfolio-vite-baseline-c45c6be
npm ci --no-audit --no-fund
/usr/bin/time -f '%e' npm run build
# Repeat from a fresh locked install/build; do not use the original ignored dist.

cd /home/agent/deployments/marc-portfolio-astro-migration
npm ci --no-audit --no-fund
npm run check
npm run test:unit
npm run build
npm run test:static
npm run measure:assets -- --format json
```

The static suite must import `blogPosts` and assert each exact output path/metadata/content/asset reference, so future posts automatically expand the expected route inventory.

### Browser/accessibility matrix

Provision exact Playwright 1.61.1 browsers in the approved isolated environment (`npx playwright install chromium firefox webkit`) or use the matching pinned Playwright container if host provisioning is unavailable. Do not silently skip a browser.

```bash
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=webkit
npm run test:e2e -- --project=chromium-mobile-320
npm run test:e2e -- --project=chromium-mobile-375
npm run test:e2e -- --project=chromium-js-off
npm run test:e2e -- --project=chromium-reduced-motion
```

Required cases include `/`, all landing anchors, old index/article hashes with both sources, `/blog/`, every article/source query, unknown/missing/malformed IDs, 404, direct/refresh/new-tab/back/forward, heading focus, filter keyboard/live states, ten repeated transitions, remote image failure, console/page errors, and overflow at all required widths.

### Performance

Start baseline and candidate servers on distinct loopback ports through tracked scripts/config, verify readiness, then run:

```bash
npm run benchmark:lighthouse -- \
  --baseline http://127.0.0.1:4173 \
  --candidate http://127.0.0.1:4321 \
  --runs 5 \
  --routes /,blog-index,article
npm run measure:assets -- --baseline /home/agent/deployments/marc-portfolio-vite-baseline-c45c6be/dist --candidate dist --format json
npm run test:e2e -- --project=chromium --grep '@performance'
```

Use Lighthouse 12.8.2 with the same pinned Chromium, mobile emulation/throttling, cold cache policy, route content, and remote-media mode for both. Run one controlled first-party comparison with third-party requests blocked and one end-to-end comparison with remote media enabled. Store raw generated reports in ignored paths; summarize real values in workflow evidence/result.

### Nginx/deploy compatibility without production mutation

```bash
bash -n ops/auto-deploy-production.sh ops/deploy-static.sh ops/portfolio-host.sh scripts/verify-nginx-static.sh
./scripts/verify-nginx-static.sh --dist "$PWD/dist" --nginx /usr/sbin/nginx
```

The script must use a temporary prefix/config and unprivileged port, assert headers/status/body for all routes/assets/404, terminate its child, and leave production `/etc/nginx` and `/var/www` untouched. Do not execute `ops/auto-deploy-production.sh`, `ops/deploy-static.sh`, `ops/portfolio-host.sh`, system `nginx -t`, or `systemctl reload nginx` in implementation.

### Final repository validation

```bash
npm ci --no-audit --no-fund
npm run verify
npm run build
npm run test:static
npm run test:e2e
git diff --check
git status --short --branch --untracked-files=all
git diff --stat
git diff -- package.json package-lock.json astro.config.mjs src tests scripts ops .gitignore
python3 .workflow/scripts/validate.py --project . --run <run-id>
python3 .agents/scripts/index_project.py --project . validate
python3 .agents/scripts/validate_design.py .agents/DESIGN.md
python3 -m unittest discover -s .workflow/tests -p 'test_*.py' -v
python3 -m unittest discover -s .agents/tests -p 'test_*.py' -v
```

If authored `.agents` changes are later independently approved, apply only that reviewed delta, then run `index`, `validate`, DESIGN validation, and index tests and commit generated database/graph/state together. That is not part of unreviewed implementation.

## Git, commit, push, deployment, and rollback policy

### Planning state

- This plan writes only the external `plan.md`.
- No application/workflow/knowledge files, dependencies, branches, worktrees, commits, pushes, Nginx, webhook, release symlinks, or production state may be changed in PLAN ONLY.

### Implementation branch/worktree gate

- Start only from clean `main` at exact `c45c6be...`, with `active_run: null`, a valid plan approval, and a valid execution-start approval bound to `feat/astro-static-migration`, baseline, policy digest, plan digest, and empty pre-existing-change digest.
- Work only in `/home/agent/deployments/marc-portfolio-astro-migration`; baseline builds stay in the detached baseline worktree. Preserve the production checkout.
- Never use stash, `git reset --hard`, `git clean` (including `-fdx`), force-push, or overwrite unrelated files. Stop if pending/loose work appears or ownership is unclear.

### Commit gate

Plan approval alone does not imply commit permission. Local commits are allowed only if the user’s implementation approval and repository run explicitly set `state.git.commit_allowed: true` for this scope. Otherwise leave the verified diff uncommitted.

When authorized, create scoped, reviewable local commits on `feat/astro-static-migration` only, after relevant tests:

1. `test: add Astro migration parity and measurement harness`
2. `feat: migrate portfolio and blog to Astro static routes`
3. `feat: add progressive filtering motion and route compatibility`
4. `chore: update static hosting and deployment checks`
5. `docs: propose migration knowledge delta` (only the pending delta/workflow evidence; no unreviewed authored knowledge)

Do not manufacture empty commits, mix unrelated changes, or amend after approvals bind an exact candidate unless the approval is invalidated and repeated.

### Push and production gates

- Push is denied throughout prototype/implementation. No branch push is implicit in commit permission.
- An optional later push of `feat/astro-static-migration` requires a separate explicit push approval naming that exact target and SHA; it does not authorize `main`.
- Any push to `origin/main` is a production deployment trigger. It is forbidden until: all acceptance criteria pass or blockers are explicitly accepted; independent verification is recorded; the run is `ready_for_release`; Nginx activation has an explicitly approved policy-compliant plan; and a single-use deployment approval binds the exact commit, artifact digest, `origin/main`, production, and `github_push_webhook`.
- If `origin/main` advances, stop and invalidate old artifact/commit approvals. Re-integrate without force/reset/stash, rebuild, rebenchmark relevant deltas, and obtain new exact approvals.
- Never deploy manually or invoke the publisher as a substitute for the webhook. Never alter DNS, secrets, production data, or webhook configuration.

### Rollback

- Known-good application baseline: `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed` and the previous timestamped release recorded immediately before cutover.
- Preferred rollback is a normal approved Git revert of the complete migration commit range, independently verified and pushed as a new commit to `origin/main`, which triggers the same controlled webhook. Do not reset `main`, force-push, manually switch `current`, or assume old release presence is permission.
- Pair application/package/ops rollback with the reviewed Nginx compatibility decision. The proposed Nginx `/assets/` and `try_files` rules remain Vite-compatible; if `404.html` is absent after rollback, explicitly verify generic 404 behavior or restore the approved previous Nginx config through the separately authorized infrastructure mechanism.
- Before cutover, record baseline/candidate SHAs, commit range, artifact SHA-256, previous/current release targets, exact Nginx config backup/digest, and rollback verification route/header commands.

## Risks and mitigations

| Risk | Impact | Mitigation / stop condition |
| --- | --- | --- |
| Legacy fragments never reach Nginx | Old article bookmarks appear broken | Early tested `/` compatibility module, `location.replace`, encoded ID/source matrix, honest missing route. |
| Vanilla controls differ from React semantics | Search/a11y regression | Shared pure helper tests and identical Playwright/axe suite; measured React prototype remains fallback. |
| React/ClientRouter erase JS savings | Migration fails purpose | Route-attributed gzip/network tests; remove losing framework/router; hard budgets are go/no-go. |
| Progressive reveal hides content after script failure | No-JS/a11y failure | Visible default, enhancement class only after init, failure cleanup reveals all, JS-off tests. |
| Custom scroll code janks or duplicates listeners | INP/main-thread regression | One passive listener/rAF, intersection scoping, cleanup, ten-navigation and long-task tests. |
| Native transitions are Chromium-only | Uneven animation | Ordinary cross-document fallback in Firefox/WebKit; motion is nonessential; reduced-motion disables it. |
| Route heading focus causes scroll jumps or steals control focus | Accessibility regression | Scoped initial/route logic, `preventScroll`, anchor-specific tests, keyboard/back-forward matrix. |
| Astro default assets bypass immutable cache | Repeat-load regression | Explicit `build.assets: 'assets'`; static inventory and Nginx header assertions. |
| Unknown paths still show generic/200 page | 404/SEO regression | Internal Nginx `error_page`, real status curl assertions, no SPA fallback. |
| Repository Nginx differs from installed Certbot config | Production 404/cache mismatch | Separate exact privileged activation gate; preserve Certbot directives; compare installed digest; block push until resolved. |
| Hook accepts root but misses nested failures | Broken production deploy | Verify all `blogPosts` routes, 404, assets, markers, and public status before/after atomic publish. |
| Latest Lighthouse is incompatible with host Node | Benchmark unavailable | Pin Lighthouse 12.8.2; pin browser; report provisioning failures honestly. |
| Browser binaries unavailable on host | Matrix cannot run | Install exact Playwright browsers in isolated execution or use matching pinned container; do not skip silently. |
| Remote GIF/images dominate metrics or fail | Astro gain obscured/layout changes | Preserve dimensions/fallbacks; separate blocked-third-party and full-page runs; report remote costs. |
| Google Fonts/remote media cause nondeterminism | Flaky visual/perf tests | Record failed requests; use consistent network mode; compare first-party separately; no unapproved media scope expansion. |
| Large rewrite changes Spanish copy/design | Product regression | Reuse data verbatim, screenshots/semantic assertions, exact viewport/overflow/design checks, independent diff review. |
| `.agents` guidance remains stale | Future agents use old routing/stack | Submit bounded pending knowledge delta; independent review before authored update/reindex. |
| Multiple commits complicate rollback | Partial rollback | Release and revert the entire reviewed range as one compatibility set; bind approval to exact final artifact. |

## Blockers and required decisions

- No blocker prevents writing or approving this implementation plan.
- Isolated implementation must stop if `main`/origin baseline changes, Git/workflow is no longer clean/inactive, worktree paths already have unclear ownership, locked Vite baseline fails, or required browser tooling cannot be provisioned.
- The full migration must stop for an explicit product decision if exact Framer Motion/ClientRouter/React fidelity is demanded despite failing JS/performance gates.
- Production cutover is blocked until an explicit release decision supplies a policy-compliant mechanism and authority for installing the reviewed Nginx changes while preserving the live Certbot TLS configuration. A repository config diff and webhook push alone do not activate those rules.
- Any failed acceptance/performance/browser/operations gate must be reported as Partial/Blocked with real evidence; it may be waived only by a new scoped approval that updates the plan digest and release acceptance.

## Knowledge-delta assessment

The migration changes durable architecture, route, build, blog-authoring, and release facts. Implementation should propose—but not self-approve—updates to:

- `.agents/context/project.md` (Astro static stack, no global React/Vite runtime);
- `.agents/context/architecture.md` (file-based static routes, progressive scripts, static output);
- `.agents/domains/blog.md` (canonical directory routes plus legacy compatibility and filter implementation);
- `.agents/domains/portfolio.md` (Astro components, removal of unused `Magnet`/Framer Motion);
- `.agents/domains/release.md` (Astro output/deploy checks and Nginx 404/cache prerequisite);
- possibly a first ADR for the canonical route/static-hosting contract because it replaces a stable public hash contract with compatibility mapping.

`DESIGN.md` should remain unchanged unless implementation proves an actual token/rule change; the plan requires visual preservation. The pending delta remains `review_status: pending` until an independent knowledge reviewer validates source/tests and authorizes any authored changes and reindex.

## Plan integrity and approval binding

Approval must bind the SHA-256 of the final bytes of this file and the exact scope. Because embedding a file’s own digest in the file is self-referential, record the computed digest in the immutable approval/state artifacts, not by editing this section after hashing. Any textual plan/scope change invalidates the old digest and requires replanning and new approvals.
