# Professional Hero Redesign Implementation Plan

> Planning deliverable only. Implementation must begin only after orchestrator/user approval.

## Goal

Redesign only the first viewport into a clean, mobile-first, typographic hero that presents Marc's role, a concise factual value proposition, and one clear contact action without clipped text, decorative collisions, or a remote portrait dependency.

## Architecture/design direction

Use a single normal-flow editorial composition inside a constrained page container. Keep the dark background, the existing restrained gradient text treatment, Spanish navigation, and subtle `FadeIn` motion, but remove the portrait/emoji and its `Magnet` layer entirely from the hero. The copy and CTA will form one left-aligned content cluster at every breakpoint; desktop will gain scale and whitespace rather than a second decorative column.

Tech stack: React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion, Lucide React.

## Current understanding and evidence

- Active project: `/home/agent/projects/marc-portfolio`; environment: local; current/default branch: `main`.
- No `AGENTS.md` was found in the project.
- The working tree is already dirty. `src/components/HeroSection.tsx`, `src/components/ContactButton.tsx`, several non-hero source files, and workflow/deployment artifacts contain prior user work. Those changes are not a baseline to reset.
- The current hero makes clipping structural: its heading uses `whitespace-nowrap`, viewport-sized type up to `17.5vw`, and an `overflow-hidden` parent. The remote portrait is absolutely positioned through `Magnet`, while the long support sentence is uppercase and constrained to 220–260px.
- `ContactButton` already uses the approved Spanish label `Hablemos`, links to `#contact`, has an accessible label, and is shared by the About section. It should be reused unchanged.
- `FadeIn` renders complete DOM text and has a `useReducedMotion` fallback. `AnimatedText` is not used by the hero and should not be introduced.
- `src/index.css` provides the shared `.hero-heading` gradient, focus-visible outlines, global overflow guards, and reduced-motion rules. The gradient/focus/motion rules can remain unchanged; overflow clipping must not be used as evidence that the redesigned hero fits.
- The source contains all required targets: `#hero-title`, `#about`, `#blog`, `#projects`, and `#contact`.

## Frontend/UI-UX input

The requested dedicated `frontend` profile run timed out. `.workflow/frontend_report.md` is explicitly a fallback report based primarily on source inspection, not a completed frontend-profile audit, and that timeout/fallback disclosure must remain intact. Existing fallback screenshots/metrics were considered only as unverified visual context; they are not acceptance evidence.

The fallback findings align with the source: the mobile composition places the portrait over the clipped heading and compresses the support copy/CTA below it; the desktop composition leaves a clipped oversized heading, a narrow text column, an isolated portrait, and a distant CTA as disconnected visual zones. The plan integrates the report's recommended principles—normal-flow text, sentence casing, readable measure, one CTA, restrained motion, and portrait removal—while simplifying its suggested copy to avoid redundant role/value lines.

A fresh post-implementation browser audit is mandatory before the hero can be called fixed.

## Approved copy and information hierarchy

Use this exact visible Spanish copy unless the user changes it during approval:

1. Role/eyebrow: `Director de proyectos y desarrollador fullstack`
2. Semantic `h1`: `Sistemas fiables, del producto a la infraestructura.`
3. Supporting proposition: `Diseño y mantengo plataformas IoT, productos web e infraestructuras distribuidas.`
4. Primary CTA: retain `Hablemos` with accessible name `Contactar con Marc` and `href="#contact"`.
5. Navigation: retain `Marc`, `Sobre mí`, `Notas`, `Proyectos`, and `Contacto` with their current targets.

Rationale:

- The greeting is removed from the oversized headline rather than restyled, addressing the user's concern that it adds little value.
- The role line establishes professional identity using only supplied facts.
- The heading states the reliability/product-to-infrastructure positioning without employer, customer, location, date, or metric claims.
- The support line names the factual work areas and is short enough for a readable 32–42ch measure.
- The CTA remains singular and action-oriented.

## Portrait/emoji decision

Remove the portrait from the hero; do not replace it with another image, illustration, emoji, badge, or empty media column.

