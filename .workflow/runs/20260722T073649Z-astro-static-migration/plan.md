# Astro migration unblock and release-preparation plan

## Objective

Resume the existing governed Astro migration in `/home/agent/deployments/marc-portfolio-astro-migration` without redoing or weakening successful work. Preserve the three existing scoped commits ending at `1028ec86ec7e50577f1f3546f1b80bd73f29ab3c`, and address only the remaining release blockers:

1. diagnose and correct the pinned Playwright 1.61.1 WebKit route/history/new-tab/ten-navigation failure, then rerun the complete browser matrix;
2. identify and remove the landing page's full-media layout shift so a reproducible five-run median CLS is `<= 0.10`, without hiding content, replacing the approved remote URLs, or redesigning the site; and
3. prepare and validate a guarded, Certbot-preserving Nginx activation mechanism, while keeping repository/configuration preparation separate from any privileged production activation.

The user explicitly waives only the relative build-time regression: the independently measured Astro build was `8.91 s` versus the Vite baseline `5.44 s` (reported as approximately 64% slower). Do not optimize build time. Keep both values and the scoped waiver in workflow evidence and the final report. Build success and the absolute `<= 30 s` ceiling remain required.

No push, deployment, system Nginx edit/reload, release-symlink change, DNS change, or production checkout mutation is part of this plan.

## Current system and preserved foundation

### Repository and workflow state inspected on 2026-07-22

- Feature worktree: `/home/agent/deployments/marc-portfolio-astro-migration`.
- Branch: `feat/astro-static-migration`.
- Clean feature HEAD: `1028ec86ec7e50577f1f3546f1b80bd73f29ab3c`.
- Preserved commits:
  - `7139fb2` — Astro static migration;
  - `08d03b9` — workflow/completion evidence;
  - `1028ec8` — independent WebKit blocker evidence and one race correction.
- Production checkout: `/home/agent/deployments/marc-portfolio-production`, still at clean `main`/`origin/main` baseline `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`.
- Detached Vite baseline worktree remains `/home/agent/deployments/marc-portfolio-vite-baseline-c45c6be` at that same SHA.
- Active repository run: `.workflow/runs/20260722T073649Z-astro-static-migration/`, status `blocked`, resume state `verifying`, local commit allowed, push/deployment denied.
- Existing static/unit/Chromium/Firefox/accessibility/first-party-performance/isolated-Nginx work is successful and must not be replaced wholesale.
- No authored `.agents/` context/design/ADR or generated index change is authorized. The existing pending knowledge delta remains pending.

### Implemented architecture to preserve

- Astro 7.1.3 emits six static documents: landing, blog index, three article routes, and `404.html`.
- Filtering is framework-free and server-rendered; React, Vite runtime, Framer Motion, Lucide, and ClientRouter are absent.
- Canonical directory routes, legacy hash translation, source-aware article back links, no-JS content, reduced-motion fallback, native view transitions, accessible focus, image fallbacks, and real Nginx 404 behavior are already implemented.
- First-party controlled medians and JS budgets pass; external first-party JS is zero on all routes.
- Current WebKit blocker is concentrated in `tests/e2e/site.spec.ts`'s combined route test. Reported symptoms vary: an unexpected return to `/#blog`, context loss while opening a second page, and a locator timeout even though the failure snapshot contains article links.
- Current landing media already has explicit wrapper dimensions/aspect ratios. The full-media CLS therefore must be attributed before changing markup. Likely contributors include remote font swap, external GIF/image lifecycle, reveal state, or test/harness timing; none is assumed to be the cause without trace evidence.

### Production Nginx facts to preserve

The installed file `/etc/nginx/sites-available/portfolio.mybrawl.io` is a Certbot-modified TLS configuration, enabled through `/etc/nginx/sites-enabled/portfolio.mybrawl.io`. It contains the live certificate paths, TLS include, DH parameters, HTTPS listeners, and Certbot HTTP redirect server. Its observed SHA-256 is `3a7b5508104c4de7f8ea16619e3f9d9c19511ec54524af8ff00e48354f723792`. The pre-Certbot backup digest is `d1fc4ff9566108e2afc45e27415556eec6a05e281a59c74cd5703fc75750c910`. These are observations, not permanent assumptions: any drift before activation is a hard stop requiring a new diff/review.

