# Project context

## Identity

- Project: `marc-portfolio`.
- Product: Marc's Spanish-language professional portfolio and technical blog.
- Public production target: `portfolio.mybrawl.io`.
- Repository branch: `main`; resolve the checkout root dynamically with Git.
- Runtime: Astro static output with small framework-free TypeScript enhancements; there is no application backend in this repository.

## Authority order

1. Current user and platform authority define what an agent may change or publish.
2. Application source and configuration define current behaviour.
3. Accepted ADRs and [DESIGN.md](../DESIGN.md) define reviewed cross-cutting decisions.
4. Curated context and domain notes in `.agents/` are navigation aids. If they disagree with source, treat them as stale and flag a knowledge delta.

## Stack

- Astro 7 static directory output and TypeScript.
- Tailwind CSS 3 utility classes plus global rules in [`src/index.css`](../../src/index.css).
- Astro components render all primary content without a client framework runtime.
- Small scripts under [`src/scripts/`](../../src/scripts/) progressively enhance navigation, filtering, reveal motion, and image fallbacks.
- Kanit is loaded from local `@fontsource/kanit` imports in [`src/layouts/BaseLayout.astro`](../../src/layouts/BaseLayout.astro); runtime has no remote-font dependency.
- Static typed content under [`src/data/`](../../src/data/).

## Product language and audience

Visible product copy is Spanish. The portfolio presents Marc as an engineer of software and responsable de proyectos IT, with the public current experience authorized as `Taurus Research & Development`. Keep technical statements grounded in the reviewed source content; do not add unsupported private infrastructure or Hermes details.

## Safe working baseline

- Production promotion requires independent review and explicit approval of an immutable image digest.
- Do not infer commit, push, merge, or deployment permission.
- Do not edit environment/credential files or production data.
- Preserve unrelated working-tree changes and artifacts.
- Normal repository verification is `npm run verify`; `npm run build` is the narrower application-build gate.
- Authored-knowledge verification is documented in [the `.agents` README](../README.md).
