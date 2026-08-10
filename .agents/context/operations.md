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