The repository's `ops/nginx/portfolio.mybrawl.io.conf` is an HTTP bootstrap source and must not overwrite the installed Certbot TLS file. `ops/portfolio-host.sh enable-http` intentionally refuses an existing site and is not an update mechanism. The existing webhook publishes static files only; it does not activate Nginx configuration.

## Authority, assumptions, and scope boundaries

1. `.workflow/policy.yaml`, the request, and current user feedback govern Git and release behavior. Application/operations source and observed behavior outrank stale `.agents` notes. `.agents/context/*` still describes the old React/Vite baseline and is intentionally not edited without independent knowledge review.
2. The revised external plan is not execution approval. Before implementation, its exact content must be copied into the active repository run, the run's plan digest updated through valid immutable approval history, and a new approval/execution-resume event must bind the revised plan, branch, baseline, policy digest, and current clean candidate HEAD. Existing approvals bound to the old plan are insufficient.
3. Preserve existing branch history. Do not recreate the feature worktree, rebase, amend, squash, reset, clean, or stash.
4. Keep all existing remote media URLs and visible Spanish content. A CLS fix may reserve geometry, stabilize font fallback metrics, or defer a nonessential visual enhancement, but may not hide required content, remove media, localize/download remote assets, or change the approved media architecture.
5. Physical Safari remains outside available tooling. Pinned Playwright WebKit is the required automated representation; this limitation must remain explicit.
6. Repository Nginx preparation may add a reviewed post-Certbot target and guarded activation tooling. The execution covered by this plan may only test those artifacts in temporary directories/fake roots and inspect production read-only. It may not write under `/etc/nginx`, invoke Certbot, run system `nginx -t`, reload Nginx, or issue production activation/rollback commands.
7. The build waiver does not waive failed builds, nondeterministic output, static route failures, browser failures, CLS above `0.10`, Nginx safety checks, or the absolute 30-second build ceiling.

## Affected components and exact file scope

Only files proven necessary during diagnosis may change. Expected scope:

### WebKit diagnosis and correction

- Modify `tests/e2e/site.spec.ts` to separate route/anchor focus, second-page/new-tab, and repeated history traversal into independently attributable tests; use normal actionable clicks and explicit navigation/lifecycle waits rather than `force: true` or arbitrary sleeps.
- Modify `playwright.config.ts` only if a deterministic WebKit-specific timeout, worker, trace/video, or server-readiness setting is proven necessary. Do not skip WebKit or relax behavior assertions.
- Modify `src/scripts/navigation.ts` only if traces demonstrate an application lifecycle defect, such as duplicate/stale focus timers around `pageshow`, `pagereveal`, `pagehide`, or BFCache restoration.
- Modify `src/layouts/BaseLayout.astro` only if the legacy inline redirect or script loading order is proven to create WebKit history/lifecycle corruption.
- Do not add browser sniffing, WebKit-only product behavior, blanket retries, `waitForTimeout`, forced clicks, or an allowed-failure configuration.

### CLS attribution and minimal fix

- Modify `scripts/benchmark-lighthouse.mjs` to retain per-run layout-shift attribution from Lighthouse diagnostics and to enforce the newly binding full-media landing median CLS ceiling without conflating first- and third-party transfer.
- Modify `tests/e2e/performance.spec.ts` (or create a narrowly focused `tests/e2e/layout-shift.spec.ts` if separation is clearer) to collect `PerformanceObserver` layout-shift entries with `hadRecentInput === false`, source selectors/rectangles, font readiness, image completion/dimensions, and viewport state.
- Depending on measured attribution, minimally modify one or more of:
  - `src/layouts/BaseLayout.astro` for stable font-loading/fallback metrics while retaining Kanit and current remote font scope;
  - `src/components/MarqueeSection.astro` for stronger fixed geometry or delayed nonessential animation only;
  - `src/components/ProjectsSection.astro` for explicit media geometry/fallback containment;
  - `src/index.css` for `aspect-ratio`, fixed/min-block sizing, font metric fallback, containment, or stable reveal geometry;
  - `src/scripts/enhancements.ts` only if enhancement timing itself is an attributed shift source.
