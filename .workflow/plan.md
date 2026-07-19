# Implementation plan — Marc Fullstack Developer portfolio

## Goal

Create a new working React + TypeScript + Vite + Tailwind CSS portfolio landing page for **Marc** as a **Fullstack Developer**, based on `.workflow/source_template.md`.

The implementation must replace the original 3D Creator positioning with Fullstack Developer positioning and replace the original Price section with a Blog section.

## Current understanding

- The user wants a real implementation, not only a prompt/template.
- The user clarified this should be a **new project**.
- Project path: `/home/agent/projects/marc-portfolio`.
- Current project contents: workflow artifacts only; no app scaffold yet.
- No Git repository exists yet.
- The project-local source spec is `.workflow/source_template.md`.
- Visible copy should remain primarily English to match the supplied template, unless the user later asks for Spanish.
- Missing real contact/project/blog URLs should use safe placeholders and be easy to replace.

## Frontend/UI-UX input

A frontend-specialist consultation report exists at `.workflow/frontend_report.md`.

Key points integrated into this plan:

- Keep the dark cinematic/high-motion style, but make the professional positioning consistently Fullstack Developer.
- Use Blog as an editorial section, not a pricing table.
- Add working anchors for About, Blog, Projects, and Contact.
- Because no standalone Contact section was specified, add a compact `id="contact"` footer/contact block at the end so the nav and ContactButton are not dead links.
- Implement reduced-motion fallbacks for scroll reveals, marquee, sticky cards, and magnetic hover.
- Treat remote GIF/project images as remote assets with lazy loading, dimensions, placeholders, and graceful failure behavior.
- Use a mobile-friendly fallback for sticky project cards if necessary; do not let sticky stacking harm narrow screens.

## Proposed file structure

Create a standard Vite React TypeScript project manually inside the existing non-empty directory:

```text
/home/agent/projects/marc-portfolio/
├── .workflow/
│   ├── source_template.md
│   ├── planner_task.md
│   ├── frontend_task.md
│   ├── frontend_report.md
│   └── plan.md
├── index.html
├── package.json
├── package-lock.json
├── postcss.config.js
├── tailwind.config.js
├── tsconfig.json
├── tsconfig.node.json
├── vite.config.ts
└── src/
    ├── App.tsx
    ├── main.tsx
    ├── index.css
    ├── data/
    │   └── portfolio.ts
    └── components/
        ├── AnimatedText.tsx
        ├── ContactButton.tsx
        ├── FadeIn.tsx
        ├── LiveProjectButton.tsx
        ├── Magnet.tsx
        ├── HeroSection.tsx
        ├── MarqueeSection.tsx
        ├── AboutSection.tsx
        ├── ServicesSection.tsx
        ├── BlogSection.tsx
        └── ProjectsSection.tsx
```

## Dependencies/setup commands

Implementation should create `package.json` with scripts:

```json
{
  "scripts": {
    "dev": "vite --host 0.0.0.0",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 0.0.0.0"
  }
}
```

Install dependencies:

```bash
npm install react@^18.3.1 react-dom@^18.3.1 framer-motion@^12.38.0 lucide-react@^0.344.0
npm install -D @vitejs/plugin-react vite typescript tailwindcss@^3.4.1 postcss autoprefixer
```

If an exact package version is unavailable, use the closest compatible current version and record it in `.workflow/implementation_report.md`.

## Implementation steps

1. Initialize project scaffold manually because the directory is non-empty due to `.workflow/`.
   - Create `package.json`, Vite/TypeScript config, Tailwind config, `index.html`, `src/main.tsx`, `src/App.tsx`, and `src/index.css`.
   - Add Google Fonts Kanit link in `index.html` or `@import` in CSS.
   - Set page title to `Marc -- Fullstack Developer`.

2. Add global styles.
   - Set `#0C0C0C` background on `html`, `body`, `#root`, and the app wrapper.
   - Use Kanit globally.
   - Apply reset: `box-sizing`, margin/padding zero.
   - Add `.hero-heading` gradient text class.
   - Ensure main wrapper uses `overflow-x: clip`.
   - Add accessible focus-visible styles.
   - Add reduced-motion CSS fallbacks.

3. Create data source in `src/data/portfolio.ts`.
   - Export arrays for marquee GIFs, services, blog posts, and project cards.
   - Include the exact 21 GIF URLs from the source spec.
   - Split marquee rows into first 11 and remaining 10 in code.
   - Use fullstack-focused service and blog copy from `.workflow/source_template.md`.
   - Use developer-aligned project names from the adapted spec.

