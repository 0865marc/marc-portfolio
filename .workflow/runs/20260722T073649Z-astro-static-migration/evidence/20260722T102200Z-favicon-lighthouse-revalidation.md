# Favicon and controlled Lighthouse revalidation

Recorded by Codex on 2026-07-22 after independent verification found a non-waived controlled first-party best-practices score of 79 on IPv6 loopback. This is additive candidate verification evidence, not production activation or deployment approval.

## Diagnosis and minimal fix

The candidate did not declare or emit a favicon, so Chromium requested `/favicon.ico` and logged a first-party 404. The smallest approved-scope correction adds `public/favicon.svg`, declares it from the shared layout, and adds a static-output regression assertion. It does not change visible page design, remote URLs, font/CLS behavior, Nginx configuration or behavior, accessibility, JavaScript-off behavior, or reduced-motion behavior.

Commit `231d857` contains only this fix and its regression assertion. Built favicon SHA-256 is `8af7e7ad2ad982cc83947bef909cd16037e3283fa4c26a8f45391584d44fde2e`; built landing SHA-256 is `50b5e8ce0575a2ef58045e96bf144036603e2e503fd93c5487d0efaf78c8ca58`.

## Exact controlled revalidation

A temporary `python3 -m http.server 4321 --bind 127.0.0.1 --directory dist` server returned HTTP 200 with `Content-Type: image/svg+xml` for `/favicon.svg`. Lighthouse 12.8.2 used Playwright 1.61.1 Chromium at `/home/agent/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome` with:

```text
CHROME_PATH=/home/agent/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome npm run benchmark:lighthouse -- --candidate http://127.0.0.1:4321 --runs 5 --candidate-routes / --output lighthouse-results-favicon-127
```

The command exited 0 with the existing thresholds unchanged and `failures: []`. Controlled first-party results were best-practices `100, 100, 100, 100, 100`; performance, accessibility, and SEO were also 100 in every run; CLS was `0, 0, 0, 0, 0`; LCP was `1530.912, 1530.752, 1531.603, 1532.104, 1531.597` ms (median `1531.597` ms).

Full-media CLS was independently `0, 0, 0, 0, 0` (median `0`). Full-media LCP was `2443.749, 2441.623, 1529.034, 2305.442, 1529.722` ms (median `2305.442` ms), and performance was `94, 94, 95, 89, 93` (median 94). Full-media best-practices remained 79 because the approved `motionsites.ai` media responses set a third-party `__cf_bm` cookie and produce related Chrome cookie Issues; those findings are separate from the now-passing controlled first-party category gate. No remote request failed. First-party transfer median was 54,600 bytes and third-party transfer median was 183,461,279 bytes. Raw ignored summary SHA-256 was `9f662c1ff72688cebf9c0febf16f77c2d72fa11e105d28951e6073839d8a5649`.

The server log confirmed `/favicon.svg` returned 200 on every Lighthouse visit and no `/favicon.ico` request occurred. Lighthouse itself requested missing `/robots.txt`; this did not reduce the controlled category scores.

## Relevant regression results and boundary

- `npm run build` passed with six static pages and zero diagnostics; `npm run test:static` passed 9/9.
- `/usr/bin/time -f 'verify_seconds=%e' npm run verify` passed in 19.13 seconds, including check, unit, build, static, zero-JS asset budget, and fake-root Nginx activation tests.
- Chromium, JavaScript-off, and reduced-motion projects passed 21 applicable tests with 9 intentional project-inapplicable skips, including layout shift, axe, navigation/history, image failure, and overflow coverage. A first attempt did not start because a prior container-owned ignored `test-results/.last-run.json` was not writable; the successful rerun used a fresh `/tmp` output directory and did not modify that residue.
- `git diff --check` passed before the fix commit. No threshold, remote URL, CLS fix, Nginx artifact, `.agents` file, production checkout, live Nginx file/service, release symlink, push, or deployment changed.

Production remains blocked exactly as before: independent final-head/digest verification, separately approved privileged Nginx activation, and a later single-use exact push/deployment approval are still required.
