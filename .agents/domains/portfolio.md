# Portfolio landing domain

## Purpose

The landing page communicates Marc's professional profile, experience, service areas, technical writing, selected projects, and contact paths in Spanish.

## Source map

- Landing composition: [`src/pages/index.astro`](../../src/pages/index.astro)
- Hero and navigation: [`src/components/HeroSection.astro`](../../src/components/HeroSection.astro)
- About and experience: [`src/components/AboutSection.astro`](../../src/components/AboutSection.astro)
- Services: [`src/components/ServicesSection.astro`](../../src/components/ServicesSection.astro)
- Projects and contact footer: [`src/components/ProjectsSection.astro`](../../src/components/ProjectsSection.astro)
- Typed portfolio content: [`src/data/portfolio.ts`](../../src/data/portfolio.ts)
- Shared progressive enhancement: [`src/scripts/enhancements.ts`](../../src/scripts/enhancements.ts) and [`src/components/MarqueeSection.astro`](../../src/components/MarqueeSection.astro)

## Stable product contracts

- Main anchors are `about`, `blog`, `projects`, and `contact`.
- The hero heading ID is `hero-title`.
- The contact footer lives inside `ProjectsSection` and is labelled by `contact-title`.
- Visible navigation and descriptive copy are Spanish.
- Email and LinkedIn remain native links with accessible labels.
- Static data types (`Service`, `Experience`, `Project`) are the content contracts.

## Visual and accessibility rules

Use the dark `#0C0C0C` canvas and blue-grey `#D7E2EA` foreground as the primary identity, with white inverse sections and oversized Kanit headings. Layout is mobile-first with 20 px side padding at the narrow baseline, increasing at breakpoints. Preserve 44 px minimum targets, visible focus, reduced-motion behaviour, hidden horizontal overflow, meaningful headings, and empty/error handling where content can be absent or remote media can fail.

See [DESIGN.md](../DESIGN.md) for normative tokens and guidance.
