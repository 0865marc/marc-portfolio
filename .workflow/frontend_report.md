# Frontend/UI-UX consultation report — Marc Fullstack Developer portfolio

## Scope, method, and limitations

- Project: `/home/agent/projects/marc-portfolio`
- Mode: planning/design consultation for a new React/Vite landing page.
- Source specification: `.workflow/source_template.md`.
- No runnable app exists yet, so this is a spec/code-architecture review rather than a rendered browser audit.
- The dedicated frontend profile was invoked but did not complete within the tool timeout; this report is a fallback frontend-specialist review so planning can continue without fabricating a completed profile run.

## Executive summary

The supplied template can work well as a premium high-motion personal portfolio, but the implementation should treat it as a **Fullstack Developer** portfolio, not a 3D creator page. Keep the dark cinematic visual identity and motion system, replace Price with Blog, and make services/projects/blog content developer-focused. The highest-risk parts are mobile hero overlap, remote GIF performance, sticky project cards on small screens, contact-link behavior without a dedicated Contact section, and reduced-motion/accessibility support.

## Priority findings

### P0 — No runnable project scaffold exists yet

- Location: project root.
- Observed: only `.workflow/` artifacts exist; no Vite, Tailwind, or React files yet.
- Why it matters: implementation must create a real app, not only adapt the markdown prompt.
- Proposed change: scaffold a minimal Vite React TypeScript app manually inside the existing non-empty project directory, then install dependencies and build.

### P1 — Identity must be consistently Fullstack Developer

- Location: title, hero, about copy, services, blog, project labels.
- Observed: adapted spec replaces identity copy, but visual assets/project images still originate from a 3D/creative template.
- Why it matters: mixed 3D/developer language would weaken positioning.
- Proposed change: keep decorative 3D imagery as visual style only, but ensure all visible professional positioning says Fullstack Developer / frontend / backend / integrations / automation / product UX.

### P1 — Contact target is underspecified

- Location: nav `Contact`, `ContactButton`.
- Observed: no separate Contact section is in the required section order.
- Why it matters: links/buttons should not be dead controls.
- Proposed change: use safe placeholders initially (`#contact`), and add a compact contact/footer block at the end of ProjectsSection or as a small footer with `id="contact"`. Mark real email/social/contact URLs as follow-up content.

### P1 — Motion and scroll effects need safe degradation

- Location: marquee, sticky project cards, AnimatedText, FadeIn, Magnet.
- Observed: the template relies heavily on scroll and hover-based motion.
- Why it matters: mobile/touch devices, reduced-motion users, and lower-power devices can suffer if motion is uncontrolled.
- Proposed change: implement `prefers-reduced-motion` fallbacks, passive/rAF scroll handling for marquee, disable/soften Magnet on coarse pointers, and provide non-sticky/mobile-friendly project cards below `md` if sticky stacking feels cramped.

### P1 — Remote GIF/image performance

- Location: MarqueeSection and ProjectsSection.
- Observed: 21 remote GIFs plus remote project images can be heavy.
- Why it matters: first load and scroll performance may degrade.
- Proposed change: lazy-load below-the-fold images, set width/height, `decoding="async"`, `loading="lazy"`, `object-cover`, alt text, and graceful placeholder backgrounds. Avoid preloading all marquee GIFs.

### P2 — Blog section should be editorial, not pricing-like

- Location: BlogSection.
- Observed: adapted spec defines three cards and a `Read More` CTA.
- Why it matters: it must clearly replace Price and not look like a plan table.
- Proposed change: use article cards with category/date/title/excerpt/read link, no pricing amounts, no feature comparison, no plan names.

## Recommended information architecture

1. Hero: immediate identity — `Hi, i'm marc`, subtitle as fullstack developer, contact CTA.
2. Marquee: visual proof/energy; treat GIFs as inspiration/portfolio placeholders.
3. About: concise developer positioning across frontend, backend, integrations, automation, UX.
4. Services: five fullstack service rows.
5. Blog: three editorial cards about frontend/backend/automation.
6. Projects: sticky project cards with developer-oriented names and placeholder imagery.
7. Contact: compact anchor/footer block if no real contact URL is available.

