# Astro migration unblock verification

Recorded by Codex on 2026-07-22 after approved execution. This is implementation evidence for independent review; it is not a deployment or privileged Nginx activation approval.

## Governance correction

The validator incorrectly recomputed every immutable approval against the current mutable `plan.md`. It now retains superseded plan/execution event digests as immutable history while `validate_gate_lifecycle` still requires the effective latest plan approval and execution start to bind the current state/plan digest. Focused old/current-plan regression tests pass and the active run validates. The complete workflow suite reports 26 passes and the same three active-run fixture failures documented before this continuation.

## WebKit and browser results

- Pinned image: `mcr.microsoft.com/playwright:v1.61.1-noble@sha256:5b8f294aff9041b7191c34a4bab3ac270157a28774d4b0660e9743297b697e48`.
- Focused WebKit repeat: 25/25 passed, one worker, retries disabled, separate page plus five ten-navigation histories.
- Complete WebKit: 8/8 applicable functional tests passed; two Chromium-only performance probes skipped. One valid history run required about two minutes, so the evidence-backed WebKit test timeout is 180 seconds.
- Host matrix: 70 passed, 20 intentional project-inapplicable skips across Chromium, Firefox, widths 320/375/768/1024/1440, JavaScript-off, and reduced-motion.
- No force click, fixed sleep, retry, WebKit functional skip, or product browser sniffing is used.
- Minimal two-document WebKit history fixture passed 5/5 during diagnosis and was removed after diagnosis.

## CLS and performance

Before the fix, full-media landing CLS was `0.109, 0.109, 0.109, 0.109, 0.109` (median `0.109`). Lighthouse attributed the single dominant shift (`0.1093195625882974`) to four Kanit web-font loads moving the centered hero copy. Browser attribution separately confirmed font-loading shifts while remote image boxes retained rendered dimensions despite incomplete image requests.

Kanit remains the selected remote font and URL scope; `font-display=optional` prevents a late metric-changing swap. Five fresh post-fix full-media landing values were `0.000, 0.000, 0.000, 0.000, 0.000` (median `0.000`). LCP values were `1380.318, 1384.520, 1378.172, 1380.880, 1399.531` ms (median `1380.880` ms). Median category scores were performance 93, accessibility 100, best-practices 79, SEO 100. First-party transfer was 10,015 bytes each run; third-party transfer values were 183,463,696, 183,461,672, 183,461,181, 183,461,460, and 183,461,924 bytes (median 183,461,672). Recorded failed remote requests were zero. Controlled first-party median CLS remained 0 and median LCP was 1382.535 ms.

Lighthouse 12.8.2 used Playwright 1.61.1 Chromium from `/home/agent/.cache/ms-playwright/chromium-1228/chrome-linux64/chrome`. The harness now retains layout-shift causes/failed remote requests and enforces full-media landing median CLS <= 0.10.

## Build, static output, and operations

- Correctness build: 9.63 seconds, six static pages, zero diagnostics, below the absolute 30-second ceiling.
- Scoped waiver retained: accepted Astro 8.91 seconds versus Vite 5.44 seconds (about 64% slower); no relative build gate applies.
- `npm run verify`, static/unit checks, zero first-party JS, shell syntax, activation fake-root tests, and isolated Nginx route/status/cache-header matrix pass.
- Certbot candidate SHA-256: `ba27b992eb9981e8ef2228de8af9240f833c943ad857766e21b435d379919770`.
- Activation script SHA-256: `0493bf9f7b282f351aef7b1caa595c5e3ddd1b0bca4809517f5606647fd400b2`.
- Built landing SHA-256: `ba4683df0373c3cc7ec1b09beafeb22109ee01cc25158a0ad776806b8b5b7f05`.
- Live Nginx remained read-only at `3a7b5508104c4de7f8ea16619e3f9d9c19511ec54524af8ff00e48354f723792`; enabled symlink still resolves to `/etc/nginx/sites-available/portfolio.mybrawl.io`.
- `.agents` index/DESIGN validation and all 10 `.agents` unit tests pass; pending knowledge remains pending and no authored/generated knowledge changed.

## Git and release boundary

Local implementation commits are `9e6e28c` (WebKit/CLS) and `3662c95` (Certbot-safe Nginx preparation). No push, deployment, production checkout change, system Nginx validation/reload, Certbot invocation, release-symlink change, or public mutation occurred. Production remains blocked pending independent verification, a separate digest-bound privileged Nginx activation approval/execution, and a later single-use exact push/deployment approval.
