# Marc Portfolio project knowledge

`.agents/` is the project-local, reviewable knowledge layer for agents working in this repository. It holds curated context, a formal visual specification, accepted decisions, and bounded knowledge-delta records. CodeGraph provides the separate structural code index. Neither layer replaces application source, Git history, `.hermes.md`, or deployment policy.

## Start here

1. Read [context/project.md](context/project.md) for authority and scope.
2. Read [context/architecture.md](context/architecture.md) and the relevant file in [domains/](domains/).
3. Read [DESIGN.md](DESIGN.md) before any visual change.
4. Use CodeGraph before broad text search when locating symbols, callers, callees, or related implementation paths.
5. Use [tasks/README.md](tasks/README.md) after a task to propose a bounded knowledge delta for independent review.

## Ownership boundaries

| Path | Ownership | Purpose |
| --- | --- | --- |
| `README.md`, `manifest.yaml` | authored | Entry point and knowledge/code-intelligence policy |
| `context/`, `domains/` | authored | Curated reusable project facts |
| `DESIGN.md` | authored | Canonical visual tokens and rules |
| `decisions/` | authored after review | Accepted architectural decisions |
| `tasks/` | authored/reviewed | Knowledge-delta protocol and records |
| `scripts/`, `tests/` | authored | Focused validation of authored knowledge |
| `../codegraph.json` | authored | CodeGraph scope and exclusions |
| `../.codegraph/` | generated and ignored | Machine-local CodeGraph database |

Never hand-edit or commit `.codegraph/`. It is a disposable projection of current source, not an authority or a portable snapshot. `.agents/` and `.workflow/` are deliberately excluded from CodeGraph: read curated knowledge directly and keep workflow history out of code discovery.

## Project commands

Install project dependencies, initialize once, and then synchronize incrementally:

```text
npm ci
npm run codegraph:init
npm run codegraph:sync
npm run codegraph:status
codegraph query "filterBlogPosts" --json
codegraph explore "how blog routes are generated"
python3 .agents/scripts/validate_design.py .agents/DESIGN.md
python3 -m unittest discover -s .agents/tests -p 'test_*.py' -v
```

`npm run verify` synchronizes CodeGraph before running the authored-knowledge, workflow, application, static-output, asset, and operations gates. The CLI is pinned as a development dependency so indexing and shell queries work after `npm ci`.

## Codex MCP setup

Codex registers MCP servers at user scope, while each repository keeps its own index. On a new workstation:

```text
npm install -g @colbymchenry/codegraph@1.5.0
codegraph install --target=codex --location=global --yes
```

Restart Codex after registration. When MCP is unavailable in an existing session, the equivalent shell command is `codegraph explore "<question>"`.

## Review rule

An index result does not make a fact authoritative. Application source wins over CodeGraph and curated summaries. After implementation, record only reusable changes in a `knowledge_delta`. An independent reviewer normally approves or rejects that delta before authored context, design tokens, or ADRs are changed; an explicit project-owner instruction may approve a delta when it is recorded under the owner's real identity. Refresh CodeGraph after source changes, but do not store task transcripts, credentials, personal data beyond intentional project content, or raw private logs.

See [tasks/README.md](tasks/README.md) for the protocol.