This is the smallest and clearest solution because the current asset is remote, absolutely positioned, motion-enabled, and visually competes with the heading without adding information that the role/value copy does not already provide. Removal eliminates image failure handling, z-index/overlap behavior, pointer motion, alt-text ambiguity, and viewport-specific positioning. `Magnet.tsx` remains available for any unrelated usage and must not be changed or deleted.

## Scope

### In scope

- Hero markup, copy, imports, layout, responsive classes, nav sizing/wrapping, motion wrappers, and CTA placement.
- One narrow shared CSS correction needed to make exact 320px overflow checks meaningful.
- Local build, diff review, and post-implementation browser/accessibility verification.

### Out of scope

- About, Services, Blog, Projects, footer/contact content, project data, or their visual design.
- Changes to navigation destinations or application section order.
- New routes, dependencies, assets, design systems, or reusable layout abstractions.
- Deployment, DNS, Nginx, TLS, hosts, secrets, servers, `ops/`, push, or production work.
- Rewriting the fallback frontend report or any preserved previous mobile/profile workflow artifact.

## Exact files and components

### Modify

1. `src/components/HeroSection.tsx`
   - Remove the `SyntheticEvent` type import, `Magnet` import, remote `portraitUrl`, `hideBrokenImage`, portrait frame, and `img`.
   - Preserve the Spanish `navigation` array and all existing hrefs.
   - Replace the clipped/absolute composition with the normal-flow hierarchy and responsive behavior below.
   - Reuse `FadeIn` and `ContactButton`; do not add state or a mobile menu.

2. `src/index.css`
   - Replace the fixed `min-width: 320px` on `body, #root` with a non-forcing width contract such as `width: 100%; min-width: 0;`. This is the only shared CSS change: the current 320px floor can make `scrollWidth` exceed `clientWidth` when a vertical scrollbar consumes layout width, while global clipping conceals it.
   - Do not alter `.hero-heading`, `.app-shell`, focus-visible rules, selection styles, project styles, or reduced-motion rules.

### Inspect/verify, but do not modify

- `src/components/ContactButton.tsx`: reuse its current Spanish label, `#contact` target, icon semantics, and shared styling.
- `src/components/FadeIn.tsx`: reuse its reduced-motion-safe reveal behavior.
- `src/components/Magnet.tsx`: no hero import after redesign; no component refactor or deletion.
- `src/components/AnimatedText.tsx`: do not introduce character animation into the hero.
- `src/App.tsx`, `AboutSection.tsx`, `BlogSection.tsx`, and `ProjectsSection.tsx`: verify anchor continuity only.
- `.workflow/frontend_report.md` and the three `previous_mobile_profile_adaptation_*` artifacts: preserve byte-for-byte.

## Implementation tasks

### Task 1 — Protect the dirty-tree baseline

1. From the project root, capture `git status --short --branch` and the pre-edit diff for `HeroSection.tsx` and `index.css`.
2. Note that the existing Hero diff already contains Spanish navigation/copy and mobile adjustments. Preserve those unrelated/current-user decisions where still applicable; do not restore the HEAD version.
3. Confirm the preserved workflow artifacts exist before editing.
4. Do not reset, restore, stash, stage, commit, or touch any unrelated modified/untracked path.

Verification: the branch remains `main`; the same unrelated paths remain dirty; no preserved workflow artifact changes.

### Task 2 — Remove the decorative collision model

1. In `HeroSection.tsx`, delete only the portrait-specific import, URL, error handler, `Magnet`, image frame, and image markup.
2. Remove hero wrappers whose only purpose is clipping or absolute portrait layering, including the heading's `overflow-hidden` wrapper and the section's unnecessary `overflow-hidden` behavior.
3. Keep one `<section aria-labelledby="hero-title">`, one `h1#hero-title`, the nav, and the CTA.
4. Do not create a replacement asset or a desktop-only empty column.

Verification: the hero source has no `portraitUrl`, `SyntheticEvent`, `Magnet`, hero `img`, absolute visual layer, or remote Figma portrait request; all essential content is in normal document flow.

