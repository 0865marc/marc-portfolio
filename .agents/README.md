# Marc Portfolio project knowledge

`.agents/` is the project-local, reviewable knowledge layer for agents working in this repository. It provides a small authored map, a formal visual specification, and a generated lexical search/graph index. It does not replace application source, Git history, `.hermes.md`, or deployment policy.

## Start here

1. Read [context/project.md](context/project.md) for authority and scope.
2. Read [context/architecture.md](context/architecture.md) and the relevant file in [domains/](domains/).
3. Read [DESIGN.md](DESIGN.md) before any visual change.
4. Query the local index instead of loading the whole repository.
5. Use [tasks/README.md](tasks/README.md) after a task to propose a bounded knowledge delta for independent review.

## Authored and generated boundaries

| Path | Ownership | Purpose |
| --- | --- | --- |
| `README.md`, `manifest.yaml` | authored | Entry point and index policy |
| `context/`, `domains/` | authored | Curated reusable project facts |
| `DESIGN.md` | authored | Canonical visual tokens and rules |
| `decisions/` | authored after review | Accepted architectural decisions |
| `tasks/` | authored/reviewed | Knowledge-delta protocol and records |
| `graph/` | authored | Graph and SQLite schema documentation |
| `scripts/`, `tests/` | authored | Dependency-free implementation and focused tests |
| `generated/` | generated and versioned snapshot | SQLite, JSONL graph, and freshness/provenance state |

Never hand-edit files under `generated/`. Regenerate them from repository sources and commit the SQLite, JSONL, and state files together. The checked-in snapshot lets a fresh checkout query immediately; authored knowledge changes still require review.

## Commands

Run from the repository root with the system Python; no package installation is required.

```text
python3 .agents/scripts/index_project.py --project . index
python3 .agents/scripts/index_project.py --project . query "portfolio"
python3 .agents/scripts/index_project.py --project . query "RabbitMQ OR MQTT" --limit 5
python3 .agents/scripts/index_project.py --project . validate
python3 .agents/scripts/validate_design.py .agents/DESIGN.md
python3 -m unittest discover -s .agents/tests -p 'test_*.py' -v
```

Each command emits JSON. Query results contain project-relative `path`, document `title`, current chunk `heading`, an FTS5-highlighted `snippet`, and a numeric BM25 `rank` (lower is better). Query text uses SQLite FTS5 syntax.

The search is deterministic local lexical search, not semantic search. Startup checks creation of an FTS5 table and fails with an explicit error when the Python SQLite build lacks FTS5. A future hybrid search implementation may add embeddings behind the same document/chunk IDs, but it must remain optional and must not weaken the local FTS path.

## Index behaviour

- Scanning is deterministic by project-relative path.
- SHA-256 identifies document content; unchanged runs are database no-ops.
- Markdown headings become graph nodes and chunk boundaries.
- Local imports, local Markdown links, containment, and conventional test filenames become typed graph edges.
- `.git`, `.workflow`, generated `.agents` artifacts, operator-local `.hermes.md`, dependency/vendor/build/cache directories, environment files, common credential/key files, binaries, symlinks, and files over 1 MB are excluded.
- Authored `.agents` Markdown, scripts, tests, and the manifest are indexed.
- Freshness and provenance live in `.agents/generated/state.json`; policy lives in [manifest.yaml](manifest.yaml).

## Review rule

Indexing does not make a fact authoritative. After implementation, record only reusable changes in a `knowledge_delta`. An independent reviewer approves or rejects that delta before authored context, design tokens, or ADRs are changed. Re-index only after approved authored changes are applied. Do not store task transcripts, credentials, personal data beyond what is already intentional project content, or raw private logs.

See [tasks/README.md](tasks/README.md) for the protocol and [graph/README.md](graph/README.md) for storage details.
