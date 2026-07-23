---
version: alpha
name: Marc Portfolio
description: Dark editorial portfolio with oversized Kanit typography, cool blue-grey contrast, white reading surfaces, and restrained motion.
colors:
  canvas: "#0C0C0C"
  foreground: "#D7E2EA"
  surface: "#FFFFFF"
  surface-text: "#0C0C0C"
  hero-gradient-start: "#646973"
  hero-gradient-end: "#BBCCD7"
  image-gradient-start: "#1A1724"
  image-gradient-end: "#334554"
typography:
  display-xl:
    fontFamily: "Kanit, sans-serif"
    fontSize: "10rem"
    fontWeight: 900
    lineHeight: 1
    letterSpacing: "-0.025em"
  hero:
    fontFamily: "Kanit, sans-serif"
    fontSize: "5.5rem"
    fontWeight: 900
    lineHeight: 0.98
    letterSpacing: "-0.025em"
  heading:
    fontFamily: "Kanit, sans-serif"
    fontSize: "3rem"
    fontWeight: 500
    lineHeight: 1.1
    letterSpacing: "0em"
  body-lg:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 300
    lineHeight: 1.625
    letterSpacing: "0em"
  body:
    fontFamily: "Kanit, sans-serif"
    fontSize: "1rem"
    fontWeight: 300
    lineHeight: 1.625
    letterSpacing: "0em"
  label:
    fontFamily: "Kanit, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 500
    lineHeight: 1.25
    letterSpacing: "0.14em"
rounded:
  card-sm: "28px"
  card-md: "40px"
  card-lg: "60px"
  pill: "9999px"
spacing:
  gutter-mobile: "20px"
  gutter-small: "32px"
  gutter-medium: "40px"
  section-mobile: "80px"
  section-desktop: "128px"
  control-min: "44px"
  content-wide: "1152px"
  reading: "768px"
components:
  button-dark:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.gutter-mobile}"
    height: "{spacing.control-min}"
  button-light:
    backgroundColor: "{colors.foreground}"
    textColor: "{colors.canvas}"
    typography: "{typography.label}"
    rounded: "{rounded.pill}"
    padding: "{spacing.gutter-mobile}"
    height: "{spacing.control-min}"
  card-light:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.surface-text}"
    rounded: "{rounded.card-md}"
    padding: "{spacing.gutter-mobile}"
  card-dark:
    backgroundColor: "{colors.canvas}"
    textColor: "{colors.foreground}"
    rounded: "{rounded.card-lg}"
    padding: "{spacing.gutter-medium}"
  article-surface:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.surface-text}"
    rounded: "{rounded.card-md}"
    padding: "{spacing.gutter-medium}"
    width: "{spacing.reading}"
---

## Overview

Marc Portfolio is a Spanish-language professional portfolio with an editorial, technical tone. Its identity comes from a near-black canvas, cool blue-grey type, oversized condensed-feeling Kanit headings, white inverse sections, generous rounded surfaces, and motion that supports hierarchy without blocking reading.

This file formalizes values already present in `src/index.css`, `src/layouts/BaseLayout.astro`, and current component utility classes. It is a design constraint for future work, not a request to redesign the application.

## Colors

- **Canvas — `#0C0C0C`:** page background, dark cards, dark buttons, and primary text on white.
- **Foreground — `#D7E2EA`:** default text, focus ring, project borders, selection background, and light actions on dark.
- **Surface — `#FFFFFF`:** services, landing blog, article, and other reading surfaces.
- **Hero gradient — `#646973` to `#BBCCD7`:** oversized hero/section display text only. Keep readable fallback text semantics; the gradient is not a standalone information signal.
- **Image fallback gradient — `#1A1724` to `#334554`:** media frame fallback behind project images.

The principal text pairs have strong contrast: foreground on canvas is approximately 14.86:1; canvas on white is approximately 19.56:1. Existing opacity variants are contextual secondary text and borders. Re-check contrast whenever opacity, background, or font weight changes.

## Typography

Kanit is the only product family and is loaded at weights 300–900. Use system `sans-serif` as fallback.

