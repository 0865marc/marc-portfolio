# Operational context

## Environment

This checkout maps directly to the production static site. Project policy in [`.hermes.md`](../../.hermes.md) and the operator-local Hermes project registry forbids automatic commits, pushes, deployments, or releases. `main` is the configured branch; `allow_commit` and `allow_push` are false.

## Build and deployment boundary

- Local verification: `npm run build`.
- Documented production target: `portfolio.mybrawl.io`.
- Documented deployment command: `./ops/deploy-static.sh`.
- Deployment requires approved implementation, independent review, and explicit production approval.

The presence of a deployment command is not permission to execute it. A knowledge-layer task must not alter or run deployment scripts.

## Repository operations

`ops/` contains static release and webhook-related operational assets. Application agents may inspect these files when a task concerns release behaviour, but they must keep security boundaries intact and avoid exposing request payloads, credentials, or private logs.

## Knowledge-index operations

The local index writes only to `.agents/generated/`, whose three artifacts are committed together as a portable bootstrap snapshot. It reads supported project text files, excludes `.workflow/` and operator-local `.hermes.md`, and does not contact a network service. A no-change SHA-256 scan leaves the SQLite database untouched. Run `validate` after indexing and before relying on graph relationships.
