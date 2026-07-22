# Task review and knowledge-delta protocol

Completed implementation does not automatically change project knowledge. Every task may propose a bounded `knowledge_delta`; an independent reviewer normally decides whether the facts are reusable and accurate before `.agents/` authored files change. An explicit project-owner instruction may approve a delta directly, but the record must use the owner's real identity and must not describe that review as independent.

## Producer step

1. Copy `knowledge-delta.template.yaml` to `tasks/reviews/<task-id>.yaml` only when a durable change is proposed. If nothing reusable changed, keep all arrays empty and state that in the implementation handoff instead of creating noise.
2. Set `task_id`, a one-line `summary`, and only the affected fields under `knowledge_delta`.
3. Reference project-relative paths, headings, and source symbol names. Do not persist machine-local CodeGraph node identifiers.
4. Leave `review_status: pending`, `reviewed_by`, `reviewed_at`, and `reindex_approved` for the independent reviewer.

Each node entry should be a small object such as:

```text
- path: "src/pages/index.astro"
  symbol: "getStaticPaths" # optional
  fact: "One reusable, source-verifiable statement"
  evidence: "src/pages/index.astro:1-12"
```

`added_nodes` introduces durable knowledge; `changed_nodes` corrects existing knowledge; `deprecated_nodes` marks facts that should no longer guide work; `stale_knowledge` identifies an authored file/section needing repair. `adr_needed` and `design_changed` are explicit review gates, not permission to update those files immediately.

## Independent review step

The reviewer must:

1. Compare every proposed fact with current source, tests, policy, or observed behaviour.
2. Reject duplicate, speculative, task-specific, sensitive, or already-obvious detail.
3. Set `review_status` to `approved` or `rejected`, add reviewer identity/date, and set `reindex_approved` only when approved authored changes were actually applied.
4. For approved changes, update only the smallest relevant context/domain/ADR/DESIGN section.
5. Synchronize CodeGraph after source changes and run the authored-knowledge validation commands. The local index itself is not review evidence.

## Bounded storage rules

- Store reusable facts and evidence pointers, not full conversations, copied prompts, private logs, credentials, tokens, or environment values.
- Keep a delta limited to files/contracts changed by its task.
- Use empty arrays instead of placeholder prose.
- Do not copy application source into knowledge notes.
- Deprecate or supersede stale knowledge; do not silently preserve contradictions.
- CodeGraph never approves its own inputs, and its machine-local identifiers are not durable knowledge references.

The template is intentionally simple YAML so humans and tools can inspect it without a new dependency.
