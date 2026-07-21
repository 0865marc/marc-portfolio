# Project context

## Identity

- Project: `marc-portfolio`.
- Product: Marc's Spanish-language professional portfolio and technical blog.
- Public production target: `portfolio.mybrawl.io`.
- Repository branch: `main`; resolve the checkout root dynamically with Git.
- Runtime: static React application built by Vite; there is no application backend in this repository.

## Authority order

1. [`.hermes.md`](../../.hermes.md) and the project registry define agent, Git, production, and deployment policy.
2. Application source and configuration define current behaviour.
3. Accepted ADRs and [DESIGN.md](../DESIGN.md) define reviewed cross-cutting decisions.
4. Curated context and domain notes in `.agents/` are navigation aids. If they disagree with source, treat them as stale and flag a knowledge delta.
5. `.agents/generated/` is a disposable search/index projection, not a source of truth.

`.workflow/` contains historical and in-flight work artifacts. The index excludes it deliberately; reusable facts enter `.agents/` only through independent review.

## Stack

- React 18 and TypeScript.
- Vite 5 build pipeline.
- Tailwind CSS 3 utility classes plus global rules in [`src/index.css`](../../src/index.css).
- Framer Motion for entrance and scroll effects.
- Lucide React for icons.
- Kanit loaded from Google Fonts in [`index.html`](../../index.html).
- Static typed content under [`src/data/`](../../src/data/).

## Product language and audience

Visible product copy is Spanish. The portfolio presents Marc as a project director and full-stack developer focused on IoT platforms, web products, asynchronous systems, and distributed infrastructure. Keep technical statements grounded in the reviewed source content rather than adding unsupported claims.

## Safe working baseline

- Production changes require independent review and explicit deployment approval.
- Do not commit, push, or deploy automatically.
- Do not edit environment/credential files or production data.
- Preserve unrelated working-tree and workflow history.
- Normal application verification is `npm run build`.
- Knowledge-index verification is documented in [the `.agents` README](../README.md).