- `display-xl` describes the 160 px desktop ceiling used by oversized uppercase section headings; components scale fluidly down with `clamp()` rather than forcing that size on narrow screens.
- `hero` describes the current 5.5 rem desktop ceiling with tight `0.98` line height.
- `heading` is for article and card hierarchy, not for decorative labels.
- `body` and `body-lg` use light weight and relaxed line height. Article prose may use the existing `1.8` line height within the reading column.
- `label` is uppercase metadata/navigation with deliberate tracking. Do not use it for long sentences.

Keep headings concise and allow Spanish text, tags, URLs, and project names to wrap. Do not shrink copy until it becomes unreadable merely to preserve a desktop line break.

## Layout & Spacing

Design mobile-first from the 20 px gutter. Existing breakpoints increase gutters to 32 px and 40 px. Primary content is generally capped at 1152 px; the hero shell may reach 1440 px; long-form article content stays near 768 px.

Use vertical section padding near 80 px on mobile and up to 128 px on larger screens. Preserve `min-width: 0`, wrapping, and clipped/hidden horizontal overflow in nested grid/flex layouts. The landing order and route headings are part of information architecture, not movable decoration.

At narrow widths, controls and cards use a single readable column. Multi-column blog/project layouts progressively enhance at medium/large breakpoints. Never depend on hover or scroll transforms for access to content.

## Elevation & Depth

The system is mostly flat. Depth comes from contrast, borders, overlapping rounded section tops, sticky project cards on desktop, and restrained card hover translation/shadow. Avoid glassmorphism, heavy drop shadows, or unrelated neon glow.

Hover elevation is optional enhancement. Reduced-motion mode and mobile project cards must remain fully usable without transforms.

## Shapes

- Use 28 px rounded cards at the compact/mobile baseline.
- Use 40 px for standard large surfaces and section/card continuity.
- Use 60 px only on large project cards or large section transitions.
- Use fully rounded pills for compact actions, tags, and filters.
- Preserve at least 44 px control height even when the visual label is small.

Rounded geometry should group content; do not apply large radii to every text block or decorative element.

## Components

- **Navigation:** native links, Spanish labels, compact uppercase tracking, visible focus, and 44 px minimum target height.
- **Primary buttons:** `button-dark` on light surfaces and `button-light` on dark surfaces. Existing hover opacity/color shifts may be retained, but the resting state must carry meaning.
- **Blog cards:** white, dark text, 28–40 px radius, wrapping tags, semantic heading level supplied by context, and one full-card native link.
- **Project cards:** dark, foreground border/text, 40–60 px radius, responsive image grid, and optional desktop sticky scaling. Content must remain static on mobile/reduced motion.
- **Article surface:** white reading panel on the dark route canvas, constrained reading width, clear `h1`/`h2` hierarchy, and generous prose line height.
- **Filters:** labelled native search input, fieldset/legend for tags, `aria-pressed` state, polite result count, disabled clear action, and explicit no-match/no-content states.

### Accessibility

Use semantic regions and headings, Spanish accessible names, logical source order, and native controls. Preserve the current 3 px foreground focus ring with 5 px offset in global CSS or an equally visible context-aware equivalent. Route changes must move focus to the route heading without trapping it. Keep reduced-motion overrides, meaningful image alternatives, decorative empty `alt`, safe image-failure behaviour, and no horizontal overflow at narrow widths.

Color, position, motion, or hover must never be the only state indicator. New loading, empty, error, validation, and success states must be explicit whenever a feature can enter those states.

## Do's and Don'ts

### Do

- Reuse the exact canvas, foreground, white surface, Kanit family, and existing rounded scale.
- Keep visible copy in Spanish unless the content itself requires another language.
- Start with narrow layouts, wrapping, touch targets, focus, and reduced motion.
- Use oversized typography for hierarchy while keeping body copy constrained and readable.
- Verify contrast again when introducing alpha/opacity or placing text over media.
- Update this file through the independently reviewed knowledge-delta process when the actual design system changes.

### Don't

- Introduce an unrelated accent palette, glow-heavy cyber aesthetic, serif family, or generic dashboard styling.
- Copy desktop spacing to mobile or force horizontal card/filter rows.
- Hide content behind animation, hover, remote imagery, or precise pointer input.
- Add a new radius, color, or typography role when an existing token expresses the same purpose.
- Treat CodeGraph results as design authority; source plus reviewed `DESIGN.md` remain authoritative.