### Task 3 — Build the mobile-first header/nav

1. Use a centered outer container with `min-h-[100svh]`, `w-full`, a desktop max width around 1440px, and side padding approximately 20px at the smallest width, then 32–48px at larger breakpoints.
2. At 320–430px, stack the `Marc` brand row above a four-column nav row. Use a compact font but give every anchor an `inline-flex min-h-11` hit area. Keep labels on one line inside their grid cell; do not allow the final item to fall into an awkward isolated row.
3. At `sm`/tablet and above, return to one horizontal row with the brand at the start and the link list at the end. Keep desktop nav type restrained (roughly 14–16px), rather than the current `lg:text-[1.4rem]`.
4. Preserve `aria-label="Navegación principal"` and the DOM/tab order: Marc, Sobre mí, Notas, Proyectos, Contacto.

Verification: every nav target is unchanged, all link boxes are at least 44 CSS px high, labels are readable at 320px, and no nav item crosses the viewport edge.

### Task 4 — Build the typographic content cluster

1. Place the role, heading, supporting proposition, and CTA in one left-aligned, vertically centered normal-flow block below the nav.
2. Render the exact approved role copy as a quiet eyebrow. A short uppercase/tracked style is acceptable here, but it must wrap normally and must not use `whitespace-nowrap`.
3. Render the exact approved heading in `h1#hero-title` using `.hero-heading`, sentence case, natural wrapping, and a bounded scale around `clamp(2.5rem, 8vw, 5.5rem)`. Use tight but readable leading around 0.95–1.0 and a maximum measure that yields about four lines at 320px and no more than two lines at 1440px.
4. Render the exact support copy in sentence case, with normal tracking, `leading-relaxed`, and `max-w-[42ch]`; target approximately 16px on phones and 18–20px on tablet/desktop.
5. Put the existing `ContactButton` immediately after the proposition with a 24–32px top gap. Do not return it to a detached bottom-right corner.
6. Keep subtle `FadeIn` wrappers with short staggered delays and modest vertical offsets. Meaning, geometry, and visibility must not depend on those animations.

Verification: no hero text uses `whitespace-nowrap`; no text parent clips overflow; the CTA follows the copy in reading order; heading, proposition, and CTA never overlap.

### Task 5 — Correct the 320px width floor without broad restyling

1. In `src/index.css`, remove the fixed 320px minimum from `body, #root` and replace it with `width: 100%; min-width: 0;` while retaining existing min-height/background declarations.
2. Leave the existing global overflow guards in place for unrelated legacy sections, but verify the hero's own descendants are within bounds. Passing solely because `body { overflow-x: hidden; }` or `.app-shell { overflow-x: clip; }` is not acceptable.
3. Perform a narrow full-page regression check after this shared rule changes; fix only a direct regression caused by the width-floor change and do not redesign another section.

Verification: at the 320px audit viewport, `document.documentElement.scrollWidth <= document.documentElement.clientWidth`, and no hero descendant has `left < 0` or `right > clientWidth` (allowing only sub-pixel rounding tolerance).

### Task 6 — Validate semantics, interaction, and motion

1. Confirm there is exactly one hero `h1`, its complete text is visible, and `aria-labelledby="hero-title"` resolves.
2. Confirm all five anchor targets exist and navigation/CTA scrolling behavior remains unchanged.
3. Keyboard through the brand, four nav links, and CTA. Each must show the existing 3px focus-visible outline without clipping.
4. Verify the CTA and nav controls have at least 44px touch height.
5. Emulate `prefers-reduced-motion: reduce`; all copy must render immediately and the layout/bounds must match the normal-motion version. Hover motion may be suppressed by the existing global reduced-motion rule; no new motion behavior is needed.
6. Since the portrait is removed, no image alt decision remains in the hero. Do not add an empty or hidden image solely to preserve the old composition.

Verification: keyboard order is logical, focus is visible, reduced-motion content is complete, and no essential text is `aria-hidden`.

