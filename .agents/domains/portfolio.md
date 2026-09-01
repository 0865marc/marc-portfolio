# Challenge portfolio landing domain

## Purpose

The landing page is Marc’s Spanish professional portfolio and factual eight-week ML, AWS and GenAI bitácora. It presents the authorized public identity as an engineer of software and responsable de proyectos IT at `Taurus Research & Development`, distinguishes planned learning from published evidence, preserves compact verified facts, keeps Ainkii separate and offers direct contact.

## Source map

- Landing composition: [`src/pages/index.astro`](../../src/pages/index.astro)
- Challenge framing and navigation: [`src/components/HeroSection.astro`](../../src/components/HeroSection.astro)
- Career Sprint block and roadmap/progress links: [`src/components/CareerSprintSection.astro`](../../src/components/CareerSprintSection.astro) renders the current block and links to `/roadmap/` and `/career-sprint-daily/`.
- Compact profile: [`src/components/AboutSection.astro`](../../src/components/AboutSection.astro)
- Separate Ainkii evidence, knowledge slot and contact: [`src/components/ProjectsSection.astro`](../../src/components/ProjectsSection.astro)
- Managed route/progress data: [`src/data/challenge.ts`](../../src/data/challenge.ts)
- Compact typed profile and authorized public identity: [`src/data/portfolio.ts`](../../src/data/portfolio.ts)

## Stable product contracts

- Home navigation exposes Perfil (`#about`), Career Sprint (`#career-sprint`) and Contacto (`#contact`); `#progress` remains an active content anchor, while `#projects` and `#blog` are temporarily hidden.
- The public identity location is Balaguer, Lleida; the current employer is the authorized `Taurus Research & Development`; historical experience locations remain separate facts.
- The hero heading ID is `hero-title`; the contact footer remains labelled by `contact-title`.
- The challenge runs from 24 August through 18 October 2026. Planning, reservations and criteria must never be rendered as completed work, certifications or project evidence.
- Ainkii remains «En desarrollo» and is not the challenge project. Hermes is absent from public composition and profile data.
- The route can be public while daily progress remains empty; visible empty states must be explicit.

## Visual and accessibility rules

Use the dark `#0C0C0C` canvas and blue-grey `#D7E2EA` foreground, white inverse sections, Kanit, the existing radius scale and a 20 px narrow gutter. The roadmap is an editorial ledger and the progress view a chronology, not a dashboard: no invented KPIs, percentages or productivity charts. Preserve 44 px controls, visible focus, reduced-motion behavior, wrapping and no horizontal overflow.
