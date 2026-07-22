# Project context

## Identity

- Project: `marc-portfolio`.
- Product: Marc's Spanish-language professional portfolio and technical blog.
- Public production target: `portfolio.mybrawl.io`.
- Repository branch: `main`; resolve the checkout root dynamically with Git.
- Runtime: Astro static output with small framework-free TypeScript enhancements; there is no application backend in this repository.

## Authority order

1. [`.hermes.md`](../../.hermes.md) and the project registry define agent, Git, production, and deployment policy.
2. Application source and configuration define current behaviour.
3. Accepted ADRs and [DESIGN.md](../DESIGN.md) define reviewed cross-cutting decisions.
4. Curated context and domain notes in `.agents/` are navigation aids. If they disagree with source, treat them as stale and flag a knowledge delta.
5. `.codegraph/` is a disposable, machine-local code projection, not a source of truth; application source wins over index results.

`.workflow/` contains historical and in-flight work artifacts. CodeGraph excludes both `.workflow/` and `.agents/` deliberately; reusable facts enter `.agents/` only through independent review.

## Stack

- Astro 7 static directory output and TypeScript.
- Tailwind CSS 3 utility classes plus global rules in [`src/index.css`](../../src/index.css).
- Astro components render all primary content without a client framework runtime.
- Small scripts under [`src/scripts/`](../../src/scripts/) progressively enhance navigation, filtering, reveal motion, and image fallbacks.
- Kanit is loaded from Google Fonts in [`src/layouts/BaseLayout.astro`](../../src/layouts/BaseLayout.astro).
- Static typed content under [`src/data/`](../../src/data/).

## Product language and audience

Visible product copy is Spanish. The portfolio presents Marc as a project director and full-stack developer focused on IoT platforms, web products, asynchronous systems, and distributed infrastructure. Keep technical statements grounded in the reviewed source content rather than adding unsupported claims.

## Safe working baseline

- Production changes require independent review and explicit deployment approval.
- Do not commit, push, or deploy automatically.
- Do not edit environment/credential files or production data.
- Preserve unrelated working-tree and workflow history.
- Normal repository verification is `npm run verify`; `npm run build` is the narrower application-build gate.
- Knowledge-index verification is documented in [the `.agents` README](../README.md).
