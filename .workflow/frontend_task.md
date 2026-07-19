# Frontend planning/design consultation — Marc Fullstack Developer portfolio

## Active project

- Name: `marc-portfolio`
- Path: `/home/agent/projects/marc-portfolio`
- Environment: local
- Default branch: `main`
- Current state: new directory, not yet a Git repository, with only workflow/specification artifacts
- `AGENTS.md`: not currently present; check again and read it if present when you start
- Local/dev URL: none yet because the React/Vite app has not been scaffolded
- Deployed URL: none

## Original user request (English)

The user supplied a detailed React/TypeScript/Tailwind/Framer Motion portfolio template originally describing a 3D creator, asked to replace its Price section with a Blog section for Marc, and then clarified: change the identity from `3D Creator` to `Fullstack Developer` and implement it as a new React/Vite project.

The complete adapted source specification is:

`/home/agent/projects/marc-portfolio/.workflow/source_template.md`

Treat that project-local specification as the source of truth. Read it in full before reporting.

## Required product/technical direction

- Plan a new React + TypeScript + Vite + Tailwind CSS landing page.
- Use Framer Motion and Lucide React; use Kanit from Google Fonts.
- Preserve the premium, high-motion, dark visual language.
- Page order: Hero, Marquee, About, Services, Blog, Projects.
- Navbar: About / Blog / Projects / Contact.
- Replace Price completely with an editorial Blog section; no pricing table.
- Identity/copy references must say Fullstack Developer, not 3D Creator.
- Decorative 3D imagery may remain when it is purely visual, unless a more developer-aligned treatment is clearly better without expanding scope.
- External image/GIF URLs may remain remote, but reliability and graceful fallback should be considered.
- Missing real portfolio URLs, contact details, social links, blog URLs, and portrait may use honest placeholders and must be called out as follow-up content.

## Git/deployment policy

Policy from `/home/agent/projects/projects.yaml`:

- `auto_deploy_on_push: false`
- `allow_commit: true`
- `allow_push: false`
- `require_approval_before_push: true`
- No deployment target is configured.
- Do not commit, push, or deploy during this consultation.
- Do not touch projects outside `/home/agent/projects/marc-portfolio` (reading the central policy is already complete).

## Consultation scope

Run in planning/design consultation mode only. Inspect and evaluate the specification and the empty project context. Use relevant frontend, browser, accessibility, responsive-design, or design skills when useful. You may inspect/test and may create workflow-only audit artifacts or prototypes under `/home/agent/projects/marc-portfolio/.workflow/` if they improve the report, but do not scaffold the app and do not make unapproved final implementation changes.

Audit these flows/screens and concerns:

1. Hero/navbar hierarchy, portrait overlap, contact CTA, and first-viewport behavior.
2. Anchor navigation and the absence of a separately specified Contact section.
3. Scroll-driven marquee behavior and remote GIF performance.
4. About layout with decorative images and character-by-character animated text.
5. Services-to-Blog light-section continuity and editorial Blog card usability.
6. Sticky project-card behavior, card content density, and mobile alternatives.
7. Responsive behavior from small mobile through ultrawide.
8. Keyboard operation, semantic HTML, focus treatment, contrast, link semantics, alt text, and reduced-motion support.
9. Animation performance and safe degradation on touch/coarse-pointer devices.
10. A simple component/file architecture and practical browser-verification matrix.

Because no app exists yet, a real browser audit may be impossible. If so, provide code/spec-only findings and clearly state that limitation rather than implying a live audit occurred.

## Required report

Write the final consultation report in English to exactly:

`/home/agent/projects/marc-portfolio/.workflow/frontend_report.md`

Include:

- Consultation method and limitations
- Recommended information architecture and interaction behavior
- Responsive/mobile recommendations
- Accessibility and reduced-motion requirements
- Motion/performance recommendations
- Suggested component/data organization
- Priority-ranked findings (must-have vs optional)
- Concrete acceptance checks for the implementation
- Any conflicts or ambiguities in the source specification that the planner must resolve

Keep recommendations surgical and traceable to the requested landing page. Avoid speculative features, CMS/backend work, additional routes, or unrelated redesigns.