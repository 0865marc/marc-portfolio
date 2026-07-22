# Operational context

## Environment

This checkout maps directly to the production static site. Project policy in [`.hermes.md`](../../.hermes.md) and the operator-local Hermes project registry forbids automatic commits, pushes, deployments, or releases. `main` is the configured branch; `allow_commit` and `allow_push` are false.

## Build and deployment boundary

- Full local verification: `npm run verify`.
- Narrow build verification: `npm run build`.
- Documented production target: `portfolio.mybrawl.io`.
- Static publication backend: `./ops/deploy-static.sh`, normally invoked by the host-managed push webhook rather than manually.
- Activating the reviewed Certbot-preserving Nginx configuration is a separate privileged prerequisite.
- Deployment requires a closed implementation run, independent verification, and a distinct single-use release approval bound to the exact commit and target.

The presence of a deployment command is not permission to execute it. A knowledge-layer task must not alter or run deployment scripts.

## Repository operations

`ops/` contains static release, Nginx activation, and webhook-related operational assets. An approved push to `origin/main` triggers the production webhook, so push approval and deployment approval are the same release boundary. Application agents may inspect these files when a task concerns release behaviour, but they must keep security boundaries intact and avoid exposing request payloads, credentials, or private logs.

## Knowledge-index operations

CodeGraph stores its machine-local database under the ignored `.codegraph/` directory. `codegraph.json` excludes `.agents/` and `.workflow/` so code navigation concentrates on implemented source rather than curated notes or execution history. Run `npm run codegraph:init` once per checkout, `npm run codegraph:sync` after source changes, and `npm run codegraph:status` when diagnosing index health. Do not publish, deploy, or treat the local database as evidence or source authority.

The project pins the CLI development dependency for repeatable indexing and shell queries. Codex MCP registration is a separate one-time user-level installation because Codex does not support project-local MCP registration; restarting Codex is required after that registration.
