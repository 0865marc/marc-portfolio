# Independent verification

# Acceptance scope

Independent verification of the committed Astro migration in the isolated `feat/astro-static-migration` worktree. Production, remotes, deployment, system Nginx, authored `.agents` knowledge, and generated indexes remained untouched.

# Commands and real results

- `npm ci --no-audit --no-fund`: passed twice independently in 7.61 s and 6.46 s.
- `npm run verify`: passed in 18.35 s; Astro/TypeScript reported zero diagnostics, 8 unit tests passed, all 6 static routes built, 8 static-output assertions passed, and route JS measurement reported 0 external first-party JS gzip.
- Two independent candidate builds produced the same manifest digest `a97bad68c3867c7988e6ea14ad66e03bca84833f159a87b717c85ee731c25fa9`; the second build took 8.91 s including `astro check`.
- Host Playwright matrix across Chromium, Firefox, 320/375/768/1024/1440, JavaScript disabled, and reduced motion: 44 passed, 10 intentional project-specific skips.
- Pinned `mcr.microsoft.com/playwright:v1.61.1-noble` WebKit matrix: failed the route/history/new-tab/ten-navigation case on three independent attempts; the remaining four functional cases passed and the Chromium-only performance case skipped. Failures included history returning to `/#blog`, WebKit context loss during `newPage`, and a WebKit locator timeout despite the snapshot containing the expected links. A test race was corrected by waiting for the article URL before asserting focus/back navigation, but the pinned WebKit hard gate still did not pass.
- `bash -n` for all scoped shell scripts: passed.
- `./scripts/verify-nginx-static.sh --dist "$PWD/dist" --nginx /usr/sbin/nginx`: passed isolated syntax and route/status checks, including designed content with actual 404 status.
- Workflow validator, `.agents` index validator, DESIGN validator, all 10 `.agents` tests, and `git diff --check`: passed.
- `.workflow` unit suite: 25/28 passed; three neutral-repository fixtures fail in the presence of the active run, as already disclosed.
- Production checkout remained clean at `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`.

# Diff observations

The implementation matches the approved Astro/static scope and contains no React, ClientRouter, Framer Motion, Vite runtime, deployment invocation, or authored/generated knowledge update. The final test change only removes a false-positive navigation race by waiting for the canonical article URL before evaluating focus and browser history.

# Failures, skips, and limitations

The required pinned WebKit acceptance matrix is not green. Physical Safari was not available. Because the approved plan explicitly makes a browser-gate failure blocking, the candidate cannot be described as production-ready even though Chromium/Firefox, static, accessibility, controlled Lighthouse, and Nginx gates pass.

The Lighthouse raw reports remain ignored local artifacts. Their five-run controlled summary is recorded in completion evidence; independent review validated the tracked summary and reproducible harness but did not repeat all 40 Lighthouse runs.

# Artifact and target identity

- Baseline: `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`.
- Independently verified implementation HEAD before the final test/evidence commit: `08d03b97ea091e55b08e53262572c3ea0f79012e`.
- Deterministic candidate manifest digest: `a97bad68c3867c7988e6ea14ad66e03bca84833f159a87b717c85ee731c25fa9`.
- Push: none. Deployment: none. Rollback baseline unchanged.

# Conclusion

Partial/Blocked. The implemented migration is reviewable and most gates pass, but the pinned WebKit browser hard gate failed during independent verification and may not be waived without a new scoped approval.