## Responsive/mobile recommendations

- Keep hero `h-screen`, but test iPhone/narrow widths for portrait and heading overlap.
- Use `whitespace-nowrap` for hero heading as specified, but ensure it does not cause horizontal scroll; main wrapper must use `overflow-x: clip`.
- For sticky project cards, use stacked normal-flow cards on small screens if sticky creates clipping or unusable scroll length.
- Use `clamp()` typography exactly where specified, but cap small-screen line-height and spacing so the first viewport remains readable.
- Decorative About images should be `pointer-events-none`, `aria-hidden`, and opacity/size controlled so they do not cover text on mobile.

## Accessibility and interaction requirements

- Use semantic landmarks: `header`, `nav`, `main`, `section`, `article`, `footer` as appropriate.
- Use real anchors/buttons with accessible names.
- Add `id` targets for `about`, `blog`, `projects`, and `contact`.
- Give meaningful alt text to portfolio/project images; decorative images should use empty alt and `aria-hidden`.
- Keep visible keyboard focus for nav links, ContactButton, Read Article, Read More, and Live Project buttons.
- Respect `prefers-reduced-motion` for scroll reveals, sticky scaling, marquee transforms, and magnetic hover.
- Ensure normal text contrast meets WCAG AA against dark/light backgrounds.

## Suggested component/data organization

- `src/main.tsx`
- `src/App.tsx`
- `src/index.css`
- `src/data/portfolio.ts`
- `src/components/FadeIn.tsx`
- `src/components/Magnet.tsx`
- `src/components/AnimatedText.tsx`
- `src/components/ContactButton.tsx`
- `src/components/LiveProjectButton.tsx`
- `src/components/HeroSection.tsx`
- `src/components/MarqueeSection.tsx`
- `src/components/AboutSection.tsx`
- `src/components/ServicesSection.tsx`
- `src/components/BlogSection.tsx`
- `src/components/ProjectsSection.tsx`

Keep data arrays for GIFs, services, blog posts, and projects in `src/data/portfolio.ts` so copy can be edited later without hunting through JSX.

## Motion/performance implementation notes

- Use Framer Motion for FadeIn, AnimatedText, and project card scale transforms.
- For marquee scroll, prefer a `requestAnimationFrame`-guarded passive scroll listener to avoid setState on every scroll event.
- Use `will-change: transform` only on actively moving elements, not globally.
- Disable or minimize hover-only Magnet behavior on touch/coarse pointers.
- Avoid layout thrashing by measuring sectionTop with `getBoundingClientRect` only on mount/resize or derive via `offsetTop`.

## Acceptance checks for implementation

- `npm install` completes and creates lockfile.
- `npm run build` passes.
- The page title is `Marc -- Fullstack Developer`.
- No visible `3D Creator`, `3d creator`, `Price`, or pricing-table copy remains.
- Navbar links are `About`, `Blog`, `Projects`, `Contact` and point to working anchors.
- Blog section exists and contains editorial article cards, not pricing cards.
- Services are fullstack/developer-focused.
- Marquee uses 21 provided GIF URLs, split 11/10 and tripled.
- Main wrapper has `overflow-x: clip`; no horizontal overflow at 320px/375px.
- Reduced-motion mode does not depend on continuous animation to understand content.
- Browser smoke check shows no console errors on initial load.

## Risks and follow-up content needed

- Real contact destination is missing.
- Real project URLs are missing.
- Real Marc portrait/image is missing.
- Remote assets may fail or be slow; placeholders/fallback backgrounds are needed.
- The source spec requests exact animation behavior, but final implementation should favor stable, accessible behavior over fragile pixel-perfect motion if there is a conflict.
