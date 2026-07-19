# Coder follow-up task — fix verified contact/footer overlap

## Active project

- Project: `marc-portfolio`
- Path: `/home/agent/projects/marc-portfolio`
- Branch: `main`
- Scope source: approved `.workflow/plan.md` plus verified browser smoke issue found by orchestrator after your implementation.

## Verified issue

The app builds and loads, but browser visual smoke after clicking the `Contact` nav revealed that the contact/footer block is visually overlapped by the sticky project cards. At `#contact`, the text `Have a product in mind?` and `Let's build something useful.` sits under/behind the stacked sticky project cards.

Relevant file:

`src/components/ProjectsSection.tsx`

The likely cause is the footer living directly after sticky project card wrappers while sticky project cards still overlap in the Projects section.

## Required fix

Fix only the contact/footer overlap while preserving the approved design.

Suggested acceptable approaches:

- Make the contact/footer a clearly separated, higher-layer block after the sticky cards with enough spacing and `relative z-*`/background so it cannot be hidden by sticky project cards; and/or
- Adjust the project-card wrapper/list spacing so sticky cards finish before the footer; and/or
- Create a dedicated contact section/footer after the sticky cards that remains part of the Projects/contact footer scope.

Requirements:

- Do not remove sticky project cards on desktop.
- Do not alter the core section order or visible copy except if needed for layout.
- Keep `id="contact"` on the visible contact/footer block.
- Keep nav anchors working.
- Keep mobile-safe behavior.
- Work only inside `/home/agent/projects/marc-portfolio`.
- Do not push/deploy.

## Verification

Run:

- `npm run build`
- `git diff --check`
- If local server is running or can be started, verify `#contact` is reachable and not hidden behind sticky project cards. If browser is unavailable in coder profile, say so; default/orchestrator will perform browser smoke.

## Reporting and git

- Update `.workflow/implementation_report.md` with this follow-up fix and verification.
- Commit the fix and report update if checks pass; policy allows commit and push is forbidden.
