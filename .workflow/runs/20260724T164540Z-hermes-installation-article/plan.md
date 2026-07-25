# Objective

Add a production-ready Spanish tutorial about rebuilding a Hetzner VPS and installing Hermes Agent securely with Codex and Telegram, while extending the existing static article model only as far as needed for command blocks.

# Current system

`src/data/blog.ts` is the single typed source for blog content. `Article.astro` renders introductions, sections, optional bullet lists, and takeaways. The first three posts appear on the landing page, all posts appear in the index, and Astro emits one static route per stable ID.

# Assumptions and decisions

- Insert the new real article first so it is discoverable as the newest landing highlight.
- Keep the stable ID `hermes-agent-hetzner-instalacion-segura`.
- Add optional `commands: string[]` to a section instead of introducing Markdown, a CMS, or arbitrary HTML.
- Render each command group with semantic `<pre><code>` markup, existing palette values, the reviewed 28 px radius, and contained horizontal scrolling.
- Include command text in the reading-time calculation.
- Use placeholders such as `VPS_IP` and `TU_IP_PUBLICA/32`; never include values from the private support conversation.
- Mark the article `isSample: false`.

# Exact affected files

- `src/data/blog.ts`
- `src/components/Article.astro`
- `src/data/README.md`
- `tests/static-output.test.ts`
- `tests/e2e/site.spec.ts`
- `.agents/tasks/reviews/20260724T164540Z-hermes-installation-article.yaml`
- This run's `.workflow` artifacts

# Implementation phases

1. Extend the typed section model and article renderer with optional command groups.
2. Add the complete article at the start of `blogPosts`, using safe placeholders and explicit security guidance.
3. Update authoring documentation and replace fixed article-count assertions with collection-derived expectations.
4. Add a pending knowledge delta identifying the stale current-entry summary without directly editing reviewed domain knowledge.
5. Synchronize CodeGraph and run `npm run verify` plus `git diff --check`.

# Acceptance criteria

- The generated article has the expected canonical route, title, introduction, all sections, commands, and takeaway.
- Code blocks are semantically rendered, readable on narrow screens, and do not add a new visual token.
- Existing articles, routes, search semantics, tags, focus behavior, and no-JavaScript content remain intact.
- Landing and index counts reflect the new collection without brittle hard-coded totals.
- No sensitive or environment-specific values appear in authored content or workflow evidence.
- Full repository verification succeeds.

# Exact verification

- `npm run verify`
- `git diff --check`
- Inspect generated `dist/blog/hermes-agent-hetzner-instalacion-segura/index.html` through the static-output tests.
- Review `git diff -- src/data/blog.ts src/components/Article.astro src/data/README.md tests/static-output.test.ts tests/e2e/site.spec.ts`.

# Git and release policy

Do not commit, push, open a pull request, publish a GHCR candidate, or deploy production in this implementation run. After independent verification and closure, a separate release run must bind an exact commit and later an immutable image digest.

# Risks and mitigations

- Risk: publishing secrets copied from the conversation. Mitigation: only generic placeholders and no transcript-derived identifiers.
- Risk: command blocks introduce page overflow. Mitigation: constrain them inside the existing reading surface with local horizontal scrolling and responsive tests.
- Risk: a fourth post breaks tests that assume three cards. Mitigation: derive index expectations from `blogPosts.length` while preserving the three-item landing contract.
- Risk: authentication instructions overstate OpenAI support for third-party clients. Mitigation: describe the Hermes-maintained Codex device flow factually and avoid claims beyond observed/officially documented behavior.

# Blockers

Execution requires an immutable plan approval from the project owner. Production publication additionally requires a later independent verification, exact commit, candidate digest, and separate deployment approval.

# Knowledge-delta assessment

The reviewed blog-domain summary currently states that the collection contains three entries. Create a pending bounded delta identifying that statement as stale after the fourth entry is added; do not hand-edit reviewed domain knowledge during implementation.

# Plan SHA-256

Computed from these final bytes and recorded in `state.yaml` and immutable approval events.
