# Frontend/UI-UX consultation report — fallback after profile timeout

## Consultation scope and evidence

- Project: `/home/agent/projects/marc-portfolio`
- Request: redesign only the first hero viewport so the identity, supporting copy, CTA, and portrait/emoji treatment feel professional and clean on mobile and desktop.
- The dedicated `frontend` profile was launched by the planner, but the planner session timed out after 600 seconds and no new frontend report was produced. The frontend process was then stopped after verifying the expected report was still absent. This document is an explicit orchestrator fallback, not a completed frontend-profile run.
- Source inspected directly: `src/components/HeroSection.tsx`, `src/index.css`, `src/components/Magnet.tsx`, `src/components/FadeIn.tsx`, `src/components/AnimatedText.tsx`, `src/components/ContactButton.tsx`, `src/App.tsx`, `package.json`, and the current git status.
- No implementation source was edited as part of this consultation.
- Existing saved screenshots under `.workflow/frontend_artifacts/screenshots/` were inspected as visual context, but their timestamps/content predate or do not conclusively represent the current Spanish source state. They must not be treated as a current browser acceptance run. No fresh browser/console/network verification is claimed because the profile timeout prevented a valid run and the prior environment reported no Chrome/Chromium runtime.

## Current-state findings

### P0 — Hero heading is intentionally clipped by its layout model

`HeroSection.tsx` places `Hola, soy Marc` in an `overflow-hidden` wrapper and applies `whitespace-nowrap` with viewport-based font sizes up to `17.5vw`. This makes the heading depend on a single line being wider than the viewport. The user's report that the main text is not fully displayed is consistent with this implementation. The global `overflow-x: hidden/clip` guard must not be considered a fix.

**Recommendation:** remove `whitespace-nowrap` and the clipping dependency. Use a normal-flow, responsive heading with a deliberate maximum measure, controlled line breaks or natural wrapping, and a desktop scale that leaves margins. The complete text must remain in the DOM and visible.

### P1 — Supporting copy has the wrong measure and casing

The supporting paragraph is constrained to `max-w-[220px]`/`[260px]` and uses uppercase, tracking, and a very long sentence. This creates excessive line breaks and makes the paragraph feel like a narrow label rather than a professional positioning statement. On desktop it occupies a small column while the heading consumes most of the visual field.

**Recommendation:** replace it with a short Spanish role/value block, normal sentence casing, `max-w` around 32–42ch, and a stable line-height. Keep only claims supplied by the user, for example a role line and a concise sentence about IoT platforms, web products, and distributed infrastructure.

### P1 — Portrait/emoji is an ornamental collision layer without a clear role

The remote portrait is absolutely positioned inside `Magnet`, centered over the hero and visually layered with the heading/content. Its role is decorative rather than informational, and its mobile scale/placement contributes to the reported awkward composition. `onError` only hides the image; it does not provide a layout alternative.

**Recommendation:** remove the portrait from the primary hero in the preferred direction. A clean typographic hero better communicates the professional identity and removes remote-image, z-index, pointer, and responsive collision risk. If product/design insists on retaining it, use a clearly bounded secondary media panel in normal layout flow, never behind the heading or CTA, with reduced-motion-safe behavior and a meaningful or empty alt decision.

### P2 — Hero contains too many competing visual signals

The current first viewport has a large gradient heading, a remote illustrated portrait, a narrow uppercase paragraph, nav links, and a CTA. The heading and portrait compete for the center while the summary and CTA sit at opposing lower corners. The visual language is distinctive but not sufficiently structured for a professional portfolio introduction.

**Recommendation:** use a three-level hierarchy: small eyebrow/availability or discipline label only if truthful; one readable identity heading; one concise value proposition; one primary contact CTA. Keep the nav quiet and preserve anchors.

## Recommended design direction

Implement a typographic, editorial hero with no portrait/emoji in the primary composition:

1. Header: retain `Marc` and the existing anchor navigation. On narrow screens, use a compact wrapping-safe layout or a reduced nav treatment that keeps every link readable and touchable; do not let the nav consume the hero title's width.
2. Identity: use a semantic `h1` with short, fully visible Spanish content. Recommended hierarchy:
   - eyebrow: `Director de proyectos · Fullstack · IoT` (only if the final copy team accepts this factual summary);
   - heading: `Construyo sistemas que deben funcionar bien.`;
   - role/value line: `Director de proyectos y desarrollador fullstack.`
