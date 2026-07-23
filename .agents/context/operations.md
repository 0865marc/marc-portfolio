# Operational context

## Public repository boundary

This repository contains application source, verification, and a production-candidate container. It intentionally contains no VPS addresses, host paths, webhook receivers, credentials, or deployment commands.

## Build and candidate boundary

- Full local verification: `npm run verify`.
- Narrow build verification: `npm run build`.
- Container smoke test: `npm run test:container -- marc-portfolio:ci`.
- Pull requests targeting `main` run `CI / Verify`.
- A successful `main` push publishes a GHCR candidate tagged by commit and recorded by immutable digest.
- CI never connects to or deploys production.

Production promotion belongs to a private deployer. It must consume an explicitly approved digest and produce independent post-deploy evidence. Repository files and role labels do not grant that authority.

## Knowledge-index operations

CodeGraph stores its machine-local database under the ignored `.codegraph/` directory. `codegraph.json` excludes `.agents/` and `.workflow/` so code navigation concentrates on implemented source rather than curated notes or execution history. Run `npm run codegraph:init` once per checkout, `npm run codegraph:sync` after source changes, and `npm run codegraph:status` when diagnosing index health. Do not publish, deploy, or treat the local database as evidence or source authority.

The project pins the CLI development dependency for repeatable indexing and shell queries. Codex MCP registration is a separate one-time user-level installation because Codex does not support project-local MCP registration; restarting Codex is required after that registration.
