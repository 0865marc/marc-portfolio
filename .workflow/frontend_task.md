# Frontend consultation task — professional hero redesign

## Mode and deliverable

Work in English internally. Operate only in planning/design consultation mode: inspect the repository, current UI, and current git state; test and use browser/design/frontend skills where useful; create supporting artifacts or non-production prototypes only under `.workflow/` when useful; do not make final implementation changes and do not edit source files. Write the final consultation report to:

`/home/agent/projects/marc-portfolio/.workflow/frontend_report.md`

The report must state exactly what was inspected and tested, distinguish source-only reasoning from real browser evidence, and recommend one implementation direction. A brief alternative is optional only if it clarifies a real tradeoff.

## Project context

- Active project: `marc-portfolio`
- Active project path: `/home/agent/projects/marc-portfolio`
- Environment: local
- Current branch: `main`
- Default branch: `main`
- Local development URL when Vite is running: normally `http://127.0.0.1:5173/` or the URL printed by `npm run dev`
- Stack: React 18, TypeScript, Vite 5, Tailwind CSS 3, Framer Motion, Lucide React
- Build command: `npm run build`
- Development command: `npm run dev -- --host 127.0.0.1`

Read `AGENTS.md` if present before inspecting anything. None was found by the planner, but verify rather than assuming.

## Git and deployment policy

The working tree is already dirty with user work from prior iterations. `src/components/HeroSection.tsx` and other source/workflow files are modified. Treat every existing change as user work. Do not reset, restore, stash, stage, commit, push, deploy, or edit implementation files. Do not touch deployment, DNS, Nginx, TLS, hosts, secrets, servers, or `ops/`.

Policy metadata:

- `allow_commit: true`
- `allow_push: false`
- `require_approval_before_push: true`
- `auto_deploy_on_push: false`
- This consultation and the planned iteration are local-only.

The following previous-work artifacts are preserved and must not be deleted or rewritten:

- `.workflow/previous_mobile_profile_adaptation_plan.md`
- `.workflow/previous_mobile_profile_adaptation_planner_task.md`
- `.workflow/previous_mobile_profile_adaptation_frontend_report.md`

You may replace only `.workflow/frontend_report.md` with this iteration's report and may place new supporting audit artifacts under a clearly named `.workflow/` subdirectory if necessary.

## Original user request (English translation)

The first section with the text “Hola soy Marc”, the emoji, and the supporting text does not convince the user. It does not look good on mobile or desktop and probably does not add much value. The supporting sentence — “Diseño y mantengo productos IoT, plataformas web e infraestructuras distribuidas orientadas a la fiabilidad, la escalabilidad y una buena experiencia de usuario.” — looks badly cut on desktop. The main “Hola…” text is not displayed in full, and the emoji is very small and occupies an awkward area. Re-think this first section so it looks more professional and clean.

## Clarified scope and constraints

- Redesign only the first viewport/hero and directly related styling/content.
- Make the hero genuinely mobile-first and polished at narrow phone, tablet, and desktop widths.
- Reconsider the clipped oversized heading, long narrow uppercase support paragraph, and small decorative portrait/emoji as one composition rather than merely shrinking them.
- Prefer a simple hierarchy: clear professional identity, concise value proposition, and one obvious contact/next-step action.
- The identity must not depend on an ornamental image. If the existing portrait/emoji remains, it needs a deliberate role, readable scale, explicit bounds, and zero overlap with copy or CTA; otherwise recommend removing it.
- Preserve the dark visual identity and useful motion language, but prevent decoration from colliding or competing with copy.
- Preserve anchors and navigation behavior: `#hero-title`, `#about`, `#blog`, `#projects`, and `#contact`, unless proposing a compatibility-preserving alternative.
- Visible hero copy must remain Spanish and factual. Do not invent employer/customer names, countries, dates, metrics, or a real contact address.
- Do not broaden scope to About, Services, Blog, Projects, deployment, or infrastructure. A shared CSS adjustment is allowed only if strictly required for the hero.
- Preserve unrelated current modifications, especially previous Spanish/profile adaptation outside the hero.

## Source evidence and areas to inspect

Inspect the real current files and relevant diffs rather than relying only on this summary:

- `src/components/HeroSection.tsx`: nav; `h1` with `whitespace-nowrap` and viewport-based sizing; absolute remote portrait inside `Magnet`; long uppercase narrow support paragraph; contact CTA.
- `src/index.css`: `.hero-heading`, global overflow guards, focus styles, reduced-motion rules.
- `src/components/Magnet.tsx`: pointer/reduced-motion behavior for the portrait.
- `src/components/FadeIn.tsx`: reveal behavior and reduced-motion fallback.
- `src/components/AnimatedText.tsx`: inspect for relevance, but do not assume it is used by the hero.
- `src/components/ContactButton.tsx`: CTA size, labels, hover/focus/motion behavior.
- `src/App.tsx` and section IDs only as needed to confirm anchor compatibility.
- `package.json`, Tailwind config, and existing tests/tooling as needed.
- Use `git status`, `git diff`, and narrowly scoped diffs to identify prior modifications. Do not undo them.

The previous implementation report said browser smoke was blocked by missing Chrome/Chromium. Try a real browser/visual audit in this environment if a supported browser is now available. If Chrome/Chromium or browser tooling is unavailable, do not claim visual verification: report the limitation and provide source-based findings only.

## Questions the report must resolve

1. Recommend the exact new information hierarchy and exact Spanish hero copy. The lead must remain fully readable at 320–430px. A factual role line may use “Director de proyectos y desarrollador fullstack”. Keep the value proposition concise and avoid a dense all-uppercase paragraph.
2. Decide whether to remove the portrait/emoji, retain it as a bounded secondary visual, or replace it with a more useful lightweight visual. Justify the recommendation using source and, where available, visual evidence. Prefer the simplest solution.
3. Define layout behavior at approximately 320×568, 360×800, 390×844, 430×932, 768×1024, and 1440×900 for nav, heading/identity, value proposition, CTA, and any retained visual.
4. Cover accessibility: semantic heading; full readable text without depending on animation; alt/empty-alt semantics; visible keyboard focus; touch-sized controls; reduced-motion behavior; no horizontal overflow concealed by global clipping.
5. Name exact files/classes/components likely to change and explicitly identify what should remain untouched.

## Audit priorities

Evaluate the first viewport specifically for:

- clipping and horizontal overflow;
- awkward portrait/emoji scale and placement;
- copy hierarchy, text measure, line breaks, and readable casing;
- responsive wrapping and vertical fit, especially at 320×568;
- nav density, keyboard focus, and touch targets;
- CTA prominence and collision safety;
- remote-image failure behavior if the image is retained;
- reduced-motion behavior and content visibility;
- browser console/network errors when browser testing is possible.

For browser evidence, include the tested viewport dimensions, describe screenshots or measured bounding-box/overflow results, and state the browser/tool used. Do not alter implementation source to make the audit pass.

## Required report structure

Write `.workflow/frontend_report.md` with:

- Consultation scope and evidence
- Browser/visual verification status and limitations
- Current-state findings, prioritized by severity
- One recommended design direction
- Exact proposed Spanish copy and hierarchy
- Portrait/emoji decision and rationale
- Responsive behavior for the full viewport matrix
- Accessibility, focus, touch, and reduced-motion requirements
- Exact likely file/component scope and explicit non-scope
- Risks, assumptions, and any genuinely blocking question
- Acceptance-oriented handoff notes for the planner
