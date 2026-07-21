# Task review and knowledge-delta protocol

Completed implementation does not automatically change project knowledge. Every task may propose a bounded `knowledge_delta`; an independent reviewer decides whether the facts are reusable and accurate before `.agents/` authored files change.

## Producer step

1. Copy `knowledge-delta.template.yaml` to `tasks/reviews/<task-id>.yaml` only when a durable change is proposed. If nothing reusable changed, keep all arrays empty and state that in the implementation handoff instead of creating noise.
2. Set `task_id`, a one-line `summary`, and only the affected fields under `knowledge_delta`.
3. Reference stable graph node IDs when available; otherwise use project-relative paths and headings.
4. Leave `review_status: pending`, `reviewed_by`, `reviewed_at`, and `reindex_approved` for the independent reviewer.

Each node entry should be a small object such as:

```text
- id: "file:..."          # or path: "src/App.tsx"
  fact: "One reusable, source-verifiable statement"
  evidence: "src/App.tsx:48-64"
```

`added_nodes` introduces durable knowledge; `changed_nodes` corrects existing knowledge; `deprecated_nodes` marks facts that should no longer guide work; `stale_knowledge` identifies an authored file/section needing repair. `adr_needed` and `design_changed` are explicit review gates, not permission to update those files immediately.

## Independent review step

The reviewer must:

1. Compare every proposed fact with current source, tests, policy, or observed behaviour.
2. Reject duplicate, speculative, task-specific, sensitive, or already-obvious detail.
3. Set `review_status` to `approved` or `rejected`, add reviewer identity/date, and set `reindex_approved` only when approved authored changes were actually applied.
4. For approved changes, update only the smallest relevant context/domain/ADR/DESIGN section.
5. Run the index and validation commands after the authored update, then verify the generated state source digest.

## Bounded storage rules

- Store reusable facts and evidence pointers, not full conversations, copied prompts, private logs, credentials, tokens, or environment values.
- Keep a delta limited to files/contracts changed by its task.
- Use empty arrays instead of placeholder prose.
- Do not copy application source into knowledge notes.
- Deprecate or supersede stale knowledge; do not silently preserve contradictions.
- A generated graph/index never approves its own inputs.

The template is intentionally simple YAML so humans and tools can inspect it without a new dependency.
