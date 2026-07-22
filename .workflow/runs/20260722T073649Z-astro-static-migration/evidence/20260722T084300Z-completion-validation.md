# Completion validation

## Prototype decisions

- React filter comparison used exact temporary pins `@astrojs/react@6.0.1`, `react@18.3.1`, `react-dom@18.3.1`, `@types/react@18.3.31`, and `@types/react-dom@18.3.7`, with SSR plus `client:load`. The same unit/static filter semantics and Chromium interactive status/filter assertion passed.
- React blog route: 55,601 B gzip external first-party JS; `BlogFiltersReact` 25,957 B raw / 9,761 B gzip / 8,674 B Brotli, Astro client runtime 134,548 / 43,269 / 37,953 B, React helper 6,530 / 2,571 / 2,277 B. SSR blog HTML was 17,154 B and 95 elements. Prototype source was 4,045 B / 28 lines.
- Vanilla blog route: zero external first-party JS; inline behavior is included in HTML. SSR blog HTML was 13,823 B and 94 elements. Filter source was 1,587 B / 6 formatted source lines. Current final CSS is 11,676 B raw / 3,645 B gzip / 3,160 B Brotli. Vanilla wins by the approved shipped-gzip rule. The React prototype, integration, and all comparison dependencies were removed from source, manifest, and lockfile.
- Astro ClientRouter prototype shipped 16,080 B raw / 5,497 B gzip / 4,913 B Brotli globally. Its route announcer worked, but route-heading focus failed after ten client transitions because document-load enhancements did not rerun. Native cross-document transitions ship zero external JS, announce through native document/title behavior, reinitialize one bounded listener set per document, passed heading focus/history and ten-navigation tests, and disable motion under `prefers-reduced-motion`. Native wins by accessibility/lifecycle priority and bytes. ClientRouter and its comparison test were removed.

## Lighthouse 12.8.2

Command used exact Playwright Chromium 1.61.1 via `CHROME_PATH`, two clean static directories served by identical Python static servers, five cold mobile runs per paired route, and both first-party-blocked and full-media modes. Raw JSON and `summary.json` were written to ignored `lighthouse-results-final/`; the harness exited zero and reported `failures: []` for the approved controlled gates.

Controlled first-party medians:

| Pair | Performance | Accessibility | Best practices | SEO | LCP ms | CLS | first-party transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline `/` | 87 | 91 | 100 | 100 | 2904.472 | 0 | 359,588 B |
| candidate `/` | 100 | 100 | 100 | 100 | 1531.594 | 0 | 54,146 B |
| baseline `/#/blog` | 90 | 100 | 100 | 100 | 2924.606 | 0 | 359,588 B |
| candidate `/blog/` | 100 | 100 | 100 | 100 | 1381.839 | 0 | 26,117 B |

Full-media diagnostic medians (not silently treated as controlled gates):

| Pair | Performance | Accessibility | Best practices | SEO | LCP ms | CLS | first / third-party transfer |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| baseline `/` | 73 | 91 | 79 | 100 | 4654.835 | 0 | 359,588 / 42,201,065 B |
| candidate `/` | 88 | 100 | 79 | 100 | 2297.592 | 0.109 | 54,146 / 183,461,428 B |
| baseline `/#/blog` | 79 | 100 | 100 | 100 | 3667.803 | 0.098 | 359,588 / 42,816 B |
| candidate `/blog/` | 96 | 100 | 100 | 100 | 2287.302 | 0.030 | 26,117 / 42,861 B |

The remote landing media provider delivered materially different and extremely large payloads across baseline/candidate captures despite unchanged URLs. This is an honest external-media risk, not first-party transfer. No field INP is claimed; the Chromium filter-duration lab proxy passed under 200 ms.

## Browser, static hosting, and accessibility

- Host matrix: 44 passed, 10 intentional project-specific skips across Chromium, Firefox, widths 320/375/768/1024/1440, JS disabled, and reduced motion. Skips are the Chromium-only interaction proxy in other projects plus JS-dependent navigation/listener cases in JS-off.
- Pinned container WebKit: 5 passed, 1 Chromium-only performance skip in `mcr.microsoft.com/playwright:v1.61.1-noble`.
- Coverage includes canonical/direct/refresh/history/new-tab routes, legacy and malformed hashes, anchors, route/control focus, tag/search/live-region/no-match/clear, ten navigations, bounded listener registration, no-JS content, image failure, reduced motion, overflow at every required width, and axe serious/critical checks on landing, no-match filter, article, and 404 states.
- `./scripts/verify-nginx-static.sh` passed isolated `nginx -t`, every canonical route, and an actual unknown-route HTTP 404 containing the designed Spanish 404 document. It did not touch system Nginx.

## Clean installs and repository validation

- Fresh `npm ci && npm run build` cycle 1: 18.84 s. Cycle 2: 17.82 s. Both succeeded.
- `npm run verify`: Astro/TypeScript clean; 8 unit assertions, six-route build, 8 static-output assertions, and asset gate passed.
- Shell syntax, `git diff --check`, workflow validator, agent index validator, DESIGN validator, and all 10 agent tests passed.
- Workflow suite in the active repository reports 25/28 because three repository-neutral fixture expectations intentionally reject any active run. The exact same 28-test suite run from a neutral `c45c6be` archive passed 28/28; application/workflow records were not weakened to mask active-run state.
- Knowledge delta now uses exactly the template key shape and remains pending. Authored and generated knowledge were not changed.

## Boundaries

No push, deployment, publisher, production checkout, system Nginx edit, reset, clean, stash, or production action occurred. Full-media remote variability and the need for independent workflow verification remain disclosed.