- Do not modify `src/data/portfolio.ts` remote URLs unless a new product decision explicitly expands scope.

### Certbot-preserving Nginx activation preparation

- Keep `ops/nginx/portfolio.mybrawl.io.conf` as the bootstrap HTTP configuration, modifying it only if comments/naming are needed to make that boundary unambiguous.
- Create `ops/nginx/portfolio.mybrawl.io.certbot.conf` as the exact intended post-Certbot production target: preserve the currently observed Certbot HTTPS listeners, certificate/key paths, TLS include, DH parameter, HTTP redirect server, annotations, domain, root, and symlink release model; add only the reviewed Astro static HTML cache and internal designed-404 rules.
- Create `ops/activate-nginx-static.sh` as a guarded privileged release tool with distinct nonmutating `check` and mutating `activate`/`rollback` paths. It must:
  - require explicit expected live and candidate SHA-256 values;
  - verify the canonical available file, exact enabled symlink target, domain/root, and required Certbot directives;
  - refuse drift, missing TLS material, unexpected files/symlinks, or an unapproved candidate digest;
  - validate the exact candidate through a temporary top-level Nginx test config before installation;
  - create a unique root-owned timestamped backup and record its digest;
  - atomically install without replacing the enabled symlink;
  - run `nginx -t`, reload once, and automatically restore/revalidate/reload the backup if activation fails;
  - support an explicit rollback only when the active and backup digests match supplied approved values;
  - never invoke Certbot, edit certificates, deploy files, switch the release symlink, or alter DNS/webhook state.
- Create `tests/fixtures/nginx-certbot-live.conf` as a credential-free structural fixture reflecting the observed live Certbot layout.
- Create `tests/ops/nginx-activation.test.sh` to exercise check, drift refusal, candidate validation, backup/install, failed-validation rollback, successful reload, and explicit rollback using temporary paths and fake `nginx`/`systemctl`; no root or production path may be touched.
- Modify `scripts/verify-nginx-static.sh` and/or `tests/fixtures/nginx.conf` to validate both static route semantics and the post-Certbot candidate's application locations without loading production TLS material.
- Modify `ops/portfolio-host.sh` help/comments only as needed to label it a bootstrap tool and point existing TLS sites to the new guarded update mechanism; do not weaken its overwrite refusal.
- Modify `ops/github-webhook-autodeploy.md` to document the separate activation prerequisite, exact release order, digest binding, Certbot preservation, verification, and rollback.
- Modify `package.json` only if needed to expose the new deterministic operations test through `npm run verify`; update `package-lock.json` only if `package.json` dependency metadata actually changes. No new runtime dependency is expected.

### Workflow/result records

- Update the active run's `plan.md`, `state.yaml`, approval references, evidence, and result according to `.workflow` schemas and append-only approval/event policy.
- Add new immutable approval records for the revised plan/resumed execution; do not rewrite old approvals or evidence.
- Update the external `result.md` after execution with real commands/results, all five CLS values, WebKit disposition, build waiver, Nginx preparation status, Git actions, and release boundary.
- Amend the existing pending `.agents/tasks/reviews/dev-20260722-0719-astro-migration.yaml` only if the durable proposed release mechanism materially changes; do not apply authored knowledge or regenerate `.agents/generated/`.

## Implementation phases

### Phase 1 — governed resume and evidence-preserving diagnosis

