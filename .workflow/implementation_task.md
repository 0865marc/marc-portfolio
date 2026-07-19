# Coder implementation task — Marc Fullstack Developer portfolio

## Active project

- Project name: `marc-portfolio`
- Project path: `/home/agent/projects/marc-portfolio`
- Environment: `local`
- Default branch: `main`
- Current state: project directory exists but is not a Git repository yet; it contains only `.workflow/` artifacts.

## Approved source of scope

Implement **only** the approved plan:

`/home/agent/projects/marc-portfolio/.workflow/plan.md`

Supporting, non-authoritative context:

`/home/agent/projects/marc-portfolio/.workflow/frontend_report.md`

Source specification:

`/home/agent/projects/marc-portfolio/.workflow/source_template.md`

## User approval

The user approved implementation by replying “Adelante” to the plan approval message.

## Required implementation

Create a real working React + TypeScript + Vite + Tailwind CSS portfolio landing page for **Marc — Fullstack Developer**.

Follow the approved plan exactly:

- Build the Vite app in `/home/agent/projects/marc-portfolio`.
- Use React, TypeScript, Tailwind CSS, Framer Motion, Lucide React, Kanit font.
- Replace all identity/copy references to `3D Creator` with `Fullstack Developer` where visible/professional positioning is concerned.
- Replace the original `Price` section with `Blog`.
- Navbar must be `About`, `Blog`, `Projects`, `Contact` with working anchors.
- Section order must be Hero → Marquee → About → Services → Blog → Projects/contact footer.
- Use the 21 GIF URLs from `.workflow/source_template.md`, split 11/10 and tripled for the marquee.
- Use fullstack-focused services, blog cards, and project names from the adapted source spec/plan.
- Add reduced-motion/accessibility/performance safeguards from the plan and frontend report.
- Add a compact contact/footer block with `id="contact"` because no contact section was otherwise specified.

## Safety and policy

Policy from `/home/agent/projects/projects.yaml`:

- `allow_commit: true`
- `allow_push: false`
- `require_approval_before_push: true`
- `auto_deploy_on_push: false`

Rules:

- Work only inside `/home/agent/projects/marc-portfolio`.
- Do not push.
- Do not deploy.
- Do not touch production secrets.
- If you initialize Git, use branch `main`.
- Commit is allowed after successful verification if you can safely review the changed files.
- Do not modify the workflow plan scope except writing `.workflow/implementation_report.md`.

## Required verification

Run real checks and record exact outcomes:

1. `npm install`
2. `npm run build`
3. `git diff --check` if Git is initialized
4. Start local server if feasible and perform browser smoke checks:
   - initial page loads
   - no console errors
   - desktop viewport
   - mobile/narrow viewport around 390×844 or 375×667
   - no horizontal overflow
   - nav anchors work

If browser smoke cannot be completed, say exactly why in the report and still complete automated checks.

## Required report

Write a concise implementation report to exactly:

`/home/agent/projects/marc-portfolio/.workflow/implementation_report.md`

Include:

- Files created/changed
- What was implemented
- Dependency versions installed or any substitutions
- Verification commands and real outcomes
- Browser smoke results or blocker
- Git status and commit hash if committed
- Known limitations/follow-up content needed
