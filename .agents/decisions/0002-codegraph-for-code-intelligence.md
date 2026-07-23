# 0002: CodeGraph for local code intelligence

Status: accepted

Date: 2026-07-22

## Context

The repository maintained a custom Python indexer, committed SQLite/JSONL snapshots, freshness metadata, schema documentation, and implementation-specific tests. That duplicated specialized code-intelligence tooling and made generated data part of ordinary repository review. The authored `.agents/` context remains useful, but it has a different lifecycle and authority from a code graph.

## Decision

Use CodeGraph for structural source indexing, symbol queries, call relationships, and Codex MCP access. Pin its CLI as a development dependency, register its MCP server once at Codex user scope, and keep each checkout's `.codegraph/` database local and ignored.

Keep `.agents/` as small, human-reviewed project knowledge. Exclude `.agents/` and `.workflow/` from CodeGraph so curated summaries and execution history do not compete with application source during code discovery. Application source remains authoritative over both CodeGraph results and curated summaries.

Remove the custom indexer, its graph schema, its tests, and all committed generated index artifacts.

## Consequences

- A fresh checkout runs `npm ci` and `npm run codegraph:init` before using the index.
- Subsequent source changes use incremental `npm run codegraph:sync`.
- Codex must be restarted after the one-time global MCP registration.
- CodeGraph availability no longer requires maintaining a project-specific parser, SQLite schema, graph format, or freshness algorithm.
- The local index cannot serve as portable evidence, reviewed knowledge, or a release artifact.

## References

- `codegraph.json`
- `package.json`
- `.gitignore`
- `.agents/README.md`
- `.agents/manifest.yaml`
