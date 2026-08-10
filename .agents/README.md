# Marc Portfolio project knowledge

`.agents/` is the project-local, reviewable knowledge layer for agents working in this repository. It holds curated context, a formal visual specification, accepted decisions, and bounded knowledge-delta records. It complements application source and Git history without replacing either.

## Start here

1. Read [context/project.md](context/project.md) for authority and scope.
2. Read [context/architecture.md](context/architecture.md) and the relevant file in [domains/](domains/).
3. Read [DESIGN.md](DESIGN.md) before any visual change.
4. Use [tasks/README.md](tasks/README.md) after a task to propose a bounded knowledge delta for independent review.

## Ownership boundaries

| Path | Ownership | Purpose |
| --- | --- | --- |
| `README.md`, `manifest.yaml` | authored | Entry point and project-knowledge policy |
| `context/`, `domains/` | authored | Curated reusable project facts |
| `DESIGN.md` | authored | Canonical visual tokens and rules |
| `decisions/` | authored after review | Accepted architectural decisions |
| `tasks/` | authored/reviewed | Knowledge-delta protocol and records |
| `scripts/`, `tests/` | authored | Focused validation of authored knowledge |

The authored knowledge is a navigation aid, not a source of application or release authority. Keep it small, reviewable, and grounded in current source.

## Project commands

```text
python3 .agents/scripts/validate_design.py .agents/DESIGN.md
python3 -m unittest discover -s .agents/tests -p 'test_*.py' -v
```

`npm run verify` runs these authored-knowledge checks together with the application, static-output, and asset gates.

## Review rule

Application source wins over curated summaries. After implementation, record only reusable changes in a `knowledge_delta`. An independent reviewer normally approves or rejects that delta before authored context, design tokens, or ADRs are changed; an explicit project-owner instruction may approve a delta directly when it is recorded under the owner's real identity. Do not store task transcripts, credentials, personal data beyond intentional project content, or raw private logs.

See [tasks/README.md](tasks/README.md) for the protocol.