## Responsive acceptance matrix

| Viewport | Required hero behavior |
| --- | --- |
| `320×568` | Brand on its own compact row; all four nav links in one four-column row with 44px touch height. Role may wrap to two lines. Heading naturally wraps to roughly four lines, remains fully visible, and has no clipped glyphs. Proposition and CTA remain in normal flow and visible within the first hero viewport. Side padding is at least 20px; no portrait, overlap, or horizontal overflow. |
| `360×800` | Same stacked mobile nav and single-column content. Heading/value copy gain breathing room but do not jump to desktop scale. CTA remains directly below the proposition and no large dead zone separates them. |
| `390×844` | Same hierarchy; natural wrapping may reduce the heading to three or four lines. Text measure remains bounded, controls stay touch-sized, and all hero content remains comfortably inside the viewport. |
| `430×932` | Same mobile-first composition with wider side space. No premature decorative/two-column layout and no isolated navigation item. |
| `768×1024` | Nav becomes a single horizontal row. Content remains one purposeful editorial column, vertically balanced under the nav. Heading is approximately two or three lines; proposition stays at or below 42ch; CTA remains attached to the content cluster. |
| `1440×900` | Container and heading size stop growing. Nav is a restrained single row. Heading is no more than two deliberate lines, the proposition is approximately two readable lines, and the CTA sits below it—not in a remote corner. Generous whitespace is allowed, but no element depends on absolute positioning. |

Across every viewport:

- The entire heading string and proposition are visible and selectable.
- `scrollWidth <= clientWidth`; no hero descendant exceeds its container.
- No important elements overlap; no image or remote portrait request exists.
- `#hero-title`, `#about`, `#blog`, `#projects`, and `#contact` all resolve.
- Normal and reduced-motion modes have the same content and layout bounds.

## Acceptance criteria

- The hero communicates a factual professional role, a concise value proposition, and one obvious contact action in Spanish.
- The old greeting treatment, narrow uppercase paragraph, remote portrait, `Magnet` hero usage, absolute portrait positioning, nowrap heading, and clipping wrapper are gone.
- The first viewport is polished and complete at all six required sizes, including the constrained `320×568` case.
- Heading scale is bounded; desktop does not reproduce the oversized clipped template look.
- Nav and CTA are keyboard accessible, visibly focused, touch-sized, and preserve current anchors.
- Reduced-motion users receive complete immediately readable text.
- Only `HeroSection.tsx` and the narrowly justified width rule in `index.css` change in product source.
- Build, scoped diff check, and fresh browser verification pass. No push or deployment occurs.

## Suggested tests and checks

Run from `/home/agent/projects/marc-portfolio`.

### Before editing

```bash
git status --short --branch
git diff -- src/components/HeroSection.tsx src/index.css src/components/ContactButton.tsx
sha256sum \
  .workflow/previous_mobile_profile_adaptation_plan.md \
  .workflow/previous_mobile_profile_adaptation_planner_task.md \
  .workflow/previous_mobile_profile_adaptation_frontend_report.md
```

Expected:

- Branch is `main` and the known dirty tree remains visible.
- The Hero/ContactButton diff shows prior Spanish/profile adaptation that must be preserved.
- Preserved artifact hashes remain:
  - `789cafbb899fc3e520f96ccf3f13a26598bcc69affd40aa08f5d4b068fbe0e58`
  - `7ba92cca836a50f3eaa5e92e553d65cbea89e5d35c8a50ca3c6ef52400bf935f`
  - `4d818ef6b748eb55ef39e9abbb1df82b746de1a85dc52aaef95942d3a3854558`

### Static/build checks after implementation

```bash
npm run build
git diff --check -- src/components/HeroSection.tsx src/index.css
git diff -- src/components/HeroSection.tsx src/index.css
git status --short --branch
```

Expected:

- TypeScript and Vite exit 0 and emit the production bundle.
- Scoped `git diff --check` prints nothing.
- Product-source changes are limited to the approved hero and width-floor edits; existing unrelated dirty files are neither removed nor rewritten.

