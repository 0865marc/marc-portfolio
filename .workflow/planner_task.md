# Planner task — Marc Fullstack Developer portfolio

## Active project context

- Active project name: `marc-portfolio`
- Active project path: `/home/agent/projects/marc-portfolio`
- Environment: `local`
- Default branch: `main`
- Git/deployment policy from `/home/agent/projects/projects.yaml`:
  - `auto_deploy_on_push: false`
  - `allow_commit: true`
  - `allow_push: false`
  - `require_approval_before_push: true`
- Current git status / branch check:
  - The project path has been created, but it is not a git repository yet.
  - Branch check is not available yet. Plan should include `git init` on `main` during implementation if appropriate.
  - Existing files: `.workflow/source_template.md` and this `.workflow/planner_task.md`.
- `AGENTS.md`: not present in this new project yet.

## Original user request translated to English

The user provided a detailed React/TypeScript/Tailwind/Framer Motion landing page template originally for a 3D creator portfolio, asked to replace the `Price` section with a `Blog` section for Marc, then clarified: **change `3D Creator` to `Fullstack developer` and implement it**.

The user clarified that implementation should be in a **new React/Vite project**, not inside the previously active `ainki-staging` project.

## Prepared source specification

A full adapted specification has been written to:

`/home/agent/projects/marc-portfolio/.workflow/source_template.md`

It is based on the user's template and already includes:

- `Marc` instead of `Jack`
- `Fullstack Developer` instead of `3D Creator`
- Navbar `About / Blog / Projects / Contact`
- `BlogSection` instead of the original `Price` section
- Fullstack-focused hero subtitle, About copy, Services data, Blog entries, and project names
- Original dark visual language, Kanit font, marquee GIFs, decorative imagery, Framer Motion behavior, sticky project cards, Magnet, FadeIn, AnimatedText, ContactButton, and LiveProjectButton requirements

The previous generated standalone prompt also exists at `/home/agent/marc-fullstack-developer-blog-template.md`, but the project-local `.workflow/source_template.md` should be treated as the relevant source.

## Clarified requirements gathered by default

- Create a new React + TypeScript + Vite + Tailwind CSS application under `/home/agent/projects/marc-portfolio`.
- Implement the landing page described in `.workflow/source_template.md`.
- Use React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, and Kanit from Google Fonts.
- Keep the original high-motion, premium dark portfolio style.
- Replace all role references that are identity/copy-related from `3D Creator`/`3d creator` to `Fullstack Developer`/`fullstack developer`.
- Keep decorative 3D asset references if they are purely visual/design elements, unless frontend recommends a better developer-aligned approach.
- Replace `Price` with `Blog`; do not include a pricing table.
- Build a real working app, not just a markdown prompt, during coder implementation after user approval.

## Explicit assumptions for low-risk missing details

- Project name/path: `marc-portfolio` at `/home/agent/projects/marc-portfolio`.
- Visible copy remains primarily English to preserve the supplied template's language and style.
- No domain, deployment, push, or production setup is requested in this task.
- External GIF/image URLs may be used directly as in the supplied template; no asset downloading is required unless frontend/coder identifies a reliability blocker.
- Contact, Blog, and Live Project links can be safe placeholders (`#contact`, `#blog`, `#projects`) unless the implementation has a better internal anchor target.
- If exact remote asset loading fails during verification, use graceful visual fallbacks but preserve URL references in the source.

## Open questions or blockers

- No final real portfolio project links, contact URL/email, GitHub URL, LinkedIn URL, or real blog URLs were provided. Plan should use placeholders and clearly list this as follow-up content.
- No real portrait/Marc image was provided. The supplied template portrait URL may remain as a placeholder.
- No deployment target was provided; implementation should stop at local build/browser verification and optional local git commit if checks pass.

## Relevant constraints

- This is development work and must follow the controlled workflow: planner → frontend specialist consultation → user approval → coder.
- Planner must not edit implementation files.
- Planner must consult the actual `frontend` profile because this task is frontend-heavy and affects UI/UX, mobile layout, visual design, motion, accessibility, navigation, and product flow.
- Frontend should run in planning/design consultation mode, inspect `.workflow/source_template.md`, use relevant design/frontend/browser skills when useful, and write `.workflow/frontend_report.md`.
- Planner must integrate the frontend report into `.workflow/plan.md`; `.workflow/plan.md` will be the approved implementation scope for coder.
- Coder should implement only after user approval.
- Safety: do not push. Do not deploy. Do not touch any project outside `/home/agent/projects/marc-portfolio` during implementation, except reading the project registry/policies if needed.

## Required output

Write the final implementation plan to:

`/home/agent/projects/marc-portfolio/.workflow/plan.md`

The plan must include:

- Goal
- Current understanding
- Frontend/UI-UX input summary from `.workflow/frontend_report.md`
- Proposed file structure
- Implementation steps
- Dependencies/setup commands
- Risks/assumptions/follow-up content needed
- Acceptance criteria
- Verification commands/checks
- Git/deployment notes