1. From `/home/agent/deployments/marc-portfolio-astro-migration`, verify exact root, branch, clean status, HEAD `1028ec86...`, worktree list, `origin/main` baseline, active workflow pointer, installed tool versions, and read-only live Nginx digest. Verify the production checkout remains clean and untouched.
2. Stop immediately if the feature tree is dirty, HEAD/branch/worktree ownership differs, `origin/main` moved, another run is active, or the live Nginx digest/layout changed. Do not absorb, discard, or overwrite unexplained work.
3. After explicit approval of this revised plan, update the existing run with the exact approved plan and immutable replacement approval/resume evidence. Validate the workflow before editing application or operations files.
4. Reproduce the WebKit failure with the exact pinned `mcr.microsoft.com/playwright:v1.61.1-noble` image, one worker, `--ipc=host`, remote requests blocked for this functional test, retained trace, and repeat runs. Record Docker image/tag/digest, command, browser version, exit status, URL/history sequence, page/context `close`/`crash` events, and trace paths.
5. Split the combined route test without changing acceptance semantics. Run each slice independently and repeatedly:
   - landing `#blog` anchor plus heading focus and canonical blog navigation;
   - direct/copy URL in a genuinely separate page, then close only that page;
   - five article-forward/back cycles (ten cross-document navigations) with canonical URL, heading focus, and blog card assertions after every traversal;
   - final refresh/focus.
6. Compare behavior with and without the popup and with a minimal static two-page fixture. This distinguishes product lifecycle/history defects from Playwright-container process/resource defects. Remove diagnostic-only logging or keep it behind a documented opt-in environment variable before final commit.
7. Apply the smallest evidence-backed fix. If product code is at fault, make focus scheduling idempotent, cancel stale timers on `pagehide`, and preserve BFCache-safe history semantics. If only the test is at fault, replace the invalid synchronization/action with user-representative Playwright APIs while retaining separate-page and history coverage. Never make the assertion less strict merely to get green.
8. Run the focused WebKit tests at least five consecutive times before the full matrix. A single retry-based pass is insufficient.

### Phase 2 — CLS attribution, minimal reservation fix, and five-run proof

1. Build the current candidate unchanged and run five full-media landing measurements to reconfirm the issue under the same Lighthouse 12.8.2/pinned Chromium mobile configuration used previously. Preserve raw run values and remote request outcomes.
2. Add layout-shift attribution. For every unexpected shift, record affected node/selectors, previous/current rectangles, timestamp, font readiness, image natural/rendered dimensions, and loaded/failed state. Correlate Lighthouse `layout-shifts` diagnostics with a Playwright `PerformanceObserver`; do not infer that transfer size itself caused CLS.
3. Make one minimal fix based on the dominant source:
   - font swap: retain Kanit but provide a metric-compatible fallback/size adjustment or stable critical heading block geometry;
   - remote GIF/project media: preserve URLs and visible frames, but enforce explicit block/inline dimensions, `aspect-ratio`, overflow, and fallback containment before responses arrive;
   - reveal/animation: keep content in final layout and defer only transform/opacity enhancement until stable, without `display`, positional, or size changes;
   - another measured source: constrain only that source and document why.
4. Run responsive overflow, reduced-motion, JS-off, image-failure, accessibility, and visual checks after the fix to prove that reservation did not hide content or alter design semantics.
5. Run exactly five fresh full-media landing Lighthouse measurements under identical cold-cache mobile settings. Record all five CLS values, sorted values, median, LCP, category scores, first-/third-party transfer, failed remote requests, browser/Lighthouse versions, and the attribution summary. The harness must fail when the full-media landing median exceeds `0.10`.
6. Rerun the controlled first-party landing/blog benchmark to ensure the fix does not regress already passing gates. Do not rerun or optimize solely for the relative build-time gate; simply record the new correctness-build duration beside the accepted `8.91 s`/`5.44 s` waiver.

### Phase 3 — repository/config preparation for Certbot-safe activation

1. Re-read (not modify) the installed live site and enabled symlink, compare them to the recorded digest and Certbot directives, and derive the post-Certbot repository target. Keep the HTTP bootstrap file separate.
2. Implement the guarded activation script and post-Certbot target described above. Candidate application rules remain:
   - `/assets/`: existing-file-only, one-year expiry, `Cache-Control: public, immutable`;
   - generated `.html`: existing-file-only, `Cache-Control: no-cache`;
   - `/`: `try_files $uri $uri/ =404`, never `/index.html` SPA fallback;
   - `error_page 404 /404.html` plus internal/no-cache `404.html`, retaining HTTP 404 status.