3. Supporting proposition: `Trabajo entre producto, software e infraestructura para crear plataformas IoT, productos web y operaciones distribuidas fiables.` This is deliberately shorter than the current sentence and stays factual without employer/customer names or unsupported metrics.
4. CTA: keep one prominent `Contactar`/`Hablemos` action pointing to `#contact`; retain the existing real anchor and accessible focus behavior. If a secondary scroll cue is useful, make it quiet and non-competing rather than adding another button.
5. Visual treatment: retain the dark background, restrained gradient accent, and subtle entrance motion, but make the content the visual. Remove `Magnet`/remote portrait usage from this section unless the planner chooses the bounded-flow alternative based on stronger evidence.

The exact copy is a planning recommendation and should be implemented only after user approval of the plan. It should not be expanded with invented credentials, companies, client names, locations, or metrics.

## Responsive behavior requirements

- `320x568`: nav remains readable without horizontal overflow; heading wraps intentionally in at most a few lines and is fully visible; value proposition and CTA remain in normal flow; no absolute visual overlaps.
- `360x800`, `390x844`, `430x932`: maintain comfortable side padding, readable line length, full heading/value copy, and a touch-sized CTA. The hero should not rely on viewport clipping or a portrait positioned over text.
- `768x1024`: transition to a balanced two-column or editorial composition only if both columns have a clear purpose; avoid recreating a giant clipped heading.
- `1440x900`: use a max-width content container and a controlled heading size; keep the support copy at a readable 32–42ch measure; retain generous whitespace without pushing the CTA into an unrelated corner.
- Across all sizes: `document.documentElement.scrollWidth` must not exceed `clientWidth`; no important element may be outside its intended container; content must remain reachable in normal document flow.

## Accessibility, focus, touch, and reduced motion

- Keep one semantic `h1` with complete readable text; do not make essential meaning dependent on animation.
- If the portrait is removed, remove its `img`, `Magnet`, remote URL, and image-specific error handler from the hero. If retained as decoration, use `alt=""`, `aria-hidden="true"`, and `pointer-events-none`; if informative, provide an accurate concise alt.
- Preserve visible `:focus-visible` styling and real anchors/buttons. Keep primary controls comfortably touch-sized.
- Keep `prefers-reduced-motion` behavior: copy must remain visible, and any retained motion/hover effect must soften or disable appropriately.
- Do not use global overflow clipping to conceal bad wrapping; verify actual element bounds.

## Likely file scope

Required likely changes:

- `src/components/HeroSection.tsx`: new hierarchy, copy, layout, and removal or bounded-flow handling of the portrait.
- `src/index.css`: only if a small hero-specific class is needed for gradient/type treatment or responsive behavior that is clearer than inline Tailwind classes.

Potentially inspect but avoid changing unless required:

- `src/components/ContactButton.tsx` for CTA label/size compatibility.
- `src/components/Magnet.tsx` only if the portrait is retained elsewhere; do not make unrelated global interaction changes.
- `src/components/FadeIn.tsx` only if the new composition needs existing reveal wrappers.

Explicitly out of scope: About, Services, Blog, Projects, global navigation architecture, deployment, DNS, Nginx, TLS, secrets, `ops/`, dependencies, and unrelated dirty files.

## Risks and assumptions

- The exact asset referred to by the user as an “emoji” is the remote portrait currently rendered by `HeroSection.tsx`; if another asset is found during implementation, apply the same decision to that asset.
- Existing screenshots in workflow artifacts are not reliable proof of the current source state, so implementation must perform a fresh build and browser check if a browser becomes available.
- Removing the portrait changes the emotional tone of the original template, but it is the lowest-risk way to meet the user's stated desire for a cleaner, more professional hero and eliminates the reported small/awkward decorative area.
- No blocking product question remains for planning: the user has explicitly requested a rethink, and the planner can present the recommended typographic direction for approval.

## Handoff to planner

Use this report as supporting consultation context only. The approved `.workflow/plan.md` must specify the final copy, exact responsive classes/structure, the portrait removal decision, preserved anchors, and verification commands. Do not treat this fallback as evidence that browser acceptance has passed.