4. Implement reusable components.
   - `FadeIn`: Framer Motion wrapper with specified viewport/easing behavior.
   - `Magnet`: mouse-following magnetic hover, disabled or softened on coarse pointers/reduced motion.
   - `AnimatedText`: character-by-character scroll reveal.
   - `ContactButton`: gradient pill button linking to `#contact`.
   - `LiveProjectButton`: outline pill button for project cards and Blog CTA variant where needed.

5. Implement sections in order.
   - `HeroSection`: navbar, large `Hi, i'm marc` heading, subtitle as fullstack developer, portrait with Magnet, contact CTA.
   - `MarqueeSection`: two scroll-reactive rows of GIF tiles, tripled for seamless scrolling, passive/rAF scroll handling, lazy-loaded images.
   - `AboutSection`: decorative image positions, gradient heading, animated paragraph adapted to Fullstack Developer.
   - `ServicesSection`: white section with five fullstack service rows.
   - `BlogSection`: white editorial three-card grid with `Read Article` links and `Read More` CTA; no pricing UI.
   - `ProjectsSection`: dark rounded section with sticky project cards on medium/large screens and a safe stacked layout on mobile if sticky causes layout problems.
   - Add a compact contact/footer block with `id="contact"` at the end of ProjectsSection or directly after it, using placeholder contact copy/link.

6. Accessibility and performance pass.
   - Add `alt` text for content images.
   - Mark decorative images with `alt=""` and `aria-hidden="true"`.
   - Use semantic `section` IDs: `about`, `blog`, `projects`, `contact`.
   - Ensure keyboard focus is visible on all interactive elements.
   - Ensure all images specify dimensions/classes to avoid layout shift.
   - Ensure `loading="lazy"` and `decoding="async"` on non-critical images.

7. Verification.
   - Run `npm install`.
   - Run `npm run build`.
   - Run `git diff --check` if git is initialized.
   - Start a local dev server and inspect the page in browser if available.
   - Check desktop and mobile/narrow viewport for no horizontal overflow and console errors.

8. Git handling.
   - Initialize Git repository with branch `main` if not already initialized.
   - Review changed files before committing.
   - Since policy allows commits and no push/deploy, optionally commit after successful verification with a concise message such as `feat: create Marc portfolio landing page`.
   - Do not push.

## Scope boundaries

Do not implement:

- Backend/API/CMS for blog posts.
- Real contact form submission.
- Deployment, domain, hosting, CI, or webhook setup.
- Real project/blog URL integrations unless the user provides links.
- Any modifications outside `/home/agent/projects/marc-portfolio` except workflow registry already completed by default.

## Risks and assumptions

- The source uses many remote GIFs/images; remote failures or slow loading are possible.
- The supplied portrait and project images are placeholders, not real Marc assets.
- Exact Framer Motion version may need adjustment if unavailable in npm.
- Sticky cards and giant hero heading need real mobile verification.
- Contact/social/project URLs are missing and should remain placeholders.
- Visible language is assumed to be English because the provided template is English.

## Acceptance criteria

- A real Vite React TypeScript app exists and runs locally.
- `npm run build` succeeds.
- Page title is `Marc -- Fullstack Developer`.
- No visible `3D Creator`, `3d creator`, or `Price` copy remains.
- Navbar links are exactly `About`, `Blog`, `Projects`, `Contact` and navigate to valid anchors.
- Section order is Hero → Marquee → About → Services → Blog → Projects/contact footer.
- Blog section replaces Price and contains editorial cards, not pricing cards.
- Services describe fullstack/developer work.
- Marquee uses the 21 provided GIF URLs, split into 11/10 and tripled.
- Design preserves the dark/premium visual direction, Kanit typography, gradient hero headings, rounded cards, and Framer Motion interactions.
- At 320px and 375px widths there is no horizontal overflow.
- Reduced-motion users can read and navigate the page without depending on animation.
- Browser console has no errors on initial load.

## Suggested checks

```bash
npm install
npm run build
npm run dev -- --host 0.0.0.0
```

Then verify in browser:

- Desktop viewport.
- Mobile/narrow viewport around 390×844 and 375×667.
- Console errors.
- Anchor navigation.
- Keyboard Tab focus.
- Reduced-motion behavior if feasible.

## Git/deployment notes

- Project policy allows local commit after successful implementation/checks.
- Project policy does not allow push.
- `auto_deploy_on_push` is false.
- No deployment target is configured.
- Production rules do not apply because this is a local new project.