3. Exercise the activation mechanism entirely against temporary fake paths and commands. Prove digest drift refusal, Certbot-directive preservation, exact enabled symlink preservation, candidate syntax check, atomic backup/install, automatic rollback on failed validation/reload, and explicit digest-bound rollback.
4. Run the existing isolated Nginx route/header/status matrix against `dist/` and extend it to assert immutable assets and no-cache generated HTML, not only route status/body.
5. Document, but do not execute, the later production sequence:
   - independent review binds exact candidate config/script/commit digests;
   - a separate privileged Nginx activation approval names actor, live digest, candidate digest, backup path/digest, check/activate/rollback commands, and expected TLS/public checks;
   - the privileged actor runs the nonmutating check, then activation, `nginx -t`, reload, and pre-push HTTPS/TLS verification;
   - only after Nginx activation evidence and all application gates pass may a separate exact push/deployment approval authorize the release-triggering push;
   - webhook deployment and post-deploy route/cache/404/TLS verification remain distinct evidence.
6. Do not run the new `activate` or `rollback` modes, `certbot`, system `nginx -t`, `systemctl reload nginx`, publisher scripts, or production curl mutations during implementation.

### Phase 4 — complete rerun, independent review, and release-gate disposition

1. Run two correctness builds from locked dependencies as needed for deterministic artifact verification. Report duration; apply the scoped relative-build waiver and do not treat the accepted 64% relative slowdown as a blocker. A failed build, nondeterministic route inventory, or duration above 30 seconds still blocks.
2. Run checks, unit/static tests, the complete host Playwright matrix, and the complete pinned-container WebKit project. Do not report only the focused WebKit test. Preserve intentional skips only where the project is genuinely inapplicable (for example the Chromium-only interaction proxy); WebKit functional tests must have zero skips/failures.
3. Rerun axe, JavaScript-off, reduced-motion, image-failure, all required viewports/overflow, legacy hashes, direct/refresh/new-tab/back/forward, five forward/back loops, filter semantics, and Nginx route/header/404 tests.
4. Independently inspect `git status`, complete diff from `1028ec8`, and complete migration diff from `c45c6be`; verify no successful migration work was removed and no production/authored-knowledge/generated-index state changed.
5. Obtain independent verification of the exact final local HEAD and deterministic artifact/config digests. Update the workflow from `blocked` back through its recorded `verifying` resume state only when the revised acceptance criteria pass. Do not mark `ready_for_release` merely because implementation is complete; the policy-compliant Nginx activation is prepared but not activated.
6. Record all real failures and limitations. Push and deploy remain forbidden.

## Exact verification commands

These commands are for a later approved execution from the feature worktree. Container volume/user details may be adapted only to preserve file ownership; browser/image versions and test semantics must remain exact.

### Identity and governance

```bash
cd /home/agent/deployments/marc-portfolio-astro-migration
pwd
git status --short --branch --untracked-files=all
git rev-parse HEAD
git rev-parse origin/main
git worktree list --porcelain
git -C /home/agent/deployments/marc-portfolio-production status --short --branch --untracked-files=all
sha256sum /etc/nginx/sites-available/portfolio.mybrawl.io
readlink -f /etc/nginx/sites-enabled/portfolio.mybrawl.io
python3 .workflow/scripts/validate.py --project . --run 20260722T073649Z-astro-static-migration
python3 .agents/scripts/index_project.py --project . validate
python3 .agents/scripts/validate_design.py .agents/DESIGN.md
node --version
npm --version
docker --version
```

Expected pre-edit identity: clean feature branch at `1028ec86...`, clean production checkout and `origin/main` at `c45c6be1...`, active blocked run with resume state `verifying`, and observed live Nginx digest `3a7b5508...`. Any mismatch stops execution for review.

### Focused WebKit diagnosis and stability

```bash
npm ci --no-audit --no-fund
npm run build
# Serve candidate on a container-reachable address/port, verify readiness, then:
docker run --rm --init --ipc=host \
  -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.61.1-noble \
  npx playwright test tests/e2e/site.spec.ts \
    --project=webkit --workers=1 \
    --grep 'route|new tab|history|ten navigations' \
    --trace=retain-on-failure
# Repeat the focused green test five times without retries:
docker run --rm --init --ipc=host \
  -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.61.1-noble \
  npx playwright test tests/e2e/site.spec.ts \
    --project=webkit --workers=1 --repeat-each=5 \
    --grep 'route|new tab|history|ten navigations'
```