There is no automated test script in `package.json`, so build plus browser/accessibility checks are the relevant gates.

### Browser verification

Start the local app:

```bash
npm run dev -- --host 127.0.0.1
```

Expected: Vite serves the current working tree at the printed local URL, normally `http://127.0.0.1:5173/`.

Use a real browser/agent-browser/Playwright-capable frontend environment to capture the six viewport sizes. If reusing `.workflow/hero_consultation_artifacts/run-browser-audit.sh`, copy it and its measurement helper to a new post-implementation verification directory or change its output prefix so the current fallback artifacts are not mistaken for new evidence; update the support-copy selector because the new hero has both a role line and proposition. Then run the copied script against the Vite URL.

For each viewport, inspect screenshots and evaluate in-page:

```js
({
  clientWidth: document.documentElement.clientWidth,
  scrollWidth: document.documentElement.scrollWidth,
  targets: ['hero-title', 'about', 'blog', 'projects', 'contact'].map((id) => [id, Boolean(document.getElementById(id))]),
  heroText: document.querySelector('#hero-title')?.textContent?.trim(),
  portraitCount: document.querySelector('section[aria-labelledby="hero-title"]')?.querySelectorAll('img').length,
})
```

Expected:

- `scrollWidth <= clientWidth`.
- Every target is `true`.
- `heroText` equals `Sistemas fiables, del producto a la infraestructura.`.
- `portraitCount` is `0`.
- Bounding-box inspection shows role, heading, proposition, CTA, and nav within the viewport and mutually non-overlapping.
- The browser console has no new exceptions and the network log has no request to the removed Figma portrait URL.

At `320×568`, additionally Tab through six links (brand, four nav links, CTA), capture the focused CTA, and emulate reduced motion. Expected: visible focus outline, 44px-or-larger control heights, complete copy, unchanged geometry, and no entrance animation dependency.

If no supported browser runtime is available, record that as a blocker and do not claim visual acceptance. Build/source checks are partial evidence only; approval to finish implementation must wait for a real viewport audit.

## Risks and mitigations

- **320×568 vertical pressure:** the role and heading can wrap. Keep mobile spacing compact, use the stated 2.5rem heading floor, and reduce hero-only gaps before reducing readable text size. Never clip content; if unavoidable, allow normal vertical growth and treat failure to keep the CTA in the first test viewport as an acceptance failure requiring review.
- **Webfont-dependent wrapping:** verify after Kanit loads, not only with fallback fonts. Bounded `clamp()` sizing and natural wrapping reduce layout-shift risk.
- **Shared CSS width-floor change:** it affects the full root, so perform a narrow full-page regression at 320px. Do not use this as permission to restyle other sections.
- **Shared CTA:** `ContactButton` also appears in About. Reuse it unchanged to prevent an unintended cross-section visual change.
- **Dirty-tree attribution:** HEAD-based diffs contain prior work. Compare the pre-edit and post-edit scoped diffs; never restore files to isolate this iteration.
- **Frontend consultation limitation:** the fallback report is not browser acceptance. Preserve its disclosure and produce distinct post-implementation evidence.

## Git and deployment notes

- This iteration is local-only.
- `allow_commit: true` does not authorize an automatic commit in this planning task. Do not stage or commit unless the approved implementation workflow separately requests it.
- `allow_push: false`; do not push. Approval is required before any future push.
- `auto_deploy_on_push: false`; do not deploy or modify deployment/infrastructure artifacts.
- Preserve all unrelated source/workflow changes and these artifacts in particular:
  - `.workflow/previous_mobile_profile_adaptation_plan.md`
  - `.workflow/previous_mobile_profile_adaptation_planner_task.md`
  - `.workflow/previous_mobile_profile_adaptation_frontend_report.md`
  - `.workflow/frontend_report.md` including its timeout/fallback disclosure.

## Blocking questions

None for planning. The exact copy, portrait removal, and one-column direction are explicit approval decisions in this plan. If the user rejects any of those during approval, revise the plan before implementation rather than improvising in source.