# Planner task — hero section professional redesign

## Role and workflow

You are the `planner` profile. Create an actionable implementation plan only; do not edit implementation source files. The orchestrator will request user approval after reading the plan and any frontend specialist report. Write the final plan to `.workflow/plan.md`.

This is a new controlled workflow iteration. Before replacing shared workflow artifacts, note that the previous mobile/profile adaptation plan and reports were preserved as:
- `.workflow/previous_mobile_profile_adaptation_plan.md`
- `.workflow/previous_mobile_profile_adaptation_planner_task.md`
- `.workflow/previous_mobile_profile_adaptation_frontend_report.md`
Do not delete or rewrite those preserved artifacts.

## Active project and policy

- Project: `marc-portfolio`
- Active project path: `/home/agent/projects/marc-portfolio`
- Environment: `local`
- Current branch: `main`; default branch: `main` (branch check passed)
- Git status at intake: existing modified source files and workflow/deployment artifacts are present from prior work. In particular, `src/components/HeroSection.tsx` is already modified. Preserve unrelated existing changes; do not reset, stash, stage, commit, push, or deploy.
- Policy: `allow_commit: true`, `allow_push: false`, `require_approval_before_push: true`, `auto_deploy_on_push: false`
- This iteration is local-only. No deployment, DNS, Nginx, TLS, host, secrets, or server changes.

Read `AGENTS.md` if present before planning. Treat current working-tree changes as user work and do not undo them.

## Original user request (translated to English)

The first section with the text “Hola soy Marc”, the emoji, and the supporting text does not convince the user. It does not look good on mobile or desktop and probably does not add much value. The supporting sentence — “Diseño y mantengo productos IoT, plataformas web e infraestructuras distribuidas orientadas a la fiabilidad, la escalabilidad y una buena experiencia de usuario.” — looks badly cut on desktop. The main “Hola…” text is not displayed in full, and the emoji is very small and occupies an awkward area. Re-think this first section so it looks more professional and clean.

## Clarified requirements and scope

- Redesign only the first viewport/hero section and its directly related styling/content.
- Make the hero genuinely mobile-first and polished at narrow phone widths as well as tablet and desktop widths.
- Remove the current visual awkwardness rather than merely shrinking it: the oversized clipped `Hola, soy Marc` treatment, the long narrow support paragraph, and the small decorative/emoji-like portrait layer must be reconsidered as one composition.
- Prefer a simpler, more intentional hierarchy: a clear professional identity, a concise value proposition, and one obvious contact/next-step action. The visual should not depend on an ornamental image to communicate the identity.
- Keep the existing dark visual identity and motion language where they remain useful, but avoid decorative layers that collide with or compete against copy. If the existing portrait/emoji is retained, it must have a deliberate role, readable scale, explicit bounds, and must never overlap text or CTA; otherwise remove it from the hero.
- Keep existing section anchors and page navigation behavior intact (`#hero-title`, `#about`, `#blog`, `#projects`, `#contact`) unless the plan explains a compatibility-preserving alternative.
- Keep visible hero copy in Spanish and factual. Do not invent employer names, customers, countries, dates, metrics, or a real contact address.
- Do not broaden scope into the About, Services, Blog, Projects, deployment, or infrastructure sections except where a shared CSS rule is strictly required by the hero redesign.
- Preserve unrelated modifications already present in the working tree, especially the previous Spanish/profile adaptation work outside the hero.

## Current source evidence to inspect

- `src/components/HeroSection.tsx` currently renders:
  - a nav;
  - a large `h1` with `whitespace-nowrap`, responsive `vw` sizing, and gradient text reading `Hola, soy Marc`;
  - an absolutely positioned remote portrait image inside a `Magnet` wrapper;
  - a long uppercase support paragraph in a narrow `max-w` block;
  - a contact CTA.
- `src/index.css` contains `.hero-heading`, global overflow guards, focus styles, and reduced-motion rules.
- `src/components/Magnet.tsx`, `src/components/FadeIn.tsx`, `src/components/AnimatedText.tsx`, and `src/components/ContactButton.tsx` may affect the hero behavior and should be inspected before proposing changes.
- Existing source changes are not all part of this request. Use `git diff`/`git diff -- src/components/HeroSection.tsx src/index.css ...` to distinguish prior work from this iteration; do not revert it.
- The prior implementation report states that browser smoke was previously blocked by missing Chrome/Chromium. The frontend specialist must try real browser/visual verification if available and report any limitation honestly.

## Design/implementation questions the plan must resolve

1. What is the new hero information hierarchy and exact Spanish copy? Keep the lead short enough to remain fully visible at 320–430px and avoid a dense uppercase paragraph on desktop. A concise role line may use the supplied profile direction such as “Director de proyectos y desarrollador fullstack”, but do not add unsupported claims.
2. Whether the portrait/emoji should be removed entirely, moved into a deliberate secondary visual treatment, or replaced by a more useful visual element. Justify the choice with source/visual evidence and keep the implementation simple.
3. How the layout should behave at approximately 320×568, 360×800, 390×844, 430×932, 768×1024, and 1440×900, including nav, heading, value proposition, CTA, and any visual asset.
4. How to preserve accessibility: semantic heading, readable full text without relying on animation, meaningful/empty alt semantics, focus styles, reduced-motion behavior, and touch-sized controls.
5. What exact files/classes/components need changing, and what must remain untouched.

## Required frontend specialist consultation

Because this request materially affects UI/UX, responsive layout, visual hierarchy, typography, accessibility, and frontend implementation, consult the `frontend` profile in planning/design consultation mode before finalizing the plan.

Instruct the frontend specialist to:
- work in English internally;
- inspect the real repository and current git state;
- read `AGENTS.md` if present;
- inspect the hero source and relevant shared components/styles;
- use a real browser or visual checks if available, including mobile and desktop viewport evidence; do not claim browser verification if Chrome/Chromium is unavailable;
- evaluate the first viewport specifically for clipping, awkward image scale/placement, text measure, hierarchy, responsive wrapping, overflow, accessibility, keyboard focus, and reduced motion;
- propose one recommended direction (with a brief alternative only if useful);
- write `.workflow/frontend_report.md` as a supporting consultation report, without editing implementation files.

The final `.workflow/plan.md` must integrate the frontend report while keeping the approved plan as the sole implementation scope.

## Required plan output

Write `.workflow/plan.md` with:
- a concise goal and architecture/design direction;
- explicit in-scope and out-of-scope boundaries;
- exact files and components to modify;
- bite-sized implementation tasks with concrete layout/copy/accessibility details;
- responsive acceptance criteria for the viewport matrix above;
- build, diff, and browser verification commands with expected outcomes;
- explicit handling of the existing dirty working tree and no push/deploy boundary;
- any unresolved question that genuinely blocks implementation.

The dedicated frontend consultation was attempted as part of this workflow but timed out. A clearly labeled fallback report now exists at `.workflow/frontend_report.md`; it distinguishes source findings from unverified browser evidence. Read and integrate that report rather than launching another nested frontend profile run. Do not erase its timeout/fallback disclosure.

Do not implement source changes and do not claim the hero is fixed. The deliverable of this task is only the plan plus the frontend consultation artifact.