The actual server networking command must be recorded in evidence. Do not use `--retries` to satisfy the five-pass stability requirement.

### CLS attribution and five-run benchmark

```bash
npm run test:e2e -- --project=chromium --grep 'layout shift|performance'
CHROME_PATH="<exact Playwright-1.61.1 Chromium executable>" \
  npm run benchmark:lighthouse -- \
    --baseline http://127.0.0.1:4173 \
    --candidate http://127.0.0.1:4321 \
    --runs 5 \
    --baseline-routes '/,/#/blog' \
    --candidate-routes '/,/blog/' \
    --output lighthouse-results-unblock
```

The summary must expose each candidate landing full-media CLS value and a median `<= 0.10`; first-party and third-party transfer remain separate. Raw output stays ignored, while exact values and attribution enter workflow evidence.

### Nginx preparation tests without production mutation

```bash
bash -n \
  ops/auto-deploy-production.sh \
  ops/deploy-static.sh \
  ops/portfolio-host.sh \
  ops/activate-nginx-static.sh \
  scripts/verify-nginx-static.sh \
  tests/ops/nginx-activation.test.sh
bash tests/ops/nginx-activation.test.sh
./ops/activate-nginx-static.sh check \
  --current tests/fixtures/nginx-certbot-live.conf \
  --candidate ops/nginx/portfolio.mybrawl.io.certbot.conf \
  --expected-current-sha256 "<fixture-digest>" \
  --expected-candidate-sha256 "<candidate-digest>" \
  --test-mode
./scripts/verify-nginx-static.sh --dist "$PWD/dist" --nginx /usr/sbin/nginx
```

The production activation command belongs only in release documentation/evidence and must not be run during this implementation. Test-only path overrides must be explicitly gated and refused by mutating production mode.

### Full application/browser/repository rerun

```bash
npm ci --no-audit --no-fund
/usr/bin/time -f '%e' npm run verify
/usr/bin/time -f '%e' npm run build
npm run test:static
npm run test:e2e -- --project=chromium
npm run test:e2e -- --project=firefox
npm run test:e2e -- --project=chromium-mobile-320
npm run test:e2e -- --project=chromium-mobile-375
npm run test:e2e -- --project=chromium-768
npm run test:e2e -- --project=chromium-1024
npm run test:e2e -- --project=chromium-1440
npm run test:e2e -- --project=chromium-js-off
npm run test:e2e -- --project=chromium-reduced-motion
# Run the complete WebKit project in the exact pinned container, one worker:
docker run --rm --init --ipc=host \
  -v "$PWD:/work" -w /work \
  mcr.microsoft.com/playwright:v1.61.1-noble \
  npx playwright test --project=webkit --workers=1
bash -n ops/*.sh scripts/*.sh tests/ops/*.sh
bash tests/ops/nginx-activation.test.sh
./scripts/verify-nginx-static.sh --dist "$PWD/dist" --nginx /usr/sbin/nginx
git diff --check
git status --short --branch --untracked-files=all
git diff --stat 1028ec86ec7e50577f1f3546f1b80bd73f29ab3c
git diff 1028ec86ec7e50577f1f3546f1b80bd73f29ab3c -- src tests scripts ops package.json package-lock.json playwright.config.ts .workflow .agents/tasks/reviews
python3 .workflow/scripts/validate.py --project . --run 20260722T073649Z-astro-static-migration
python3 .agents/scripts/index_project.py --project . validate
python3 .agents/scripts/validate_design.py .agents/DESIGN.md
python3 -m unittest discover -s .agents/tests -p 'test_*.py' -v
```

Also rerun the `.workflow` unit suite and disclose its result. The already documented three active-run fixture failures may remain a known tooling limitation only if the validator itself passes and the failures are unchanged and unrelated; do not alter workflow policy/tests merely to hide them.

## Acceptance criteria

### WebKit and browser behavior

