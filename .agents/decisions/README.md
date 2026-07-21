# Architectural decisions

This directory holds concise accepted ADRs for durable choices that are not obvious from source. There are no accepted ADRs in the MVP baseline.

## When an ADR is warranted

Create an ADR only when an independently reviewed knowledge delta sets `adr_needed: true`, for example when changing a stable route/data contract, source-of-truth boundary, deployment architecture, index schema, or design-system rule with meaningful alternatives.

Do not create ADRs for routine implementation details, temporary experiments, or restatements of source code.

## File convention

Use `NNNN-short-kebab-title.md`, starting at `0001`. Each ADR contains:

1. `# NNNN: Title`
2. `Status` (`accepted`, `superseded`, or `deprecated`)
3. `Date` in ISO 8601
4. `Context`
5. `Decision`
6. `Consequences`
7. `References` to project-relative source/docs

Never rewrite an accepted historical decision to conceal a change. Add a new ADR and mark the previous one superseded. Store the decision and rationale only; omit task transcripts, credentials, and private logs.
