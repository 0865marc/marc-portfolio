# Acceptance scope

Partial Astro static migration candidate in the approved isolated worktree. No production checkout, remote, deploy publisher, system Nginx, DNS, secrets, webhook, symlink, or authored/generated knowledge was changed.

# Commands and real results

- Identity: branch `feat/astro-static-migration`, baseline `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`, initially clean; workflow validation passed before application changes.
- Baseline supplied by the approved request: two clean Vite installs/builds succeeded; builds 5.53 s and 5.44 s; HTML 972 B, CSS 23,911 B (about 5.71 KiB gzip), JS 333,720 B (about 107.79 KiB gzip), deterministic hashes.
- `npm run verify`: passed Astro/TypeScript diagnostics, 8 unit assertions, build, 8 static-output assertions, and asset measurement.
- Candidate emits six required documents: landing, blog index, three article directories, and `404.html`.
- Candidate clean `npm ci` plus build totals: 17.02 s and 16.23 s. The build itself reports about 0.8-1.0 s after Astro check; both totals are below 30 s and include installation.
- Candidate CSS: 11,676 B raw, 3,646 B gzip, 3,161 B Brotli. Inline script payload/gzip: landing and article 1,827/883 B; blog index 3,180/1,427 B. No React, Framer Motion, or external first-party JS chunk is emitted.
- Host Playwright: Chromium and Firefox executed; WebKit could not launch because the host lacks its GTK/GStreamer/WebKit libraries. The pinned `mcr.microsoft.com/playwright:v1.61.1-noble` image executed WebKit. Controlled first-party WebKit rerun: 5 passed, 1 Chromium-only performance test skipped.
- Full container matrix after candidate fixes: Chromium, Firefox, mobile 320/375, JS-off, reduced-motion, and WebKit route/filter/article/legacy/fallback cases executed. Initial WebKit full-media landing crashed while decoding many third-party GIFs; controlled first-party mode passes. Third-party media remains a reported cost/risk.
- Axe controlled Chromium landing had zero serious/critical violations after increasing secondary-label contrast. The 320 px overflow regression found by the first run was fixed and rerun successfully.
- Chromium lab filter interaction proxy passed under 200 ms. This is not field INP.
- `./scripts/verify-nginx-static.sh`: isolated `nginx -t` and route/status matrix passed, including designed 404 with HTTP 404. It used a temporary prefix and left no server running.
- Shell syntax, `git diff --check`, workflow validator, `.agents` validator, DESIGN validator, and all 10 `.agents` tests passed.
- Workflow unit suite: 25 of 28 passed; three repository-neutral fixture tests fail only because this approved run is active (`runs_checked` is 1 and a fixture temporarily creates a second non-terminal run). This is a test-contract incompatibility, not hidden as a pass.

# Diff observations

The candidate replaces the Vite/React root and superseded TSX components with Astro layouts/pages/components and three small vanilla enhancements. It updates static hosting checks, adds automated validation, and proposes only a pending bounded knowledge delta. The source remains uncommitted because completion gates are not satisfied.

# Failures, skips, and limitations

- Required measured React-filter versus vanilla prototype was not completed. Final vanilla is substantially below budgets, but the required comparative evidence is absent.
- Required Astro ClientRouter versus native-transition prototype was not completed. Native transitions are implemented; comparative lifecycle/global-byte evidence is absent.
- Five-run Lighthouse baseline/candidate results, LCP/CLS/category medians, controlled first-/third-party transfer split, and true route long-task traces were not produced. The tracked Lighthouse entry point refuses to fabricate results and needs completion with a pinned executable CDP launch.
- Browser coverage is materially useful but not the entire exhaustive route/history/ten-transition matrix specified by the approved plan.
- Physical Safari was not tested. WebKit automation was tested in the pinned container.
- Full remote-media WebKit crashed once; controlled first-party mode passes. Remote media remains nondeterministic and costly.

# Artifact and target identity

- Baseline: `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`.
- Candidate commit: none; working tree is intentionally uncommitted.
- Candidate dist manifest SHA-256: `f3410025a6d71b8effd537127811b8e32ea7df722c21afefabbbfde8835f670c`.
- Push: none and forbidden. Deployment: none and forbidden. Rollback baseline remains unchanged.
- Knowledge delta: `.agents/tasks/reviews/dev-20260722-0719-astro-migration.yaml`, pending; no authored knowledge or generated index changes.

# Conclusion

Partial/Blocked. Static routes, no-JS documents, vanilla filters, accessibility fixes, framework removal, and isolated Nginx compatibility are implemented and pass their available gates. The run cannot honestly claim complete validation or readiness because mandatory prototype comparisons and five-run Lighthouse evidence are absent.