- The pinned Playwright 1.61.1 WebKit focused route/new-tab/history/ten-navigation tests pass five consecutive runs with retries disabled and no page/context crash.
- The complete pinned WebKit project passes all applicable functional tests with zero functional skips/failures.
- New-tab verification uses a genuinely separate browser page and proves direct article content; history proves five article-forward/back cycles, canonical URLs, expected route heading focus, and restored blog cards after each back traversal.
- Landing anchors, canonical routes, legacy hashes, malformed hashes, refresh, query-source links, focus, BFCache/pageshow behavior, and ordinary control focus retain existing semantics.
- Full Chromium, Firefox, mobile widths, JS-off, reduced-motion, image failure, accessibility, filter, and overflow suites remain green.
- Any test-only synchronization fix is evidence-backed and does not use forced clicks, fixed sleeps, retries, browser skips, or weakened assertions to conceal a product defect.

### CLS and performance

- Five cold, identical, full-media candidate landing runs are recorded individually; their median CLS is `<= 0.10`.
- Layout-shift attribution identifies the corrected source. The fix reserves stable layout before font/media/enhancement completion and preserves visible Spanish content, Kanit design intent, remote media URLs, image alternatives/fallbacks, no-JS behavior, and reduced motion.
- No horizontal overflow occurs at 320, 375, 768, 1024, or 1440 CSS px; axe retains zero serious/critical violations on representative states.
- Existing first-party JS, LCP, CLS, category, transfer, and interaction gates remain passing. First-/third-party costs and remote failures remain separate and honest.
- Build succeeds and remains under 30 seconds. The `8.91 s` Astro versus `5.44 s` Vite relative regression is explicitly accepted and documented; no relative build optimization or `<=25%` gate applies to this continuation.

### Nginx preparation and release boundary

- Repository contains a separately named post-Certbot target that preserves all observed live TLS/certificate/redirect directives and adds only the reviewed Astro static rules.
- Guarded activation tests prove expected-digest binding, drift refusal, symlink preservation, candidate validation, unique backup/digest, atomic install, automatic rollback, explicit rollback, and no Certbot/certificate/deploy/symlink-release mutation.
- Isolated Nginx serves `/`, `/blog/`, every known article, assets, and the designed unknown-route page with correct 200/404 statuses and immutable/no-cache headers.
- `ops/nginx/portfolio.mybrawl.io.conf` remains clearly identified as bootstrap-only; neither it nor `portfolio-host.sh enable-http` is presented as safe for overwriting the existing TLS site.
- No production Nginx file, service, certificate, release symlink, checkout, or public deployment state changes during implementation.
- Production remains blocked until an independent verifier approves the exact final commit/artifact/config digests, a separate privileged Nginx activation approval is executed and evidenced, and a separate single-use deployment approval authorizes the exact push target/commit/trigger.

### Repository and governance

- Existing commits and successful migration behavior are preserved; changes from `1028ec8` are limited to the blockers and their tests/evidence.
- Workflow validation, `.agents` index validation, DESIGN validation, `.agents` tests, static/unit checks, shell syntax, and `git diff --check` pass; known workflow active-run fixture limitations are disclosed rather than hidden.
- No authored `.agents` knowledge or generated index is changed without independent review.
- Final report includes commands, real outputs, five CLS values/median, WebKit results, config and artifact digests, build waiver, pre-existing changes, Git actions, production actions (none), residual risks, and remaining release gate.

## Git, commit, push, deployment, and rollback policy

### Branch/worktree handling

- Continue only in `/home/agent/deployments/marc-portfolio-astro-migration` on `feat/astro-static-migration` at `1028ec86...`; do not create another feature branch/worktree or modify the production/baseline worktrees.
- Preserve `7139fb2`, `08d03b9`, and `1028ec8` exactly. No rebase, amend, squash, cherry-pick rewrite, reset, clean, stash, force operation, or unrelated change.
- If loose/uncommitted files appear, stop and resolve ownership before proceeding.

### Commit policy

- This planning run authorizes no commit.
- During later execution, local commits are allowed only after the revised plan has explicit approval, the active workflow run has valid revised-plan/resume approvals, and `state.git.commit_allowed` remains `true`.
- Prefer three scoped local commits after their respective tests pass:
  1. `fix: stabilize WebKit navigation and landing layout`;
  2. `chore: prepare Certbot-safe Nginx activation`;
  3. `chore(workflow): record Astro migration unblock verification`.
- If diagnosis shows the WebKit and CLS fixes are independently reviewable, split the first commit into two; do not create artificial/empty commits. Never amend an approval-bound candidate; add a new scoped commit and repeat verification.

### Push and deployment policy

- Push is forbidden. No feature branch or `origin/main` push is authorized.
- Deployment is forbidden. Do not invoke `ops/auto-deploy-production.sh`, `ops/deploy-static.sh`, `ops/portfolio-host.sh` mutating modes, the new Nginx activation/rollback modes, Certbot, system Nginx validation/reload, or release symlink operations.
- A future push to `origin/main` triggers production automatically and requires a separate single-use deployment approval bound to exact final commit, artifact digest, target `origin/main`, environment `production`, and trigger `github_push_webhook` after independent verification and successful Nginx activation evidence.
- If `origin/main`, live Nginx digest, candidate config, or certificate directives change before release, all affected approvals/digests are stale; stop, regenerate the exact diff/artifact, reverify, and obtain new approvals.

### Rollback

- No production rollback is needed during this continuation because no production action is authorized.
- Application rollback baseline remains `c45c6be1d0ccc91a2bc293db21a9b49503fdf5ed`. After any future approved release, rollback is a normal reviewed Git revert of the full migration range and a separately approved push; never reset or force-push.
- Nginx activation must create and report a unique backup before replacement. On failed candidate validation/reload, the tool automatically restores that exact backup, runs `nginx -t`, and reloads. A later explicit rollback requires approved active/backup digests and then verifies TLS certificate paths, root response, route behavior, cache headers, and 404 behavior.
- Application and Nginx rollback decisions are paired: the proposed Astro rules remain Vite-compatible, but a rollback lacking `404.html` must either restore the prior Nginx config or explicitly accept generic 404 behavior through the approved rollback path.

## Stop conditions, risks, and blockers

| Condition/risk | Required response |
| --- | --- |
| Feature HEAD/status/worktree, active run, production checkout, or `origin/main` differs from inspected state | Stop; do not overwrite, reset, clean, stash, or silently integrate. |
| Revised plan lacks valid digest-bound approval/resume evidence | Do not edit or commit. |
| WebKit fails on the minimal static fixture or browser process still crashes with one worker and `--ipc=host` | Treat as a pinned tooling/container blocker; preserve traces and report honestly rather than weaken application tests. |
| WebKit exposes a real navigation/focus/BFCache defect | Fix the minimal shared lifecycle code and rerun all browsers; do not add browser sniffing. |
| Full-media CLS remains above `0.10` after evidence-backed reservation | Continue only with another in-scope minimal reservation; stop for a product decision if the only remaining remedies remove/change remote media, hide content, localize assets, or redesign typography/layout. |
| Remote media is unavailable/variable | Record failed URLs/transfers and use the five-run median; do not discard bad runs or substitute controlled first-party data for the required full-media proof. |
| Build is still more than 25% slower than Vite | Apply the explicit scoped waiver and continue; do not optimize. Stop only if build fails or exceeds 30 seconds. |
| Live Nginx digest, symlink, Certbot paths/includes, domain/root, or certificates differ from the observed source | Do not prepare or activate against stale assumptions; update the candidate/digests and obtain new independent review/approval. |
| Nginx candidate cannot be validated safely in temporary/fake environments | Report Blocked; do not test by modifying `/etc/nginx`. |
| Privileged actor/approval is unavailable | Repository preparation may complete, but production remains blocked. Do not elevate or substitute an application/webhook mechanism. |
| Any functional/accessibility/static/Nginx gate regresses | Fix within this narrow scope or report Partial/Blocked with real evidence. |

## Essential blocking questions

No product decision blocks the revised planning or approved repository implementation. The build-time waiver is explicit. Production release remains intentionally blocked until two later decisions are recorded separately:

1. a privileged Nginx activation approval naming the exact reviewed live/candidate/backup digests, actor, commands, and rollback; and
2. after activation and independent application verification, a single-use push/deployment approval bound to the exact final commit/artifact and `origin/main` webhook trigger.
